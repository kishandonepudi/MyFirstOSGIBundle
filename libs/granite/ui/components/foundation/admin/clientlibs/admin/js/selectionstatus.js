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
    
    function getElHavingTarget(selector, target) {
        return $(selector).filter(function() {
            return $($(this).data("target")).filter(target).length;
        });
    }
    
    function createTemplater(template) {
        return function(data) {
            if (!template) return "";
            return template.replace("{{count}}", data.count);
        };
    }
    
    function updateStatus(status, collection) {
        var templater = createTemplater(status.data("template"));
        var selectionsAPI = collection.adaptTo("foundation-selections");
        
        status.html(templater({
            count: selectionsAPI.count()
        }));
    }
    
    $(document).on("foundation-selections-change.foundation-admin-selectionstatus", ".foundation-collection", function() {
        var collection = $(this);
        
        getElHavingTarget(".foundation-admin-selectionstatus", collection).each(function() {
            var status = $(this);
            updateStatus(status, collection);
        });
    });
})(document, Granite.$);
