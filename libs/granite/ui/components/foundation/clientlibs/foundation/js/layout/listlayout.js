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
    
    // NOTE: foundation-layout-list is now exclusive to manage the layout of foundation-collection only
    
    var ns = ".foundation-layout-list";
    
    function getSameGroupEl(type, groupName) {
        if (groupName) {
            return $("." + type + "[data-foundation-mode-group~='" + groupName + "'], ." + type + ":not([data-foundation-mode-group])");
        } else {
            return $("." + type);
        }
    }

    function addListener(collection) {
        var selectionApi = collection.adaptTo("foundation-selections");
        var group = collection.data("foundationModeGroup");
        
        collection.on("change:selection" + ns, function(e) {
            collection.trigger("foundation-selections-change");
            
            var beforeCount = collection.data("foundation-layout-list.internal.beforeCount") || 0;
            var afterCount = selectionApi.count();
            
            if (beforeCount === 0 && afterCount > 0) {
                collection.trigger("foundation-mode-change", ["selection", group]);
            } else if (beforeCount > 0 && afterCount === 0) {
                collection.trigger("foundation-mode-change", ["default", group]);
            }
            
            collection.data("foundation-layout-list.internal.beforeCount", afterCount);
        });
    }
    
    function removeListener(collection) {
        collection.off("change:selection" + ns);
        collection.data("foundation-layout-list.internal.beforeCount", undefined);
    }

    Granite.UI.Foundation.Layouts.register("foundation-layout-list", function(el, config) {
        var collection = $(el);
        
        if (collection.hasClass("list")) return;

        var group = collection.data("foundationModeGroup");
        
        // TODO Currently using inline style so that it override the display but still easily removed without interfering existing classes
        // Need to think how to do it in more foolproof way
        getSameGroupEl("foundation-mode-change", group).css("display", "none"); 

        if (!collection.data("cardView")) {
            //bootstrap collection before applying plugin
            collection.addClass("list");
            collection.wrapInner("<div class='grid-0'>");
        }

        collection.cardView({
            "selectorConfig": {
                "itemSelector": ".foundation-collection-item",
                "headerSelector": "header",
                "dataContainer": "grid-0",
                "enableImageMultiply": true,
                "view": {
                    "selectedItem": {
                        "list": {
                            "cls": "foundation-selections-item selected"
                        },
                        "grid": {
                            "cls": "foundation-selections-item selected"
                        }
                    },
                    "selectedItems": {
                        "list": {
                            "selector": ".foundation-selections-item"
                        },
                        "grid": {
                            "selector": ".foundation-selections-item"
                        }
                    }
                },
                "controller": {
                    "selectElement": {
                        "list": ".foundation-collection-item .select",
                        "grid": ".foundation-collection-item"
                    },
                    "moveHandleElement": {
                        "list": ".foundation-collection-item > .move"
                    },
                    "targetToItem": {
                        "list": function($target) {
                            return $target.closest(".foundation-collection-item");
                        },
                        "grid": function($target) {
                            return $target.closest(".foundation-collection-item");
                        },
                        "header": function($target) {
                            return $target.closest("header");
                        }
                    },
                    "gridSelect": {
                        "cls": "mode-selection"
                    },
                    "selectAll": {
                        "selector": "header > i.select",
                        "cls": "selected"
                    }
                }
            }
        });
        CUI.CardView.get(collection).setDisplayMode(CUI.CardView.DISPLAY_LIST);
        addListener(collection);
        
        var selectionMode = collection.data("foundationSelectionsMode");
        if (selectionMode) {
            CUI.CardView.get(collection).setSelectionModeCount(selectionMode);
        }

    }, function(el, config) {
        Granite.UI.Foundation.Layouts.clean(el);
        
        var collection = $(el);
        
        var group = collection.data("foundationModeGroup");
        getSameGroupEl("foundation-mode-change", group).css("display", "");
        
        removeListener(collection);
    });
})(document, Granite, Granite.$, CUI);
