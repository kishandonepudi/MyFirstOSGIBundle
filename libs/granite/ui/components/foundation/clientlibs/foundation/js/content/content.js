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
    
    $(document).on("click.foundation-content", ".foundation-content-control", function(e) {
        e.preventDefault();
        var control = $(this);
        var action = control.data("foundationContentControlAction");
        var contentAPI = control.closest(".foundation-content").adaptTo("foundation-content");
        
        if (action === "back") {
            contentAPI.back();
        } else if (action === "forward") {
            contentAPI.forward();
        }
    });
    
    Granite.UI.Foundation.Adapters.register("foundation-content", ".foundation-content", function(el) {
        var content = $(el);
        var prevs = [];
        var nexts = [];
        
        var detachCurrent = function(content) {
            return content.children(".foundation-content-current")
                .removeClass("foundation-content-current")
                .detach();
        };
        
        var get = function(url) {
            return $.ajax(url, {
                cache: !$.browser.msie // don't cache if IE. See GRANITE-2276
            });
        };
        
        return {
            go: function(url, replace) {
                var self = this;
                return get(url).pipe(function(html) {
                    if (replace) {
                        self.replace(html);
                    } else {
                        self.push(html);
                    }
                });
            },
            /**
             * Refreshes the current content. It will use current document.location to fetch the new html.
             */
            refresh: function() {
                var self = this;
                var url = "" + document.location; // covert it to string
                return get(url).pipe(function(html) {
                    self.replace(html);
                });
            },
            push: function(html) {
                var el = Granite.UI.Foundation.Utils.processHtml(html, ".foundation-content-current");
                
                nexts = [];
                prevs.push(detachCurrent(content));
                
                $("<div class='foundation-content-current'>").append(el).appendTo(content).trigger("foundation-contentloaded");
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            },
            replace: function(html) {
                var el = Granite.UI.Foundation.Utils.processHtml(html, ".foundation-content-current");
                content.children(".foundation-content-current").empty().append(el).trigger("foundation-contentloaded");
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            },
            back: function() {
                var prev = prevs.pop();
                if (!prev) return this;
                
                var clean = Granite.UI.Foundation.Utils.processHtml(prev);
                
                nexts.unshift(detachCurrent(content));
                clean.addClass("foundation-content-current").appendTo(content);
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            },
            forward: function() {
                var next = nexts.shift();
                if (!next) return this;
                
                var clean = Granite.UI.Foundation.Utils.processHtml(next);
                
                prevs.push(detachCurrent(content));
                clean.addClass("foundation-content-current").appendTo(content);
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            }
        };
    });
})(document, Granite, Granite.$);
