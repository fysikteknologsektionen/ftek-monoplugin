<?php
/**
 * Drive_List class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Drive_List page state.
 */
class Drive_List {

	private const APIS_URL  = 'https://www.googleapis.com';
	private const DRIVE_URL = 'https://drive.google.com';

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		if ( self::is_required_options_set() ) {
			add_action( 'init', array( self::class, 'register_block' ) );
			add_action( 'rest_api_init', array( self::class, 'add_drive_rest_route' ) );
		}
	}

	/**
	 * Registers the Drive List block
	 */
	public static function register_block(): void {
		register_block_type( PLUGIN_ROOT . '/build/blocks/drive-list' );
		wp_set_script_translations(
			'ftek-plugin-drive-list-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
		wp_set_script_translations(
			'ftek-plugin-drive-list-editor-script',
			'ftek-plugin',
			PLUGIN_ROOT . '/languages'
		);
	}

	/**
	 * Adds the /drive/tree rest route
	 */
	public static function add_drive_rest_route(): void {
		register_rest_route(
			'ftek-plugin/v1',
			'/drive/tree',
			array(
				'methods'             => 'GET',
				'callback'            => function( \WP_REST_Request $request ): array {
					return self::get_drive_tree( $request['url'], $request['depth'], $request['download'] );
				},
				'args'                => array(
					'url'      => array(
						'type'     => 'string',
						'required' => true,
					),
					'depth'    => array(
						'type'     => 'integer',
						'required' => true,
					),
					'download' => array(
						'type'     => 'boolean',
						'required' => true,
					),
				),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Returns the ID for a Google Drive folder
	 *
	 * @param string $url Shared url to the Google Drive folder.
	 */
	public static function get_folder_id( string $url ): string {
		$path_parts = explode( '/', wp_parse_url( $url, PHP_URL_PATH ) );
		return end( $path_parts );
	}

	/**
	 * Lists all non-Google native files in a Google Drive folder
	 *
	 * @param string $url      Shared url to the Google Drive folder.
	 * @param int    $depth    Depth to scan.
	 * @param bool   $download If false, url opens the file in the browser.
	 */
	public static function get_drive_tree( string $url, int $depth, bool $download ): array {
		// phpcs:disable WordPress.WP.AlternativeFunctions

		$request_key = md5( $depth . '/' . $download . '/' . $url );
		$cache       = get_transient( 'ftek_plugin_drive_tree_' . $request_key );
		if ( $cache ) {
			return $cache;
		}

		$tree   = array();
		$leaves = array(
			array(
				'id'   => self::get_folder_id( $url ),
				'node' => &$tree,
			),
		);

		$curl_multi = curl_multi_init();

		$tree = array();
		for ( $i = $depth; $i > 0 && $leaves; $i-- ) {
			$leave_count = count( $leaves );
			for ( $j = 0; $j < $leave_count; $j++ ) {
				$url = add_query_arg(
					array(
						'q'                         => rawurlencode( sprintf( '\'%s\' in parents', $leaves[ $j ]['id'] ) ),
						'key'                       => rawurlencode( Options::get( 'google_api_key' ) ),
						'supportsAllDrives'         => 'true',
						'includeItemsFromAllDrives' => 'true',
						'orderBy'                   => 'name',
					),
					self::APIS_URL . '/drive/v3/files'
				);

				$leaves[ $j ]['curl'] = curl_init( $url );
				curl_setopt( $leaves[ $j ]['curl'], CURLOPT_RETURNTRANSFER, true );
				curl_multi_add_handle( $curl_multi, $leaves[ $j ]['curl'] );
			}

			do {
				$status = curl_multi_exec( $curl_multi, $active );
				if ( $active ) {
					curl_multi_select( $curl_multi );
				}
			} while ( $active && CURLM_OK === $status );

			$next_leaves = array();
			for ( $j = 0; $j < $leave_count; $j++ ) {
				$body = json_decode( curl_multi_getcontent( $leaves[ $j ]['curl'] ), true );

				foreach ( $body['files'] as $file ) {
					$node_count = count( $leaves[ $j ]['node'] );
					if ( $i > 1 && 'application/vnd.google-apps.folder' === $file['mimeType'] ) {
						$leaves[ $j ]['node'][ $node_count ] = array(
							'type'     => 'folder',
							'name'     => $file['name'],
							'children' => array(),
						);

						$next_leaves[] = array(
							'id'   => $file['id'],
							'node' => &$leaves[ $j ]['node'][ $node_count ]['children'],
						);
					}
					if ( ! str_starts_with( $file['mimeType'], 'application/vnd.google-apps.' ) ) {
						$leaves[ $j ]['node'][ $node_count ] = array(
							'type' => 'file',
							'name' => $file['name'],
							'url'  => add_query_arg(
								array(
									'id'     => $file['id'],
									'export' => 'download',
								),
								self::DRIVE_URL . '/uc'
							) . ( $download ? '' : '?download=false' ),
						);
					}
				}

				curl_multi_remove_handle( $curl_multi, $leaves[ $j ]['curl'] );
			}

			$leaves = $next_leaves;
		}

		curl_multi_close( $curl_multi );

		set_transient( 'ftek_plugin_drive_tree_' . $request_key, $tree, 60 * 60 );

		return $tree;

		// phpcs:enable
	}

	/**
	 * Checks if requred options have been set
	 */
	private static function is_required_options_set(): bool {
		return ! empty( Options::get( 'google_api_key' ) );
	}
}
