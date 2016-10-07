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
        console.log("removing ads");
        this.add_dom_listener();
        this.remove_all_ads();
        console.log("done removing");
    }

    if (this.show_scrr() || 1 == 1) {
        /* To Do -- make an on ready event */
        this.add_pop_listener();
        console.log("added pop");
    }
}

SocialCurrency.prototype.vals = {
    session_count_key : "scrr_cnt",
    local_storage_obj : "scrr_obj",
    default_time : 604800000, // one week
    show_every : 86400000, // one day
    listener_selector : "#scrr-post-btm",
    twitter_url : "",
    scrr_pop : "#scrr-question",
    scrr_btn : ".scrr-btn",
    screen_wipe : ".scrr-screen-wipe",
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
    if (ls.never_show || ls.last_shown < Date.now() - this.vals.show_every )
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
};

SocialCurrency.prototype.add_pop_listener = function() {
    console.log("addinglistener");
    this.vals.ticking = false;
    this.vals.scroll_y = window.innerHeight + window.scrollY;

    this.vals.insert_dist = document.querySelector(this.vals.listener_selector).offsetTop;
    this.vals.popped = false;
    // TO Do , pass parent scope to listener and insert_pop
    window.addEventListener("scroll", function() {
        var parent_scope = window.scrr;

        if (!parent_scope.vals.ticking)
            window.requestAnimationFrame(function() {
                var scroll_y = parent_scope.vals.scroll_y = window.innerHeight + window.scrollY;
                //console.log(parent_scope);
                var insert_dist = parent_scope.vals.insert_dist;
                // console.log("scoll_y : " + scroll_y);
                // console.log("insert_dist : " + insert_dist);
                if (!parent_scope.vals.popped && scroll_y >= insert_dist) {
                    console.log("in first conditional");
                    //console.log(parent_scope);
                    parent_scope.vals.node = parent_scope.insert_pop(parent_scope);
                    parent_scope.vals.node_height = parent_scope.vals.node.offsetHeight;
                    parent_scope.vals.popped = true;
                } else if (parent_scope.vals.popped && scroll_y >= insert_dist) {
                    console.log("in second");
                    var new_bottom = scroll_y - insert_dist;
                    new_bottom -= parent_scope.vals.node_height;

                    if (new_bottom >= 0)
                        new_bottom = 0;
                    else if (new_bottom > parent_scope.vals.node_height + 10)
                        new_bottom = parent_scope.vals.node_height + 10

                    parent_scope.vals.node.style.bottom = new_bottom + "px";
                } else if (parent_scope.vals.popped && scroll_y < insert_dist) {
                    new_bottom = -1 * (parent_scope.vals.node_height + 10)
                    parent_scope.vals.node.style.bottom = new_bottom + "px";
                }
                parent_scope.vals.ticking = false;
            });
        parent_scope.vals.ticking = true;
    });
};

SocialCurrency.prototype.add_affirm_listener = function() {
    var node = document.querySelector(this.vals.scrr_btn);
    node.addEventListener("click", function(e) {
        var parent_scope = window.scrr;
        var x = e.screenX;
        var y = e.screenY;
        parent_scope.screen_wipe(x,y);
    })
}

SocialCurrency.prototype.screen_wipe = function(x, y) {

    //tk
    var node = document.querySelector(this.vals.screen_wipe);
    node.style.top = y + "px";
    node.style.left = x + "px";

    node.style.transition = "border-width : 0.2s";

};

SocialCurrency.prototype.insert_pop = function(parent_scope) {
    var node = document.querySelector(parent_scope.vals.scrr_pop);
    var h = node.offsetHeight;
    node.style.display = "initial";
    node.style.bottom = (0 - h) + "px";

    return node;
};

SocialCurrency.prototype.check_share_twitter = function() {
};

scrr = new SocialCurrency();
scrr.init();
console.log('inited');
