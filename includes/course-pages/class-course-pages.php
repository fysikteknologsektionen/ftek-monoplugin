<?php
/**
 * Course_Pages class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

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
		'years'                   => array(),
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
		add_filter( 'gettext_with_context', array( self::class, 'translate_role' ), 10, 4 );

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
		if ( 'ftek_plugin_course_page_meta' === $meta_key && $meta_value ) {
			wp_update_post(
				array(
					'ID'        => $object_id,
					'post_name' => $meta_value['code'],
				)
			);
		}
		return $check;
	}

	/**
	 * Called on plugin activation
	 */
	public static function activate(): void {
		// Update rewrite rules used to assign nicer urls to posts.
		self::register_post_type();
		flush_rewrite_rules();

		$capabilities = array(
			'edit_course_page',
			'read_course_page',
			'delete_course_page',
			'edit_course_pages',
			'edit_others_course_pages',
			'publish_course_pages',
			'read_private_course_pages',
			'create_course_pages',
		);

		add_role(
			'course-page-editor',
			'Course page editor',
			$capabilities
		);

		$admin = get_role( 'administrator' );
		if ( $admin ) {
			foreach ( $capabilities as $cap ) {
				$admin->add_cap( $cap );
			}
		}

		$posts = get_posts(
			array(
				'post_type'   => 'course-page',
				'numberposts' => -1,
			)
		);

		foreach ( $posts as $post ) {
			$meta = array_merge(
				self::DEFAULTS,
				get_post_meta( $post->ID, 'ftek_plugin_course_page_meta', true )
			);

			if ( isset( $meta['year'] ) && ! empty( $meta['year'] ) ) {
				$meta['years'] = array( $meta['year'] );
			}

			update_post_meta(
				$post->ID,
				'ftek_plugin_course_page_meta',
				array_intersect_key(
					$meta,
					self::DEFAULTS
				)
			);
		}
	}

	/**
	 * Purge all persistant changes
	 */
	public static function purge(): void {
		remove_role( 'course-page-editor' );
	}

	/**
	 * Registers the custom post type
	 */
	public static function register_post_type(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/course-page' );
		add_global_js_variable( 'ftek-plugin-course-page-editor-script' );
		wp_set_script_translations(
			'ftek-plugin-course-page-editor-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);

		register_post_type(
			'course-page',
			array(
				'labels'              => array(
					'name'                   => __( 'Course pages', 'ftek-plugin' ),
					'singular_name'          => __( 'Course page', 'ftek-plugin' ),
					'add_new'                => _x( 'Add new', 'course page', 'ftek-plugin' ),
					'add_new_item'           => __( 'Add new course page', 'ftek-plugin' ),
					'edit_item'              => __( 'Edit course page', 'ftek-plugin' ),
					'new_item'               => __( 'New course page', 'ftek-plugin' ),
					'view_item'              => __( 'View course page', 'ftek-plugin' ),
					'view_items'             => __( 'View course pages', 'ftek-plugin' ),
					'search_items'           => __( 'Search course pages', 'ftek-plugin' ),
					'not_found'              => __( 'No course pages found', 'ftek-plugin' ),
					'not_found_in_trash'     => __( 'No course pages found in Trash', 'ftek-plugin' ),
					'all_items'              => __( 'All course pages', 'ftek-plugin' ),
					'attributes'             => __( 'Course page Attributes', 'ftek-plugin' ),
					'insert_into_item'       => __( 'Insert into course page', 'ftek-plugin' ),
					'uploaded_to_this_item'  => __( 'Uploaded to this course page', 'ftek-plugin' ),
					'filter_items_list'      => __( 'Filter course page list', 'ftek-plugin' ),
					'items_list_navigation'  => __( 'Course page list navigation', 'ftek-plugin' ),
					'items_list'             => __( 'Course page list', 'ftek-plugin' ),
					'item_published'         => __( 'Course page published', 'ftek-plugin' ),
					'item_reverted_to_draft' => __( 'Course page reverted to draft', 'ftek-plugin' ),
					'item_scheduled'         => __( 'Course page scheduled', 'ftek-plugin' ),
					'item_updated'           => __( 'Course page updated', 'ftek-plugin' ),
					'item_link'              => __( 'Course page link', 'ftek-plugin' ),
					'item_link_description'  => __( 'A link to a course page', 'ftek-plugin' ),
				),
				'description'         => __( 'Information about a course', 'ftek-plugin' ),
				'public'              => false,
				'exclude_from_search' => false,
				'publicly_queryable'  => true,
				'show_in_nav_menus'   => true,
				'show_ui'             => true,
				'show_in_rest'        => true,
				'menu_position'       => 20,
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents, WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
				'menu_icon'           => 'data:image/svg+xml;base64,' . base64_encode( file_get_contents( PLUGIN_ROOT . '/assets/open-book.svg' ) ),
				'capability_type'     => 'course_page',
				'delete_with_user'    => false,
				'supports'            => array( 'editor', 'custom-fields', 'title' ),
				'rewrite'             => array(
					'slug'       => 'kurs',
					'with_front' => false,
				),
				'template'            => array(
					array(
						'ftek-plugin/course-page',
						array(
							'lock' => array(
								'move'   => true,
								'remove' => true,
							),
						),
					),
				),
				'template_lock'       => 'all',
			)
		);

		register_post_meta(
			'course-page',
			'ftek_plugin_course_page_meta',
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
							'years'                   => array(
								'type'     => 'array',
								'items'    => array(
									'type' => 'string',
									'enum' => array( '1', '2', '3', 'master' ),
								),
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

		register_taxonomy(
			'program-syllabus',
			'course-page',
			array(
				'labels'            => array(
					'name'                       => __( 'Program syllabuses', 'ftek-plugin' ),
					'singular_name'              => __( 'Program syllabus', 'ftek-plugin' ),
					'search_items'               => __( 'Search program syllabuses', 'ftek-plugin' ),
					'popular_items'              => __( 'Popular program syllabuses', 'ftek-plugin' ),
					'all_items'                  => __( 'All program syllabuses', 'ftek-plugin' ),
					'name_field_description'     => __( 'The name displayed when the user is selecting which program syllabus to view', 'ftek-plugin' ),
					'slug_field_description'     => __( 'URL friendly name of the program syllabus', 'ftek-plugin' ),
					'desc_field_description'     => __( 'The description is not prominent', 'ftek-plugin' ),
					'edit_item'                  => __( 'Edit program syllabus', 'ftek-plugin' ),
					'view_item'                  => __( 'View program syllabus', 'ftek-plugin' ),
					'update_item'                => __( 'Update program syllabus', 'ftek-plugin' ),
					'add_new_item'               => __( 'Add new program syllabus', 'ftek-plugin' ),
					'new_item_name'              => __( 'New program syllabus', 'ftek-plugin' ),
					'separate_items_with_commas' => __( 'Separate program syllabuses with commas', 'ftek-plugin' ),
					'add_or_remove_items'        => __( 'Add or remove program syllabus', 'ftek-plugin' ),
					'choose_from_most_used'      => __( 'Choose from most used program syllabuses', 'ftek-plugin' ),
					'not_found'                  => __( 'No program syllabuses found', 'ftek-plugin' ),
					'no_terms'                   => __( 'No program syllabuses', 'ftek-plugin' ),
					'filter_by_item'             => __( 'Filter by program syllabus', 'ftek-plugin' ),
					'items_list_navigation'      => __( 'Program syllabus list navigaion', 'ftek-plugin' ),
					'items_list'                 => __( 'Program syllabus list', 'ftek-plugin' ),
					'most_used'                  => _x( 'Most used', 'program syllabus', 'ftek-plugin' ),
					'back_to_items'              => __( 'Back to program syllabuses', 'ftek-plugin' ),
					'item_link'                  => __( 'Program syllabus link', 'ftek-plugin' ),
					'item_link_description'      => __( 'A link to a program syllabus', 'ftek-plugin' ),
				),
				'description'       => __( 'Users will be able to select which program syllabus to view', 'ftek-plugin' ),
				'public'            => false,
				'show_ui'           => true,
				'show_in_menu'      => true,
				'show_in_rest'      => true,
				'show_tagcloud'     => false,
				'show_admin_column' => true,
				'capabilities'      => array(
					'manage_terms' => 'edit_course_page',
					'edit_terms'   => 'edit_course_page',
					'delete_terms' => 'edit_course_page',
					'assign_terms' => 'edit_course_page',
				),
				'rewrite'           => false,
				'query_var'         => false,
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
	public static function translate_role( string $translation, string $text, string $context, string $domain ): string {
		if ( 'Course page editor' === $text && 'User role' === $context && 'default' === $domain ) {
			return _x( 'Course page editor', 'User role', 'ftek-plugin' );
		}
		return $translation;
	}
}
