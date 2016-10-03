<?php

    $easy_list = "../new_easylist.txt";
    $site_url = "https://techcrunch.com";

    function get_page($url) {
        /* GET a page. */
        $ch = curl_init();
        curl_setopt ($ch, CURLOPT_URL, $url);
        curl_setopt ($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $resp = curl_exec ($ch);
        curl_close ($ch);
        return $resp;
    };
    
    function get_easylist($filepath) {
        $str = file_get_contents($filepath);
        $list = explode("\n", $str);

        return $list;
    };

    function search_html($html, $match_list) {
        /* return a Array of easylist elements that are on page

        $html - @type - cURL handle
              - @param - the webpage to search

        $match_list - @type - Array
                    - @param - list of strings to search for
        */
        $dom = new DOMDocument;
        $dom -> encoding = "UTF-8";
        $dom -> substituteEntities = false;
        libxml_use_internal_errors(true);
        $dom -> loadHTML($html, LIBXML_NOWARNING);
        $new_list = Array();
        $tree = $dom -> getElementsByTagName("*");

        $n_text = $tree -> item($i);
        $n_text = $n_text -> ownerDocument -> saveHTML($n_text);
        $n_text = html_entity_decode($n_text);
        foreach($match_list as $el) {
            if ($el && strpos($n_text, $el) > -1) {
                array_push($new_list, $el);

                // we found it once, so don't need to look again
                unset($match_list[$i]);
            }

        }

        return $new_list;
    };

    function build_table($list) {
        /* Returns an associative array

        $list - @type - array of strings
              - @param - An array of substrings to check the page foreach
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


    $ch = get_page($site_url);
    $list = get_easylist($easy_list);
    $clean_list = search_html($ch, $list);
    $table = build_table($clean_list);
    $json_table = json_encode($table);
 ?>
