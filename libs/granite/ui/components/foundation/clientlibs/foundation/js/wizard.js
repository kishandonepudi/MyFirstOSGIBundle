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
    
    var ns = ".foundation-wizard";
    
    function cancel(control) {
        var href = control.data("href");
        
        if (!href) return;

        window.location.href = "" + href;
    }
    
    $(document).fipo("tap" + ns, "click" + ns, ".foundation-wizard-control", function(e) {
        var control = $(this);
        var action = control.data("foundationWizardControlAction");
        
        if (action === "cancel") {
            e.preventDefault();
            cancel(control);
        }
    });
    
})(window, document, Granite.$);
