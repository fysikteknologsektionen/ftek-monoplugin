<?php
/**
 * Calendar class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Calendar page state.
 */
class Calendar {

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'init', array( self::class, 'register_block' ) );
		add_action( 'rest_api_init', array( self::class, 'add_proxy_rest_route' ) );
	}

	/**
	 * Registers the Drive List block
	 */
	public static function register_block(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/ics-calendar' );
		wp_set_script_translations(
			'ftek-plugin-ics-calendar-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-plugin-ics-calendar-editor-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
	}

	/**
	 * Adds the /calendar/proxy rest route
	 */
	public static function add_proxy_rest_route(): void {
		register_rest_route(
			'ftek-plugin/v1',
			'/calendar/proxy',
			array(
				'methods'             => 'GET',
				'callback'            => function( \WP_REST_Request $request ): \WP_REST_Response {
					return self::make_calendar_get_request( $request['url'] );
				},
				'args'                => array(
					'url' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Makes a HTTP POST request for a calendar
	 *
	 * @param string $url Endpoint url.
	 */
	private static function make_calendar_get_request( string $url ): \WP_REST_Response {
		$temp      = explode( '.', $url );
		$extension = end( $temp );
		if ( ! in_array( $extension, array( 'ical', 'ics', 'ifb', 'icalendar' ), true ) ) {
			return new \WP_REST_Response( null, 400 );
		}

		$request_key = md5( $url );

		$cache = get_transient( 'ftek_plugin_calendar_get_' . $request_key );
		if ( ! $cache ) {
			$response      = wp_remote_get( $url );
			$response_code = wp_remote_retrieve_response_code( $response );
			$body          = wp_remote_retrieve_body( $response );
			$cache         = array( $body, $response_code );
		}

		set_transient( 'ftek_plugin_calendar_get_' . $request_key, $cache, 60 * 60 * 4 );

		http_response_code( $cache[1] );
		header( 'Content-Type: text/calendar' );
		echo $cache[0]; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		exit;
	}
}
