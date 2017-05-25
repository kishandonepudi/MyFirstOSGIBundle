(function($, undefined) {
	var registry = [];
	var prevHandler = $.mobile._handleHashChange;
	
	$.mobile._handleHashChange = function(hash) {
		var to = $.mobile.path.stripHash(hash);
		var handled = false;
		$.each(registry, function(i, item) {
			if (to.match(item.regex)) {
				var contentUrl = item.contentUrlMask ? to.match(item.contentUrlMask)[1] : to;
				virtualHashChange(to, _g.HTTP.externalize(item.templateUrl), contentUrl, contentUrl + item.contentUrlSuffix);
				handled = true;
				return false;
			}
		});
		if (!handled) {
			prevHandler(hash);
		}
	};
	
	// This is the almost exact same implementation of splitview's _handleHashChange.
	// The only diff is handling changeContent at the end to accommodate content loading.
	virtualHashChange = function(to, templateUrl, path, contentUrl) {
        var transition = $.mobile.urlHistory.stack.length === 0 ? "none" : undefined,
            $mainPanel=$('div:jqmData(id="main")'),
            $mainPanelFirstPage=$mainPanel.children('div:jqmData(role="page"):first'),
            $mainPanelActivePage=$mainPanel.children('div.ui-page-active'),
            $menuPanel=$('div:jqmData(id="menu")'),
            $menuPanelFirstPage=$menuPanel.children('div:jqmData(role="page"):first'),
            $menuPanelActivePage=$menuPanel.children('div.ui-page-active'),
            //FIX: temp var for dialogHashKey
            dialogHashKey = "&ui-state=dialog",

            // default options for the changPage calls made after examining the current state
            // of the page and the hash
            changePageOptions = {
              transition: transition,
              changeHash: false,
              fromHashChange: true,
              pageContainer: $mainPanel
            };

        if( !$.mobile.hashListeningEnabled || $.mobile.urlHistory.ignoreNextHashChange ){
          $.mobile.urlHistory.ignoreNextHashChange = false;
          return;
        }

        // special case for dialogs
        if( $.mobile.urlHistory.stack.length > 1 && to.indexOf( dialogHashKey ) > -1 ) {

          // If current active page is not a dialog skip the dialog and continue
          // in the same direction
          if(!$.mobile.activePage.is( ".ui-dialog" )) {
            //determine if we're heading forward or backward and continue accordingly past
            //the current dialog
            $.mobile.urlHistory.directHashChange({
              currentUrl: to,
              isBack: function() { window.history.back(); },
              isForward: function() { window.history.forward(); }
            });

            // prevent changepage
            return;
          } else {
            // var setTo = function() { to = $.mobile.urlHistory.getActive().pageUrl; };
            // if the current active page is a dialog and we're navigating
            // to a dialog use the dialog objected saved in the stack
            // urlHistory.directHashChange({ currentUrl: to, isBack: setTo, isForward: setTo });
            urlHistory.directHashChange({
              currentUrl: to,

              // regardless of the direction of the history change
              // do the following
              either: function( isBack ) {
                var active = $.mobile.urlHistory.getActive();

                to = active.pageUrl;

                // make sure to set the role, transition and reversal
                // as most of this is lost by the domCache cleaning
                $.extend( changePageOptions, {
                  role: active.role,
                  transition:  active.transition,
                  reverse: isBack
                });
              }
            });
          }
        }
        
        //if to is defined, load it
        if ( to ){
          to = ( typeof to === "string" && !$.mobile.path.isPath( to ) ) ? ( $.mobile.path.makeUrlAbsolute( '#' + to, documentBase ) ) : to;
          //if this is initial deep-linked page setup, then changePage sidemenu as well
          if (!$('div.ui-page-active').length) {
            $menuPanelFirstPage='#'+$menuPanelFirstPage.attr('id');
            $.mobile.changePage($menuPanelFirstPage, {transition:'none', reverse:true, changeHash:false, fromHashChange:false, pageContainer:$menuPanel});
            $.mobile.activePage=undefined;
          }
          $.mobile.activePage=$mainPanelActivePage.length? $mainPanelActivePage : undefined;
          
          $.mobile.loadPage(templateUrl, changePageOptions).done(function(pageUrl, options, newPage, dupCachedPage) {
        	  _g.ui.Content.load(path, newPage, contentUrl);
        	  $.mobile.changePage(newPage, changePageOptions);
          });
        } else {
        //there's no hash, go to the first page in the main panel.
          $.mobile.activePage=$mainPanelActivePage? $mainPanelActivePage : undefined;
          $.mobile.changePage( $mainPanelFirstPage, changePageOptions );
        }
      };
	
    $.widget("granite.virtualurl", $.mobile.widget, {
        _create: function() {
        	var el = this.element;
        	registry.push({
        		regex: el.jqmData("regex"),
        		templateUrl: el.jqmData("template-url"),
        		contentUrlMask: el.jqmData("content-url-mask"),
        		contentUrlSuffix: el.jqmData("content-url-suffix")
        	});
        }
    });
    
    _g.$('a[data-virtual-url]').live("click", function(e) {
    	location.hash = _g.$(this).jqmData("virtual-url");
    });

})(jQuery);
