/**
 * The popup_menu plugin provides the ability to show a popup menu.
 */

(function($){

    $.widget("granite_ui.balloon", {

        // setup the defaults
        options: {
            initSelector: ":jqmData(rel='balloon')"
        },

        _create: function() {

            var ui = {
                screen : "#ui-popup-screen"
            };

            var proto = $(
                "<div>" +
                    " <div id='ui-popup-screen' class='balloon-screen ui-screen-hidden ui-popup-screen'></div>" +
                "</div>"
            );

            // Assign the relevant parts of the proto
            for (var key in ui) {
                ui[key] = proto.find(ui[key]).removeAttr("id");
            }

            // Define instance variables
            $.extend(this, {
                _ui : ui,
                _popoverMenuDiv: undefined,
                _popoverButton: undefined,
                _scrollContainer: undefined,
                _isOpen : false,
                _page: undefined
            });

            // turn off all active buttons from our balloon contents...
            $('.balloon .ui-btn.' + $.mobile.activeBtnClass).removeClass($.mobile.activeBtnClass);

            this._popoverButton = $(this.element);
            var popoverDivId = $(this.element).attr("href");
            this._popoverMenuDiv = $(popoverDivId);

            var self = this;

            if ($.support.touch) {
                $(window).bind("vclick scroll orientationchange", function(event) {
                    // we could add behavior to the balloon such that if something is selected
                    // from the menu we don't close it... however now the behavior is such that
                    // any click will close the balloon.
                    //if($(event.target).closest('.balloon').length == 0) {
                        self.close();
                    //}
                });
            }
            else {
                this._page = $("body");
                this._ui.screen
                    .height($(document).height())
                    .removeClass("ui-screen-hidden");
            }
            
            this._popoverButton.bind("click", function(event) {
                self.showPopup();
            });
        },

        disableActivePageButton: function() {
            // enabled all buttons
            this._popoverMenuDiv.find(".content a").removeClass("ui-disabled");

            // locate the main content's current url such that we can test to check
            // to see if any of our links point to it
            var activepage = $('div:jqmData(id="main") > div.' + $.mobile.activePageClass);
            var url = activepage.attr('data-url');

            // locate all anchor tags and disable the anchor that matches the active page
            this._popoverMenuDiv.find(".content a").each(function() {
                var currentHref = $(this).attr("href");

                if( currentHref != null && url.indexOf(currentHref, this.length - currentHref.length) !== -1) {
                    $(this).addClass("ui-disabled");
                }
            });
        },

        showPopup: function() {
            if(!this._isOpen) {

                // todo: calling destroy should remove this wrapper...
                if ($.support.touch == true && this._popoverMenuDiv.find("#wrapper").length == 0) {
                    this._scrollContainer = this._popoverMenuDiv.find('.content'),
                        scrAreaChildren = this._scrollContainer.children();

                    if (scrAreaChildren.length > 1) {
                        scrAreaChildren = this._scrollContainer.wrapInner("<div id='wrapper'></div>").children();
                    }
                    this._scrollContainer.iscroll({});
                }

                var self = this;

                if ($.support.touch == true) {
                    setTimeout(function() {
                        self._scrollContainer.iscroll().refresh();
                    });
                }
                else {
                    this._ui.screen.one("click", function() {
                        self.close();

                    });

                    this._popoverMenuDiv.one("click", function(event) {
                        // if a ballon item was clicked, we could configure this to keep
                        // the balloon open and allow them to continue to click items
                        // but the default behavior is to close the balloon
                        // after a single click
                        if($(event.target).closest('.balloon').length != 0) {
                            self.close();
                        }
                    });

                    this._page.append(this._ui.screen);
                    this._ui.screen.removeClass("ui-screen-hidden");
                }


                this._positionPopup();

                this._popoverMenuDiv.fadeToggle('fast');
                this._popoverButton.addClass($.mobile.activeBtnClass);

                this.disableActivePageButton();
                this._isOpen = true;
            }
        },

        close: function() {
            if (this._isOpen) {
                if (!$.support.touch) {
                    this._page.find(".balloon-screen").remove();
                    this._ui.screen.addClass("ui-screen-hidden");
                }

                this._popoverButton.removeClass($.mobile.activeBtnClass);
                this._popoverMenuDiv.fadeToggle('fast');

                this._isOpen = false;
            }
        },

        _positionPopup: function() {
            var position = this._popoverButton.offset();

            var coords = this._placementCoords(
                (undefined === position.left ? window.innerWidth / 2 : position.left),
                (undefined === position.top ? window.innerWidth / 2 : position.top));

            this._popoverMenuDiv.css({
                left: coords.x,
                top: coords.y
            });
        },

        _placementCoords: function(x, y) {
            // Try and center the overlay over the given coordinates
            var ret,
                menuHeight = this._popoverMenuDiv.outerHeight(true),
                menuWidth = this._popoverMenuDiv.outerWidth(true),
                scrollTop = $( window ).scrollTop(),
                screenHeight = 0,
                screenWidth = 0,
                halfheight = menuHeight / 2,
                maxwidth = parseFloat( this._popoverMenuDiv.css( "max-width" ) ),
                roomtop = y - scrollTop,
                newtop, newleft;

            var myWidth = 0, myHeight = 0;
            if( typeof( window.innerWidth ) == 'number' ) {
                //Non-IE
                screenWidth = window.innerWidth;
                screenHeight = window.innerHeight;
            } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                //IE 6+ in 'standards compliant mode'
                screenWidth = document.documentElement.clientWidth;
                screenHeight = document.documentElement.clientHeight;
            } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                //IE 4 compatible
                screenWidth = document.body.clientWidth;
                screenHeight = document.body.clientHeight;
            }

            var roombot = scrollTop + screenHeight - y;

            if ( roomtop > menuHeight / 2 && roombot > menuHeight / 2 ) {
                newtop = y - halfheight;
            }
            else {
                // 30px tolerance off the edges
                newtop = roomtop > roombot ? scrollTop + screenHeight - menuHeight - 30 : scrollTop + 30;
            }
            // If the menuwidth is smaller than the screen center is
            if ( menuWidth < maxwidth ) {
                newleft = ( screenWidth - menuWidth ) / 2;
            }
            else {
                //otherwise insure a >= 30px offset from the left
                newleft = x - menuWidth / 2;
                // 10px tolerance off the edges
                if ( newleft < 10 ) {
                    newleft = 10;
                }
                else
                if ( ( newleft + menuWidth ) > screenWidth ) {
                    newleft = screenWidth - menuWidth - 10;
                }
            }
            return { x : newleft, y : newtop };
        }

    });

    // the ready event will fire when the DOM is loaded...
    // the pageinit will allow pages that are loaded by AJAX calls to fire    
    $(document).bind("ready pageinit", function(event) {

        $(_g.$.granite_ui.balloon.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')")
            .balloon();        
    });

})(jQuery);
