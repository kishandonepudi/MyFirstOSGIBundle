
CQ.Ext.namespace("CQ.analytics");
CQ.Ext.namespace("CQ.analytics.services");
CQ.Ext.namespace("CQ.analytics.SiteCatalyst");
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

    ============================================================================
*/

CQ.analytics.Report = new function() {
    return {
        
        /** Default report template name */
        DEFAULT_TPL_NAME: "report-template.json",
        
        /** Default report template */
        DEFAULT_REPORT_TPL : "{" + 
                             "    'jcr:primaryType':'cq:PollConfigFolder'," +
                             "    'source':'screport:default'," +
                             "    'interval':300" + 
                             "    'reportDescription': {" +
                             "        'date':'+0d'" +
                             "    }" +
                             "}",
        
        /**
         * Creates a cq:PollConfigFolder based on a report-template.json
         * file located within the component. The report poll config will
         * be created with a :import command by Sling once the template
         * is fetched.
         *
         * @param path Path to component within the page
         * @param definition Component definition object
         */
        createConfigFromTpl: function(editbase,path,definition) {
            var cmpPath = CQ.shared.HTTP.externalize(definition.path);
            var parPath = CQ.shared.HTTP.externalize(path);
            var tplResponse = CQ.shared.HTTP.get(cmpPath + "/" + CQ.analytics.Report.DEFAULT_TPL_NAME);
            var tpl = (CQ.shared.HTTP.isOk(tplResponse) && tplResponse.body.length > 0) 
                            ? tplResponse.body 
                            : CQ.analytics.Report.DEFAULT_REPORT_TPL;
            CQ.shared.HTTP.post(
                parPath,
                function(opts,success,xhr,response) {
                    if (success) {
                        editbase.refreshCreated(path, definition);
                    } else {
                        if (console) console.error("PollConfig creation failed", response);
                        CQ.Ext.Msg.show({
                           title: CQ.I18n.getMessage('Error'),
                           msg: CQ.I18n.getMessage('PollConfig creation failed.'),
                           buttons: CQ.Ext.Msg.OK,
                           icon: CQ.Ext.MessageBox.ERROR
                        });
                    }
                },
                {
                    ":operation":"import",
                    ":contentType":"json",
                    ":nameHint":"report",
                    ":content": tpl
                }, 
                this, 
                true
            );
        },
        
        /**
         * Fetches report suites for a field with the name 
         * './report/reportDescription/reportSuiteID' according 
         * to the selection of the related './report/cq:cloudserviceconfig' 
         * field.
         *
         * @param dialog Caller dialog
         */
        fetchReportSuites: function(dialog) {
            var dlg = dialog.findParentByType('dialog');
            var cmpReportSuites = dlg.find('name','./report/reportDescription/reportSuiteID');
            var cmpCfg = dlg.find('name','./report/cq:cloudserviceconfig');
            if (cmpReportSuites.length > 0 && cmpCfg.length > 0) {
                var cfg = cmpCfg[0].getValue();
                if (cfg !== '' 
                    && cmpReportSuites[0].contentBasedOptionsURL.indexOf('configPath') == -1) {
                    cmpReportSuites[0].contentBasedOptionsURL += "?configPath=" + cfg;
                }
                cmpReportSuites[0].processPath(dlg.path);
                cmpReportSuites[0].doLayout();
            }
        },

        /**
         * Clears the report suite selection.
         *
         * @param dialog Caller dialog
         */
        clearReportSuite: function(dialog) {
            var dlg = dialog.findParentByType('dialog');
            var cmpReportSuites = dlg.find('name','./report/reportDescription/reportSuiteID');
            if (cmpReportSuites.length > 0) {
            	cmpReportSuites[0].setValue('');
            }
        }
        
    }
}();
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

    ============================================================================
*/

CQ.analytics.SAINT = new function() {
    return {
        

        /**
		 * Fetches compatability metrics for a field with the name
		 * './dataset' according to the selection of the related
		 * './reportsuites' field.
		 * 
		 * @param dialog
		 *            Caller dialog
		 */
        fetchCompatabilityMetrics: function(dialog) {
            var dlg = dialog.findParentByType('dialog');
            var cmpDataSet = dlg.find('name','./dataset');
            var cmpReportSuites = dlg.find('name','./reportsuites');
            if (cmpDataSet.length > 0 && cmpReportSuites.length > 0) {
                var rsids = cmpReportSuites[0].getValue();
                if (rsids !== '' 
                    && cmpDataSet[0].contentBasedOptionsURL.indexOf('reportSuites') == -1) {
                    cmpDataSet[0].contentBasedOptionsURL += "?reportSuites=" + rsids;
                }
                cmpDataSet[0].processPath(dlg.path);
                cmpDataSet[0].doLayout();
            }
        }
        
    }
}();

CQ.Ext.namespace("CQ.testandtarget");

/**
 *Checks if dialog has a valid (<12) amount of variable fields with prefix profile.
 */
CQ.testandtarget.isValidMboxProfileSize = function(dialog) {
	var fields = dialog.findBy(function(comp,scope){ 
        if (comp instanceof CQ.analytics.CCMVariableFieldItem) {
            if (comp.isProfileField.getValue() === true) {
                return true;
            }
        } else 
        if (comp instanceof CQ.analytics.VariableFieldItem) {
        	if (comp.keyField.getValue().match(/^profile\..*$/)) {
        		return true;
        	}
        }
    });
    var isValid = (fields && fields.length < 12);
    if (!isValid) { 
        CQ.Ext.Msg.show({
            "title": CQ.I18n.getMessage("Error"),
            "msg": CQ.I18n.getMessage("Test&Target mboxes only support 11 profile parameters."),
            "buttons": CQ.Ext.Msg.OK,
            "icon": CQ.Ext.Msg.ERROR
        });
    }
    return isValid;
};
CQ.Ext.namespace("CQ_Analytics.TestTarget");

CQ_Analytics.TestTarget.storesPropertiesOptionsProvider = function() {
    var options = [];
    var stores = CQ_Analytics.StoreRegistry.getStores();
    for(var name in stores) {
        var store = CQ_Analytics.StoreRegistry.getStore(name);
        if( store ) {
            var names = store.getPropertyNames();
            for(var j = 0; j < names.length; j++) {
                var value = names[j];
                if( !CQ.shared.XSS.KEY_REGEXP.test(value) ) {
                    options.push({
                        value: name + "." + value
                    });
                }
            }
        }
    }
    
    options.sort(function(a, b) {
        if ( a.value < b.value )
            return -1;
        else if ( a.value > b.value )
            return 1;
        return 0;
    });
    
    return options;
};

/**
 * Refreshes the enabled/disabled state of components in the target component dialog based on
 * whether accurate targeting is enabled or not 
 */
CQ_Analytics.TestTarget.onAccurateTargetingSelectionLoaded = function (comp, record, path) {
	
	// we exepect the 'accurateTargeting' component to have a single value
	var value;
	if ( comp.getValue() && comp.getValue().length )
		value = comp.getValue()[0];
	else
		value = comp.getValue();
	
	CQ_Analytics.TestTarget.onAccurateTargetingSelectionChanged(comp, comp.getValue(), value == comp.inputValue);
};

/**
 * Refreshes the enabled/disabled state of components in the target component dialog based on
 * whether accurate targeting is enabled or not 
 */
CQ_Analytics.TestTarget.onAccurateTargetingSelectionChanged = function(comp, value, isChecked) {
	
    var otherComponents = comp.ownerCt.findBy(function(component, thisContainer) { 
        return component != comp && ( component.xtype == 'ccmvariablefield' || component.xtype == 'variablefield' );
    });
	
    for ( var i = 0 ; i < otherComponents.length; i++ ) {
        var component = otherComponents[i];
        
        if ( isChecked )
            component.enable();
        else
            component.disable();
    }
};

CQ.analytics.CheckableFieldSet = CQ.Ext.extend(CQ.form.CompositeField,  {
    
	/**
	 * @private
	 */
	disabled: false,
	
	/**
     *@private
     */
    hiddenField: null,
    
    /**
     *@private
     */
    titleCheckbox: null,
    
    /**
     *@private
     */
    fieldSet: null,

    constructor: function(config) {
    	CQ.Util.applyDefaults(config, {
            "header": false,
            "border": false,
            "hideLabel": true,
            "cls": "cq-analytics-chkfieldset"
        });
        CQ.analytics.CheckableFieldSet.superclass.constructor.call(this, config);
        
        var ref = this;
        
        var fieldItems = CQ.Util.copyObject(config.items);
        
        this.fieldSet = new CQ.form.DialogFieldSet({
            "title": ref.title,
            "collapsible": true,
            "collapsed": true,
            "items": fieldItems,
            "layoutConfig": {
            	"hideLabels": false
            },
            "listeners": {
                "render": function() {
                    var fs = this;
                    ref.titleCheckbox = new CQ.Ext.form.Checkbox({
                        "renderTo": fs.header,
                        "name": ref.name,
                        "inputValue": ref.inputValue,
                        "boxLabel": ref.title,
                        "listeners": {
                            "check": function(checkbox, checked) {
                                ref.setFieldsDisabled(!checked);
                                //additional
                                (checked) ? fs.expand() : fs.collapse();
                                var pnl = ref.findParentByType('analyticspanel');
                                if(pnl) {
                                	pnl.handleResourceType();
                                }
                            }
                        }
                    });
                    this.setTitle(""); // clear original title (now box label)
                }
            }
        });

        this.items.clear();
        this.add(this.fieldSet);        
		
        //field for select deletion
        this.hiddenField = new CQ.Ext.form.Hidden({
            "name": config.name + CQ.Sling.DELETE_SUFFIX,
            "value": "true"
        });
        this.add(this.hiddenField);

    },
    
    /**
     * Check title checkbox and expand field if it checked.
     * 
     * @param record
     * @param path
     */
    processRecord: function(record, path){
        if (this.fireEvent('beforeloadcontent', this, record, path) !== false) {
            var v = record.get(this.getName());
            if (v != undefined) {
                if(typeof(v) == 'string'){
                    // single value -> convert to array
                    v = [v];
                }
                var H = {};
                for(var x in v){
                    H[v[x]] = true;
                }

                var gcv = this.titleCheckbox.inputValue;
                if(typeof(gcv) != 'undefined' && typeof(H[gcv]) != 'undefined'){
                    this.titleCheckbox.setValue(true);
                    this.expand();
                }else{
                	this.setFieldsDisabled(true);
                }
            } else {
            	this.setFieldsDisabled(true);
            }
            
            //process fieldset items
            for(var i=0; i<this.fieldSet.items.items.length; i++) {
                var comp = this.fieldSet.items.items[i];
                if(comp && comp.processRecord && !comp.initialConfig.ignoreData) {
                	comp.processRecord(record, path);
                }
            }
            
            this.fireEvent('loadcontent', this, record, path);
        }
    },
    
    processPath: function(path, ignoreData) {   	
    	//process fieldset items
        for(var i=0; i<this.fieldSet.items.items.length; i++) {
            var comp = this.fieldSet.items.items[i];
            if(comp && comp.processPath) {
            	comp.processPath(path, ignoreData);
            }
        }
    },
    
    setChecked: function(isChecked) {
    	this.titleCheckbox.setValue(isChecked);
    },
    
    isChecked: function() {
    	return (this.titleCheckbox.getValue() != undefined &&
    			this.titleCheckbox.getValue() != "");
    },
    
    setDisabled: function(isDisabled) {
    	this.disabled = isDisabled;
    	this.titleCheckbox.setDisabled(isDisabled);
    	//only enable if checked
    	if(this.isChecked()) {
    		this.setFieldsDisabled(isDisabled);
    	}
    	this.fieldSet.setDisabled(isDisabled);
	},
	
	isDisabled: function() {
		return (this.disabled);
	},
	
	/**
	 * @private
	 */
    setFieldsDisabled: function(isDisabled) {
    	this.disabled = isDisabled;
    	for (var i = 0; i < this.fieldSet.items.length; i++) {
            var item = this.fieldSet.items.items[i];
            if(item.name != this.name && item instanceof CQ.Ext.form.Field) {
               item.setDisabled(isDisabled);
            }
        }
    }   

});

CQ.Ext.reg('checkablefieldset', CQ.analytics.CheckableFieldSet);

CQ.analytics.ReportSuiteField = CQ.Ext.extend(CQ.form.MultiField, {
    constructor: function(config) {
        config.fieldConfig.parent = this;
        CQ.Util.applyDefaults(config, {
            "cls": "cq-analytics-rsid"
        });
        CQ.analytics.ReportSuiteField.superclass.constructor.call(this, config);
    }
});

CQ.Ext.reg('reportsuitefield', CQ.analytics.ReportSuiteField);

CQ.analytics.ReportSuiteFieldItem = CQ.Ext.extend(CQ.form.CompositeField, {

    constructor: function(config) {
        var fieldItem = this;
        var items = new Array();
        var displayField = "rsid";
        items.push({
            mode: 'local',
            triggerAction: 'all',
            store: config.store,
            xtype: 'combo',
            editable: false,
            emptyText: CQ.I18n.getMessage("Report Suite"),
            displayField: displayField,
            tpl: '<tpl for="."><div class="x-combo-list-item" ext:qtip={' +
                displayField + '}>{' + displayField + '}</div></tpl>',
            valueField: "rsid",
            columnWidth: 0.7,
            listeners: {
                select: function(combo, record, index) { // propagate the select event since this triggers loading the tracking server data
                    fieldItem.hiddenField.setValue(record.get('rsid') + ";" +
                        fieldItem.runModeField.getValue());
                    fieldItem.parent.fireEvent("select", combo, record, index);
                }
            }
        });
        items.push({
            xtype: 'combo',
            emptyText: CQ.I18n.getMessage("Run Mode"),
            store: [["", "all"], ["author", "author"], ["publish", "publish"]],
            mode: "local",
            triggerAction: 'all',
            columnWidth: 0.3,
            listeners: {
                select: function(combo, record, index) { // propagate the select event since this triggers loading the tracking server data
                    fieldItem.hiddenField.setValue(fieldItem.reportSuiteField.getValue() +
                        ";" + record.get("field1"));
                    fieldItem.parent.fireEvent("select", combo, record, index);
                }
            }
        });
        items.push({
            xtype: 'hidden',
            name: "./analytics/cq:s_account"
        });

        config = CQ.Util.applyDefaults(config, {
            "border": false,
            "items":[
                {
                    "xtype":"panel",
                    "border":false,
                    "layout": "column",
                    "items":items
                }
            ]
        });
        CQ.analytics.ReportSuiteFieldItem.superclass.constructor.call(this,config);
    },

    initComponent: function() {
        CQ.analytics.ReportSuiteFieldItem.superclass.initComponent.call(this);
        
        this.reportSuiteField = this.items.items[0].items.items[0];
        this.runModeField = this.items.items[0].items.items[1];
        this.hiddenField = this.items.items[0].items.items[2];
        
        this.on("disable", function() {
            for(var i=0; i<this.items.items[0].items.length; i++) {
                var item = this.items.items[0].items.items[i];
                if(item instanceof CQ.Ext.form.Field) {
                    item.disable();
                }
            }
        });

        this.on("enable", function() {
            for(var i=0; i<this.items.items[0].items.length; i++) {
                var item = this.items.items[0].items.items[i];
                if(item instanceof CQ.Ext.form.Field) {
                    item.enable();
                }
            }
        });
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        return this.reportSuiteField.getValue() + ";" + this.runModeField.getValue();
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        if(value.indexOf(";") != -1) {
            var reportSuite = value.substring(0, value.indexOf(";"));
            var runMode = value.substring(value.indexOf(";") + 1);
        }else {
            var reportSuite = value;
            var runMode = "";
        }
        this.reportSuiteField.setValue(reportSuite);
        this.runModeField.setValue(runMode);
        this.hiddenField.setValue(value);
    }
    
});

CQ.Ext.reg('reportsuitefielditem', CQ.analytics.ReportSuiteFieldItem);
CQ.analytics.CCMVariableField = CQ.Ext.extend(CQ.form.MultiField, {
    
    record: null,
    
    constructor: function(config) {
        CQ.analytics.CCMVariableField.superclass.constructor.call(this, config);
        // obsolete variables, such as mbox params, should only be shown if already set
        config.obsolete ? this.hide() : '';
    },
    
    addItem: function(value) {
        this.show();
        var item = this.insert(this.items.getCount() - 1, {});
        var form = this.findParentByType("form");
        if (form)
            form.getForm().add(item.field);
        this.doLayout();

        if (item.field.processPath) item.field.processPath(this.path);
        if (item.field.processRecord) item.field.processRecord(this.record, this.path);
        if (value) {
            item.setValue(value);
        }

        if (this.fieldWidth < 0) {
            // fieldWidth is < 0 when e.g. the MultiField is on a hidden tab page;
            // do not set width but wait for resize event triggered when the tab page is shown
            return;
        }
        if (!this.fieldWidth) {
            this.calculateFieldWidth(item);
        }
        try {
            item.field.setWidth(this.fieldWidth);
        }
        catch (e) {
            CQ.Log.debug("CQ.form.MultiField#addItem: " + e.message);
        }
    },
    
    processRecord: function(record, path) {
        this.record = record;
        CQ.analytics.CCMVariableField.superclass.processRecord.call(this,record,path);
    }
    
});

CQ.Ext.reg('ccmvariablefield', CQ.analytics.CCMVariableField);


CQ.analytics.CCMVariableFieldItem = CQ.Ext.extend(CQ.form.CompositeField, {

    isProfileField: null,
    
    ccmVariableField: null,
    
    isProfileData: null,

    constructor: function(config) {
    	
        var fieldItem = this;
        var items = new Array();
        if ( config.showProfileField !== false ) {
	        this.isProfileField = new CQ.Ext.form.Checkbox({
	            "name": "./cq:isprofile",
	            "boxLabel": CQ.I18n.getMessage("Test&Target profile"),
	            "columnWidth": 0.5,
	            "height": 22,
	            "listeners": {
	                "check": function(cmp,checked) {
	                    if (checked) {
	                        cmp.setRawValue(fieldItem.ccmVariableField.getValue());
	                    } else {
	                        cmp.setRawValue('');
	                    }
	                }
	            }
	        });
        }
        
        this.ccmVariableField = new CQ.form.Selection({
            "type": "select",
            "name": "./cq:mappings",
            "optionsProvider": CQ_Analytics.TestTarget.storesPropertiesOptionsProvider,
            "columnWidth": 0.5,
            "listeners": {
                "selectionChanged": function() {
                	if ( fieldItem.isProfileField ) {
	                    if (fieldItem.isProfileKey(this.getValue())) {
	                        fieldItem.isProfileField.setValue(true);
	                        fieldItem.isProfileField.setReadOnly(true);
	                    } else {
	                        fieldItem.isProfileField.setValue(false);
	                        fieldItem.isProfileField.setReadOnly(false);
	                    }
                	}
                }
            }     
        });
        
        if ( this.isProfileField ) {
	        items.push(this.isProfileField);
	        items.push({"xtype": "hidden","name": this.isProfileField.getName() + CQ.Sling.DELETE_SUFFIX});
        }
        items.push(this.ccmVariableField);
        items.push({"xtype":"hidden","name": this.ccmVariableField.getName() + CQ.Sling.DELETE_SUFFIX});
        
        config = CQ.Util.applyDefaults(config, {
            "border": false,
            "layout": "column",
            "items": items
        });
        CQ.analytics.CCMVariableFieldItem.superclass.constructor.call(this,config);
    },

    initComponent: function() {
        CQ.analytics.CCMVariableFieldItem.superclass.initComponent.call(this);
    },
    
    processRecord: function(record, path) {
        if (this.fireEvent('beforeloadcontent', this, record, path) !== false) {
            var c = record.get("cq:isprofile");
            if (c != undefined) {
                if (!this.isProfileData) {
                    this.isProfileData = c;
                }
            }
            this.fireEvent('loadcontent', this, record, path);
        }
    },
    
    processPath: function(path) {
        this.ccmVariableField.processPath(path);
    },
    
    getValue : function() {
        return this.ccmVariableField.getValue();
    },
    
    isProfileKey: function(v) {
        return v.match(/^profile\..*$/);
    },
    
    setValue: function(v) {
        this.ccmVariableField.setValue(v);
        if(this.isProfileData && this.isProfileField
           && this.isProfileData.indexOf(v) > -1) {
            this.isProfileField.setValue(true);
            if (this.isProfileKey(v)) {
                this.isProfileField.setReadOnly(true);
            }
        }
    },
    
    disable: function() {
    	if ( this.isProfileField )
    		this.isProfileField.disable();
        this.ccmVariableField.disable();
    },

    enable: function() {
    	if ( this.isProfileField )
    		this.isProfileField.enable();
        this.ccmVariableField.enable();
    }
    
});

CQ.Ext.reg('ccmvariablefielditem', CQ.analytics.CCMVariableFieldItem);

CQ.analytics.VariableField = CQ.Ext.extend(CQ.form.MultiField, {
    
    constructor: function(config) {
        CQ.Util.applyDefaults(config, {
            "cls": "cq-analytics-configvalue",
            "orderable": false
        });
        CQ.analytics.VariableField.superclass.constructor.call(this, config);
    }
    
});

CQ.Ext.reg('variablefield', CQ.analytics.VariableField);

CQ.analytics.VariableFieldItem = CQ.Ext.extend(CQ.form.CompositeField, {

    constructor: function(config) {
        var fieldItem = this;
        var items = new Array();
        items.push({
            xtype: 'textfield',
            emptyText: "Variable",
            submitValue: false,
            columnWidth: 0.5,
            listeners: {
                change: function(field, newValue, oldValue) {
                    var val = [newValue, fieldItem.valueField.getValue()];
                    fieldItem.hiddenField.setValue(CQ.Ext.util.JSON.encode(val))
                }
            }
        });
        items.push({
            xtype: 'textfield',
            emptyText: "Value",
            columnWidth: 0.5,
            submitValue: false,
            listeners: {
                change: function(field, newValue, oldValue) {
                    var val = [fieldItem.keyField.getValue(), newValue];
                    fieldItem.hiddenField.setValue(CQ.Ext.util.JSON.encode(val));
                }
            }
        });
        items.push({
            xtype: 'hidden',
            name: config.name
        });
        
        config = CQ.Util.applyDefaults(config, {
            "border": false,
            "items":[
                {
                    "xtype":"panel",
                    "border":false,
                    "layout": "column",
                    "items":items
                }
            ]
        });
        CQ.analytics.VariableFieldItem.superclass.constructor.call(this,config);
    },

    initComponent: function() {
        CQ.analytics.VariableFieldItem.superclass.initComponent.call(this);
        
        this.keyField = this.items.items[0].items.items[0];
        this.valueField = this.items.items[0].items.items[1];
        this.hiddenField = this.items.items[0].items.items[2];
        
        this.on("disable", function() {
            for(var i=0; i<this.items.items[0].items.length; i++) {
                var item = this.items.items[0].items.items[i];
                if(item instanceof CQ.Ext.form.Field) {
                    item.disable();
                }
            }
        });

        this.on("enable", function() {
            for(var i=0; i<this.items.items[0].items.length; i++) {
                var item = this.items.items[0].items.items[i];
                if(item instanceof CQ.Ext.form.Field) {
                    item.enable();
                }
            }
        });
    },

    // overriding CQ.form.CompositeField#getValue   
    getValue: function() {
        var val = [this.keyField.getValue(),this.valueField.getValue()];
        return CQ.Ext.util.JSON.encode(val);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        var decvalue = CQ.Ext.util.JSON.decode(value);
        if(decvalue.length > 1) {
            this.keyField.setValue( decvalue[0] );
            this.valueField.setValue( decvalue[1] );
        }
        this.hiddenField.setValue(value);
    }
    
});

CQ.Ext.reg('variablefielditem', CQ.analytics.VariableFieldItem);

CQ.analytics.InstantSaveVariableField = CQ.Ext.extend(CQ.analytics.VariableField, {
    
    constructor: function(config) {
        var value = null;
        try {
            value = CQ.Ext.util.JSON.decode(config.value);
        } catch (e) { }
        config.value = value;
        CQ.analytics.InstantSaveVariableField.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.analytics.InstantSaveVariableField.superclass.initComponent.call(this);
        this.setValue(this.value);
        this.on("removeditem", this.updateVariablesField);
    },

    updateVariablesField: function() {
        var jsonValue = this.getJsonValue();
        if (jsonValue == null)
            return;
        var delta = { };
        delta[this.name] = jsonValue;
        CQ.HTTP.post(this.nodeUrl, function(options, success, response) {
            if (!success) {
                CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                    CQ.I18n.getMessage("Could not save cq variables"));
            }
        }, delta);
    },

    getJsonValue: function() {
        var items = this.findByType('variablefielditem');
        var pairs = [];
        for (var i = 0; i < items.length; i++) {
            var elem = items[i];
            var fields = [ elem.keyField, elem.valueField ];
            var isValid = true;
            CQ.Ext.each(fields, function(field) {
                if (!field.validate()) {
                    isValid = false;
                    return false;
                }
            });
            if (!isValid)
                return null;
            var pair = [elem.keyField.getValue(), elem.valueField.getValue()];
            pairs.push(pair);
        }
        return CQ.Ext.util.JSON.encode(pairs);
    }

});

CQ.Ext.reg('instantvariablefield', CQ.analytics.InstantSaveVariableField);

CQ.analytics.InstantSaveVariableFieldItem = CQ.Ext.extend(CQ.analytics.VariableFieldItem, {

    initComponent: function() {
        CQ.analytics.InstantSaveVariableFieldItem.superclass.initComponent.call(this);

        CQ.Ext.each([ this.keyField, this.valueField ], function(item) {
            var mainField = this.ownerCt;
            if (!mainField)
                return;
            item.on('change', function(field, newValue, oldValue) {
                if (this.updateVariablesField)
                    this.updateVariablesField();
            }, mainField);
        }, this);
    },

    setValue: function(value) {
        if (value.length >= 2) {
            this.keyField.setValue(value[0]);
            this.valueField.setValue(value[1]);
        }
    }
    
});

CQ.Ext.reg('instantvariablefielditem', CQ.analytics.InstantSaveVariableFieldItem);
CQ.analytics.StaticVariablesDialog = CQ.Ext.extend(CQ.Dialog, {

	variableField: null,
	
	constructor: function(config) {
		config = (!config ? {} : config);
		
		this.variableField = new CQ.analytics.VariableField({
			hideLabel: true,
			name: './analytics/cq:variables',
			fieldConfig: {
				xtype: 'variablefielditem'
			}	
		});
		
		config = CQ.Util.applyDefaults(config, {
    		title:CQ.I18n.getMessage("Static variables"),
    		width: 350,
    		height: 350,
    		items:[{
    			xtype: 'panel',
    			autoScroll: true,
    			items: [{
    				xtype: 'dialogfieldset',
    				border: false,
		    		items: [{
		    			xtype: 'static',
		    			bottommargin: true,
		    			text: CQ.I18n.getMessage('Static variable mappings allow you to set site-wide properties for your s_code')
		    		},
		    		this.variableField
		    		]
    			}]
    		}],
    		buttons: CQ.Dialog.OKCANCEL
	    });
		CQ.analytics.StaticVariablesDialog.superclass.constructor.call(this, config);
		
		this.loadContent(config.path);
	}

});

CQ.Ext.reg("staticvariablesdialog", CQ.analytics.StaticVariablesDialog);
// The InstantSaveForm saves fields on change, there's no save button
CQ.analytics.InstantSaveForm = CQ.Ext.extend(CQ.form.DialogFieldSet, {

    constructor: function(config) {        
        for (var i=0; i < config.items.length; i++) {
            config.items[i].addListener('change', this.saveField, this);
            config.items[i].addListener('check', this.saveField, this);    // the checkbox eats change
        };
        
        if (config.collapsible == undefined) config.collapsible = true;
        if (config.collapsed == undefined) config.collapsed = true;

        CQ.analytics.InstantSaveForm.superclass.constructor.call(this, config);
        
        this.loadFields.call(this);
    },
    
    loadFields: function() {
        try {
            var formData = CQ.HTTP.eval(this.nodeUrl + '.json');
            for (var i=0; i < this.items.items.length; i++) {
                var field = this.items.items[i];
                field.setValue(formData[field.fieldName]);
            }
        } catch(e) {
            CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                    CQ.I18n.getMessage("Could not retrieve {0}", [this.title]));
        }
    },    

    postField: function(field) {
        var delta = { };
        delta[field.fieldName] = field.getValue();
        CQ.HTTP.post(this.nodeUrl,
            function(options, success, response) {
                if (!success) {
                    CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), CQ.I18n.getMessage("Could not save {0}", [field.fieldLabel]));
                }
            },
            delta
        );
    },

    saveField: function(field) {
        if (field.validate() === true) {
            this.postField(field);
        } else {
            var sureMsg = CQ.I18n.getMessage("Are you sure you want to save this value?");
            CQ.Ext.MessageBox.confirm(field.sureTitleMsg || "",
                field.activeError + "<br>" + sureMsg,
                function(choice) {
                    if (choice == "yes")
                        this.postField(field);
                }, this
            );
        }
    }

});
CQ.analytics.ConflictManager = CQ.Ext.extend(CQ.Ext.util.Observable, {

    variables: null,

    provider: null,

    constructor: function(config) {
        config = config || { };

        CQ.Util.applyDefaults(config, {
            variables: { }
        });

        CQ.Ext.apply(this, config);
        CQ.analytics.ConflictManager.superclass.constructor.call(this, config);
    },

    addNewVariable: function(scVar, data) {
        if (!this.variables[scVar]) {
            this.variables[scVar] = {
                data: data,
                cqVars: new CQ.Ext.util.MixedCollection()
            };
        }
    },

    addVariable: function(scVar, cqVar, component, data) {
        this.addNewVariable(scVar, data);
        var scVarRef = this.variables[scVar].cqVars;
        if (!scVarRef.containsKey(cqVar)) {
            scVarRef.add(cqVar, new CQ.Ext.util.MixedCollection());
        }
        var cqVarRef = scVarRef.item(cqVar);
        cqVarRef.add(component);
    },

    removeVariable: function(scVar, cqVar, component) {
        var entry = this.variables[scVar];
        if (entry) {
            var scVarRef = entry.cqVars;
            var cqVarRef = scVarRef.item(cqVar);
            if (cqVarRef) {
                if (cqVarRef.remove(component)) {
                    if (cqVarRef.getCount() == 0)
                        scVarRef.removeKey(cqVar);
                }
            }
        }
    },

    isVariableMapped: function(scVar) {
        var entry = this.variables[scVar];
        if (entry) {
            var scVarRef = entry.cqVars;
            return scVarRef.getCount() > 0;
        }
        return false;
    },

    loadAllConflicts: function() {
        var provider = this.provider;
        if (provider) {
            provider.onAvailable("suites", function(suites) {
                var values = suites.getValues();
                this.getAllConflicts(values, {
                    callback: function(conflicts) {
                        for (var scVar in conflicts)
                            provider.setValue("mappingConflict." + scVar, conflicts[scVar]);
                    }
                });
            }, this, { single: true });
            return true;
        } else {
            return false;
        }
    },

    loadConflicts: function(scVarArray) {
        var provider = this.provider;
        if (provider) {
            provider.onAvailable("suites", function(suites) {
                var values = suites.getValues();
                this.getConflicts(scVarArray, values, {
                    callback: function(conflicts) {
                        CQ.Ext.each(scVarArray, function(scVar) {
                            provider.setValue("mappingConflict." + scVar, conflicts[scVar]);
                        });
                    }
                });
            }, this, { single: true });
            return true;
        } else {
            return false;
        }
    },

    getAllConflicts: function(suiteValues, options) {
        options = options || { };
        var scVarArray = [], newScVarArray = [];
        for (var scVar in this.variables) {
            var varValue = this.variables[scVar];
            if (varValue.cqVars.getCount() > 0)
                scVarArray.push(scVar);
            else
                newScVarArray.push(scVar);
        }
        var conflictMap = { };
        var superOptions = { };
        if (scVarArray.length > 0) {
            if (options.callback) {
                superOptions.callback = function(conflictMap) {
                    this.augmentConflictMap(conflictMap, newScVarArray);
                    options.callback.call(this, conflictMap);
                };
            }
            conflictMap = this.getConflicts(scVarArray, suiteValues, superOptions);
        }
        if (superOptions.callback)
            return true;
        else
            return this.augmentConflictMap(conflictMap, newScVarArray);
    },

    getConflicts: function(scVarArray, suiteValues, options) {
        if (!CQ.Ext.isArray(scVarArray))
            scVarArray = [ scVarArray ];
        options = options || { };
        var conflictsUrl = '/libs/cq/analytics/sitecatalyst/mappingconflicts.json';
        conflictsUrl = CQ.HTTP.addParameter(conflictsUrl, "scVar", scVarArray);
        if (suiteValues) {
            suiteValues = suiteValues.split(',');
        } else {
            suiteValues = [];
        }
        conflictsUrl = CQ.HTTP.addParameter(conflictsUrl, "rsid", suiteValues);
        conflictsUrl = CQ.HTTP.externalize(conflictsUrl);
        if (options.callback) {
            CQ.HTTP.get(conflictsUrl,
                function(requestOptions, success, response) {
                    if (success) {
                        var conflictMap = this.buildConflictMap(response, scVarArray);
                        options.callback.call(this, conflictMap);
                    } else {
                        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Unable to load conflicts"));
                    }
                }, this);
            return true;
        } else {
            return this.buildConflictMap(conflictsUrl, scVarArray);
        }
    },

    buildConflictMap: function(conflictsSource, scVarArray) {
        var conflicts;
        try {
            conflicts = CQ.HTTP.eval(conflictsSource);
        } catch (e) {
            CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                CQ.I18n.getMessage("Unable to load conflicts"));
        }
        conflicts = conflicts || { };
        var conflictMap = { };
        CQ.Ext.each(scVarArray, function(scVar) {
            var varValue = this.variables[scVar];
            var scConflicts = conflicts[scVar];
            var conflictMessages = this.getEveryConflict(varValue, scConflicts);
            if (conflictMessages)
                conflictMap[scVar] = conflictMessages;
        }, this);
        return conflictMap;
    },

    augmentConflictMap: function(conflictMap, scVarArray) {
        CQ.Ext.each(scVarArray, function(scVar) {
            var varValue = this.variables[scVar];
            var conflictMessages = this.getEveryConflict(varValue);
            if (conflictMessages)
                conflictMap[scVar] = conflictMessages;
        }, this);
        return conflictMap;
    },

    getEveryConflict: function(varValue, scConflicts) {
        var addIfTrue = function(arr, elem) {
            if (elem)
                arr.push(elem);
        };
        var arr = [];
        addIfTrue(arr, this.getNameConflict(varValue));
        addIfTrue(arr, this.getSeriousConflict(scConflicts));
        var conflictMessages = [];
        CQ.Ext.each(arr, function(item) {
            conflictMessages = conflictMessages.concat(item);
        });
        if (conflictMessages.length > 0)
            return conflictMessages;
        else
            return null;
    },

    getNameConflict: function(varValue) {
        if (varValue) {
            var names = varValue.data.names;
            if (names && names.length > 1) {
                var conflictMsg = ["<b>The selected report suites define different names for this variable:</b>"];
                CQ.Ext.each(names, function(item) {
                    conflictMsg.push(item.name + " (" + item.rsid + ")");
                });
                return conflictMsg;
            }
        }
        return null;
    },

    getSeriousConflict: function(scConflicts) {
        if (scConflicts) {
            var conflictMsg = ["<b>Mapped to different CQ values:</b>"];
            for (var cqVar in scConflicts) {
                var fwConflicts = scConflicts[cqVar];
                for (var i = 0; i < fwConflicts.length; i++) {
                    try {
                        var item = CQ.Ext.util.JSON.decode(fwConflicts[i]);
                        var frameworkUrl = item.frameworkPath + ".html";
                        frameworkUrl = CQ.HTTP.externalize(frameworkUrl);
                        item = "<a href='" + frameworkUrl + "' style='color: blue;'>" +
                            item.frameworkName + "</a>/" + item.componentName;
                        fwConflicts[i] = item;
                    } catch (e) {
                        console.log(e);
                    }
                }
                conflictMsg.push(cqVar + ": " + fwConflicts.join(', '));
            }
            return conflictMsg;
        }
        return null;
    }

});
// Revision 90901 escapes cell content to guard against XSS; reverting to original tpl to render tags
CQ.Ext.override(CQ.Ext.grid.GridView, {
    cellTpl: new CQ.Ext.XTemplate(
           '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
           '<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
           '</td>'
        )
    }
);
CQ.analytics.SiteCatalystPanel = CQ.Ext.extend(CQ.Ext.grid.EditorGridPanel, {

    viewConfig: null,

    cls: 'variablegrid',

    height: 170,

    autoscroll: true,

    store: null,

    loadMask: null,

    cm: null,

    constructor: function(config) {
        config = config || { };

        var grid = this;
        CQ.Util.applyDefaults(config, {
            collapsible: true,

            viewConfig: {
                forceFit: true
            },

            loadMask: {
                msg: CQ.I18n.getMessage("Loading configuration...")
            },

            store: new CQ.Ext.data.JsonStore({
                "fields": [{
                    name: "scVar",
                    type: "string"
                }, {
                    name: "componentName",
                    type: "string"
                }, {
                    name: "componentIcon",
                    type: "string"
                }, {
                    name: "componentFrameworkPath",
                    type: "string"
                }, {
                    name: "conflict",
                    type: "string"
                }, {
                    name: "cqVar",
                    type: "string"
                }, {
                    name: "title",
                    type: "string"
                }],
                mode: "local"
            }),

            cm: new CQ.Ext.grid.ColumnModel([
                {
                    dataIndex: 'title',
                    header: CQ.I18n.getMessage('SiteCatalyst variable'),
                    sortable: true,
                    resizeable: true,
                    width: '260',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var conflict = record.get('conflict');
                        var title = value;
                        var id = CQ.Ext.id();
                        var iconPath = CQ.HTTP.externalize('/libs/cq/ui/widgets/themes/default/icons/16x16/warning.png');
                        var imgStyle = "visibility: hidden;";
                        var imgTag = "<img src='" + iconPath + "' align='right' style='" + imgStyle + "'/>";
                        var title = "<div style='float: left; padding-right: 5px;'>" + title + imgTag + "</div>";
                        (function() {
                            if (CQ.Ext.get(id) == null)
                              return;
                            var tagLabel = new CQ.tagging.TagLabel({
                                renderTo: id,
                                text: title,
                                cls: '',
                                readOnly: true,
                                embedTextAsHTML: true,
                                recordRef: record,
                                highlight: function() { }
                            });
                            tagLabel.conflictIcon = tagLabel.getEl().child(".taglabel-mc").child("img");
                            if (tagLabel.tip)
                                tagLabel.tip.destroy();
                            if (conflict) {
                                tagLabel.tip = new CQ.Ext.ToolTip({
                                    target: tagLabel.getEl().child(".taglabel-body"),
                                    dismissDelay: 0,
                                    width: 410,
                                    closable: true,
                                    listeners: {
                                        show: function() {
                                            this.autoHide = true;
                                            var close = this.tools.close;
                                            if (close) {
                                                close.hide();
                                            }
                                        }
                                    },
                                    title: conflict[0],
                                    html: conflict.slice(1).join("<br>")
                                });
                                tagLabel.conflictIcon.on('click', function() {
                                    var tip = tagLabel.tip;
                                    if (tip) {
                                        tip.show();
                                        tip.autoHide = false;
                                        var close = tip.tools.close;
                                        if (close) {
                                            close.show();
                                        }
                                    }
                                });
                                tagLabel.conflictIcon.show();
                            }
                        }).defer(25);
                        return String.format('<div id="{0}"></div>', id);
                    }
                }, {
                    dataIndex: 'componentName',
                    header: CQ.I18n.getMessage('Component'),
                    sortable: true,
                    resizeable: true,
                    width: '190',
                    lockIconPath: CQ.HTTP.externalize('/libs/cq/ui/widgets/themes/default/icons/16x16/lock.png'),
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var title = value;
                        var componentIcon = record.get('componentIcon');
                        if (componentIcon) {
                            var imgStyle = "margin: 0px 5px; float: left;";
                            imgStyle = "style='" + imgStyle + "'";
                            var imgTag = "<img src='" + componentIcon + "' " + imgStyle + "/>";
                            title = imgTag + title;
                        }
                        var compFwPath = record.get('componentFrameworkPath');
                        if (grid.isInherited(compFwPath)) {
                            var contentPath = grid.contentPath;
                            var attr = [];
                            attr.push(String.format("src='{0}'", this.lockIconPath));
                            var imgStyle = "margin: 0px 5px 0px 0px; float: right;";
                            attr.push(String.format("style='{0}'", imgStyle));
                            var imgDblClick = "CQ.analytics.SiteCatalystPanel.statics.unlockComponent";
                            imgDblClick += String.format('("{0}", "{1}", true)', contentPath, compFwPath);
                            attr.push(String.format("ondblclick='{0}'", imgDblClick));
                            var imgTag = "<img " + attr.join(' ') + "/>";
                            title = imgTag + title;
                        }
                        return title;
                    }
                }, {
                    dataIndex: 'cqVar',
                    header: CQ.I18n.getMessage('CQ variable'),
                    sortable: true,
                    resizeable: true,
                    width: '460',
                    editor: new CQ.Ext.form.TextField(),
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        if (value) {
                            var styles = [];
                            var handlers = [];
                            styles.push("margin: 0px 10px; float: right;");
                            styles.push("position: absolute; clip: rect(0 15px 15px 0);");
                            styles.push("visibility: hidden;");
                            handlers.push(String.format("onclick='{0}'",
                                'CQ.analytics.SiteCatalystPanel.statics.removeScRecord(this)'));
                            handlers = handlers.join(' ');
                            var imgStyle = "style='" + styles.join(' ') + "'";
                            var imgPath = CQ.HTTP.externalize('/libs/cq/tagging/widgets/themes/default/images/label/tool-sprites.gif');
                            var imgTag = "<img src='" + imgPath + "' " + imgStyle + " " + handlers + "/>";
                            if (!grid.isInherited(record)) {
                                handlers = [];
                                handlers.push(String.format("onmouseover='{0}'",
                                    'CQ.analytics.SiteCatalystPanel.statics.actOnImg(this, "show")'));
                                handlers.push(String.format("onmouseout='{0}'",
                                    'CQ.analytics.SiteCatalystPanel.statics.actOnImg(this, "hide")'));
                                metaData.attr = handlers.join(' ' );
                            }
                            return "<div>" + CQ.shared.XSS.getXSSValue(value) + imgTag + "</div>";
                        } else {
                            return value;
                        }
                    }
                }
            ])
        });

        CQ.analytics.SiteCatalystPanel.superclass.constructor.call(this, config);

        this.on('beforeedit', function(e) {
            var record = this.getStore().getAt(e.row);
            if (this.isInherited(record))
                e.cancel = true;
        }, this);
        this.on('afteredit', function(e) {
            var record = e.record;
            var delta = { };
            // by popular demand, we hardcode the Page component as mother of all orphan mappings
            var compPath = record.get('componentFrameworkPath');
            if (compPath == undefined || compPath == '') {
                compPath =  e.grid.contentPath + '/mappings/foundation_components_page';

                record.data.componentFrameworkPath = compPath;
                record.data.componentIcon = '/libs/foundation/components/page/icon.png';
                record.data.componentName = 'Page';

                delta['jcr:primaryType'] = 'cq:Component';
                delta['sling:resourceType'] = 'cq/analytics/components/mappings/cqmappings';
                delta['cq:componentPath'] = 'foundation/components/page';
                delta['cq:componentName'] = 'Page';
                delta['cq:componentIcon'] = '/libs/foundation/components/page/icon.png';
            }
            delta[record.get('scVar')] = record.get('cqVar');
            CQ.HTTP.post(compPath,
                function(options, success, response) {
                    if (success) {
                        this.commitRecord(record);
                        conflictManager.loadConflicts(record.get('scVar'));
                    } else {
                        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not save CQ variable"));
                    }
                }, delta, this);
        });
        if (this.provider) {
            this.store.on('load', function(store, records, options) {
                CQ.Ext.each(records, function(item) {
                    var scVar = item.get('scVar');
                    if (scVar) {
                        item.conflictHandler = function(conflict) {
                            item.set('conflict', conflict);
                            item.commit();
                        };
                        this.provider.onAvailable("mappingConflict." + scVar,
                            item.conflictHandler, item);
                    }
                }, this);
            }, this, { single: true });
        } else {
            console.log(CQ.I18n.getMessage("Provider not loaded"));
        }
        CQ.WCM.registerDropTargetComponent(this);
    },

    getDropTargets: function() {
        var col = this.getColumnModel().findColumnIndex("cqVar");
        var dt = [];
        var grid = this;
        var gridStore = this.getStore();
        var gridView = this.getView();

        for (var row = 0; row < gridStore.getTotalCount(); row++) {
            if (this.isInherited(gridStore.getAt(row)))
                continue;
            var dd = new CQ.Ext.dd.DropTarget(gridView.getCell(row, col), {
                ddGroup: "clientcontextvars",
                store: gridStore,
                view: gridView,
                normalize: function() { },
                flash: function() { },
                notifyDrop: function(dd, e, data) {
                    var rowIndex = this.view.findRowIndex(this.el.dom);
                    var columnIndex = this.view.findCellIndex(this.el.dom);
                    if (rowIndex !== false && columnIndex !== false) {
                        var rec = this.store.getAt(rowIndex);
                        if (rec) {
                            var scVar = rec.get('scVar');
                            var dropData = data.records[0];
                            var values = {
                                cqVar: dropData.get('name'),
                                componentFrameworkPath: dropData.get('componentFrameworkPath')[0],
                                componentIcon: dropData.get('componentIcon'),
                                componentName: dropData.get('componentName')
                            };
                            var compFwPath = values.componentFrameworkPath;
                            if (scVar && values.cqVar && compFwPath) {
                                var oldCompFwPath = rec.get('componentFrameworkPath');
                                var saveOptions = {
                                    success: function() {
                                        conflictManager.loadConflicts(scVar);
                                    }
                                };
                                if (oldCompFwPath && oldCompFwPath != compFwPath) {
                                    var delta = { };
                                    delta[scVar] = ' ';
                                    CQ.HTTP.post(oldCompFwPath,
                                        function(options, success, response) {
                                            if (success) {
                                                grid.saveMapping(scVar, rec, values, saveOptions);
                                            } else {
                                                CQ.Notification.notify(null,
                                                    CQ.I18n.getMessage("Could not save mapping"));
                                            }
                                        }, delta);
                                } else {
                                    grid.saveMapping(scVar, rec, values, saveOptions);
                                }
                            }
                        }
                    }
                }
            });
            dt.push(dd);
        }
        return dt;
    },

    isInherited: function(compFwPath) {
        if (compFwPath) {
            if (!CQ.Ext.isString(compFwPath))
                compFwPath = compFwPath.get('componentFrameworkPath');
        }
        if (compFwPath) {
            var contentPath = this.contentPath;
            if (contentPath && compFwPath.indexOf(contentPath) != 0)
                return true;
        }
        return false;
    },

    saveMapping: function(scVar, record, values, mappingOptions) {
        mappingOptions = mappingOptions || { };
        var delta = { };
        delta[scVar] = values.cqVar;
        CQ.HTTP.post(values.componentFrameworkPath,
            function(options, success, response) {
                if (success) {
                    if (mappingOptions.commit !== false)
                        this.commitRecord(record, values);
                    if (mappingOptions.success)
                        mappingOptions.success.call(this);
                } else {
                    CQ.Notification.notify(null,
                        CQ.I18n.getMessage("Could not save mapping"));
                }
            }, delta, this);
    },

    removeMapping: function(record) {
        var scVar = record.get("scVar");
        var cqVar = record.get("cqVar");
        var compName = record.get("componentName");
        var compFwPath = record.get("componentFrameworkPath");
        if (scVar) {
            this.saveMapping(scVar, record, {
                cqVar: " ",
                componentFrameworkPath: compFwPath
            }, {
                commit: false,
                success: function() {
                    var conflictManager = this.conflictManager;
                    if (conflictManager) {
                        if (record.conflictHandler) {
                            this.provider.unAvailable("mappingConflict." + scVar,
                                record.conflictHandler, record);
                        }
                        conflictManager.removeVariable(scVar, cqVar, compName);
                        if (conflictManager.isVariableMapped(scVar)) {
                            this.getStore().remove(record);
                        } else {
                            this.commitRecord(record, {
                                componentFrameworkPath: null,
                                componentName: null,
                                componentIcon: null,
                                cqVar: null
                            });
                        }
                        conflictManager.loadConflicts(scVar);
                    }
                }
            });
        }
    },

    commitRecord: function(record, values) {
        values = values || { };
        for (var idx in values)
            record.set(idx, values[idx]);
        record.commit();
    }

});

CQ.analytics.SiteCatalystPanel.statics = {
    getVariableGrid: function(htmlElement) {
        var grid = null;
        var el = CQ.Ext.fly(htmlElement);
        if (el) {
            var gridEl = el.findParent(".variablegrid", null, true);
            if (gridEl)
                grid = CQ.Ext.getCmp(gridEl.id);
        }
        return grid;
    },

    actOnImg: function(htmlElement, action) {
        var el = CQ.Ext.fly(htmlElement);
        if (el) {
            var imgEl = el.child("img");
            if (imgEl)
                imgEl[action]();
        }
    },

    getRecordByElement: function(grid, htmlElement) {
        var store = grid.getStore();
        var view = grid.getView();
        if (store && view) {
            var row = view.findRowIndex(htmlElement);
            if (row !== false)
                return store.getAt(row);
        }
        return null;
    },

    removeScRecord: function(htmlElement) {
        var grid = this.getVariableGrid(htmlElement);
        if (grid) {
            var record = this.getRecordByElement(grid, htmlElement);
            if (record) {
                grid.removeMapping(record);
            }
        }
    },

    unlockComponent: function(pagePath, fwCompPath, isContentPath) {
        if (isContentPath) {
            var idx = pagePath.lastIndexOf('/');
            pagePath = pagePath.substr(0, idx);
        }
        var fwCompUrl = CQ.HTTP.externalize(fwCompPath);
        var pieces = fwCompPath.split('/');
        if (pieces.length >= 3) {
            pieces = pieces.slice(pieces.length - 3, pieces.length);
            pagePath += '/' + pieces.join('/');
            var pageUrl = CQ.HTTP.externalize(pagePath);
            CQ.HTTP.post(fwCompUrl, function(options, success, response) {
                if (success) {
                    window.location.reload();
                }
            }, {
                ":operation": "copy",
                ":dest": pageUrl,
                ":replace": "true"
            });
        }
    }
};
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
 * @class CQ.analytics.ExternalPathField
 * @extends CQ.Ext.form.ComboBox
 * <p>The PathField is an input field designed for paths and a button to open a 
 * {@link CQ.BrowseDialog} for browsing the Test&Target server.</p>
 *
 * @constructor
 * Creates a new PathField.
 * @param {Object} config The config object
 */
CQ.analytics.ExternalPathField = CQ.Ext.extend(CQ.Ext.form.ComboBox, {
    /**
     * @cfg {String} rootPath
     * The root path where completion and browsing starts. Use the empty string
     * for the repository root (defaults to '/content').
     */

    /**
     * @cfg {String} suffix
     * The suffix to append to the selected path, defaults to "".
     */

    /**
     * @cfg {String} rootTitle
     * Custom title for the root path.<br/><br/>
     *
     * <p>Defaults to the value of {@link #rootPath}; if that is not set, it will be
     * 'Websites' (localized), to match the default value of '/content' for the
     * {@link #rootPath}.</p>
     */

    /**
     * @cfg {Boolean} showTitlesInTree
     * Whether to show the (jcr:)titles as names of the tree nodes or the
     * plain jcr node name (defaults to true).
     */

    /**
     * @cfg {Boolean} hideTrigger
     * True to disable the option to open the browse dialog (this config is
     * inherited from {@link CQ.Ext.form.TriggerField}). Defaults to false.
     */

   /**
     * @cfg {Object} treeLoader
     * The config options for the tree loader in the browse dialog.
     * See {@link CQ.Ext.tree.TreeLoader} for possible options.<br/><br/>
     *
     * <p>Defaults to '/bin/tree/ext.json' for the dataUrl.</p>
     */

    /**
     * @cfg {Object} browseDialogCfg
     * The config for the {@link CQ.BrowseDialog}.
     * @since 5.4
     */

    /**
     * @cfg {Object} treeRoot
     * The config options for the tree root node in the browse dialog.
     * See {@link CQ.Ext.tree.TreeNode} for possible options.<br/><br/>
     *
     * <p>Defaults to {@link #rootPath} for the name and {@link #rootTitle} for the text of the root.</p>
     */

    /**
     * @cfg {Boolean} escapeAmp
     * True to url-encode the ampersand character (&amp;amp;) to %26. Defaults to false
     * @since 5.5
     */

    /**
     * The panel holding the link-browser.
     * @type CQ.BrowseDialog
     * @private
     */
    browseDialog: null,

    /**
     * The trigger action of the TriggerField, creates a new BrowseDialog
     * if it has not been created before, and shows it.
     * @private
     */
    onTriggerClick : function() {
        if (this.disabled) {
            return;
        }
        // lazy creation of browse dialog
        if (this.browseDialog == null) {
            function okHandler() {
            	var path = this.getSelectedPath();
                var value = path.substring(path.lastIndexOf("/")+1);
                
                if (this.pathField.suffix) {
                    value += this.pathField.suffix;
                }

                this.pathField.setValue(value);

                this.pathField.fireEvent("dialogselect", this.pathField, path);
                this.hide();
            }

            var browseDialogConfig = CQ.Util.applyDefaults(this.browseDialogCfg, {
                ok: okHandler,
                treeRoot: this.treeRoot,
                treeLoader: this.treeLoader,
                listeners: {
                    hide: function() {
                        if (this.pathField) {
                            this.pathField.fireEvent("dialogclose");
                        }
                    }
                },
                pathField: this
            });

            // build the dialog and load its contents
            this.browseDialog = new CQ.analytics.ExternalBrowseDialog(browseDialogConfig);
        }

        this.browseDialog.show();
        this.fireEvent("dialogopen");
    },

    constructor : function(config){
        // set default values
        // done here, because it is already used in below applyDefaults
        if (typeof config.rootTitle === "undefined") {
            config.rootTitle = config.rootPath || CQ.I18n.getMessage("Files");
        }
        if (typeof config.rootPath === "undefined") {
            config.rootPath = "/";
        }
        var rootName = config.rootPath;
        // the root path must not include a leading slash for the root tree node
        // (it's added automatically in CQ.Ext.data.Node.getPath())
        if (rootName.charAt(0) === "/") {
            rootName = rootName.substring(1);
        }

        if (typeof config.showTitlesInTree === "undefined") {
            config.showTitlesInTree = true;
        }

        var pathField = "path";
        if (config.escapeAmp) {
            pathField = "escapedPath";
            delete config.escapeAmp;
        }

        CQ.Util.applyDefaults(config, {
            suffix:"",
            mode: 'local',
            selectOnFocus:true,
            validationEvent: false,
            validateOnBlur: false,
            // show a search icon
            triggerClass: "x-form-search-trigger",
            treeRoot: {
                name: rootName,
                text: config.rootTitle
            },
            treeLoader: {
                dataUrl: CQ.shared.HTTP.getXhrHookedURL(CQ.Util.externalize("/bin/tree/ext.json")),
                baseParams: {
                    "_charset_": "utf-8"
                }
            }
        });

        CQ.analytics.ExternalPathField.superclass.constructor.call(this, config);
    },

    initComponent : function(){
    	CQ.analytics.ExternalPathField.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event dialogopen
             * Fires when the browse dialog is opened.
             * @param {CQ.form.PathField} this
             */
            "dialogopen",
            /**
             * @event dialogselect
             * Fires when a new value is selected in the browse dialog.
             * @param {CQ.form.PathField} this
             * @param {String} path The path selected in the tree of the browse dialog
             */
            "dialogselect",
            /**
             * @event dialogclose
             * Fires when the browse dialog is closed.
             * @param {CQ.form.PathField} this
             */
            "dialogclose"
        );
    }
});

CQ.Ext.reg("externalpathfield", CQ.analytics.ExternalPathField);
/*
 * Copyright 1997-2008 Day Management AG
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
 * @class CQ.BrowseDialog
 * @extends CQ.Dialog
 * The BrowseDialog lets the user browse the repository in order to
 * select a path. It is typically used through a {@link CQ.form.BrowseField BrowseField}.
 * @constructor
 * Creates a new BrowseDialog.
 * @param {Object} config The config object
 */
CQ.analytics.ExternalBrowseDialog = CQ.Ext.extend(CQ.Dialog, {

    /**
     * @cfg {CQ.Ext.tree.TreeNode} treeLoader
     * The config options for the tree loader in the browse dialog.
     * See {@link CQ.Ext.tree.TreeLoader} for possible options.
     */

    /**
     * @cfg {CQ.Ext.tree.TreeNode} treeRoot
     * The config options for the tree root node in the browse dialog.
     * See {@link CQ.Ext.tree.TreeNode} for possible options.
     */

    /**
     * The browse dialog's tree panel.
     * @private
     * @type CQ.Ext.tree.TreePanel
     */
    treePanel: null,

    /**
     * The browse dialog's browse field.
     * @private
     * @type CQ.form.BrowseField
     */
    browseField: null,

    initComponent: function(){
        CQ.analytics.ExternalBrowseDialog.superclass.initComponent.call(this);
    },

    /**
     * Selects the specified path in the tree.
     * @param {String} path The path to select
     */
    loadContent: function(path) {
        if (typeof path == "string") {
            this.path = path;
            this.treePanel.selectPath(path, "id");
        }
    },

    /**
     * Returns the path of the selected tree node (or an empty string if no
     * tree node has been selected yet).
     * @return {String} The path
     */
    getSelectedPath: function() {
        try {
            return this.treePanel.getSelectionModel().getSelectedNode().getPath("id");
        } catch (e) {
            return "";
        }
    },

    constructor: function(config){

        var treeRootConfig = CQ.Util.applyDefaults(config.treeRoot, {
            "name": "content",
            "text": CQ.I18n.getMessage("Site"),
            "draggable": false,
            "singleClickExpand": true,
            "expanded":true
        });

        var treeLoaderConfig = CQ.Util.applyDefaults(config.treeLoader, {
            "dataUrl": CQ.HTTP.externalize("/bin/tree/ext.json"),
            "requestMethod":"GET",
            "baseParams": {
                "_charset_": "utf-8"
            },
            "baseAttrs": {
                "singleClickExpand":true
            },
            "listeners": {
                "beforeload": function(loader, node){
                    this.baseParams.path = node.getPath();
                }
            }
        });

        this.treePanel = new CQ.Ext.tree.TreePanel({
            "region":"west",
            "lines": CQ.themes.BrowseDialog.TREE_LINES,
            "bodyBorder": CQ.themes.BrowseDialog.TREE_BORDER,
            "bodyStyle": CQ.themes.BrowseDialog.TREE_STYLE,
            "height": "100%",
            "width": 200,
            "autoScroll": true,
            "containerScroll": true,
            "root": new CQ.Ext.tree.AsyncTreeNode(treeRootConfig),
            "loader": new CQ.Ext.tree.TreeLoader(treeLoaderConfig),
            "defaults": {
                "draggable": false
            }
        });

        var width = CQ.themes.BrowseDialog.WIDTH;
        var items = this.treePanel;

        CQ.Util.applyDefaults(config, {
            "title": CQ.I18n.getMessage("Select Path"),
            "closable": true,
            "width": width,
            "height": CQ.themes.BrowseDialog.HEIGHT,
            "minWidth": CQ.themes.BrowseDialog.MIN_WIDTH,
            "minHeight": CQ.themes.BrowseDialog.MIN_HEIGHT,
            "resizable": CQ.themes.BrowseDialog.RESIZABLE,
            "resizeHandles": CQ.themes.BrowseDialog.RESIZE_HANDLES,
            "autoHeight": false,
            "autoWidth": false,
            "cls":"cq-browsedialog",
            "ok": function() { this.hide(); },
            "buttons": CQ.Dialog.OKCANCEL,
            "items": items
        });
        CQ.analytics.ExternalBrowseDialog.superclass.constructor.call(this, config);
    }
});

CQ.Ext.reg('externalbrowsedialog', CQ.analytics.ExternalBrowseDialog);
CQ.Ext.namespace("CQ_Analytics.TestTarget");
CQ_Analytics.TestTarget.publishTestTarget = function(operation, configpath, folderid, lastpublished) {
	if (!CQ.Ext.getCmp(window.CQ_OfferPublishDialog_id)) {
		var dialog = new CQ_Analytics.TestTarget.PublishDialog({
			"operation": operation,
			"configpath": configpath,
			"folderid": folderid,
			"lastpublished": lastpublished
		});
		dialog.show();
		dialog.alignToViewport("c");
	}
}

CQ_Analytics.TestTarget.showButtonIndicator = function(dialog, isShown) {
    if (!isShown) {
        CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connection successful")).hide();
    } else {
        CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connecting to Test&Target..."));
    }
}

CQ_Analytics.TestTarget.doConnect = function(dialog) {
    var clientcode = dialog.find("name","./clientcode")[0];
    var email = dialog.find("name","./email")[0];
    var password = dialog.find("name","./password")[0];

    var data = {
            clientcode: clientcode.getValue(),
            email: email.getValue(),
            password: password.getValue(),
            cmd: "connect"
    };
    
    this.showButtonIndicator(dialog, true);
    
    function fieldEmpty(field, msg) {
        if (!field || field.getValue() == "") {
            that.showButtonIndicator(dialog, false);
            CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), msg);
            return true;
        }
        return false;
    }
    
    if (fieldEmpty(clientcode, CQ.I18n.getMessage("Please enter the client code.")) ||
        fieldEmpty(email, CQ.I18n.getMessage("Please enter the email.")) ||
        fieldEmpty(password, CQ.I18n.getMessage("Please enter the password."))) {
        return;
    }

    CQ.HTTP.post("/libs/cq/analytics/testandtarget/command",
        function(options, success, response) {
            this.showButtonIndicator(dialog, false);
            if(success) {
                var answer = CQ.HTTP.eval(response);
                if(answer.error != undefined) {
                    CQ.Ext.Msg.show({
                        "title": CQ.I18n.getMessage("Error"),
                        "msg": answer.error,
                        "buttons": CQ.Ext.Msg.OK,
                        "icon": CQ.Ext.Msg.ERROR
                    }); 
                } else if (answer.success) {
                    CQ.Ext.Msg.show({
                        "title": CQ.I18n.getMessage("Success"),
                        "msg": CQ.I18n.getMessage("Connection successful"),
                        "buttons": CQ.Ext.Msg.OK,
                        "icon": CQ.Ext.Msg.INFO
                    }); 
                    CQ.cloudservices.getEditOk().enable();
                }
            }else {
                CQ.Ext.Msg.show({
                        "title": CQ.I18n.getMessage("Error"),
                        "msg": CQ.I18n.getMessage("Connection failed for unknown reason."),
                        "buttons": CQ.Ext.Msg.OK,
                        "icon": CQ.Ext.Msg.ERROR
            }); 
        }
    }, data, this, true); // suppress error messages
}

CQ_Analytics.TestTarget.PublishDialog = CQ.Ext.extend(CQ.Dialog, {

	config: null,
	
    constructor: function(config) {
        var dialog = this;
        this.config = config;
        var defaults = {
                "title": CQ.I18n.getMessage("Create offer"),
                "width": 450,
                "height": 200,
                "closeAction": "destroy",
                "items": [{
                    "xtype": "panel",
                    "header": false,
                    "layout": "form",
                    "items": [{
                        "xtype": "dialogfieldset",
                        "border": false,
                        "labelWidth": 150,
                        "items": [{                           
                            "fieldLabel": CQ.I18n.getMessage("Test&amp;Target configuration"),
                            "id": "cq:cloudserviceconfig",
                            "name": "cq:cloudserviceconfig",
                            "rootPath": "/etc/cloudservices/testandtarget",
                            "xtype": "cloudservicescombo",
                            "value": config.configpath,
                            "selectFirst": true,
                            "flex": "{Long}1"
                        },{
                            "xtype": "static",
                            "style": "text-align:right;margin:3px 0px 5px 0px; text-decoration:underline;",
                            "html": '<a href="' + CQ.HTTP.externalize('/miscadmin#/etc/cloudservices') + '" target="_blank">' + CQ.I18n.getMessage("Manage configurations") + '</a>'
                        },{
                            "xtype":"externalpathfield",
                            "name":"folderid",
                            "editable": false,
                            "disabled": (config.lastpublished && config.lastpublished.length > 0),
                            "hidden": (config.operation != 'saveHTMLOfferContent'),
                            "fieldLabel": CQ.I18n.getMessage("Folder"),
                            "rootTitle": CQ.I18n.getMessage("Folders"),
                            "rootPath": "/",
                            "value": config.folderid,
                            "treeLoader": {
                                "dataUrl": CQ.shared.HTTP.getXhrHookedURL(CQ.Util.externalize("/libs/cq/analytics/testandtarget/folderlist.json")),
                                "listeners": {
                                    "beforeload":function(loader,node) {
                                        var path = dialog.form.findField("cq:cloudserviceconfig");
                                        this.baseParams.cfgpath = path.getValue();
                                    }
                                }
                            }
                        }]
                    }]
                }],
                "listeners": {
                	"render": function() {
                		window.CQ_OfferPublishDialog_id = dialog.id;
                	}
                },
                "buttons": [
                    {
                        "text": CQ.I18n.getMessage("OK"),
                        "tooltip": CQ.I18n.getMessage("Create this offer in Test&amp;Target"),
                        "handler": function() {
	                    	var title = CQ.I18n.getMessage("Overwrite offer");
	                    	var message = CQ.I18n.getMessage("Existing offer with name [{0}] may be overwritten. Do you want to continue?", [CQ.WCM.getPagePath().replace(/^\//,'').replace(/\//g,'-')]);
                        	if (config.operation === "deleteWidgetOffer") {
	                    		title = CQ.I18n.getMessage("Delete offer");
	                    		message = CQ.I18n.getMessage("Do you really want to delete this offer in Test&Target?");
	                    	}
                        	
                        	CQ.Ext.Msg.show({
	                            "title":title,
	                            "msg":message,
	                            "buttons":CQ.Ext.Msg.YESNO,
	                            "icon":CQ.Ext.MessageBox.QUESTION,
	                            "fn":function(btnId) {
	                                if (btnId == "yes") {
	                                	dialog.submitCommand(config.operation);
	                                }
	                            },
	                            "scope":this
	                        });
                        }
                    },
                    CQ.Dialog.CANCEL
                ]
        };
        CQ.Util.applyDefaults(config, defaults);
        
        // init component by calling super constructor
        CQ_Analytics.TestTarget.PublishDialog.superclass.constructor.call(this, config);
    },
    
    submitCommand: function(command) {
        var data = {
            cfgpath: this.form.findField("cq:cloudserviceconfig").getValue(),
            path: CQ.WCM.getPagePath(),
            folderid: this.form.findField("folderid").getValue(),
            content: "<script type=\"text/javascript\">CQ_Analytics.TestTarget.pull('" + CQ.WCM.getPagePath() + "/_jcr_content/par.html');</script>",
            cmd: command
        };
        CQ.HTTP.post("/libs/cq/analytics/testandtarget/command",
            function(options, success, response) {
                if(success) {
                    var answer = CQ.HTTP.eval(response);
                    if (answer.error != undefined) {
                        CQ.Ext.Msg.show({
                            "title": CQ.I18n.getMessage("An error occured"),
                            "msg": answer.error,
                            "buttons": CQ.Ext.Msg.OK,
                            "icon": CQ.Ext.Msg.ERROR
                        }); 
                    } else {
                        var message = (command == 'saveHTMLOfferContent') ? CQ.I18n.getMessage("Offer published successfully") : CQ.I18n.getMessage("Offer unpublished successfully")
                    	CQ.Ext.Msg.show({
                            "title": CQ.I18n.getMessage("Success"),
                            "msg": message,
                            "buttons": CQ.Ext.Msg.OK,
                            "icon": CQ.Ext.Msg.INFO
                        }); 
                        var button = document.getElementById("testandtarget-publish");
                        button.setAttribute("value", CQ.I18n.getMessage("Re-Push to Test&Target"));
                        if (command == 'deleteWidgetOffer') {
	                        button.setAttribute("onclick", "CQ_Analytics.TestTarget.publishTestTarget('saveHTMLOfferContent','" 
	                        		+ this.config.configpath + "'," + answer.folderid + "," + answer.lastpublished + ")");
                        } else {
                        	button.setAttribute("onclick", "CQ_Analytics.TestTarget.publishTestTarget('saveHTMLOfferContent','" 
	                        		+ this.config.configpath + "','" + answer.folderid + "','" + answer.lastpublished + "')");
                        }
                        this.close();
                    }
                } else {
                    CQ.Ext.Msg.show({
                        "title": CQ.I18n.getMessage("An error occured"),
                        "msg": CQ.I18n.getMessage("Publishing failed. If this issue persists, please get in touch with an administrator."),
                        "buttons": CQ.Ext.Msg.OK,
                        "icon": CQ.Ext.Msg.ERROR
                    }); 
                }
            }, data, this, true); // suppress error messages    	
    }
});
CQ.analytics.SiteCatalyst = {
        
    mappingComponents: [],
    
    registerMapping: function(component) {
        this.mappingComponents.push(component);
    },

    getMappings: function() {
        return this.mappingComponents;
    },
    
    getField: function(panel, key) {
        var items = panel.find("name", key);
        if ( (CQ.Ext.isArray(items)) && (items.length > 0) ) {
            return items[0];
        }
    },
    
    showButtonIndicator: function(dialog, isShown) {
        if (!isShown) {
            CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connection successful")).hide();
        } else {
            CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connecting to SiteCatalyst..."));
        }
    },  

    connect: function(dialog) {
        var that = this;
        
        var company = this.getField(dialog, './company');
        var username = this.getField(dialog, './username');
        var password = this.getField(dialog, './password');

        this.showButtonIndicator(dialog, true);
        
        function fieldEmpty(field, msg) {
            if (!field || field.getValue() == "") {
                that.showButtonIndicator(dialog, false);
                CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), msg);
                return true;
            }
            return false;
        }
        
        if (fieldEmpty(company, CQ.I18n.getMessage("Please enter the company.")) ||
            fieldEmpty(username, CQ.I18n.getMessage("Please enter the username.")) ||
            fieldEmpty(password, CQ.I18n.getMessage("Please enter the password."))) {
            return;
        }
        
        var url = CQ.HTTP.externalize("/libs/cq/analytics/sitecatalyst/service.json");
        CQ.HTTP.post(url,
            function(options, success, response) {
        		this.showButtonIndicator(dialog, false); 
                if(success) {
                    var reportSuites = CQ.HTTP.eval(response);
                    if (reportSuites && reportSuites.secret) {  
                        var secret = this.getField(dialog, './secret');
                        secret.setValue(reportSuites.secret);
                        dialog.find("localName", "connectButton")[0].setText(CQ.I18n.getMessage('Re-Connect to SiteCatalyst'));

                        CQ.Ext.Msg.show({ 
                                title: CQ.I18n.getMessage("Success"), 
                                msg: CQ.I18n.getMessage("Connection successful"), 
                                buttons: CQ.Ext.Msg.OK, 
                                icon: CQ.Ext.Msg.INFO}); 
                        CQ.cloudservices.getEditOk().enable();
                    } else if (reportSuites && (reportSuites.error.indexOf("authenticat") > -1 || reportSuites.error.indexOf("wrong") > -1)) {
                        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), CQ.I18n.getMessage("We were not able to login to SiteCatalyst.<br /><br />Please check your credentials and try again."));
                    } else if (reportSuites && reportSuites.error == "not authorized"){
                        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),CQ.I18n.getMessage("Web Service access is not enabled.<br /><br />Please see a SiteCatalyst administrator to enable access."));
                    } else if (reportSuites && reportSuites.error == "not online"){
                        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),CQ.I18n.getMessage("Connection to SiteCatalyst could not be established.<br /><br />Please check your Internet connection."));
                    } else {
                        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),CQ.I18n.getMessage("Connection to SiteCatalyst could not be established.<br /><br />Please see a SiteCatalyst administrator for more details."));
                    }
                } else {
                    CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), CQ.I18n.getMessage("Error while connecting."));
                } 
            },
            {
                "method": "Connect",
                "company": company.getValue(),
                "username": username.getValue(),
                "password": password != "" ? password.getValue() : ""
            }, this, true
        );
        
    }
        
};        
/*!
 * Ext JS Library 3.0.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
CQ.Ext.ns('CQ.Ext.ux.grid');

CQ.Ext.ux.grid.CheckColumn = function(config){
    this.addEvents({
        click: true
    });
    CQ.Ext.ux.grid.CheckColumn.superclass.constructor.call(this);
    
    CQ.Ext.apply(this, config, {
        init : function(grid){
            this.grid = grid;
            this.grid.on('render', function(){
            var view = this.grid.getView();
            view.mainBody.on('mousedown', this.onMouseDown, this);
            }, this);
        },
    
        onMouseDown : function(e, t){
            if(t.className && t.className.indexOf('x-grid3-cc-'+this.id) != -1){
                e.stopEvent();
                var index = this.grid.getView().findRowIndex(t);
                var record = this.grid.store.getAt(index);
                record.set(this.dataIndex, !record.data[this.dataIndex]);
                this.fireEvent('click', this, e, record);
            }
        },
        
        renderer : function(v, p, record){
            p.css += ' x-grid3-check-col-td';
            return '<div class="x-grid3-check-col'+(v?'-on':'')+' x-grid3-cc-'+this.id+'"> </div>';
        }
    });
    
    if(!this.id){
        this.id = CQ.Ext.id();
    }
    this.renderer = this.renderer.createDelegate(this);
};

// register ptype
CQ.Ext.preg('checkcolumn', CQ.Ext.ux.grid.CheckColumn);

// backwards compat
CQ.Ext.grid.CheckColumn = CQ.Ext.ux.grid.CheckColumn;

CQ.Ext.extend(CQ.Ext.grid.CheckColumn, CQ.Ext.util.Observable);
CQ.analytics.SubnodeField = CQ.Ext.extend(CQ.form.MultiField, {

    record: null,
    
    constructor: function(config) {
        config = CQ.Util.applyDefaults(config, {
            "defaults":{
                "xtype":"subnodefielditem",
                "fieldConfig":config.fieldConfig
            }
        });    
    
        CQ.analytics.SubnodeField.superclass.constructor.call(this, config);
        var panel = this.findByType('panel');
        if (panel.length > 0) {
            panel[0].items.remove(this.hiddenDeleteField);
        }
    },
    
    initComponent: function() {
        CQ.analytics.SubnodeField.superclass.initComponent.call(this);
    },
    
    // overriding CQ.form.MultiField#addItem
    addItem: function(value) {
        this.show();
        
        var lastItemIdx=0;
        for (var i=0; i<this.items.getCount(); i++) {
            var comp = this.items.itemAt(i);
            if (comp instanceof CQ.form.MultiField.Item) {
                lastItemIdx = i + 1;
            }
        }
        
        var item = this.insert(lastItemIdx, {});
        //replace placeholder in name
        item.field.name = item.field.name.replace(/\{0\}/, lastItemIdx);    
        
        var form = this.findParentByType("form");
        if (form)
            form.getForm().add(item.field);
        this.doLayout();

        if (item.field.processPath) item.field.processPath(this.path);
        if (item.field.processRecord) item.field.processRecord(this.record, this.path);
        if (value) {
            var n = item.field.name;
            var prop = n.substring(n.lastIndexOf('/')+1);
            if (value[prop]) {
                item.setValue(value[prop]);
            }
        }

        if (this.fieldWidth < 0) {
            // fieldWidth is < 0 when e.g. the MultiField is on a hidden tab page;
            // do not set width but wait for resize event triggered when the tab page is shown
            return;
        }
        //if (!this.fieldWidth) {
            this.calculateFieldWidth(item);
        //}
        try {
            item.field.setWidth(this.fieldWidth);
        }
        catch (e) {
            CQ.Log.debug("CQ.form.MultiField#addItem: " + e.message);
        }
        
    },
    
    // overriding CQ.form.MultiField#processRecord
    processRecord: function(record, path) {
        if (this.fireEvent('beforeloadcontent', this, record, path) !== false) {
            this.record = record;
            
            var name = this.getName();
            var ph = name.indexOf('{0}');
            if (ph > -1) {
                name = name.substring(0,ph-1);
            }
            
            var n = record.get(name); 
            if (n instanceof Object) {
                v = [];
                for (i in n) {
                    if (i.indexOf(':') < 0) {
                       v[i] = n[i];
                    }
                }
            } else {
                v = n;
            } 
              
            if (v == undefined && this.defaultValue != null) {
                if (this.isApplyDefault(record, path)) {
                   this.setValue(this.defaultValue);
                }
            }
            else {
                this.setValue(v);
            }
            
            this.fireEvent('loadcontent', this, record, path);
        }
    }
    
});
CQ.Ext.reg('subnodefield', CQ.analytics.SubnodeField);


/**
 * @private
 * @class CQ.form.MultiField.Item
 * @extends CQ.Ext.Panel
 * The MultiField.Item is an item in the {@link CQ.form.MultiField}.
 * This class is not intended for direct use.
 * @constructor
 * Creates a new MultiField.Item.
 * @param {Object} config The config object
 */
CQ.analytics.SubnodeFieldItem = CQ.Ext.extend(CQ.form.MultiField.Item, {

    constructor: function(config) {
        CQ.analytics.SubnodeFieldItem.superclass.constructor.call(this, config);
    },

    constructButtonConfig: function(items, fieldConfig) {
        var item = this;
        this.field = CQ.Util.build(fieldConfig, true);
        items.push({
            "xtype":"panel",
            "border":false,
            "cellCls":"cq-multifield-itemct",
            "items":item.field
        });

        if (!fieldConfig.readOnly) {
            if (fieldConfig.orderable) {
                items.push({
                    "xtype": "panel",
                    "border": false,
                    "items": {
                        "xtype": "button",
                        "iconCls": "cq-multifield-up",
                        "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                        "handler": function(){
                            var parent = item.ownerCt;
                            var index = parent.items.indexOf(item);

                            if (index > 0) {
                                item.reorder(parent.items.itemAt(index - 1));
                            }
                        }
                    }
                });
                items.push({
                    "xtype": "panel",
                    "border": false,
                    "items": {
                        "xtype": "button",
                        "iconCls": "cq-multifield-down",
                        "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                        "handler": function(){
                            var parent = item.ownerCt;
                            var index = parent.items.indexOf(item);

                            if (index < parent.items.getCount() - 1) {
                                item.reorder(parent.items.itemAt(index + 1));
                            }
                        }
                    }
                });
            }

            items.push({
                "xtype":"panel",
                "border":false,
                "items":{
                    "xtype":"button",
                    "iconCls": "cq-multifield-remove",
                    "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                    "handler":function() {
                        var parent = item.ownerCt;
                        parent.fireEvent("removeditem", item.field);
                        item.remove(item.field);
                    }
                }
            });
        }
    },

    remove: function(item) {
        //TODO add deleteHint this.ownerCt.add();
        var parent = this.ownerCt;
        var node = item.name.substring(0,item.name.lastIndexOf('/'));
        parent.add({"xtype": "hidden", "name": node + CQ.Sling.DELETE_SUFFIX});
        parent.remove(this, true);
        parent.doLayout();
    }

});

CQ.Ext.reg("subnodefielditem", CQ.analytics.SubnodeFieldItem);
CQ.analytics.FrameworkSelection = CQ.Ext.extend(CQ.form.DialogFieldSet, {

    collapsed: false,

    autoHeight: true,

    autoScroll: true,
    
    inheritField: null,
    
    data: null,
    
    servicename: null,
    
    constructor: function(config) {
        var dlg = this;
        
        this.inheritField = new CQ.Static({
            "fieldLabel": CQ.I18n.getMessage("Inherited from"),
            "html": ""
        });
                        
        this.servicename = "testandtarget";
        
        CQ.Util.applyDefaults(config, {
            "items": [
                {
                    xtype: "hidden",
                    name: "./cq:cloudserviceconfigs" + CQ.Sling.DELETE_SUFFIX,
                    value: true
                },
                this.inheritField
            ],
            "listeners": {
                "beforeshow": function(comp) {
                    comp.doLayout();
                }
            }
        });
        
        CQ.analytics.FrameworkSelection.superclass.constructor.call(this, config);
    },
    
    initComponent: function() {
        CQ.analytics.FrameworkSelection.superclass.initComponent.call(this);
        var parentDialog = this.findParentByType("dialog");
        parentDialog.on("loadcontent", this.postProcessRecords, this);
    },
    
    postProcessRecords: function(dialog, records, opts, sucess) {
        //#38153: already initialized
        if (this.data) {        
            return;
        }
        //check for inheritance
        var dlg = this.findParentByType('dialog');
        var dlgPath = dlg.path.replace("/jcr:content","");
        var url = CQ.HTTP.noCaching(dlgPath + ".cloudservices.json");
        var response = CQ.HTTP.get(url);
        var inheritData = CQ.HTTP.eval(response);    
        var recordData = records[0].data;
        var isInherited = inheritData["jcr:path"] != undefined; 
        var isOverridden = (isInherited && recordData["cq:cloudserviceconfigs"] != undefined);
        
        this.data = recordData;
        if(isInherited && !isOverridden) {
            this.data = inheritData;
        }
        
        //fill store with configured services
        var url = CQ.HTTP.noCaching("/libs/cq/cloudservices/services.json")
        var response = CQ.HTTP.get(url);
        var data = CQ.HTTP.eval(response);
            
        if(this.data["cq:cloudserviceconfigs"]) {       
            var configs = this.data["cq:cloudserviceconfigs"];
            if(typeof(configs) == "string") {
                configs = [configs];
            }
            for(var i=0; i<configs.length; i++) {
                var service = this.getServiceForConfigPath(data.services, configs[i]);
                if(service && service.name == this.servicename) {
                    this.addService(service, configs[i]);
                }
            }
        } else {
            this.addService(this.getServiceForConfigPath(data.services, "/etc/cloudservices/" + this.servicename));
        }

        this.doLayout();
        
        if( (this.data["jcr:path"] || dlgPath) ) {
            if(isInherited) {
                var inheritPath = inheritData["jcr:path"].replace("/jcr:content","");
                var tpl = new CQ.Ext.Template('{path}');
                this.inheritField.updateHtml(tpl.apply({path: inheritPath}));
            }
            
            this.inheritField.setVisible((isOverridden || isInherited));
            this.setConfigurationsEnabled((isOverridden || !isInherited));
            
            var editLock = isOverridden ? false : true;
            this.handleLock(this.inheritField, editLock);
        }
    },
    
    setConfigurationsEnabled: function(enable) {
        var tab = this.findParentByType('tabpanel');
        var fields = tab.findByType('compositefield');
        for(var i = 0; i < fields.length; i++) {
            enable ? fields[i].enable() : fields[i].disable();
        }
    },
    
    getServiceForConfigPath: function(services, path) {
        for(var i=0; i<services.length; i++) {
            if(path.indexOf(services[i].path) > -1) {
                return services[i];
            }
        }
    },
    
    handleLock: function(field, editLock) {
        try {
            var dlg = this;
            var iconCls = (editLock ? "cq-dialog-locked" : "cq-dialog-unlocked");
            field.editLock = editLock;
            
            field.fieldEditLockBtn = new CQ.TextButton({
                "tooltip": editLock ? CQ.Dialog.CANCEL_INHERITANCE : CQ.Dialog.REVERT_INHERITANCE,
                "cls": "cq-dialog-editlock",
                "iconCls": iconCls,
                "handleMouseEvents": false,
                "handler": function() {                     
                    dlg.switchInheritance(field, function(field, iconCls, editLock) {
                            field.fieldEditLockBtn.setIconClass(iconCls);
                            field.fieldEditLockBtn.setTooltip(iconCls == "cq-dialog-unlocked" ?
                                    CQ.Dialog.REVERT_INHERITANCE : CQ.Dialog.CANCEL_INHERITANCE);
                            field.setDisabled(editLock);
                            field.editLock = editLock;
                            },
                            dlg);
                }
            });
            var formEl = CQ.Ext.get('x-form-el-' + field.id);
            var label = formEl.parent().first();
            // narrow the field label
            formEl.parent().first().dom.style.width =
                    (parseInt(label.dom.style.width) - CQ.themes.Dialog.LOCK_WIDTH) + "px";
            if (field.rendered) {
                field.fieldEditLockBtn.render(formEl.parent(), label.next());
            } else {
                this.on("render", function(comp) {
                    field.fieldEditLockBtn.render(formEl.parent(), label.next());
                });
            }
        }
        catch (e) {
            // skip (formEl is null)
        }       
    },
    
    switchInheritance: function(field, callback, scope) {
        CQ.Ext.Msg.confirm(
            field.editLock ? CQ.I18n.getMessage("Cancel inheritance") : CQ.I18n.getMessage("Revert inheritance"),
            field.editLock ? CQ.I18n.getMessage("Do you really want to cancel the inheritance?") : CQ.I18n.getMessage("Do you really want to revert the inheritance?"),
            function(btnId) {
                if (btnId == "yes") {
                    var editLock = (field.editLock ? false : true);
                    var iconCls = (field.editLock ? "cq-dialog-unlocked" : "cq-dialog-locked");
                    if (callback) {
                        callback.call(this, field, iconCls, editLock);
                    }
                    this.setConfigurationsEnabled(!editLock);
                }
            },
            scope || this
        );
    },
        
    addService: function(service, value) {
        if(service && service.title && service.path) {
            var fld = {
                "xtype": "compositefield",
                "items": [
                    {
                        "xtype": "cloudservicescombo",
                        "fieldLabel": "<a href=\"#\" onclick=\"CQ.wcm.SiteAdmin.openPage('" + value + "', 'page', true)\">Framework</a>",
                        "name": "./cq:cloudserviceconfigs",
                        "rootPath": service.path,
                        "templatePath": service.templatePath,
                        "value": value ? value : "",
                        "flex": 1
                    }
                ]
            };
                        
            this.add(fld);
        }
    }
});
CQ.Ext.reg("frameworkselection", CQ.analytics.FrameworkSelection);
