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
(function(window, document, $) {
    "use strict";
    
    var ns = ".foundation-admin-rail-toggle";
    
    $(document).fipo("tap" + ns, "click" + ns, ".foundation-admin-rail-toggle", function(e) {
        e.preventDefault();
        var toggle = $(this),
            railSelector = toggle.data("target"),
            rail = $(railSelector);
        rail.toggleClass("closed");
        $(window).resize();

        CUI.util.state.save(railSelector, "class");
    });
    
    // Prevent default for touch
    $(document).finger("click" + ns, ".foundation-admin-rail-toggle", function(e) {
        e.preventDefault();
    });
})(window, document, Granite.$);