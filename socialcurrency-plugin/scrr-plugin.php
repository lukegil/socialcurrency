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
define( 'SCRR__STATIC_FILES',  plugins_url('socialcurrency-plugin') . '/static/');
define( 'SCRR__TEMPLATE_FILES', plugin_dir_path( __FILE__ ) . '/templates/');

/** Adds scrr to the LH Menu; calls init **/
add_action('admin_menu', 'scrr_create_menu');
function scrr_create_menu() {
    add_menu_page( 'SocialCurrency', 'SocialCurrency', 'manage_options', 'scrr-admin-panel', 'scrr_admin_init' );
    add_action( 'admin_init', 'scrr_register_settings');
}

/** Add plugin fields to DB **/
function scrr_register_settings() {
    register_setting( 'scrr-plugin-settings', 'scrr_fb_key' );
}

/** The admin page **/
function scrr_admin_init() {
    if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

    ?>
    <div class="wrap">
        <h1>SocialCurrency Setup Options</h1>
        <p>Enter your FB App ID below. To retrieve one, follow the steps 1-7 <a href="https://developers.facebook.com/docs/apps/register" target="_blank">here</a>.</p>
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

/** Add js to frontend pages **/
add_action( 'wp_enqueue_scripts', 'scrr_enqueue' );
function scrr_enqueue() {
    wp_register_script('socialcurrency', SCRR__STATIC_FILES . 'js/socialcurrency.js');
    wp_enqueue_script('socialcurrency');
    $data = array("fb_key" => get_option(SCRR__FB_DB_KEY),
                  "easylist" => get_option('scrr_easylist'));

    wp_localize_script( 'socialcurrency', 'php_vars', $data );
    wp_enqueue_style('scrr-style', SCRR__STATIC_FILES . 'css/style.css');
};

/** Insert an empty div at the bottom of a post **/
add_filter('the_content', 'add_scrr_tag');
function add_scrr_tag($content) {
    $tag = include SCRR__TEMPLATE_FILES . 'anchor_tag.php';
    $content .= $tag;
    return $content;
};

/** Add the widget to the footer
    TODO : load this via ajax only if needed
**/
add_filter('wp_footer', 'add_scrr_modal');
function add_scrr_modal($content) {
    $html = include SCRR__TEMPLATE_FILES . 'main.php';
    echo $html;
};

/** when plugin is activated, find advert tags on pages and save them to db **/
register_activation_hook( __FILE__, 'scrr_activate' );
function scrr_activate() {
    include plugin_dir_path( __FILE__ ) . '/backend/find_easylist_matches.php';
    $matches = implode("||", find_matches());
    update_option('scrr_easylist', $matches);
};

/** Every day, check for advert tags, in case some have been added or removed **/
wp_schedule_event(time() + 86400, 'daily', 'scrr_daily_cron');
function scrr_daily_cron() {
    include plugin_dir_path( __FILE__ ) . '/backend/find_easylist_matches.php';
    $matches = implode("||", find_matches());
    update_option('scrr_easylist', $matches);
};


?>
