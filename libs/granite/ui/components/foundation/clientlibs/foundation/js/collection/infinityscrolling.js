/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, CUI) {
    "use strict";
    
    var ns = ".foundation-collection-infinityscrolling";
    
    function handleScroll(collection, scrollContainer) {
        var scrollHeight = scrollContainer.prop("scrollHeight");
        var scrollTop = scrollContainer.prop("scrollTop");
        var clientHeight = scrollContainer.prop("clientHeight");
        
        if (clientHeight + scrollTop >= scrollHeight && collection.is(":visible")) {
            loadNextPage(collection);
        }
    }

    function loadInitPage(collection, scrollContainer) {
        var ch = scrollContainer.height();
        var sh = scrollContainer.prop("scrollHeight");

        var nextPage = collection.data("src");

        if (nextPage && (sh - ch) === 0) {
            loadNextPage(collection).done(function() {
                loadInitPage(collection, scrollContainer);
            });
        }
    }

    function loadNextPage(collection) {
        if (collection.data("foundationCollectionInfinityscrolling.isLoading")) return $.Deferred().fail();
        
        var nextPage = collection.data("src");
        if (!nextPage) return $.Deferred().fail();
        
        collection.data("foundationCollectionInfinityscrolling.isLoading", true);
        
        return $.ajax({
            url: nextPage
        }).done(function(html) {
            var el = $(Granite.UI.Foundation.Utils.processHtml(html));

            collection.data("src", el.find(".foundation-collection").data("src"));

            // TODO make collection is adaptable to foundation-layout and provide append method there
            // Assuming we are using CUI is wrong here
            CUI.CardView.get(collection).append(el.find(".foundation-collection-item").toArray());
            
            collection.data("foundationCollectionInfinityscrolling.isLoading", false);
            collection.trigger("foundation-contentloaded");
        }).fail(function() {
            collection.data("infinityscroll.isLoading", false);
        });
    }
        
    $(document).on("foundation-contentloaded" + ns, function(e) {
        $(".foundation-collection", e.target).each(function() {
            var collection = $(this);
            
            var scrollContainer = (function(collection) {
                var scrollSrc = collection.data("scrollSrc");
                
                if (scrollSrc) return collection.closest(scrollSrc);
                
                // just return parent, need to specify data-scroll-src if not suitable. See GRANITE-2223
                return collection.parent();
            })(collection);
            
            // remove and re-register
            scrollContainer.off("scroll" + ns).on("scroll" + ns, function() {
                handleScroll(collection, scrollContainer);
            });
            
            loadInitPage(collection, scrollContainer);
        });
    });
    
})(document, Granite, Granite.$, CUI);
