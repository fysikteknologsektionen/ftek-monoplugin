<?php
/**
 * Cookies class
 *
 * @package ftek\plugin
 */

namespace Ftek\Plugin;

/**
 * Cookies class
 */
class Cookies {

	/**
	 * Wrapper around php:s setcookie
	 *
	 * @param string $name    The name of the cookie.
	 * @param string $value   The value of the cookie.
	 * @param ?array $options An associative array which may have any of the
	 *                        keys expires, path, domain, secure, httponly and
	 *                        samesite.
	 */
	public static function set( string $name, string $value, ?array $options = null ): bool {
		$_COOKIE[ $name ] = $value;
		return setcookie(
			$name,
			$value,
			array_merge(
				array(
					'path'     => '/',
					'secure'   => is_ssl(),
					'httponly' => true,
					'samesite' => 'Lax',
				),
				$options ? $options : array()
			)
		);
	}

	/**
	 * Deletes a cookie by setting a negative expiry
	 *
	 * @param string $name The name of the cookie.
	 */
	public static function delete( string $name ) {
		unset( $_COOKIE[ $name ] );
		setcookie( $name, null, -1, '/' );
	}

}
