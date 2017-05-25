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
    
    // NOTE: foundation-layout-card is now exclusive to manage the layout of foundation-collection only
    
    var ns = ".foundation-layout-card";
    
    function addListener(collection) {
        $(document).on("foundation-mode-change" + ns, function(e, mode, group) {
            if (mode !== "default" && mode !== "selection") return;
            if (collection.data("foundationModeGroup") !== group) return;

            CUI.CardView.get(collection).setGridSelectionMode(mode === "selection");
            collection.closest(".foundation-collection-container").toggleClass("mode-selection", mode === "selection");
        });

        collection.on("change:selection" + ns, function(e) {
            collection.trigger("foundation-selections-change");
        });
    }
    
    function removeListener(collection) {
        $(document).off("foundation-mode-change" + ns);
        collection.off("change:selection" + ns);
    }
    
    Granite.UI.Foundation.Layouts.register("foundation-layout-card", function(el, config) {

        var collection = $(el);
        
        if (collection.hasClass("grid")) return;

        collection.wrapInner("<div class='grid-0'>");
        collection.closest(".foundation-collection-container").addClass("card");

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

        CUI.CardView.get(collection).setDisplayMode(CUI.CardView.DISPLAY_GRID);
        addListener(collection);

        if (config.selectionMode) {
            CUI.CardView.get(collection).setGridSelectionMode(true);
        }
        
        var selectionMode = collection.data("foundationSelectionsMode");
        if (selectionMode) {
            CUI.CardView.get(collection).setSelectionModeCount(selectionMode);
        }
    }, function(el, config) {
        Granite.UI.Foundation.Layouts.clean(el);

        var collection = $(el);
        collection.closest(".foundation-collection-container").removeClass("card");
        removeListener(collection);
    });
})(document, Granite, Granite.$, CUI);
