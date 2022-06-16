<?php
/**
 * My_Class definition
 *
 * @package ftek\monoplugin
 */

namespace Ftek\Monoplugin;

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
				enqueue_entrypoint_script( 'ftek-my-script', 'my-script.tsx' );
				enqueue_entrypoint_script( 'ftek-my-style', 'my-style.scss' );
			}
		);

		add_action(
			'init',
			function(): void {
				register_block_type( PLUGIN_ROOT . '/build/blocks/my-block' );
				wp_set_script_translations(
					'ftek-my-block-editor-script',
					'ftek',
					PLUGIN_ROOT . '/languages'
				);
			}
		);
	}
}
