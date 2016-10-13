<?php

    function scrr_get_page($url) {
        /* GET an html page */

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $resp = curl_exec($ch);

        curl_close($ch);


        return $resp;
    };

    function get_easylist($filepath) {
        $str = file_get_contents($filepath);
        $list = explode("\n", $str);

        return $list;
    };

    function search_html($html, &$match_list, $new_list = Array()) {
        /* return a Array of easylist elements that are on page

        $html - @type - cURL handle
              - @param - the webpage to search

        $match_list - @type - Array
                    - @param - list of strings to search for

        $new_list - @type - Array
                  - @param - list of matched terms in match list. Only used
                             if this is the second+ page of a site visited.
        */

        $dom = new DOMDocument;
        $dom -> encoding = "UTF-8";
        $dom -> substituteEntities = false;
        libxml_use_internal_errors(true);
        $dom -> loadHTML($html, LIBXML_NOWARNING);
        $new_list = Array();
        $tree = $dom -> getElementsByTagName("*");

        $n_text = $tree -> item(0);
        $n_text = $n_text -> ownerDocument -> saveHTML($n_text);
        $n_text = html_entity_decode($n_text);
        $i = 0;
        foreach($match_list as $el) {

            if ($el && strpos($n_text, $el) > -1) {
                array_push($new_list, $el);

                // we found it once, so don't need to look again
                unset($match_list[$i]);
            }
            $i++;
        }

        return $new_list;
    };

    function build_table($list) {
        /* Returns an associative array

        $list - @type - array of strings
              - @param - An array of substrings to check the page for
        */

        $table = Array();
        foreach ($list as $item) {

            $item = trim($item);
            $subtable = &$table;
            $first_letter = "";
            $i_len = strlen($item) - 1;
            $i = $i_len;
            for (; $i >= 0; $i--) {
                if ($i == $i_len) {
                    $first_letter = $item[$i];
                }
                if (!isset($subtable[$item[$i]])) {
                    $subtable[$item[$i]] = Array();
                }

                $subtable = &$subtable[$item[$i]];
            }
            $subtable[$item[0]] = true;
            if (!isset($table[$first_letter]["min_length"]) || $i_len < $table[$first_letter]["min_length"]) {
                $table[$first_letter]["min_length"] = $i_len;
            }
        }
        return $table;
    };

    function get_recent_post_url() {
        $args = array(
        	'numberposts' => 1,
        	'offset' => 0,
        	'category' => 0,
        	'orderby' => 'post_date',
        	'order' => 'DESC',
        	'post_type' => 'post',
        	'post_status' => 'publish',
        	'suppress_filters' => true
        );

        $recent_posts = wp_get_recent_posts( $args, ARRAY_A );
        $post_id = NULL;
        foreach ($recent_posts as $post) {
            $post_id = $post["ID"];
        };
        if (isset($post_id)) {
            return get_post_permalink($post_id);
        } else {
            return NULL;
        }

    };

    function find_matches() {
        $easy_list = SCRR__STATIC_FILES . "easylist.txt";

        $check_urls = array();
        $check_urls[] = get_home_url();
        $check_urls[] = get_recent_post_url();
        $list = get_easylist($easy_list);
        $final_list = array();
        foreach($check_urls as $url) {
            $ch = scrr_get_page($url);
            $l = search_html($ch, $list, $final_list);
            $final_list = array_merge($final_list, $l);
        }
        return $final_list;
    };



 ?>
