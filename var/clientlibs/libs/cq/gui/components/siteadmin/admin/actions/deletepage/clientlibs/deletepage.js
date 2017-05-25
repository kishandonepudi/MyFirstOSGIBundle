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

    var rel = ".cq-siteadmin-admin-actions-delete";

    function deletePages(paths, force) {
        var items = $(".foundation-collection").find(".foundation-selections-item");
        if (paths == null) {
            var paths = [];
            for (var i = 0; i < items.length; i++) {
                paths.push($(items[i]).data("path"));
            }
        }
        $.ajax({
            url: "/bin/wcmcommand",
            type: "post",
            data: {
                cmd: "deletePage",
                path: paths,
                force: force == undefined ? false : force
            },
            success: function() {
                $(rel).hide();
                $(rel).modal("hide");
                var contentApi = $(".foundation-content").adaptTo("foundation-content");
                contentApi.refresh();
            },
            statusCode: {
                412: function(data) {
                    var div = document.createElement("div");
                    div.innerHTML = data.responseText;
                    $(rel).modal("hide");
                    $(rel + "-error").modal({
                        type: "error",
                        content: "<p>" + Granite.I18n.get($("#Message", div).html()) + "</p>",
                        buttons: [{
                            label: Granite.I18n.get("Force Delete"),
                            click: function(evt) {
                                this.hide();
                                deletePages(paths, true);
                            }
//                        },{
//                            //todo: CQ5-23124
//                            label: Granite.I18n.get("List"),
//                            disabled: true,
//                            click: function(evt) {
//                            }
                        },{
                            label: Granite.I18n.get("Cancel"),
                            className: "primary",
                            click: function(evt) {
                                this.hide();
                            }
                        }]
                    }).modal("show");
                }
            },
            error: function(data) {
                $(rel).modal("hide");
                $(rel + "-error").modal({
                    type: "error"
                }).modal("show");
            }
        });
    }

    $(document).fipo("tap." + rel, "click." + rel, rel + " button.primary", function(e) {
        deletePages();
    });

    var MAX_ENTRIES = 12;

    var multipleText = null;

    $(document).on("beforeshow." + rel, ".modal" + rel, function(e) {
        var $modal = $(rel);
        var $multiple = $modal.find(".multiple");
        var selectedItems = $(".foundation-collection article.foundation-selections-item");
        if (selectedItems.length == 1) {
            $modal.find(".single").removeClass("hidden");
            $multiple.addClass("hidden");
        } else {
            $modal.find(".single").addClass("hidden");
            $multiple.removeClass("hidden");
        }
        if (!multipleText) {
            multipleText = $multiple.text();
        }
        $multiple.text(multipleText.replace(/%no%/gi, selectedItems.length));
        var $pageList = $modal.find(".page-list");
        $pageList.empty();
        var itemCnt = Math.min(selectedItems.length, MAX_ENTRIES);
        for (var i = 0; i < itemCnt; i++) {
            var $item = $(selectedItems[i]);
            if (i > 0) {
                $pageList.append($("<br>"));
            }
            $pageList.append($item.find("h4").text());
        }
        if (selectedItems.length > itemCnt) {
            $pageList.append($("<br>")).append("...");
        }
    });

})(document, Granite.$);
