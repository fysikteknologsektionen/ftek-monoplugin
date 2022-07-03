<?php
/**
 * OAuth class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * OAuth class
 */
class OAuth {

	private const ENDPOINT_KEYS = array(
		'authorization_endpoint',
		'token_endpoint',
		'userinfo_endpoint',
	);

	/**
	 * OAuth endpoint urls
	 *
	 * @var array
	 */
	private $endpoints;

	/**
	 * OAuth authorization token
	 *
	 * @var ?array
	 */
	private $auth_token = null;

	/**
	 * OAuth iscovery document URL
	 *
	 * @var string
	 */
	private $discovery_doc_url;

	/**
	 * OAuth client id
	 *
	 * @var string
	 */
	private $client_id;

	/**
	 * OAuth client secret
	 *
	 * @var string
	 */
	private $client_secret;

	/**
	 * OAuth constructor
	 *
	 * @param string $discovery_doc_url OAuth discovery document URL.
	 * @param string $client_id         OAuth client id.
	 * @param string $client_secret     OAuth client secret.
	 */
	public function __construct( string $discovery_doc_url, string $client_id, string $client_secret ) {
		$this->discovery_doc_url = $discovery_doc_url;
		$this->client_id         = $client_id;
		$this->client_secret     = $client_secret;
	}

	/**
	 * Returns OAuth authorization URL
	 *
	 * @throws \Exception On discovery document errors.
	 */
	public function get_authorization_url(): string {
		return add_query_arg(
			array(
				'client_id'     => $this->client_id,
				'response_type' => 'code',
				'scope'         => 'openid email profile',
				'redirect_uri'  => self::get_redirect_uri(),
				'state'         => $this->get_state(),
				'nonce'         => $this->generate_random_key(),
				'prompt'        => 'select_account',
			),
			$this->get_endpoints()['authorization_endpoint']
		);
	}

	/**
	 * Fetches OAuth authorization token
	 *
	 * @param string $code          The authorization code that is returned
	 *                              from the authorization request.
	 *
	 * @throws \Exception On discovery document or network errors.
	 */
	public function fetch_auth_token( string $code ): array {
		$response = wp_remote_post(
			$this->get_endpoints()['token_endpoint'],
			array(
				'body' => array(
					'code'          => $code,
					'client_id'     => $this->client_id,
					'client_secret' => $this->client_secret,
					'redirect_uri'  => self::get_redirect_uri(),
					'grant_type'    => 'authorization_code',
				),
			)
		);

		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $response_code ) {
			// translators: %1$s: HTTP status code.
			throw new \Exception( sprintf( __( 'Unexpected status (%1$s) when fetching OAuth token', 'ftek-plugin' ), $response_code ) );
		}

		$this->auth_token = json_decode( wp_remote_retrieve_body( $response ), true );

		return $this->auth_token;
	}

	/**
	 * Fetches user info from
	 *
	 * @throws \Exception On discovery document or network errors.
	 */
	public function fetch_user_info(): array {
		if ( ! $this->auth_token ) {
			throw new \Exception( 'Auth token must be provided, or fetch_auth_token() must be called before fetch_user_info()' );
		}

		$response = wp_remote_get(
			$this->get_endpoints()['userinfo_endpoint'],
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $this->auth_token['access_token'],
				),
			)
		);

		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $response_code ) {
			// translators: %1$s: HTTP status code.
			throw new \Exception( sprintf( __( 'Unexpected status (%1$s) when fetching user info', 'ftek-plugin' ), $response_code ) );
		}

		return json_decode( wp_remote_retrieve_body( $response ), true );
	}

	/**
	 * Checks anti-forgery state token match
	 *
	 * @param string $state Token to validate.
	 */
	public function validate_state( string $state ): bool {
		return $state === $this->get_state();
	}

	/**
	 * Returns a valid redirect URI for the OAuth client
	 */
	public static function get_redirect_uri(): string {
		return site_url( '?ftek_plugin_openid' );
	}

	/**
	 * Returns a 128 bit random lower case key string
	 */
	private function generate_random_key(): string {
		return bin2hex( random_bytes( 128 / 8 ) );
	}

	/**
	 * Gets or generates the OAuth state parameter
	 */
	private function get_state(): string {
		if ( isset( $_COOKIE['ftek_plugin_oauth_state'] ) ) {
			$state = sanitize_key( $_COOKIE['ftek_plugin_oauth_state'] );
		} else {
			$state = $this->generate_random_key();
			Cookies::set( 'ftek_plugin_oauth_state', $state );
		}
		return $state;
	}

	/**
	 * Returns an array of endpoints from the discovery document
	 *
	 * @throws \Exception On discovery document errors.
	 */
	private function get_endpoints(): array {
		if ( empty( $this->endpoints ) ) {
			$response      = wp_remote_get( Options::get( 'oauth_discovery_doc_url' ) );
			$response_code = wp_remote_retrieve_response_code( $response );
			if ( 200 !== $response_code ) {
				// translators: %1$s: HTTP status code.
				throw new \Exception( sprintf( __( 'Unexpected status (%1$s) when fetching discovery document', 'ftek-plugin' ), $response_code ) );
			}

			$document = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( ! $document ) {
				throw new \Exception( __( 'Error while parsing discovery document', 'ftek-plugin' ) );
			}

			$endpoints = array_intersect_key( $document, array_flip( self::ENDPOINT_KEYS ) );
			if ( count( self::ENDPOINT_KEYS ) !== count( $endpoints ) ) {
				// translators: %1$s: Array keys.
				throw new \Exception( sprintf( __( 'Missing one of (%1$s) in discovery document', 'ftek-plugin' ), implode( ', ', self::ENDPOINT_KEYS ) ) );
			}
		}

		return $endpoints;
	}
}
