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
        function initalizeButtons() {
            if ($(window).width() <= 480) {
                $(".userinfo ul li a").each(function(item) {
                    $(this).addClass("btn");
                });
            } else {
                $(".userinfo ul li a").each(function(item) {
                    $(this).removeClass("btn");
                });
            }
        }

        $(window).on("resize", function() {
            initalizeButtons();
        });

        initalizeButtons();
    });

})($CQ, undefined);