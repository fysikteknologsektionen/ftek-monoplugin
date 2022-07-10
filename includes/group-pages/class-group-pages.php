<?php
/**
 * Group_Pages class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Group_Pages page state.
 */
class Group_Pages {

	const DEFAULTS = array(
		'logo_url'     => '',
		'group_tag_id' => -1,
	);

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'init', array( self::class, 'register_post_type' ) );
		add_action( 'init', array( self::class, 'add_tag_to_pages' ) );
		add_action( 'wp_insert_post_data', array( self::class, 'update_tag' ), 10, 2 );
		add_action( 'pre_get_posts', array( self::class, 'work_around_empty_slug' ) );

		Group_Blocks::init();
	}

	/**
	 * Updates the rewrite rules used to assign nicer urls to group pages
	 */
	public static function activate(): void {
		self::register_post_type();
		flush_rewrite_rules();
	}

	/**
	 * Registers the custom post type
	 */
	public static function register_post_type(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/group-page' );
		add_global_js_variable( 'ftek-plugin-group-page-editor-script' );
		wp_set_script_translations(
			'ftek-plugin-group-page-editor-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-plugin-group-page-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);

		register_post_type(
			'group-page',
			array(
				'labels'              => array(
					'name'                   => __( 'Group pages', 'ftek-plugin' ),
					'singular_name'          => __( 'Group page', 'ftek-plugin' ),
					'add_new'                => _x( 'Add new', 'group page', 'ftek-plugin' ),
					'add_new_item'           => __( 'Add new group page', 'ftek-plugin' ),
					'edit_item'              => __( 'Edit group page', 'ftek-plugin' ),
					'new_item'               => __( 'New group page', 'ftek-plugin' ),
					'view_item'              => __( 'View group page', 'ftek-plugin' ),
					'view_items'             => __( 'View group pages', 'ftek-plugin' ),
					'search_items'           => __( 'Search group pages', 'ftek-plugin' ),
					'not_found'              => __( 'No group pages found', 'ftek-plugin' ),
					'not_found_in_trash'     => __( 'No group pages found in Trash', 'ftek-plugin' ),
					'all_items'              => __( 'All group pages', 'ftek-plugin' ),
					'attributes'             => __( 'Group page Attributes', 'ftek-plugin' ),
					'insert_into_item'       => __( 'Insert into group page', 'ftek-plugin' ),
					'uploaded_to_this_item'  => __( 'Uploaded to this group page', 'ftek-plugin' ),
					'filter_items_list'      => __( 'Filter group page list', 'ftek-plugin' ),
					'items_list_navigation'  => __( 'Group page list navigation', 'ftek-plugin' ),
					'items_list'             => __( 'Group page list', 'ftek-plugin' ),
					'item_published'         => __( 'Group page published', 'ftek-plugin' ),
					'item_reverted_to_draft' => __( 'Group page reverted to draft', 'ftek-plugin' ),
					'item_scheduled'         => __( 'Group page scheduled', 'ftek-plugin' ),
					'item_updated'           => __( 'Group page updated', 'ftek-plugin' ),
					'item_link'              => __( 'Group page link', 'ftek-plugin' ),
					'item_link_description'  => __( 'A link to a group page', 'ftek-plugin' ),
				),
				'description'         => __( 'Information about a group', 'ftek-plugin' ),
				'public'              => false,
				'exclude_from_search' => false,
				'publicly_queryable'  => true,
				'show_in_nav_menus'   => true,
				'show_ui'             => true,
				'show_in_rest'        => true,
				'menu_position'       => 20,
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents, WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
				'menu_icon'           => 'data:image/svg+xml;base64,' . base64_encode( file_get_contents( PLUGIN_ROOT . '/assets/group.svg' ) ),
				'capability_type'     => 'page',
				'delete_with_user'    => false,
				'supports'            => array( 'editor', 'custom-fields', 'title', 'thumbnail' ),
				'rewrite'             => array(
					'slug'       => '/',
					'with_front' => false,
				),
				'template'            => array(
					array(
						'ftek-plugin/group-page',
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
			'group-page',
			'ftek_plugin_group_page_meta',
			array(
				'type'         => 'object',
				'single'       => true,
				'default'      => self::DEFAULTS,
				'show_in_rest' => array(
					'schema' => array(
						'type'       => 'object',
						'required'   => true,
						'properties' => array(
							'logo_url'     => array(
								'type'     => 'string',
								'required' => true,
							),
							'group_tag_id' => array(
								'type'     => 'number',
								'required' => true,
							),
						),
					),
				),
			)
		);
	}

	/**
	 * Allow pages to be tagged
	 */
	public static function add_tag_to_pages(): void {
		register_taxonomy_for_object_type( 'post_tag', 'page' );
	}

	/**
	 * Callback for the wp_insert_post_data filter hook.
	 * Updates the name of the tag associated with this group
	 *
	 * @param array $data    An array of slashed, sanitized, and processed post
	 *                       data.
	 * @param array $postarr An array of sanitized (and slashed) but otherwise
	 *                       unmodified post data.
	 */
	public static function update_tag( array $data, array $postarr ): array {
		if ( 'group-page' !== $data['post_type'] ) {
			return $data;
		}

		$meta         = get_post_meta( $postarr['ID'], 'ftek_plugin_group_page_meta', true );
		$group_tag_id = $meta['group_tag_id'] ?? -1;

		if ( ! $data['post_title'] || ! $data['post_name'] ) {
			return $data;
		}

		$taxonomy = array(
			'name'        => $data['post_title'],
			// translators: %1$s Name of group.
			'description' => sprintf( __( 'Posts related to %1$s', 'ftek-plugin' ), $data['post_title'] ),
			'slug'        => sanitize_title_with_dashes( $data['post_title'] ),
		);

		if ( $group_tag_id >= 0 ) {
			wp_update_term( $group_tag_id, 'post_tag', $taxonomy );
		} else {
			$term                 = wp_insert_term( $data['post_title'], 'post_tag', $taxonomy );
			$group_tag_id         = $term['term_id'];
			$meta['group_tag_id'] = $group_tag_id;
			update_post_meta( $postarr['ID'], 'ftek_plugin_group_page_meta', $meta );
		}

		if ( $group_tag_id < 0 ) {
			return $data;
		}

		$data['post_content'] = str_replace(
			'&quot;group_tag_id&quot;:-1,&quot;',
			sprintf( '&quot;group_tag_id&quot;:%d,&quot;', $group_tag_id ),
			$data['post_content']
		);
		$data['post_content'] = str_replace(
			'\\"group_tag_id\\":-1',
			sprintf( '"group_tag_id":%d', $group_tag_id ),
			$data['post_content']
		);

		return $data;
	}

	/**
	 * Callback for the pre_get_posts action hook
	 *
	 * Add fall back to page or post if group page does not exits. This is
	 * needed since the group page slug is / and therefore not namespaced.
	 *
	 * @see https://wordpress.stackexchange.com/q/203951
	 *
	 * @param \WP_Query $query The WP_Query instance (passed by reference).
	 */
	public static function work_around_empty_slug( \WP_Query $query ): void {
		if ( isset( $query->query['name'] ) && 'group-page' === $query->query['post_type'] ?? '' ) {
			$query->set( 'post_type', array( 'group-page', 'page', 'post' ) );
		}
	}
}
