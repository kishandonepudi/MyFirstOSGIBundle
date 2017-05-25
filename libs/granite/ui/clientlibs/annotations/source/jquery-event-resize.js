/*
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
 */

// helper event that enables resize events on all HTML elements
// todo: move to granite shared ?

(function ($) {
    // A collection of elements to which the resize event is bound.
    var elements = $([]);

    // An id with which the polling loop can be canceled.
    var timeout_id;

    // Special event definition.
    $.event.special.resize = {
        setup:function () {
            var $elem = $(this);

            // Add this element to the internal collection.
            elements = elements.add($elem);

            // Initialize default plugin data on this element.
            $elem.data('resize', {w:$elem.width(), h:$elem.height()});

            // If this is the first element to which the event has been bound,
            // start the polling loop.
            if (elements.length === 1) {
                poll();
            }
        },
        teardown:function () {
            var $elem = $(this);

            // Remove this element from the internal collection.
            elements = elements.not($elem);

            // Remove plugin data from this element.
            $elem.removeData('resize');

            // If this is the last element to which the event was bound, cancel
            // the polling loop.
            if (!elements.length) {
                clearTimeout(timeout_id);
            }
        }
    };

    // As long as a "resize" event is bound, this function will execute
    // repeatedly.
    function poll() {
        // Iterate over all elements in the internal collection.
        elements.each(function () {
            var $elem = $(this);
            var data = $elem.data('resize');
            var width = $elem.width();
            var height = $elem.height();

            // If element size has changed since the last time, update the element
            // data store and trigger the "resize" event.
            if (width !== data.w || height !== data.h) {
                data.w = width;
                data.h = height;
                $elem.triggerHandler('resize');
            }
        });

        // Poll, setting timeout_id so the polling loop can be canceled.
        timeout_id = setTimeout(poll, 250);
    }

})(jQuery);

