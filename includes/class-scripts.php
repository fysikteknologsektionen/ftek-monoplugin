<?php
/**
 * Scripts class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Scripts class
 */
class Scripts {

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'enqueue_block_editor_assets', array( self::class, 'add_sidebar' ) );

		Group_Blocks::init();
	}

	/**
	 * Enqueues block editor sidebar script
	 */
	public static function add_sidebar(): void {
		enqueue_entrypoint_script( 'ftek-plugin-sidebar', 'sidebar.tsx' );
	}

}
