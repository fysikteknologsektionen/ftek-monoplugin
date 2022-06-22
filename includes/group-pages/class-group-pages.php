<?php
/**
 * Group_Pages class
 *
 * @package ftek\monoplugin
 */

namespace Ftek\Monoplugin;

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
	}

	/**
	 * Registers the custom post type
	 */
	public static function register_post_type(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/group-page' );
		add_global_js_variable( 'ftek-group-page-editor-script' );
		wp_set_script_translations(
			'ftek-group-page-editor-script',
			'ftek',
			PLUGIN_ROOT . '/languages'
		);

		register_post_type(
			'group-page',
			array(
				'labels'              => array(
					'name'                   => __( 'Group pages', 'ftek' ),
					'singular_name'          => __( 'Group page', 'ftek' ),
					'add_new'                => _x( 'Add new', 'group page', 'ftek' ),
					'add_new_item'           => __( 'Add new group page', 'ftek' ),
					'edit_item'              => __( 'Edit group page', 'ftek' ),
					'new_item'               => __( 'New group page', 'ftek' ),
					'view_item'              => __( 'View group page', 'ftek' ),
					'view_items'             => __( 'View group pages', 'ftek' ),
					'search_items'           => __( 'Search group pages', 'ftek' ),
					'not_found'              => __( 'No group pages found', 'ftek' ),
					'not_found_in_trash'     => __( 'No group pages found in Trash', 'ftek' ),
					'all_items'              => __( 'All group pages', 'ftek' ),
					'attributes'             => __( 'Group page Attributes', 'ftek' ),
					'insert_into_item'       => __( 'Insert into group page', 'ftek' ),
					'uploaded_to_this_item'  => __( 'Uploaded to this group page', 'ftek' ),
					'filter_items_list'      => __( 'Filter group page list', 'ftek' ),
					'items_list_navigation'  => __( 'Group page list navigation', 'ftek' ),
					'items_list'             => __( 'Group page list', 'ftek' ),
					'item_published'         => __( 'Group page published', 'ftek' ),
					'item_reverted_to_draft' => __( 'Group page reverted to draft', 'ftek' ),
					'item_scheduled'         => __( 'Group page scheduled', 'ftek' ),
					'item_updated'           => __( 'Group page updated', 'ftek' ),
					'item_link'              => __( 'Group page link', 'ftek' ),
					'item_link_description'  => __( 'A link to a group page', 'ftek' ),
				),
				'description'         => __( 'Information about a group', 'ftek' ),
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
				'supports'            => array( 'editor', 'custom-fields', 'title' ),
				'template'            => array(
					array(
						'ftek/group-page',
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
			'ftek_group_page_meta',
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

		$meta         = get_post_meta( $postarr['ID'], 'ftek_group_page_meta', true );
		$group_tag_id = $meta['group_tag_id'] ?? -1;

		if ( ! $data['post_title'] || ! $data['post_name'] ) {
			return $data;
		}

		$taxonomy = array(
			'name'        => $data['post_title'],
			// translators: %1$s Name of group.
			'description' => sprintf( __( 'Posts related to %1$s', 'ftek' ), $data['post_title'] ),
			'slug'        => $data['post_name'],
		);

		if ( $group_tag_id >= 0 ) {
			wp_update_term( $group_tag_id, 'post_tag', $taxonomy );
		} else {
			$term                 = wp_insert_term( $data['post_title'], 'post_tag', $taxonomy );
			$group_tag_id         = $term['term_id'];
			$meta['group_tag_id'] = $group_tag_id;
			update_post_meta( $postarr['ID'], 'ftek_group_page_meta', $meta );
		}

		if ( $group_tag_id < 0 ) {
			return $data;
		}

		$data['post_content'] = str_replace(
			'&quot;group_tag_id&quot;:-1,&quot;',
			sprintf( '&quot;group_tag_id&quot;:%d,&quot;', $group_tag_id ),
			$data['post_content']
		);

		return $data;
	}
}
