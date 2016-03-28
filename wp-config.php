<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //

if ( file_exists( dirname( __FILE__ ) . '/wp-config-local.php' ) ) {
  
  // override the DB setup locally by creating this file
  include( dirname( __FILE__ ) . '/wp-config-local.php' );

} else {

	/** The name of the database for WordPress */
	define('DB_NAME', $_SERVER['RDS_DB_NAME']);

	/** MySQL database username */
	define('DB_USER', $_SERVER['RDS_USERNAME']);

	/** MySQL database password */
	define('DB_PASSWORD', $_SERVER['RDS_PASSWORD']);

	/** MySQL hostname */
	define('DB_HOST', $_SERVER['RDS_HOSTNAME']);
  
  
	// define('AWS_ACCESS_KEY_ID', $_SERVER['ACCESSKEYID']);
	// define('AWS_SECRET_ACCESS_KEY', $_SERVER['SECRETACCESSKEY']);
	// define( 'AS3CF_BUCKET', $_SERVER['S3_BUCKET'] );
	
	define('WP_HOME', $_SERVER['WP_HOME']);
	define('WP_SITEURL', $_SERVER['SITE_URL']);
  
  
  /**
   * For developers: WordPress debugging mode.
   *
   * Change this to true to enable the display of notices during development.
   * It is strongly recommended that plugin and theme developers use WP_DEBUG
   * in their development environments.
   *
   * For information on other constants that can be used for debugging,
   * visit the Codex.
   *
   * @link https://codex.wordpress.org/Debugging_in_WordPress
   */
  define('WP_DEBUG', false);

}

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '#A>tKlg`XCvSq*$2vE5Bh643Q%jt^4>_&iR-cVa-SQk2g+*R,kqrBoMlw=N|[>hM');
define('SECURE_AUTH_KEY',  'CU}tQf7U5o%*/T23oJ&!D0V9pNv&#BHt^kG`R.8JY9p(-j|3]cper9u5pH9fm:^e');
define('LOGGED_IN_KEY',    'K/emP^hi)s$m}| Ay>.qJ,9k+,-2;|qkDPeB%tx 4w<A&=}! fEk+5+jEc9OdGC(');
define('NONCE_KEY',        'a2# >e:hH~uYU#qq3:|KX#Vtu9SY{3!,rHN;!]xms,^)9R6UmnjLN5(.28bxi|:h');
define('AUTH_SALT',        ',U=!.pV%-|_._+F#,g5Db}&-+5|p_-+y{kAy#!A|~3tkA)JI>Jy%cL0sQlJW$JqE');
define('SECURE_AUTH_SALT', 'h1:]_IXN6kv<m^kT$c6)k6[-f~4s*(Q:z[x32-G8e5RqzA?`g3+b>VyZR(+Pq$Z/');
define('LOGGED_IN_SALT',   'nuVRl|(_tJ{:NSq+c~?#f:]>j,[|eVu_y&z7-|$RLxO%S6{W^E;!gjh:#^5TPSl-');
define('NONCE_SALT',       'ty:h{$]ezwA53WRN||p-f>6~_F!wY-NR)aD`|JX&-?|+w!:,@T9(y1lY,otJ /N@');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';


/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');