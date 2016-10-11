<?php

/*
Plugin Name: SocialCurrency
Plugin URI:  https://developer.wordpress.org/plugins/social-currency
Description: Allow return visitors to share an article with their social network in exchange for not seeing ads
Version:     0.1
Author:      LukeGilson
Author URI:  http://klonk.co
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html

*/

define( 'SCRR__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SCRR__FB_DB_KEY', 'scrr_fb_key');

add_action( 'admin_menu', 'scrr_admin_menu' );
function scrr_admin_menu() {
	add_options_page( 'SocialCurrency Setup', 'SocialCurrency Setup', 'manage_options', 'scrr-admin-panel', 'scrr_admin_init' );
};

function scrr_admin_init() {
    if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
    $fb_key = get_option(SCRR__FB_DB_KEY);
    if (!isset($fb_key)) {
        $fb_key = "";
    }
    $output = "";
    $output .= include SCRR__PLUGIN_DIR . "/templates/admin/options.php";
    echo $output;

}

?>
