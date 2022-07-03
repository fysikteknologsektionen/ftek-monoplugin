<?php
/**
 * Login class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Login page state.
 */
class Login {

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'login_init', array( self::class, 'perform_redirects' ) );
		add_action( 'init', array( self::class, 'perform_login' ) );
		add_filter( 'wp_login_errors', array( self::class, 'wp_login_errors' ) );

		Profile::init();
	}

	/**
	 * Callback for login_init action hook
	 */
	public static function perform_redirects(): void {
		if ( ! self::is_required_options_set() ) {
			Cookies::set( 'ftek_plugin_login_error', __( 'OAuth login was not possible since required settings are unset', 'ftek-plugin' ) );
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$loggedout = isset( $_GET['loggedout'] ) ? sanitize_key( $_GET['loggedout'] ) : null;
		if ( 'true' === $loggedout ) {
			wp_safe_redirect( home_url() );
			exit;
		}

		// phpcs:ignore WordPress.Security.NonceVerification
		if ( isset( $_GET['noopenid'] ) || isset( $_POST['wp-submit'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action = isset( $_GET['action'] ) ? sanitize_key( $_GET['action'] ) : null;
		if ( in_array( $action, array( 'logout', 'lostpassword', 'rp', 'resetpass' ), true ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$redirect_to = isset( $_REQUEST['redirect_to'] ) ? wp_sanitize_redirect( wp_unslash( $_REQUEST['redirect_to'] ) ) : null;

		if ( $redirect_to ) {
			Cookies::set( 'ftek_plugin_redirect_to', $redirect_to );
		}

		$oauth = self::create_oauth();
		try {
			$authorization_url = $oauth->get_authorization_url();
		} catch ( \Exception $e ) {
			Cookies::set( 'ftek_plugin_login_error', $e->getMessage() );
			return;
		}

		// phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
		if ( wp_redirect( $authorization_url ) ) {
			exit;
		}
	}

	/**
	 * Callback for init action hook
	 */
	public static function perform_login(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['ftek_plugin_openid'] ) ) {
			return;
		}

		if ( ! self::is_required_options_set() ) {
			Cookies::set( 'ftek_plugin_login_error', __( 'OAuth login was not possible since required settings are unset', 'ftek-plugin' ) );
			return;
		}

		/**
		 * Redirect to the WordPress login page and display an error
		 *
		 * @param string $error Error key of message to display on login page.
		 */
		function redirect_to_login_with_error( string $error ): void {
			Cookies::set( 'ftek_plugin_login_error', $error );
			if ( wp_safe_redirect( add_query_arg( array( 'noopenid' => '' ), wp_login_url() ) ) ) {
				exit;
			}
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['code'], $_GET['state'] ) ) {
			redirect_to_login_with_error( __( 'Malformatted response to OpenID authentication request', 'ftek-plugin' ) );
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$state = sanitize_key( $_GET['state'] );
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$code = wp_unslash( $_GET['code'] );

		$oauth = self::create_oauth();
		try {
			if ( ! $oauth->validate_state( $state ) ) {
				redirect_to_login_with_error( __( 'Anti-forgery state token mismatch', 'ftek-plugin' ) );
				return;
			}

			if ( ! $oauth->fetch_auth_token( $code ) ) {
				redirect_to_login_with_error( __( 'There was an error recieving the OAuth access token', 'ftek-plugin' ) );
				return;
			}

			$user_info = $oauth->fetch_user_info();
			if ( ! isset( $user_info['email'] ) ) {
				redirect_to_login_with_error( __( 'There was an error fetching user info from the OAuth provider', 'ftek-plugin' ) );
				return;
			}
		} catch ( \Exception $e ) {
			redirect_to_login_with_error( $e->getMessage() );
			return;
		}

		$matches_any = false;
		$roles       = array();
		foreach ( Options::get( 'oauth_users' ) as $user ) {
			$regex = '/^' . $user['email_pattern'] . '$/';
			if ( preg_match( $regex, $user_info['email'] ) ) {
				$matches_any = true;
				$roles       = array_unique( array_merge( $roles, $user['roles'] ) );
			}
		}
		if ( ! $matches_any ) {
			redirect_to_login_with_error( __( 'Sorry, your account cannot login to this site', 'ftek-plugin' ) );
			return;
		}

		$user = self::update_or_create_user( $user_info, $roles );
		if ( ! $user ) {
			redirect_to_login_with_error( __( 'Unable to assign a user to your session' ) );
			return;
		}

		wp_set_current_user( $user->ID, $user->user_login );
		wp_set_auth_cookie( $user->ID );
		do_action( 'wp_login', $user->user_login, $user );

		$redirect = wp_sanitize_redirect( wp_unslash( $_COOKIE['ftek_plugin_redirect_to'] ?? '' ) );
		$redirect = apply_filters(
			'login_redirect',
			empty( $redirect ) ? admin_url() : $redirect,
			$redirect,
			$user
		);
		$redirect = basename( $redirect ) === 'profile.php' ? admin_url() : $redirect;

		Cookies::delete( 'ftek_plugin_redirect_to' );

		if ( wp_safe_redirect( $redirect ) ) {
			exit;
		}
	}

	/**
	 * Creates or updates a user
	 *
	 * @param array $user_info User info from the OAuth userinfo endpoint.
	 * @param array $roles     Roles to apply to the user.
	 */
	private static function update_or_create_user( array $user_info, array $roles ): ?\WP_User {
		if ( ! isset( $user_info['email'] ) ) {
			return false;
		}

		$user = get_user_by( 'email', $user_info['email'] );
		if ( ! $user ) {
			$user_id = wp_insert_user(
				array_filter(
					array(
						'user_pass'       => wp_generate_password( 24 ),
						'user_login'      => $user_info['email'],
						'user_email'      => $user_info['email'],
						'user_registered' => gmdate( 'Y-m-d H:i:s' ),
					)
				)
			);

			if ( is_wp_error( $user_id ) ) {
				return null;
			}

			$user = get_user_by( 'id', $user_id );
		}

		foreach (
			array(
				'first_name'   => 'given_name',
				'last_name'    => 'family_name',
				'display_name' => 'name',
			) as $meta_key => $user_info_key
		) {
			if ( isset( $user_info[ $user_info_key ] ) ) {
				update_user_meta(
					$user->ID,
					$meta_key,
					$user_info[ $user_info_key ]
				);
			}
		}

		$meta                  = User_Meta::get( $user->ID );
		$meta['picture']       = isset( $user_info['picture'] ) ? $user_info['picture'] : '';
		$meta['is_oauth_user'] = true;
		User_Meta::set( $user->ID, $meta );

		$roles_to_remove = array_diff( $user->roles, $roles );
		foreach ( $roles_to_remove as $role ) {
			$user->remove_role( $role );
		}
		$roles_to_add = array_diff( $roles, $user->roles );
		foreach ( $roles_to_add as $role ) {
			$user->add_role( $role );
		}

		return $user;
	}

	/**
	 * Callback for wp_login_errors filter hook
	 *
	 * Adds errors based on the ftek_plugin_login_error cookie
	 *
	 * @param \WP_Error $error WP Error object.
	 */
	public static function wp_login_errors( \WP_Error $error ): \WP_Error {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		$message = isset( $_COOKIE['ftek_plugin_login_error'] ) ? $_COOKIE['ftek_plugin_login_error'] : null;
		Cookies::delete( 'ftek_plugin_login_error' );

		if ( $message ) {
			$error->add( 'ftek_plugin_login_error', esc_html( $message ) );

			$error->add(
				'ftek_plugin_noopenid_notice',
				// translators: %1$s: Anchor attributes.
				sprintf( __( 'Since the OpenID login failed, you were taken to the default WordPress login page. If you want to attempt another sign in with OpenID, click <a %1$s>here</a>.', 'ftek-plugin' ), 'href="' . wp_login_url() . '"' ),
				'message'
			);
		}

		return $error;
	}

	/**
	 * Checks if requred options have been set
	 */
	private static function is_required_options_set(): bool {
		return ! empty( Options::get( 'oauth_discovery_doc_url' ) ) &&
		! empty( Options::get( 'oauth_client_id' ) ) &&
		! empty( Options::get( 'oauth_client_secret' ) ) &&
		! empty( Options::get( 'oauth_users' ) );
	}

	/**
	 * Constructs a new OAuth instance
	 *
	 * @see OAuth
	 */
	private static function create_oauth(): OAuth {
		return new OAuth(
			Options::get( 'oauth_discovery_doc_url' ),
			Options::get( 'oauth_client_id' ),
			Options::get( 'oauth_client_secret' )
		);
	}
}
