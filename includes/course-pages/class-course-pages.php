<?php
/**
 * Course_Pages class
 *
 * @package ftek\monoplugin
 */

namespace Ftek\Monoplugin;

/**
 * Course_Pages page state.
 */
class Course_Pages {

	const DEFAULTS = array(
		'code'                    => '',
		'credits'                 => 0,
		'homepage_url'            => '',
		'info_url'                => '',
		'survey_url'              => '',
		'student_representatives' => array(),
		'study_perionds'          => array(),
		'year'                    => '',
		'programs'                => array(),
		'participant_count'       => 0,
		'elective'                => false,
		'comment'                 => '',
	);

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'init', array( self::class, 'register_post_type' ) );
		add_action( 'update_post_metadata', array( self::class, 'update_post_slug' ), 10, 4 );

		Course_Blocks::init();
	}

	/**
	 * Updates post slug to match course code
	 *
	 * Callback for the `update_{$meta_type}_metadata` filter hook
	 *
	 * @param ?bool  $check      Whether to allow updating metadata for the given type.
	 * @param int    $object_id  ID of the page metadata is for.
	 * @param string $meta_key   Metadata key.
	 * @param mixed  $meta_value Metadata value.
	 */
	public static function update_post_slug( ?bool $check, int $object_id, string $meta_key, $meta_value ): ?bool {
		if ( 'wp_ftek_course_pages_code' === $meta_key && $meta_value ) {
			wp_update_post(
				array(
					'ID'        => $object_id,
					'post_name' => $meta_value,
				)
			);
		}
		return $check;
	}

	/**
	 * Updates the rewrite rules used to assign nicer urls to posts
	 */
	public static function activate(): void {
		self::register_post_type();
		flush_rewrite_rules();
	}

	/**
	 * Registers the custom post type
	 */
	public static function register_post_type(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/course-page' );
		add_global_js_variable( 'ftek-course-page-editor-script' );
		wp_set_script_translations(
			'ftek-course-page-editor-script',
			'ftek',
			PLUGIN_ROOT . '/languages'
		);

		register_post_type(
			'course-page',
			array(
				'labels'              => array(
					'name'                   => __( 'Course pages', 'ftek' ),
					'singular_name'          => __( 'Course page', 'ftek' ),
					'add_new'                => _x( 'Add new', 'course page', 'ftek' ),
					'add_new_item'           => __( 'Add New Course page', 'ftek' ),
					'edit_item'              => __( 'Edit Course page', 'ftek' ),
					'new_item'               => __( 'New Course page', 'ftek' ),
					'view_item'              => __( 'View Course page', 'ftek' ),
					'view_items'             => __( 'View Course pages', 'ftek' ),
					'search_items'           => __( 'Search Course pages', 'ftek' ),
					'not_found'              => __( 'No Course pages found', 'ftek' ),
					'not_found_in_trash'     => __( 'No Course pages found in Trash', 'ftek' ),
					'all_items'              => __( 'All Course pages', 'ftek' ),
					'attributes'             => __( 'Course page Attributes', 'ftek' ),
					'insert_into_item'       => __( 'Insert into Course page', 'ftek' ),
					'uploaded_to_this_item'  => __( 'Uploaded to this Course page', 'ftek' ),
					'filter_items_list'      => __( 'Filter Course page list', 'ftek' ),
					'items_list_navigation'  => __( 'Course page list navigation', 'ftek' ),
					'items_list'             => __( 'Course page list', 'ftek' ),
					'item_published'         => __( 'Course page published', 'ftek' ),
					'item_reverted_to_draft' => __( 'Course page reverted to draft', 'ftek' ),
					'item_scheduled'         => __( 'Course page scheduled', 'ftek' ),
					'item_updated'           => __( 'Course page updated', 'ftek' ),
					'item_link'              => __( 'Course page link', 'ftek' ),
					'item_link_description'  => __( 'A link to a Course page', 'ftek' ),
				),
				'description'         => __( 'Information about a course', 'ftek' ),
				'public'              => false,
				'exclude_from_search' => false,
				'publicly_queryable'  => true,
				'show_in_nav_menus'   => true,
				'show_ui'             => true,
				'show_in_rest'        => true,
				'menu_position'       => 20,
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents, WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
				'menu_icon'           => 'data:image/svg+xml;base64,' . base64_encode( file_get_contents( PLUGIN_ROOT . '/assets/open-book.svg' ) ),
				'capability_type'     => 'page',
				'delete_with_user'    => false,
				'supports'            => array( 'editor', 'custom-fields', 'title' ),
				'rewrite'             => array(
					'slug'       => 'kurs',
					'with_front' => false,
				),
				'template'            => array(
					array( 'ftek/course-page' ),
				),
			)
		);

		register_post_meta(
			'course-page',
			'ftek_course_page_meta',
			array(
				'type'         => 'object',
				'single'       => true,
				'default'      => self::DEFAULTS,
				'show_in_rest' => array(
					'schema' => array(
						'type'       => 'object',
						'required'   => true,
						'properties' => array(
							'code'                    => array(
								'type'     => 'string',
								'required' => true,
							),
							'credits'                 => array(
								'type'     => 'number',
								'required' => true,
								'minimum'  => 0,
							),
							'homepage_url'            => array(
								'type'     => 'string',
								'required' => true,
							),
							'info_url'                => array(
								'type'     => 'string',
								'required' => true,
							),
							'survey_url'              => array(
								'type'     => 'string',
								'required' => true,
							),
							'student_representatives' => array(
								'type'     => 'array',
								'items'    => array(
									'type'       => 'object',
									'properties' => array(
										'name' => array(
											'type'     => 'string',
											'required' => true,
										),
										'cid'  => array(
											'type'     => 'string',
											'required' => true,
										),
									),
								),
								'required' => true,
							),
							'study_perionds'          => array(
								'type'     => 'array',
								'items'    => array(
									'type' => 'string',
									'enum' => array( '1', '2', '3', '4' ),
								),
								'required' => true,
							),
							'year'                    => array(
								'type'     => 'string',
								'enum'     => array( '', '1', '2', '3', 'master' ),
								'required' => true,
							),
							'programs'                => array(
								'type'     => 'array',
								'items'    => array(
									'type' => 'string',
									'enum' => array( 'F', 'TM' ),
								),
								'required' => true,
							),
							'participant_count'       => array(
								'type'     => 'number',
								'required' => true,
							),
							'elective'                => array(
								'type'     => 'boolean',
								'required' => true,
							),
							'comment'                 => array(
								'type'     => 'string',
								'required' => true,
							),
						),
					),
				),
			)
		);
	}
}
