<?php
/**
 * Plugin Name:     Ftek Monoplugin
 * Plugin URI:      https://github.com/fysikteknologsektionen/ftek-monoplugin
 * Description:     WordPress monoplugin for ftek
 * Author:          Ossian Eriksson
 * Author URI:      https://github.com/OssianEriksson
 * Text Domain:     ftek
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package ftek\monoplugin
 */

namespace Ftek\Monoplugin;

require_once __DIR__ . '/vendor/autoload.php';


define( __NAMESPACE__ . '\PLUGIN_FILE', __FILE__ );
define( __NAMESPACE__ . '\PLUGIN_ROOT', dirname( PLUGIN_FILE ) );


/**
 * Returns an array of all user roles with the upload_files capability
 */
function _get_available_roles(): array {
	$roles = array();
	foreach ( wp_roles()->role_objects as $key => $role ) {
		$roles[] = array(
			'key'  => $key,
			'name' => translate_user_role( ucfirst( $role->name ) ),
		);
	}
	return $roles;
}

/**
 * Adds the constant ftekInline to a script
 *
 * @param string $handle Script handle.
 */
function add_global_js_variable( string $handle ): void {
	wp_add_inline_script(
		$handle,
		'const ftekInline = ' . wp_json_encode(
			array(
				'roles'            => _get_available_roles(),
				'oauthRedirectUri' => OAuth::get_redirect_uri(),
				'assets'           => array(
					'openBook' => plugins_url( '/assets/open-book.svg', PLUGIN_FILE ),
				),
			)
		),
		'before'
	);
}

/**
 * Enqueue an entrypoint script
 *
 * @param string $handle Script and style handle.
 * @param string $src    Name of a file inside src/entrypoints.
 */
function enqueue_entrypoint_script( string $handle, string $src ): void {
	$exploded = explode( '.js', $src );
	if ( empty( $exploded[ count( $exploded ) - 1 ] ) ) {
		array_pop( $exploded );
		$src = implode( '.js', $src );
	}

	$base_path = '/build/' . $src;
	$asset     = require PLUGIN_ROOT . $base_path . '.asset.php';

	if ( file_exists( PLUGIN_ROOT . $base_path . '.css' ) ) {
		wp_enqueue_style(
			$handle,
			plugins_url( $base_path . '.css', PLUGIN_FILE ),
			in_array( 'wp-components', $asset['dependencies'], true ) ? array( 'wp-components' ) : array(),
			$asset['version']
		);
	} else {
		wp_enqueue_style( 'wp-components' );
	}

	wp_enqueue_script(
		$handle,
		plugins_url( $base_path . '.js', PLUGIN_FILE ),
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_set_script_translations(
		$handle,
		'ftek',
		PLUGIN_ROOT . '/languages'
	);

	add_global_js_variable( $handle );
}

/**
 * Activation hook callback
 */
function activate() {
	Options::activate();
	Course_Pages::activate();
}

/**
 * Uninstall hook callback
 */
function uninstall(): void {
	Options::purge();
	User_Meta::purge();
}


add_action(
	'init',
	function(): void {
		$plugin_rel_path = plugin_basename( dirname( PLUGIN_FILE ) ) . '/languages';
		load_plugin_textdomain( 'ftek', false, $plugin_rel_path );
	}
);

register_activation_hook( PLUGIN_FILE, __NAMESPACE__ . '\activate' );
register_uninstall_hook( PLUGIN_FILE, __NAMESPACE__ . '\uninstall' );

// Enable settings page.
Options::init();

// Enable OAuth login.
Login::init();

// Enable Drive List block.
Drive_List::init();

// Enable course pages.
Course_Pages::init();
