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

CQ.Ext.ns("CQ.wcm.mobile.simulator");

(function(){

    "use strict";

    var isWCMPreview = false,
        isAuthor  = ("CQ" in window && "WCM" in CQ),
        _CQTop = isAuthor && CQ.WCM.getTopWindow().CQ,
        _CQ = isAuthor && CQ.WCM.getContentWindow().CQ;

    function updateWCM() {
        setTimeout(function () {
            if (_CQTop) {
                isWCMPreview = _CQTop.WCM.getMode() == _CQTop.WCM.MODE_PREVIEW;
                _CQTop.WCM.getDeviceSimulator().launch();
            }
        }, 1);
    }

    function isValidStyleSheet(sheet) {
        if (sheet && !sheet.disabled) {
            try {
                return (sheet.cssRules || sheet.cssText);
            } catch (e) {
                //handle security exceptions for css loaded from other domains
                return false;
            }
        }
        return false;
    }

    /**
     * The device simulator manages client-side simulation of emulator media capabilities.
     * @static
     * @singleton
     * @class CQ.wcm.mobile.simulator.DeviceSimulator
     */
    CQ.wcm.mobile.simulator.DeviceSimulator_class = CQ.Ext.extend(CQ.Ext.util.Observable, {

        /**
         * @cfg {Object} The emulator configurations.
         */
        emulatorConfigs: null,

        /**
         * @cfg {Object} The simulator configurations.
         */
        simulatorConfigs: null,

        /**
         * Reference to an instance of the media filter object
         * @private
         */
        mediaFilter: null,

        /**
         * Reference to the WCM emulator manager
         * @private
         */
        emulatorManager: null,

        /**
         * The device currently being simulated
         * @private
         */
        currentDevice: null,

        /**
         * @cfg {Number} The absolute path parent level for which to remember which device is in use.
         */
        separationPathLevel: null,

        /**
         * Saved style sheets that have been filtered
         * @private
         */
        filteredSheets: [],

        /**
         * Receives a configuration containing all emulators to be managed. The configuration also specifies
         * the default emulator to launch. Every emulator is defined by its desired configuration. A sample
         * configuration might look as follows:
         *
         * var config = {
         *   defaultEmulator: "iPhone",
         *   simulatorConfigs: {
         *      orientation: "vertical"
         *   },
         *   emulatorConfigs: {
         *       iPhone: {},
         *       iPad: {}
         *   }
         * };
         *
         * var simulator = CQ.WCM.getDeviceSimulator();
         * simulator.launch(config);
         */
        launch: function(config) {

            if (config && !this.emulatorManager) {

                config = CQ.Util.applyDefaults(config, {
                    simulatorConfigs: _CQ.wcm.mobile.simulator.DeviceSimulator.DEFAULT_CONFIG
                });

                // Initialize device simulator and setup preview mode listeners
                this.getSimulatorConfigs(config);
                this.separationPathLevel = (config.separationPathLevel) ? config.separationPathLevel : 1;

                this.mediaFilter = new _CQ.wcm.mobile.simulator.MediaFilter();

                this.emulatorManager = _CQTop.WCM.getEmulatorManager();
                this.emulatorConfigs = this.emulatorManager.getEmulatorConfigs(config);
                this.emulatorManager.getEmulatorNames(config);

                if (isAuthor) {
                    _CQTop.WCM.on("wcmmodechange", updateWCM);
                    _CQTop.WCM.on("sidekickready", updateWCM);
                }
            } else {
                if (isWCMPreview) {
                    //check if an emulator was already in use
                    var emulatorName = CQ.HTTP.getCookie(CQ.wcm.emulator.EmulatorManager.EMULATOR_COOKIE_NAME);
                    if (this.emulatorManager && emulatorName && emulatorName != "null") {
                        this.emulatorManager.switchEmulator(emulatorName);
                    }
                    this.switchDevice();
                } else {
                    this.reset();
                    this.emulatorManager.stopEmulator();
                }
            }
        },

        reset: function() {
            this.stopSimulator();
            $CQ('body').css('width', '').removeClass('simulator-content');
            this.getSimulatorConfigs(_CQ.wcm.mobile.simulator.DeviceSimulator.DEFAULT_CONFIG);
        },

        getSimulatorConfigs: function(config) {
            if (config) {
                //Update current set of simulator configs
                if (config.simulatorConfigs) {
                    config = config.simulatorConfigs;
                }
                this.simulatorConfigs = this.simulatorConfigs || {};
                this.simulatorConfigs = CQ.Util.applyDefaults(config, this.simulatorConfigs);
            }
            return this.simulatorConfigs;
        },

        /**
         * Toggle the current device's orientation
         */
        rotateDevice: function() {
            if (this.currentDevice && this.currentDevice.canRotate) {
                var cfg = this.getSimulatorConfigs();
                if (cfg.orientation) {
                    cfg.orientation = (cfg.orientation == "vertical") ? "horizontal" : "vertical";
                }
                this.getSimulatorConfigs(cfg);

                var nextDevice = this.currentDevice;
                this.stopSimulator();
                nextDevice.orientation = cfg.orientation;
                this.startSimulator(nextDevice);
            }
        },

        /**
         * Switch to a new device
         */
        switchDevice: function(switchTo) {

            if (!switchTo) {
                //lookup device from emulator manager
                var emulator = (this.emulatorManager) ? this.emulatorManager.getCurrentEmulator() : null;
                if (emulator) {
                    switchTo = emulator.getDeviceConfig();
                } else {
                    switchTo = _CQ.wcm.mobile.simulator.DeviceSimulator.DESKTOP_CONFIG[_CQ.wcm.mobile.simulator.DeviceSimulator.DEFAULT_DEVICE];
                    this.currentDevice = switchTo;
                    this.fireEvent("start", this.currentDevice);
                }
            }

            // only switch if no device started yet and the switch target is not the one already started
            if (!this.currentDevice || this.currentDevice.name != switchTo.name) {
                //reset style sheets to be re-filtered
                this.stopSimulator();
                //apply default orientation to device
                var nextDevice = CQ.Util.applyDefaults(switchTo, this.simulatorConfigs);
                this.startSimulator(nextDevice);
            }

        },

        /**
         * This method starts the given device simulator and filters the content CSS against the new emulator's specification.
         * @param {Device} device The device to be simulated.
         */
        startSimulator: function(device) {
            if (!this.currentDevice) {
                this.currentDevice = device;

                CQ.HTTP.setCookie(
                    CQ.wcm.emulator.EmulatorManager.EMULATOR_COOKIE_NAME,
                    device.name,
                    CQ.HTTP.externalize("/")
                );

                this.filterAllStyleSheets(device);
                //Wrap all body contents
                var mfDevice = this.mediaFilter.getDevice(this.currentDevice);
                var bodyWidth = (mfDevice.orientation == "vertical") ? mfDevice.width : mfDevice.height;
                $CQ('body').css('width', bodyWidth + 'px').addClass('simulator-content');
                this.fireEvent("start", this.currentDevice);
            }
            return true;
        },

        /**
         * This method stops the currently active simulator by reverting all styles that were filtered.
         */
        stopSimulator: function() {
            this.currentDevice = null;
            CQ.HTTP.clearCookie(
                CQ.wcm.emulator.EmulatorManager.EMULATOR_COOKIE_NAME,
                CQ.HTTP.externalize("/")
            );
            if (this.filteredSheets.length > 0) {
                //revert all style filtering
                while (this.filteredSheets.length) {
                    var sheet = this.filteredSheets.pop();
                    sheet.filtered.replaceWith(sheet.original);
                }
            }
        },

        /**
         * Filter media queries for all valid stylesheets on this document.
         * @param device The device spec to be simulated.
         */
        filterAllStyleSheets: function(device) {
            if(!document.styleSheets) return;

            var sheets = document.styleSheets;
            for (var i = 0; i < sheets.length; i++) {
                var styleSheet = sheets[i];
                if (!isValidStyleSheet(styleSheet)) continue;
                this.saveStyleSheet(styleSheet);
                this.filterStyleSheet(styleSheet, device);
            }

        },

        /**
         * Filter out media queries for the specified stylesheet based on the device spec.
         */
        filterStyleSheet: function(sheet, device) {
            if (!sheet) return;
            var mf = this.mediaFilter;
            try {
                var rules;
                if (rules = (sheet.cssRules)) {
                    var i = 0;
                    while (i < rules.length) {
                        var r = rules[i];
                        if (r.type == CSSRule.IMPORT_RULE) {
                            // If the current rule is an @import, filter the rules from the stylesheet it imports.
                            this.filterStyleSheet(r.styleSheet, device);
                        } else if (r.type == CSSRule.MEDIA_RULE) {
                            // Filter this media rule
                            var useMediaRule = false;
                            if (r.media.mediaText) {
                                useMediaRule = mf.evalMediaText(r.media.mediaText, device);
                            } else {
                                var filteredCss = mf.filterCssText(r.cssText, device);
                                useMediaRule = (filteredCss && filteredCss.length > 0);
                            }
                            var mediaPos = i;
                            if  (useMediaRule) {
                                //add all the rules defined by the media query directly to the sheet
                                for (var j = 0; j < r.cssRules.length; j++) {
                                    sheet.insertRule(r.cssRules[j].cssText, i);
                                    i++
                                }
                            }
                            sheet.deleteRule(i);
                            i--;
                        }
                        i++;
                        rules = sheet.cssRules;
                    }
                } else if (sheet.cssText) { // if this is IE, get the css text directly
                    sheet.cssText = mf.filterCssText(sheet.cssText, device);
                    if (sheet.imports) {
                        //filter all imported style sheets as well
                        for(var i = 0; i < sheet.imports.length; i++) {
                            this.filterStyleSheet(sheet.imports[i], device);
                        }
                    }
                }
            } catch (e) {
                console.log("Could not process styles for: " + sheet.href);
            }
        },

        /**
         * Save a copy of the original stylesheet from the document so that any filtering that occurs
         * can be reverted when the simulation stops.
         * @param sheet The stylesheet object to save
         * @return The filtered sheet object
         */
        saveStyleSheet: function(sheet) {
            if (!sheet) return null;

            this.filteredSheets = this.filteredSheets || [];
            var ref;
            for ( var i in this.filteredSheets ){
                if (this.filteredSheets[i].filtered &&
                    this.filteredSheets[i].filtered[0] === sheet.ownerNode) {
                    ref = this.filteredSheets[i];
                    break;
                }
            }
            if (!ref) {
                ref = {};
                this.filteredSheets.push(ref);
            }

            if (!ref.original) {
                ref.original = $CQ(sheet.ownerNode).clone(false);
            }

            ref.filtered = $CQ(sheet.ownerNode);

            return ref;
        }

    });

    CQ.wcm.mobile.simulator.DeviceSimulator = new CQ.wcm.mobile.simulator.DeviceSimulator_class();

    CQ.wcm.mobile.simulator.DeviceSimulator.DEFAULT_DEVICE = "desktop";

    CQ.wcm.mobile.simulator.DeviceSimulator.DEFAULT_CONFIG = {
        orientation: "vertical"
    };

    CQ.wcm.mobile.simulator.DeviceSimulator.DESKTOP_CONFIG = {
        desktop: {
            title: "Desktop",
            action:"start",
            canRotate:false,
            hasTouchScrolling:false,
            isDefault:true
        }
    };

    /**
     * Utility method to statically access the device simulator.
     * @return {CQ.wcm.mobile.simulator.DeviceSimulator} The device simulator.
     */
    CQ.wcm.mobile.simulator.DeviceSimulator.getInstance = function() {
        return CQ.WCM.getContentWindow().CQ.wcm.mobile.simulator.DeviceSimulator;
    };

})();
/**
 * Filters the @media queries from the CSS.
 * Known limitations:
 * - Doesn't support media query units - all dimensions are assumed to be PX and screen resolutions to be DPI.
 * - The default DPI value if none provided is always 96dpi even if this doesn't correspond to the current device settings.
 * - Doesn't support media groups other than "all" (doesn't support: continuous, paged, visual, audio, speech, tactile, grid, bitmap, interactive, and static).
 * - Doesn't support the "grid" media feature.
 * @param {string} css The CSS to filter.
 * @param {object} device The device capabilities, an object of the form: {"width":320,"height":480} - unexisting properties will be completed.
 * @return {string} the filtered CSS.
 */
CQ.wcm.mobile.simulator.MediaFilter = function () {

    "use strict";

    // Regular expressions
    var comments       = "/\\*[^*]*(?:(?:\\*+([^/][^*]*\\*+)*/)|$)", // Description of the comment scope
        doubleStr      = '"(?:[^\\\\"]*(?:\\\\"?)*)*(?:"|$)',        // Description of the double quote string scope
        singleStr      = "'(?:[^\\\\']*(?:\\\\'?)*)*(?:'|$)",        // Description of the single quote string scope
        escaped        = "(?:\\\\.?)",                               // Descrption of escaped string characters
        passThrough    = "^(?:[^\\\\@{}\"'/]*|@(?!media)|/(?!\\*)|"+escaped+"|"+comments+"|"+doubleStr+"|"+singleStr+")*", // See comment below for passThroughRE
        mediaQuery     = "^(?:[^\\\\;{}\"'/]*|/(?!\\*)|"+escaped+"|"+comments+"|"+doubleStr+"|"+singleStr+")*",            // See comment below for mediaQueryRE
        mediaTypeRE    = /^\s*(?:(?:(?:(not)|(only))\s+)?([^\s()]+))?/,          // Matches the type query (e.g. "not all")
        mediaAndExprRE = /^(\s+and\s+)?\(([^()]+)\)/,                            // Matches the expression that follows the type query (e.g. " and (min-width: 800px)")
        mediaExprRE    = /^\s*(?:(?:(min)|(max))-)?(\S+)(?:\s*:\s*(\S.*))+\s*$/, // Matches the expression itself (e.g. "min-width: 800px" or "min-width:800px")
        ratioRE        = /^\s*(\d+)\s*\/\s*(\d+)\s*$/, // Matches a ratio (e.g. "1/2")
        trimRE         = /^\s+|\s+$/g,                 // Matches the whitespace at the start and end of a string (useful to trim a string)
        notBlankRE     = /\S/,                         // Matches the first non-blank character (used by StringReader.isBlank())
        commentsRE     = new RegExp(comments, "g"),    // Matches comments
        passThroughRE  = new RegExp(passThrough, "i"), // Matches everything that isn't a block or a @media query
        mediaQueryRE   = new RegExp(mediaQuery);       // Matches the @media query selector (everything until the opening bracket)

    /**
     * Initializes the device object, completing unexisting properties with meaningful defaults.
     * @constructor
     * @prop {object} device The device capabilities, an object of the form: {"width":320,"height":480}.
     */
    var Device = function(device) {

        var deviceCfg = {
            "device": device || {},
            "type": device.type || "screen",
            "width": parseInt(device.width, 10) || window.innerWidth || document.documentElement.clientWidth,
            "height": parseInt(device.height, 10) || window.innerHeight || document.documentElement.clientHeight,
            "device-width": parseInt(device["device-width"], 10) || parseInt(device.width, 10) || screen.width,
            "device-height": parseInt(device["device-height"], 10) || parseInt(device.height, 10) || screen.height,
            "orientation": device.orientation || (this.width > this.height ? "landscape" : "portrait"),
            "aspect-ratio": Device.parseRatio(device["aspect-ratio"]) || (this.width / this.height),
            "device-aspect-ratio": Device.parseRatio(device["device-aspect-ratio"]) || (this["device-width"] / this["device-height"]),
            "color": parseInt(device.color, 10) || 8,
            "color-index": parseInt(device["color-index"], 10) || 0,
            "monochrome": parseInt(device.monochrome, 10) || 0,
            "resolution": parseInt(device.resolution, 10) || 96,
            "scan": device.scan || false,
            "device-pixel-ratio": parseFloat(device["device-pixel-ratio"]) || 1
        };

        deviceCfg.getPixelWidth =  function() {
            var width;
            if (this.orientation == "landscape" || this.orientation == "horizontal" ) {
                width = (this.width > this.height) ? this.width : this.height;
            } else {
                width = (this.width < this.height) ? this.width : this.height;
            }
            return Math.ceil(width * this["device-pixel-ratio"]);
        };
        deviceCfg.getPixelHeight = function() {
            var height;
            if (this.orientation == "landscape" || this.orientation == "horizontal" ) {
                height = (this.width > this.height) ? this.height : this.width;
            } else {
                height = (this.width < this.height) ? this.height : this.width;
            }
            return Math.ceil(height * this["device-pixel-ratio"]);
        }

        initialize.call(deviceCfg);

        function initialize() {
            //Reduce width/height based on device pixel density
            this.width = Math.floor(this.width / this["device-pixel-ratio"]);
            this.height = Math.floor(this.height / this["device-pixel-ratio"]);
        }

        return deviceCfg;
    };

    /**
     * Parses a ratio string (e.g. "1/2").
     * @prop {string} The string to parse.
     * @return {integer} The value of the ratio (e.g. 0.5).
     * @static
     */
    Device.parseRatio = function (ratio) {
        if (typeof ratio === "string") {
            var match = ratio.match(ratioRE);
            if (match && match[1] && match[2] && match[2] !== "0") {
                return parseInt(match[1], 10) / parseInt(match[2], 10);
            }
        }
        return false;
    };

    /**
     * Helper object to read from the beginning of a string.
     * @constructor
     * @prop {string} str The inital string.
     */
    var StringReader = function(str) {

        return {
            str: str,

            /**
             * Tells if the string that is read contains no characters anymore.
             * @return {boolean}
             */
            notEmpty: function () {
                return this.str.length > 0;
            },

            /**
             * Tells if the string that is read contains only whitespace.
             * @return {boolean}
             */
            isBlank: function () {
                return !this.str.match(notBlankRE);
            },

            /**
             * Returns the i first characters from the string and removes them from the string.
             * @param {integer} i
             * @return {string} The i first characters.
             */
            pull: function (i) {
                var pulled = this.str.substr(0, i);
                this.str = this.str.substr(i);
                return pulled;
            },

            /**
             * Returns the match from the RegExp and removes the matched characters from the beginning of the string.
             * Take special care with this function to have a regExp that matches the *beginning* of the string (always start the RegExp with "^")
             * @param {RegExp} regExp
             * @param {boolean} [returnFullMatch] Optional: provide this parameter to indicate that you want the full match object to be returned.
             * @return {string} The content of the matched regular expression, or the full match object if returnFullMatch is true.
             */
            matchPull: function (regExp, returnFullMatch) {
                var match = this.str.match(regExp);
                if (match && match[0].length) {
                    this.str = this.str.substr(match[0].length);
                    return returnFullMatch ? match : match[0];
                } else {
                    return returnFullMatch ? match : "";
                }
            }
        }
    };

    /**
     * Parses and filters the @media queries from the CSS.
     * This function handles correctly the string and comment scopes and also considers backslash character escaping correctly.
     * @param {StringReader} input The CSS to filter.
     * @param {object} device The device capabilities.
     * @param {object} depth Don't provide this parameter, it is only used by the recursion to track the recusion level.
     * @return {string} The filtered CSS.
     */
    function parseAndFilter(input, device, depth) {
        var cssOutput   = "",
            head        = "",
            parsed      = "",
            media       = "",
            match       = false;

        depth = depth || 0;

        while (true) {
            // Let's get everything that isn't a block punctuation ("{" or "}"), and that isn't a media query ("@media")
            parsed = input.matchPull(passThroughRE);
            cssOutput += parsed;
            if (input.notEmpty()) {
                // Let's see why we stopped parsing (basically can be because of "{", "}", or of "@" character)
                head = input.pull(1);
                if (head === "{") {
                    // Opening block => we do a recursion
                    cssOutput += head + parseAndFilter(input, device, depth+1);
                } else if (head === "}") {
                    // Closing block => we exit recursion (unless we are already at the outer level)
                    cssOutput += head;
                    if (depth) {
                        return cssOutput;
                    }
                } else if (head === "@") {
                    // @media query!
                    media = input.matchPull(mediaQueryRE);
                    match = evalMediaQueryList(media.substr(5), device);

                    head = input.pull(1);
                    if (head === "{") {
                        // The @media query is followed by an opening block
                        parsed = parseAndFilter(input, device, depth+1);
                        if (match) {
                            cssOutput += parsed.replace(/\}$/, "");
                        }
                    } else if (head === "}") {
                        // The @media query is followed by an closing block
                        cssOutput += head;
                        if (depth) {
                            return cssOutput;
                        }
                    } else if (head === ";") {
                        cssOutput += head;
                    } else {
                        // Shouldn't happen, unless the RegExp was malformed...
                        error("Media query parsing error at:\n"+input.pull(20)+"...");
                        return cssOutput;
                    }
                } else {
                    // Shouldn't happen, unless the RegExp was malformed...
                    error("Block parsing error at:\n"+input.pull(20)+"...");
                    return cssOutput;
                }
            } else {
                // We've parsed everything there is!
                return cssOutput;
            }
        }
    }

    /**
     * Checks if the comma separated list of media queries match the device.
     * @param {string} query The comma separated list of media queries (e.g. "screen and (min-width: 100px), (orientation: protrait)").
     * @param {object} device The device capabilities.
     * @return {boolean} The result of the match.
     */
    function evalMediaQueryList(query, device) {
        var queryItem = query.replace(commentsRE, " ").split(","); // TODO handle strings correctly

        //query = new StringReader(query.toLowerCase());

        for (var i = 0, l = queryItem.length; i < l; i++) {
            if (evalMediaQueryItem(queryItem[i], device)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks the if the media query item matches the device.
     * @param {string} query The media query (e.g. "screen and (min-width: 100px)").
     * @param {object} device The device capabilities.
     * @return {boolean} The result of the match.
     */
    function evalMediaQueryItem(query, device) {
        var match, isNot, isOnly, type, result, needAndKeyword;

        query = new StringReader(query.toLowerCase());

        //console.log("------------\nquery item: "+query.str);

        match = query.matchPull(mediaTypeRE, true);
        if (!match) {
            // Shouldn't happen, unless the RegExp was malformed...
            error("Media query item parsing error at:\n"+query.pull(20)+"...");
            return false;
        }

        isNot  = !!match[1];
        isOnly = !!match[2];
        type   = match[3];

        if ((isNot || isOnly) && !type) {
            // There cannot be the NOT or ONLY keyword without a type
            return false;
        }
        if (type === "not" || type === "only") {
            // There cannot be the NOT and the ONLY keywords at the same time
            return false;
        }

        result = !type || type === "all" || type === device.type;

        // If a type has been defined, there will need to be an AND between it and the expressions that follows
        needAndKeyword = !!type;

        while (true) {
            // If there's nothing left to parse we're done
            if (query.isBlank()) {
                break;
            }
            match = query.matchPull(mediaAndExprRE, true);
            if (!match || (needAndKeyword && !match[1]) || !match[2]) {
                // Invalid query item
                return false;
            }
            result = result && evalMediaQueryExpression(match[2], device);
            needAndKeyword = true;
        }

        return isNot ? !result : result;
    }

    /**
     * Checks the if the media query expression matches the device.
     * @param {string} query The media query expression (e.g. "min-width: 100px").
     * @param {object} device The device capabilities.
     * @return {boolean} The result of the match.
     */
    function evalMediaQueryExpression(query, device) {
        var match = query.match(mediaExprRE),
            isMin, isMax, property, value;

        if (!match) {
            return false;
        }
        isMin  = !!match[1];
        isMax  = !!match[2];
        property = match[3];
        value    = match[4];

        if (!property || !(property in device) || ((isMin || isMax) && (!value || (typeof device[property] !== "number")))) {
            // Invalid query expression
            return false;
        }

        if (value) {
            // Parse ratio
            if (property === "aspect-ratio" || property === "device-aspect-ratio") {
                value = Device.parseRatio(value);
                if (value === false) {
                    return false;
                }
                // Parse numerical values
            } else if (typeof device[property] === "number") {
                value = parseInt(value, 10);
                if (isNaN(value) || value < 0) {
                    return false;
                }
                // Trim strings
            } else if (typeof value === "string") {
                value = value.replace(trimRE, "");
            } else {
                // The value must be a ratio, numerical or a string.
                return false;
            }

            // Now we can finally evaluate the expression
            if (isMin) {
                return value <= device[property];
            }
            if (isMax) {
                return value >= device[property];
            }
            return value === device[property];
        } else {
            return !!device[property];
        }
    }

    /**
     * Defensive error logger.
     * @param {string} The message to log.
     */
    function error(msg) {
        if ("console" in window && "log" in window.console) {
            window.console.log(msg);
        }
    }

    return {

        filterCssText: function(css, device) {
            return parseAndFilter(new StringReader(css), new Device(device));
        },

        evalMediaText: function(media, device){
            return evalMediaQueryList(media, new Device(device));
        },

        getDevice: function(deviceCfg) {
            return new Device(deviceCfg);
        }
    }
};
