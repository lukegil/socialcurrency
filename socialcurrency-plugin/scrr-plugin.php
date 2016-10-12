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

add_action('admin_menu', 'scrr_create_menu');

function scrr_create_menu() {
    add_menu_page( 'SocialCurrency Setup', 'SocialCurrency Setup', 'manage_options', 'scrr-admin-panel', 'scrr_admin_init' );
    add_action( 'admin_init', 'scrr_register_settings');
}


function scrr_register_settings() {
    register_setting( 'scrr-plugin-settings', 'scrr_fb_key' );
}

function scrr_admin_init() {
    if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

    ?>
    <div class="wrap">
        <h1>SocialCurrency Setup Options</h1>
        <form method="post" action="options.php">
            <?php settings_fields("scrr-plugin-settings"); ?>
            <?php do_settings_sections("scrr-plugin-settings"); ?>
            <table class="form-table">
                <tbody>
                    <tr>
                        <th>FB Key</th>
                        <td><input type="text" name="scrr_fb_key" value="<?php echo esc_attr( get_option("scrr_fb_key") ) ?>" /></td>

                    </tr>
                </tbody>
            </table>
             <?php submit_button() ?>
        </form>
    </div>
    <?php
};

add_action( 'wp_enqueue_scripts', 'scrr_enqueue' );
function scrr_enqueue() {
    wp_register_script('socialcurrency', plugins_url('socialcurrency-plugin') . '/js/socialcurrency.js');
    wp_enqueue_script('socialcurrency');
    $data = array("fb_key" => get_option(SCRR__FB_DB_KEY));

    wp_localize_script( 'socialcurrency', 'php_vars', $data );
    wp_enqueue_style('scrr-style', plugins_url('socialcurrency-plugin') . '/css/style.css');
};

add_filter('the_content', 'add_scrr_tag');
function add_scrr_tag($content) {
    $tag = include plugin_dir_path( __FILE__ ) . 'templates/anchor_tag.php';
    $content .= $tag;
    return $content;
};

add_filter('wp_footer', 'add_scrr_modal');
function add_scrr_modal($content) {
    $html = include plugin_dir_path( __FILE__ ) . 'templates/main.php';
    echo $html;
};



?>
