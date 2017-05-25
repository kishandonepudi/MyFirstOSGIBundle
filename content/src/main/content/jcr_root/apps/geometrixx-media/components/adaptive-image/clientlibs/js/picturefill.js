/*
 * Adobe Systems Incorporated
 * Modified: October 30th, 2012
 *
 * Picturefill - Responsive Images that work today. (and mimic the proposed Picture element with divs).
 * Author: Scott Jehl, Filament Group, 2012 | License: MIT/GPLv2
 */

(function ($, w) {

    // Enable strict mode
    "use strict";

    w.picturefill = function (context) {
        var undefined;
        if (context === undefined) {
            context = $("body");
        }

        $("div[data-picture]", context).each(function () {
            var currentPicture = this;
            var matches = [];
            $("div[data-media]", currentPicture).each(function () {
                var media = $(this).attr("data-media");
                if (!media || ( w.matchMedia && w.matchMedia(media).matches )) {
                    matches.push(this);
                }
            });

            var $picImg = $("img", currentPicture).first();

            if (matches.length) {
                if ($picImg.size() === 0) {
                    var $currentPicture = $(currentPicture);
                    $picImg = $("<img />").attr("alt", $currentPicture.attr("data-alt")).appendTo($currentPicture);
                }
                $picImg.attr("src", matches.pop().getAttribute("data-src"));
            } else {
                $picImg.remove();
            }
        });
    };

    // Run on debounced resize and domready
    $(function () {
        w.picturefill();
    });

    $(w).on("debouncedresize", function () {
        w.picturefill();
    });

}($CQ, this));