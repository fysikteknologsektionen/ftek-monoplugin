<?php
/**
 * Group_Blocks class
 *
 * @package ftek\monoplugin
 */

namespace Ftek\Monoplugin;

/**
 * Group_Blocks page state.
 */
class Group_Blocks {

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'init', array( self::class, 'register_blocks' ) );
		add_action( 'rest_api_init', array( self::class, 'add_user_rest_route' ) );
	}

	/**
	 * Registers course related blocks
	 */
	public static function register_blocks(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/group-member' );
		wp_set_script_translations(
			'ftek-group-member-script',
			'ftek',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-group-member-script',
			'ftek',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-group-member-editor-script',
			'ftek',
			PLUGIN_ROOT . '/languages'
		);
	}

	/**
	 * Adds the /group/user rest route
	 */
	public static function add_user_rest_route(): void {
		register_rest_route(
			'ftek/v1',
			'/group/user',
			array(
				'methods'             => 'GET',
				'callback'            => function( \WP_REST_Request $request ): array {
					return self::get_user( $request['email'] );
				},
				'args'                => array(
					'email' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Gets user info by email
	 *
	 * @param string $email Email address of the user.
	 */
	public static function get_user( string $email ): array {
		$user = get_user_by( 'email', $email );
		if ( ! $user ) {
			return array( 'found' => false );
		}

		return array(
			'found'      => true,
			'first_name' => get_user_meta( $user->ID, 'first_name', true ),
			'last_name'  => get_user_meta( $user->ID, 'last_name', true ),
			'picture'    => get_avatar_url( $user->ID ),
		);
	}
}
