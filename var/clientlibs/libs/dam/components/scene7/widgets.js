CQ.scene7 = CQ.scene7 || {};


CQ.scene7.initPresetOptions = function() {
    var cloudConfigCombo = CQ.Ext.getCmp("s7-videoprofile-cloudconfig");
    if(cloudConfigCombo){
        var cloudConfigPath = cloudConfigCombo.getValue();
        if(cloudConfigPath){
            CQ.scene7.loadPresetOptions(cloudConfigPath);
        }
    }
};

CQ.scene7.updatePresetOptions = function(record){
    if(record){
        var cloudConfigPath = record.data.path;
        if(cloudConfigPath){
            CQ.scene7.loadPresetOptions(cloudConfigPath);
        }
    }
};

CQ.scene7.loadPresetOptions = function(cloudConfigPath){
    if(cloudConfigPath){
        var path = cloudConfigPath;
        if(path){
            path = path + "/jcr:content.presets.encoding.json";
            var options;
            var response = CQ.HTTP.get(path);
            if(CQ.utils.HTTP.isOk(response)){
                var responseBody = response.body;
                options = JSON.parse(responseBody);
            }
            if(options){
                var presetCombo = CQ.Ext.getCmp("s7-videoprofile-preset");
                if(presetCombo){
                    presetCombo.setOptions(options);
                }
            }
        }
    }
};


CQ.scene7.triggerWorkflow = function(id, path, s7ConfigPath) {
    if (!s7ConfigPath) {
        s7ConfigPath = "";
    }
    document.getElementById(id + "-publishLink").removeAttribute("onclick");
    document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Uploading to Scene7");
    CQ.HTTP.post("/etc/workflow/instances", function(options, success, xhr, response) {
        if (success && xhr.status == 201) {
            var locHeader = xhr.getResponseHeader("Location").replace(/^http:\/\/.*?\/(.*)$/, "/$1");
            window.setTimeout("CQ.scene7.checkWorkflow('" + id + "', '" + path + "', '" + locHeader + "');", 5000);
        }
    }, {
        model:"/etc/workflow/models/scene7/jcr:content/model",
        payloadType:"JCR_PATH",
        payload:decodeURIComponent(path),
        "_charset_":"utf-8",
        "pageCloudConfigPath":s7ConfigPath,
        "isInteractiveUpload": "true"
    });
};


// run the workflow until it succeeds or fails. If it succeeds then we work off poll for pub status  via checkPublishState
CQ.scene7.checkWorkflow = function(id, path, location) {
    CQ.HTTP.get(location + ".json", function(options, success, xhr, response) {
        if (success) {
            var workflowInstance = CQ.HTTP.eval(xhr);
            if (workflowInstance) {
                if (workflowInstance.state == "RUNNING") {
                    CQ.scene7.checkPublishState(id, path, 0);
                    window.setTimeout("CQ.scene7.checkWorkflow('" + id + "', '" + path + "', '" + location + "');", 5000);
                    return;
                } else if (workflowInstance.state == "COMPLETED") {
                    var now = new Date();
                    CQ.scene7.checkPublishState(id, path, now.getTime());
                    return;
                }

            }
        }
        document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Publishing to Scene7 failed");
    });
};


CQ.scene7.triggerWorkflowFromViewer = function(id, path, s7PageConfigPath) {
    CQ.HTTP.get(path + "/_jcr_content/metadata.json", function(options, success, xhr, response) {
        if (success) {
            var asset = CQ.HTTP.eval(xhr);
            if (asset && asset["dam:scene7FileStatus"]) {
                var now = new Date();
                document.getElementById(id + "-publishLink").removeAttribute("onclick");
                CQ.scene7.checkPublishState(id, path, now.getTime());
            } else {
                CQ.scene7.triggerWorkflow(id, path, s7PageConfigPath);
            }
        }
    });
};

// Check status of s7 upload/publish based on asset metadata
// Polls based on startup and continues until the operation succeeds, fails or
// timeouts.
// Note: Timeout does not change the current status setting as the job likely has not failed, just has not yet completed
CQ.scene7.checkPublishState = function(id, path, startTime) {
    // if onclick has been reset a new asset was dropped in while the previous asset is publishing stop checking pub status of previous asset
    if (document.getElementById(id + "-publishLink").hasAttribute("onclick"))
        return;
    CQ.HTTP.get(path + "/_jcr_content/metadata.json", function(options, success, xhr, response) {
        if (success) {
            var asset = CQ.HTTP.eval(xhr);
            if (asset && asset["dam:scene7FileStatus"]) {
                var state = asset["dam:scene7FileStatus"];
                if (state == "UploadStart")
                    document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Uploading to Scene7");
                else if (state == "PublishQueued")
                    document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Publishing to Scene7 queued");
                else if (state == "PublishStart")
                    document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Publishing to Scene7");
                else if (state == "UploadFailed" || state == "PublishFailed") {
                    document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Publish to Scene7 failed");
                    return;
                } else if (state == "PublishComplete") {
                    document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Publish to Scene7 completed");
                    return;
                }

                var now = new Date();
                if (now.getTime() - startTime < 20 * 60 * 1000)
                    window.setTimeout('CQ.scene7.checkPublishState(\'' + id + '\', \'' + path + '\', ' + now.getTime() + ');', 5000);
            } else
                document.getElementById(id + "-publishLink").innerHTML = CQ.I18n.getMessage("Publish to Scene7 failed");
        }
    });
};

CQ.scene7.pollingEnablerSelectionChange = function(selectCmp, value, changed) {
    CQ.scene7.showHideRunningImporterTerminator(selectCmp, value == "false");
};

CQ.scene7.showHideRunningImporterTerminator = function(component, showControl) {
    var dialog = component.findParentByType("dialog");
    if (typeof dialog != undefined) {
        var cancelImporterCmpArray = dialog.find("name", "./pollConfig/cancelImporter");
        
        if (cancelImporterCmpArray &&
                cancelImporterCmpArray.length &&
                cancelImporterCmpArray.length > 0) {
            var cancelImporterCmp = cancelImporterCmpArray[0];
            
            cancelImporterCmp.setVisible(showControl);
        }
    }
};

CQ.scene7.doConnect = function(dialog) {
    var emailField = dialog.find("name", "./email");
    var passwordField = dialog.find("name", "./password");
    var regionField = dialog.find("name", "./region");
    var email = emailField[0].getValue();
    var password = passwordField[0].getValue();
    var region = regionField[0].getValue();
    
    if (!email) {
        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), CQ.I18n.getVarMessage("Please provide an email address."));
        return;
    }
    if (!password) {
        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), CQ.I18n.getVarMessage("Please provide the Scene7 account's password."));
        return;
    }
    if (!region) {
        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), CQ.I18n.getVarMessage("Please select the region for your Scene7 account."));
        return;
    }

    this.showButtonIndicator(true);

    CQ.HTTP.post(dialog.path + ".companies.json", function(options, success, xhr, response) {
                if (success) {
                    var scene7Data = CQ.HTTP.eval(xhr);
                    this.showButtonIndicator(false);
                    if (scene7Data) {
                        if (scene7Data.error) {
                            CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"), CQ.I18n.getVarMessage(scene7Data.error));
                        } else {
                            if (scene7Data.userHandle) {
                                dialog.find("name", "./userHandle")[0].setValue(scene7Data.userHandle);
                            }

                            if (scene7Data.companies && scene7Data.companies.length > 0) {
                                var companies = new Array();
                                for (var i = 0; i < scene7Data.companies.length; i++) {
                                    // has to be in the same order as the store field config
                                    companies.push([ scene7Data.companies[i].handle,
                                        scene7Data.companies[i].name,
                                        scene7Data.companies[i].rootPath]);
                                }
                                dialog.find("name", "./companyname")[0].store.loadData(companies);
                            }
                            var rootPath = dialog.find("name", "./rootPath")[0];
                            rootPath.setValue("");
                            rootPath.itemCt.setDisplayed("inherit");
                            dialog.find("name", "./companyname")[0].setValue("");
                            dialog.find("name", "./companyname")[0].itemCt.setDisplayed("inherit");
                            if (dialog.find("name", "./syncEnabled")[0].getValue(true) === "on") {
                                dialog.find("name", "./syncControl")[0].setValue(true);
                            } else {
                                dialog.find("name", "./syncControl")[0].setValue(false);
                            }
                            dialog.find("name", "./syncControl")[0].itemCt.setDisplayed("inherit");
                            dialog.find("name", "./defaultConfiguration")[0].itemCt.setDisplayed("inherit");
                            dialog.find("localName", "connectButton")[0].setText(CQ.I18n.getMessage('Re-Connect to Scene7'));

                            dialog.find("name", "./pollConfig/source")[0].setValue("scene7:" + dialog.path);
                            dialog.find("name", "./pollConfig/target")[0].setValue(dialog.path);

                            CQ.Ext.Msg.show({
                                title:CQ.I18n.getMessage("Success"),
                                msg:CQ.I18n.getMessage("Connection successful"),
                                buttons:CQ.Ext.Msg.OK,
                                icon:CQ.Ext.Msg.INFO});
                            CQ.cloudservices.getEditOk().enable();
                        }
                    }
                }
            },
            {
                "email":email,
                "password":password,
                region:region,
                path:dialog.path
            }, this, true);

};

CQ.scene7.showButtonIndicator = function(isShown) {
    if (!isShown) {
        CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connection successful")).hide();
    } else {
        CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connecting to Scene7..."));
    }
};

CQ.scene7.EmailField = CQ.Ext.extend(CQ.Ext.form.TextField, {
    constructor:function(config) {
        config.enableKeyEvents = true;

        config.listeners = {
            change:function(field, newValue, oldValue) {
                var dialog = field.findParentByType("dialog");
                dialog.find("name", "./password")[0].setValue("");
                dialog.find("name", "./userHandle")[0].setValue("");
                dialog.find("name", "./companyHandle")[0].setValue("");

                dialog.find("name", "./rootPath")[0].setValue("");
                dialog.find("name", "./rootPath")[0].itemCt.setDisplayed("none");
                dialog.find("name", "./companyname")[0].setValue("");
                dialog.find("name", "./companyname")[0].itemCt.setDisplayed("none");
                dialog.find("name", "./syncControl")[0].itemCt.setDisplayed("none");
                dialog.find("name", "./defaultConfiguration")[0].itemCt.setDisplayed("none");
            }
        };

        CQ.scene7.EmailField.superclass.constructor.call(this, config);
    }

});

CQ.Ext.reg('scene7emailfield', CQ.scene7.EmailField);

CQ.scene7.CompanyField = CQ.Ext.extend(CQ.Ext.form.ComboBox, {
    constructor:function(config) {
        config.mode = "local";
        config.triggerAction = 'all';
        config.valueField = "handle";
        config.displayField = "name";
        config.store = new CQ.Ext.data.SimpleStore({
            data:[],
            fields:["handle", "name", "rootPath"],
            id:0
        });
        config.listeners = {
            select:function(combo, record, index) {
                var dialog = combo.findParentByType("dialog");
                dialog.find("name", "./companyHandle")[0].setValue(record.data.handle);
                dialog.find("name", "./rootPath")[0].setValue(record.data.rootPath);
                dialog.find("name", "./targetPath")[0].setValue("/content/dam/" + record.data.rootPath);
                dialog.find("name", "./s7RootPath")[0].setValue(record.data.rootPath);
                dialog.find("name", "./adhocFolder")[0].setValue(record.data.rootPath + "CQ5_adhoc");
            },
            loadcontent:function(field, record, path) {
                var dialog = field.findParentByType("dialog");
                if (!record.data.companyHandle) {
                    field.itemCt.setDisplayed("none");
                    dialog.find("name", "./rootPath")[0].itemCt.setDisplayed("none");
                    dialog.find("name", "./syncControl")[0].itemCt.setDisplayed("none");
                    dialog.find("name", "./defaultConfiguration")[0].itemCt.setDisplayed("none");
                }
                CQ.scene7.init(dialog);
            }
        };

        CQ.scene7.CompanyField.superclass.constructor.call(this, config);
    },
    initComponent:function() {
        CQ.scene7.CompanyField.superclass.initComponent.call(this);
    }
});

CQ.Ext.reg('scene7companyfield', CQ.scene7.CompanyField);

CQ.scene7.TwoValueField = CQ.Ext.extend(CQ.form.CompositeField, {

    constructor:function(config) {
        var fieldItem = this;
        var items = new Array();
        items.push({
            xtype:'numberfield',
            allowDecimals:config.allowDecimals,
            allowNegative:config.allowNegative,
            listeners:{
                change:function(field, newValue, oldValue) {
                    fieldItem.hiddenField.setValue(newValue + "," + fieldItem.field2.getValue());
                }
            }
        });
        items.push({
            xtype:'numberfield',
            allowDecimals:config.allowDecimals,
            allowNegative:config.allowNegative,
            listeners:{
                change:function(field, newValue, oldValue) {
                    fieldItem.hiddenField.setValue(fieldItem.field1.getValue() + "," + newValue);
                }
            }
        });
        items.push({
            xtype:'hidden',
            name:config.name
        });

        config = CQ.Util.applyDefaults(config, {
            "border":false,
            "items":[
                {
                    "xtype":"panel",
                    "border":false,
                    "bodyStyle":"padding:" + this.bodyPadding + "px",
                    "layout":"column",
                    "items":items
                }
            ]
        });
        CQ.scene7.TwoValueField.superclass.constructor.call(this, config);
    },

    initComponent:function() {
        CQ.scene7.TwoValueField.superclass.initComponent.call(this);

        this.field1 = this.items.items[0].items.items[0];
        this.field2 = this.items.items[0].items.items[1];
        this.hiddenField = this.items.items[0].items.items[2];

        this.on("disable", function() {
            this.items.each(function(item/*, index, length*/) {
                if (item instanceof CQ.Ext.form.Field) {
                    item.field.disable();
                }
            }, this);
        });

        this.on("enable", function() {
            this.items.each(function(item/*, index, length*/) {
                if (item instanceof CQ.Ext.form.Field) {
                    item.field.enable();
                }
            }, this);
        });
    },

    // overriding CQ.form.CompositeField#getValue
    getValue:function() {
        return this.field1.getValue() + "," + this.field2.getValue();

    },

    // overriding CQ.form.CompositeField#setValue
    setValue:function(value) {
        if (value.indexOf(",") != -1) {
            var value1 = value.substring(0, value.indexOf(","));
            var value2 = value.substring(value.indexOf(",") + 1);
        } else {
            var value1 = value;
            var value2 = "";
        }
        this.field1.setValue(value1);
        this.field2.setValue(value2);
        this.hiddenField.setValue(value);
    }
});

CQ.Ext.reg('scene7twovaluefield', CQ.scene7.TwoValueField);

CQ.scene7.SyncField = CQ.Ext.extend(CQ.Ext.form.Checkbox, {
    constructor:function(config) {
        config.listeners = {
            check:function(cb, check) {
                var dialog = cb.findParentByType("dialog");
                if (check) {
                    dialog.find("name", "./syncEnabled")[0].setValue("on");
                } else {
                    dialog.find("name", "./syncEnabled")[0].setValue("off");
                }
            },
            loadcontent:function(field, record, path) {
                var dialog = field.findParentByType("dialog");
                if (record.data.syncEnabled === "off") {
                    dialog.find("name", "./syncControl")[0].setValue(false);
                }
            }
        };
        CQ.scene7.SyncField.superclass.constructor.call(this, config);
    }
});

CQ.Ext.reg('scene7syncfield', CQ.scene7.SyncField);

CQ.scene7.updateDefaultConfig = function(dialog) {
    // get the value of the default checkbox
    var configControls = dialog.find("name", "./defaultConfiguration");
    if (configControls && configControls[0]) {
        var isDefaultConfig = configControls[0].getValue();
        if (isDefaultConfig) {
            var configPath = dialog.path;

            // if the flag is set, perform a XHR to update the default configuration
            CQ.HTTP.post(configPath + ".config.json", function(options, success, xhr, response) {},
                {
                    "setDefault":"true"
                }, this, true);
        }
    }

    return true;
};

/**
 * Updates the presets for the given S7 config
 */
CQ.scene7.updatePresets = function(resourcePath, callback) {
    if (!callback) {
        callback = function(options, success, xhr, response) {};
    }
    CQ.HTTP.post(resourcePath + ".presets.all.html", callback, {}, this, true);
};

CQ.Ext.apply(CQ.Ext.form.VTypes, {
    //  vtype validation function
    scene7Path : function(val) {
        return /^.*\/$/.test(val);
    },
    // vtype Text property: The error text to display when the validation function returns false
    scene7PathText : CQ.I18n.getMessage('Not a valid path. Must end with /'),
    scene7Endpoint : function(val){
        var url = val;
        if ( url.lastIndexOf('/') != url.length )
            url += "/";
        if (! /^(https?:\/\/)?(([\da-z\.-]+)\.([a-z\.]{2,6})|localhost)(:[0-9]{1,5})?([\/\w \.-]*)*\/?$/.test(url))
            return false;

        // parsing the port out of the URL and check if it's range is correct
        var tokens=url.split(":");
        var lastToken = tokens[tokens.length-1];
        var port = lastToken.substring(0, lastToken.indexOf('/'));
        if (port < 0 || port > 65535)
            return false;

        return true;
    },
    scene7ConfigTargetPath : function(val) {
        var currentTargetPath = val,
            configsURL = CQ.shared.HTTP.externalize('/etc/cloudservices/scene7.infinity.json'),
            response,
            jsonResponse,
            currentObject,
            page,
            targetPath,
            currentPath = CQ.shared.HTTP.getPath(window.location.href),
            currentResource = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        if (currentTargetPath.lastIndexOf('/') == currentTargetPath.length - 1) {
            currentTargetPath = currentTargetPath.substring(0, currentTargetPath.length - 1);
        }
        response = CQ.shared.HTTP.get(configsURL);
        if (response) {
            jsonResponse = JSON.parse(response.body);
            if (jsonResponse) {
                for (prop in jsonResponse) {
                    if (prop == currentResource) {
                        continue;
                    }
                    currentObject = jsonResponse[prop];
                    page = currentObject['jcr:content'];
                    if (page && page['sling:resourceType'] && page['sling:resourceType'] === 'dam/components/scene7/scene7page') {
                        targetPath = page['targetPath'];
                        if (targetPath && targetPath.lastIndexOf('/') == targetPath.length - 1) {
                            targetPath = targetPath.substring(0, targetPath.length - 1);
                        }
                        if (currentTargetPath === targetPath) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    },
    scene7ConfigTargetPathText : CQ.I18n.getMessage('A previously existing configuration uses the same target path.')

});
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
CQ.scene7 = CQ.scene7 || {};
CQ.scene7.videoEncoding = {};

CQ.scene7.videoEncoding.videoEncodingResponse = null;
CQ.scene7.videoEncoding.init = function(resourcePath) {
    if (CQ.scene7.videoEncoding.videoEncodingResponse == null) {
        var response = CQ.HTTP.get(resourcePath + '.presets.encoding.json');
        if (CQ.shared.HTTP.isOk(response)) {
            CQ.scene7.videoEncoding.videoEncodingResponse = CQ.shared.Util.eval(response);
        }
    }
}

/**
 * @class CQ.S7.VideoEncodingPanel
 * @extends CQ.Ext.Panel
 * The VideoEncodingPanel supports the selection of one or more S7
 *    video encoding presets.
 */
CQ.scene7.videoEncoding.VideoEncodingPanel = CQ.Ext.extend(CQ.Ext.form.CompositeField, {
    
    constructor: function(config) {

        var self = this;
        var itemsArr = new Array();
        this.filter = config.filter;
        this.store = new CQ.Ext.data.JsonStore({
                autoLoad: false,
                data: CQ.scene7.videoEncoding.videoEncodingResponse,
                fields: [
                    'name','handle','type','playbackOn'
                ],
                listeners: {
                    "load": function(store, records, options) {
                        store.each(function(record) {
                            var type = record.get("type");
                            var playbackOn = record.get("playbackOn");
                            if ((type !== null && type.length > 0 && self.filter.indexOf(type) != -1) ||
                                    (playbackOn !== null && playbackOn.length > 0 && self.filter.indexOf(playbackOn) != -1)) {
                                itemsArr.push(new CQ.Ext.form.Checkbox({
                                        "id": record.get("handle"),
                                        "boxLabel": record.get("name")
                                }));
                            }
                        });
                        if (store.getCount() == 0) {
                            itemsArr.push({xtype: "label", text: CQ.I18n.getMessage("No presets to display")});
                        }
                    }
                }
            });
        
        this.valueField = new CQ.Ext.form.Hidden({ name:config.name });
        
        config = CQ.Util.applyDefaults(config, {
            items: [
                {
                    xtype:"panel",
                    border:false,
                    bodyStyle:"padding:4px",
                    items: itemsArr
                },
                this.valueField
            ],
            listeners: {
                render: function(comp) {
                    var parentDialog = comp.findParentByType("dialog");
                    if (parentDialog) {
                        parentDialog.on("beforesubmit", function(e) {
                            var value = self.getValue();
                            self.valueField.setValue(value);
                        });
                    }
                }
            }
        });
        CQ.scene7.videoEncoding.VideoEncodingPanel.superclass.constructor.call(this,config);
    },

    getValue: function() {
        var value = "";
        var separator = "";
        this.items.each(function(item, index, length) {
            if ((item instanceof CQ.Ext.form.Checkbox) && item.getValue()) {
                value = value + separator + item.getId();
                separator = ",";
            }
        }, this);
        return value;
    },
    
    setValue: function(value) {
        if ((value != null) && (value != "")) {
            var values = value.split(",");
            for (var i=0; i<values.length; i++) {
                this.items.each(function(item, index, length) {
                    if (item.getId() == values[i]) {
                        item.setValue(true);
                    }
                });
            }
        }
    }
});

CQ.Ext.reg("s7videoencoding", CQ.scene7.videoEncoding.VideoEncodingPanel);
/**
 * @class CQ.cloudservices.Scene7CloudConfigurationCombo
 * @extends CQ.cloudservices.CloudConfigurationCombo
 * The Scene7CloudConfigurationCombo is a customized {@link CQ.cloudservices.CloudConfigurationCombo}
 * that shows a list of available configurations for a specific Scene7 service, with additional support for
 * automatically selecting the S7 service marked as default.
 *
 * @constructor
 * Creates a new Scene7CloudConfigurationCombo.
 * @param {Object} config The config object
 */
CQ.cloudservices.Scene7CloudConfigurationCombo = CQ.Ext.extend(CQ.cloudservices.CloudConfigurationCombo, {
    constructor: function(config) {
        CQ.cloudservices.Scene7CloudConfigurationCombo.superclass.constructor.call(this, config);
    },
    
    /**
     * Override the data store procedure in the base class
     * Create and return a CQ.Ext.data.Store for this component
     */
    createDataStore : function(config, rootPathParam, self) {
        var newDataStore = new CQ.Ext.data.Store({
            "autoLoad": {},
            "proxy":new CQ.Ext.data.HttpProxy({
                "url":CQ.shared.HTTP.externalize("/libs/cq/cloudservices/configurations.json" + rootPathParam),
                "method":"GET"
            }),
            "reader": new CQ.Ext.data.JsonReader({
                "root": "configurations",
                "id" : "path",
                "fields": [ "title", "description", "name", "path", "templatePath" ]
            }),
            "listeners": {
                "load": function(store) {
                    if (self.createNewEnabled) {
                        store.add(new store.recordType({
                            "path": "",
                            "title": CQ.I18n.getMessage("Create new configuration..."),
                            "description": ""
                        }, CQ.Ext.id()));
                    }
                    
                    // perform an extra XHR to get the full json under rootPath
                    CQ.HTTP.get(config.rootPath + ".infinity.json", function(options, success, xhr, response) {
                        var value = "";
                        if (success) {
                            var scene7Data = CQ.HTTP.eval(xhr);
                            if (scene7Data) {
                                // identify the first config with a default flag set
                                for (var i=0 ; i < store.totalLength ; i++) {
                                    var configName = store.getAt(i).get('name');
                                    
                                    var configProperties = scene7Data[configName];
                                    var isDefault = false;
                                    if (configProperties
                                            && configProperties["jcr:content"]
                                            && configProperties["jcr:content"].defaultConfiguration == true) {
                                        isDefault = true;
                                    }
                                    
                                    if (isDefault) {
                                        value = store.getAt(i).get('path');
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // pre-select the default, if available
                        if (value != "") {
                            self.setValue(value);
                            self.fireEvent("change", this, value, undefined);
                        } else if (config.selectFirst){
                            // make sure we have at least one configuration available
                            // before attempting to select the first
                            var firstConfig = store.getAt(0);
                            if (firstConfig) {
                                value = firstConfig.get('path');
                            }
                            self.setValue(value);
                            self.fireEvent("change", this, value, undefined);
                        }
                    }, this);
                }
            }
        });
        
        return newDataStore;
    },
    
    setValue : function(value) {
        CQ.cloudservices.Scene7CloudConfigurationCombo.superclass.setValue.call(this, value);
    },
    
    getCqRootPath : function() {
        return CQ.S7.getCqRootPath(this.getValue());
    }
});

CQ.Ext.reg("scene7cloudservicescombo", CQ.cloudservices.Scene7CloudConfigurationCombo);
