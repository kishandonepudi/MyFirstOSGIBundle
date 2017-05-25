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
(function(document, $) {
    "use strict";

    var ns = ".foundation-collection-action";
    
    function toggle(action, show) {
        action.toggleClass("hide", !show);
    }
    
    function isCorrentCount(countConfig, count) {
        if (count === 0 && countConfig === 0) {
            return true;
        }
        if (count > 0 && countConfig === ">0") {
            return true;
        }
        return false;
    }
    
    function isCorrentSelectionCount(selectionConfig, selectionCount) {
        if (selectionCount === 0 && selectionConfig === "none") {
            return true;
        }
        if (selectionCount === 1 && selectionConfig === "single") {
            return true;
        }
        if (selectionCount >= 1 && selectionConfig === "multiple") {
            return true;
        }
        return false;
    }
    
    function isCommon(action, collection) {
        var rels = collection.find(".foundation-selections-item").toArray()
            .map(function(item) {
                var rel = $(item).find(".foundation-collection-quickactions").data("foundationCollectionQuickactionsRel") || "";
                rel = rel.trim();
                return rel.length ? rel.split(/\s+/) : [];
            });
        
        var noRelAtAll = rels.every(function(v) { return v.length === 0; });
        if (noRelAtAll) return true;
        
        return rels.every(function(v) {
            return !v.every(function(rel) { return !action.hasClass(rel); });
        });
    }
    
    function isActivate(action, config, collection) {
        var result = true;
        
        if (config.hasOwnProperty("activeCount")) {
            var count = collection.find(".foundation-collection-item").length;
            result = isCorrentCount(config.activeCount, count);
        }
        
        if (result && config.hasOwnProperty("activeSelectionCount")) {
            var api = collection.adaptTo("foundation-selections");
            result = isCorrentSelectionCount(config.activeSelectionCount, api.count());
        }
        
        if (result) {
            result = isCommon(action, collection);
        }
        
        return result;
    }
    
    $(document).on("foundation-contentloaded" + ns, function(e) {
        $(".foundation-collection-action", e.target).each(function() {
            var action = $(this);
            var config = action.data("foundationCollectionAction");
            
            if (!config) return;
            
            var collection = $(config.target);
            
            if (!collection.length) return;
            
            toggle(action, isActivate(action, config, collection));
        });
    });
    
    $(document).on("foundation-selections-change" + ns, ".foundation-collection", function(e) {
        var collection = $(this);
        
        $(".foundation-collection-action").each(function() {
            var action = $(this);
            var config = action.data("foundationCollectionAction");
            
            if (!config || !collection.is(config.target)) return;
            
            toggle(action, isActivate(action, config, collection));
        });
    });
})(document, Granite.$);
