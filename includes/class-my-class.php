<?php
/**
 * My_Class definition
 *
 * @package ftek\ftek-plugin-template
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
				enqueue_entrypoint_script( 'ftek-plugin-template-my-script', 'my-script.tsx' );
				enqueue_entrypoint_script( 'ftek-plugin-template-my-style', 'my-style.scss' );
			}
		);

		add_action(
			'init',
			function(): void {
				register_block_type( PLUGIN_ROOT . '/build/blocks/my-block' );
				wp_set_script_translations(
					'ftek-plugin-template-my-block-editor-script',
					'ftek-plugin-template',
					PLUGIN_ROOT . '/languages'
				);
			}
		);
	}
}
