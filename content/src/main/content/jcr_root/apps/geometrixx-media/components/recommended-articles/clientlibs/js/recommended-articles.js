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

jQuery(function ($) {
    if (window.CQ_Analytics) {

        var initializeRecommendedArticles = function () {

            $("div.personalized-articles").each(function () {
                var $currentSection = $(this);
                var tagCloudManager = ClientContext.get("tagcloud");
                if (tagCloudManager === null) {
                    return;
                }
                var tagCloudObj = tagCloudManager.data;

                // Build an array to sort the tag object properties
                var tagsSortedByValue = [];
                for (tag in tagCloudObj) {
                    tagsSortedByValue.push([tag, tagCloudObj[tag]]);
                }

                // Sort the tags by highest value (most prevelant in browsing history)
                tagsSortedByValue.sort(function (a, b) {
                    return b[1] - a[1];
                });

                // We're only concerned with the actual tags and their order
                var tagSelectorString = "";

                for (var i = 0; i < 2 && i < tagsSortedByValue.length; i++) {
                    // Double encoded URI component so sling does not misinterpret it
                    tagSelectorString += encodeURIComponent(encodeURIComponent(tagsSortedByValue[i][0])) + ".";
                }

                var recommendationUrl = $currentSection.data("path") + tagSelectorString + "html";
                $currentSection.load(recommendationUrl, function () {
                    if (window.picturefill) {
                        window.picturefill($currentSection);
                    }
                });
            });
        };


        //first load is done when all stores are loaded
        if (CQ_Analytics.CCM.areStoresInitialized) {
            initializeRecommendedArticles.call(this);
        } else {
            CQ_Analytics.CCM.addListener("storesinitialize", initializeRecommendedArticles);
        }
    }
});