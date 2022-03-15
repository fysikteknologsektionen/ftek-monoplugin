<?php
/**
 * My_Class definition
 *
 * @package ftek\template-wp-plugin
 */

namespace Ftek\TemplateWPPlugin;

/**
 * A class I made
 */
class My_Class {

	/**
	 * Default constructor
	 */
	public function __construct() {
		add_action(
			'wp_enqueue_scripts',
			function(): void {
				enqueue_entrypoint_script( 'template-wp-plugin-my-script', 'my-script.tsx' );
				enqueue_entrypoint_script( 'template-wp-plugin-my-style', 'my-style.scss' );
			}
		);

		add_action(
			'init',
			function(): void {
				register_block_type( PLUGIN_ROOT . '/build/blocks/my-block' );
				wp_set_script_translations(
					'template-wp-plugin-my-block-editor-script',
					'template-wp-plugin',
					PLUGIN_ROOT . '/languages'
				);
			}
		);
	}
}
