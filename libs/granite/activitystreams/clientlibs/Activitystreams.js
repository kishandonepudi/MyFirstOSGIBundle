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
_g.Activitystreams = function($) {

    /**
     * internal debug flag
     * @type {Boolean}
     * @private
     */
    var _debug = true;

    /**
     * internal debug logging
     */
    function log_debug() {
        if (_debug) {
            console.log(arguments);
        }
    }

    return {

        /**
         * Appends a new activity to a stream. If no stream is specified the activity will be appended to the
         * request user's default stream.
         *
         * @param {String} streamPath path to stream
         * @param {Object} data activity data
         * @param {Object} options (optional) Additional options:
         *        <pre>
         *            {
         *            scope: scope for callbacks
         *            success: function(result object, statusText, jqXHR);
         *            error: function(jqXHR, statusText, errorThrown);
         *            }
         *        </pre>
         * @return void
         */
        append: function(streamPath, data, options) {
            log_debug("Activitystreams.append(", arguments, ")");
            if (!streamPath) {
                console.log("error: missing argument: streamPath");
                return;
            }
            if (!data) {
                console.log("error: missing argument: data");
                return;
            }
            options = $.extend({}, options);
            _g.$.ajax({
                type: 'POST',
                url: streamPath,
                data: JSON.stringify(data),
                dataType: "json",
                jsonp: false,
                contentType: "application/json;charset=UTF-8",
                success: function(data, statusText, jqXHR) {
                    log_debug("Activitystreams.append.success(", arguments, ")");
                    if (options.success) {
                        options.success.apply(options.scope || options, arguments);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    log_debug("Activitystreams.append.error(", arguments, ")");
                    if (options.error) {
                        options.error.apply(options.scope || options, arguments);
                    }
                }

            });

        },

        /**
         * Appends a new activity to a stream. If no stream is specified the activity will be appended to the
         * request user's default stream.
         *
         * @param {Object} containerPath path of the container that will hold the new stream
         * @param {String} name name of the new stream
         * @param {Object} options (optional) Additional options:
         *        <pre>
         *            {
         *            scope: scope for callbacks
         *            success: function(result object, statusText, jqXHR);
         *            error: function(jqXHR, statusText, errorThrown);
         *            }
         *        </pre>
         * @return void
         */
        createStream: function(containerPath, name, options) {
            log_debug("Activitystreams.createStream(", arguments, ")");
            if (!containerPath) {
                console.log("error: missing argument: containerPath");
                return;
            }
            if (!name) {
                console.log("error: missing argument: name");
                return;
            }
            options = $.extend({}, options);
            _g.$.ajax({
                type: 'POST',
                url: containerPath + ".activitystreams",
                data: {name: name},
                dataType: "json",
                jsonp: false,
                success: function(data, statusText, jqXHR) {
                    log_debug("Activitystreams.createStream.success(", arguments, ")");
                    if (options.success) {
                        options.success.apply(options.scope || options, arguments);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    log_debug("Activitystreams.createStream.error(", arguments, ")");
                    if (options.error) {
                        options.error.apply(options.scope || options, arguments);
                    }
                }

            });

        }
    }
}(jQuery);