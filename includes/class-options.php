<?php
/**
 * Options class
 *
 * @package ftek\monoplugin
 */

namespace Ftek\Monoplugin;

/**
 * Options class
 */
class Options {

	public const DEFAULTS = array(
		'oauth_discovery_doc_url' => 'https://accounts.google.com/.well-known/openid-configuration',
		'oauth_client_id'         => '',
		'oauth_client_secret'     => '',
		'oauth_users'             => array(),
		'google_api_key'          => '',
		'study_period_ends'       => array(
			'1' => array(
				'month' => 1,
				'day'   => 1,
			),
			'2' => array(
				'month' => 1,
				'day'   => 1,
			),
			'3' => array(
				'month' => 1,
				'day'   => 1,
			),
			'4' => array(
				'month' => 1,
				'day'   => 1,
			),
		),
		'schedules'               => array(
			'1' => array(
				'F'  => '',
				'TM' => '',
			),
			'2' => array(
				'F'  => '',
				'TM' => '',
			),
			'3' => array(
				'F'  => '',
				'TM' => '',
			),
		),
	);

	/**
	 * Initialize resources
	 */
	public static function init(): void {
		add_action( 'init', array( self::class, 'add_option' ) );
		add_action( 'admin_menu', array( self::class, 'add_settings_page' ) );
		add_filter( 'plugin_action_links_ftek-monoplugin/ftek-monoplugin.php', array( self::class, 'add_settings_action_link' ) );
	}

	/**
	 * Returns option values
	 *
	 * @param ?string $key Key of requested setting or null for the entire
	 *                     option array.
	 */
	public static function get( ?string $key = null ) {
		$option = get_option( 'ftek_option' );
		$option = array_merge( self::DEFAULTS, $option ? $option : array() );
		return null === $key ? $option : $option[ $key ];
	}

	/**
	 * Should be called on plugin activation
	 *
	 * Makes sure all settings exist
	 */
	public static function activate(): void {
		self::add_option();
		update_option( 'ftek_option', array_intersect_key( self::get(), self::DEFAULTS ) );
	}

	/**
	 * Should be called on uninstall
	 */
	public static function purge(): void {
		delete_option( 'ftek_option' );
	}

	/**
	 * Registers option with the WordPress Settings API
	 */
	public static function add_option(): void {
		$sp_end_schema = array(
			'type'       => 'object',
			'required'   => true,
			'properties' => array(
				'month' => array(
					'type'     => 'number',
					'required' => true,
				),
				'day'   => array(
					'type'     => 'number',
					'required' => true,
				),
			),
		);

		$schedule_schema = array(
			'type'       => 'object',
			'required'   => true,
			'properties' => array(
				'F'  => array(
					'type'     => 'string',
					'required' => true,
				),
				'TM' => array(
					'type'     => 'string',
					'required' => true,
				),
			),
		);

		register_setting(
			'ftek_option_group',
			'ftek_option',
			array(
				'single'       => true,
				'show_in_rest' => array(
					'schema' => array(
						'type'       => 'object',
						'required'   => true,
						'properties' => array(
							'oauth_discovery_doc_url' => array(
								'type'     => 'string',
								'required' => true,
							),
							'oauth_client_id'         => array(
								'type'     => 'string',
								'required' => true,
							),
							'oauth_client_secret'     => array(
								'type'     => 'string',
								'required' => true,
							),
							'oauth_users'             => array(
								'type'     => 'array',
								'required' => true,
								'items'    => array(
									'type'       => 'object',
									'properties' => array(
										'email_pattern' => array(
											'type'     => 'string',
											'required' => true,
										),
										'roles'         => array(
											'type'     => 'array',
											'required' => true,
											'items'    => array(
												'type' => 'string',
											),
										),
									),
								),
							),
							'google_api_key'          => array(
								'type'     => 'string',
								'required' => true,
							),
							'study_period_ends'       => array(
								'type'       => 'object',
								'required'   => true,
								'properties' => array(
									'1' => $sp_end_schema,
									'2' => $sp_end_schema,
									'3' => $sp_end_schema,
									'4' => $sp_end_schema,
								),
							),
							'schedules'               => array(
								'type'       => 'object',
								'required'   => true,
								'properties' => array(
									'1' => $schedule_schema,
									'2' => $schedule_schema,
									'3' => $schedule_schema,
								),
							),
						),
					),
				),
				'default'      => self::DEFAULTS,
			)
		);
	}

	/**
	 * Adds an admin menu page for plugin settings
	 */
	public static function add_settings_page(): void {
		$settings_page = add_options_page(
			__( 'Ftek', 'ftek' ),
			__( 'Ftek', 'ftek' ),
			'manage_options',
			'ftek-settings',
			function(): void {
				?>
				<div id="ftek-settings" class="wrap"></div>
				<?php
			}
		);

		if ( $settings_page ) {
			add_action(
				'load-' . $settings_page,
				function(): void {
					enqueue_entrypoint_script( 'ftek-settings', 'settings.tsx' );
				}
			);
		}
	}

	/**
	 * Filters plugin_actions_links to add a link to the plugin settings page
	 *
	 * @param array $actions An array of plugin action links.
	 */
	public static function add_settings_action_link( array $actions ): array {
		$url = add_query_arg(
			'page',
			'ftek-settings',
			get_admin_url() . 'options-general.php'
		);

		ob_start();
		?>
		<a href="<?php echo esc_attr( $url ); ?>">
			<?php esc_html_e( 'Settings', 'ftek' ); ?>
		</a>
		<?php
		$actions[] = ob_get_clean();
		return $actions;
	}
}
