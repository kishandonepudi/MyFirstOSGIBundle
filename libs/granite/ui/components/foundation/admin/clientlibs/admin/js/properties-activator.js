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
(function(document, $) {
    "use strict";

    function showOneItemProperty(activator, item) {
        if (!item) return;

        var url = activator.data("href") + "?item=" + encodeURIComponent($(item).data("path"));
        var contentAPI = activator.closest(".foundation-content").adaptTo("foundation-content");
        return contentAPI.go(url);
    }

    function showProperties(activator, collection) {
        var selections = collection.find(".foundation-selections-item");

        if (!selections.length) return;

        var url = activator.data("href") + "?" + selections.map(function() {
            return "item=" + encodeURIComponent($(this).data("path"));
        }).toArray().join("&");

        var contentAPI = activator.closest(".foundation-content").adaptTo("foundation-content");
        return contentAPI.go(url);
    }

    $(document).fipo("tap.foundation-admin-properties-activator", "click.foundation-admin-properties-activator", ".foundation-admin-properties-activator", function(e) {
        var activator = $(this);
        var config = activator.data("foundationCollectionAction");

        if (config) {
            var collection = $(config.target).first();
            showProperties(activator, collection);
        } else {
            var item = $(activator.data("foundationCollectionItem"));
            showOneItemProperty(activator, item);
        }

    });
})(document, Granite.$);
