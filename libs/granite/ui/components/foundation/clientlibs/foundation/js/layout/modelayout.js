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
    
    function isGroup(el, config, groupName) {
        if (groupName) {
            return config.group === groupName;
        } else {
            return true;
        }
    }
    
    Granite.UI.Foundation.Layouts.register("foundation-layout-mode", function(el, config) {
        var container = $(el);
        
        $(document).on("foundation-mode-change.foundation-layout-mode", function(e, mode, group) {
            if (!isGroup(container, config, group)) return;

            container.children(":not(.mode-" + mode + ")").addClass("hide").removeClass("show");
            container.children(".mode-" + mode).addClass("show").removeClass("hide");
        });        
    });
})(document, Granite, Granite.$);