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
 *************************************************************************/


CQ.commerce = {};

CQ.commerce.Edit = function() {

    return {
        /**
         *
         */
        buildProduct: function(dataPath, catalogPath, log) {
            CQ.HTTP.post(
                CQ.HTTP.externalize("/libs/commerce/products"),
                function(options, success, response) {
                    var startTag = "<body>",
                        endTag = "</body>",
                        t = response.responseText,
                        responseBody = t.substring(t.indexOf(startTag) + startTag.length, t.indexOf(endTag));

                    if (log) {
                        log.removeAll(true);
                        log.add({
                            html: responseBody,
                            bodyBorder: false,
                            style: "padding:2px"
                        });
                        log.doLayout();
                        log.show();
                    }
                },
                {
                    "_charset_": "utf-8",
                    ":operation": "buildVariantHierarchy",
                    "productDataPath": dataPath,
                    "catalogPath": catalogPath
                },
                null,
                true
            );
        },

        productAfterEdit: function() {
            CQ.HTTP.post(
                CQ.HTTP.externalize("/libs/commerce/products"),
                function(options, success, response) {
                    this.refreshPage();
                },
                {
                    "_charset_": "utf-8",
                    ":operation": "checkVariantHierarchy",
                    "catalogPath": this.path
                },
                this,
                true
            );
        }
    }

}();
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
 *************************************************************************/

/**
 * @class CQ.commerce.TemplateRolloutProps
 * @extends CQ.Ext.Container
 * The TemplateRolloutProps container allows an application to customize the generation and rollout
 * of templated pages, such as in catalog generation.
 *
 * The contents of the container (a {@link CQ.Ext.form.FieldSet}) will be generated from the current
 * application's components/template-rollout-props/fieldset.xml, if found.  The fieldset.xml should
 * define fields which write to ./target/propName for properties directly on the templated page, or
 * to ./target/componentPath/propName for properties within the templated content.
 *
 * For instance, /apps/geometrixx-outdoors/components/template-rollout-props/fieldset.xml contains
 * a field which writes the banner path to ./target/par/banner/fileReference.
 */
CQ.commerce.TemplateRolloutProps = CQ.Ext.extend(CQ.Ext.Container, {

    constructor: function(config) {
        config = (!config ? {} : config);

        var defaults = {
            "hidden": true
        };

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.commerce.TemplateRolloutProps.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.commerce.TemplateRolloutProps.superclass.initComponent.call(this);

        this.on("render", function() {
            var parentDialog = this.findParentByType("dialog");
            if (parentDialog) {
                parentDialog.on("loadcontent", function(dialog, recs, opts, success) {
                    // We're going to ask our parentDialog to reload after constructing our fieldset, so
                    // make sure we don't loop endlessly:
                    if (this.loaded) {
                        return;
                    }

                    // If parentDialog.path is: /content/catalogs/geometrixx-outdoors/base-catalog
                    // then we want to look in: /apps/geometrixx-outdoors/templates/custom-section-props
                    var application = null;
                    var parts = dialog.path.split("/");
                    if (parts.length > 4 && parts[0] == "" && parts[1] == "content" && parts[2] == "catalogs") {
                        application = parts[3];
                    }
                    if (application) {
                        var customPropsUrl = CQ.HTTP.externalize("/apps/" + application + "/components/template-rollout-props/fieldset.infinity.json");
                        var response = CQ.HTTP.eval(customPropsUrl);
                        if (response) {
                            this.add(CQ.Util.build(response));
                            this.loaded = true;

                            this.doLayout();
                            this.show();

                            // Go around again so that our new fields get loaded:
                            dialog.processRecords(recs, opts, success);
                        }
                    }
                }, this);
            }
        }, this);
    }
});

CQ.Ext.reg("templaterolloutprops", CQ.commerce.TemplateRolloutProps);
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
 *************************************************************************/

/**
 * @class CQ.commerce.PromotionTypeSelection
 * @extends CQ.form.Selection
 * The PromotionTypeSelection is a specific {@link CQ.form.Selection} to select
 * the a promotion type and render its type-specific tab into the dialog.
 * @constructor
 * Creates a new PromotionTypeSelection.
 * @param {Object} config The config object
 * @private
 */
CQ.commerce.PromotionTypeSelection = CQ.Ext.extend(CQ.form.Selection, {

    /**
     * @cfg {String} tabId
     * The id of the tab to add the form action fields to.
     */
    tabId:null,

    /**
     * Loaded data
     */
    loadedData:null,

    constructor: function(config) {
        var defaults = {
            options:"/libs/commerce/components/promotion.promotionoptions.json",
            type:"select",
            tabId:"cq5_promotion_config_panel"
        };

        var select = this;
        CQ.Util.applyDefaults(config, defaults);
        CQ.commerce.PromotionTypeSelection.superclass.constructor.call(this, config);
        this.tabId = config.tabId;
        this.addListener(CQ.form.Selection.EVENT_SELECTION_CHANGED, function(component, value) {
            if (value == this.lastValue) {
                return;
            }
            this.lastValue = value;
            this.notifyChange(value);
        });
    },

    initComponent : function() {
        CQ.commerce.PromotionTypeSelection.superclass.initComponent.call(this);
    },

    getComboText: function(value) {
        var store = this.comboBox.getStore();
        var i = store.find("value", value);
        return store.getAt(i).data.text;
    },

    /**
     * Value changed - update config tab
     */
    notifyChange: function(value) {
        var dialog = this.findParentByType("dialog");
        var configTab = dialog.find("componentId", this.tabId)[0];
        if (configTab != null) {
            var isTab = configTab.ownerCt instanceof CQ.Ext.TabPanel;
            var form = configTab.findParentByType("form");

            if (!this.configTabEmpty) {
                configTab.items.each(function(item, index, length) {
                    form.processRemove(item);
                    if (item instanceof CQ.form.Selection && item.optionItems) {
                        for (var i = 0; i < item.optionItems.length; i++) {
                            form.processRemove(item.optionItems.itemAt(i));
                        }
                    }
                    configTab.remove(item);
                }, this);
                var workaroundRemoveLabels = CQ.Ext.DomQuery.select("div[class*='x-form-item']", configTab.getEl().dom);
                for (var x = 0; x < workaroundRemoveLabels.length; x++) {
                    workaroundRemoveLabels[x].parentNode.removeChild(workaroundRemoveLabels[x]);
                }
            }

            if (isTab) {
                configTab.setTitle(this.getComboText(value));
            }
            configTab.doLayout();

            var url = value + "/dialog.overlay.infinity.json";
            var response = CQ.utils.HTTP.get(url);
            this.configTabEmpty = true;
            if (CQ.HTTP.isOk(response)) {
                var items = CQ.utils.Util.formatData(CQ.Util.eval(response));
                for (var i in items) {
                    if (!items[i] || (typeof items[i] == "string") || (typeof items[i] == "boolean")) {
                        continue;
                    }
                    var wi = configTab.add(items[i]);
                    form.processAdd(wi);
                    this.configTabEmpty = false;
                    configTab.doLayout();
                    wi.processRecord(this.loadedData);
                }
                configTab.doLayout();
            }

            if (isTab) {
                var tabPanel = configTab.findParentByType("tabpanel");
                if (this.configTabEmpty) {
                    tabPanel.hideTabStripItem(configTab)
                } else {
                    tabPanel.unhideTabStripItem(configTab)
                }
            } else if (this.configTabEmpty) {
                configTab.add({
                    "xtype": "static",
                    "cls": "x-form-fieldset-description",
                    "text": CQ.I18n.getMessage("There are no additional settings for this promotion type.")
                });
                this.configTabEmpty = false;
                configTab.doLayout();
            }
        }
    },

    /**
     * Overwrite handling to get all loaded values
     */
    processRecord: function(record, path) {
        this.loadedData = record;
        CQ.commerce.PromotionTypeSelection.superclass.processRecord.call(this, record, path);
    },

    /**
     * Overwrite handling of the initial set
     */
    setValue: function(value) {
        CQ.commerce.PromotionTypeSelection.superclass.setValue.call(this, value);
        this.notifyChange(value);
    }
});

CQ.Ext.reg("promotiontypeselection", CQ.commerce.PromotionTypeSelection);
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
 *************************************************************************
 */
/**
 * @class CQ.commerce.CsvProductImporter
 * @extends CQ.Ext.Viewport
 * Imports commerce data from a .csv file.
 * @constructor
 * Creates a new importer.
 * @param {Object} config The config object
 */
CQ.commerce.CsvProductImporter = CQ.Ext.extend(CQ.Ext.Viewport, {
    constructor : function(config) {
        var defaults = {
            csvPathDescription: CQ.I18n.getMessage("Delimited text file (.csv) containing product definitions"),
            importButtonLabel: CQ.I18n.getMessage("Import Products"),
            operation: "import",
            storeNameDescription: CQ.I18n.getMessage("Products will be imported to /etc/commerce/products/{store name}/"),
            url: "/libs/commerce/products"
        };
        CQ.Util.applyDefaults(config, defaults);

        this.results = document.createElement("iframe");
        this.results.id = "results_cq-csvproductimporter";
        this.results.name = "results_cq-csvproductimporter";
        this.results.height = "100%";
        this.results.width = "100%";
        this.results.onload = this.onResultsLoad;
        this.results.onreadystatechange = this.onResultsLoad;

        var importer = this;
        CQ.commerce.CsvProductImporter.superclass.constructor.call(this, {
            "id" :"cq-csvproductimporter",
            "layout":"border",
            "renderTo":CQ.Util.getRoot(),
            "items" : [
                {
                    "id":"cq-csvproductimporter-wrapper",
                    "xtype":"panel",
                    "region":"center",
                    "layout":"border",
                    "border":false,
                    "items": [
                        {
                            "id":"cq-header",
                            "xtype":"container",
                            "autoEl":"div",
                            "region":"north",
                            "items": [
                                {
                                    "xtype":"panel",
                                    "border":false,
                                    "layout":"column",
                                    "cls": "cq-header-toolbar",
                                    "items": [
                                        new CQ.UserInfo({}),
                                        new CQ.HomeLink({})
                                    ]
                                }
                            ]
                        },{
                            "xtype" :"form",
                            "id" :"cq-csvproductimporter-form",
                            "title": config["jcr:title"],
                            "region":"center",
                            "fileUpload" : true,
                            "standardSubmit" : true,
                            "autoScroll": true,
                            "border":false,
                            "labelWidth": 130,
                            "margins":"5 5 5 5",
                            "autoHeight": true,
                            "defaults" : {
                                "anchor" : "-54"
                            },
                            "style" : "background-color:white",
                            "bodyStyle" : "padding:10px",
                            "items" : [
                                {
                                    "xtype" : "textfield",
                                    "fieldLabel" : CQ.I18n.getMessage("Store Name"),
                                    "fieldDescription" : config.storeNameDescription,
                                    "name" : "storeName",
                                    "allowBlank" : false
                                },{
                                    "xtype" : "selection",
                                    "type" : "select",
                                    "fieldLabel" : CQ.I18n.getMessage("Commerce Provider"),
                                    "name" : "provider",
                                    "options" : "/libs/commerce/providers.json",
                                    "allowBlank" : false,
                                    "listeners" : {
                                        render : function(selection) {
                                            var comboBox = selection.comboBox;
                                            if (comboBox.store.getTotalCount() < 1) {
                                                comboBox.setValue(CQ.I18n.getMessage("No commerce providers installed."));
                                                comboBox.addClass(comboBox.emptyClass);
                                                selection.el.addClass(selection.invalidClass);
                                            } else if (!selection.getValue()) {
                                                selection.setValue(comboBox.store.getAt(0).data.value);
                                            }
                                        }
                                    }
                                },{
                                    "xtype" : "pathfield",
                                    "fieldLabel" : CQ.I18n.getMessage("CSV File"),
                                    "fieldDescription" : config.csvPathDescription,
                                    "name" : "csvPath",
                                    "allowBlank" : false,
                                    "rootPath": "/etc/commerce",
                                    "modeless": true
                                },{
                                    "fieldLabel": CQ.I18n.getMessage("Create Missing Tags"),
                                    "xtype":"selection",
                                    "type":"checkbox",
                                    "name":"createMissingTags"
                                },{
                                    "xtype": "hidden",
                                    "name": ":operation",
                                    "value": config.operation
                                },{
                                    "xtype": "hidden",
                                    "name": "_charset_",
                                    "value": "utf-8"
                                }
                            ],
                            "buttonAlign": "left",
                            "buttons":[
                                {
                                    "id":"cq-csvproductimporter-btn-import",
                                    "text": config.importButtonLabel,
                                    "minWidth": 120,
                                    "handler": function() {
                                        var form = CQ.Ext.getCmp("cq-csvproductimporter-form").getForm();
                                        if (form.isValid()) {
                                            var btn = CQ.Ext.getCmp("cq-csvproductimporter-btn-import");
                                            btn.setDisabled(true);

                                            var log = CQ.Ext.getCmp("cq-csvproductimporter-log");
                                            log.expand();

                                            // submit form
                                            form.getEl().dom.action = CQ.HTTP.externalize(config.url);
                                            form.getEl().dom.method = "POST";
                                            form.getEl().dom.target = "results_cq-csvproductimporter";
                                            form.submit();
                                        }
                                    }
                                },
                                new CQ.Ext.ProgressBar({
                                    "id":"cq-csvproductimporter-progress",
                                    "width":400,
                                    "hidden":true
                                })
                            ]
                        },{
                            "xtype":"panel",
                            "id" :"cq-csvproductimporter-log",
                            "region":"south",
                            "title":CQ.I18n.getMessage("Import Log"),
                            "margins":"-5 5 5 5",
                            "height": 300,
                            "collapsible": true,
                            "collapsed": false,
                            "items":[
                                new CQ.Ext.BoxComponent({
                                    "autoEl": {
                                        "tag": "div"
                                    },
                                    "style": {
                                        "width": "100%",
                                        "height": "100%",
                                        "margin": "-2px"
                                    },
                                    "border": false,
                                    "listeners":{
                                        render:function(wrapper) {
                                            new CQ.Ext.Element(importer.results).appendTo(wrapper.getEl());
                                        }
                                    }
                                })
                            ],
                            "plugins":[
                                {
                                    init: function(p) {
                                        if (p.collapsible) {
                                            var r = p.region;
                                            if ((r == "north") || (r == "south")) {
                                                p.on("collapse", function() {
                                                    var ct = p.ownerCt;
                                                    if (ct.layout[r].collapsedEl && !p.collapsedTitleEl) {
                                                        p.collapsedTitleEl = ct.layout[r].collapsedEl.createChild ({
                                                            tag:"span",
                                                            cls:"x-panel-collapsed-text",
                                                            html:p.title
                                                        });
                                                    }
                                                }, false, {single:true});
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    },

    onResultsLoad: function() {
        var btn = CQ.Ext.getCmp("cq-csvproductimporter-btn-import");
        btn.setDisabled(false);
    }
});
CQ.Ext.reg("csvproductimporter", CQ.commerce.CsvProductImporter);
