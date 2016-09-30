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

SocialCurrency.prototype.base_obj = function() {
    return {
        never_show : false,
        last_shown : Date.now(),
        has_shared : false,
        last_shared : Date.now(),
    }
};

SocialCurrency.prototype.rm_ads = function() {
    var ls = this.get_localstorage();
    if (!ls)
        return false;
    var rm_ads = ls.has_shared && ls.last_shared > Date.now() - this.vals.default_time
    if (rm_ads)
        return true;
    return false;
};

SocialCurrency.prototype.show_scrr = function() {
    var ls = this.get_localstorage();
    if (!ls)
        ls = this.base_obj();
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
    this.remove_ad_scripts();
    // this.remove_ad_requests();
    this.remove_ad_boxes();

};

SocialCurrency.prototype.remove_ad_scripts = function() {
    this.search_and_destroy(document.scripts, this);
}

SocialCurrency.prototype.remove_ad_boxes = function() {
    this.search_and_destroy(document.head.children, this);
    this.search_and_destroy(document.body.children, this);
}

SocialCurrency.prototype.search_and_destroy = function(nodes, parent_scope) {
    var nl = nodes.length;

    for (var i = 0; i < nl; i++)
        var c;
        if (parent_scope.find_match(nodes[i], parent_scope))
            nodes[i].remove();
        else if ((c = nodes[i].children))
            parent_scope.search_and_destroy(c, parent_scope);

}

SocialCurrency.prototype.find_match = function(node, parent_scope) {
    var string = "";
    var na = node.attributes;
    for (var j = 0; j < na.length; j++)
        string += na[j].textContent + " ";

    for (key in parent_scope.string_match_table) {

        var min_len = parent_scope.string_match_table[key].min_len;
        var i = string.slice(q1 + min_len, q2).indexOf(key)
        if (i === -1)
            continue

        var tbl = parent_scope.string_match_table;
        var str_ltr;
        while ( (i -= 1) >= 0 && (tbl = tbl[string[i]]) )
            if (tbl == true)
                return true;
    }
    return false;
};

SocialCurrency.prototype.str_compare = function()


SocialCurrency.prototype.add_listener = function() {

// Reference: http://www.html5rocks.com/en/tutorials/speed/animations/
var last_known_scroll_position = 0;
var ticking = false;

window.addEventListener('scroll', function(e) {
    last_known_scroll_position = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            doSomething(last_known_scroll_position);
            ticking = false;
        });
    }
    ticking = true;
    });
};
