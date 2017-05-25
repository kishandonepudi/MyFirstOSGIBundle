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

    var ns = "cq-siteadmin-admin-actions-duplicate";

    function getClipboard() {
        return $(window).adaptTo("foundation-clipboard");
    }

    function copyPages(items) {
        var paths = items.map(function() {
            return $(this).data("path");
        }).toArray();
        
        if (!paths.length) return;

        getClipboard().set("cq-siteadmin-admin-copied-pages", paths);
    }

    function pastePages(activator, collection) {
        var shallowPaste = false; //TODO allow configuration

        var clipboard = getClipboard();
        var paths = clipboard.get("cq-siteadmin-admin-copied-pages");

        if (!$.isArray(paths)) {
            paths = [paths];
        }

        var form = $(".cq-siteadmin-admin-actions-duplicate");

        if (shallowPaste) {
            form.find("[name=shallow]").val("true");
        }
        
        var promises = $.map(paths, function(path) {
            form.find("[name=srcPath]").val(path);
            
            return $.ajax({
                type: form.prop("method"),
                url: form.prop("action"),
                contentType: form.prop("enctype"), 
                data: form.serialize()
            });
        });
        
        $.when.apply(null, promises).done(function() {
            var contentApi = $(".foundation-content").adaptTo("foundation-content");
            contentApi.refresh();
            
            clipboard.remove("cq-siteadmin-admin-copied-pages");
        }).fail(function(xhr) {
            var div = document.createElement("div");
            div.innerHTML = xhr.responseText;

            $(".cq-siteadmin-admin-actions-duplicate-error").modal({
                type: "error",
                content: "<p>" + Granite.I18n.get($("#Message", div).html()) + "</p>"
            }).modal("show");
        });
    }

    function updatePasteButtonStatus(context) {
        context = context || document;
        var pasteButton = $(".cq-siteadmin-admin-actions-duplicate-paste-activator", context);

        var clipboard = getClipboard();
        var copies = clipboard.get("cq-siteadmin-admin-copied-pages");
        if( !copies ) {
            //nothing in clipboard, hide paste button
            pasteButton.addClass("hidden");
        } else {
            //something in clipboard, show paste button
            pasteButton.removeClass("hidden");
        }
    }

    $(document).fipo("tap." + ns, "click." + ns, ".cq-siteadmin-admin-actions-duplicate-copy-activator", function(e) {
        var activator = $(this);
        var config = activator.data("foundationCollectionAction");
        var inlineItem = activator.data("foundationCollectionItem");
        
        var items;
        if (inlineItem) {
            items = $(inlineItem);
        } else if (config) {
            var collection = $(config.target).first();
            items = collection.find(".foundation-selections-item");
        }
        
        copyPages(items);
        
        var mode = activator.data("foundationModeValue");
        if (mode) {
            var group = activator.data("foundationModeGroup");
            activator.trigger("foundation-mode-change", [mode, group]);
        }
        $(document)
        .off("click tap", ".foundation-content-control[data-foundation-content-control-action=back]")
        .one("click tap", ".foundation-content-control[data-foundation-content-control-action=back]", function(e) {
            //refresh the content
            var content = $("#content");
            if (content.length) {
            	var contentApi = content.adaptTo("foundation-content");
            	contentApi.refresh();	
            }
        });
    });

    $(document).fipo("tap." + ns, "click." + ns, ".cq-siteadmin-admin-actions-duplicate-paste-activator", function(e) {
        var activator = $(this);
        var collection = $(activator.data("target")).first();
        pastePages(activator, collection);
    });

    $(window).on("foundation-clipboard-change." + ns, function(e) {
        updatePasteButtonStatus();
    });
    
    $(document).on("foundation-contentloaded." + ns, function(e) {
        updatePasteButtonStatus(e.target);
    });

})(window, document, Granite, Granite.$);
