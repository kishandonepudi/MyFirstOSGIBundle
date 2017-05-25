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
(function(Granite, $) {
    "use strict";
    
    Granite.UI.Foundation.Adapters = Granite.UI.Foundation.Adapters || (function() {
        function Registry() {
            this.map = {};
        }
        Registry.prototype = {
            /**
             * Registers an adapter for the given type and selector.
             * @param String type
             * @param String selector
             * @param Function adapter
             */
            register: function(type, selector, adapter) {
                this.map[type] = {
                    type: type,
                    selector: selector,
                    adapter: adapter
                };
            },
            /**
             * Checks if the registry has an adapter with the given type.
             * @param String type
             */
            has: function(type) {
                return this.map.hasOwnProperty(type);
            },
            /**
             * Returns adapter config for the given type.
             * The config is an object having the following properties:
             * type: String
             * selector: String
             * adapter: Function
             * 
             * @param String type
             */
            get: function(type) {
                return this.has(type) ? this.map[type] : undefined;
            },
            /**
             * Adapts the given element to the given type.
             * Only the element matching the selector--specified during adapter registration--will be adapted.
             * Returns undefined when there is no matching adapter.
             * 
             * @param DOMElement el
             * @param String type
             */
            adapt: function(el, type) {
                var $el = $(el);
                
                return $el.data(type) || (function($el, config) {
                    if (!config) return;
                    
                    if ($el.is(config.selector)) {
                        var api = config.adapter(el[0]);
                        $el.data(config.type, api);
                        return api;
                    }
                })($el, this.get(type));
            }
        };
        
        return new Registry();
    })();
    
    /**
     * Returns the API related to the type for the first element in the jQuery collection.
     * e.g.
     * var collectionAPI = $(".foundation-collection").adaptTo("foundation-collection");
     * 
     * @param String type The type the current element will be adapted to.
     */
    $.fn.adaptTo = $.fn.adaptTo || function(type) {
        return Granite.UI.Foundation.Adapters.adapt(this, type);
    };
})(Granite, Granite.$);
