<?php
/**
 * User_Meta class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * User_Meta class
 */
class User_Meta {

	public const DEFAULTS = array(
		'is_oauth_user' => '',
		'picture'       => '',
	);

	/**
	 * Returns user meta values
	 *
	 * @param int     $user_id User ID.
	 * @param ?string $key Key of requested meta or null for the entire
	 *                     meta array.
	 */
	public static function get( int $user_id, ?string $key = null ) {
		$meta = get_user_meta( $user_id, 'ftek_plugin__user_meta', true );
		$meta = array_merge( self::DEFAULTS, empty( $meta ) ? array() : $meta );
		return null === $key ? $meta : $meta[ $key ];
	}

	/**
	 * Update a custom meta fields for a user
	 *
	 * @param int          $user_id User ID.
	 * @param array|string $meta    Array of metadata values or meta key.
	 * @param mixed        $value   Meta value.
	 */
	public static function set( int $user_id, $meta, $value = null ): void {
		if ( is_array( $meta ) ) {
			update_user_meta( $user_id, 'ftek_plugin__user_meta', $meta );
		} else {
			update_user_meta( $user_id, 'ftek_plugin__user_meta', array_merge( self::get( $user_id ), array( $meta => $value ) ) );
		}
	}

	/**
	 * Should be called on uninstall
	 */
	public static function purge(): void {
		$users = get_users();
		foreach ( $users as $user ) {
			delete_user_meta( $user->ID, 'ftek_plugin__user_meta' );
		}
	}

}
