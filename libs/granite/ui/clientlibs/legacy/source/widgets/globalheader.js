/*
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */
(function($, _g, undefined) {
    $.widget("granite.ui_widgets_globalheader", $.mobile.widget, {
        options: {
            theme: null,
            initSelector: ":jqmData(role='globalheader')"
        },

        _create: function() {
            var o = this.options,
                theme = o.theme || "a";
            
            var homeUrl = _g.HTTP.externalize("/");

            this.element.addClass("ui-globalheader ui-bar-" + theme);

            this.leftCol = $("<div class='ui-globalheader-left'></div>").appendTo(this.element);
            this.logo = $("<a href='" + homeUrl + "' title='Welcome Screen' data-ajax='false' class='ui-globalheader-logo'></a>").appendTo(this.leftCol);
            this.title = $("<div class='ui-globalheader-title'>" + this.element.jqmData("title") + "</div>").appendTo(this.leftCol);

            this.rightCol = $("<div class='ui-globalheader-right'></div>").appendTo(this.element);
            this.buttonbar = $("<div class='g-buttonbar'></div>").appendTo(this.rightCol);

            var me = this;
            _g.ui.UserInfo.getCurrentUser().done(function(user) {
                me.buttonbar.html('<a href="#user-settings-popup" data-role="button" data-iconpos="notext" data-icon="martian" data-rel="balloon">User Properties</a>' +

                '<div id="user-settings-popup" class="balloon" data-role="balloon">' +
                    '<div class="header">' +
                        '<span>You are logged in as</span>' +
                        '<h2>' + user.name_xss + '</h2>' +
                    '</div>' +
                    '<div class="content">' +
                        '<a data-role="button" href="' + _g.HTTP.externalize(_g.Sling.LOGOUT_URL) + '" data-ajax="false">Sign out</a>' +
                    '</div>' +
                '</div>');

                $.each($( ":jqmData(role='button')", me.buttonbar ), function(index, el) {
                   el = $(el);
                   el.buttonMarkup({ theme: "a" });
                });

                $(_g.$.granite_ui.balloon.prototype.options.initSelector).balloon();
                
            });

        }
    });
    
    //auto self-init widgets
    $(document).bind("ready", function(e) {
        $($.granite.ui_widgets_globalheader.prototype.options.initSelector, e.target)
            .not(":jqmData(role='none'), :jqmData(role='nojs')")
            .ui_widgets_globalheader();
    });
})(jQuery, _g);
