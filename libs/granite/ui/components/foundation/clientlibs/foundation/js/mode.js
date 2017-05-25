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
(function(document, $, undefined) {
    "use strict";

    var ns = ".foundation-mode";

    // Exclusively using click event here. See GRANITE-2191
    $(document).on("click" + ns, ".foundation-mode-change", function(e) {
        e.preventDefault();
        
        var button = $(this);
        var mode = button.data("foundationModeValue");
        var group = button.data("foundationModeGroup");

        button.trigger("foundation-mode-change", [mode, group]);
    });
})(document, Granite.$);
