/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */

/**
 * The <code>GraniteClientLibraryManager</code> is used to dynamically include
 * scripts based on channels.
 *
 * @static
 * @class GraniteClientLibraryManager
 */
if (typeof GraniteClientLibraryManager == "undefined") {
    GraniteClientLibraryManager = {

        /**
         * global debug flag
         */
        debug: false,

        /**
         * List of provided scripts to avoid multiple inclusion
         */
        scripts: {},

        /**
         * Indicates the first include.
         */
        initialInclude: true,

        /**
         * Indicates if the window is loaded, i.e. if its onload event has been called.
         */
        windowLoaded: false,

        /**
         * The context path used on the server.
         */
        contextPath: null,

        /**
         * The XHR hook
         */
        hook: null,


        /**
         * empty callback
         * @private
         */
        channelCB: function(){
            return ""
        },

        /**
         * Sets the channel detection callback. The function takes no
         * arguments and needs to return the name of the detected channel.
         *
         * @param cb the callback function
         */
        setChannelCB: function(/*function*/ cb) {
            this.channelCB = cb;
        },

        //TODO remove href test and replace console.log by CQ.Log when bug #32879 is fixed
        isDebug: function(/* boolean */ debug) {
            var href = document.location.href;
            return (typeof console != "undefined") &&
                    (debug || this.debug) &&
                    href.indexOf("debugConsole=true") != -1;
        },

        /**
         * Writes the given scripts to the document depending on the
         * script channels.
         *
         * The given scripts are objects:
         * {
         * // path of script
         * p: ""
         *
         * // channels of script
         * c: []
         * }
         *
         * @param scripts
         */
        write: function(/*Script[]*/ scripts, debug) {
            debug = this.isDebug(debug);
            // get channel
            var channel = this.channelCB();
            if (!channel) {
                channel = "default";
            }
            if (debug) console.log("LibraryManager: detected channel: " + channel);

            for (var i=0;i<scripts.length; i++) {
                var script = scripts[i];
                if (!this.scripts[script.p]) {
                    this.scripts[script.p] = script;
                    if (debug) console.log("LibraryManager: processing script", script.p, script);
                    if (this.isIncluded(channel, script.c, debug)) {
                        this.includeScript(script.p, debug);
                    }
                }
            }
        },

        /**
         * Tests the given channel is included by the array of given channels
         *
         * @param {String} channel channel to test
         * @param {String[]} channels script channels
         * @return {Boolean} true if included
         */
        isIncluded: function(/* String */ channel, /* String[] */ channels, /* boolean */ debug) {
            if (channels.length == 0) {
                if (debug) console.log("LibraryManager: ...accepted. no channels defined");
                return true;
            }
            var notChannel = "!" + channel;
            var accept = false;
            var cnt = 0;
            for (var j=0; j<channels.length; j++) {
                var c = channels[j];
                if (c.charAt(0) == '!') {
                    if (c == notChannel) {
                        if (debug) console.log("LibraryManager: ...rejected. channel excluded: ", c);
                        return false;
                    }
                } else {
                    if (c == channel) {
                        if (debug) console.log("LibraryManager: ...accepted. channel included: ", c);
                        accept = true;
                    }
                    cnt++;
                }
            }
            if (cnt == 0) {
                if (debug) console.log("LibraryManager: ...accepted. no more channels after exclusion ");
                accept = true;
            }
            if (!accept && debug) console.log("LibraryManager: ...rejected.");
            return accept;
        },

        /**
         * Include the given script using document.write()
         * @param {String} path path of the script
         * @param {Boolean} debug
         */
        includeScript: function(/* String */ path, /* boolean */ debug) {
            var ext = path;
            var idx = ext.indexOf('?');
            if (idx > 0) {
                ext = ext.substring(0, idx);
            }
            ext = ext.substring(ext.lastIndexOf(".")+1);

            if (this.initialInclude) {
                // first call of includeScript
                this.initialInclude = false;
                if (typeof G_XHR_HOOK != "undefined" &&
                        Object.prototype.toString.call(G_XHR_HOOK) === "[object Function]") {
                    this.hook = G_XHR_HOOK;
                }
                this.contextPath = this.detectContextPath();
                var man = this;
                if (window.addEventListener) {
                    window.addEventListener("load", function() {man.windowLoaded = true;}, false);
                }
                else if (window.attachEvent) {
                    window.attachEvent("onload", function() {man.windowLoaded = true;});
                }
            }

            if (this.hook) {
                var p = {"url": path, "method": "GET"};
                try {
                    var out = this.hook(p);
                    if (out) path = out.url;
                } catch(e) {
                    if (debug) console.log("LibraryManager: error during CQ_XHR_HOOK call: ", e.message);
                }
            }

            if (this.contextPath) {
                if (path.indexOf("/") == 0 && path.indexOf(this.contextPath + "/") != 0) {
                    path = this.contextPath + path;
                }
            }

            if (ext == "js") {
                if (debug) console.log("LibraryManager: --> writing js include: ", path);

                if (this.windowLoaded) {
                    /*
                    Even evaluating the response is much more slower than appendChild would be
                    this seems to be the only way to load the script sunchronously in IE.
                     */
                    try {
                        var request = document.all ?
                                new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
                        request.open("GET", path, false);
                        request.send(null);
                        if (window.execScript) {
                            // "eval" for IE in global scope
                            window.execScript(request.responseText);
                        }
                        else {
                            // "call" with first arg null runs in global scope
                            eval.call(null, request.responseText);
                        }
                    }
                    catch(err) {
                        if (debug) console.log("LibraryManager: --> evaluating js include failed: ", path);
                    }
                }
                else {
                    /*
                    Initial load: use document.write - appendChild would not be synchronous in IE
                    and eval used above is very slow.
                     */
                    document.writeln('<script src="' + path + '" type="text/javascript"></script>');
                }
            } else if (ext == "css") {
                /*
                Always append link nodes to the header. Otherwise (by using document.write) links written
                directly to a component's HTML would be removed when deleted. If there would be more
                pars using the same clientlib the lib would be gone if the first par that has rendered
                the tag would be deleted.
                 */
                var head = document.getElementsByTagName("head") || document.getElementsByTagName("*");
                head = head[0];
                var n = document.createElement("link");
                n.type = "text/css";
                n.rel = "stylesheet";
                n.href = path;
                head.appendChild(n);
                if (debug) console.log("LibraryManager: --> writing css include: ", path);
            } else {
                // error ?
                if (debug) console.log("LibraryManager: --> unsupported extension: ", path);
            }
        },

        detectContextPath: function() {
            var scripts = document.getElementsByTagName("script");
            var regexp = /\/etc\/clientlibs\/foundation\/librarymanager\/*\.js$/;
            for (var i = 0; i < scripts.length; i++) {
                // in IE the first script is not the expected widgets js: loop
                // until it is found
                var path = scripts[i].src;
                if (path.indexOf("?") >= 0) {
                    path = path.substring(0, path.indexOf("?")); // remove query
                }
                if (path.match(regexp)) {
                    path = path.replace(/.*\:[\/][\/]/, ""); // remove protocol
                    path = path.substring(path.indexOf("/")); // remove host[:port]
                    path = path.replace(regexp, ""); // remove script url
                    this.contextPath = path;
                    break;
                }
            }
        }

    };

    CQClientLibraryManager = GraniteClientLibraryManager
}
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */

(function (window, undefined) {

    function getParameter(name)
    {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if(results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    GraniteClientLibraryManager.setChannelCB(function(){
        var cachedChannel = undefined; // TODO: to avoid checking the regex multplie times

        var channels = [
            {
                channel: "ie6", // or lower
                match: /MSIE ([0-6]\.[\.0-9]{0,})/i
            }, {
                channel: "touch",
                match: /android.+mobile|android.+chrome|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|pad|pod|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
            }, {
                channel: "extjs", // we check for desktop operating systems
                match: /(windows|linux|os\s+[x9]|solaris|bsd)/i
            }
        ];

        // look for channel in query string
        var forcedChannel = getParameter("forceChannel");
        if (forcedChannel) {
            return forcedChannel;
        }

        var ua = navigator.userAgent;
        for (var i=0; i<channels.length; i++) {
            var c = channels[i];
            if(c.match.test(ua)) {
                return c.channel;
            }
        }
        return "";
    });

}(window));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */

/**
 * <p>A helper class providing load time statistics.</p>
 * <p>To enable go to Apache Felix Web Management Console > Configuration >
 * CQ HTML Library Manager and enable "Timing". To show the statistics hit
 * [ctr][shift][u]. Note that the logs are not added continuously but before
 * they are displayed. Therefore wait until the page has been loaded before
 * displaying the logs.</p>
 * <p>In Content Finder set the focus to the content page before displaying
 * the logs in order to display the statistics of the content page.</p>
 * @static
 * @singleton
 * @class GraniteTiming
 */
GraniteTiming = function() {

    return {

        // private
        stamps : null,
        pageRenderStart: null,
        lastTimes: {},

        init: function() {
            this.pageRenderStart = new Date();
            this.lastTimes["default"] = new Date();
            this.stamps = "";

            // attach window.onload
            var oldonload = window.onload;
            if (typeof window.onload != 'function') {
                window.onload = GraniteTiming.stampOnLoad;
            } else {
                window.onload = function() {
                    if (oldonload) {
                        oldonload();
                    }
                    GraniteTiming.stampOnLoad();
                };
            }

            // attach window.document.onkeydown = GraniteTiming.showDiv;
            var oldonkeydown = window.document.onkeydown;
            if (typeof window.document.onkeydown != 'function') {
                window.document.onkeydown = GraniteTiming.showDiv;
            } else {
                window.document.onkeydown = function(e) {
                    if (oldonkeydown) {
                        oldonkeydown(e);
                    }
                    GraniteTiming.showDiv(e);
                };
            }
        },

        /**
         * Logs the specified text and the duration since the last entry of the
         * same ID. The usage of IDs allows to have nested log blocks.
         * @param {String} text The text to log
         * @param {String} id The ID of the log block e.g. a method name. If undefined
         *                    the default block is used.
         * @param {Boolean} reset True to set the start time of the block of the specified ID to 0
         */
        stamp: function(text, id, reset) {
            if (!id) id = "default";
            var lastTime = this.lastTimes[id];
            var now = new Date();
            var t;
            if (reset || lastTime == undefined) {
                t = "&nbsp;---";
            }
            else {
                t = now - lastTime;
                t = (t < 1000 ? (t < 100 ? (t < 10 ? "&nbsp;&nbsp;&nbsp;" : "&nbsp;&nbsp;") : "&nbsp;") : "") + t;
            }
            var s = t + " / " + (now - this.pageRenderStart) + " ms " + "&ndash; " + text;
            this.lastTimes[id] = now;
            this.stamps += (this.stamps) ? "," + s : s;
        },

        stampOnLoad: function() {
            GraniteTiming.stamp("Complete document loaded");
            // "old onload" has been executed before, so we should be able to safely set
            // the onload handler to null, preventing memory from leaking on IE
            window.onload = null;
        },

        writeDiv: function() {
            var timingDiv = window.document.createElement("div");
            var style = timingDiv.style;
            timingDiv.id = "cqTiming";
            style.margin = "0 auto 0 auto";
            style.borderBottom ="1px solid #000000";
            style.marginBottom = "5px";
            style.fontSize = "small";
            style.fontFamily = "monospace";
            style.backgroundColor = "#000000";
            style.color = "#ffffff";
            style.position = "absolute";
            style.top = "0px";
            style.left = "0px";
//            style.width = "400px";
            timingDiv.innerHTML = '<p style="margin: 2px 0 1px 0"> ' +
            'Page load staticstics:<br>' +
            this.stamps.replace(/,/g, "<br>") +
            '</p>' +
            '<p style="margin: 2px 0 1px 0; text-align: right">' +
            '<a href="javascript:{GraniteTiming.hideDiv();}">Close</a>' +
            '</p>';
            window.document.body.appendChild(timingDiv);
        },

        hideDiv: function() {
            window.document.getElementById("cqTiming").style.display="none";
        },

        showDiv: function(e) {
            var code;
            var evt;
            if(document.all) {
                code = window.event.keyCode;
                evt = window.event;
            } else {
                code = (typeof(e.which) != 'undefined') ? e.which : 0;
                evt = e;
            }
            if (evt && evt.ctrlKey && evt.shiftKey && code == 85) { // ctrl + shift + u
                GraniteTiming.writeDiv();
            }
        }
    };
}();

GraniteTiming.init();
