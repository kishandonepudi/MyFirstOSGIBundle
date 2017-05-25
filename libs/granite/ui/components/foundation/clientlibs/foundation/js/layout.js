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
    
    Granite.UI.Foundation.Layouts = Granite.UI.Foundation.Layouts || (function() {
        function Registry() {
            this.layouter = {};
            this.cleaner = {};
        }
        Registry.prototype = {
            register: function(name, layouter, cleaner) {
                this.layouter[name] = layouter;
                this.cleaner[name] = cleaner;
            },
            has: function(name) {
                return this.layouter.hasOwnProperty(name);
            },
            hasCleaner: function(name) {
                return this.cleaner.hasOwnProperty(name);
            },
            get: function(name) {
                return this.has(name) ? this.layouter[name] : undefined;
            },
            getCleaner: function(name) {
                return this.hasCleaner(name) ? this.cleaner[name] : undefined;
            },
            layout: function(el) {
                var $el = $(el);
                var config = $el.data("foundationLayout");
                var layouter = this.get(config.name);
                if (layouter) {
                    layouter(el, config);
                }

                // show the right toggle button
                this.displayToggle($el.data("foundationLayout"));
            },
            displayToggle: function (layout) {
                var $toggleCon = $('.foundation-admin-layouttoggle'),
                    $buttons = $toggleCon.find('button');

                $buttons.each(function (i, e) {
                    var $e = $(e),
                        layoutToggle = $e.data('foundation-admin-layouttoggle-layout');

                    if (layoutToggle.name !== layout.name) {
                        $e.removeClass("hide");
                    } else {
                        $e.addClass("hide");
                    }
                });
            },
            switchLayout: function(el, newConfig) {
                var $el = $(el),
                    prevConfig = $el.data("foundationLayout");

                if (prevConfig.name === newConfig.name) {
                    return;
                }
                
                if (prevConfig) {
                    (this.getCleaner(prevConfig.name) || this.clean)(el, prevConfig);
                }
                
                $el.addClass(newConfig.name);
                $el.data("foundationLayout", newConfig);
                this.layout(el);
            },
            clean: function(el) {
                var $el = $(el);
                var config = $el.data("foundationLayout");
                $el.removeClass(config.name);
                $el.data("foundationLayout", null);
            }
        };
        
        return new Registry();
    })();
    
    $(document).on("foundation-contentloaded.foundation-layout", function(e) {
        $(e.target).filter("[data-foundation-layout]").add($("[data-foundation-layout]", e.target)).each(function() {
            Granite.UI.Foundation.Layouts.layout(this);
        });
    });
})(document, Granite, Granite.$);
