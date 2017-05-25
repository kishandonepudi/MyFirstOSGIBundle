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

// initialize CQ.personalization package
CQ.personalization = {};

CQ.Ext.StoreMgr.register(new CQ.Ext.data.SimpleStore({
    storeId: "clickstreamstore",
    data: [],
    fields: ["key", "value"],
    id: 0
}));


CQ_Analytics.ClickstreamcloudMgr.addListener("storesloaded", function(e) {
    var data = new Array();
    var dataMgrs = {
        profile: CQ_Analytics.ProfileDataMgr,
        pagedata: CQ_Analytics.PageDataMgr,
        surferinfo: CQ_Analytics.SurferInfoMgr,
        eventdata: CQ_Analytics.EventDataMgr
    };
    for(var mgr in dataMgrs) {
        if( dataMgrs[mgr] ) {
            var profileNames = dataMgrs[mgr].getPropertyNames();
            var title = CQ_Analytics.ClickstreamcloudMgr.getUIConfig(mgr).title;
            for(var i=0; i < profileNames.length; i++) {
                if (!CQ.shared.XSS.KEY_REGEXP.test(profileNames[i])) {
                    data.push([mgr + "." + profileNames[i], mgr + "." + profileNames[i] ]);
                }
            }
        }
    }
    CQ.Ext.StoreMgr.lookup("clickstreamstore").loadData(data);
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
 * @class CQ.personalization.EditableClickstreamcloud
 * @extends CQ.Dialog
 * EditableClickstreamcloud is a dialog allowing to edit the Clickstreamcloud by providing access to the properties
 * of the Clickstreamcloud session stores.
 * It mainly contains {@link CQ.personalization.EditableClickstreamcloud.FormSection FormSection}.
 * @deprecated since 5.5
 * @constructor
 * Creates a new EditableClickstreamcloud.
 * @param {Object} config The config object
 */
CQ.personalization.EditableClickstreamcloud = CQ.Ext.extend(CQ.Dialog, {
    constructor: function(config) {
        config = (!config ? {} : config);
        this.fieldsContainer = new CQ.Ext.TabPanel({});
        var currentObj = this;
        var defaults = {
            "id": "cq-editable-clickstreamcloud",
            "title": CQ.I18n.getMessage("Edit the current Clickstream Cloud"),
            "width": 400,
            "height": 400,
            "warnIfModified": false,
            "animCollapse": false,
            "collapsible": true,
            "stateful": true,
            "items": this.fieldsContainer,
            "buttons": [{
                "text": CQ.I18n.getMessage("Add"),
                "tooltip": CQ.I18n.getMessage("Add a new property"),
                "handler": function() {
                    var section = currentObj.getActiveSection();
                    if (section) {
                        section.addFieldHandler();
                    }
                }
            },{
                "text": CQ.I18n.getMessage("Remove"),
                "tooltip": CQ.I18n.getMessage("Remove the selected property"),
                "handler": function() {
                    var section = currentObj.getActiveSection();
                    if (section) {
                        section.removeFieldHandler();
                    }
                },
                "listeners": {
                    "mouseover": function() {
                        var section = currentObj.getActiveSection();
                        if (section) {
                            if (section.lastSelectedItem) {
                                section.lastSelectedItemToDelete = section.lastSelectedItem;
                            } else {
                                section.lastSelectedItemToDelete = null;
                            }
                        }
                    },
                    "mouseout": function() {
                        var section = currentObj.getActiveSection();
                        if (section) {
                            section.lastSelectedItemToDelete = null;
                        }
                    }
                }
            },{
                "text": CQ.I18n.getMessage("Reset"),
                "tooltip": CQ.I18n.getMessage("Revert the current properties to the intial values"),
                "handler": function() {
                    var section = currentObj.getActiveSection();
                    if (section) {
                        section.reset();
                    }
                }
            },{
                "text": CQ.I18n.getMessage("Done"),
                "tooltip": CQ.I18n.getMessage("Close the current dialog"),
                "handler": function() {
                    currentObj.hide();
                }
            }],
            "listeners": {
            	"beforeshow": function(cmp) {
                    if(CQ_Analytics.Sitecatalyst) {
                    	currentObj.reload();
                    }
            	}
            }
        };

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.EditableClickstreamcloud.superclass.constructor.call(this, config);
    },

    /**
     * Returns the active displayed section.
     * @return {CQ.personalization.EditableClickstreamcloud.FormSection} The active section.
     * @private
     */
    getActiveSection: function() {
        return this.fieldsContainer.layout.activeItem;
    },

    /**
     * Adds the given section to the main tab.
     * @param {CQ.personalization.EditableClickstreamcloud.FormSection} section Section to add.
     * @private
     */
    addSection: function(section) {
        if (section) {
            this.fieldsContainer.add(section);
            this.fieldsContainer.doLayout();
            var ai = this.getActiveSection();
            if( !ai ) {
                this.fieldsContainer.setActiveTab(0);
            }
        }
    },

    /**
     * Registers a session store to the current EditableClickstreamcloud.
     * @param {Object} config Config object. Expected configs are: <ul>
     * <li><code>sessionStore:</code> session store to be editable</li>
     * <li><code>mode:</code> one of the following UI modes: <code>{@link #EditableClickstreamcloud.MODE_TEXTFIELD MODE_TEXTFIELD}</code>,
     * <code>{@link #EditableClickstreamcloud.MODE_LINK MODE_LINK}</code>
     * or <code>{@link #EditableClickstreamcloud.MODE_STATIC MODE_STATIC}</code> (default)</li>
     * <li><code>title:</code> section title</li>
     * <li><code>sectionConfig:</code> initial section config</li>
     * </ul>
     */
    register: function(config /*sessionStore, mode, title, sectionConfig*/) {
        var section = new CQ.personalization.EditableClickstreamcloud.FormSection(config);
        this.addSection(section);
    },

    /**
     * Reloads each of the contained sections.
     * @private
     */
    reload: function() {
        this.fieldsContainer.items.each(function(item,index,length) {
            if(item.reload) {
                item.reload();
            }
            return true;
        });
    }
});

/**
 * @class CQ.personalization.EditableClickstreamcloud.FormSection
 * @extends CQ.Ext.Panel
 * FormSection is a panel providing UI to access and edit the properties of a Clickstreamcloud session store.
 * @deprecated since 5.5
 * @constructor
 * Creates a new FormSection.
 * @param {Object} config The config object
 */
CQ.personalization.EditableClickstreamcloud.FormSection = CQ.Ext.extend(CQ.Ext.Panel, {
    /**
     * @cfg {CQ.form.Field} newPropertyNameField
     * The field config to specify the name of a new property (defaults to a textfield).
     */
    newPropertyNameField: null,

    /**
     * @cfg {CQ.form.Field} newPropertyValueField
     * The field config to specify the value of a new property (defaults to a textfield).
     */
    newPropertyValueField: null,

    /**
     * @cfg {String} mode Display mode
     * Session store properties will be displayed depending on this property with:<ul>
     * <li><code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_TEXTFIELD EditableClickstreamcloud.MODE_TEXTFIELD}:</code> a textfield</li>
     * <li><code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_LINK EditableClickstreamcloud.MODE_LINK}:</code> a link (not editable)</li>
     * <li><code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_STATIC EditableClickstreamcloud.MODE_STATIC}</code> (default): a static text (not editable)</li>
     * </ul>
     */
    mode: null,

    /**
     * @cfg {CQ_Analytics.SessionStore} sessionStore
     * The session store to display and edit.
     */
    sessionStore: null,

    /**
     * @cfg {String} title
     * The section title.
     */
    title: null,

    constructor: function(config) {
        config = (!config ? {} : config);

        config.newPropertyNameField = config.newPropertyNameField || {};
        config.newPropertyValueField = config.newPropertyValueField || {};

        var currentObj = this;
        var defaults = {
            "layout": "form",
            "autoScroll": true,
            "bodyStyle": CQ.themes.Dialog.TAB_BODY_STYLE,
            "labelWidth": CQ.themes.Dialog.LABEL_WIDTH,
            "defaultType": "textfield",
            "stateful": false,
            "border": false,
            "defaults": {
                "anchor": CQ.themes.Dialog.ANCHOR,
                "stateful": false
            }
        };

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.EditableClickstreamcloud.FormSection.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.personalization.EditableClickstreamcloud.FormSection.superclass.initComponent.call(this);
        this.loadFields();
    },

    /**
     * Resets the session store and reloads the fields.
     */
    reset: function() {
        this.sessionStore.reset();
        for (var i = this.items.items.length - 1; i >= 0; i--) {
            this.remove(this.items.items[i]);
        }

        this.reload();
    },

    /**
     * Reloads the fields.
     */
    reload: function() {
        this.removeAllFields();
        this.loadFields();
        this.doLayout();
    },

    /**
     * Shows a dialog used to add a property/value pair in the store.
     * New property name field is defined set by {@link newPropertyNameField} config.
     * New property value field is defined set by {@link newPropertyNameField} config.
     * @private
     */
    addFieldHandler: function() {
        var currentObj = this;

        var newPropertyNameConfig = CQ.Util.applyDefaults(this.newPropertyNameField, {
            "xtype": "textfield",
            "name": "newPropertyName",
            "fieldLabel": CQ.I18n.getMessage("Name"),
            "allowBlank": false
        });

        var newPropertyName = CQ.Util.build(newPropertyNameConfig);

        var newPropertyValueConfig = CQ.Util.applyDefaults(this.newPropertyValueField, {
            "xtype": "textfield",
            "name": "newPropertyValue",
            "fieldLabel": CQ.I18n.getMessage("Value")
        });

        var newPropertyValue = CQ.Util.build(newPropertyValueConfig);

        var dialog = new CQ.Dialog({
            "height": 250,
            "width": 400,
            "title": CQ.I18n.getMessage("Add new property to {0}", this.title),
            "items": {
                "xtype": "panel",
                items: [newPropertyName, newPropertyValue]
            },
            "buttons": [
                {
                    "text": CQ.I18n.getMessage("OK"),
                    "handler":function() {
                        if (newPropertyName.isValid()) {
                            var names = newPropertyName.getValue();
                            if (!(names instanceof Array)) {
                                names = [names];
                            }
                            var labels = null;
                            if (newPropertyName.getLabel) {
                                labels = newPropertyName.getLabel();
                                if (!labels instanceof Array) {
                                    labels = [labels];
                                }
                            }
                            for (var i = 0; i < names.length; i++) {
                                var name = names[i];
                                var label = (labels != null && i < labels.length) ? labels[i] : names[i];
                                var value = newPropertyValue.getValue();
                                currentObj.sessionStore.setProperty(name, value);
                                currentObj.addField(label, value, name);
                            }
                            currentObj.doLayout();
                            dialog.hide();
                        }
                    }
                },
                CQ.Dialog.CANCEL
            ]});
        dialog.show();
    },

    /**
     * Removes the selected field.
     * @private
     */
    removeFieldHandler: function() {
        if (this.lastSelectedItemToDelete) {
            this.sessionStore.removeProperty(this.lastSelectedItemToDelete.getName());
            this.remove(this.lastSelectedItemToDelete);
            this.lastSelectedItemToDelete = null;
        }
    },

    /**
     * Removes all the fields.
     * @private
     */
    removeAllFields: function() {
        if( this.items ) {
            this.items.each(function(item,index,length) {
                this.remove(item);
                return true;
            },this);
        }
    },

    /**
     * Loads a field for each non invisible session store property.
     * @private
     */
    loadFields: function() {
        var storeConfig = CQ_Analytics.CCM.getStoreConfig(this.sessionStore.getName());
        var names = this.sessionStore.getPropertyNames(storeConfig["invisible"]);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];

            //exclude xss properties
            if( !CQ.shared.XSS.KEY_REGEXP.test(name)) {
                this.addField(this.sessionStore.getLabel(name), this.sessionStore.getProperty(name, true), name, this.sessionStore.getLink(name));
            }
        }
    },

    /**
     * Adds a field to the section.
     * @param {String} label Label.
     * @param {String} value Value.
     * @param {String} name Name.
     * @param {String} link (optional) Link (only if section mode is <code>{@link CQ.personalization.EditableClickstreamcloud#EditableClickstreamcloud.MODE_LINK EditableClickstreamcloud.MODE_LINK}</code>)
     */
    addField: function(label, value, name, link) {
        if (this.mode == CQ.personalization.EditableClickstreamcloud.MODE_TEXTFIELD) {
        	 if(!CQ_Analytics.Sitecatalyst) {
        		 this.addTextField(label, value, name);
        	 } else {
        		 this.addTriggerField(label, value, name);
        	 }
        } else {
            if (this.mode == CQ.personalization.EditableClickstreamcloud.MODE_LINK && link) {
                this.addLink(label, link);
            } else {
                this.addStaticText(label);
            }
        }
    },

    /**
     * Handles a property change: updates the session store.
     * @param {String} name Property name.
     * @param {String} newValue The new value.
     * @param {String} oldValue The old value.
     * @private
     */
    onPropertyChange: function(name, newValue, oldValue) {
        //copy property value to xss property for display
        if( this.sessionStore.getPropertyNames().indexOf(name + CQ.shared.XSS.KEY_SUFFIX) != -1) {
            this.sessionStore.setProperty(name + CQ.shared.XSS.KEY_SUFFIX, newValue);
        }
        this.sessionStore.setProperty(name, newValue);
    },

    /**
     * Add a triggerfield to the section.
     * @param {String} label Label.
     * @param {String} value Default value.
     * @param {String} name Field name.
     */
    addTriggerField: function(label, value, name) {
    	var currentObj = this;

        var tf = new CQ.Ext.form.TriggerField({
            "fieldLabel": label,
            "value": value,
            "name": name,
            "listeners": {
                "change": function(field, newValue, oldValue) {
                    currentObj.onPropertyChange(name, newValue, oldValue);
                },
                "destroy": function() {
                    if( this.container ) {
                        this.container.parent().remove();
                    }
                },
                "focus": function() {
                    currentObj.lastSelectedItem = tf;
                },
                "blur": function() {
                    if (currentObj.lastSelectedItem === tf) {
                        currentObj.lastSelectedItem = null;
                    }
                }
            }
        });

        tf.onTriggerClick = function(e) {
            var dialog = new CQ.personalization.SitecatalystDialog({
                profileLabel: currentObj.sessionStore.STORENAME + "." + label
            });
            dialog.show();
            dialog.alignToViewport("c");
        };

        this.add(tf);
    },

    /**
     * Adds a textfield to the section.
     * @param {String} label Label.
     * @param {String} value Default value.
     * @param {String} name Field name.
     */
    addTextField: function(label, value, name) {
        var currentObj = this;

        var tf = new CQ.Ext.form.TriggerField({
            "fieldLabel": label,
            "value": value,
            "name": name,
            "listeners": {
                "change": function(field, newValue, oldValue) {
                    currentObj.onPropertyChange(name, newValue, oldValue);
                },
                "destroy": function() {
                    if( this.container ) {
                        this.container.parent().remove();
                    }
                },
                "focus": function() {
                    currentObj.lastSelectedItem = tf;
                },
                "blur": function() {
                    if (currentObj.lastSelectedItem === tf) {
                        currentObj.lastSelectedItem = null;
                    }
                }
            }
        });

        this.add(tf);
    },

    /**
     * Adds a link to the section.
     * @param {String} text Link text.
     * @param {String} href Link href.
     */
    addLink: function(text, href) {
        if (href) {
            this.add(new CQ.Static({
                "html": "<a href=" + href + ">" + text + "</a>"
            }));
        } else {
            this.addStaticText(text);
        }
    },

    /**
     * Adds a static text to the section.
     * @param {String} text Text to add.
     */
    addStaticText: function(text) {
        if (text) {
            this.add(new CQ.Static({
                "html": text
            }));
        }
    }
});

/**
 * Textfield display mode: property is displayed with a textfield.
 * @static
 * @final
 * @type String
 * @member CQ.personalization.EditableClickstreamcloud
 */
CQ.personalization.EditableClickstreamcloud.MODE_TEXTFIELD = "textfield";

/**
 * Link display mode: property is displayed with a link.
 * @static
 * @final
 * @type String
 * @member CQ.personalization.EditableClickstreamcloud
 */
CQ.personalization.EditableClickstreamcloud.MODE_LINK = "link";

/**
 * Static display mode: property is displayed with a static text.
 * @static
 * @final
 * @type String
 * @member CQ.personalization.EditableClickstreamcloud
 */
CQ.personalization.EditableClickstreamcloud.MODE_STATIC = "static";
/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2011 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ***********************************************************************
 */

if( CQ_Analytics.ClientContextUI ) {
    $CQ(function() {
        CQ_Analytics.ClientContextUI.addListener("render", function() {
            CQ_Analytics.ClientContextUI.ipe = new CQ.ipe.PlainTextEditor({
                "enterKeyMode": "save",
                "tabKeyMode": "save"
            });
        });

        CQ_Analytics.CCM.addListener('storeregister', function(e, sessionstore) {
            var initIPE = function(event) {
                var ipe = CQ_Analytics.ClientContextUI.ipe;
                var $t = $CQ(this);
                var $parent = $t.parent();

                var store = $t.attr("data-store");
                var property = $t.attr("data-property");
                var propertyPath = "/" + store + "/" + property;

                var stop = function() {
                    if( ipe.running ) {
                        if( !ipe.isCancelled ) {
                            ipe.finish();
                        } else {
                            CQ_Analytics.ClientContext.set(
                                ipe.editComponent.propertyPath,
                                ipe.editComponent.initialValue
                            );
                            ipe.cancel();
                        }
                        $CQ(document).unbind("click",handleDocumentClick);
                        ipe.editComponent.parent.removeClass("cq-clientcontext-editing");
                        ipe.running = false;
                        ipe.isCancelled = false;
                    }
                    delete ipe.clicked;
                };

                if( ! ipe.running ) {
                    var initialValue = CQ_Analytics.ClientContext.get(propertyPath);
                    if( typeof(initialValue) == "string" && initialValue.toLowerCase().indexOf("http") == 0) {
                        initialValue= initialValue.replace(new RegExp("&amp;","g"),"&");
                    }

                    var handleDocumentClick = function() {
                        if( !ipe.clicked || ipe.clicked != ipe.editComponent.propertyPath ) {
                            stop();
                        }
                        ipe.clicked = null;
                    };

                    var editMockup = {
                        store: store,
                        property: property,
                        propertyPath: propertyPath,
                        initialValue: initialValue,
                        parent: $parent,
                        updateParagraph: function(textPropertyName, editedContent) {
                            if( editedContent && typeof(editedContent) == "string") {
                                editedContent = editedContent.replace(new RegExp("&amp;","g"),"&");
                            }
                            CQ_Analytics.ClientContext.set(this.propertyPath, editedContent);
                        },
                        cancelInplaceEditing: function() {
                            ipe.isCancelled = true;
                            stop();
                        },
                        finishInplaceEditing: function() {
                            stop();
                        },
                        refreshSelf: function() {
                            ipe.editComponent.parent.removeClass("cq-clientcontext-editing");
                        }
                    };
                    $parent.addClass("cq-clientcontext-editing");
                    ipe.start(
                        editMockup,
                        CQ.Ext.get($t[0]),
                        editMockup.initialValue
                    );

                    $CQ(document).bind("click",handleDocumentClick);
                    //$CQ(document).bind("keyup",stop);

                    ipe.running = true;
                    ipe.clicked = null;

                    event.stopPropagation();
                } else {
                    if( ipe.editComponent.propertyPath != propertyPath ) {
                        stop();
                    } else {
                        ipe.clicked = propertyPath;
                    }
                }
            };

            sessionstore.addListener("initialpropertyrender",function(event, store, divId){
                if( $CQ("#" + divId).parents(".cq-cc-content").length > 0) {
                    $CQ("[data-store][data-property]", $CQ("#" + divId).parent()).bind("click",initIPE);
                }
            });

            sessionstore.addListener("beforerender",function(event, store, divId){
                $CQ("[data-store][data-property]", $CQ("#" + divId).parent()).unbind("click",initIPE);
            });

            sessionstore.addListener("render",function(event, store, divId){
                $CQ("[data-store][data-property]", $CQ("#" + divId).parent()).bind("click",initIPE);
            });
        });
    });
}

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
 * @class CQ.personalization.ProfileLoader
 * @extends CQ.Dialog
 * ProfileLoader is a dialog providing functionalities to select, load a profile and update the
 * <code>{@link CQ_Analytics.ProfileDataMgr}</code>.
 * @constructor
 * Creates a new ProfileLoader.
 * @param {Object} config The config object
 */
CQ.personalization.ProfileLoader = CQ.Ext.extend(CQ.Dialog, {
    constructor: function(config) {
        config = (!config ? {} : config);

        var profileCombo = new CQ.Ext.form.ComboBox({
            "fieldLabel": CQ.I18n.getMessage("Select profile"),
            "name": "profile",
            "cls": "cq-eclickstreamcloud",
            "stateful": false,
            "typeAhead":true,
            "triggerAction":"all",
            "inputType":"text",
            "displayField":"name",
            "valueField": "id",
            "emptyText": "",
            "minChars":0,
            "editable":true,
            "lazyInit": false,
            "queryParam": "filter",
            "triggerScrollOffset": 80,
            "listeners": {
                "render": function(comp) {
                    var scroller = $CQ(comp.innerList.dom);

                    if (!scroller) {
                        return;
                    }

                    scroller.on('scroll', function(e) {
                        if (comp.refreshing || comp.loading || (comp.store.getCount() >= comp.store.getTotalCount())) {
                            return;
                        }

                        if ((this.scrollTop > 0) && ((this.scrollTop + this.clientHeight + comp.triggerScrollOffset) >= this.scrollHeight)) {
                            if (!comp.moreStore) {
                                comp.moreStore = new CQ.Ext.data.GroupingStore({
                                    "proxy": new CQ.Ext.data.HttpProxy({
                                        "url": comp.store.proxy.url,
                                        "method": comp.store.proxy.conn.method
                                    }),
                                    "reader": comp.store.reader,
                                    "listeners": {
                                        "load": function() {
                                            if (comp.loadingIndicator) {
                                                comp.loadingIndicator.remove();
                                                comp.loadingIndicator = undefined;
                                            }

                                            for (var i = 0; i < comp.moreStore.getCount(); i++) {
                                                var record = comp.moreStore.getAt(i);
                                                comp.store.add(record);
                                            }

                                            comp.refreshing = false;
                                        }
                                    },
                                    "dataView": this
                                });
                            }

                            var lastParams = comp.store.lastOptions ? comp.store.lastOptions.params : comp.store.baseParams;
                            var moreParams = $CQ.extend({}, lastParams, {
                                'limit': comp.store.baseParams ? comp.store.baseParams.limit : 25,
                                'start': comp.store.getCount()
                            });

                            comp.loadingIndicator = comp.innerList.createChild({'tag': 'div', "cls": "loading-indicator", 'html': CQ.I18n.getMessage("Loading...")});
                            comp.refreshing = true;
                            comp.moreStore.load({
                                "params": moreParams
                            });
                        }
                    });

                }
            },
            "fieldDescription": CQ.I18n.getMessage("Select the profile you want to load."),
            "tpl" :new CQ.Ext.XTemplate(
                '<tpl for=".">',
                '<div class="cq-eclickstreamcloud-list">',
                '<div class="cq-eclickstreamcloud-list-entry">{[values.name==""? values.id: CQ.shared.XSS.getXSSTablePropertyValue(values, "name")]}</div>',
                '</div>',
                '</tpl>'),
            "itemSelector" :"div.cq-eclickstreamcloud-list",
            "store": new CQ.Ext.data.Store({
                "autoLoad":false,
                "proxy": new CQ.Ext.data.HttpProxy({
                    "url": "/bin/security/authorizables.json",
                    "method":"GET"
                }),
                "baseParams": {
                    "start": 0,
                    "limit": 15,
                    "hideGroups": "true"
                },
                "reader": new CQ.Ext.data.JsonReader({
                    "root":"authorizables",
                    "totalProperty":"results",
                    "id":"id",
                    "fields":["name", "name" + CQ.shared.XSS.KEY_SUFFIX,"id", "home"]})
            }),
            "defaultValue": ""
        });

        var currentObj = this;
        var defaults = {
            "height": 170,
            "width": 400,
            "title": CQ.I18n.getMessage("Profile Loader"),
            "items": {
                "xtype": "panel",
                items: [profileCombo]
            },
            "buttons": [
                {
                    "text": CQ.I18n.getMessage("OK"),
                    "handler":function() {
                        CQ_Analytics.ProfileDataMgr.loadProfile(profileCombo.getValue());
                        // Refresh Test & Target info for new user:
						if (CQ_Analytics.TestTarget && CQ_Analytics.TestTarget.deleteMboxCookies) {
							CQ_Analytics.TestTarget.deleteMboxCookies();
						}
                        currentObj.hide();
                    }
                },
                CQ.Dialog.CANCEL
            ]
        };

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.ProfileLoader.superclass.constructor.call(this, config);
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
 * @class CQ.personalization.OperatorSelection
 * @extends CQ.form.Selection
 * OperatorSelection is a specialized selection allowing to choose one of the
 * <code>{@link CQ_Analytics.Operator CQ_Analytics.Operators}</code>.
 * @constructor
 * Creates a new OperatorSelection.
 * @param {Object} config The config object
 */
CQ.personalization.OperatorSelection = CQ.Ext.extend(CQ.form.Selection, {
    constructor: function(config) {
        config = (!config ? {} : config);

        var defaults = {};

        if (CQ_Analytics.Operator && config.operators) {
            //transform operators config to options.
            config.options = config.options ? config.options : new Array();
            config.operators = config.operators instanceof Array ? config.operators : [config.operators];
            for (var i = 0; i < config.operators.length; i++) {
                if (config.operators[i].indexOf("CQ_Analytics.Operator." == 0)) {
                    try {
                        config.operators[i] = eval("config.operators[i] = " + config.operators[i] + ";");
                    } catch(e) {
                    }
                }
                var value = config.operators[i];
                if ( value ) {
                    var text = CQ_Analytics.OperatorActions.getText(config.operators[i]);
                    text = text ? text : value;
                    config.options.push({
                        "text": CQ.I18n.getVarMessage(text),
                        "value": value
                    });
                }
            }
        }

        CQ.Util.applyDefaults(config, defaults);

        // init component by calling super constructor
        CQ.personalization.OperatorSelection.superclass.constructor.call(this, config);
    }
});

CQ.Ext.reg("operatorselection", CQ.personalization.OperatorSelection);
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
//initialization of all the analytics objects available in edit mode
CQ.Ext.onReady(function() {
    //link clickstreamcloud editor to clickstreamcloud ui box
    if (CQ_Analytics.ClickstreamcloudUI) {
        CQ_Analytics.ClickstreamcloudUI.addListener("editclick", function() {

            if( !CQ_Analytics.ClickstreamcloudEditor ) {
                //clickstreamcloud editor itself
                CQ_Analytics.ClickstreamcloudEditor = new CQ.personalization.EditableClickstreamcloud();

                //registers the session stores
                var reg = function(mgr) {
                    if (mgr) {
                        var config = CQ_Analytics.ClickstreamcloudMgr.getEditConfig(mgr.getSessionStore().getName());
                        config["sessionStore"] = mgr.getSessionStore();
                        CQ_Analytics.ClickstreamcloudEditor.register(config);
                    }
                };

                //profile data
                reg.call(this, CQ_Analytics.ProfileDataMgr);

                //page data
                reg.call(this, CQ_Analytics.PageDataMgr);

                //tagcloud data
                reg.call(this, CQ_Analytics.TagCloudMgr);

                //surfer info data
                reg.call(this, CQ_Analytics.SurferInfoMgr);
                
                //eventinfodata
                reg.call(this, CQ_Analytics.EventDataMgr);
            }
            CQ_Analytics.ClickstreamcloudEditor.show();
        });

        CQ_Analytics.ClickstreamcloudUI.addListener("loadclick", function() {
            var dlg = new CQ.personalization.ProfileLoader({});
            dlg.show();
        });
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

// initialize CQ.personalization package
CQ.personalization.variables = {};
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

CQ.personalization.variables.Variables = {};

CQ.personalization.variables.Variables.SCANNED_TAGS = ["*"];

CQ.personalization.variables.Variables.applyToEditComponent = function(path) {
    CQ.Ext.onReady(function() {
        //TODO configurable prefix and suffix


        CQ.WCM.onEditableBeforeRender(path, function(config) {
            var element = config.element;
            if( element ) {
                CQ.personalization.variables.Variables.injectSpans(element, CQ.personalization.variables.Variables.SCANNED_TAGS, "cq-variable-code");
                if (CQ_Analytics && CQ_Analytics.ProfileDataMgr) {
                    CQ.personalization.variables.Variables.updateVariables(element, CQ_Analytics.ProfileDataMgr.getData());
                    CQ_Analytics.ProfileDataMgr.addListener("update", function() {
                        CQ.personalization.variables.Variables.updateVariables(element, CQ_Analytics.ProfileDataMgr.getData());
                    });
                }
            }
        });

        CQ.WCM.onEditableReady(path, function() {
            this.on(CQ.wcm.EditBase.EVENT_AFTER_EDIT,function() {
                CQ.personalization.variables.Variables.injectSpans(this.element, CQ.personalization.variables.Variables.SCANNED_TAGS, "cq-variable-code");
                CQ.personalization.variables.Variables.updateVariables(this.element, CQ_Analytics.ProfileDataMgr.getData());
            });
        });
    });
};

CQ.personalization.variables.Variables.injectSpans = function(element, tags, className) {
    element = CQ.Ext.get(element);
    if( element ) {
        className = className || "";
        for (var t = 0; t < tags.length; t++) {
            var reg = new RegExp("\\\$\\{[\\w]*\\}", "ig");
            var pars = CQ.Ext.DomQuery.jsSelect(tags[t] + ":contains(\${)", element.dom);
            for( var i=0;i<pars.length;i++) {
                var p = pars[i];
                //check if matches ...\${}...
                var text = p.innerHTML;
                if (text) {
                    var variables = text.match(reg);
                    var performedVariables = [];
                    for(var j = 0; j < variables.length; j++) {
                        var v = variables[j];
                        if( performedVariables.indexOf(v) == -1) {
                            //vName is variable name (no "\${" and "}")
                            var vName = v.replace(new RegExp("\\\$\\{([\\w]*)\\}", "ig"),"$1");
                            var repl = "<span class=\"cq-variable " + className + " cq-variable-vars-"+vName+"\" title=\""+v+"\">"+v+"</span>";
                            text = text.replace(new RegExp("\\\$\\{"+vName+"\\}", "ig"),repl);
                            performedVariables.push(v);
                        }
                    }
                    p.innerHTML = text;
                }
            }
        }
    }
};

CQ.personalization.variables.Variables.updateVariables = function(element, data) {
    element = CQ.Ext.get(element);
    if( element ) {
        var pars = CQ.Ext.DomQuery.jsSelect("span.cq-variable", element.dom);
        data = data || {};

        for( var i=0;i<pars.length;i++) {
            var p = pars[i];
            var className = p ? p.className : "";
            var reg = new RegExp(".+cq-variable-vars-(\\w+)\\s*(\\w*)", "ig");
            var variable = className.replace(reg, "$1");
            if(variable) {
                var text = p.innerHTML;
                if( text && text != "" && text != " ") {
                    var value = data[variable];
                    value = value && value != "" ? value : "\${"+variable+"}";
                    p.innerHTML = value;
                }
            } else {
                p.innerHTML = "";
            }
        }
    }
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
 * @class CQ.form.rte.plugins.InsertVariablePlugin
 * @extends CQ.form.rte.plugins.Plugin
 * <p>This class implements styling text fragments with a CSS class (using "span" tags) as a
 * plugin.</p>
 * <p>The plugin ID is "<b>variables</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>variables</b> - adds a style selector (variables will be applied on selection scope)
 *     </li>
 * </ul>
 * <p><b>Additional config requirements</b></p>
 * <p>The following plugin-specific settings must be configured through the corresponding
 * {@link CQ.form.rte.EditorKernel} instance:</p>
 * <ul>
 *   <li>The variablesheets to be used must be provided through
 *     {@link CQ.form.RichText#externalStyleSheets}.</li>
 * </ul>
 */
CQ.form.rte.plugins.InsertVariablePlugin = CQ.Ext.extend(CQ.form.rte.plugins.Plugin, {

    /**
     * @cfg {Object/Object[]} variables
     * <p>Defines CSS classes that are available to the user for formatting text fragments
     * (defaults to { }). There are two ways of specifying the CSS classes:</p>
     * <ol>
     *   <li>Providing variables as an Object: Use the CSS class name as property name.
     *   Specify the text that should appear in the style selector as property value
     *   (String).</li>
     *   <li>Providing variables as an Object[]: Each element has to provide "cssName" (the
     *   CSS class name) and "text" (the text that appears in the style selector)
     *   properties.</li>
     * </ol>
     * <p>Styling is applied by adding "span" elements with corresponding "class"
     * attributes appropriately.</p>
     * @since 5.3
     */

    /**
     * @private
     */
    cachedVariables: null,

    /**
     * @private
     */
    variablesUI: null,

    constructor: function(editorKernel) {
        CQ.form.rte.plugins.InsertVariablePlugin.superclass.constructor.call(this, editorKernel);
    },

    getFeatures: function() {
        return [ "variables" ];
    },

    getVariables: function() {
        var com = CQ.form.rte.Common;
        if (!this.cachedVariables) {
            this.cachedVariables = this.config.variables || { };
            com.removeJcrData(this.cachedVariables);
        }
        return this.cachedVariables;
    },

    initializeUI: function(tbGenerator) {
        var plg = CQ.form.rte.plugins;
        var ui = CQ.form.rte.ui;
        if (this.isFeatureEnabled("insertvariable")) {
            this.variablesUI = new ui.TbVariableSelector("insertvariable", this, null, this.getVariables());
            tbGenerator.addElement("insertvariable", plg.Plugin.SORT_STYLES, this.variablesUI, 10);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "variables": {
                // empty default value
            }
        });
        this.config = pluginConfig;
    },

    execute: function(cmdId) {
        if (!this.variablesUI) {
            return;
        }
        var cmd = null;
        var value = null;
        switch (cmdId.toLowerCase()) {
            case "insertvariable_insert":
                cmd = "inserthtml";
                value = this.variablesUI.getSelectedVariable();
                break;
        }
        if (cmd && value) {
            var vt = "${"+value+"}";
            //var html = "<span class=\"cq-variable cq-variable-code cq-variable-vars-"+value+"\" title=\""+vt+"\">"+vt+"</span>&nbsp;";
            this.editorKernel.relayCmd(cmd, vt);
        }
    }
});

// register plugin
CQ.form.rte.plugins.PluginRegistry.register("insertvariable", CQ.form.rte.plugins.InsertVariablePlugin);
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
 * @class CQ.form.rte.ui.TbVariableSelector
 * @extends CQ.form.rte.ui.TbElement
 * @private
 * This class represents a variable selecting element for use in
 * {@link CQ.form.rte.ui.ToolbarBuilder}.
 */
CQ.form.rte.ui.TbVariableSelector = CQ.Ext.extend(CQ.form.rte.ui.TbElement, {

    variableSelector: null,

    variables: null,

    toolbar: null,

    constructor: function(id, plugin, tooltip, variables) {
        CQ.form.rte.ui.TbVariableSelector.superclass.constructor.call(this, id, plugin, false,
                tooltip);
        this.variables = variables;
    },

    /**
     * Creates HTML code for rendering the options of the variable selector.
     * @return {String} HTML code containing the options of the variable selector
     * @private
     */
    createStyleOptions: function() {
        var htmlCode = "";
        if (this.variables) {
            for (var v in this.variables) {
                var variableToAdd = this.variables[v];
                htmlCode += "<option value=\"" + variableToAdd.value + "\">" + CQ.I18n.getVarMessage(variableToAdd.text) + "</option>";
            }
        }
        return htmlCode;
    },

    getToolbar: function() {
        return CQ.form.rte.ui.ToolbarBuilder.STYLE_TOOLBAR;
    },

    addToToolbar: function(toolbar) {
        this.toolbar = toolbar;
        if (CQ.Ext.isIE) {
            // the regular way doesn't work for IE anymore with Ext 3.1.1, hence working
            // around
            var helperDom = document.createElement("span");
            helperDom.innerHTML = "<select class=\"x-font-select\">"
                    + this.createStyleOptions() + "</span>";
            this.variableSelector = CQ.Ext.get(helperDom.childNodes[0]);
        } else {
            this.variableSelector = CQ.Ext.get(CQ.Ext.DomHelper.createDom({
                tag: "select",
                cls: "x-font-select",
                html: this.createStyleOptions()
            }));
        }
        this.variableSelector.on('focus', function() {
            this.plugin.editorKernel.isTemporaryBlur = true;
        }, this);
        // fix for a Firefox problem that adjusts the combobox' height to the height
        // of the largest entry
        this.variableSelector.setHeight(19);
        var addButton = {
            "itemId": this.id + "_insert",
            "iconCls": "x-edit-insertvariable",
            "text": CQ.I18n.getMessage("Insert"),
            "enableToggle": (this.toggle !== false),
            "scope": this,
            "handler": function() {
                this.plugin.execute(this.id + "_insert");
            },
            "clickEvent": "mousedown",
            "tabIndex": -1
        };
        toolbar.add(
            CQ.I18n.getMessage("Variable"),
            " ",
            this.variableSelector.dom,
            addButton
        );
    },

    createToolbarDef: function() {
        // todo support usage in global toolbar
        return null;
    },

    getSelectedVariable: function() {
        var variable = this.variableSelector.dom.value;
        if (variable.length > 0) {
            return variable;
        }
        return null;
    },

    getExtUI: function() {
        return this.variableSelector;
    },

    getInsertButtonUI: function() {
        return this.toolbar.items.map[this.id + "_insert"];
    }

});
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

// Authoring UI for targeting

// internal scope
(function() {

    // Utility to traverse an object tree and call a function (key, obj, parent) for every object.
    function traverse(obj, fn, key, parent) {
        if (typeof obj === "object") {
            if (fn.apply(this, [key, obj, parent])) {
                return true;
            }
            var stop = false;
            $CQ.each(obj, function(k, v) {
                if (traverse(v, fn, k, obj)) {
                    stop = true;
                    return true;
                }
            });
            if (stop) {
                return true;
            }
        }
        return false;
    }

    /** if a string starts with a certain prefix */
    function startsWith(str, prefix) {
        return (str.indexOf(prefix) === 0);
    }

    /** returns the last name in a path; eg. /content/foo/bar => bar */
    function basename(path) {
        return path.substring(path.lastIndexOf("/") + 1);
    }

    function createPage(path, resourceType, params, successFn, scope) {
        var defaultParams = {};
        defaultParams["jcr:primaryType"] = "cq:Page";
        defaultParams["jcr:content/jcr:primaryType"] = "cq:PageContent";
        defaultParams["jcr:content/sling:resourceType"] = resourceType;

        params = CQ.utils.Util.applyDefaults(params, defaultParams);

        CQ.HTTP.post(path, function(options, success, xhr, response) {
            if (success) {
                if (successFn) {
                    successFn.call(scope, response);
                }
            }
        }, params);
    }

    // path inside an offer page that contains the actual offer/teaser component(s)
    var OFFER_INNER_PATH = "jcr:content/par";
    var DEFAULT_COMPONENT = "default";

    // client context properties
    var CAMPAIGN_PROP = "campaign/path";
    var EXPERIENCE_PROP = "campaign/recipe/path";

    /**
     * Authoring UI for targeting.
     *
     * @constructor
     * @param {CQ.wcm.EditBase} component EditBase instance of target component
     */
    CQ.personalization.TargetEditor = function(component) {
        this.component = component;
        // initially, the target component renders the default experience included
        this.activeExperience = CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE;

        // get updated by campaign reselection
        var campaignStore = ClientContext.get("campaign");
        if (campaignStore) {
            campaignStore.addListener("update", this.onCampaignUpdate, this);
        }

        // need to hook into nested editables when we switch the teaser content
        CQ.WCM.on("editableready", this.onEditableReady, this);

        this.render();

        // update default content if the ClientContext already has a selection, but after the component
        // is rendered since we potentially change the DOM
        if ( campaignStore && ClientContext.get(CAMPAIGN_PROP) ) {
            this.update();
        }

        this.renderOverlayIcon();

        var targetEditor = this;

        // hook into observation to make sure the popup stays positioned at the right place
        var observeElementPosition = component.observeElementPosition;
        component.observeElementPosition = function() {
            targetEditor.position();
            observeElementPosition.call(this);
        };

        var remove = component.remove;
        component.remove = function() {
            targetEditor.remove();
            delete component.targetEditor;
            remove.call(this);
        };
    };

    CQ.personalization.TargetEditor.prototype = {

        // private: listener for campaign store changes
        onCampaignUpdate: function(event, property) {
            // if no property is given, this event means that everything needs to reload
            var reload = (typeof property === "undefined");
            this.update(reload);
        },

        // private: track all nested components (that are part of the targeting)
        onEditableReady: function(editable) {
            if (!editable) {
                return;
            }

            // get base path to current offer to check against editable path
            var offer;
            if (this.activeExperience === CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE || !this.activeExperience) {
                offer = this.component.path + "/" + DEFAULT_COMPONENT;
            } else {
                offer = this.offers[this.activeExperience];
                if (!offer) {
                    return;
                }
                offer = offer + "/" + OFFER_INNER_PATH;
            }

            // we are only interested in components from the offer page we load
            if (startsWith(editable.path, offer)) {
                this.trackNestedEditable(editable);
            }
        },

        // update preview images when current active offer component is edited
        // therefore listen to afteredit event for all our nested components
        trackNestedEditable: function(editable) {
            // get notified after all edit operations
            editable.on(CQ.wcm.EditBase.EVENT_AFTER_EDIT, function() {
                // update preview images (update entire view as we don't necessarily know what changed
                // in the component, for smooth loading & proper image scaling)
                this.loadExperiences(true);
            }, this);

            var targetEditor = this;

            if (editable instanceof CQ.wcm.EditRollover) {
                editable.on(CQ.wcm.EditRollover.EVENT_SHOW_HIGHTLIGHT, function(component) {
                    targetEditor.showOverlayIcon();
                });
                editable.on(CQ.wcm.EditRollover.EVENT_HIDE_HIGHTLIGHT, function(component) {
                    targetEditor.hideOverlayIcon();
                });
            } else {
                var el = $CQ(editable.element.dom);
                el.mouseover(function(event) {
                    targetEditor.showOverlayIcon();
                });
                el.mouseout(function(event) {
                    // keep visible if the mouse goes over the overlay icon
                    if (!targetEditor.overlayIcon.is(event.relatedTarget)) {
                        targetEditor.hideOverlayIcon();
                    }
                });
            }
        },

        /**
         * Updates the selection from the ClientContext campaign store.
         *
         * Called when the the campaign or experience has been changed anywhere, including
         * when an experience was selected in our popup. It all goes via the ClientContext
         * campaign store.
         */
        update: function(reload) {
            var campaign = ClientContext.get(CAMPAIGN_PROP);

            if (!reload) {
                // only reload experiences list if campaign changed
                if (campaign !== this.campaign) {
                    this.campaign = campaign;
                    reload = true;
                }
            }

            var experience = ClientContext.get(EXPERIENCE_PROP);

            // safety check: if campaign is selected, but experience is empty,
            // interpret as DEFAULT experience selected
            if (campaign && !experience) {
                experience = CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE;
            }
            
            // quick validation (should be in CampaignMgr?)
            if (experience && experience.indexOf("/") === 0) {
                // if experience is not part of current campaign, stop
                if (!startsWith(experience, this.campaign + "/")) {
                    return;
                }
            }

            this.loadExperiences(reload, function() {
                this.switchExperience(experience);
            });
        },

        /**
         * Load new offer in our inner html.
         *
         * Replace the inner html of the target component with the complete parsys of the offer page
         * (this will automatically instantiate components inside, as the necessary script code will
         * be part of the html returned).
         *
         * Note that we have to refresh on the parent component path, in order to get the html
         * snippet that actually includes the important CQ.WCM.edit() calls.
         */
        switchExperience: function(experience) {
            if (!this.campaign) {
                // leaving experience editing and going to normal targeting execution (e.g. mbox calls)
                this.activeExperience = null;
                // reload the full component including mboxDefault div and mbox script
                this.component.refresh(this.component.path + '.html');
                return;
            }

            // avoid reloading of offer that's currently shown
            if (experience !== this.activeExperience) {
                var oldExperience = this.activeExperience;

                var url = this.getOfferURL(experience);
                if (!url) {
                    // create offer page if it does not exist yet
                    this.createOffer(experience, function() {
                        // need to load them locally again to show updated image
                        this.loadExperiences(true);
                    });
                    return;
                }

                this.activeExperience = experience;

                // defer slightly to avoid issues with the refresh() method when this
                // function is called while this.component is still loading initially
                this.component.refresh.defer(15, this.component, [url]);

                // mark selected experience
                $CQ(this.carousel).find('li[data-cq-experience="' + oldExperience + '"]').removeClass("cq-targeting-experience-selected");
                var selectedItem = $CQ(this.carousel).find('li[data-cq-experience="' + experience + '"]');
                selectedItem.addClass("cq-targeting-experience-selected");
                $CQ(this.carousel).jcarousel("scroll", selectedItem.index());
            }
        },

        getOfferURL: function(experience) {
            if (experience === CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE || !experience) {
                return this.component.path + ".default.html";
            }
            var offer = this.offers[experience];
            if (offer) {
                return offer + "/" + OFFER_INNER_PATH + ".html";
            }
            return null;
        },

        /** create experience for the given segment */
        // TODO: merge with create offer in single   request
        createExperience: function(name, title, segment) {
            var params = {};
            params[":nameHint"] = name;
            params["jcr:content/jcr:title"] = title;
            params["jcr:content/cq:segments"] = segment;
            params["jcr:content/cq:segments@TypeHint"] = "String[]";

            createPage(
                this.campaign + "/*",
                "cq/personalization/components/experiencepage",
                params,
                function(response) {
                    var experience = response.headers[CQ.HTTP.HEADER_PATH];
                    this.createOffer(experience, function() {
                        // reload (because experience is new) and select globally
                        var campaignStore = ClientContext.get('campaign');
                        if (campaignStore) {
                            campaignStore.reload(experience);
                        }
                    });
                },
                this
            );
        },

        /** create an offer under the given experience based on the current component */
        createOffer: function(experience, callback) {
            var componentName = basename(this.component.path);

            var params = {};
            // name & title of the page is not important, just use some hints regarding the mbox location
            params[":nameHint"] = basename(CQ.WCM.getPagePath()) + "-" + componentName;
            // copy title from experience page
            params["jcr:content/jcr:title"] = basename(CQ.WCM.getPagePath()) + " (" + componentName + ")";
            params["jcr:content/location"] = this.component.path;
            params["jcr:content/par/sling:resourceType"] = "foundation/components/parsys";
            // copy default component
            params[OFFER_INNER_PATH + "/" + componentName + "@CopyFrom"] = this.component.path + "/" + DEFAULT_COMPONENT;

            createPage(experience + "/*", "cq/personalization/components/teaserpage", params, function(response) {
                this.offers[experience] = response.headers[CQ.HTTP.HEADER_PATH];

                // if successful, get the path of the created page and load it as offer
                this.switchExperience(experience);

                callback.call(this);

            }, this);
        },

        deleteExperience: function(path) {
            if ( !path ) {
                return;
            }

            $CQ.post(path, { ':operation' : 'delete' }, function() {
                // reload (because experience is new) and select globally
                var campaignStore = ClientContext.get('campaign');
                if (campaignStore) {
                    campaignStore.reload(CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE);
                }
            });
        },

        renderOverlayIcon: function() {
            var targetEditor = this;
            this.overlayIcon = $CQ("<div>")
                .addClass("cq-targeting-launch-icon cq-targeting-icon-placeholder")
                .attr("title", CQ.I18n.get("Experiences..."))
                .click(function() {
                    targetEditor.toggle();
                })
                .mouseover(function(event) {
                    targetEditor.showOverlayIcon();
                })
                .mouseout(function(event) {
                    var el = $CQ(targetEditor.component.element.dom);
                    // keep visible if the mouse goes over the element
                    if (!targetEditor.el.is(event.relatedTarget)) {
                        targetEditor.hideOverlayIcon();
                    }
                })
                .appendTo($CQ("#" + CQ.Util.ROOT_ID))
                .hide();

            this.positionOverlayIcon();
        },

        /** initially renders the basic editor popup container */
        render: function() {
            if (this.el) {
               return;
            }

            var that = this;

            // main element
            this.el = $CQ("<div>").addClass("cq-targeting-editor");

            // toolbar on top
            var toolbar = $CQ("<div>")
                .addClass("cq-targeting-editor-toolbar")
                .appendTo(this.el);
            $CQ("<div>")
                .addClass("cq-targeting-action cq-targeting-action-edit")
                .attr("title", CQ.I18n.getMessage("Edit targeting settings"))
                .appendTo(toolbar)
                .click(function() {
                    CQ.wcm.EditBase.showDialog(that.component, CQ.wcm.EditBase.EDIT);
                    return false;
                });
            this.addEl = $CQ("<div>")
                .addClass("cq-targeting-action cq-targeting-action-add")
                .attr("title", CQ.I18n.getMessage("Add new experience"))
                .appendTo(toolbar)
                .click(function() {
                    that.addExperience();
                    return false;

                });
            $CQ("<div>")
                .addClass("cq-targeting-action cq-targeting-action-close")
                .attr("title", CQ.I18n.getMessage("Close the experience switcher"))
                .appendTo(toolbar)
                .click(function() {
                    that.hide();
                    return false;
                });

            // attach to #CQ authoring div
            $CQ("#" + CQ.Util.ROOT_ID).append(this.el);

            // make sure it's not visible at start
            this.el.hide();
        },

        /** build HTML for a single experience list item */
        createExperienceItem: function(thumbnail, experience, label) {
            var that = this;

            // build item to show this experience/offer with image & text
            var item = $CQ("<li>")
                .attr("data-cq-experience", experience)
                .attr("title", CQ.I18n.getMessage("Switch to experience: {0}", label))
                .click(function() {
                    ClientContext.set(EXPERIENCE_PROP, $CQ(this).attr("data-cq-experience"));
                    return false;
                });

            var itemContent = $CQ("<div>")
                .addClass("cq-targeting-experience-content")
                .appendTo(item);

            thumbnail = CQ.shared.HTTP.externalize(thumbnail);

            var thumbWrap = $CQ("<div>")
                .addClass("cq-targeting-experience-img-clip")
                .appendTo(itemContent);
            var thumb = $CQ("<img>")
                .attr("src", thumbnail)
                .addClass("cq-targeting-experience-img")
                .hide()
                .appendTo(thumbWrap);

            // needed to get the real image size (img.width + img.height)
            CQ_Analytics.onImageLoad(thumbnail, function(img) {
                // keep target image size in sync with @imgWidth and @imgHeight in target.less
                var scaled = CQ_Analytics.scaleImage(img.width, img.height, 140, 100);
                thumb.width(scaled.width);
                thumb.height(scaled.height);
                thumb.css("top", scaled.top);
                thumb.css("left", scaled.left);
                thumb.fadeIn();
            });

            $CQ("<div>")
                .addClass("cq-targeting-experience-label")
                .text(label)
                .appendTo(itemContent);

            if (experience !== CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE) {

                var quickActions = $CQ("<div>")
                    .addClass("cq-targeting-experience-quickactions")
                    .appendTo(itemContent);

                // TODO: open edit dialog
//                $CQ("<div>")
//                    .addClass("cq-targeting-experience-quickactions-edit")
//                    .attr("title", CQ.I18n.getMessage("Edit experience"))
//                    .click(function(e) {
//                        return false;
//                    })
//                    .appendTo(quickActions);
                $CQ("<div>")
                    .addClass("cq-targeting-experience-quickactions-delete")
                    .attr("title", CQ.I18n.getMessage("Delete experience"))
                    .click(function() {
                        var origin = this;

                        CQ.Ext.Msg.confirm(
                            CQ.I18n.getMessage("Confirm experience deletion"),
                            CQ.I18n.getMessage("Are you sure you want to delete this experience? This will delete all content for all locations that use this experience!"),
                            function(btnId) {
                                if ( btnId === "yes") {
                                    that.deleteExperience($CQ(origin).parents('li').attr('data-cq-experience'));
                                }
                            }
                        );
                        return false;
                    })
                    .appendTo(quickActions);
            }

            return item;
        },

        /**
         * Loads all experiences in the editor popup (but not show the popup).
         * Will make sure experiences are loaded first before calling callback.
         * Won't load experiences again if forceLoad==false. Also finds the
         * individual offers for the target component.
         */
        loadExperiences: function(forceLoad, callback) {
            // nothing to do if we are not forced to reload and offers are present
            if (this.offers && !forceLoad) {
                if (callback) {
                    callback.call(this);
                }
                return;
            }

            var that = this;
            // map experience => offers
            that.offers = {};

            if (!this.campaign) {
                // TODO: show campaign selector here
                that.el.find(".cq-targeting-editor-content").remove();
                that.carousel = $CQ("<div>")
                    .addClass("cq-targeting-editor-content")
                    .addClass("cq-targeting-editor-clientcontext-hint")
                    .appendTo(that.el);
                var text = $CQ("<span>")
                    .text(CQ.I18n.getMessage("No campaign selected.") + " ")
                    .appendTo(that.carousel);
                var link = $CQ("<a>")
                    .attr("href", "#")
                    .text(CQ.I18n.getMessage("See Client Context"))
                    .click(function() {
                        CQ_Analytics.ClientContextUI.show();
                        return false;
                    })
                    .appendTo(text);
                $CQ("<img>")
                    .attr("src", CQ.shared.HTTP.externalize("/libs/cq/ui/widgets/themes/default/icons/16x16/clientcontext.png"))
                    .appendTo(link);
                
                if ( forceLoad && callback ) {
                    callback.call(this);
                }
                return;
            }

            // retrieve all experiences from the server & find matching offers for this mbox
            // TODO: custom json (to avoid recursion-too-deep issue)
            $CQ.ajax(this.campaign + ".infinity.json?ck=" + new Date()).done(function(campaign) {
                that.campaignTree = campaign;

                // recreate from scratch, jcarousel (or the version we have) doesn't support updates
                if (that.carousel) {
                    // remove carousel container div
                    that.el.find(".cq-targeting-editor-content").remove();
                    that.carousel = null;
                }

                var selectedExperience = ClientContext.get(EXPERIENCE_PROP);
                if (!selectedExperience) {
                    // safety fallback: if no experience is selected, use DEFAULT
                    selectedExperience = CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE;
                }
                var selectedItemIdx = -1;

                var contentDiv = $CQ("<div>").addClass("cq-targeting-editor-content").appendTo(that.el);
                that.carousel = $CQ("<ul>").appendTo(contentDiv);

                // entry for default content
                that.offers[CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE] = that.component.path;

                if (selectedExperience === CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE) {
                    selectedItemIdx = 0;
                }

                that.carousel.append(that.createExperienceItem(
                    that.component.path + ".thumb.png?cq_ck=" + Date.now(),
                    CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE,
                    CQ.I18n.getMessage("Default")
                ));

                var itemCounter = 1;
                // existing experiences
                $CQ.each(campaign, function(experienceName, experience) {
                    if (experience["jcr:content"] &&
                        experience["jcr:content"]["sling:resourceType"] === "cq/personalization/components/experiencepage") {
                        // experience found
                        var offer = that.findOffer(experience, that.component.path);

                        var experiencePath = that.campaign + "/" + experienceName;
                        var imgUrl;
                        if (offer !== null) {
                            var offerPath = experiencePath + "/" + offer.name;
                            imgUrl = offerPath + ".thumb.png?cq_ck=" + Date.now();
                            that.offers[experiencePath] = offerPath;
                        } else {
                            // missing offer, show nothing yet
                            imgUrl = "";
                            that.offers[experiencePath] = null;
                        }

                        if (experiencePath === ClientContext.get(EXPERIENCE_PROP)) {
                            selectedItemIdx = itemCounter;
                        }

                        that.carousel.append(that.createExperienceItem(
                            imgUrl,
                            experiencePath,
                            experience["jcr:content"]["jcr:title"] || experienceName
                        ));
                        itemCounter++;
                    }
                });

                // HACK to protect against broken reloading of jquery due to ajax requests
                if (!that.carousel.jcarousel) {
                    GraniteClientLibraryManager.includeScript(CQ.shared.HTTP.externalize("/etc/clientlibs/foundation/personalization/jcarousel.js"));
                }

                // build jcarousel (will change dom)
                that.carousel.jcarousel({
                    start: selectedItemIdx,
                    itemFallbackDimension: 142 // keep in sync with @itemWidth from target.less
                });

                // mark selected experience
                if (selectedExperience) {
                    $CQ(that.carousel).find('li[data-cq-experience="' + selectedExperience + '"]').addClass("cq-targeting-experience-selected");
                }

                if (callback) {
                    callback.call(that);
                }
            }).fail(function() {
                CQ.Notification.notify("Could not load experiences");
            });
        },

        // recursively search for offers with the right @location
        findOffer: function(experience, location) {
            var result = null;
            $CQ.each(experience, function(offerName, child) {
                if (child["jcr:primaryType"] === "cq:Page") {
                    if (child["jcr:content"] && child["jcr:content"].location === location) {
                        result = {
                            name: offerName,
                            obj: child
                        };
                        return true;
                    }
                }
            });
            return result;
        },

        /** handles the click on the "add experience" button */
        addExperience: function () {
            var that = this;

            // if no campaign is selected, ignore
            if (!that.campaign) {
                return;
            }
            if (!that.segmentDialogShown) {
                that.segmentDialogShown = true;

                $CQ.ajax("/etc/segmentation.infinity.json").done(function(segmentTree) {
                    var segments = {};
                    segmentTree.path = "/etc/segmentation";
                    traverse(segmentTree, function(key, obj, parent) {
                        if (parent) {
                            obj.path = parent.path + "/" + key;
                        }
                        if (obj["jcr:content"] &&
                            obj["jcr:content"]["sling:resourceType"] === "cq/personalization/components/segmentpage") {
                            segments[obj.path] = {
                                path: obj.path,
                                name: key,
                                title: obj["jcr:content"]["jcr:title"] || key
                            };
                        }
                    });
                    var width = 270;
                    // build segment selection "dialog" UI
                    var dialog = $CQ("<div>")
                        .addClass("cq-targeting-experience-dialog")
                        .css("position", "absolute")
                        .css("top", (that.addEl.offset().top + 33) + "px")
                        .css("left", (that.addEl.offset().left - 5) + "px")
                        .css("width",  width + "px")
                        .css("height", "100px");

                    $CQ("<h3>").text(CQ.I18n.getMessage("Choose Segment:")).appendTo(dialog);

                    // find used segments
                    var usedSegments = {};
                    if (that.campaignTree) {
                        traverse(that.campaignTree, function(key, obj, parent) {
                            if (obj["sling:resourceType"] === "cq/personalization/components/experiencepage") {
                                var segments = obj["cq:segments"];
                                if ($CQ.isArray(segments)) {
                                    $CQ.each(segments, function(idx, segment) {
                                        usedSegments[segment] = true;
                                    });
                                } else if (typeof segments === "string") {
                                    usedSegments[segments] = true;
                                }
                            }
                        });
                    }

                    var select = $CQ("<select>").appendTo(dialog);
                    $CQ.each(segments, function(path, segment) {
                        var title = segment.title;
                        if (usedSegments[segment.path]) {
                            title = title + CQ.I18n.getMessage(" (in use)");
                        }
                        $CQ("<option>")
                            .attr("value", segment.path)
                            .text(title)
                            .appendTo(select);
                    });

                    var inspectLink = $CQ("<a>")
                        .addClass("cq-targeting-segment-link")
                        .attr("target", "_blank")
                        .text(CQ.I18n.getMessage("Inspect"))
                        .appendTo(dialog);

                    select.change(function() {
                        inspectLink.attr('href', select.find(':selected').val() + ".html");
                    });

                    $CQ("<input>").attr("type", "submit").attr("value", CQ.I18n.getMessage("Add")).click(function() {
                        var segment = segments[$CQ(select).val()];
                        if (segment) {
                            that.createExperience(segment.name, segment.title, segment.path);
                        }

                        $CQ(dialog).remove();
                        that.segmentDialogShown = false;
                    }).appendTo(dialog);

                    $CQ("<input>").attr("type", "submit").attr("value", CQ.I18n.getMessage("Cancel")).click(function() {
                        $CQ(dialog).remove();
                        that.segmentDialogShown = false;
                    }).appendTo(dialog);

                    $CQ("#CQ").append(dialog);
                });
            }
        },

        toggle: function() {
            if (this.shown) {
                this.hide();
            } else {
                this.show();
            }
        },

        // position the popup above the components dom element
        position: function() {
            if (this.shown) {
                var anchor = $CQ(this.component.element.dom);

                this.el.css("top",   anchor.offset().top  + "px")
                       .css("left",  anchor.offset().left + "px")
                       .css("width", anchor.width()       + "px");

                if (this.el.offset().top < 0) {
                    this.el.offset({top: 0});
                }
            } else {
                this.positionOverlayIcon();
            }
        },

        positionOverlayIcon: function() {
            var anchor = $CQ(this.component.element.dom);

            var ICON_SIZE = 40; // keep in sync with height + width of cq-targeting-launch-icon in target.less

            this.overlayIcon.css("top",  (anchor.offset().top + anchor.height() - ICON_SIZE) + "px")
                            .css("left", (anchor.offset().left + anchor.width() - ICON_SIZE) + "px");
        },

        showOverlayIcon: function() {
            // do not show the overlay icon while the experience popup is open
            // and not if we are in preview mode
            if (!this.shown && !CQ.WCM.isPreviewMode()) {
                if( $CQ.support.opacity) {
                    this.overlayIcon.fadeIn("normal");
                } else {
                    this.overlayIcon.show();
                }
            }
        },

        hideOverlayIcon: function() {
            if( $CQ.support.opacity) {
                this.overlayIcon.fadeOut("fast");
            } else {
                this.overlayIcon.hide();
            }
        },

        show: function() {
            this.shown = true;

            // make sure experiences are loaded if not yet
            // (usually done by ClientContext update already)
            this.loadExperiences();

            // bring into position before fade in
            this.position();

            // do not show the overlay icon while the experience popup is open
            this.hideOverlayIcon();

            if( $CQ.support.opacity) {
                this.el.fadeIn("normal");
            } else {
                this.el.show();
            }
        },

        hide: function() {
            if( $CQ.support.opacity) {
                this.el.fadeOut("fast");
            } else {
                this.el.hide();
            }
            this.shown = false;
        },

        remove: function() {
            this.el.remove();
            this.overlayIcon.remove();

            var campaignStore = ClientContext.get("campaign");
            if (campaignStore) {
                campaignStore.removeListener("update", this.onCampaignUpdate);
            }

            CQ.WCM.un("editableready", this.onEditableReady, this);
        }
    };

    /**
     * Gets or creates the TargetEditor object for a target component.
     * @param {CQ.wcm.EditBase} component a CQ.wcm.EditBase instance for a target component
     */
    CQ.personalization.TargetEditor.get = function(component) {
        if (!component.targetEditor) {
            component.targetEditor = new CQ.personalization.TargetEditor(component);
        }
        return component.targetEditor;
    };

}());
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


// Analytics mode for the implicit mbox
/**
 * Analytics UI for the Implicit Mbox component
 * 
 * @constructor
 * 
 * @param {HTMLDomElement} parent The parent DOM element for this component
 * @param {String} location The location of the target component
 */
CQ.personalization.TargetAnalyticsOverlay = function(parent, location) {
    
    this.parent = parent;
    this.location = location;
    
    if ( $CQ(parent).find('.analyzable-overlay').length === 0 ) {
        this.overlay = $CQ('<div>').attr('class', 'analyzable-overlay-contents');
        
        $CQ(parent).append
            ($CQ('<div>').attr('class', 'analyzable-overlay').append(
                $CQ('<div>').attr('class','analyzable-overlay-background-1').append(
                        this.overlay)));
    } else {
        this.overlay = $CQ(parent).find('.analyzable-overlay-contents');
    }
};

CQ.personalization.TargetAnalyticsOverlay.prototype = {
    
    BAR_MAX_WIDTH_PX : 220,
    
    /**
     * Toggles the visibility of this component and - if visible - displays the performance report 
     * for the the specified <tt>campaignPath</tt>
     * 
     * @public
     */
    toggle: function(campaignPath) {
    
        var topOverlay = $CQ(this.parent).find('.analyzable-overlay');
        
        if ( topOverlay.is(':visible') ) {
            topOverlay.hide();
        } else {
            topOverlay.show();
                if ( campaignPath === '') {
                    this.displayMessage(CQ.I18n.get("Please select a campaign from the client context."));
                } else {
                    this.showAnalyticsForCampaign(campaignPath);
                }
        }
    },
    
    /**
     * Installs a listener on the campaign which refreshes the performance report for newly selected campaigns
     * when this component is visible.
     * 
     * @public
     */
    installCampaignStoreListener: function() {
        
        var that = this;
        var campaignStore = ClientContext.get("campaign");
        if ( !campaignStore )
            return;
            
        campaignStore.addListener("update", function(event, property) {
            if ( ( property === "path" || $CQ.inArray("path", property) ) && ClientContext.get("campaign/path") !== '' )
                if ( $CQ(that.parent).find('.analyzable-overlay').is(':visible') ) {
                    that.showAnalyticsForCampaign(ClientContext.get("campaign/path"), this.location);                    
                }
        }, this);
    },
    
    /**
     * Displays the most significant part of a number in a human-readable format
     * 
     * <p>For instance, 12500 would be displayed as 12k</p>
     */
    displayCompressedNumber: function(number) {
        
        var millions = number / 1000000;
        if ( millions > 1 )
            return Math.round(millions) + CQ.I18n.get("m", [], "A shorthand notation for millions.");

        var thousands = number / 1000;
        if ( thousands > 1 )
            return Math.round(thousands) + CQ.I18n.get("k", [], "A shorthand notation for thousands");
        
        return number;
        
    },
       
    /**
     * @private
     */
    showAnalyticsForCampaign: function(campaignPath) {
        var url = CQ.shared.HTTP.externalize("/libs/cq/analytics/testandtarget/command");
        this.overlay.text(CQ.I18n.get('Loading campaign analytics...'));

        var that = this;
        
        $CQ.post(url, { 'cmd': 'getPerformanceReport', 'campaignPath': campaignPath, 'location': this.location},
            function(response) {
                if ( response.error ) {
                    that.overlay.text(response.error);
                    return;
                }
                
                that.overlay.empty();
                
                var legend = $CQ('<div>').attr('class', 'analyzable-legend');
                
                var conversionsLegend = $CQ('<div>').attr('class', 'analyzable-legend-lift');

                $CQ('<span>').text(CQ.I18n.get('LIFT')).appendTo(conversionsLegend);
                var liftLegend = $CQ('<div>').attr('class', 'analyzable-legend-lift-image').appendTo(conversionsLegend);
                $CQ('<div>').attr('class', 'analyzable-legend-lift-image-negative').appendTo(liftLegend);
                $CQ('<div>').attr('class', 'analyzable-legend-lift-image-positive').appendTo(liftLegend);

                
                var impressionsLegend = $CQ('<div>').attr('class', 'analyzable-legend-impressions');
                $CQ('<div>').attr('class', 'analyzable-legend-impressions-image').appendTo(impressionsLegend);
                $CQ('<span>').text(CQ.I18n.get('VISITORS')).appendTo(impressionsLegend);
                
                legend.append(conversionsLegend).append(impressionsLegend).appendTo(that.overlay);
                
                if ( response.experiences && response.experiences.length > 0 ) {
                    
                    var defaultExperienceConversionRate;
                    var maxConversionRate = 0;
                    $CQ.each(response.experiences, function(index, experience)  {
                        if ( index === 0 )
                            defaultExperienceConversionRate = that.conversionRate(experience);
                        
                        maxConversionRate = Math.max(maxConversionRate, that.conversionRate(experience));
                    });
                    
                    $CQ.each(response.experiences, function (index, experience) {
                        
                        var highlight = [];
                        var isDefault = index === 0;
                        var conversionRate = that.conversionRate(experience);
                        var isWinner = conversionRate === maxConversionRate && conversionRate > 0;
                        var liftPercentage = '';
                        var liftClass = ''; 
                        if ( !isDefault )  {
                            liftPercentage = that.percentage(maxConversionRate, conversionRate - defaultExperienceConversionRate, true);
                            liftClass = liftPercentage.charAt(0) == '+' ? 'analyzable-row-lift-positive' : 'analyzable-row-lift-negative';
                        }
                        
                        var row;
                        var wrapper;
                        if ( isWinner ) {
                            wrapper = $CQ('<div>');
                            $CQ('<div>').attr('class', 'analyzable-row-winner-marker').appendTo(wrapper);
                            row = $CQ('<div>').attr('class', 'analyzable-row');
                            row.addClass('analyzable-row-winner');
                            row.appendTo(wrapper);
                        } else {
                            row = $CQ('<div>').attr('class', 'analyzable-row');
                        }
                        
                        var iconDiv = $CQ('<div>').attr('class', 'analyzable-row-icon').appendTo(row);
                        
                        var thumb = experience.thumbnail ? CQ.shared.HTTP.externalize(experience.thumbnail) : that.location + '.thumb.png';
                        var thumbImage = $CQ('<img>').attr('src', thumb ).appendTo(iconDiv);
                        CQ_Analytics.onImageLoad(thumb, function(img) {
                            // keep target image size in sync with .analyzable-row-icon width and height in analytics.less
                            var scaled = CQ_Analytics.scaleImage(img.width, img.height, 60, 44);
                            thumbImage.width(scaled.width);
                            thumbImage.height(scaled.height);
                            thumbImage.css("top", scaled.top);
                            thumbImage.css("left", scaled.left);
                            thumbImage.fadeIn();
                        });

                        var rowFirst = $CQ('<div>').attr('class', 'analyzable-row-first');
                        if ( liftPercentage )
                            $CQ('<div>').attr('class', liftClass).text(liftPercentage).appendTo(rowFirst);
                        var experienceDiv = $CQ('<div>').attr('class', 'analyzable-row-experience').text(experience.name).appendTo(rowFirst);
                        
                        if ( isDefault ) {
                            $CQ('<span>').attr('class', 'analyzable-row-highlight-default').text(CQ.I18n.get('DEFAULT')).appendTo(experienceDiv);
                        }
                        
                        if ( isWinner ) {
                            $CQ('<span>').attr('class', 'analyzable-row-highlight-winner').text(CQ.I18n.get('WINNER')).appendTo(experienceDiv);
                        }
                        
                        var rowSecond = $CQ('<div>').attr('class', 'analyzable-row-second');
                        $CQ('<div>').attr('class', 'analyzable-row-impression-count').text(that.displayCompressedNumber(experience.impressions)).appendTo(rowSecond);
                        $CQ('<div>').attr('class', 'analyzable-row-conversion-rate').text(that.percentage(experience.impressions, experience.conversions)).appendTo(rowSecond);
                        
                        that.drawConversionBars(rowSecond, conversionRate, maxConversionRate, isDefault);
                        
                        rowFirst.appendTo(row);
                        rowSecond.appendTo(row);
                        
                        if ( wrapper )
                            that.overlay.append(wrapper);
                        else
                            that.overlay.append(row);
                    });
                } else {
                    that.overlay.append($CQ("<div>").text(
                            CQ.I18n.get('No performance data returned by the Test&Target API. Make sure that your campaign is activated and mboxes are accessed on a publish instance.')));
                }
                
            }
        );
    },
    
    /**
     * @private
     */
    conversionRate: function(experience) {
        
        if ( experience.conversions === 0 || experience.impressions === 0  )
            return 0;
        
        return experience.conversions / experience.impressions;
    },

    /**
     * @private
     */
    percentage: function(total, slice, forceSign) {
        if ( total === 0 || slice === 0 )
            return '0%';
        
        if ( typeof forceSign === "undefined ") 
            forceSign = false;
        
        var prefix;
        if ( forceSign ) {
            prefix = ( slice >= 0 ? '+ ' : '- ');
        } else {
            prefix = ( slice >= 0 ? '' : '-');
        }
            
        return prefix + Math.abs(( 100 * slice / total ).toFixed(2)) + '%';    
    },
    
    /**
     * @private
     */
    displayMessage: function(message) {
        this.overlay.text(message);
    },

    /**
     * @private
     */    
    drawConversionBars: function(row, conversionRate, maxConversionRate, isDefault) {
        
        var baseBarWidth;
        var positiveLiftBarWidth = 0;
        var negativeLiftBarWidth = 0;
        var conversionRateRatio = ( conversionRate / maxConversionRate );  
        if ( isDefault) {
            baseBarWidth = conversionRateRatio * this.BAR_MAX_WIDTH_PX;
            defaultExperienceConversionRate = conversionRate;
        } else {
            var conversionDelta = (conversionRate - defaultExperienceConversionRate) / maxConversionRate;
            var defaultExperienceBaseBarWidth = defaultExperienceConversionRate / maxConversionRate * this.BAR_MAX_WIDTH_PX; 
            if ( conversionDelta > 0 ) { // positive lift
                baseBarWidth = defaultExperienceBaseBarWidth;
                if ( baseBarWidth !== 0 ) {
                    positiveLiftBarWidth = baseBarWidth * conversionDelta;
                } else {
                    positiveLiftBarWidth = this.BAR_MAX_WIDTH_PX * conversionDelta;
                }
            } else { // negative lift
                negativeLiftBarWidth = - conversionDelta * this.BAR_MAX_WIDTH_PX;
                baseBarWidth = (defaultExperienceConversionRate / maxConversionRate * this.BAR_MAX_WIDTH_PX  )- negativeLiftBarWidth;
            }
        }

        var bars = $CQ('<div>').attr('class', 'analyzable-row-bars').appendTo(row);                        
        
        $CQ('<div>').attr('class', 'analyzable-row-bar-default').css('width', baseBarWidth + 'px').appendTo(bars);
        if ( positiveLiftBarWidth !== 0 )
            $CQ('<div>').attr('class', 'analyzable-row-bar-positive-lift').css('width', positiveLiftBarWidth+ 'px').appendTo(bars);
        if ( negativeLiftBarWidth !== 0 )
            $CQ('<div>').attr('class', 'analyzable-row-bar-negative-lift').css('width', negativeLiftBarWidth + 'px').appendTo(bars);
    }
};
