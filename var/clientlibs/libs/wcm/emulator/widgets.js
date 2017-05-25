/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

CQ.Ext.ns("CQ.wcm.emulator");
CQ.Ext.ns("CQ.wcm.emulator.plugins");

/**
 * Wraps the content of the element into the tag defined by the given config or a default div.
 * @param {Object} config The tag config.
 * @param {Boolean} returnDom Whether to return the resulting DOM of the new element.
 * @param {Object} bufferDomConfig The config for the dom buffering.
 */
CQ.Ext.Element.prototype.wrapContent = function (config, returnDom, bufferDomConfig) {
    var df = this.bufferDom(bufferDomConfig);

    var newEl = this.insertFirst(config || {tag: "div"});
    newEl.dom.appendChild(df);
    return returnDom ? newEl : CQ.Ext.get(newEl);
};

/**
 * Buffers the DOM of the element into a newly created document fragment, which is returned.
 * @param {Object} config Configs:<ul>
 *     <li>excluded {String[]}: ids of excluded nodes</li>
 *     </ul>
 * @return {DocumentFragment} The document fragment.
 */
CQ.Ext.Element.prototype.bufferDom = function (config) {
    config = config || {};
    config.excluded = config.excluded || [];
    // collect all child nodes to re-add them to the new element
    var df = document.createDocumentFragment();

    // set the length explicitly, as the childNodes.length reduces itself with every iteration
    var numNodes = this.dom.childNodes.length;
    for (var i = numNodes - 1; i >= 0 ; i--) {
        var node = this.dom.childNodes[i];

        //exclude CQ div from buffering
        //add test if(node.id) to avoid moves of empty text node: this cause df to be empty. Do not know why.
        // So moving only elements with ids...
        if (node && node.id && config.excluded.indexOf(node.id) == -1) {
            //nodes are read from end to 0, they have to be inserted the other way
            df.insertBefore(node, df.firstChild);
        }
    }

    return df;
};

/**
 * This method removes the dom children of the element and appends it to the given receiver element's dom. Optionally
 * the element is removed.
 * @param {CQ.Ext.Element} receiverElement The element to receive this element's content.
 * @param {Boolean} remove Whether to remove this element from the DOM or not.
 * @param {Object} bufferDomConfig The config for the dom buffering.
 */
CQ.Ext.Element.prototype.unwrapContent = function (receiverElement, remove, bufferDomConfig) {

    // collect all child nodes to re-add them to the new element
    var df = this.bufferDom(bufferDomConfig);
    receiverElement.dom.appendChild(df);
    if (remove) {
        this.remove();
    }
};

// register the CQ.Ext.Element extensions
CQ.Ext.CompositeElement.createCallback(CQ.Ext.CompositeElement.prototype, "wrapContent");
CQ.Ext.CompositeElement.createCallback(CQ.Ext.CompositeElement.prototype, "unwrapContent");

/**
 * The emulator manager manages emulators (starting, stopping, switching in between emulators). The manager
 * is launched via the #launch method and can receive a full list of emulators and their config.
 */
CQ.wcm.emulator.EmulatorManager_class = CQ.Ext.extend(CQ.Ext.util.Observable, {

        /**
         * @cfg {String} The HTML ID ("<link id="..." .../>) of the CSS styling the actual content displayed in the
         * emulator. This is used to replace the relevant CSS when switching emulators.
         */
        contentCssId: null,

        /**
         * @cfg {String} The default emulator to start from the list of available emulators.
         */
        defaultEmulator: null,

        /**
         * @cfg {Object} The emulator configurations.
         */
        emulatorConfigs: null,

        /**
         * @cfg {Boolean} Flag indicating whether to show the "edit" link in the group info window (Defaults to false)
         */
        groupReadOnly: false,

        /**
         * the emulator names desired by the caller
         * @private
         */
        emulatorNames: null,

        /**
         * The currently active emulator
         * @private
         */
        currentEmulator: null,

        /**
         * The element containing all emulator elements.
         * @private
         */
        emulatorWrapper: null,

        /**
         * This element contains the actual emulator device
         * @private
         */
        emulatorDevice: null,

        /**
         * Holds the emulator top toolbar (carousel, group info)
         * @private
         */
        emulatorToolbar: null,

        /**
         * @cfg {Number} The absolute path parent level for which to remember which emulator is in use.
         */
        separationPathLevel: null,

        /**
         * @cfg {Boolean} True to show the toolbar (defaults to true).
         */
        showToolbar: true,

        /**
         * Receives a configuration containing all emulators to be managed. The configuration also specifies
         * the default emulator to launch. Every emulator is defined by its desired configuration. A sample
         * configuration might look as follows:
         *
         * var config = {
         *   defaultEmulator: "iPhone",
         *   contentCssId: "mobileContentCss",
         *   showCarousel: true,
         *   emulatorConfigs: {
         *       iPhone: {
         *           plugins: {
         *               "rotation": {
         *                   ptype: CQ.wcm.emulator.plugins.RotationPlugin.NAME,
         *                   config: {
         *                      defaultDeviceOrientation: "vertical"
         *                   }
         *               }
         *           },
         *           title: "iPhone Emulator",
         *           description: "...",
         *           contentCssUrl: "/path/to/content.css"
         *       },
         *       blackberry: {
         *           title: "Blackberry Emulator",
         *           description: "...",
         *           contentCssUrl: "/path/to/content.css"
         *       },
         *       w800: {
         *           title: "Sony Ericsson W800 Emulator",
         *           description: "...",
         *           contentCssUrl: "/path/to/content.css"
         *       }
         *   }
         * };
         *
         * var emulatorMgr = CQ.WCM.getEmulatorManager();
         * emulatorMgr.launch(config);
         */
        launch: function(config) {

            this.getEmulatorConfigs(config);
            this.getEmulatorNames(config);

            if (config.contentCssId) {
                this.contentCssId = config.contentCssId;
            }

            this.separationPathLevel = (config.separationPathLevel) ? config.separationPathLevel : 1;

            var body = CQ.Ext.getBody();

            // wrap body in emulator framework
            this.emulatorDevice =
            body.wrapContent({tag: "div", id: CQ.wcm.emulator.EmulatorManager.EMULATOR_DEVICE_ID},false, {
                excluded: CQ.wcm.emulator.EmulatorManager.WRAPPING_EXCLUDED_IDS
            });
            this.emulatorWrapper =
            this.emulatorDevice.wrap({tag: "div", id: CQ.wcm.emulator.EmulatorManager.EMULATOR_WRAPPER_ID});

            var emulatorName = CQ.HTTP.getCookie(CQ.wcm.emulator.EmulatorManager.EMULATOR_COOKIE_NAME);

            if (!emulatorName || !this.emulatorConfigs[emulatorName]) {
                emulatorName = config.defaultEmulator || this.getDefaultEmulator();
                this.defaultEmulator = emulatorName;
            }

            this.emulatorToolbar = new CQ.wcm.emulator.EmulatorToolbar(this, config);
            var showBody = true;
            if (emulatorName) {
                this.currentEmulator = new CQ.wcm.emulator.Emulator(this,
                                                                    emulatorName,
                                                                    this.emulatorConfigs[emulatorName]);
                // finally start the emulator
                showBody = this.startEmulator(this.currentEmulator);
            }


            // CSS hides the body to prevent content being visible before the emulator is loaded. after launch
            // is complete, ensure that the body is shown.
            if (showBody) {
                body.show();
            }

            if( this.showToolbar ) {
                this.emulatorToolbar.start();
            }
        },

        isActive: function() {
            return (this.emulatorDevice);
        },

        getEmulatorConfigs: function(config) {
            if (null == this.emulatorConfigs) {
                if (config && config.emulatorConfigs) {
                    this.emulatorConfigs = config.emulatorConfigs;

                } else {
                    this.emulatorConfigs = this.getEmulatorConfigsFromPage();
                }
            }
            return this.emulatorConfigs;
        },

        getEmulatorNames: function(config) {
            if (null == this.emulatorNames) {
                var emulatorNames = [];
                var emulators = this.getEmulatorConfigs(config);
                for (var name in emulators) {
                    emulatorNames.push(name);
                }
                this.emulatorNames = emulatorNames;
            }

            return this.emulatorNames;
        },

        getCurrentEmulator: function() {
            return this.currentEmulator;
        },

        getEmulatorIndex: function(emulator) {
            var names = this.getEmulatorNames();
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                if (emulator && emulator.getName() == name) {
                    return i;
                }
            }

            return 0;
        },

        getEmulatorToolbar: function() {
            return this.emulatorToolbar;
        },

        getEmulatorConfigsFromPage: function() {
            var emulators = {};
            var pageInfo = CQ.WCM.getPageInfo(CQ.WCM.getPagePath());
            var cfg = pageInfo["emulators"];
            if (cfg && ["groups"]) {
                cfg = cfg["groups"];
            }
            if (!cfg) {
                return {};
            }
            for (var group in cfg) {
                for (var name in cfg[group]) {
                    if (typeof cfg[group][name] != "object") {
                        continue;
                    }
                    var emulatorCfg = cfg[group][name];
                    var emulator = {};
                    emulator.title = emulatorCfg.text;
                    if (!emulatorCfg.group) {
                        emulator.group = group;
                    } else {
                        emulator.group = emulatorCfg.group;
                    }
                    emulator.plugins = {};
                    if (emulatorCfg.canRotate) {
                        emulator.plugins["rotation"] = {
                            "ptype": CQ.wcm.emulator.plugins.RotationPlugin.NAME,
                            "config": {
                                "defaultDeviceOrientation": "vertical"
                            }
                        }
                    }
                    if (emulatorCfg.hasTouchScrolling) {
                        emulator.plugins["touchscrolling"] = {
                            "ptype": CQ.wcm.emulator.plugins.TouchScrollingPlugin.NAME,
                            "config": {}
                        }
                    }
                    emulators[name] = emulator;
                }
            }
            return emulators;
        },

        getDefaultEmulator: function() {
            var configs = this.getEmulatorConfigs();
            if (configs) {
                for (var name in configs) {
                    if (typeof configs[name] == "object") {
                        return name;
                    }
                }
            }
            return "";
        },

        /**
         * Switch to a new emulator
         */
        switchEmulator: function(switchTo) {

            // only switch if no emulator started yet and the switch target is not the one already started
            if (!this.currentEmulator || this.currentEmulator && this.currentEmulator.getName() != switchTo) {

                var nextEmulator = new CQ.wcm.emulator.Emulator(this, switchTo, this.emulatorConfigs[switchTo]);

                if (this.isActive()) {
                    // prevent "flash" of emulator content prior to loading a new device group URL
                    // therefore only stop the current emulator if the next emulator's device group is identical
                    if (CQ.wcm.emulator.EmulatorManager.SKIP_GROUP_TEST || this.currentEmulator.getGroup() == nextEmulator.getGroup()) {
                        this.stopEmulator();
                    }

                    this.startEmulator(nextEmulator);

                    // todo: this would be nice if it could be handled via eventing
                    var carousel = this.emulatorToolbar.getCarousel();
                    if (carousel) {
                        carousel.updateTitle();
                        carousel.positionCarousel(true);
                    }
                } else {
                    this.currentEmulator = nextEmulator;
                }
            }
        },

        /**
         * Switch to the previous emulator in sequence.
         */
        switchToPrevious: function() {
            this.switchEmulator(this.getPreviousEmulatorName());
        },

        /**
         * Switch to the next emulator in sequence.
         */
        switchToNext: function() {
            this.switchEmulator(this.getNextEmulatorName());
        },

        /**
         * If multiple emulators have been requested, this provides access to the next emulator in the chain
         * much like a pagination of emulators.
         */
        getNextEmulatorName: function() {
            var names = this.getEmulatorNames();
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                if (this.currentEmulator.getName() == name) {
                    if (i > 0 && i == names.length - 1) {
                        return names[0];
                    } else {
                        if ((i + 1) <= names.length - 1) {
                            return names[i + 1];
                        }
                    }
                }
            }
        },

        /**
         * If multiple emulators have been requested, this provides access to the next emulator in the chain
         * much like a pagination of emulators.
         */
        getPreviousEmulatorName: function() {
            var names = this.getEmulatorNames();
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                if (this.currentEmulator.getName() == name) {
                    if (i > 0) {
                        return names[i - 1];
                    } else {
                        if (i == 0) {
                            return names[names.length - 1];
                        }
                    }
                }
            }
        },

        /**
         * This method starts the given emulator and switches the content CSS against the new emulator's CSS.
         * @param {CQ.wcm.emulator.Emulator} emulator The emulator to be started.
         */
        startEmulator: function(emulator) {
            if (emulator) {
                this.currentEmulator = emulator;
                if (this.contentCssId && emulator.getContentCssPath()) {
                    CQ.Ext.util.CSS.swapStyleSheet(this.contentCssId, emulator.getContentCssPath());
                }

                var cookiePath = CQ.Util.getAbsoluteParent(CQ.WCM.getPagePath(), this.separationPathLevel);
                CQ.HTTP.setCookie(
                        CQ.wcm.emulator.EmulatorManager.EMULATOR_COOKIE_NAME,
                        emulator.getName(),
                        CQ.HTTP.externalize(cookiePath)
                );

                // first check whether the url contains the expected device group selector
                // if not, redirect, otherwise start emulator normally
                var emulatorGroup = emulator.getGroup();
                if (null != emulatorGroup) {

                    var selectors = CQ.HTTP.getSelectors();
                    var lastSelector = selectors[selectors.length - 1];

                    if (!CQ.wcm.emulator.EmulatorManager.SKIP_GROUP_TEST && lastSelector != emulatorGroup) {

                        var url = this.assembleUrl(selectors, emulatorGroup);

                        setTimeout(function() {

                            CQ.shared.Util.load(url);

                        }, 1);
                        return false;
                    } else {
                        if (this.fireEvent("beforestart", emulator) === false) {
                            return false;
                        }
                        emulator.start();
                        this.fireEvent("start", emulator);
                    }
                } else {
                    if (this.fireEvent("beforestart", emulator) === false) {
                        return false;
                    }
                    emulator.start();
                    this.fireEvent("start", emulator);
                }
            }
            return true;
        },

        assembleUrl: function(selectors, emulatorGroup) {
            var schemeAndAuthority = CQ.HTTP.getSchemeAndAuthority(location.href);
            var path = CQ.HTTP.externalize(CQ.HTTP.getPath());
            var extension = CQ.HTTP.getExtension();
            var suffix = CQ.HTTP.getSuffix();
            var query = (location.href.indexOf("?") > 0) ? location.href.substring(location.href.indexOf("?")) : null;
            var selectorString = null;

            if (selectors.length > 0) {

                // make sure that for redirection existing selectors are kept
                // and that the last selector is verified to be an emulator group selector.
                // if the last selector does not match any emulator group, append the group selector,
                // otherwise replace it.
                var append = true;
                var lastSelector = selectors[selectors.length - 1];
                var emulators = this.getEmulatorConfigs();
                for (var name in emulators) {
                    var config = emulators[name];
                    if (config.group == lastSelector) {
                        append = false;
                        break;
                    }
                }

                selectorString = selectors.join(".");
                selectorString = (append)
                        ? selectorString + "." + emulatorGroup
                        : selectorString.substring(0, selectorString.lastIndexOf(".") + 1) + emulatorGroup;

            } else {
                selectorString = emulatorGroup;
            }

            var url = schemeAndAuthority;
            url += path;
            url += (null != selectorString) ? "." + selectorString : "";
            url += "." + extension;
            url += (null != suffix) ? suffix : "";
            url += (null != query) ? query : "";

            return url;
        },

        /**
         * This method stops the currently active emulator.
         */
        stopEmulator: function() {
            if (this.currentEmulator) {
                if (this.fireEvent("beforestop", this.currentEmulator) === false) {
                    return false;
                }
                CQ.HTTP.clearCookie(
                        CQ.wcm.emulator.EmulatorManager.EMULATOR_COOKIE_NAME,
                        CQ.HTTP.externalize("/")
                );
                this.currentEmulator.stop();
                this.fireEvent("stop", this.currentEmulator);
                this.currentEmulator = null;
            }
        },

        constructor: function() {
            CQ.wcm.emulator.EmulatorManager_class.superclass.constructor.call(this);
        }

});

CQ.wcm.emulator.EmulatorManager = new CQ.wcm.emulator.EmulatorManager_class();
/**
 * The plugin registry holds all known emulator plugins.
 */
CQ.wcm.emulator.plugins.PluginRegistry = function() {

    var registry = {};

    return {

        /**
         * Registers a plugin in the registry.
         * @param {String} ptype A unique name (type identifier) for the plugin.
         * @param {Function} clazz The plugin implementation class.
         * @param {Object} config The plugin's configuration.
         */
        register: function(ptype, clazz, config) {
            registry[ptype] = new clazz(config);
        },

        /**
         * Returns all registered plugins.
         * @return {Object} The plugins.
         */
        getAll: function() {
            return registry;
        },

        /**
         * Returns a plugin as identified by the given name / type.
         * @param {String} ptype The name / type of the plugin, as registered previously.
         */
        getByType: function(ptype) {
            return registry[ptype];
        }
    }
}();

/**
 * The HTML ID of the div wrapping all emulator elements (emulator switcher, emulator itself, ...).
 */
CQ.wcm.emulator.EmulatorManager.EMULATOR_WRAPPER_ID = "cq-emulator-wrapper";

/**
 * The HTML ID of the div containing the emulator device
 */
CQ.wcm.emulator.EmulatorManager.EMULATOR_DEVICE_ID = "cq-emulator-device";
CQ.wcm.emulator.EmulatorManager.EMULATOR_COOKIE_NAME = "cq-emulator";

/**
 * The HTML ID of the main emulator div.
 */
CQ.wcm.emulator.EmulatorManager.EMULATOR_ID = "cq-emulator";

/**
 * The HTML ID of the emulator's content div containing the page content.
 */
CQ.wcm.emulator.EmulatorManager.CONTENT_ID = "cq-emulator-content";

/**
 * Skip the device group test and allows stop previous emulator.
 */
CQ.wcm.emulator.EmulatorManager.SKIP_GROUP_TEST = false;

CQ.wcm.emulator.EmulatorManager.WRAPPING_EXCLUDED_IDS = ["CQ"];

/**
 * Utility method to statically access the emulator manager.
 * @return {CQ.wcm.emulator.EmulatorManager} The emulator manager.
 */
CQ.wcm.emulator.EmulatorManager.getInstance = function() {
    return CQ.WCM.getContentWindow().CQ.wcm.emulator.EmulatorManager;
};
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * This class represents an emulator. Emulators provide a UI "simulating" a device, such as e.g. a mobile phone
 * or an email client. The emulator displays within its GUI the page content (div-wrapped). Emulator UI appearance
 * is done via CSS.
 */
CQ.wcm.emulator.Emulator = CQ.Ext.extend(CQ.Ext.util.Observable, {

    /**
     * @cfg {String} The url of the CSS for styling the content displayed by this emulator.
     */
    contentCssPath: null,

    /**
     * @cfg {String} The name of the group this emulator belongs to.
     */
    group: null,


    /**
     * @cfg {String} The title of the emulator.
     */
    title: null,

    /**
     * @cfg {String} The clipping element name for ClipEditablesPlugin
     */
    clippingElement: null,

    /**
     * @private {String} The name of this emulator.
     */
    name: null,

    /**
     * @private {CQ.Ext.Element} The element representing the overall emulator div.
     */
    emulator: null,

    /**
     * @private {CQ.Ext.Element} The element representing the emulator device's screen / content area.
     */
    emulatorContent: null,

    /**
     * @private {CQ.wcm.emulator.EmulatorManager} The emulator manager that instantiated this emulator.
     */
    emulatorManager: null,

    /**
     * @private {CQ.Ext.Element} The element containing the emulator information.
     */
    info: null,

    /**
     * @private {boolean} True if the emulator is started (defaults to false).
     */
    isStarted: false,

    /**
     * This method injects the emulator into the current page DOM.
     */
    start: function() {

        if (!this.isStarted) {

            // insert the emulator div (<div id="cq-emulator">...</div>) into the wrapper
            var wrapper = CQ.Ext.get(CQ.wcm.emulator.EmulatorManager.EMULATOR_DEVICE_ID);
            this.emulatorContent =
            wrapper.wrapContent({tag: "div", id: CQ.wcm.emulator.EmulatorManager.CONTENT_ID},false, {
                excluded: CQ.wcm.emulator.EmulatorManager.WRAPPING_EXCLUDED_IDS
            });
            this.emulator =
            this.emulatorContent.wrap({tag: "div", id: CQ.wcm.emulator.EmulatorManager.EMULATOR_ID});

            // now add the emulator's name as CSS classes to allow for CSS-based styling
            this.emulator.addClass(this.getName());
            this.emulatorContent.addClass(this.getName());
            this.emulatorContent.on("scroll", function() {
                if (CQ.wcm.EditRollover.currentlyHighlighted) {
                    CQ.wcm.EditRollover.currentlyHighlighted.hideHighlight();
                }
            });

            this.executePlugins("start");

            this.isStarted = true;
        }
    },

    /**
     * This method stops the emulator, i.e. completely removes it.
     */
    stop: function() {

        if (this.isStarted) {

            this.executePlugins("stop");

            //reverse op of the start
            if (this.groupWindow) {
                this.groupWindow.hide();
                this.groupWindow = null;
            }

            var wrapper = CQ.Ext.get(CQ.wcm.emulator.EmulatorManager.EMULATOR_DEVICE_ID);
            this.emulatorContent.unwrapContent(wrapper,true);
            this.emulatorContent = null;
            this.emulator.remove(true);
            this.emulator = null;

            this.isStarted = false;
        }
    },

    /**
     * Returns the name of the group this emulator belongs to.
     * @return {String} The name of the group.
     */
    getGroup: function() {
        return this.group;
    },

    /**
     * Returns the name of the emulator as defined by its implementing component's node name.
     * @return {String} The name of the emulator.
     */
    getName: function() {
        return this.name;
    },

    /**
     * Returns the title of the emulator as defined by its implementing component's configuration.
     * @return {String} The title of the emulator.
     */
    getTitle: function() {
        return this.title;
    },

    /**
     * Returns the name of the clipping element used by ClipEditablesPlugin.
     * @return {String} The name of the clipping element.
     */
    getClippingElement: function() {
    	return this.clippingElement;
    },

    /**
     * Returns the width of the device represented by this emulator.
     * @return {int} The width of the device.
     */
    getWidth: function() {
        return this.width;
    },

    /**
     * Returns the height of the device represented by this emulator.
     * @return {int} The height of the device.
     */
    getHeight: function() {
        return this.height;
    },

    /**
     * Returns the pixel ratio of the device represented by this emulator.
     * @return {int} The pixel ratio of the device.
     */
    getPixelRatio: function() {
        return this.pixelRatio;
    },

    /**
     * This method executes the configured plugins. The plugins are executed dependent on the given "scope" parameter.
     * @param {String} scope The plugin execution scope: either "start" or "stop".
     * @private
     */
    executePlugins: function(scope) {
        for (var idx in this.pluginConfigs) {
            var pluginConfig = this.pluginConfigs[idx];
            var plugin = CQ.wcm.emulator.plugins.PluginRegistry.getByType(pluginConfig.ptype);
            if (plugin) {
                var config = pluginConfig.config;
                if ("start" == scope) {
                    plugin.executeStart(this, config);
                } else {
                    if ("stop" == scope) {
                        plugin.executeStop(this, config);
                    }
                }
            }
        }
    },

    hasPlugin: function(type) {
        for (var idx in this.pluginConfigs) {
            var pluginConfig = this.pluginConfigs[idx];
            if (type == pluginConfig.ptype) {
                return true;
            }
        }
        return false;
    },

    /**
     * Returns the main emulator div sourrounding everything.
     * @return {CQ.Ext.Element} The main emulator div.
     */
    getMainElement: function() {
        return this.emulator;
    },

    /**
     * Returns the div containing the page content within the emulator (content div).
     * @return {CQ.Ext.Element} The emulator's content div.
     */
    getContentElement: function() {
        return this.emulatorContent;
    },

    /**
     * Returns the path of the CSS for styling the page content, if specified by the emulator configuration.
     * @return {String} The path of the CSS.
     */
    getContentCssPath: function() {
        return this.contentCssPath;
    },

    getDeviceConfig: function() {
        return {
            name: this.getName(),
            title: this.getTitle(),
            width: this.getWidth(),
            height: this.getHeight(),
            "device-pixel-ratio": this.getPixelRatio(),
            canRotate: this.hasPlugin(CQ.wcm.emulator.plugins.RotationPlugin.NAME)
        };
    },

    /**
     * The emulator's constructor.
     * @param {CQ.wcm.emulator.EmulatorManager} manager The emulator manager that started this emulator.
     * @param {String} name The name of this emulator.
     * @param {Object} config The configuration of this emulator.
     */
    constructor: function(manager, name, config) {

        this.emulatorManager = manager;

        config = CQ.Util.applyDefaults(config, {
            plugins: {
                "clip": {
                    ptype: CQ.wcm.emulator.plugins.ClipEditablesPlugin.NAME,
                    config: {
                    	clippingElement: config.clippingElement
                    }
                },
                "browserui": {
                    ptype: CQ.wcm.emulator.plugins.BrowserUIPlugin.NAME,
                    config: config
                }
            }
        });

        this.group = config.group;
        this.title = config.title;
        this.clippingElement = config.clippingElement || null;
        this.name = name;
        this.pluginConfigs = config.plugins || [];
        this.contentCssPath = config.contentCssPath;
        this.width = config.width || -1;
        this.height = config.height || -1;
        this.pixelRatio = config["device-pixel-ratio"] || 1;

        CQ.wcm.emulator.Emulator.superclass.constructor.call(this, config);
    }
});
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

CQ.wcm.emulator.EmulatorCarousel = CQ.Ext.extend(CQ.Ext.util.Observable, {

    /**
     * @private
     */
    carousel: null,

    /**
     * @private
     */
    emulatorManager: null,

    /**
     * @private
     */
    emulatorContainer: null,

    /**
     * @private
     */
    emulatorDivs: [],

    /**
     * @private
     */
    scrollTask: null,

    /**
     * @private
     */
    currentIndex: null,


    constructor: function(manager, config) {

        this.emulatorManager = manager;

        config = CQ.Util.applyDefaults(config, {
        });

        CQ.wcm.emulator.EmulatorCarousel.superclass.constructor.call(this, config);
    },

    start: function() {

        this.carousel = CQ.Ext.DomHelper.overwrite(CQ.Ext.get(CQ.wcm.emulator.EmulatorToolbar.CAROUSEL_ID),
                                                   {tag: "div", id: CQ.wcm.emulator.EmulatorCarousel.EMULATOR_CAROUSEL},
                                                   true);

        CQ.Ext.EventManager.onWindowResize(this.scaleCarousel, this);

        var panel = this.emulatorManager.getEmulatorToolbar().getPanel();
        panel.on("expand", function() {
            this.scaleCarousel();
        }, this);


        this.carousel.update("<div id=\"cq-emulator-carousel-previous\"></div>"
                                     + "<div class=\"cq-emulators\"><div class=\"cq-emulator-gradientleft\"></div>"
                                     + "<div class=\"cq-emulator-gradientright\"></div></div>"
                                     + "<div id=\"cq-emulator-carousel-next\"></div>"
                                     + "<div class=\"cq-emulator-title\"></div>");

        var emulators = this.emulatorManager.getEmulatorConfigs();

        this.emulatorContainer = this.carousel.select("div.cq-emulators").first();
        if (this.emulatorContainer && emulators) {
            for (var name in emulators) {

                var config = emulators[name];
                var id = CQ.wcm.emulator.EmulatorCarousel.EMULATOR_CAROUSEL + "-emulator-" + name;

                var emulatorDiv = CQ.Ext.DomHelper.append(this.emulatorContainer, {
                    "cls": "emulator",
                    "id": id,
                    "tag": "div"
                }, true);

                emulatorDiv.setWidth(CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH);
                emulatorDiv.setHeight(CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_HEIGHT);

                new CQ.Ext.ToolTip({
                                       "anchor": "left",
                                       "id": id + "-tooltip",
                                       "html": config.title,
                                       "plain": true,
                                       "target": emulatorDiv
                                   });

                emulatorDiv.on("click", function(e, t) {
                    var elId = t.id;
                    if (elId) {
                        var emulatorName = elId.substring(elId.lastIndexOf("-") + 1, elId.length);
                        this.emulatorManager.switchEmulator(emulatorName);
                    }
                }, this);

                this.emulatorDivs.push(emulatorDiv);
            }
        }

        this.updateTitle();
        this.scaleCarousel();

        this.createSwitchHandle("cq-emulator-carousel-previous",
                                "right",
                                CQ.I18n.getMessage("Switch to previous emulator..."),
                                "previous");

        this.createSwitchHandle("cq-emulator-carousel-next",
                                "left",
                                CQ.I18n.getMessage("Switch to next emulator..."),
                                "next");
    },

    updateTitle: function() {
        var title = this.carousel.select("div.cq-emulator-title").first();
        if (title) {
            title.update(this.emulatorManager.getCurrentEmulator().getTitle());
        }
    },

    createSwitchHandle: function(targetId, anchor, text, mode) {

        var scope = this;
        var el = CQ.Ext.get(targetId);
        el.setStyle("margin-" + anchor, CQ.wcm.emulator.EmulatorCarousel.EMULATOR_SWITCH_HANDLE_MARGIN + "px");

        if (el) {

            new CQ.Ext.ToolTip({
                                   "anchor": anchor,
                                   "id": targetId + "-tooltip",
                                   "html": text,
                                   "plain": true,
                                   "target": el
                               });

            el.on("click", function() {
                if ("next" == mode) {
                    this.emulatorManager.switchToNext();
                } else {
                    this.emulatorManager.switchToPrevious();
                }
                //todo: re-enable this as soon as the EmulatorManager sends switch-events
                //this.positionCarousel();
            }, scope);
        }
    },

    scaleCarousel: function() {

        var parent = this.carousel.parent();
        var contentX = this.carousel.getPadding("l") + this.carousel.getMargins("l");

        var availableWidth = parent.getWidth() - contentX - CQ.wcm.emulator.EmulatorCarousel.INSTRUMENTATION_WIDTH;
        var minWidth = CQ.wcm.emulator.EmulatorCarousel.EMULATORS_MIN_WIDTH;
        var fullWidth = this.emulatorManager.getEmulatorNames().length
                * CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH;


        var w;

        if (availableWidth <= minWidth) {
            w = minWidth;

        } else if (availableWidth > fullWidth) {
            w = fullWidth;

        } else {
            w = availableWidth;
        }

        // only update if the width has really changed
        if (this.emulatorContainer.getWidth() != w) {

            this.emulatorContainer.setWidth(w);
            this.carousel.setWidth(w + CQ.wcm.emulator.EmulatorCarousel.INSTRUMENTATION_WIDTH);

            this.positionCarousel();
        }
    },

    positionCarousel: function(animate) {

        if (null != this.scrollTask) {
            clearTimeout(this.scrollTask);
        }

        var index = this.emulatorManager.getEmulatorIndex(this.emulatorManager.getCurrentEmulator());
        var totalEmulators = this.emulatorDivs.length;
        var segments = (totalEmulators - 1) / 2;
        var middlePos = (this.emulatorContainer.getWidth() / 2)
                - (CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH / 2);

        if (animate) {

            var positionIndex = this.getPositionIndex(this.currentIndex, index, segments);
            var positionShift = (positionIndex - segments) * CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH;
            var pos = this.getCurrentBackgroundPosition() + (positionShift * -1);
            this.scrollBackground(pos);

        } else {

            var pos = middlePos - (index * CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH);
            var backgroundStyle = "url(\"" + CQ.HTTP.externalize(CQ.HTTP.getPath())
                                          + ".emulatorstrip.png\") repeat-x " + Math.floor(pos) + "px 0";

            this.emulatorContainer.setStyle("background", backgroundStyle);
        }

        this.currentIndex = index;

        // position the emulator divs above the background
        for (var i = 0; i < totalEmulators; i++) {

            var div = this.emulatorDivs[i];

            var divIndex = this.getPositionIndex(index, i, segments);

            var x = middlePos + ((divIndex - segments) * CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH);

            div.setPositioning({
                                   "left": x + "px"
                               });
        }
    },

    /**
     * @private
     */
    getPositionIndex: function(currentIndex, emulatorIndex, segments) {

        if (null == currentIndex) {
            currentIndex = 0;
        }

        var index = (emulatorIndex + (segments - currentIndex));
        if (index >= this.emulatorDivs.length) {
            index = index - this.emulatorDivs.length;

        } else if (index < 0) {
            index = index + this.emulatorDivs.length;
        }

        return index;
    },

    getCurrentBackgroundPosition: function() {
        var style = this.emulatorContainer.getStyle("background-position");

        if (style) {

            var positions = style.split(" ");
            return Number((positions.length > 1) ? positions[0].substring(0, positions[0].length - 2) : 0);
        }

        return null;
    },

    scrollBackground: function(endPos) {

        // ensure integer number
        endPos = Math.floor(endPos);

        var scope = this;
        var currentX = this.getCurrentBackgroundPosition();

        if (null != currentX) {

            if (currentX == endPos) {
                this.scrollTask = null;
                return;
            }

            if (currentX < endPos) {
                currentX += 1;
            } else {
                currentX -= 1;
            }

            this.emulatorContainer.setStyle("background-position", currentX + "px 0px");

            this.scrollTask = setTimeout(function() {
                scope.scrollBackground(endPos);
            }, 8);
        }
    }
});

/**
 * The HTML ID of the emulator's carousel.
 */
CQ.wcm.emulator.EmulatorCarousel.EMULATOR_CAROUSEL = "cq-emulator-carousel";

/**
 * The width of emulator thumbnails, used to calculate carousel position.
 */
CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH = 60;

CQ.wcm.emulator.EmulatorCarousel.EMULATOR_SWITCH_HANDLE_WIDTH = 20;

CQ.wcm.emulator.EmulatorCarousel.EMULATOR_SWITCH_HANDLE_MARGIN = 20;

/**
 * The height of an emulator thumbnail area
 */
CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_HEIGHT = 80;

/**
 * The minimum number of items in the carousel.
 */
CQ.wcm.emulator.EmulatorCarousel.MIN_NUMBER_OF_EMULATORS = 5;

/**
 * The width of the "instrumentation" of the carousel, i.e. the switch handles and their margins
 */
CQ.wcm.emulator.EmulatorCarousel.INSTRUMENTATION_WIDTH
        = (2 * CQ.wcm.emulator.EmulatorCarousel.EMULATOR_SWITCH_HANDLE_WIDTH)
        + (2 * CQ.wcm.emulator.EmulatorCarousel.EMULATOR_SWITCH_HANDLE_MARGIN);

CQ.wcm.emulator.EmulatorCarousel.EMULATORS_MIN_WIDTH
        = CQ.wcm.emulator.EmulatorCarousel.MIN_NUMBER_OF_EMULATORS
        * CQ.wcm.emulator.EmulatorCarousel.EMULATOR_THUMBNAIL_WIDTH;

/**
 * The minimum width of the carousel, as the width of the minimum number of emulators plus the instrumentation width.
 */
CQ.wcm.emulator.EmulatorCarousel.EMULATOR_CAROUSEL_MIN_WIDTH
        = CQ.wcm.emulator.EmulatorCarousel.EMULATORS_MIN_WIDTH
        + CQ.wcm.emulator.EmulatorCarousel.INSTRUMENTATION_WIDTH;

/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

CQ.wcm.emulator.EmulatorToolbar = CQ.Ext.extend(CQ.Ext.util.Observable, {

    emulatorManager: null,

    panel: null,

    emulatorInfo: null,

    showCarousel: null,

    carousel: null,

    groupWindow: null,

    groupInfo: null,

    groupInfoShowTask: null,


    constructor: function(manager, config) {

        this.emulatorManager = manager;
        this.showCarousel = config.showCarousel;

        config = CQ.Util.applyDefaults(config, {
        });

        if (this.showCarousel) {
            this.carousel = new CQ.wcm.emulator.EmulatorCarousel(this.emulatorManager, config);
        }

        CQ.wcm.emulator.EmulatorToolbar.superclass.constructor.call(this, config);
    },

    start: function() {
        var body = CQ.Ext.getBody();

        var toolbar = CQ.Ext.DomHelper.insertFirst(body,
                                                   {tag: "div", id: CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_ID},
                                                   true);

        var toggle = CQ.Ext.DomHelper.append(toolbar,
                                             {tag: "div", id: CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_TOGGLE_ID},
                                             true);

        var collapsed = CQ.HTTP.getCookie(CQ.wcm.emulator.EmulatorToolbar.COLLAPSED_STATE_COOKIE_NAME) == "true";

        this.panel = new CQ.Ext.Panel({
                                          "renderTo": CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_ID,
                                          "collapsed": collapsed,
                                          "items": [
                                              {
                                                  "id": CQ.wcm.emulator.EmulatorToolbar.CAROUSEL_ID,
                                                  "region": "center",
                                                  "xtype": "panel"
                                              }
                                          ]
                                      });

        this.panel.on("expand", function() {
            CQ.HTTP.setCookie(
                    CQ.wcm.emulator.EmulatorToolbar.COLLAPSED_STATE_COOKIE_NAME,
                    "false",
                    CQ.HTTP.externalize("/")
                    );
            CQ.Ext.getCmp("cq-emulator-tooltip-toggle").update(CQ.I18n.getMessage("Hide Emulator Toolbar"));
            this.fireEvent("expand", this, this);
        }, this);

        this.panel.el.on("mouseover", function() {
            this.showGroupInfo(true);
        }, this);

        this.panel.on("collapse", function() {
            CQ.HTTP.setCookie(
                    CQ.wcm.emulator.EmulatorToolbar.COLLAPSED_STATE_COOKIE_NAME,
                    "true",
                    CQ.HTTP.externalize("/")
                    );
            CQ.Ext.getCmp("cq-emulator-tooltip-toggle").update(CQ.I18n.getMessage("Show Emulator Toolbar"));
            this.fireEvent("collapse", this, this);
        }, this);

        if (collapsed) {
            toggle.addClass("up");
        } else {
            toggle.addClass("down");
        }

        toggle.on("click", function() {
            this.groupWindow.hide();
            this.setToggleClass(this.panel, toggle);
            this.panel.toggleCollapse(true);
            this.hideGroupInfo();
        }, this);

        new CQ.Ext.ToolTip({
                               id: CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_TOGGLE_TOOLTIP_ID,
                               anchorToTarget: false,
                               target: toggle,
                               html: collapsed ?
                                       CQ.I18n.getMessage("Show Emulator Toolbar") :
                                       CQ.I18n.getMessage("Hide Emulator Toolbar"),
                               plain: true
                           });

        this.emulatorInfo = CQ.Ext.DomHelper.append(
                toolbar,
                {tag: "div", id: CQ.wcm.emulator.EmulatorToolbar.INFO_ID},
                true);
        this.hideGroupInfo();

        var pageInfo = CQ.WCM.getPageInfo(CQ.HTTP.getPath());
        if (pageInfo && pageInfo["emulators"] && pageInfo["emulators"].groups) {
            this.groupInfo = pageInfo["emulators"].groups[this.emulatorManager.getCurrentEmulator().getGroup()];
            if (this.groupInfo) {
                CQ.Ext.DomHelper.overwrite(this.emulatorInfo,
                                           "<div id=\""
                                                   + CQ.wcm.emulator.EmulatorToolbar.DEVICEGROUP_DETAILS_ID
                                                   + "\">"
                                                   + CQ.I18n.getVarMessage(this.groupInfo.title)
                                                   + "<div id=\""
                                                   + CQ.wcm.emulator.EmulatorToolbar.DEVICEGROUP_INFOICON_ID
                                                   + "\"></div></div>"
                        );

                // Insert the preview QR code & iOS simulator download link
                var qrCodeURI = this.getPublishQRCodeURI();
                if (qrCodeURI != null && qrCodeURI.length > 0) {
                    CQ.Ext.DomHelper.append(toolbar,
                                "<a href=\"/apps/geometrixx-outdoors/src/ios-simulator/dist/GeoOutdoors.zip\" "
                                    + "target=\"_blank\" id=\""
                                    + CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_QR_CODE_ID
                                    + "\" style=\"background-image: url('"
                                    + qrCodeURI + "');\" border=\"0\">&nbsp;</a>"
                            );
                }


                // add click listener to show details for the device group
                this.infoIcon = CQ.Ext.get(CQ.wcm.emulator.EmulatorToolbar.DEVICEGROUP_INFOICON_ID);
                if (this.infoIcon) {

                    new CQ.Ext.ToolTip({
                                           id: "cq-emulator-tooltip-devicegroup-details",
                                           anchor: "left",
                                           target: this.infoIcon,
                                           html: CQ.I18n.getMessage("Show device group details..."),
                                           plain: true
                                       });

                    this.infoIcon.on('click', this.showInfo, this);
                }

                var buttons = [];
                if (null != this.groupInfo.path && this.groupInfo.path.length > 0) {
                    buttons = [
                        {
                            xtype: "textbutton",
                            handler: this.handleGroupEdit,
                            text: CQ.I18n.getMessage("Edit"),
                            id: "cq-emulator-info-groupwindow-editbutton",
                            scope: this
                        }
                    ];
                }

                this.groupWindow = new CQ.Ext.Window({
                                                         baseCls: "x-plain",
                                                         bbar: buttons,
                                                         closable: false,
                                                         header: false,
                                                         html: CQ.I18n.getVarMessage(this.groupInfo.description),
                                                         id: "cq-emulator-info-groupwindow",
                                                         plain: true,
                                                         resizable: false,
                                                         shadow: false,
                                                         stateful: false
                                                     });
            }
        }

        if (this.showCarousel) {
            this.carousel.start();
        }
    },

    setToggleClass: function(panel, toggle) {
        if (panel.collapsed) {
            toggle.removeClass("up");
            toggle.addClass("down");
        } else {
            toggle.removeClass("down");
            toggle.addClass("up");
        }
    },

    getCarousel: function() {
        return this.carousel;
    },

    showInfo: function() {
        if (!this.groupWindow.isVisible()) {
            this.groupWindow.show();
            this.groupWindow.alignTo(this.infoIcon, "tl-br", [-40, 5]);
            this.clearDelayedHideGroupInfo();
        } else {
            this.delayedHideGroupInfo(true);
            this.groupWindow.hide();
        }
    },

    getEmulatorInfo: function() {
        return this.emulatorInfo;
    },

    handleGroupEdit: function() {
        CQ.shared.Util.load(CQ.HTTP.externalize(this.groupInfo.path + ".html"));
    },

    getPanel: function() {
        return this.panel;
    },

    showGroupInfo: function(animate) {
        if (!this.emulatorInfo.isVisible()) {
            this.emulatorInfo.show(animate);
            this.delayedHideGroupInfo(true);
        }
    },

    clearDelayedHideGroupInfo: function() {
        if (null != this.groupInfoShowTask) {
            clearTimeout(this.groupInfoShowTask);
        }
        this.groupInfoShowTask = null;
    },

    delayedHideGroupInfo: function(animate) {
        var scope = this;
        this.clearDelayedHideGroupInfo();
        this.groupInfoShowTask = setTimeout(function() {
            scope.hideGroupInfo(animate);
        }, 4000);
    },

    hideGroupInfo: function(animate) {
        this.emulatorInfo.hide(animate);
    },
    
    /**
     * Returns a string URI to the current page on the publish CQ instance. The host name and port returned
     * can be configured via the Externalizer bundle.
     * This function depends on a global var set in publish_uri.jsp named cq5_currentPagePublishURI.
     */
    getPublishQRCodeURI: function() {
        try {
            return "/libs/wcm/mobile/qrcode.png?url=" + encodeURIComponent(cq5_currentPagePublishURI);
        } catch (e) {
            return null;
        }
    }
});


/**
 * The HTML ID of the emulator's information div
 */
CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_ID = "cq-emulator-toolbar";

CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_TOGGLE_ID = "cq-emulator-toolbar-toggle";

CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_TOGGLE_TOOLTIP_ID = "cq-emulator-tooltip-toggle";

CQ.wcm.emulator.EmulatorToolbar.INFO_ID = "cq-emulator-info";

CQ.wcm.emulator.EmulatorToolbar.CAROUSEL_ID = "cq-emulator-toolbar-carousel";

CQ.wcm.emulator.EmulatorToolbar.DEVICEGROUP_INFOICON_ID = "cq-emulator-devicegroup-infoicon";

CQ.wcm.emulator.EmulatorToolbar.DEVICEGROUP_DETAILS_ID = "cq-emulator-devicegroup-details";

CQ.wcm.emulator.EmulatorToolbar.COLLAPSED_STATE_COOKIE_NAME = "cq-emulator-toolbar-collapsed";

CQ.wcm.emulator.EmulatorToolbar.TOOLBAR_QR_CODE_ID = "cq-emulator-qrcode";
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */


/**
 * The base for all emulator plugins.
 */
CQ.wcm.emulator.plugins.BasePlugin = CQ.Ext.extend(CQ.Ext.Component, {

    emulator: null,
    config: null,

    constructor: function(config) {
        CQ.Util.applyDefaults(config, {

        });

        this.config = config;

        CQ.wcm.emulator.plugins.BasePlugin.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.wcm.emulator.plugins.BasePlugin.superclass.initComponent.call(this);
    },

    /**
     * Abstract method to be implemented by plugins.
     */
    executeStart: function(emulator, config) {
    },

    /**
     * Abstract method to be implemented by plugins.
     */
    executeStop: function(emulator, config) {
    }
});
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */


/**
 * This plugin adds rotation ability to the emulator.
 */
CQ.wcm.emulator.plugins.RotationPlugin = CQ.Ext.extend(CQ.wcm.emulator.plugins.BasePlugin, {

    /**
     * @cfg {String} Denotes the default device orientation (if the device supports rotation at all).
     * Valid values are either "vertical" or "horizontal".
     */
    defaultDeviceOrientation: null,

    /**
     * @private {CQ.wcm.Emulator} The emulator.
     */
    emulator: null,

    /**
     * @private {CQ.Ext.Element} The element representing the overall emulator div.
     */
    emulatorElement: null,

    /**
     * @private {CQ.Ext.Element} The element representing the emulator device screen / content area.
     */
    emulatorContentElement: null,

    /**
     * @private {CQ.Ext.Element} The element representing the clickable area for initiating device rotation.
     * This is only set if the device supports rotation (see #canRotate()).
     */
    rotator: null,

    initComponent: function() {
        CQ.wcm.emulator.plugins.RotationPlugin.superclass.initComponent.call(this);

        this.addEvents(CQ.wcm.emulator.plugins.RotationPlugin.EVENT_ROTATED);
    },

    /**
     * This method adds the rotator's control div (button to click and initiate rotation) to the given emulator,
     * registers the necessary listeners for click-initiating rotation and on mouse over rotator FX.
     * It also sets the CSS classes for styling the rotator.
     * @param {CQ.wcm.emulator.Emulator} emulator The emulator this plugin is executed within.
     * @param {Object} config The plugin execution config.
     */
    executeStart: function(emulator, config) {

        this.emulator = emulator;

        CQ.Util.applyDefaults(config, {
            defaultDeviceOrientation: CQ.wcm.emulator.plugins.RotationPlugin.DEFAULT_DEVICE_ORIENTATION
        });

        this.defaultDeviceOrientation
                = CQ.HTTP.getCookie(CQ.wcm.emulator.plugins.RotationPlugin.ORIENTATION_COOKIE_NAME);

        if (!this.defaultDeviceOrientation) {
            this.defaultDeviceOrientation = config.defaultDeviceOrientation;
        }

        this.emulatorElement = emulator.getMainElement();
        this.emulatorContentElement = emulator.getContentElement();
        //this.emulatorElement.addClass(emulator.getName());
        //this.emulatorContentElement.addClass(emulator.getName());
        this.emulatorElement.addClass(this.defaultDeviceOrientation);
        this.emulatorContentElement.addClass(this.defaultDeviceOrientation);

        this.rotator = CQ.Ext.DomHelper.insertBefore(
                this.emulatorContentElement,
        {tag: "div",
            id: CQ.wcm.emulator.plugins.RotationPlugin.ROTATE_ID,
            html: CQ.I18n.getMessage("Rotate")
        },
                true);

        this.rotator.addClass(emulator.getName());
        this.rotator.addClass(this.defaultDeviceOrientation);

        this.rotator.on({
            'click' : {
                fn: this.rotate,
                scope: this
            },
            'mouseover' : {
                fn: this.rotateOnMouseOver,
                scope: this
            },
            'mouseout' : {
                fn: this.rotateOnMouseOut,
                scope: this
            }
        });

        new CQ.Ext.ToolTip({
            anchor: "left",
            target: CQ.wcm.emulator.plugins.RotationPlugin.ROTATE_ID,
            html: CQ.I18n.getMessage("Rotate this device..."),
            plain: true
        });
    },

    /**
     * This method removes the rotator div from the surrounding emulator.
     * @param {CQ.wcm.emulator.Emulator} emulator The emulator this plugin is executed within.
     * @param {Object} config The plugin execution config.
     */
    executeStop: function(emulator, config) {
        this.rotator.remove(true);
        this.rotator = null;
        this.emulatorElement.removeClass(this.defaultDeviceOrientation);
        this.emulatorContentElement.removeClass(this.defaultDeviceOrientation);
    },

    /**
     * Executes the rotation of the emulator. This means simply applying the classes "vertical" or "horizontal"
     * (depending on the current device orientation) to the emulator divs. As such the actual change in appearance
     * is solely controlled via CSS classes. The method also fires the "rotated" event.
     */
    rotate: function() {
        var oldClass = this.getDeviceOrientation();
        var newClass = (oldClass == CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_VERTICAL)
                ? CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_HORIZONTAL
                : CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_VERTICAL;

        this.emulatorElement.replaceClass(oldClass, newClass);
        this.emulatorContentElement.replaceClass(oldClass, newClass);
        this.rotator.replaceClass(oldClass, newClass);

        CQ.HTTP.setCookie(
                CQ.wcm.emulator.plugins.RotationPlugin.ORIENTATION_COOKIE_NAME,
                newClass,
                CQ.HTTP.externalize("/")
                );

        this.emulator.fireEvent(CQ.wcm.emulator.plugins.RotationPlugin.EVENT_ROTATED, this, this.emulator);
    },

    /**
     * Fades in the rotator control element.
     */
    rotateOnMouseOver: function() {
        this.rotator.shift({opacity: 1, duration: .35});
    },

    /**
     * Fades out the rotator control element.
     */
    rotateOnMouseOut: function() {
        this.rotator.shift({opacity: .2, duration: .35});
    },

    /**
     * Indicates the current device orientation, either "vertical" or "horizontal".
     * @return {String} "vertical" or "horizontal".
     */
    getDeviceOrientation: function() {
        var emulator = this.emulatorElement;
        return (emulator.hasClass(CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_VERTICAL))
                ? CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_VERTICAL
                : CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_HORIZONTAL;
    }
});

/**
 * The name / type of this plugin.
 */
CQ.wcm.emulator.plugins.RotationPlugin.NAME = "cq-rotation";

/**
 * The name of the event fired upon device rotation occurring.
 */
CQ.wcm.emulator.plugins.RotationPlugin.EVENT_ROTATED = "rotated";

/**
 * The HTML ID of the rotator div (control element)
 */
CQ.wcm.emulator.plugins.RotationPlugin.ROTATE_ID = "cq-emulator-rotate";

/**
 * The name of the device orientation in horizontal state.
 */
CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_HORIZONTAL = "horizontal";

/**
 * The name of the device orientation in vertical state.
 */
CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_VERTICAL = "vertical";

/**
 * The name of the cookie storing the current device orientation
 */
CQ.wcm.emulator.plugins.RotationPlugin.ORIENTATION_COOKIE_NAME = "cq-emulator-rotate-orientation";

/**
 * The default device orientation.
 */
CQ.wcm.emulator.plugins.RotationPlugin.DEFAULT_DEVICE_ORIENTATION
        = CQ.wcm.emulator.plugins.RotationPlugin.DEVICE_ORIENTATION_VERTICAL;

// register the plugin
CQ.wcm.emulator.plugins.PluginRegistry.register(
        CQ.wcm.emulator.plugins.RotationPlugin.NAME,
        CQ.wcm.emulator.plugins.RotationPlugin
        );
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * This plugin inserts header and footer divs at the beginning and end of the emulator content viewport, so that
 * via CSS the presence of the phone browser UI can be simulated.
 */
CQ.wcm.emulator.plugins.BrowserUIPlugin = CQ.Ext.extend(CQ.wcm.emulator.plugins.BasePlugin, {

    /**
     * @private {CQ.Ext.Element} The element representing the emulator device screen / content area.
     */
    content: null,

    /**
     * @private {String} The current device orientation.
     */
    deviceOrientation: null,

    /**
     * @private {CQ.Ext.Element} The element representing browser header of the UI.
     */
    browserHeader: null,

    /**
     * @private {CQ.Ext.Element} The element representing browser footer of the UI.
     */
    browserFooter: null,


    initComponent: function() {
        CQ.wcm.emulator.plugins.BrowserUIPlugin.superclass.initComponent.call(this);
    },

    /**
     * This method adds header and footer divs that can be fitted with browser UI CSS.
     *
     * @param {CQ.wcm.emulator.Emulator} emulator The emulator this plugin is executed within.
     * @param {Object} config The plugin execution config.
     */
    executeStart: function(emulator, config) {

        CQ.Util.applyDefaults(config, {
        });

        this.content = emulator.getContentElement();

        emulator.on(CQ.wcm.emulator.plugins.RotationPlugin.EVENT_ROTATED, this.handleRotate, this);

        this.deviceOrientation
                = CQ.HTTP.getCookie(CQ.wcm.emulator.plugins.RotationPlugin.ORIENTATION_COOKIE_NAME);

        if (!this.deviceOrientation) {
            this.deviceOrientation = CQ.wcm.emulator.plugins.RotationPlugin.DEFAULT_DEVICE_ORIENTATION;
        }

        this.browserHeader = CQ.Ext.DomHelper.insertFirst(this.content, {
            tag: "div",
            id: CQ.wcm.emulator.plugins.BrowserUIPlugin.ID_HEADER
        }, true);

        this.browserFooter = CQ.Ext.DomHelper.append(this.content, {
            tag: "div",
            id: CQ.wcm.emulator.plugins.BrowserUIPlugin.ID_FOOTER
        }, true);

        // set the relevant style classes (device specific, including orientation)
        this.browserHeader.addClass(emulator.getName());
        this.browserHeader.addClass(this.deviceOrientation);
        this.browserFooter.addClass(emulator.getName());
        this.browserFooter.addClass(this.deviceOrientation);
    },

    /**
     * This method removes the browser UI divs.
     *
     * @param {CQ.wcm.emulator.Emulator} emulator The emulator this plugin is executed within.
     * @param {Object} config The plugin execution config.
     */
    executeStop: function(emulator, config) {
        this.browserHeader.remove();
        this.browserFooter.remove();
    },

    handleRotate: function(rotator, emulator) {
        this.browserHeader.removeClass(this.deviceOrientation);
        this.browserFooter.removeClass(this.deviceOrientation);
        this.deviceOrientation = rotator.getDeviceOrientation();
        this.browserHeader.addClass(this.deviceOrientation);
        this.browserFooter.addClass(this.deviceOrientation);
    }
});

/**
 * The name / type of this plugin.
 */
CQ.wcm.emulator.plugins.BrowserUIPlugin.NAME = "cq-emulator-browserui";

/**
 * The CSS ID of the browser UI header
 */
CQ.wcm.emulator.plugins.BrowserUIPlugin.ID_HEADER = "cq-emulator-browserui-header";

/**
 * The CSS ID of the browser UI footer
 */
CQ.wcm.emulator.plugins.BrowserUIPlugin.ID_FOOTER = "cq-emulator-browserui-footer";

// register the plugin
CQ.wcm.emulator.plugins.PluginRegistry.register(
        CQ.wcm.emulator.plugins.BrowserUIPlugin.NAME,
        CQ.wcm.emulator.plugins.BrowserUIPlugin
        );
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */


/**
 * This plugin ensures that WCM edit control elements (edit rollovers, edit bars, insert zones) are only visible within
 * the emulator's content div, thus simulating iFrame behavior of the page content. This is done via observing
 * all present "editables" of the page and applying CSS clipping dependent on the editable's position and intersection
 * with the emulator content div.
 */
CQ.wcm.emulator.plugins.ClipEditablesPlugin = CQ.Ext.extend(CQ.wcm.emulator.plugins.BasePlugin, {

    content: null,

    clippingElement: null,

    /**
     * Execute the plugin for the emulator's "start" scope.
     * @param {CQ.wcm.emulator.Emulator} emulator The emulator the plugin is executed within.
     * @param {Object} config The plugin's execution config.
     */
    executeStart: function(emulator, config) {

        this.content = emulator.getContentElement();

        this.clippingElement = config && config.clippingElement ? CQ.Ext.get(config.clippingElement) : null;

        if (CQ.WCM.areEditablesReady()) {

            this.registerInterceptors();

        } else {

            CQ.WCM.on("editablesready", function() {
                this.registerInterceptors();
            }, this);
        }
    },

    /**
     * Registers an "interceptor" on the currently present editables. The interceptor is called whenever the
     * editable's intercepted function is executed. The observe function is called every 20ms.
     * @private
     */
    registerInterceptors: function() {
        var scope = this;
        var editables = CQ.WCM.getEditables();
        for (var idx in editables) {
            var editable = editables[idx];
            if (editable.observe) {
                editable.observe = editable.observe.createSequence(function() {
                    scope.handleEditable(this);
                });
            }
        }
    },

    /**
     * This method checks whether the given editable is within the viewable area of the emulator's content div or
     * within the clipping element provided with the configuration if set.
     * The editable is fitted with a CSS clip property that corresponds to the visible intersection of the editable
     * and the emulator's content div. If the editable is outside the viewable area, the clipping is set to 0,
     * effectively hiding the editable.
     * @param {Object} editable The editable provided by CQ.WCM.getEditables().
     */
    handleEditable: function(editable) {

        var viewPortRegion = this.clippingElement ? this.clippingElement.getRegion() : this.content.getRegion();
        var clipElements = this.getClipElements(editable);

        for (var i = 0; i < clipElements.length; i++) {
            var element = clipElements[i];
            var elementRegion = element.getRegion();
            if (elementRegion) {

                // default clip is hide element entirely.
                var styleValue = "rect(0,0,0,0)";

                // get the intersecting region of the two regions
                var intersection = viewPortRegion.intersect(elementRegion);

                // if an intersection is found, the element is fully or partially visible within the view port div.
                if (intersection) {

                    // set the editable's CSS clip to only show the visible intersection within the view port div.
                    var top = intersection.top - elementRegion.top;
                    var right = intersection.right - elementRegion.left;
                    var bottom = intersection.bottom - elementRegion.top;
                    var left = intersection.left - elementRegion.left;
                    styleValue = "rect(" + top + "px, " + right + "px, " + bottom + "px, " + left + "px)";
                }

                // finally set the calculated style.
                this.setClipStyle(element, styleValue);
            }
        }
    },

    /**
     * This method determines which of the various UI elements of an editables are present and thus need clipping.
     * Currently the edit rollover frames and the insert zone are checked for.
     * @param {Object} editable The editable to check.
     * @private
     */
    getClipElements: function(editable) {
        var elements = [];

        if (!editable.hidden && !editable.disabled && !editable.elementHidden) {

            // this element represents the "insert paragraph" for example
            if (editable.emptyComponent && editable.emptyComponent.el) {
                elements.push(editable.emptyComponent.el);
            }

            // this element represents the edit / design bar
            if (editable.el) {
                elements.push(editable.el);
            }

            // this element represents the rollover frames of an editable
            if (editable.highlight && editable.highlight.frameTop.rendered) {
                elements.push(editable.highlight.frameTop.el);
                elements.push(editable.highlight.frameRight.el);
                elements.push(editable.highlight.frameBottom.el);
                elements.push(editable.highlight.frameLeft.el);

                if (editable.highlight.lock && editable.highlight.lock.rendered) {
                    elements.push(editable.highlight.lock.el);
                }
            }

            // this element represents the MSM markers frames of an editable
            if (editable.liveStatus && editable.liveStatus.frameTop && editable.liveStatus.frameTop.rendered) {
                elements.push(editable.liveStatus.frameTop.el);
                elements.push(editable.liveStatus.frameRight.el);
                elements.push(editable.liveStatus.frameBottom.el);
                elements.push(editable.liveStatus.frameLeft.el);
            }
        }

        return elements;
    },

    /**
     * Applies the given clipping value to the given element's clip CSS property.
     * @param {CQ.Ext.Element} element The element to apply the clip to.
     * @param styleValue The CSS clip property value to apply.
     * @private
     */
    setClipStyle: function(element, styleValue) {
        if (element) {
            element.setStyle("clip", styleValue);
        }
    }
});

/**
 * The name / type of this plugin.
 */
CQ.wcm.emulator.plugins.ClipEditablesPlugin.NAME = "cq-clip-editables";

// register the plugin
CQ.wcm.emulator.plugins.PluginRegistry.register(
        CQ.wcm.emulator.plugins.ClipEditablesPlugin.NAME,
        CQ.wcm.emulator.plugins.ClipEditablesPlugin
        );
/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * This plugin emulates touch-scrolling: removes the standard browser scrollbar for the emulator content area,
 * provides on-mouse-over scroll UI and reacts to mouse-wheel scroll events.
 */
CQ.wcm.emulator.plugins.TouchScrollingPlugin = CQ.Ext.extend(CQ.wcm.emulator.plugins.BasePlugin, {

    /**
     * @cfg {Number} The number of pixels to be scrolled up or down upon a scroll event (mouse wheel / click on
     * scroll handles). Default is 20 with a scroll factor of 1.
     */
    scrollDistance: null,

    /**
     * @private {CQ.Ext.Element} The element representing the emulator device screen / content area.
     */
    content: null,

    /**
     * @private {CQ.wcm.emulator.plugins.TouchScrollingPlugin.Tracker} The tracker of the scroll pos.
     */
    tracker: null,


    initComponent: function() {
        CQ.wcm.emulator.plugins.TouchScrollingPlugin.superclass.initComponent.call(this);
    },

    /**
     * This method adds a css class to disable browser scrollbars in the emulator content area. It also
     * registers a mouse wheel listener to enable scrolling. Additionally a tracker is started that
     * visually shows scrolling progress.
     *
     * @param {CQ.wcm.emulator.Emulator} emulator The emulator this plugin is executed within.
     * @param {Object} config The plugin execution config.
     */
    executeStart: function(emulator, config) {

        CQ.Util.applyDefaults(config, {
            scrollDistance: CQ.wcm.emulator.plugins.TouchScrollingPlugin.DEFAULT_SCROLL_DISTANCE
        });

        // set the scrolling distance in pixels
        this.scrollDistance = config.scrollDistance;

        this.content = emulator.getContentElement();

        // set the css class that disables OOTB browser scrolling (overflow = hidden)
        this.content.addClass(CQ.wcm.emulator.plugins.TouchScrollingPlugin.CSS_CLASS_NAME_OVERFLOW);

        // register observation on mousewheel action on the content area, so we can scroll ourselves.
        this.content.addListener("mousewheel", this.handleWheel, this);

        this.tracker = new CQ.wcm.emulator.plugins.TouchScrollingPlugin.Tracker(emulator);
    },

    /**
     * This method removes the scrolling css class, the mouse wheel listener and stops the scrolling tracker.
     *
     * @param {CQ.wcm.emulator.Emulator} emulator The emulator this plugin is executed within.
     * @param {Object} config The plugin execution config.
     */
    executeStop: function(emulator, config) {
        this.content.removeClass(CQ.wcm.emulator.plugins.TouchScrollingPlugin.CSS_CLASS_NAME_OVERFLOW);
        this.content.removeListener("mousewheel", this.handleWheel);
        this.tracker.stop();
        this.tracker = null;
    },

    handleWheel: function(event) {

        var delta = event.getWheelDelta();
        var distance = Math.abs(delta * this.scrollDistance);

        if (delta > 0) {

            this.content.scroll("up", distance, false);
            this.tracker.update(this.content.getScroll().top);

        } else if (delta < 0) {

            this.content.scroll("down", distance, false);
            this.tracker.update(this.content.getScroll().top);
        }

        event.stopEvent();
    }
});

/**
 * The name / type of this plugin.
 */
CQ.wcm.emulator.plugins.TouchScrollingPlugin.NAME = "cq-touchscrolling";

/**
 * The name of the CSS class regulating the overflow of the emulator's content div.
 */
CQ.wcm.emulator.plugins.TouchScrollingPlugin.CSS_CLASS_NAME_OVERFLOW = "cq-touchscrolling-overflow";

/**
 * The default scroll distance of 20 pixels.
 */
CQ.wcm.emulator.plugins.TouchScrollingPlugin.DEFAULT_SCROLL_DISTANCE = 20;

// register the plugin
CQ.wcm.emulator.plugins.PluginRegistry.register(
        CQ.wcm.emulator.plugins.TouchScrollingPlugin.NAME,
        CQ.wcm.emulator.plugins.TouchScrollingPlugin
        );


/**
 * This class tracks scrolling progress of the TouchScrollingPlugin and displays a visual scrolling
 * tracker.
 */
CQ.wcm.emulator.plugins.TouchScrollingPlugin.Tracker = CQ.Ext.extend(CQ.Ext.emptyFn, {

    /**
     * @private {CQ.Ext.Element} The element representing the emulator device screen / content area.
     */
    content: null,

    /**
     * @private {CQ.Ext.Element} The element representing the scrolling tracker container.
     */
    trackerContainer: null,

    /**
     * @private {CQ.Ext.Element} The element representing the scrolling tracker.
     */
    tracker: null,

    /**
     * @private {String} The current device orientation.
     */
    deviceOrientation: null,

    /**
     * @private {CQ.Ext.util.DelayedTask} The tracker task responsible for hiding the tracker after scroll ends.
     */
    trackerTask: null,


    constructor: function(emulator) {

        this.content = emulator.getContentElement();

        // register observation on device rotation, since this influences the position of the scroll tracker
        emulator.on(CQ.wcm.emulator.plugins.RotationPlugin.EVENT_ROTATED, this.handleRotate, this);

        this.deviceOrientation
                = CQ.HTTP.getCookie(CQ.wcm.emulator.plugins.RotationPlugin.ORIENTATION_COOKIE_NAME);

        if (!this.deviceOrientation) {
            this.deviceOrientation = CQ.wcm.emulator.plugins.RotationPlugin.DEFAULT_DEVICE_ORIENTATION;
        }

        // put the tracker div in the DOM
        this.trackerContainer = CQ.Ext.DomHelper.insertBefore(
                this.content,
        {tag: "div",
            id: CQ.wcm.emulator.plugins.TouchScrollingPlugin.Tracker.ID_CONTAINER
        },
                true
                );

        this.tracker = CQ.Ext.DomHelper.append(
                this.trackerContainer,
        {tag: "div",
            id: CQ.wcm.emulator.plugins.TouchScrollingPlugin.Tracker.ID_TRACKER
        },
                true
                );

        // set the relevant style classes (device specific, including orientation)
        this.trackerContainer.addClass(emulator.getName());
        this.trackerContainer.addClass(this.deviceOrientation);
        this.trackerContainer.hide();

        this.trackerTask = new CQ.Ext.util.DelayedTask(this.hide, this);
    },

    stop: function() {
        this.trackerContainer.remove();
    },

    update: function(scrollPos) {

        if (!this.trackerContainer.isVisible()) {

            var height = (this.content.getHeight() / this.content.dom.scrollHeight)
                    * this.trackerContainer.getHeight();
            this.tracker.setHeight(height);

            this.trackerContainer.show();
            //this.trackerContainer.shift({opacity: 1, duration: .25});
        }

        var top = (this.content.getScroll().top / this.content.dom.scrollHeight)
                * this.trackerContainer.getHeight();
        top = Math.min(top, (this.trackerContainer.getHeight() - this.tracker.getHeight()));
        this.tracker.setTop(top);

        this.trackerTask.delay(400);
    },

    handleRotate: function(rotator, emulator) {
        this.trackerContainer.removeClass(this.deviceOrientation);
        this.deviceOrientation = rotator.getDeviceOrientation();
        this.trackerContainer.addClass(this.deviceOrientation);
    },

    hide: function() {
        //this.trackerContainer.shift({opacity: 0, duration: .25});
        this.trackerContainer.hide();
        this.trackerTask.cancel();
    }
});

CQ.wcm.emulator.plugins.TouchScrollingPlugin.Tracker.ID_CONTAINER = "cq-touchscrolling-trackercontainer";
CQ.wcm.emulator.plugins.TouchScrollingPlugin.Tracker.ID_TRACKER = "cq-touchscrolling-tracker";
