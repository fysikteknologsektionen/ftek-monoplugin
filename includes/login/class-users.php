<?php
/**
 * Users class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Users class.
 */
class Users {

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'ftek_plugin_update_all_users', array( self::class, 'update_all_users' ) );
	}

	/**
	 * Called on plugin activation
	 */
	public static function activate(): void {
		if ( ! wp_next_scheduled( 'ftek_plugin_update_all_users' ) ) {
			wp_schedule_event( strtotime( '02:00:00' ), 'weekly', 'ftek_plugin_update_all_users' );
		}
	}

	/**
	 * Creates or updates a user
	 *
	 * @param array   $user_info     User info from the OAuth userinfo
	 *                               endpoint.
	 * @param array   $roles         Roles to apply to the user.
	 * @param ?string $refresh_token OAuth refresh token.
	 */
	public static function update_or_create_user( array $user_info, array $roles, ?string $refresh_token ): ?\WP_User {
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

		self::update_user_info( $user->ID, $user_info, $refresh_token );

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
	 * Updates user from user info
	 *
	 * @param int     $user_id   ID of user to update.
	 * @param array   $user_info User info from the OAuth userinfo endpoint.
	 * @param ?string $refresh_token OAuth refresh token.
	 */
	private static function update_user_info( int $user_id, array $user_info, ?string $refresh_token ): void {
		foreach (
			array(
				'first_name'   => 'given_name',
				'last_name'    => 'family_name',
				'display_name' => 'name',
			) as $meta_key => $user_info_key
		) {
			if ( isset( $user_info[ $user_info_key ] ) ) {
				update_user_meta(
					$user_id,
					$meta_key,
					$user_info[ $user_info_key ]
				);
			}
		}

		$meta                  = User_Meta::get( $user_id );
		$meta['picture']       = isset( $user_info['picture'] ) ? $user_info['picture'] : '';
		$meta['is_oauth_user'] = true;
		$meta['refresh_token'] = $refresh_token ? $refresh_token : $meta['refresh_token'];
		User_Meta::set( $user_id, $meta );
	}

	/**
	 * Updates user info for all openid users with an OAuth refresh token
	 *
	 * This might take a while
	 */
	public static function update_all_users(): void {
		set_time_limit( 0 );

		$oauth = new OAuth();
		foreach ( get_users() as $user ) {
			$refresh_token = User_Meta::get( $user->ID, 'refresh_token' );
			if ( ! $refresh_token ) {
				continue;
			}

			try {
				$oauth->refresh_auth_token( $refresh_token );
				self::update_user_info( $user->ID, $oauth->fetch_user_info(), $oauth->get_refresh_token() );
			} catch ( \Exception $e ) {
				continue;
			}
		}
	}

	/**
	 * Called on plugin deactivation
	 */
	public static function deactivate(): void {
		$timestamp = wp_next_scheduled( 'ftek_plugin_update_all_users' );
		wp_unschedule_event( $timestamp, 'ftek_plugin_update_all_users' );
	}
}
