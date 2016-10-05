/*
Notes :
    - going to have to insert a div at the bottom of the post
    so I can add a listener
*/


var SocialCurrency = function() {
    // constructor

}

SocialCurrency.prototype.init = function() {

    if (this.rm_ads()) {
        this.add_dom_listener();
        this.remove_all_ads();
        return;
    }

    if (this.show_scrr())
        this.add_listener();
}

SocialCurrency.prototype.vals = {
    session_count_key : "scrr_cnt",
    local_storage_obj : "scrr_obj",
    default_time : 604800000, // one week
    show_every : 86400000, // one day
    listener_selector : "#scrr-post-btm",
};

SocialCurrency.prototype.get_base_obj = function() {
    return {
        never_show : false,
        last_shown : Date.now(),
        has_shared : false,
        last_shared : Date.now(),
    }
};

SocialCurrency.prototype.rm_ads = function() {
    /* return bool

    Check whether or not ads should be removed, based on localstorage object
    */

    var ls = this.get_localstorage();
    if (!ls)
        return false;
    var rm_ads = ls.has_shared && ls.last_shared > (Date.now() - this.vals.default_time)
    if (rm_ads)
        return true;
    return false;
};

SocialCurrency.prototype.show_scrr = function() {
    /* return bool

    Check if the popup should be shown, based on localStorage object
    */
    var ls = this.get_localstorage();
    if (!ls)
        ls = this.get_base_obj();
    if (ls.never_show || ls.last_shown < Date.now() - ls.vals.show_every )
        return false;
    else
        return true;
}

SocialCurrency.prototype.get_session_count = function() {
    var c = window.sessionStorage.getItem(this.vals.session_count_key);
    return parseInt(c);
};

SocialCurrency.prototype.set_session_count = function(c) {
    window.sessionStorage.setItem(this.vals.session_count_key, c);
};

SocialCurrency.prototype.get_localstorage = function() {
    var l = window.localStorage.getItem(this.vals.local_storage_obj);
    return JSON.parse(l);
};

SocialCurrency.prototype.set_localstorage = function(o) {
    var l = JSON.stringify(o);
    window.localStorage.setItem(this.vals.local_storage_obj, l);
};


SocialCurrency.prototype.remove_all_ads = function() {
    /* wrapper for remove advert functions */

    this.remove_ad_scripts();
    this.remove_ad_boxes();


};

SocialCurrency.prototype.remove_ad_scripts = function() {
    this.search_and_destroy(document.scripts, this, true);
}

SocialCurrency.prototype.remove_ad_boxes = function() {
    if (document.head)
        this.search_and_destroy(document.head.children, this);
    if (document.body)
        this.search_and_destroy(document.body.children, this);
}

SocialCurrency.prototype.search_and_destroy = function(nodes, parent_scope) {
    /* recursively search a nodeList and remove any which may have adverts */

    var is_script = is_script || false
    var nl = nodes.length;
    for (var i = 0; i < nl; i++) {
        var c;

        if (parent_scope.find_match(nodes[i], parent_scope, is_script)) {
            nodes[i].remove();
            i--;
            nl--;
        } else if (nodes[i] && (c = nodes[i].children) && c.length > 0)
            parent_scope.search_and_destroy(c, parent_scope, is_script);
    }
}

SocialCurrency.prototype.find_match = function(node, parent_scope, scripts) {
    /* return bool

    determine whether node may have adverts in it

    node - @type - a DOM node
         - @param - the node you're searching
    parent_scope - @type - object
                 - @param - the SocialCurrency object
    scripts - @type - bool
            - @param - whether or not a <script> node is being checked

    */
    var is_script = scripts || false;
    var string = "";
    var na;

    if (node && node.attributes)
        na = node.attributes;
    else
        na = [];

    for (var j = 0; j < na.length; j++)
        string += na[j].textContent + " ";

    if (is_script && node)
        string += " " + node.textContent;

    var tbl = parent_scope.get_string_table();
    for (key in tbl) {
        if (string.indexOf(tbl[key]) > -1) {
            return true;
        }
    }
    return false;
};

SocialCurrency.prototype.set_string_table = function(obj) {
    this.string_match_table = obj;
};

SocialCurrency.prototype.get_string_table = function() {
    return this.string_match_table;
};

SocialCurrency.prototype.add_dom_listener = function() {
    /* Whenever a mutation to the DOM is observed, search_and_destroy is
        run on the affected nodes
    */

    var target = document.querySelector("html");
    var parent_scope = this;
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            parent_scope.search_and_destroy(mutation.addedNodes, parent_scope, true, true);
        });
  }, parent_scope);
    var config = { attributes: true, childList: true, characterData: true, subtree : true };
    observer.observe(target, config);
}
