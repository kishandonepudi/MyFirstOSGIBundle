/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

$CQ(document).ready(function () {
    $CQ(".post-summary").each(function () {
        var chars = 160;
        var breakpoint = $CQ(this).text().substr(0, chars).lastIndexOf(" ");
        var shortText = $CQ(this).text().substring(0, breakpoint) + "...";
        $CQ(this).text(shortText);
        var postHref = $CQ(this).parents('.topic').find('.post-link').attr('href');
        var readMore = $CQ('<a>read more</a>');
        $CQ(readMore).attr('href', postHref);
        $CQ(this).append(readMore);
    });
});

$CQ(document).ready(function () {
    /* just for this demo, doesn't work in real live */
    var availableTags = [];
    $CQ('.topic[data-subject]').each(function () {
        availableTags.push($CQ(this).data('subject'));
    });
    $CQ('input.askQuestionField').autocomplete({
        source:availableTags
    });
    var timeOutId = -1;
    $CQ('input.askQuestionField').on('change keydown autocompleteselect', function () {
        var $that = $CQ(this);
        if (timeOutId != -1) window.clearTimeout(timeOutId);
        timeOutId = window.setTimeout(function () {
            var searchString = $that.val().toLowerCase().trim();
            $CQ('.topics ul li').each(function () {
                var subject = $CQ(this).find('.topic[data-subject]').data('subject').toLowerCase().trim();
                var content = subject + $CQ(this).find('.topic[data-content]').data('content').toLowerCase().trim();
                if (content.length < 5 || content.indexOf(searchString) != -1) {
                    $CQ(this).fadeIn();
                } else {
                    $CQ(this).fadeOut();
                }
            });
        }, 500);
    });
});

$CQ(document).ready(function () {
    $CQ('form a.clear-form').click(function () {
        $CQ(this).parents('form').find('input[type=text]').each(function () {
            $CQ(this).val('');
            $CQ(this).trigger('change');
        });
    });
});