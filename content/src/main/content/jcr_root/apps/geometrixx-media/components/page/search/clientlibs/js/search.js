/*
 ADOBE CONFIDENTIAL
 __________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function($) {

    $(function() {

        var duration = 400;

        function focusIn() {
            var search = $("#globalsearch");
            if (search.hasClass("searchmode")) {
                return;
            }
            // for some reason we need to prime the toggle to happen...
            search.addClass("searchmode", duration);
            $("header .topnav nav ul").addClass("searchmode", duration, function(event) {
                $("#sp-searchtext").focus();
            });
        }

        function focusOut() {
            $("header .topnav nav ul").removeClass("searchmode", duration);
            $("#globalsearch").removeClass("searchmode", duration);
            $(document).focus();
        }

        $("#globalsearch").on("mouseup", focusIn);
        $("#sp-searchtext").on("focusout", focusOut);

        // for some reason we have to prime the transition...
        // need to figure this out at some point to clean up the code
        $("#globalsearch").addClass("searchmode", 0);
        $("header .topnav nav ul").addClass("searchmode", 0);
        $("header .topnav nav ul").removeClass("searchmode", 0);
        $("#globalsearch").removeClass("searchmode", 0);
    });

})(Granite.$, undefined);