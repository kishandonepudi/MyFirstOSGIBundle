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

    var ns = ".foundation-collection-quickactions";
    var isTouch = !!("ontouchstart" in window);

    function isSameGroup(collection, groupName) {
        return !groupName || collection.is("[data-foundation-mode-group~='" + groupName + "'], :not([data-foundation-mode-group])");
    }

    function getActions(item, collection, config) {
        var actions = item.find(".foundation-collection-quickactions").children();
        if (actions.length) {
            return actions;
        }
        
        return collection.siblings("[data-foundation-collection-quickactions-name~=" + config.fallback + "]").children();
    }

    function addListener(collection) {
        var config = collection.data("foundationCollectionQuickactions");
        var selectionsApi = collection.adaptTo("foundation-selections");
        var events = $.quickaction.settings.event;

        collection.finger(events.openMenu.touch + ns, ".foundation-collection-item", function(e) {
            // disable quickactions if we are not in card layout
            if (!collection.hasClass("foundation-layout-card")) {
                return;
            }

            var item = $(this);
            var actions = getActions(item, collection, config);

            if (!actions || !actions.length) return;

            e.preventDefault();
            e.stopImmediatePropagation();

            $.quickaction(e, actions.map(function() {
                return {
                    display: $(this).clone(true).data("foundationCollectionItem", item[0])
                };
            }), {
                container: collection,
                layout: $.quickaction.LAYOUT_CIRCLE,
                autoClose: true,
                displayCloseButton: true /* FIX: make it configurable again, as we lost this functionality after CQ5-25991 */
            });

            selectionsApi.clear(true);
            item.addClass("foundation-selections-item");
            collection.trigger("foundation-selections-change");

            collection.one("quickactionclosemenu" + ns, function() {
                selectionsApi.clear();
            });
        });

        collection.pointer(events.openMenu.pointer + ns, ".foundation-collection-item", function(e) {
            // disable quickactions if we are not in card layout
            if (!collection.hasClass("foundation-layout-card")) {
                return;
            }

            var item = $(this);
            var actions = getActions(item, collection, config);

            if (!actions || !actions.length) return;

            e.preventDefault();
            e.stopImmediatePropagation();

            var cfg = {
                container: collection,
                anchor: item,
                layout: $.quickaction.LAYOUT_BAR
            };

            /* display quickactions */
            $.quickaction(e, actions.map(function() {
                return {
                    display: $(this).clone(true).data("foundationCollectionItem", item[0])
                };
            }), cfg);

            // TODO This code doesn't belong here, but to quickaction plugin
            
            /* hide quickactions if mouse leaves page preview */
            item.off(events.closeMenu.pointer + ns);
            item.on(events.closeMenu.pointer + ns, function(e) {
                /* but don't hide actions if mouse is over quickaction bar */
                if ($(e.relatedTarget).closest('.' + cfg.layout.cssClass).length) {
                    return;
                }

                $.quickaction.LAYOUT_BAR.destroy(cfg);
                item.off(events.closeMenu.pointer + ns);
            });

            /* hide quickactions if mouse leave quickaction bar */
            var bar = cfg.layout.getQuickactionsBar();

            if (bar) {
                bar.off(events.closeMenu.pointer + ns);
                bar.on(events.closeMenu.pointer + ns, function(e) {
                    /* but don't hide actions if mouse is over page-card again */
                    if ($(e.relatedTarget).closest(item).length) {
                        return;
                    }

                    $.quickaction.LAYOUT_BAR.destroy(cfg);
                    bar.off(events.closeMenu.pointer + ns);
                });
            }
        });
    }

    function removeListener(collection) {
        collection.off(ns);
    }

    // TODO quickaction needs to be moved to cardlayout.js as it is card layout specific
    $(document).on("foundation-contentloaded" + ns, function(e) {

        $(".foundation-collection[data-foundation-collection-quickactions]", e.target).each(function() {
            var collection = $(this);

            var config = collection.data("foundationCollection");
            if (!config || config.mode === "default") {
                addListener(collection);
            }

            $(document).on("foundation-mode-change" + ns, function(e, mode, group) {
                if (!isSameGroup(collection, group)) return;

                if (mode === "default") {
                    addListener(collection);
                } else {
                    removeListener(collection);
                }
            });
        });
    });
})(window, document, Granite.$);
