/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, Granite, $) {
    "use strict";

    var ns = ".cq-siteadmin-admin-actions-open";

    function openPage(activator, item) {
        var template = activator.data("href");
        var hook = Granite.HTTP.getXhrHook(template);
        var path = $(item).data("path");

        if (path.length) {
            template = hook ? hook.url : template;
            var url = template.replace("{path}", window.encodeURIComponent(path));
            window.open(url);
        }
    }

    function openPages(activator, collection) {
        var template = activator.data("href");
        
        var hook = Granite.HTTP.getXhrHook(template);
        template = hook ? hook.url : template;
        
        collection.find(".foundation-selections-item").each(function() {
            var path = $(this).data("path");
            var url = template.replace("{path}", window.encodeURIComponent(path));
            window.open(url);
        });
    }

    $(document).fipo("tap" + ns, "click" + ns, ".cq-siteadmin-admin-actions-open-activator", function(e) {
        var activator = $(this);
        var config = activator.data("foundationCollectionAction");

        if (config) {
            var collection = $(config.target).first();
            openPages(activator, collection);
        } else {
            var item = $(activator.data("foundationCollectionItem"));
            openPage(activator, item);
        }
    });

})(window, document, Granite, Granite.$);
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, Granite, $) {
    "use strict";

    var ns = ".cq-siteadmin-admin-actions-move-activator";

    function movePage(activator, item) {
        var path = Granite.HTTP.getPath();
        var lastDot = path.lastIndexOf(".");
        var extSuffix = path.substr(lastDot);
        var suffixSlash = extSuffix.indexOf('/');
        var href = activator.data("href");
        var contentPath = extSuffix.substr(suffixSlash);

        if (suffixSlash == -1) {
            contentPath = '/content';
        }

        var params = 'item=' + window.encodeURIComponent($(item).data('path'));

        if (params.length > 0) {
            href = href + "?" + params;
        }

        //href += "#" + contentPath; // do not use hashes as this disturbes foundation history
        window.location.href = href;
    }

    function movePages(activator, collection) {
        var path = Granite.HTTP.getPath();
        var lastDot = path.lastIndexOf(".");
        var extSuffixe = path.substr(lastDot);
        var suffixeSlash = extSuffixe.indexOf('/');
        var contentPath = extSuffixe.substr(suffixeSlash);

        if (suffixeSlash == -1) {
            contentPath = '/content';
        }

        var params = collection.find(".foundation-selections-item").map(function() {
            var path = $(this).data("path");
            return "item=" + window.encodeURIComponent(path);
        }).toArray().join("&");

        var href = activator.data("href");

        params += "&contentPath=" + window.encodeURIComponent(contentPath);
        
        if (params.length > 0) {
            href = href + "?" + params;
        }

        //href += "#" + contentPath; // do not use hashes as this disturbes foundation history
        window.location.href = href;
    }
    
    $(document).fipo("tap" + ns, "click" + ns, ".cq-siteadmin-admin-actions-move-activator", function(e) {
        var activator = $(this);
        var config = activator.data("foundationCollectionAction");

        if (config) {
            var collection = $(config.target).first();
            movePages(activator, collection);
        } else {
            var item = $(activator.data("foundationCollectionItem"));
            movePage(activator, item);
        }
    });
})(window, document, Granite, Granite.$);
// TODO needs to review this file. Too many improper codes

$(document).on("foundation-contentloaded", function(e) {
    // TODO: This is a dirty hack for now. Should be replaced by some kind of granite ui layout
    // Hide thumbnail on small screens
    function decideDisplayCard() {
        var $properties = $('#propertiesform .properties');
        var p3 = $properties.width();
        var display = p3 > 950;
        $properties.toggleClass("hideCard", !display);
    }
    
    decideDisplayCard();

});

// Create new tags for properties form
$(document).on("foundation-contentloaded", function(e) {
    function createNewTags(selector) {
        // Save tags
        var newTags = [];
        $(selector + " option[data-new]").each(function() {
            newTags.push($(this));
        });
        
        if (newTags.length == 0) return jQuery.Deferred().resolve();
       
        
        function createSingleTag(element) {
            return jQuery.post(Granite.HTTP.externalize("/bin/tagcommand"), {
                cmd: "createTagByTitle",
                locale: "en", // This is fixed to "en" in old siteadmin also
                tag: element.val(),
                "_charset_": "utf-8"
            }, function(data) {
                // Fix tag name in select element
                var tag = $(data).find("#Path").text();
                element.val("default:" + tag);
            });        
        }
        
        var d = [];
        for(var i = 0; i < newTags.length; i++) {
            d.push(createSingleTag(newTags[i]));
        }
        
        var promise = jQuery.when.apply(jQuery, d);
        return promise;
        
    }
    
    $("#propertiesform").on("submit", function(event, alreadySavedTags) {
        if (alreadySavedTags == "alreadySavedTags") return;
        
        $(document)
            .off("click.cq-siteadmin-admin-properties", ".foundation-content-control[data-foundation-content-control-action=back]")
            .one("click.cq-siteadmin-admin-properties", ".foundation-content-control[data-foundation-content-control-action=back]", function(e) {
                var content = $("#content");
                if (!content.length) return;
                
                var api = content.adaptTo("foundation-content");
                api.refresh();
        });
        
        createNewTags("#propertiesform select[name=\"./cq:tags\"]").done(function() {
            // Now we can continue with normal event handling
            $("#propertiesform").trigger("submit", "alreadySavedTags");
        });
       
        event.preventDefault();
        return false;
    });
});
