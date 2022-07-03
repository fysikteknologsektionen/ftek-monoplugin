<?php
/**
 * Roles class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Roles class
 */
class Roles {

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_filter( 'gettext_with_context', array( self::class, 'translate_roles' ), 10, 4 );
	}

	/**
	 * Called on plugin activation
	 */
	public static function activate(): void {
		self::remove_built_in_roles();
		self::add_custom_roles();
	}

	/**
	 * Removes built in roles
	 */
	public static function remove_built_in_roles(): void {
		$role_names = array( 'subscriber', 'contributor', 'author', 'editor' );
		foreach ( $role_names as $role_name ) {
			$role = get_role( $role_name );
			if ( $role ) {
				remove_role( $role_name );
			}
		}
	}

	/**
	 * Adds custom roles
	 */
	public static function add_custom_roles(): void {
		add_role(
			'division-active',
			'Division active',
			array(
				'delete_others_pages',
				'delete_others_posts',
				'delete_pages',
				'delete_posts',
				'delete_private_pages',
				'delete_private_posts',
				'delete_published_pages',
				'delete_published_posts',
				'edit_others_pages',
				'edit_others_posts',
				'edit_pages',
				'edit_posts',
				'edit_private_pages',
				'edit_private_posts',
				'edit_published_pages',
				'edit_published_posts',
				'manage_categories',
				'manage_links',
				'moderate_comments',
				'publish_pages',
				'publish_posts',
				'read',
				'read_private_pages',
				'read_private_posts',
				'unfiltered_html',
				'upload_files',
			)
		);
	}

	/**
	 * Callback for the gettext_with_context filter hook
	 *
	 * Adds translations with translate_user_role() for custom user roles
	 *
	 * @param string $translation Translated text.
	 * @param string $text        Text to translate.
	 * @param string $context     Context information for the translators.
	 * @param string $domain      Text domain. Unique identifier for retrieving
	 *                            translated strings.
	 */
	public static function translate_roles( string $translation, string $text, string $context, string $domain ): string {
		if ( 'User role' === $context && 'default' === $domain ) {
			switch ( $text ) {
				case 'Division active':
					return _x( 'Division active', 'User role', 'ftek-plugin' );
			}
		}
		return $translation;
	}

}
