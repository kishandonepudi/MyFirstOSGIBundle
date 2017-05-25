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
(function(window, document, Granite, $, undefined) {
    "use strict";

    function getPersistence(local) {
        var storage = local ? window.localStorage : window.sessionStorage;
        return {
            get: function(key) {
                return JSON.parse(storage.getItem(key));
            },

            set: function(key, data) {
                storage.setItem(key, JSON.stringify(data));
            },

            remove: function(key) {
                storage.removeItem(key);
            }
        };
    }

    Granite.UI.Foundation.Adapters.register("foundation-clipboard", $(window), function(el) {
        var window = $(el);
        var persistence = getPersistence();

        return {
            get: function(key) {
                return persistence.get(key);
            },
            set: function(key, data) {
                persistence.set(key, data);

                window.trigger("foundation-clipboard-change", {
                    key: key,
                    data: data,
                    timestamp: new Date().getTime()
                });
            },
            remove: function(key) {
                persistence.remove(key);

                window.trigger("foundation-clipboard-change", {
                    key: key,
                    data: null,
                    timestamp: new Date().getTime()
                });
            }
        };
    });
})(window, document, Granite, Granite.$);