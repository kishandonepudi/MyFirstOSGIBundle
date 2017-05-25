/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

// initialize CQ.search package
CQ.search = {};

// initialize CQ.themes.search package
CQ.themes.search = {};
/*
 * Copyright 1997-2009 Day Management AG
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
 * The <code>CQ.search.Util</code> contains utilities for a globally set
 * {@link CQ.search.QueryBuilder Query Builder} and {@link CQ.search.Lens lenses}.
 * @static
 * @class CQ.search.Util
 */
CQ.search.Util = function() {

    /**
     * The global {@link CQ.search.QueryBuilder Query Builder}.
     * @type CQ.search.QueryBuilder
     */
    var queryBuilder = null;

    /**
     * An optional container to hold multiple lenses (e.g. a {@link CQ.search.LensDeck lens deck}).
     * @type CQ.search.LensContainer
     */
    var lensContainer = null;

    /**
     * The unique lens or the active lens of {@link #lensContainer}.
     * @type CQ.search.Lens
     */
    var lens = null;

    /**
     * The action to execute on double click on a result.
     * @type Function
     */
    var dblClickAction = function(){};

    return {
        /**
         * Sets the Query Builder.
         * @param {CQ.search.QueryBuilder} qBuilder The Query Builder
         */
        setQueryBuilder: function(qBuilder) {
            queryBuilder = qBuilder;
        },

        /**
         * Returns the Query Builder.
         * @return {CQ.search.QueryBuilder} The Query Builder
         */
        getQueryBuilder: function() {
            return queryBuilder;
        },

        /**
         * Sets the lens container.
         * @param {CQ.search.LensContainer} container The lens container
         */
        setLensContainer: function(container) {
            lensContainer = container;
        },

        /**
         * Returns the lens container or <code>null</code> if no container is set.
         * @return {CQ.search.LensContainer} The lens container
         */
        getLensContainer: function() {
            return lensContainer;
        },

        /**
         * Returns the active lens of the lens container or the solely lens.
         * @return {CQ.search.LensContainer/CQ.search.Lens}
         */
        getLens: function() {
            if (lensContainer) {
                return lensContainer.getCurrentLens();
            }
            else {
                return lens;
            }
        },

        /**
         * Adds a lens to the lens container or - if no container is defined -
         * sets the solely lens.
         * @param {CQ.search.Lens} le The lens
         * @param {String} name The name of the lens (optional for a solely lens but required for lens containers)
         * @param {Object} buttonConfig The config object of the button (optional for a solely lens but required for lens containers)
         */
        addLens: function(le, name, buttonConfig) {
            if (lensContainer) {
                lensContainer.add(le, name, buttonConfig);
            }
            else {
                lens = le;
            }
        },

        /**
         * Passes the given data to the lens container or - if no
         * containter is defined - to the solely lens.
         * @param {Object} data
         */
        loadData: function(data) {
            if (lensContainer) {
                lensContainer.loadData(data);
            }
            else if (lens) {
                lens.loadData(data);
                lens.doLayout();
            }
        },

        /**
         * Returns the selection of the active lens.
         * @return {Object/Array} The selected items (typically a CQ.Ext.data.Record)
         */
        getSelection: function() {
            return this.getLens().getSelection();
        },

        /**
         * Returns the paths of the selected items
         * @return {Array} The selected paths
         */
        getSelectedPaths: function() {
            var s = this.getSelection();
            var paths = [];
            for (var i = 0; i < s.length; i++) {
                paths.push(s[i]["jcr:path"]);
            }
            return paths;
        },


        setDblClickAction: function(func) {
            dblClickAction = func;
        },

        resultDblClick: function() {
            if (dblClickAction) {
                dblClickAction(arguments);
            }
        }

    };

}();
/*
 * Copyright 1997-2009 Day Management AG
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
 * The <code>CQ.search.QueryBuilder</code> class provides a form panel to build
 * search queries.
 * <pre><code>
var qb = new CQ.search.QueryBuilder({
    "form": new CQ.Ext.form.BasicForm("qb-form", {
        "method": "GET",
        "url": "/bin/querybuilder.json"
    },
    "renderFieldsTo": "qb-form"
});
qb.setTypes(["dam:Asset"]);
qb.setPath(["/content/dam/geometrixx/travel", "/content/dam/geometrixx/documents"]);

CQ.search.Util.setQueryBuilder(qb);
   </pre></code>

 Use {@link CQ.search.Util#setQueryBuilder} in order to easily access the Query Builder
 at other places using {@link CQ.search.Util#getQueryBuilder} to e.g. submit it.

 * @class CQ.search.QueryBuilder
 * @extends CQ.Ext.Panel
 */
CQ.search.QueryBuilder = CQ.Ext.extend(CQ.Ext.Panel, {

    /**
     * @cfg {CQ.Ext.form.BasicForm} form
     * The form of the Query Builder.
     */

	/**
	 * @cfg {String} renderFieldsTo
     * The ID of the HTML element where fields will be added to (when using {@link #addField}).
	 */
	renderFieldsTo: null,

    // todo: limit etc as config options
    offset: 0,

    limit: 5,

    // the fields of the base paths
    pathFields: [],

    pathPredicateName: "path",

    /**
     * @cfg {String} rssLinkUrl
     * The URL for an RSS feed. If it is set every submit will update the
     * according link in the header of the top most document.
     */
    rssLinkUrl: "",

    /**
     * Counters to generate unique predicate and group IDs.
     * @private
     * @type Number
     */
    idCounter: 0,

    /**
     * Charset for the form POST.
     * @private
     */
    charset: "utf-8",

    /**
     * Creates a new <code>CQ.search.QueryBuilder</code> instance.
     * @constructor
     * @param {Mixed} el The form element or its id
     * @param {Object} config Configuration options
     */
    constructor: function(config) {
		this.renderFieldsTo = config.renderFieldsTo;
//        CQ.search.Util.setQueryBuilder(this);
        CQ.search.QueryBuilder.superclass.constructor.call(this, config);

        // add events
        this.addEvents(
            /**
             * @event loadResult
             * Fires after search results have been loaded.
             */
            'loadResult',

            /**
             * @event loadError
             * Fires if loading the results fails.
             */
            'loadError'
        );
    },

    /**
     * Adds a hidden field to the form.
     * @param {String} name The name of the hidden field
     * @param {String} value The value of hidden field
     * @return {CQ.Ext.form.Hidden} The created hidden field.
     */
	addHidden: function(name, value) {
		if (!this.form) {
			return null;
		}
        var hidden = new CQ.Ext.form.Hidden({
            "renderTo": this.form.el.dom,
            "name": name,
            "value": value
        });
        this.form.add(hidden);
        return hidden;
	},

    /**
     * Sets the value of a hidden field. If no field of the specified
     * name exists it will be created.
     * @param {String} name The name of the hidden field
     * @param {String} value The value of hidden field
     * @return {CQ.Ext.form.Hidden} The created hidden field
     */
	setHidden: function(name, value) {
        if (!this.form) {
            return null;
        }
		var field = this.form.findField(name);
		if (field) {
			field.setValue(value);
            return field;
		} else {
			return this.addHidden(name, value);
		}
	},

    // @deprecated
    // no usages in CQ 5.4 code base
    addToHiddenGroup: function(groupName, value) {
        var groupId = this.createGroupId() + "." + groupName;
        this.setHidden(groupId, value);
        return groupId;
    },

    /**
     * Adds a field to the form.
     * @param {Object} config The config of the field
     * @return {CQ.Ext.form.Field} The created field
     */
	addField: function(config) {
        if (!this.form || !config) {
            return null;
        }
		if (!config.renderTo) {
			config.renderTo = this.renderFieldsTo;
		}
        var field = CQ.Util.build(config);
		this.form.add(field);
        return field;
	},
	
	/**
     * Removes the field from the form.
     * @param {CQ.Ext.form.Field} field The field to be removed.
     * No-op if field is not present.
     */
	removeField: function(field) {
		if (field.el) {
			field.el.remove();
        }
		this.form.remove(field);
	},

    /**
     * Sets the options to restrain the search to certain paths. If a {@link #setPathPredicateName path predicate}
     * is set the paths set by <code>setPaths</code> are ignored.
     * @param {String[]} paths The paths
     */
    setPaths: function(paths) {
        this.pathfields = [];
        //todo: remove existing paths?
        var groupId = this.createGroupId();
        for (var i = 0; i < paths.length; i++) {
            this.pathFields.push(this.setHidden(groupId + "." + i + "_path", paths[i]));
        }
        if (paths.length > 1) {
            this.setHidden(groupId + ".p.or", "true");
        }
    },

    /**
     * Sets the options to restrain the search to certain node types.
     * @param {String[]} types The node types
     */
    setTypes: function(types, /* optional */ groupId) {
        if (!groupId) {
            groupId = this.createGroupId();
        }
        for (var i = 0; i < types.length; i++) {
            this.setHidden(groupId + "." + i + "_type", types[i]);
        }
        if (types.length > 1) {
            this.setHidden(groupId + ".p.or", "true");
        }
    },

    // @deprecated
    // no usages in CQ 5.4 code base
    replaceTypes: function(types) {
        var groupId = null;
        var fields = this.form.items;
        fields.each(function(field) {
                var name = field.getName();
                var nameLen = name.length;
                if ((nameLen > 5) && (name.substring(nameLen - 5, nameLen) == "_type")) {
                    var groupSep = name.indexOf(".");
                    groupId = name.substring(0, groupSep);
                    return false;
                }
                return true;
            }, this);
        if (groupId != null) {
            var fieldsToRemove = [ ];
            fields.each(function(field) {
                    var name = field.getName();
                    var groupSep = name.indexOf(".");
                    if (groupSep > 0) {
                        if (name.substring(0, groupSep) == groupId) {
                            fieldsToRemove.push(field);
                        }
                    }
                    return true;
                }, this);
            for (var r = 0; r < fieldsToRemove.length; r++) {
                var fieldToRemove = fieldsToRemove[r];
                if (fieldToRemove.el) {
                    fieldToRemove.el.remove();
                }
                this.form.remove(fieldToRemove);
            }
        }
        this.setTypes(types, groupId);
    },

    /**
     * Sets the name of the path predicate. If it is set and the value of the according
     * form field is not empty this value will be used to restrain the search. Otherwise
     * the paths set in {@link #setPaths} restrain the search.
     *
     * @param {String} name
     */
    setPathPredicateName: function(name) {
        this.pathPredicateName = name;
    },

    /**
     * Creates a unique ID for a predicate group.
     * @return {String} The unique ID
     */
    createGroupId: function() {
        return this.createId("group");
    },

    /**
     * Creates a unique ID for a predicate.
     * @param {String} name The name (optional)
     * @return {String} The unique ID
     */
    createId: function(name) {
        if (!name) name = "predicate";
        return this.idCounter++ + "_" + name;
    },

    /**
     * Sets the limit of results to return. The limit corresponds to the results
     * per page.
     * @param {Number} limit
     */
    setLimit: function(limit) {
        this.limit = parseInt(limit);
        this.setHidden("p.limit", this.limit);
    },

    /**
     * Browses in the results one page forward.
     */
    nextPage: function() {
        this.page(1);
    },

    /**
     * Browses in the results one page back.
     */
    lastPage: function() {
        this.page(-1);
    },

    // private
    page: function(delta) {
        var offset = this.limit * delta + this.offset;
        this.submit(offset);
    },

    /**
     * Sets the {@link #rssLinkUrl}.
     * @param {String} url The URL
     */
    setRssLinkUrl: function(url) {
        this.rssLinkUrl = url;
    },

    /**
     * Set the charset of the request.
     * @param {String} charset
     */
    setCharset: function(charset) {
        this.charset = charset;
    },

    /**
     * Build and submits the query.
     * @param {Number} offset The offset of the first result item related to all results (allows paging)
     */
    submit: function(offset) {
        if (!this.form) {
            return;
        }

        this.offset = offset ? offset : 0;
        this.setHidden("p.offset", this.offset);

        if (this.pathFields.length > 0) {
            // check if there is a path predicate with a value set. if yes, disable
            // the base paths
            var p = this.form.findField(this.pathPredicateName);
            if (p) {
                var doEnable = p.getValue() == "";
                for (var i = 0; i < this.pathFields.length; i++) {
//                    if (doEnable) this.pathFields[i].getEl().dom.removeAttribute("disabled");
//                    else this.pathFields[i].getEl().dom.setAttribute("disabled", "disabled");
                    if (doEnable) this.pathFields[i].enable();
                    else this.pathFields[i].disable();
                }
            }
        }

		var qb = this;
        var config = {
            "params": {
                "_charset_": this.charset
            },
            "success": function(form, action) {
                try {
                    CQ.search.Util.loadData(action.result);
                    qb.currentPage = Math.floor(action.result.offset / qb.limit) + 1;
                    qb.totalPages = Math.ceil(action.result.total / qb.limit);
                    qb.fireEvent("loadResult", action.result, qb);
                }
                catch (e) {
                    qb.fireEvent("loadError", qb);
                }
            },
            "failure": function() {
                qb.fireEvent("loadError", qb);
            }
        };
        var action = new CQ.Ext.form.Action.Submit(this.form, config);
        this.form.doAction(action);

        if (qb.rssLinkUrl) {
            var values = this.form.getValues();
            var cookieValue = "p.limit=-1";
            for (var name in values) {
                if (values[name] === "" || name == "p.limit" || name == "p.offset") {
                    // atom feed: avoid empty values in cookie; limit is hardcoded "-1"; avoid offset
                    continue;
                }
                cookieValue += "&" + encodeURIComponent(name) + "=" + encodeURIComponent(values[name]);
            }
            CQ.HTTP.setCookie("cq-mrss", cookieValue, "/bin");
        }
    }

});


CQ.Ext.reg("querybuilder", CQ.search.QueryBuilder);
/*
 * Copyright 1997-2009 Day Management AG
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
 * The <code>CQ.search.Lens</code> class provides an abstract lens.
 * @class CQ.search.Lens
 * @extends CQ.Ext.Panel
 * @constructor
 * @param {Object} config The config object
 */
CQ.search.Lens = CQ.Ext.extend(CQ.Ext.Panel, {

    /**
     * @cfg {String} text
     * The text of the lens as used in certain {@link LensContainer containers}
     * e.g. for the button of a {@link LensDeck#tabTip}
     * @private
     */
    // (tabTip seems not to work for LensDeck)
    text: "",

    constructor: function(config) {
        CQ.search.Lens.superclass.constructor.call(this, config);
    },

    /**
     * Loads the given data
     * @param {Object} data
     */
    loadData: function(data) {
    },

    /**
     * Returns the selected items
     * @return {Array} The selected items
     */
    getSelection: function() {
    }

});

CQ.Ext.reg("lens", CQ.search.Lens);
/*
 * Copyright 1997-2009 Day Management AG
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
 * The <code>CQ.search.DataViewLens</code> class provides a lens that uses a
 * DataView to display results.
 * @class CQ.search.DataViewLens
 * @extends CQ.search.Lens
 */
CQ.search.DataViewLens = CQ.Ext.extend(CQ.search.Lens, {


    /**
     * @cfg {Object} storeConfig
     * The config object for the {@link CQ.Ext.DataView#store store} of the data view.
     */
    storeConfig: null,


    initComponent: function() {
        CQ.search.DataViewLens.superclass.initComponent.call(this);

        try {
            this.dataView = this.findByType("dataview")[0];
        }
        catch (e) {}
    },


    /**
     * Creates a new <code>CQ.search.DataViewLens</code> instance.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {

        if (!config.store) {
            // use default store

            var storeConfig = CQ.Util.applyDefaults(config.storeConfig, {
                "reader": new CQ.Ext.data.JsonReader({
                    "totalProperty": "results",
                    "root": "hits",
                    "fields": [
                        "jcr:path", "jcr:content", "jcr:created"
                    ],
                    "id": "path"
                }),
                "baseParams": {
                    "_charset_": "utf-8"
                },
                "listeners": {
                    "load": function(store, records, options) {
                        store.records = records;
                    }
                }
            });
        }

// todo: move mosaic/dam specific config to mosaic lens resp. DamDataViewLens
        config = CQ.Util.applyDefaults(config, {
            "autoScroll": true,
            "border": false,
            "items": {
                "xtype": "dataview",
                "cls": "cq-cft-dataview",
                "loadingText": CQ.I18n.getMessage("Loading content..."),
                "multiSelect": true,
                "singleSelect": true,
                "overClass": "x-view-over",
                "emptyText": CQ.I18n.getMessage("No assets available"),
                "autoHeight": true,
                "tpl":
                    '<tpl for=".">' +
                        '<div class="wrapper">' +
                            '<div class="item">' +
                                '<div class="thumbnail"' +
                                    ' style="background-image:url(\'{[CQ.HTTP.externalize(values.path,true)]}.thumb.100.140{[values.ck ? "." + values.ck : ""]}.png\');"' +
                                    ' ondblclick="CQ.search.Util.resultDblClick(event, \'{[CQ.shared.XSS.getXSSValue(values.id)]}\',\'{[CQ.shared.XSS.getXSSValue(values.path)]}\');"' +
                                    ' qtip="{[CQ.shared.XSS.getXSSValue(values.shortPath)]}<br/>' +
                                    '{[CQ.shared.XSS.getXSSValue(values.name)]}"' +
                                '></div>' +
                                '<div class="title">{[CQ.shared.XSS.getXSSValue(values.shortTitle)]}</div>' +
                                '<div class="text">{[values.imageDimensions ? values.imageDimensions : ""]}</div>' +
                                //'{[values.imageWidth && values.imageHeight ? values.imageWidth + " &times; " + values.imageHeight  + "<br/>": ""]}' +
                            '</div>' +
                        '</div>' +
                    '</tpl>' +
                    '<div class="x-clear"></div>',
                "itemSelector": ".item",
                "store": new CQ.Ext.data.GroupingStore(storeConfig),
                "prepareData": function(data) {
                    var meta = data["jcr:content"]["metadata"];
                    data.meta = meta;
                    data.name = "";
                    data.title = "";
                    data.shortTitle = "";
                    data.shortPath = "";

                    try {
                        var mod = data["jcr:content"]["renditions"]["cq5dam.thumbnail.48.48.png"]["jcr:content"]["jcr:lastModified"];
                        data.ck = new Date(mod).getTime();
                    }
                    catch(e) {}
                    data.id = this.id;

                    data.path = data["jcr:path"];
                    try {
                        data.name = data.path.substring(data.path.lastIndexOf("/") + 1);
                        data.shortPath = data.path.substring(0, data.path.lastIndexOf("/") + 1);
                        var ellipsis = "";
                        while (data.shortPath.length > 28) {
                            if (data.shortPath.indexOf("/") == data.shortPath.lastIndexOf("/")) break;
                            data.shortPath = data.shortPath.substring(data.shortPath.indexOf("/") + 1);
                            ellipsis = ".../";
                        }
                        data.shortPath = ellipsis + data.shortPath;

                        if (meta && meta["dc:title"]) {
                            var t = meta["dc:title"];
                            if (t instanceof Array) data.title = t[0];
                            else data.title = t;
                        }
                        //the array above for title might have an empty string at 0th index
                        if (!data.title) {
                            data.title = data.name;
                        }
                        data.shortTitle = CQ.Ext.util.Format.ellipsis(data.title, 25);
                    }
                    catch (e) {}

                    data.path = CQ.HTTP.encodePath(data.path);

                    try {
                        // encode values for HTML output in JS
                        data.name = data.name.replace(/"/g, "&quot;").replace(/'/g,"&#39");
                        data.title = data.title.replace(/"/g, "&quot;").replace(/'/g,"&#39");
                        data.shortTitle = data.shortTitle.replace(/"/g, "&quot;").replace(/'/g,"&#39");
                        data.shortPath = data.shortPath.replace(/"/g, "&quot;").replace(/'/g,"&#39");
                    }
                    catch (e) {}

                    try {
                        var md = meta ? meta["dam:ModificationDate"] : undefined ;
                        var mdParsed = null;
                        if (md) {
                            mdParsed = new Date(md);
                            if (isNaN(mdParsed)) {
                                mdParsed = Date.parseDate(md, "c");
                            }
                        }
                        if (mdParsed && !isNaN(mdParsed)) data.modificationDate = mdParsed;
                    }
                    catch (e) {}

                    try {
                        var cd = meta ? meta["dam:CreationDate"] : undefined;
                        var cdParsed = null;
                        if (cd) {
                            cdParsed = new Date(cd);
                            if (isNaN(cdParsed)) {
                                cdParsed = Date.parseDate(data.creationDate, "c");
                            }
                        }
                        else {
                            cdParsed = new Date(data["jcr:created"]);
                        }
                        if (cdParsed && !isNaN(cdParsed)) data.creationDate = cdParsed;
                    }
                    catch (e) {}

                    data.imageDimensions = "";
                    if (meta && meta["tiff:ImageWidth"] && meta["tiff:ImageLength"]) {
                        data.imageDimensions = meta["tiff:ImageWidth"] + " &times; " + meta["tiff:ImageLength"];
                    }

                    return data;
                }
//                "listeners": {
//                    "dblclick": function() {
//                        CQ.search.Util.assetDblClick();
//                    }
//                }
            }
        });

        CQ.search.DataViewLens.superclass.constructor.call(this, config);
    },

    loadData: function(data) {
        if (this.dataView) {
            this.dataView.store.loadData(data);
        }
    },

    getSelection: function() {
        try {
            var r = this.dataView.getSelectedRecords();
            var s = [];
            for (var i = 0; i < r.length; i++) {
                s.push(r[i].json);
            }
            return s;
        }
        catch (e) {
            return [];
        }
    }

});


CQ.Ext.reg("dataviewlens", CQ.search.DataViewLens);
/*
 * Copyright 1997-2009 Day Management AG
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
 * The <code>CQ.search.IFrameLens</code> class provides a lens that uses an
 * iFrame.
 * @class CQ.search.IFrameLens
 * @extends CQ.search.Lens
 * @private (not documented, currently no working sample exists)
 */
CQ.search.IFrameLens = CQ.Ext.extend(CQ.search.Lens, {


    /**
     * @cfg {Object} storeConfig
     */
    // private
    storeConfig: null,


    iframe: null,

    /**
     * Creates a new <code>CQ.search.IFrameLens</code> instance.
     *
     * Example:
     * <pre><code>
    //todo
});
       </pre></code>
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {
        var id = config.id ? config.id : CQ.Util.createId();
        config = CQ.Util.applyDefaults(config, {
            "renderTo": CQ.Util.ROOT_ID,
            "id": id,
            "html": '<iframe src="' + (config.url ? config.url : CQ.Ext.SSL_SECURE_URL) + '"' +
                    ' id="' + id + '_iframe" ' +
                    ' style="width:100%;height:100%;overflow:auto;border:none;' +
                    ' border="0" frameborder="0"></iframe>'
        });

        CQ.search.IFrameLens.superclass.constructor.call(this, config);
    },

    getIFrame: function() {
        if (!this.iframe) {
            this.iframe = document.getElementById(this.id + "_iframe");
        }
        return this.iframe;
    },

    loadData: function(data) {
        var f = this.getIFrame();
        var url = this.url;
        for (var i = 0; i < data.hits.length; i++) {
            url = CQ.utils.HTTP.addParameter(url, "path", data.hits[i].path);
        }
        f.src = url;
    },

    getSelection: function() {
        var f = this.getIFrame();
        try {
            return f.contentWindow.getSelection();
        }
        catch (e) {
            return [];
        }
    }

});


CQ.Ext.reg("iframelens", CQ.search.IFrameLens);
/*
 * Copyright 1997-2009 Day Management AG
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
 * The <code>CQ.search.LensContainer</code> class provides an abstract container
 * for lenses.
 * @class CQ.search.LensContainer
 * @extends CQ.Ext.Panel
 */
//todo: extend CQ.search.Lens?
CQ.search.LensContainer = CQ.Ext.extend(CQ.Ext.Panel, {

    /**
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {
        CQ.search.LensContainer.superclass.constructor.call(this, config);
    },

    /**
     * Loads the given data into the active lens.
     * @param {Object} data
     */
    loadData: function(data) {
    },

    /**
     * Returns the selected items of the active lens.
     * @return {Object/Array} The selected items (typically a CQ.Ext.data.Record)
     */
    getSelection: function() {
    },

    /**
     * Returns the active lens.
     * @return {CQ.search.Lens} The active lens
     */
    getCurrentLens: function() {
    }

});

/*
 * Copyright 1997-2009 Day Management AG
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
 * The <code>CQ.search.LensDeck</code> class provides a deck panel for lenses.
 * @class CQ.search.LensDeck
 * @extends CQ.search.LensContainer
 */
CQ.search.LensDeck = CQ.Ext.extend(CQ.search.LensContainer, {

    /**
     * @private
     */
    lastData: null,

    /**
     * @cfg {Mixed} renderButtonsTo
     * The default {@link CQ.Ext.Component#renderTo renderTo} property for the deck buttons.
     * If undefined the buttons are rendered to same element as the deck.
     */
    renderButtonsTo: null,

    /**
     * @cfg {Boolean} activateFirstLens
     * If true the first added lens will be activated.
     */

    /**
     * @private
     */
    lenses: [],

    /**
     * Creates a new <code>CQ.search.LensDeck</code> instance.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {

        config = CQ.Util.applyDefaults(config, {
            "renderButtonsTo": config.renderTo,
            "border": false,
            "activateFirstLens": true
        });

        CQ.search.LensDeck.superclass.constructor.call(this, config);
    },

    initComponent : function(){
        CQ.search.LensDeck.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event switch
             * Fires when the active lens changes
             * @param {CQ.search.LensDeck} this
             * @param {CQ.search.Lens} oldLens the previously active lens (could be null)
             * @param {CQ.search.Lens} newLens the newly active lens (could be null)
             */
            'switch'
        );
    },

    getCurrentLens: function() {
        return this.activeItem;
    },

    loadData: function(data) {
        this.lastData = data;
        this.activeItem.loadData(data);
        this.doLayout();
        this.activeItem.doLayout();
    },

    getSelection: function() {
        return this.activeItem.getSelection();
    },

    // managing lenses

    /**
     * Adds a new {@link CQ.search.Lens} to this deck. A button to activate
     * the lens will be added to the button bar of the deck.
     * @param {CQ.search.Lens} widget The lens to add
     * @param {String} name The name of the lens. Will also be used for the
     *        {@link CQ.Ext.Button#iconCls iconCls} of the button.
     * @param {Object} buttonConfig The config object of the button
     */
    add: function(widget, name, buttonConfig) {
        try {
            var deck = this;
            buttonConfig = CQ.Util.applyDefaults(buttonConfig, {
                "toggleGroup": "cq-lensdeck", //todo: id
                "enableToggle": true,
                "allowDepress": false,
                "iconCls": name ? name : "",
                "renderTo": widget.renderButtonTo ? widget.renderButtonTo : this.renderButtonsTo,
                "text": widget.buttonText ? widget.buttonText : "",
                "tabTip": widget.text ? widget.text : "",
                "pressed": this.lenses.length == 0, //first lens
                "listeners": {
                    "click": function() {
                        deck.setActiveItem(widget.id);
                        if (deck.lastData && deck.activeItem.loadLastData) {
                            deck.activeItem.loadData(deck.lastData);
                        }
                    }
                }
            });
            var b = new CQ.Ext.Button(buttonConfig);
            widget.lensName = name;
            widget.button = b;
            // default value
            if (typeof widget.loadLastData === "undefined") {
                widget.loadLastData = true;
            }
            CQ.search.LensDeck.superclass.add.call(this, widget);
            this.lenses.push(widget);
        }
        catch (e) {
            //console.log(e.message);
        }

        if (this.activateFirstLens && this.lenses.length == 1) {
            this.setActiveItem(widget.id);
        }
    },

    /**
     * Activates the lens of the given ID. Fires the 'switch' event.
     * @param {String} id The id of the lens to activate
     * @return {Object} The activated lens
     */
    setActiveItem: function(id) {
        var oldLens = this.activeItem;

        for (var i = 0; i < this.lenses.length; i++) {
            if (this.lenses[i].id == id) {
                this.activeItem = this.lenses[i];
                this.activeItem.show();
            }
            else {
                this.lenses[i].hide();
            }
        }

        this.fireSwitch(oldLens, this.activeItem);

        return this.activeItem;
    },

    /**
     * Activates the lens of the given name as set in {@link #add}. Fires the 'switch' event.
     * @param {String} name The name of the lens to activate
     * @return {CQ.search} The activated lens
     */
    setActiveLens: function(name) {
        var oldLens = this.activeItem;

        for (var i = 0; i < this.lenses.length; i++) {
            if (this.lenses[i].lensName == name) {
                // unselect the button for the previously active lens
                if (this.activeItem) {
                    this.activeItem.button.toggle(false);
                }
                this.activeItem = this.lenses[i];
                // select the button for the now active lens
                this.activeItem.button.toggle(true);
                this.activeItem.show();
            }
            else {
                this.lenses[i].hide();
            }
        }

        this.fireSwitch(oldLens, this.activeItem);

        return this.activeItem;
    },

    // private stuff

    /**
     * @private
     */
    fireSwitch: function(oldLens, newLens) {
        this.fireEvent('switch', this, oldLens, newLens);
    }


});


CQ.Ext.reg("lensdeck", CQ.search.LensDeck);
