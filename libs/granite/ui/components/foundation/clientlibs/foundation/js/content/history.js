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
(function(window, document, $) {
    "use strict";
    
    var History = window.History;
    
    if (!History.enabled) return;
    
    var ns = ".foundation-content-history";

    // build prefix for window title
    var prefix = History.options.initialTitle;
    if (prefix.indexOf("|") != -1) {
        // "AEM Sites | Geometrixx" >> "AEM Sites"
        prefix = prefix.substring(0, prefix.indexOf("|")).replace(/\s\s*$/, '');
    }

    function getInfo(el, config) {
        var url = el.prop("href");
        var elTitle = el.data("foundation-content-history-title");
        var title = prefix +  (elTitle ? " | " + elTitle : "");

        if (typeof config == "string") {
            return {
                title: title,
                url: url,
                push: config != "replace"
            };
        } else {
            return {
                title: title,
                url: url,
                push: !config.replace
            };
        }
    }
    
    $(document).on("click" + ns, "a[data-foundation-content-history]", function(e) {
        try {
            var a = $(this);
            var config = a.data("foundationContentHistory");
            var contentApi = a.closest(".foundation-content").adaptTo("foundation-content");
            
            var info = getInfo(a, config);
            
            if (info.push) {
                History.pushState(info.data, info.title, info.url);
            } else {
                History.replaceState(info.data, info.title, info.url);
            }
            
            e.preventDefault();
        } catch (e) {
            // Do nothing i.e. normal behavior
        }
    });
    
    History.Adapter.bind(window, "statechange", function(e) {
        var state = History.getState();
        
        var content = $(".foundation-content");
        if (!content.length) return;
        
        var contentApi = content.adaptTo("foundation-content");
        
        // For now we do a new request instead of say go back to history
        var url = "" + document.location; // Need to be a string
        contentApi.go(url, false);
    });
    
})(window, document, Granite.$);
