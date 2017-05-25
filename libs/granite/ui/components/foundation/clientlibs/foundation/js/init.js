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
Granite = window.Granite || {};
Granite.UI = Granite.UI || {};
Granite.UI.Foundation = Granite.UI.Foundation || {};

(function(document, $) {
    "use strict";

    // Wraps cui-contentloaded event
    
    $(document).on("cui-contentloaded.foundation", function(e, options) {
        if (options && options._foundationcontentloaded) return;
        
        $(e.target).trigger("foundation-contentloaded", {
            _cuicontentloaded: true
        });
    });
    
    $(document).on("foundation-contentloaded.foundation", function(e, options) {
        if (options && options._cuicontentloaded) return;
        
        $(e.target).trigger("cui-contentloaded", {
            _foundationcontentloaded: true
        });
    });
})(window.document, Granite.$);