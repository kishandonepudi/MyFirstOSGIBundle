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
        var $signIn = $("header .signin");
        var $signInBtn = $(".authenticate");
        var $nav = $("header .topnav nav");
        var $menuBtn = $(".menu-dropdown");

        // the following bit of script is more for ppl who demo
        // and don't demo on devices.  When they resize the browser
        // set things back to a normal state
        var width = $(window).width();
        $(window).on("resize", $.proxy(function(event) {
            if (width != $(window).width() ) {
                width = $(window).width();
                $nav.show();
                if ($(window).width() < 767) {
                    $nav.hide();
                }
            }
        }, this));

        $menuBtn.on("click", function(event) {
            $signIn.removeClass("show");
            $nav.toggle();
        });

        $signInBtn.on("click", function(event) {
            $nav.hide();
            $signIn.toggleClass("show");
        });
    });

})(Granite.$, undefined);