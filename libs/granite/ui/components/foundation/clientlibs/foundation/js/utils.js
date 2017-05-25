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
(function(document, Granite, $, undefined) {
    "use strict";
    
    /**
     * @namespace
     */
    Granite.UI.Foundation.Utils = Granite.UI.Foundation.Utils || (function() {
        var existingScripts = [];
        
        var removeEl = function(newContent, selector, comparator, existings) {
            existings = existings || $(selector);
            
            newContent.find(selector).each(function() {
                var item = this;
                if (existings.is(function() { return comparator(this, item); })) {
                    $(item).remove();
                }
            });
        };
        
        /**
         * Merge array2 into array1.
         * 
         * @returns array1
         */
        var mergeScript = function(array1, array2) {
            if (array1.length === 0) {
                $.each(array2, function() {
                    if ($(this).prop("src")) {
                        array1.push(this);
                    }
                });
                return array1;
            }
            
            $.each(array2, function() {
                var a2 = this;
                var a2src = $(a2).prop("src");
                
                if (!a2src) return;
                
                var found = false;
                
                $.each(array1, function() {
                    var a1src = $(this).prop("src");
                    if (a1src === a2src) {
                        found = true;
                        return false;
                    }
                });
                
                if (!found) {
                    array1.push(a2);
                }
            });
            return array1;
        };
        
        /**
         * @scope Granite.UI.Foundation.Utils
         */
        return {
            /**
             * Process the given html so that it is suitable to be injected to the DOM.
             * Currently this method is trying to clean up against duplicate js and css that are already loaded.
             * 
             * @param {String|jQuery} html
             * @param {String} [selector] Only extract out the html under the given selector (inclusive). If no element matchs the selector or this parameter is falsy then html is process as is.  
             * @returns {String|jQuery} The result of the process
             */
            processHtml: function(html, selector) {
                var container;
                if (html.jquery) {
                    container = html;
                } else {
                    var div = document.createElement("div");
                    div.innerHTML = html;
                    container = $(div);
                }
                
                removeEl(container, "script", function(oldEl, newEl) {
                    var newSrc = $(newEl).prop("src");
                    
                    // TODO decide what to do with inline script
                    // this is mainly CQURLInfo, and will cause issue if the component depend on it and the value is overwritten
                    // for now just include it
                    if (!newSrc) return false;

                    return $(oldEl).prop("src") === newSrc;
                    
                }, $(mergeScript(existingScripts, $("script"))));
                
                removeEl(container, "link", function(oldEl, newEl) {
                    var oldLink = $(oldEl);
                    var newLink = $(newEl);
                    
                    if (oldLink.prop("rel") !== "stylesheet" || newLink.prop("rel") !== "stylesheet") {
                        return false;
                    } else {
                        return oldLink.prop("href") === newLink.prop("href");
                    }
                });
                
                var content = container.find(selector);
                
                if (html.jquery) {
                    if (selector) {
                        return content.length ? content : container;
                    } else {
                        return container;
                    }
                } else {
                    if (selector) {
                        return content.length ? content[0].outerHTML : container[0].innerHTML;
                    } else {
                        return container[0].innerHTML;
                    }
                }
            }
        };
    })();
})(document, Granite, Granite.$);
