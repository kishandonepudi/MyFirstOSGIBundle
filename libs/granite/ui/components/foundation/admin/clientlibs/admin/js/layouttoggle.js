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
(function(document, Granite, $) {
    "use strict";

    var $doc = $(document),
        stateSelector = ".foundation-collection";

    function switchLayout(target, layout, button) {
        Granite.UI.Foundation.Layouts.switchLayout(target, layout);
    }

    $doc.fipo("tap.foundation-admin-layouttoggle", "click.foundation-admin-layouttoggle", ".foundation-admin-layouttoggle button", function(e) {
        var button = $(this),
            parent = button.parent(),
            layout = button.data("foundationAdminLayouttoggleLayout"),
            target = $(parent.data("target")).get(0);

        switchLayout(target, layout, button);

        CUI.util.state.save(stateSelector, 'class');
    });
    
})(document, Granite, Granite.$);
