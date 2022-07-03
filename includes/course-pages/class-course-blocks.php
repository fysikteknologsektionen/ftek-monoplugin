<?php
/**
 * Course_Blocks class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Course_Blocks page state.
 */
class Course_Blocks {

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'init', array( self::class, 'register_blocks' ) );
	}

	/**
	 * Registers course related blocks
	 */
	public static function register_blocks(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/course-overview' );
		wp_set_script_translations(
			'ftek-plugin-course-overview-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-plugin-course-overview-editor-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);

		register_block_type( PLUGIN_ROOT . '/build/blocks/current-courses' );
		wp_set_script_translations(
			'ftek-plugin-current-courses-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-plugin-current-courses-editor-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);

		register_block_type( PLUGIN_ROOT . '/build/blocks/all-courses' );
		wp_set_script_translations(
			'ftek-plugin-all-courses-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-plugin-all-courses-editor-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
	}
}
