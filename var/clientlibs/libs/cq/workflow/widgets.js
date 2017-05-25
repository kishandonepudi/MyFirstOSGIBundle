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
 * Workflow namespace declaration and initialization
 */
CQ.Ext.namespace('CQ.Workflow');
CQ.Ext.namespace('CQ.Workflow.Console');
CQ.Ext.namespace('CQ.workflow');
CQ.Ext.namespace('CQ.workflow.flow');
/*
 Copyright 1997-2008 Day Management AG
 Barfuesserplatz 6, 4001 Basel, Switzerland
 All Rights Reserved.

 This software is the confidential and proprietary information of
 Day Management AG, ("Confidential Information"). You shall not
 disclose such Confidential Information and shall use it only in
 accordance with the terms of the license agreement you entered into
 with Day.
*/
CQ.Workflow.Console.TreeItem = CQ.Ext.extend(CQ.Ext.menu.Item, {
	constructor : function(config) {
		CQ.Workflow.Console.TreeItem.superclass.constructor.call(this, config.tree, config);
        this.tree = this.component;
        this.addEvents('selectionchange');

        this.tree.on("render", function(tree){
            tree.body.swallowEvent(['click','keydown', 'keypress', 'keyup']);
        });
        this.tree.getSelectionModel().on("selectionchange", this.onSelect, this);
    },

    onSelect : function(tree, sel){
        this.fireEvent("select", this, sel, tree);
    }
});

// custom menu containing a single tree
CQ.Workflow.Console.TreeMenu = CQ.Ext.extend(CQ.Ext.menu.Menu, {
	cls:'x-tree-menu',
    keyNav: true,
    hideOnClick:false,
    plain: true,
    constructor : function(config) {
		CQ.Workflow.Console.TreeMenu.superclass.constructor.call(this, config);
        this.treeItem = new CQ.Workflow.Console.TreeItem(config);
        this.add(this.treeItem);

        this.tree = this.treeItem.tree;
        this.tree.on('click', this.onNodeClick, this);
        this.relayEvents(this.treeItem, ["selectionchange"]);
    },
    beforeDestroy : function() {
        this.tree.destroy();
    },
    onNodeClick : function(node, e) {
    	if (!node.attributes.isFolder) {
    		this.treeItem.handleClick(e);
    	}
    }
});


// custom form field for displaying a tree, similar to select or combo
CQ.Workflow.Console.TreeSelector = CQ.Ext.extend(CQ.Ext.form.TriggerField, {
	initComponent: function() {
		CQ.Workflow.Console.TreeSelector.superclass.initComponent.call(this);
        this.addEvents('selectionchange');

        this.tree.getSelectionModel().on('selectionchange', this.onSelection, this);
        this.tree.on({
        	'expandnode': this.sync,
            'collapsenode' : this.sync,
            'append' : this.sync,
            'remove' : this.sync,
            'insert' : this.sync,
            scope: this
        });
        this.on('focus', this.onTriggerClick, this);
	},
    sync: function() {
		if (this.menu && this.menu.isVisible()) {
			if (this.tree.body.getHeight() > this.maxHeight) {
				this.tree.body.setHeight(this.maxHeight);
                this.restricted = true;
			} else if (this.restricted && this.tree.body.dom.firstChild.offsetHeight < this.maxHeight) {
				this.tree.body.setHeight('');
                this.restricted = false;
			}
            this.menu.el.sync();
		}
	},
	onSelection: function(tree, node) {
		if (!node) {
			this.setRawValue('');
		} else {
			//console.log("selected node: " + node.getPath() + "depth: " + node.getDepth());
            var path = node.getPath();
            path = (path.indexOf("//") == 0) ? path.substring(1) : path; // TODO: // hack
            this.setRawValue(path);
		}
	},
    initEvents : function(){
		CQ.Workflow.Console.TreeSelector.superclass.initEvents.call(this);
		this.el.on('mousedown', this.onTriggerClick, this);
        this.el.on("keydown", this.onKeyDown,  this);
	},
	onKeyDown: function(e) {
		if (e.getKey() == e.DOWN) {
			this.onTriggerClick();
		}
	},
    validateBlur: function() {
		return !this.menu || !this.menu.isVisible();
    },
    getValue: function() {
    	var sm = this.tree.getSelectionModel();
        var s = sm.getSelectedNode();
        //console.log(s ? s.id : '');
        //return s ? s.id : '';
        
        // NOTE: use path instead of ID, because grid editor trigger widgets display
        // the correct ID instead of the path
        
        var path = s ? s.getPath() : '';
        //console.log(s ? s.getPath() : '');
        
        // TODO: check why paths start with 2 /, must be somewhere in the
        // servlet since we had this problem with CQ widgets as well)
        if (path.substring(0, 2) == '//') {
            path = path.substring(1);
        }        
        return path;
    },
    setValue: function(id) {
    	var n = this.tree.getNodeById(id);
        if (n) {
        	n.select();
        } else {
        	this.tree.getSelectionModel().clearSelections();
        }
    },
    onDestroy: function() {
        if (this.menu) {
        	this.menu.destroy();
        }
        if (this.wrap) {
        	this.wrap.remove();
        }
        CQ.Workflow.Console.TreeSelector.superclass.onDestroy.call(this);
    },
    menuListeners: {
        show: function() { // retain focus styling
            this.onFocus();
        },
        hide: function() {
            this.focus.defer(10, this);
            var ml = this.menuListeners;
            this.menu.un("show", ml.show,  this);
            this.menu.un("hide", ml.hide,  this);
        }
    },
    onTriggerClick: function() {
    	if (this.disabled) {
            return;
        }
        this.menu.on(CQ.Ext.apply({}, this.menuListeners, {
            scope:this
        }));
        this.menu.show(this.el, "tl-bl?");
        this.sync();
        var sm = this.tree.getSelectionModel();
        var selected = sm.getSelectedNode();
        if (selected) {
        	selected.ensureVisible();
            sm.activate.defer(250, sm, [selected]);
        }
    },
    beforeBlur: function() {
        //
    },
    onRender: function() {
    	CQ.Workflow.Console.TreeSelector.superclass.onRender.apply(this, arguments);
        this.menu = new CQ.Workflow.Console.TreeMenu(CQ.Ext.apply(this.menuConfig || {}, {tree: this.tree}));
        this.menu.render();

        this.tree.body.addClass('x-tree-selector');
    },
    readOnly: true
});

CQ.Workflow.Console.Util = {
    hasExtension: function(url) {
        var cutUrl = CQ.HTTP.removeParameters(url);
        var name = (cutUrl.indexOf("/") > 0) ?
                   cutUrl.substring(cutUrl.lastIndexOf("/")) : cutUrl;
        return (name.indexOf(".") > 0);
    }
}
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

CQ.Workflow.Console.GridPanel = CQ.Ext.extend(CQ.Ext.grid.GridPanel, {
    pageSize:40,
    
    region:'center',
    margins:'5 5 5 5',

    stateful:true,
    loadMask:true,
    stripeRows:true,
    
    reload: function() {
        this.getStore().reload();
    },

    renderPayload: function(value, p, record) {
        var url = CQ.HTTP.externalize(value);
        url = (CQ.Workflow.Console.Util.hasExtension(url)) ? url : url + ".html";
        return String.format('<a href="{0}">{1}</a>', CQ.HTTP.externalize(url, true), value);
    },
    
    formatDate: function(date) {
        if (typeof date == "number") {
            date = new Date(date);
        }
	    var fmt = CQ.I18n.getMessage("d-M-Y H:i", null, "Date format for ExtJS GridPanel (short, eg. two-digit year, http://extjs.com/deploy/ext/docs/output/Date.html)")
	    return date.format(fmt);
    }
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

CQ.Workflow.Console.ModelsPanel = function(config) {
    this.construct.call(this, config);
};

CQ.Ext.extend(CQ.Workflow.Console.ModelsPanel, CQ.Workflow.Console.GridPanel, {
    id:'cq.workflow.models',
    
    title:CQ.I18n.getMessage('Models'),
    tabTip:CQ.I18n.getMessage('Lists available workflow models'),
    
    listeners: {
        rowcontextmenu: function(grid, index, e) {
            if (!this.contextMenu) {
                this.contextMenu = new CQ.Ext.menu.Menu({
                    items: this.actions
                });
            }
            var xy = e.getXY();
            this.contextMenu.showAt(xy);
            e.stopEvent();
        },
        rowdblclick: function() { this.fireOpenModelEvent(); }
    },
    
    view: new CQ.Ext.grid.GroupingView({
        forceFit:true,
        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "'+CQ.I18n.getMessage("Items")+'" : "'+CQ.I18n.getMessage("Item")+'"]})'
    }),
    
    construct: function(config) {
        var myThis = this;
        this.resourcePath = config.resourcePath;
        
        // store
        this.store = new CQ.Ext.data.GroupingStore({
            proxy: new CQ.Ext.data.HttpProxy({ 
                url:this.resourcePath + "/models.json",
                method:"GET"
            }),
            listeners: {
                exception: function(obj, action, data, it, response) {
                    CQ.shared.HTTP.handleForbidden(response);
                }
            },
            autoLoad:false,
            reader: new CQ.Ext.data.JsonReader({
                root: 'models',
                totalProperty: 'results',
                id: 'item',
                fields: [
                    'title',
                    'version',
                    'description',
                    'item'
                ]
            })
        });
        this.store.setDefaultSort('title', 'ASC');
                
        // selection model
        this.sm = new CQ.Ext.grid.RowSelectionModel({singleSelect:true,
            listeners: {
                selectionchange: function(selectionModel) {
                    myThis.editAction.setDisabled(!selectionModel.hasSelection());
                    myThis.startAction.setDisabled(!selectionModel.hasSelection());
                    myThis.deleteAction.setDisabled(!selectionModel.hasSelection());
                }
            }
        });
        
        // column model
        this.cm = new CQ.Ext.grid.ColumnModel([new CQ.Ext.grid.RowNumberer(),
            {
                header:CQ.I18n.getMessage("Title"),
                dataIndex: 'title',
                width:200
            },{
                header:CQ.I18n.getMessage("Version"),
                dataIndex: 'version',
                width:60
            },{
                header:CQ.I18n.getMessage("Description"),
                dataIndex: 'description',
                width:400
            },{
                header:CQ.I18n.getMessage("ID"),
                dataIndex: 'item',
                width:400
            }
        ]);
        this.cm.defaultSortable = true;
        
        // actions
        this.newAction = new CQ.Ext.Action({
            cls:'cq.workflow.models.new',
            text:CQ.I18n.getMessage('New'),
            handler: function() {
                var newDialogConfig = {
                    xtype: 'dialog',
                    title:CQ.I18n.getMessage('New Workflow'),
                    params: {
                        "_charset_":"utf-8",
                        "cmd": "createPage",
                        "template": "/libs/cq/workflow/templates/model",
                        "parentPath": "/etc/workflow/models/"
                    },
                    items: {
                        xtype:'panel',
                        items:[{
                            xtype: 'textfield',
                            allowBlank: false,
                            name:'title',
                            fieldLabel:CQ.I18n.getMessage('Title')
                        },{
                            xtype: 'textfield',
                            name:'label',
                            fieldLabel:CQ.I18n.getMessage('Name')
                        }]
                    },
                    responseScope: myThis,
                    success: function(form, action) {
                         CQ.Ext.Ajax.request({
                             url: action.result.Location + "/jcr:content.generate.json",
                             method: "POST",
                             callback: function(options, success) {
                                 if(!success) {
                                     CQ.Ext.Msg.alert(
                                         CQ.I18n.getMessage("Error"),
                                         CQ.I18n.getMessage("Could not generate workflow model."));
                                 }
                        
                                myThis.reload();
                            }
                        });
                    },
                    failure: function() { 
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not create workflow model."));
                    },
                    buttons:CQ.Dialog.OKCANCEL
                };
                var newDialog = CQ.WCM.getDialog(newDialogConfig);
                newDialog.form.url = '/bin/wcmcommand';
                newDialog.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('New Model'),
                text:CQ.I18n.getMessage('Creates a new workflow model'),
                autoHide:true
            }
        });
        
        this.deleteAction = new CQ.Ext.Action({
            cls:'cq.workflow.models.delete',
            text:CQ.I18n.getMessage('Delete'),
            disabled:true,
            handler: function() {
            CQ.Ext.Msg.show({
                title:CQ.I18n.getMessage('Delete Model?'),
                msg:CQ.I18n.getMessage('Would you really like to delete the model?'),
                buttons:CQ.Ext.Msg.YESNO,
                icon:CQ.Ext.MessageBox.QUESTION,
                fn:function(btnId) {
                    if (btnId == 'yes') {
                        var conn = new CQ.Ext.data.Connection();
                        conn.request({
                            scope:this,
                            method:'POST',
                            params: { "_charset_":"utf-8" },
                            headers: {'X-HTTP-Method-Override':'DELETE'},
                            url:myThis.getSelectionModel().getSelected().id + ".json",
                            success:function(response, options) {
                                myThis.reload();
                            },
                            failure:function(response, options) {
                                CQ.Ext.Msg.alert(
                                    CQ.I18n.getMessage("Error"),
                                    CQ.I18n.getMessage("Could not delete workflow model."));
                            }
                        });
                    }
                }});
            },
            tooltip: {
                title:CQ.I18n.getMessage('Delete Model'),
                text:CQ.I18n.getMessage('Deletes the selected workflow model'),
                autoHide:true
            }
        });

        this.editAction = new CQ.Ext.Action({
            cls:'cq.workflow.models.edit',
            text:CQ.I18n.getMessage('Edit'),
            handler: function() {
                myThis.fireOpenModelEvent();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Edit Model'),
                text:CQ.I18n.getMessage('Opens a new window for model editing'),
                autoHide:true
            }
        });
        this.editAction.setDisabled(true);

        this.startAction = new CQ.Ext.Action({
            cls:'cq.workflow.models.start',
            text:CQ.I18n.getMessage('Start'),
            handler: function() {
                var startDialogConfig = {
                    xtype: 'dialog',
                    title:CQ.I18n.getMessage('Start Workflow'),
                    formUrl: '/etc/workflow/instances',
                    params: {
                        model:myThis.getSelectionModel().getSelected().id,
                        "_charset_":"utf-8"
                    },
                    items: {
                        xtype:'panel',
                        items:[
                            {
                                xtype:"pathfield",
                                name:"payload",
                                fieldLabel:CQ.I18n.getMessage("Payload"),
                                allowBlank:false,
                                predicate: "nosystem",
                                rootPath: "/",
                                showTitlesInTree: false
                            },{
                                xtype: 'textfield',
                                name:'workflowTitle',
                                fieldLabel:CQ.I18n.getMessage('Workflow Title')
                            },{
                                xtype: 'textarea',
                                name:'startComment',
                                anchor:CQ.themes.Dialog.ANCHOR + " -100px",
                                fieldLabel:CQ.I18n.getMessage('Comment'),
                                fieldDescription:CQ.I18n.getMessage('Optional comment to describe the new workflow instance.')
                            },{
                                xtype: 'textfield',
                                name:'payloadType',
                                hidden:true,
                                value: 'JCR_PATH'
                            }
                        ]
                    },
                    responseScope: myThis,
                    success: function(){
                        CQ.Ext.getCmp('cq.workflow.instances').reload();
                    },
                    failure: function(){
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not start workflow"));
                    },
                    buttons:CQ.Dialog.OKCANCEL
                };
                var startDialog = CQ.WCM.getDialog(startDialogConfig);
                startDialog.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Start Workflow'),
                text:CQ.I18n.getMessage('Starts a new workflow'),
                autoHide:true
            }
        });
        this.startAction.setDisabled(true);
        
        this.actions = [ this.newAction, 
                         this.deleteAction, 
                         this.editAction, 
                         this.startAction ];
        this.tbar = this.actions;
        
        this.bbar = new CQ.Ext.PagingToolbar({
            pageSize:this.pageSize,
            store:this.store,
            displayInfo:true,
            displayMsg:CQ.I18n.getMessage("Displaying entries {0} - {1} of {2}"),
            emptyMsg:CQ.I18n.getMessage("No entries to display")
        });
        
        CQ.Workflow.Console.ModelsPanel.superclass.constructor.call(this, config);
        this.store.load({params:{start:0, limit:this.pageSize}});
    },
    
    initComponent: function() {
        CQ.Workflow.Console.ModelsPanel.superclass.initComponent.call(this);
        
        this.addEvents({ editmodel:true });
    },
    
    fireOpenModelEvent: function() {
        var attributes = {
            title: this.getSelectionModel().getSelected().data.title,
            url:this.getSelectionModel().getSelected().id
        };
        this.fireEvent('editmodel', attributes);
    }
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

CQ.Workflow.Console.InstancesPanel = function(config) {
    this.construct.call(this, config);
};    

CQ.Ext.extend(CQ.Workflow.Console.InstancesPanel, CQ.Workflow.Console.GridPanel, {
    id:'cq.workflow.instances',
    
    title:CQ.I18n.getMessage('Instances'),
    tabTip:CQ.I18n.getMessage('Lists active workflow instances'),
    
    listeners: {
        rowcontextmenu: function(grid, index, e) {
            if (!this.contextMenu) {
                this.contextMenu = new CQ.Ext.menu.Menu({
                    items: this.actions
                });
            }
            var xy = e.getXY();

            this.checkSelectionForSuspendResumeRestart(grid.getSelectionModel());
            this.contextMenu.showAt(xy);
            e.stopEvent();
        }
    },
    
    view: new CQ.Ext.grid.GroupingView({
        forceFit:true,
        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "'+CQ.I18n.getMessage("Items")+'" : "'+CQ.I18n.getMessage("Item")+'"]})'
    }),

    checkSelectionForSuspendResumeRestart: function(selectionModel) {
        if (selectionModel.hasSelection()) {
            var allowSuspend = true;
            var allowResume = true;
            var allowRestart = true;

            var selections = selectionModel.getSelections();
            for (var selectionIndex = 0; selectionIndex < selections.length; selectionIndex++) {
                if (selections[selectionIndex]
                    && selections[selectionIndex].data
                    && selections[selectionIndex].data.state) {
                    if ("RUNNING" !== selections[selectionIndex].data.state) {
                        allowSuspend = false;
                        if (!allowResume && !allowRestart) {
                            break;
                        }
                    }
                    if ("SUSPENDED" !== selections[selectionIndex].data.state) {
                        allowResume = false;
                        if (!allowSuspend && !allowRestart) {
                            break;
                        }
                    }
                    if ("STALE" !== selections[selectionIndex].data.state) {
                        allowRestart = false;
                        if (!allowResume && !allowSuspend) {
                            break;
                        }
                    }
                }
            }
            this.suspendAction.setDisabled(!allowSuspend);
            this.resumeAction.setDisabled(!allowResume);
            this.restartAction.setDisabled(!allowRestart);
        } else {
            this.suspendAction.setDisabled(true);
            this.resumeAction.setDisabled(true);
            this.restartAction.setDisabled(true);
        }

    },

    construct: function(config) {
        var myThis = this;
        this.resourcePath = config.resourcePath;
        
        // store
        this.store = new CQ.Ext.data.GroupingStore({
            proxy: new CQ.Ext.data.HttpProxy({ 
                url:this.resourcePath + "/instances.json",
                method:"GET",

            }),
            listeners: {
                exception: function(obj, action, data, it, response) {
                    CQ.shared.HTTP.handleForbidden(response);
                }
            },
            autoLoad:false,
            reader: new CQ.Ext.data.JsonReader({
                root: 'workflows',
                totalProperty: 'results',
                id: 'item',
                fields: [
                    'state',
                    'initiator',
                    'startTime',
                    'model',
                    'modelVersion',
                    'payload',
                    'comment',
                    'title',
                    CQ.shared.XSS.getXSSPropertyName('title')
                ]
            })
        });
        this.store.setDefaultSort('startTime', 'DESC');
        
        // column model
        this.cm = new CQ.Ext.grid.ColumnModel([new CQ.Ext.grid.RowNumberer(),
            {
                header: CQ.I18n.getMessage("Status"),
                dataIndex: 'state'
            },{
                header: CQ.I18n.getMessage("Initiator"),
                dataIndex: 'initiator'
            },{
                header: CQ.I18n.getMessage("Start Time"),
                dataIndex: 'startTime',
                renderer: function(v, params, record) {
                    return myThis.formatDate(v);
                }
            },{
                header: CQ.I18n.getMessage("Workflow Model"),
                dataIndex: 'model'
            },{
                header: CQ.I18n.getMessage("Model Version"),
                dataIndex: 'modelVersion'
            },{
                header: CQ.I18n.getMessage("Payload"),
                dataIndex: 'payload',
                renderer:myThis.renderPayload
            },{
                header: CQ.I18n.getMessage("Comment"),
                dataIndex: 'comment'
            },{
                header: CQ.I18n.getMessage("Workflow Title"),
                dataIndex: 'title',
                renderer: function(val, meta, rec) {
                    return CQ.shared.XSS.xssPropertyRenderer(val, meta, rec, this);
                }
            }
        ]);
        this.cm.defaultSortable = true;

        // selection model
        this.sm = new CQ.Ext.grid.RowSelectionModel({
            singleSelect:false,
            listeners: {
                selectionchange: function(selectionModel) {
                    myThis.terminateAction.setDisabled(!selectionModel.hasSelection());
                    myThis.openHistoryAction.setDisabled(!selectionModel.hasSelection());
                    myThis.renameWorkflowTitleAction.setDisabled(!selectionModel.hasSelection());
                    myThis.checkSelectionForSuspendResumeRestart(selectionModel);
                }
            }
        });
        
        // actions
        this.terminateAction = new CQ.Ext.Action({
            cls:'cq.workflow.instances.terminate',
            text:CQ.I18n.getMessage('Terminate'),
            handler: function() {
                var terminateDialogConfig = {
                    xtype: 'dialog',
                    title:CQ.I18n.getMessage('Terminate Workflow'),
                    params: {
                        "_charset_":"utf-8"
                    },
                    items: {
                        xtype:'panel',
                        items:[
                            {
                                xtype: 'textarea',
                                name:'terminateComment',
                                fieldLabel:CQ.I18n.getMessage('Comment'),
                                id:"cq.workflow.instances.terminateComment"
                            },{
                                xtype: 'textfield',
                                name:'state',
                                hidden:true,
                                value:'ABORTED'
                            }
                        ]
                    },
                    responseScope: myThis,
                    buttons:[{
                        "text": CQ.I18n.getMessage("OK"),
                        //"disabled": true,
                        "handler": function() {
                                this.hide();
                                var success = true;
                                var selections = myThis.getSelectionModel().getSelections();
                                for (var i=0; i<selections.length; i++) {
                                    var selection = selections[i];
                                    CQ.HTTP.post(
                                        selection.id,
                                        function(options, success, response) {
                                            if (success) {
                                                success &= true;
                                            } else {
                                                success = false;
                                            }
                                        },
                                        {
                                            "state":"ABORTED",
                                            "_charset_":"utf-8",
                                            "terminateComment": CQ.Ext.getCmp("cq.workflow.instances.terminateComment").getValue()
                                        }
                                    );
                                }
                                if (success) {
                                        myThis.getStore().reload({
                                            callback: function() {
                                                myThis.checkSelectionForSuspendResumeRestart(myThis.getSelectionModel());
                                            }
                                        });
                                        CQ.Ext.getCmp('cq.workflow.archive').reload();
                                    } else {
                                        CQ.Ext.Msg.alert(
                                            CQ.I18n.getMessage("Error"),
                                            CQ.I18n.getMessage("Could not terminate workflow"));
                                    }
                            }
                        },
                        CQ.Dialog.CANCEL
                    ]
                };
                var terminateDialog = CQ.WCM.getDialog(terminateDialogConfig, "cq.workflow.instances.terminate.dialog");
                terminateDialog.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Terminate Workflow'),
                text:CQ.I18n.getMessage('Terminates the selected workflow instance'),
                autoHide:true
            }
        });
        this.terminateAction.setDisabled(true);

        this.suspendAction = new CQ.Ext.Action({
            cls:'cq.workflow.instances.suspend',
            text:CQ.I18n.getMessage('Suspend'),
            handler: function() {
                var selectionModel = myThis.getSelectionModel();
                if (selectionModel.hasSelection()) {
                    var selections = selectionModel.getSelections();
                    for (var selectionIndex = 0; selectionIndex < selections.length; selectionIndex++) {
                        var con = new CQ.Ext.data.Connection();
                        con.request({
                            scope:this,
                            url: selections[selectionIndex].id,
                            params: {
                                state:'SUSPENDED',
                                "_charset_":"utf-8"
                            },
                            success:function(response, options) {

                                myThis.getStore().reload({
                                    callback: function() {
                                        myThis.checkSelectionForSuspendResumeRestart(myThis.getSelectionModel());
                                    }
                                });
                            },
                            failure:function(response, options) {
                                CQ.Ext.Msg.alert(
                                    CQ.I18n.getMessage("Error"),
                                    CQ.I18n.getMessage("Could not suspend workflow"));
                            }
                        });
                    }
                }
            },
            tooltip: {
                title:CQ.I18n.getMessage('Suspend Workflow Instance'),
                text:CQ.I18n.getMessage('Suspends the selected workflow instance'),
                autoHide:true
            }
        });
        this.suspendAction.setDisabled(true);

        this.resumeAction = new CQ.Ext.Action({
            cls:'cq.workflow.instances.resume',
            text:CQ.I18n.getMessage('Resume'),
            handler: function() {
                var selectionModel = myThis.getSelectionModel();
                if (selectionModel.hasSelection()) {
                    var selections = selectionModel.getSelections();
                    for (var selectionIndex = 0; selectionIndex < selections.length; selectionIndex++) {
                        var con = new CQ.Ext.data.Connection();
                        con.request({
                            scope:this,
                            url: selections[selectionIndex].id,
                            params: {
                                state:'RUNNING',
                                "_charset_":"utf-8"
                            },
                            success:function(response, options) {
                                myThis.getStore().reload({
                                    callback: function() {
                                        myThis.checkSelectionForSuspendResumeRestart(myThis.getSelectionModel());
                                    }
                                });
                            },
                            failure:function(response, options) {
                                CQ.Ext.Msg.alert(
                                    CQ.I18n.getMessage("Error"),
                                    CQ.I18n.getMessage("Could not resume workflow"));
                            }
                        });
                    }
                }
            },
            tooltip: {
                title:CQ.I18n.getMessage('Resume suspended Workflow Instance'),
                text:CQ.I18n.getMessage('Resumes the selected workflow instance'),
                autoHide:true
            }
        });
        this.resumeAction.setDisabled(true);
        
        this.openHistoryAction = new CQ.Ext.Action({
            cls:'cq.workflow.instances.openHistory',
            text:CQ.I18n.getMessage('Open History'),
            handler: function() {
                var grid = new CQ.Ext.grid.GridPanel({
                    store: new CQ.Ext.data.GroupingStore({
                        proxy: new CQ.Ext.data.HttpProxy({ 
                            url:myThis.resourcePath + "/history.json?workflow=" + myThis.getSelectionModel().getSelected().id 
                        }),
                        listeners: {
                            exception: function(obj, action, data, it, response) {
                                CQ.shared.HTTP.handleForbidden(response);
                            }
                        },
                        autoLoad:true,
                        reader: new CQ.Ext.data.JsonReader({
                            root: 'historyItems',
                            totalProperty: 'results',
                            id: 'item',
                            fields: [
                                'status',
                                'process',
                                'user',
                                'startTime',
                                'endTime',
                                'action',
                                'comment'
                            ]
                        })
                    }),
                    cm:new CQ.Ext.grid.ColumnModel([
                        new CQ.Ext.grid.RowNumberer(),
                        {
                            header:CQ.I18n.getMessage("Status"),
                            dataIndex: 'status'
                        },{
                            header:CQ.I18n.getMessage("Title"),
                            dataIndex: 'process'
                        },{
                            header:CQ.I18n.getMessage("User"),
                            dataIndex: 'user'
                        },{
                            header:CQ.I18n.getMessage("Start Time"),
                            dataIndex: 'startTime',
                            renderer: function(v, params, record) {
                                return myThis.formatDate(v);
                            }
                        },{
                            header:CQ.I18n.getMessage("End Time"),
                            dataIndex: 'endTime',
                            renderer: function(v, params, record) {
                                if (v) {
                                    return myThis.formatDate(v);
                                }
                                return "";
                            }
                        },{
                            header:CQ.I18n.getMessage("Action"),
                            dataIndex: 'action'
                        },{
                            header:CQ.I18n.getMessage("Comment"),
                            dataIndex: 'comment'
                        }
                    ]),
                    viewConfig: {
                        forceFit: true,
                        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? '+CQ.I18n.getMessage("Items")+' : '+CQ.I18n.getMessage("Item")+']})'
                    },
                    sm: new CQ.Ext.grid.RowSelectionModel({singleSelect:true})
                });
                win = new CQ.Ext.Window({
                    title:CQ.I18n.getMessage('Workflow Instance History'),
                    width:800,
                    height:400,
                    autoScroll:true,
                    items: grid,
                    layout:'fit',
                    y:200
                }).show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Open workflow history'),
                text:CQ.I18n.getMessage('Opens the workflow history dialog'),
                autoHide:true
            }
        });
        this.openHistoryAction.setDisabled(true);

        this.renameWorkflowTitleAction = new CQ.Ext.Action({
            cls:'cq.workflow.instances.rename',
            text:CQ.I18n.getMessage('Rename Workflow Title'),
            handler: function() {
                var newDialogConfig = {
                    xtype: 'dialog',
                    title:CQ.I18n.getMessage('Rename Workflow Title'),
                    params: { "_charset_":"utf-8", "action":"UPDATE" },
                    items: {
                        xtype:'panel',
                        items:[
                            {
                                xtype: 'textfield',
                                name:'workflowTitle',
                                fieldLabel:CQ.I18n.getMessage('Workflow Title'),
                                value: myThis.getSelectionModel().getSelected().data.title
                            }
                        ]
                    },
                    responseScope: myThis,
                    success: function(){ myThis.reload(); },
                    failure: function(){
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not change workflow title."));
                    },
                    buttons:CQ.Dialog.OKCANCEL
                };
                var newDialog = CQ.WCM.getDialog(newDialogConfig);
                newDialog.form.url = myThis.getSelectionModel().getSelected().id;
                newDialog.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Rename workflow title'),
                text:CQ.I18n.getMessage('Renames the workflow title'),
                autoHide:true
            }
        });
        this.renameWorkflowTitleAction.setDisabled(true);

        this.restartAction = new CQ.Ext.Action({
            cls:'cq.workflow.instances.restart',
            text:CQ.I18n.getMessage('Restart'),
            handler: function() {
                var success = true;
                var selections = myThis.getSelectionModel().getSelections();
                for (var i=0; i<selections.length; i++) {
                    var selection = selections[i];
                    CQ.HTTP.post(
                        "/libs/cq/workflow/restarter",
                        function(options, success, response) {
                            if (success) {
                                success &= true;
                            } else {
                                success = false;
                            }
                        },
                        {
                            "state":"ABORTED",
                            "_charset_":"utf-8",
                            "path":selection.id
                        }
                    );
                }
                if (success) {
                    myThis.getStore().reload({
                        callback: function() {
                            myThis.checkSelectionForSuspendResumeRestart(myThis.getSelectionModel());
                        }
                    });
                } else {
                    CQ.Ext.Msg.alert(
                        CQ.I18n.getMessage("Error"),
                        CQ.I18n.getMessage("Could not restart workflow."));
                }
            },
            tooltip: {
                title:CQ.I18n.getMessage('Restart Workflow'),
                text:CQ.I18n.getMessage('Restarts the selected workflow instance'),
                autoHide:true
            }
        });
        this.restartAction.setDisabled(true);
        
        this.actions = [ this.terminateAction, 
                         this.suspendAction, 
                         this.resumeAction,
                         this.restartAction, "-", 
                         this.openHistoryAction,
                         this.renameWorkflowTitleAction ];
        this.tbar = this.actions;
        
        this.bbar = new CQ.Ext.PagingToolbar({
            pageSize:this.pageSize,
            store:this.store,
            displayInfo:true,
            displayMsg:CQ.I18n.getMessage("Displaying entries {0} - {1} of {2}"),
            emptyMsg:CQ.I18n.getMessage("No entries to display")
        });
    
        CQ.Workflow.Console.InstancesPanel.superclass.constructor.call(this, config);
        this.store.load({params:{start:0, limit:this.pageSize}});
    }
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

CQ.Workflow.Console.FailuresPanel = function(config) {
    this.construct.call(this, config);
};    

CQ.Ext.extend(CQ.Workflow.Console.FailuresPanel, CQ.Workflow.Console.GridPanel, {
    id:'cq.workflow.failures',
    
    title:CQ.I18n.getMessage('Failures'),
    tabTip:CQ.I18n.getMessage('Lists workflow failure notifications'),
    
    listeners: {
        rowcontextmenu: function(grid, index, e) {
            if (!this.contextMenu) {
                this.contextMenu = new CQ.Ext.menu.Menu({
                    items: this.actions
                });
            }
            var xy = e.getXY();
            this.contextMenu.showAt(xy);
            e.stopEvent();
        }
    },
    
    view: new CQ.Ext.grid.GroupingView({
        forceFit:true,
        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "'+CQ.I18n.getMessage("Items")+'" : "'+CQ.I18n.getMessage("Item")+'"]})'
    }),
    
    construct: function(config) {
        var myThis = this;
        this.resourcePath = config.resourcePath;
        
        // store
        this.store = new CQ.Ext.data.GroupingStore({
            proxy: new CQ.Ext.data.HttpProxy({ 
                url:this.resourcePath + "/failures.json",
                method:"GET"
            }),
            listeners: {
                exception: function(obj, action, data, it, response) {
                    CQ.shared.HTTP.handleForbidden(response);
                }
            },
            autoLoad:false,
            reader: new CQ.Ext.data.JsonReader({
                root: 'workflows',
                totalProperty: 'results',
                id: 'item',
                fields: [
                    'state',
                    'initiator',
                    'startTime',
                    'model',
                    'modelVersion',
                    'payload',
                    'comment',
                    'title',
                    'failureInfo.message',
                    CQ.shared.XSS.getXSSPropertyName('title')
                ]
            })
        });
        this.store.setDefaultSort('startTime', 'DESC');
        
        // column model
        this.cm = new CQ.Ext.grid.ColumnModel([new CQ.Ext.grid.RowNumberer(),
            {
                header: CQ.I18n.getMessage("Status"),
                dataIndex: 'state'
            },{
                header: CQ.I18n.getMessage("Message"),
                dataIndex: 'failureInfo.message'
            },{
                header: CQ.I18n.getMessage("Initiator"),
                dataIndex: 'initiator'
            },{
                header: CQ.I18n.getMessage("Start Time"),
                dataIndex: 'startTime',
                renderer: function(v, params, record) {
                    return myThis.formatDate(v);
                }
            },{
                header: CQ.I18n.getMessage("Workflow Model"),
                dataIndex: 'model'
            },{
                header: CQ.I18n.getMessage("Model Version"),
                dataIndex: 'modelVersion'
            },{
                header: CQ.I18n.getMessage("Payload"),
                dataIndex: 'payload',
                renderer:myThis.renderPayload
            },{
                header: CQ.I18n.getMessage("Comment"),
                dataIndex: 'comment'
            },{
                header: CQ.I18n.getMessage("Workflow Title"),
                dataIndex: 'title',
                renderer: function(val, meta, rec) {
                    return CQ.shared.XSS.xssPropertyRenderer(val, meta, rec, this);
                }
            }
        ]);
        this.cm.defaultSortable = true;
        
        // selection model
        this.sm = new CQ.Ext.grid.RowSelectionModel({
            singleSelect:false,
            listeners: {
                selectionchange: function(selectionModel) {
                    myThis.failuresDetailsAction.setDisabled(!selectionModel.hasSelection());
                    myThis.terminateAction.setDisabled(!selectionModel.hasSelection());
                    myThis.terminateAndRestartAction.setDisabled(!selectionModel.hasSelection());
                    myThis.openHistoryAction.setDisabled(!selectionModel.hasSelection());
                    myThis.retryItemAction.setDisabled(!selectionModel.hasSelection());
                    myThis.renameWorkflowTitleAction.setDisabled(!selectionModel.hasSelection());                   
                }
            }
        });
        
        // actions
        this.failuresDetailsAction = new CQ.Ext.Action({
            cls:'cq.workflow.failures.showdetails',
            text:CQ.I18n.getMessage('Failure Details'),
            handler: function() {
                var selections = myThis.getSelectionModel().getSelections();
                if (selections && selections.length > 0) {
                    var failureInfo = {
                        message: selections[0].json.failureInfo.message,
                        stepTitle: selections[0].json.failureInfo.nodeTitle,
                        stack: selections[0].json.failureInfo.stack
                    };

                    var dialog = new CQ.workflow.FailureInfoDialog({}, failureInfo);
                    dialog.show();
                }
            },
            tooltip: {
                title:CQ.I18n.getMessage('Show failure details'),
                text:CQ.I18n.getMessage('Show failure details'),
                autoHide:true
        }
        });
        this.failuresDetailsAction.setDisabled(true);

        this.terminateAction = new CQ.Ext.Action({
            cls:'cq.workflow.failures.terminate',
            text:CQ.I18n.getMessage('Terminate Workflow'),
            handler: function() {
                var terminateDialogConfig = {
                    xtype: 'dialog',
                    title:CQ.I18n.getMessage('Terminate Workflow'),
                    params: {
                        "_charset_":"utf-8"
                    },
                    items: {
                        xtype:'panel',
                        items:[
                            {
                                xtype: 'textarea',
                                name:'terminateComment',
                                fieldLabel:CQ.I18n.getMessage('Comment'),
                                id:"cq.workflow.failures.terminateComment"
                            },{
                                xtype: 'textfield',
                                name:'state',
                                hidden:true,
                                value:'ABORTED'
                            }
                        ]
                    },
                    responseScope: myThis,
                    buttons:[{
                        "text": CQ.I18n.getMessage("OK"),
                        //"disabled": true,
                        "handler": function() {
                                this.hide();
                                var success = true;
                                var selections = myThis.getSelectionModel().getSelections();
                                for (var i=0; i<selections.length; i++) {
                                    var selection = selections[i];
                                    CQ.HTTP.post(
                                        selection.id,
                                        function(options, success, response) {
                                            if (success) {
                                                success &= true;
                                            } else {
                                                success = false;
                                            }
                                        },
                                        {
                                            "state":"ABORTED",
                                            "_charset_":"utf-8",
                                            "terminateComment": CQ.Ext.getCmp("cq.workflow.failures.terminateComment").getValue()
                                        }
                                    );
                                }
                                if (success) {
                                        myThis.reload();
                                        CQ.Ext.getCmp('cq.workflow.archive').reload();
                                    } else {
                                        CQ.Ext.Msg.alert(
                                            CQ.I18n.getMessage("Error"),
                                            CQ.I18n.getMessage("Could not terminate workflow"));
                                    }
                            }
                        },
                        CQ.Dialog.CANCEL
                    ]
                };
                var terminateDialog = CQ.WCM.getDialog(terminateDialogConfig, "cq.workflow.failures.terminate.dialog");
                terminateDialog.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Terminate Workflow'),
                text:CQ.I18n.getMessage('Terminates the selected workflow instance'),
                autoHide:true
            }
        });
        this.terminateAction.setDisabled(true);

        this.terminateAndRestartAction = new CQ.Ext.Action({
            cls:'cq.workflow.failures.terminate',
            text:CQ.I18n.getMessage('Terminate and Start New Workflow'),
            handler: function() {
                var terminateDialogConfig = {
                    xtype: 'dialog',
                    title:CQ.I18n.getMessage('Terminate and start new workflow'),
                    params: {
                        "_charset_":"utf-8"
                    },
                    items: {
                        xtype:'panel',
                        items:[
                            {
                                xtype: 'textarea',
                                name:'terminateComment',
                                fieldLabel:CQ.I18n.getMessage('Comment'),
                                id:"cq.workflow.failures.terminateComment"
                            },{
                                xtype: 'textfield',
                                name:'state',
                                hidden:true,
                                value:'ABORTED'
                            }
                        ]
                    },
                    responseScope: myThis,
                    buttons:[{
                        "text": CQ.I18n.getMessage("OK"),
                        //"disabled": true,
                        "handler": function() {
                            this.hide();
                            var selections = myThis.getSelectionModel().getSelections();
                            var IDs = [];
                            for (var i=0; i<selections.length; i++) {
                                var selection = selections[i];
                                IDs.push(selection.id);
                            }
                            var toPost = { IDs: IDs };

                            var url = "/libs/cq/workflow/failures";

                            CQ.Ext.Ajax.request({
                                "url": url,
                                "method": "POST",
                                "jsonData": JSON.stringify(toPost),
                                "params": { 'command': 'TerminateAndRestart' },
                                "success": function(response, options) {
                                    myThis.reload();
                                },
                                "failure": function(response, options) {
                                    CQ.Ext.Msg.alert(
                                    CQ.I18n.getMessage("Error"),
                                    CQ.I18n.getMessage("Could not terminate and restart workflow."));
                                }
                            });
                        }
                    },
                        CQ.Dialog.CANCEL
                    ]
                };
                var terminateDialog = CQ.WCM.getDialog(terminateDialogConfig, "cq.workflow.failures.terminate.dialog");
                terminateDialog.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Terminate and Start New Workflow'),
                text:CQ.I18n.getMessage('Terminates the selected workflow and starts a new workflow instance on the same payload'),
                autoHide:true
            }
        });
        this.terminateAndRestartAction.setDisabled(true);

        this.retryItemAction = new CQ.Ext.Action({
            cls:'cq.workflow.failures.terminate',
            text:CQ.I18n.getMessage('Retry Step'),
            handler: function() {
                var selections = myThis.getSelectionModel().getSelections();
                var IDs = [];
                for (var i=0; i<selections.length; i++) {
                    var selection = selections[i];
                    IDs.push(selection.json.itemid);
                }
                var toPost = { IDs: IDs };

                var url = "/libs/cq/workflow/failures";

                CQ.Ext.Ajax.request({
                    "url": url,
                    "method": "POST",
                    "jsonData": JSON.stringify(toPost),
                    "params": { 'command': 'RetryItem' },
                    "success": function(response, options) {
                        myThis.reload();
                    },
                    "failure": function(response, options) {
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not retry step."));
                    }
                });
            },
            tooltip: {
                title:CQ.I18n.getMessage('Retry failed step'),
                text:CQ.I18n.getMessage('Retry the step associated with this failure'),
                autoHide:true
            }
        });
        this.retryItemAction.setDisabled(true);

        this.openHistoryAction = new CQ.Ext.Action({
            cls:'cq.workflow.failures.openHistory',
            text:CQ.I18n.getMessage('Open History'),
            handler: function() {
                var grid = new CQ.Ext.grid.GridPanel({
                    store: new CQ.Ext.data.GroupingStore({
                        proxy: new CQ.Ext.data.HttpProxy({ 
                            url:myThis.resourcePath + "/history.json?workflow=" + myThis.getSelectionModel().getSelected().id 
                        }),
                        listeners: {
                            exception: function(obj, action, data, it, response) {
                                CQ.shared.HTTP.handleForbidden(response);
                            }
                        },
                        autoLoad:true,
                        reader: new CQ.Ext.data.JsonReader({
                            root: 'historyItems',
                            totalProperty: 'results',
                            id: 'item',
                            fields: [
                                'status',
                                'process',
                                'user',
                                'startTime',
                                'endTime',
                                'action',
                                'comment'
                            ]
                        })
                    }),
                    cm:new CQ.Ext.grid.ColumnModel([
                        new CQ.Ext.grid.RowNumberer(),
                        {
                            header:CQ.I18n.getMessage("Status"),
                            dataIndex: 'status'
                        },{
                            header:CQ.I18n.getMessage("Title"),
                            dataIndex: 'process'
                        },{
                            header:CQ.I18n.getMessage("User"),
                            dataIndex: 'user'
                        },{
                            header:CQ.I18n.getMessage("Start Time"),
                            dataIndex: 'startTime',
                            renderer: function(v, params, record) {
                                return myThis.formatDate(v);
                            }
                            
                        },{
                            header:CQ.I18n.getMessage("End Time"),
                            dataIndex: 'endTime',
                            renderer: function(v, params, record) {
                                if (v) {
                                    return myThis.formatDate(v);
                                }
                                return "";
                            }
                        },{
                            header:CQ.I18n.getMessage("Action"),
                            dataIndex: 'action'
                        },{
                            header:CQ.I18n.getMessage("Comment"),
                            dataIndex: 'comment'
                        }
                    ]),
                    viewConfig: {
                        forceFit: true,
                        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? '+CQ.I18n.getMessage("Items")+' : '+CQ.I18n.getMessage("Item")+']})'
                    },
                    sm: new CQ.Ext.grid.RowSelectionModel({singleSelect:true})
                });
                win = new CQ.Ext.Window({
                    title:CQ.I18n.getMessage('Workflow Instance History'),
                    width:800,
                    height:400,
                    autoScroll:true,
                    items: grid,
                    layout:'fit',
                    y:200
                }).show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Open workflow history'),
                text:CQ.I18n.getMessage('Opens the workflow history dialog'),
                autoHide:true
            }
        });
        this.openHistoryAction.setDisabled(true);

        this.renameWorkflowTitleAction = new CQ.Ext.Action({
            cls:'cq.workflow.failures.rename',
            text:CQ.I18n.getMessage('Rename Workflow Title'),
            handler: function() {
                var newDialogConfig = {
                    xtype: 'dialog',
                    title:CQ.I18n.getMessage('Rename Workflow Title'),
                    params: { "_charset_":"utf-8", "action":"UPDATE" },
                    items: {
                        xtype:'panel',
                        items:[
                            {
                                xtype: 'textfield',
                                name:'workflowTitle',
                                fieldLabel:CQ.I18n.getMessage('Workflow Title'),
                                value: myThis.getSelectionModel().getSelected().data.title
                            }
                        ]
                    },
                    responseScope: myThis,
                    success: function(){ myThis.reload(); },
                    failure: function(){
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not change workflow title."));
                    },
                    buttons:CQ.Dialog.OKCANCEL
                };
                var newDialog = CQ.WCM.getDialog(newDialogConfig);
                newDialog.form.url = myThis.getSelectionModel().getSelected().id;
                newDialog.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Rename workflow title'),
                text:CQ.I18n.getMessage('Renames the workflow title'),
                autoHide:true
            }
        });
        this.renameWorkflowTitleAction.setDisabled(true);

        this.actions = [ this.failuresDetailsAction,
                         "-",
                         this.retryItemAction,
                         "-",
                         this.terminateAction,
                         this.terminateAndRestartAction,
                         "-",
                         this.openHistoryAction ];
        this.tbar = this.actions;
        
        this.bbar = new CQ.Ext.PagingToolbar({
            pageSize:this.pageSize,
            store:this.store,
            displayInfo:true,
            displayMsg:CQ.I18n.getMessage("Displaying entries {0} - {1} of {2}"),
            emptyMsg:CQ.I18n.getMessage("No entries to display")
        });
    
        CQ.Workflow.Console.FailuresPanel.superclass.constructor.call(this, config);
        this.store.load({params:{start:0, limit:this.pageSize}});
    }
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

CQ.Workflow.Console.ArchivePanel = function(config) {
    this.construct.call(this, config);
};

CQ.Ext.extend(CQ.Workflow.Console.ArchivePanel, CQ.Workflow.Console.GridPanel, {
    id:'cq.workflow.archive',
    
    title:CQ.I18n.getMessage('Archive'),
    tabTip:CQ.I18n.getMessage('Lists completed/terminated workflow instances'),
    
    listeners: {
        rowcontextmenu: function(grid, index, e) {
            if (!this.contextMenu) {
                this.contextMenu = new CQ.Ext.menu.Menu({
                    items: this.actions
                });
            }
            var xy = e.getXY();
            this.contextMenu.showAt(xy);
            e.stopEvent();
        }
    },
    
    view: new CQ.Ext.grid.GroupingView({
        forceFit:true,
        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "' + CQ.I18n.getMessage("Items") + '" : "' + CQ.I18n.getMessage("Item") + '"]})'
    }),
    
    construct: function(config) {
        var myThis = this;
        this.resourcePath = config.resourcePath;
        
        // store
        this.store = new CQ.Ext.data.GroupingStore({
            proxy: new CQ.Ext.data.HttpProxy({ 
                url:this.resourcePath + "/archive.json",
                method:"GET"
            }),
            listeners: {
                exception: function(obj, action, data, it, response) {
                    CQ.shared.HTTP.handleForbidden(response);
                }
            },
            autoLoad:false,
            reader: new CQ.Ext.data.JsonReader({
                root: 'workflows',
                totalProperty: 'results',
                id: 'item',
                fields: [
                    'state',
                    'initiator',
                    'startTime',
                    'endTime',
                    'model',
                    'modelVersion',
                    'payload',
                    'comment',
                    'title'
                ]
            })
        });
        this.store.setDefaultSort('endTime', 'DESC');
    
        // selection model
        this.sm = new CQ.Ext.grid.RowSelectionModel({
            singleSelect:true,
            listeners: {
                selectionchange: function(selectionModel) {
                    myThis.openHistoryAction.setDisabled(!selectionModel.hasSelection());
                }
            }
        });
        
        // column model
        this.cm = new CQ.Ext.grid.ColumnModel([
            new CQ.Ext.grid.RowNumberer(),
            {
                header: CQ.I18n.getMessage("Status"),
                dataIndex: 'state',
                width:100
            },{
                header: CQ.I18n.getMessage("Initiator"),
                dataIndex: 'initiator',
                width:100        
            },{
                header: CQ.I18n.getMessage("Start Time"),
                dataIndex: 'startTime',
                width:100,
                renderer: function(v, params, record) {
                    return myThis.formatDate(v);
                }
            },{
                header: CQ.I18n.getMessage("End Time"),
                dataIndex: 'endTime',
                width:100,
                renderer: function(v, params, record) {
                    return myThis.formatDate(v);
                }
            },{
                header: CQ.I18n.getMessage("Workflow Model"),
                dataIndex: 'model',
                width:100
            },{
                header: CQ.I18n.getMessage("Model Version"),
                dataIndex: 'modelVersion',
                width:100
            },{
                header: CQ.I18n.getMessage("Payload"),
                dataIndex: 'payload',
                width:100,
                renderer:myThis.renderPayload
            },{
                header: CQ.I18n.getMessage("Comment"),
                dataIndex: 'comment',
                width:100
            },{
                header: CQ.I18n.getMessage("Workflow Title"),
                dataIndex: 'title'
            }
        ]);
        this.cm.defaultSortable = true;
        
        // actions
        this.openHistoryAction = new CQ.Ext.Action({
            cls:'cq.workflow.archive.openHistory',
            text: CQ.I18n.getMessage('Open History'),
            handler: function() {
                var grid = new CQ.Ext.grid.GridPanel({
                    store: new CQ.Ext.data.GroupingStore({
                        proxy: new CQ.Ext.data.HttpProxy({ 
                            url:myThis.resourcePath + "/history.json?workflow=" + myThis.getSelectionModel().getSelected().id 
                        }),
                        listeners: {
                            exception: function(obj, action, data, it, response) {
                                CQ.shared.HTTP.handleForbidden(response);
                            }
                        },
                        autoLoad:true,
                        reader: new CQ.Ext.data.JsonReader({
                            root: 'historyItems',
                            totalProperty: 'results',
                            id: 'item',
                            fields: [
                                'status',
                                'process',
                                'user',
                                'startTime',
                                'endTime',
                                'action',
                                'comment'
                            ]
                        })
                    }),
                    cm:new CQ.Ext.grid.ColumnModel([
                        new CQ.Ext.grid.RowNumberer(),
                        {
                            header: CQ.I18n.getMessage("Status"),
                            dataIndex: 'status'
                        },{
                            header: CQ.I18n.getMessage("Title"),
                            dataIndex: 'process'
                        },{
                            header: CQ.I18n.getMessage("User"),
                            dataIndex: 'user'
                        },{
                            header: CQ.I18n.getMessage("Start Time"),
                            dataIndex: 'startTime',
                            renderer: function(v, params, record) {
                                return myThis.formatDate(v);
                            }
                        },{
                            header: CQ.I18n.getMessage("End Time"),
                            dataIndex: 'endTime',
                            renderer: function(v, params, record) {
                                return myThis.formatDate(v);
                            }
                        },{
                            header: CQ.I18n.getMessage("Action"),
                            dataIndex: 'action'
                        },{
                            header: CQ.I18n.getMessage("Comment"),
                            dataIndex: 'comment'
                        }
                    ]),
                    viewConfig: {
                        forceFit: true,
                        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? '+CQ.I18n.getMessage("Items")+' : '+CQ.I18n.getMessage("Item")+']})'
                    },
                    sm: new CQ.Ext.grid.RowSelectionModel({singleSelect:true})
                });
                win = new CQ.Ext.Window({
                    title:CQ.I18n.getMessage('Workflow Instance History'),
                    width:800,
                    height:400,
                    autoScroll:true,
                    items: grid,
                    layout:'fit',
                    y:200
                }).show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Open workflow history'),
                text:CQ.I18n.getMessage('Opens the workflow history dialog'),
                autoHide:true
            }
        });
        this.openHistoryAction.setDisabled(true);
        
        this.actions = [ this.openHistoryAction ];
        this.tbar = this.actions;
        
        this.bbar = new CQ.Ext.PagingToolbar({
            pageSize:this.pageSize,
            store:this.store,
            displayInfo:true,
            displayMsg:CQ.I18n.getMessage("Displaying entries {0} - {1} of {2}"),
            emptyMsg:CQ.I18n.getMessage("No entries to display")
        });
        
        CQ.Workflow.Console.ArchivePanel.superclass.constructor.call(this, config);
        this.store.load({params:{start:0, limit:this.pageSize}});
    }
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

CQ.Workflow.Console.LauncherPanel = function(config) {
    this.construct.call(this, config);
};

CQ.Ext.extend(CQ.Workflow.Console.LauncherPanel, CQ.Workflow.Console.GridPanel, {
    id:'cq.workflow.launcher',

    validNodeRemovedNodeTypes: ["nt:folder", "nt:file", "sling:Folder", "cq:Page", "dam:Asset"],

    title:CQ.I18n.getMessage('Launcher'),
    tabTip:CQ.I18n.getMessage('Launch workflow triggered by content action(s)'),

    listeners: {
        rowcontextmenu: function(grid, index, e) {
            if (!this.contextMenu) {
                this.contextMenu = new CQ.Ext.menu.Menu({
                    items: this.actions
                });
            }
            var xy = e.getXY();
            this.contextMenu.showAt(xy);
            e.stopEvent();
        },
        rowdblclick: function(grid, index, e) {
            this.editAction.execute();
        }
    },

    view: new CQ.Ext.grid.GroupingView({
        forceFit:true,
        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "'+CQ.I18n.getMessage("Configurations")+'" : "'+CQ.I18n.getMessage("Configuration")+'"]})'
    }),

    construct: function(config) {
        var myThis = this;
        this.resourcePath = config.resourcePath;

        // store
        this.store = new CQ.Ext.data.GroupingStore({
            proxy: new CQ.Ext.data.HttpProxy({
                url:"/libs/cq/workflow/launcher.json",
                method:"GET"
            }),
            listeners: {
                exception: function(obj, action, data, it, response) {
                    CQ.shared.HTTP.handleForbidden(response);
                }
            },
            autoLoad:false,
            reader: new CQ.Ext.data.JsonReader({
                root: 'configs',
                totalProperty: 'results',
                id: 'id',
                fields: [
                    'eventType',
                    'nodetype',
                    'glob',
                    'whereClause',
                    'workflow',
                    'workflowTitle',
                    'description',
                    'enabled',
                    'exclude',
                    'runModes'
                ]
            })
        });
        this.store.setDefaultSort('glob', 'ASC');

        // column model
        this.cm = new CQ.Ext.grid.ColumnModel([
            new CQ.Ext.grid.RowNumberer(),
            {
                header: CQ.I18n.getMessage("Event Type"),
                dataIndex: 'eventType'
            },{
                header: CQ.I18n.getMessage("Nodetype"),
                dataIndex: 'nodetype'
            },{
                header: CQ.I18n.getMessage("Globbing"),
                dataIndex: 'glob'
            },{
                header: CQ.I18n.getMessage("Condition"),
                dataIndex: 'whereClause'
            },{
                header: CQ.I18n.getMessage("Workflow"),
                dataIndex: 'workflow',
                renderer: myThis.renderModelLink
            },{
                header: CQ.I18n.getMessage("Description"),
                dataIndex: 'description'
            },{
                header: CQ.I18n.getMessage("Enabled"),
                dataIndex: 'enabled'
            },{
                header: CQ.I18n.getMessage("Exclude"),
                dataIndex: 'exclude'
            },{
                header: CQ.I18n.getMessage("Run Modes"),
                dataIndex: 'runModes'
            }
        ]);
        this.cm.defaultSortable = true;

        // selection model
        this.sm = new CQ.Ext.grid.RowSelectionModel({
            singleSelect:true,
            listeners: {
                selectionchange: function(selectionModel) {
                    myThis.removeAction.setPath('/etc/workflow/launcher/config', true);
                    myThis.editAction.setPath('/etc/workflow/launcher/config', true);
                }
            }
        });

        // actions
        this.removeAction = new CQ.PrivilegedAction({
            cls:'cq.workflow.launcher.remove',
            text:CQ.I18n.getMessage('Remove'),
            privileges:['delete'],
            path:'/etc/workflow/launcher/config',
            conditions:'',
            handler: function() {
                var selection = myThis.getSelectionModel().getSelected();
                CQ.HTTP.post(
                    "/libs/cq/workflow/launcher",
                    function(options, success, response) {
                        if (success) {
                            myThis.reload();
                        }
                    },
                    { "delete":selection.id },
                    this
                );
            },
            tooltip: {
                title:CQ.I18n.getMessage('Remove configuration entry'),
                text:CQ.I18n.getMessage('Removes the selected launcher configuration entry'),
                autoHide:true
            }
        });

        this.addAction = new CQ.PrivilegedAction({
            cls:'cq.workflow.launcher.add',
            text:CQ.I18n.getMessage('Add...'),
            privileges:['create'],
            path:'/etc/workflow/launcher/config',
            conditions:'',
            handler: function() {

                var wfAutoAssignRuleDlg = {
                    "jcr:primaryType": "cq:Dialog",
                    "title":CQ.I18n.getMessage("Workflow Launcher Configuration"),
                    "formUrl":"/libs/cq/workflow/launcher",
                    "failure": function(){
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not add configuration entry."));
                    },
                    "params": {
                        "_charset_":"utf-8",
                        "add":"true"
                    },
                    "height":380,
                    "items": {
                        "jcr:primaryType": "cq:Panel",
                        "items": {
                            "jcr:primaryType": "cq:WidgetCollection",
                            "eventType": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Event Type"),
                                "displayField":"name",
                                "valueField":"evType",
                                "title":CQ.I18n.getMessage("Event Types"),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "editable":false,
                                "allowBlank":false,
                                "name":"eventType",
                                "hiddenName":"eventType",
                                "mode": 'local',
                                "store":
                                      new CQ.Ext.data.SimpleStore({
                                            fields: ['evType','name'],
                                            data: [
                                                [1,"Created"],
                                                [16,"Modified"],
                                                [2,"Removed"]
                                            ]
                                      }
                                    )
                            },
                            "nodetypes": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Nodetype"),
                                "displayField":"name",
                                "valueField":"value",
                                "title":CQ.I18n.getMessage("Available nodetypes"),
                                "fieldDescription": CQ.I18n.getMessage("For event type 'Removed' only the following node types are supported: nt:folder, nt:file, sling:Folder (folders without jcr:content sub-node), dam:Asset and cq:Page. For reliable detection, nodes must not reside under the repository root ('/') in this case."),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "lastQuery": "",
                                "clearFilterOnReset": false,
                                "editable":false,
                                "allowBlank":false,
                                "name":"nodetype",
                                "hiddenName":"nodetype",
                                "store":new CQ.Ext.data.Store({
                                    "proxy":new CQ.Ext.data.HttpProxy({
                                        "url":"/libs/cq/workflow/launcher.nodetypes.json",
                                        "method":"GET"
                                    }),
                                    listeners: {
                                        exception: function(obj, action, data, it, response) {
                                            CQ.shared.HTTP.handleForbidden(response);
                                        }
                                    },
                                    "reader":new CQ.Ext.data.JsonReader(
                                        {
                                            "totalProperty":"results",
                                            "root":"nodetypes"
                                        },
                                        [ {"name":"name"}, {"name":"value"} ]
                                    )
                                }),
                                "listeners": {
                                    "expand": myThis.filterNodetypes
                                }
                            },
                            "glob": {
                                "xtype":"pathfield",
                                "selectOnFocus":true,
                                "allowBlank":false,
                                "name":"glob",
                                "fieldLabel":CQ.I18n.getMessage("Path"),
                                "predicate":"nosystem"
                            },
                            "condition": {
                                "xtype":'textfield',
                                "name":'condition',
                                "fieldLabel":'Condition',
                                "allowBlank":true
                             },
                            "model": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Workflow"),
                                "displayField":"label",
                                "valueField":"wid",
                                "title":CQ.I18n.getMessage("Available Workflows"),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "editable":false,
                                "allowBlank":false,
                                "name":"workflow",
                                "hiddenName":"workflow",
                                "store":new CQ.Ext.data.Store({
                                    "proxy":new CQ.Ext.data.HttpProxy({
                                        "url":"/libs/cq/workflow/content/console/workflows.json",
                                        "method":"GET"
                                    }),
                                    listeners: {
                                        exception: function(obj, action, data, it, response) {
                                            CQ.shared.HTTP.handleForbidden(response);
                                        }
                                    },
                                    "reader":new CQ.Ext.data.JsonReader(
                                        {
                                            "totalProperty":"results",
                                            "root":"workflows"
                                        },
                                        [ {"name":"wid"}, {"name":"label"}, {"name": CQ.shared.XSS.getXSSPropertyName("label")} ]
                                    )
                                }),
                                "tpl": new CQ.Ext.XTemplate(
                                    '<tpl for=".">',
                                        '<div class="x-combo-list-item">',
                                            '{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"label\")]}',
                                        '</div>',
                                    '</tpl>'
                                )
                            },
                        "desc": {
                            "xtype":'textfield',
                            "name":'description',
                            "fieldLabel":'Description',
                            "allowBlank":true
                          },
                        "enabled": {
                            "xtype": "selection",
                            "name": "enabled",
                            "border": false,
                            "cls": "x-form-field",
                            "fieldLabel": CQ.I18n.getMessage("Activate"),
                            "type": "radio",
                            "value": "true",
                            "options": [ {
                                "text": CQ.I18n.getMessage("Enable"),
                                "value": "true"
                                }, {
                                    "text": CQ.I18n.getMessage("Disable"),
                                    "value": "false"
                                }]
                            },
                        "exclude": {
                            "xtype":'textfield',
                            "name":'excludeList',
                            "fieldLabel":'Exclude List',
                            "allowBlank":true
                            },
                        "runmode": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Run Mode(s)"),
                                "displayField":"name",
                                "valueField":"runMode",
                                "title":CQ.I18n.getMessage("Run Mode(s)"),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "editable":false,
                                "allowBlank":false,
                                "name":"runModes",
                                "hiddenName":"runModes",
                                "mode": 'local',
                                "store":
                                      new CQ.Ext.data.SimpleStore({
                                            fields: ['runMode','name'],
                                            data: [
                                                ["author","Author"],
                                                ["publish","Publish"],
                                                ["author,publish","Author & Publish"]
                                            ]
                                      }
                                )
                            }
                        }
                    }
                };

                var ruleDlg = CQ.WCM.getDialog(wfAutoAssignRuleDlg);
                ruleDlg.success = function() {
                    myThis.reload();
                };
                ruleDlg.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Workflow Launcher Config'),
                text:CQ.I18n.getMessage('Add a new workflow launcher configuration'),
                autoHide:true
            }
        });

        this.editAction = new CQ.PrivilegedAction({
            cls:'cq.workflow.launcher.edit',
            text:CQ.I18n.getMessage('Edit...'),
            privileges:['modify'],
            path:'/etc/workflow/launcher/config',
            conditions:'',
            handler: function() {

                var editDialog = {
                    "jcr:primaryType": "cq:Dialog",
                    "title":CQ.I18n.getMessage("Workflow Launcher Configuration"),
                    "formUrl":"/libs/cq/workflow/launcher",
                    "failure": function(){
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Error"),
                            CQ.I18n.getMessage("Could not edit configuration entry."));
                    },
                    "params": {
                        "_charset_":"utf-8",
                        "edit":myThis.getSelectionModel().getSelected().id
                    },
                    "height":380,
                    "items": {
                        "jcr:primaryType": "cq:Panel",
                        "items": {
                            "jcr:primaryType": "cq:WidgetCollection",
                            "eventType": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Event Type"),
                                "displayField":"name",
                                "valueField":"evType",
                                "title":CQ.I18n.getMessage("Event Types"),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "editable":false,
                                "allowBlank":false,
                                "name":"eventType",
                                "hiddenName":"eventType",
                                "mode": 'local',
                                "store":
                                      new CQ.Ext.data.SimpleStore({
                                            fields: ['evType','name'],
                                            data: [
                                                [1,"Created"],
                                                [16,"Modified"],
                                                [2,"Removed"]
                                            ]
                                      }
                                )
                            },
                            "nodetypes": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Nodetype"),
                                "displayField":"name",
                                "valueField":"value",
                                "title":CQ.I18n.getMessage("Available nodetypes"),
                                "fieldDescription": CQ.I18n.getMessage("For event type 'Removed' only the following node types are supported: nt:folder, nt:file, sling:Folder (folders without jcr:content sub-node), dam:Asset and cq:Page. For reliable detection, nodes must not reside under the repository root ('/') in this case."),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "lastQuery": "",
                                "clearFilterOnReset": false,
                                "editable":false,
                                "allowBlank":false,
                                "name":"nodetype",
                                "hiddenName":"nodetype",
                                "store":new CQ.Ext.data.Store({
                                    "proxy":new CQ.Ext.data.HttpProxy({
                                        "url":"/libs/cq/workflow/launcher.nodetypes.json",
                                        "method":"GET"
                                    }),
                                    listeners: {
                                        exception: function(obj, action, data, it, response) {
                                            CQ.shared.HTTP.handleForbidden(response);
                                        }
                                    },
                                    "reader":new CQ.Ext.data.JsonReader(
                                        {
                                            "totalProperty":"results",
                                            "root":"nodetypes"
                                        },
                                        [ {"name":"name"}, {"name":"value"} ]
                                    )
                                }),
                                "listeners": {
                                    "expand": myThis.filterNodetypes
                                }
                            },
                            "glob": {
                                "xtype":"pathfield",
                                "selectOnFocus":true,
                                "allowBlank":false,
                                "name":"glob",
                                "fieldLabel":CQ.I18n.getMessage("Path"),
                                "predicate":"nosystem"
                            },
                            "condition": {
                                "xtype":'textfield',
                                "name":'condition',
                                "fieldLabel":'Condition',
                                "allowBlank":true
                             },
                            "model": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Workflow"),
                                "displayField":"label",
                                "valueField":"wid",
                                "title":CQ.I18n.getMessage("Available Workflows"),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "editable":false,
                                "allowBlank":false,
                                "name":"workflow",
                                "hiddenName":"workflow",
                                "store":new CQ.Ext.data.Store({
                                    "proxy":new CQ.Ext.data.HttpProxy({
                                        "url":"/libs/cq/workflow/content/console/workflows.json",
                                        "method":"GET"
                                    }),
                                    listeners: {
                                        exception: function(obj, action, data, it, response) {
                                            CQ.shared.HTTP.handleForbidden(response);
                                        }
                                    },
                                    "reader":new CQ.Ext.data.JsonReader(
                                        {
                                            "totalProperty":"results",
                                            "root":"workflows"
                                        },
                                        [ {"name":"wid"}, {"name":"label"}, {"name": CQ.shared.XSS.getXSSPropertyName("label")} ]
                                    )
                                }),
                                "tpl": new CQ.Ext.XTemplate(
                                    '<tpl for=".">',
                                        '<div class="x-combo-list-item">',
                                            '{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"label\")]}',
                                        '</div>',
                                    '</tpl>'
                                )
                            },
                        "desc": {
                            "xtype":'textfield',
                            "name":'description',
                            "fieldLabel":'Description',
                            "allowBlank":true
                          },
                        "enabled": {
                            "xtype": "selection",
                            "name": "enabled",
                            "border": false,
                            "cls": "x-form-field",
                            "fieldLabel": CQ.I18n.getMessage("Activate"),
                            "type": "radio",
                            "value": "true",
                            "options": [ {
                                "text": CQ.I18n.getMessage("Enable"),
                                "value": "true"
                                }, {
                                    "text": CQ.I18n.getMessage("Disable"),
                                    "value": "false"
                                }]
                            },
                        "exclude": {
                            "xtype":'textfield',
                            "name":'excludeList',
                            "fieldLabel":'Exclude List',
                            "allowBlank":true
                            },
                        "runmode": {
                                "xtype":"combo",
                                "fieldLabel":CQ.I18n.getMessage("Run Mode(s)"),
                                "displayField":"name",
                                "valueField":"runMode",
                                "title":CQ.I18n.getMessage("Run Mode(s)"),
                                "selectOnFocus":true,
                                "triggerAction":"all",
                                "editable":false,
                                "allowBlank":false,
                                "name":"runModes",
                                "hiddenName":"runModes",
                                "mode": 'local',
                                "store":
                                      new CQ.Ext.data.SimpleStore({
                                            fields: ['runMode','name'],
                                            data: [
                                                ["author","Author"],
                                                ["publish","Publish"],
                                                ["author,publish","Author & Publish"]
                                            ]
                                      }
                                )
                            }
                        }
                    }
                };

                var editDlg = CQ.WCM.getDialog(editDialog);

                // load existing conf
                //var conf = CQ.HTTP.eval(myThis.getSelectionModel().getSelected().id + ".json");
                //console.log(conf);
                editDlg.loadContent(myThis.getSelectionModel().getSelected().id);
                editDlg.success = function() {
                    myThis.reload();
                };
                editDlg.show();
            },
            tooltip: {
                title:CQ.I18n.getMessage('Workflow Launcher Config'),
                text:CQ.I18n.getMessage('Add a new workflow launcher configuration'),
                autoHide:true
            }
        });
        this.editAction.setDisabled(true);
        this.removeAction.setDisabled(true);

        this.actions = [ this.addAction, "-",
                         this.editAction,
                         this.removeAction ];
        this.tbar = this.actions;

        this.bbar = new CQ.Ext.PagingToolbar({
            pageSize:this.pageSize,
            store:this.store,
            displayInfo:true,
            displayMsg:CQ.I18n.getMessage("Displaying entries {0} - {1} of {2}"),
            emptyMsg:CQ.I18n.getMessage("No entries to display")
        });

        CQ.Workflow.Console.LauncherPanel.superclass.constructor.call(this, config);
        this.addAction.setPath('/etc/workflow/launcher/config', false);
        this.addAction.setDisabled(false);
        this.store.load({params:{start:0, limit:this.pageSize}});
    },

    filterNodetypes:function (combo) {

        var filter = function () {
            return true;
        };

        var fields = combo.findParentByType("dialog").find("name", "eventType");
        if (fields && fields.length == 1) {

            if (fields[0].getValue() == 2) {
                combo.clearValue();
                filter = function (record) {
                    return CQ.Ext.getCmp('cq.workflow.launcher').validNodeRemovedNodeTypes.indexOf(
                            record.get("value")
                    ) != -1;
                };
            }

            combo.getStore().filterBy(filter, this);
        }
    },

	initComponent: function() {
        CQ.Workflow.Console.LauncherPanel.superclass.initComponent.call(this);

        this.addEvents({ editmodel:true });
    },

	renderModelLink: function(value, p, record) {
        var url = CQ.HTTP.externalize(value);
		return String.format(
			'<a href="{0}" onclick="return CQ.Ext.getCmp(\'cq.workflow.launcher\').fireOpenModelEvent(\'{0}\', \'{1}\');">{1}</a>',
			url, record.get("workflowTitle"));
    },

	fireOpenModelEvent: function(url, title) {
		var atts = {
	        title:title,
	        url:CQ.HTTP.externalize(url)
	    };
        this.fireEvent('editmodel', atts);
		return false;
    }
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

CQ.Workflow.Console.Panel = function(config) {
    this.modelsPanel = new CQ.Workflow.Console.ModelsPanel(config);
    this.instancesPanel = new CQ.Workflow.Console.InstancesPanel(config);
    this.archivePanel = new CQ.Workflow.Console.ArchivePanel(config);
    this.launcherPanel = new CQ.Workflow.Console.LauncherPanel(config);
    this.failuresPanel = new CQ.Workflow.Console.FailuresPanel(config);

    CQ.Workflow.Console.Panel.superclass.constructor.call(this, {
        id:'cq.workflow.console',
        cls:'cq-workflow-console',
        activeTab:0,
        stateful:true,
        region:'center',
        margins:'5 0 0 0',
        border: false,
        resizeTabs:true,
        tabWidth:140,
        minTabWidth: 100,
        enableTabScroll: true,
        plain: true,
        defaults: {autoScroll:true},
        items:[
            this.modelsPanel,
            this.instancesPanel,
            this.archivePanel,
            this.launcherPanel,
            this.failuresPanel
        ]
    });
};

CQ.Ext.extend(CQ.Workflow.Console.Panel, CQ.Ext.TabPanel, {
    openModel: function(atts) {
        var pos = atts.url.indexOf("/jcr:content");
        if(pos > 0) {
            var url = CQ.HTTP.externalize("/cf#" + atts.url.substring(0, pos) + ".html");
        
            // check for multi window mode
            if (CQ.wcm.SiteAdmin.multiWinMode == undefined) {
                var wm = CQ.User.getCurrentUser().getPreference("winMode");
                CQ.wcm.SiteAdmin.multiWinMode = (wm != "single");
            }
    
            if (CQ.wcm.SiteAdmin.multiWinMode) {
                CQ.shared.Util.open(url);
            } else {
                CQ.shared.Util.load(url);
            }
        } else {
            // check if model is already open
            for (var i=0; i<this.items.getCount(); i++) {
                var tab = this.items.get(i);
                if (tab.items && tab.items.get(0) && tab.items.get(0).modelLocation == atts.url) {
                    this.setActiveTab(tab);
                    return;
                }
            }
            // model is not open in an editor, open new editor with the model
            var editorPanel = new CQ.Workflow.EditorPanel({modelLocation:atts.url});
            this.add({
                title:atts.title,
                closable:true,
                layout:'fit',
                items: [ editorPanel ],
                listener: {
                    beforeclose: function(comp) {
                        return false;
                    }
                }
            }).show();
            this.doLayout();
            editorPanel.load();
        }
    },

    initComponent: function() {
        CQ.Workflow.Console.Panel.superclass.initComponent.call(this);
        this.modelsPanel.on('editmodel', this.openModel, this);
        this.launcherPanel.on('editmodel', this.openModel, this);
    },

    listeners: {
        beforeremove: function(container, tab) {
            if (tab.items.get(0).isDirty() && (!tab.forceRemove)) {
                CQ.Ext.Msg.show({
                   title:CQ.I18n.getMessage('Save Changes?'),
                   msg:CQ.I18n.getMessage('You are closing a model that has unsaved changes.') + " " + CQ.I18n.getMessage("Would you like to save your changes?"),
                   buttons:CQ.Ext.Msg.YESNOCANCEL,
                   icon:CQ.Ext.MessageBox.QUESTION,
                   fn:function(btnId) {
                       if (btnId == 'yes') {
                           tab.items.get(0).save();
                           tab.forceRemove = true;
                           container.remove(tab);
                       } else if (btnId == 'no') {
                           tab.forceRemove = true;
                           container.remove(tab);
                       }
                   }
                });
                return false;
            }
        }
    }
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

/**
 * Workflow editor
 */
CQ.Workflow.Editor = function() {
    // actions
    this.saveAction = new CQ.Ext.Action({
        text: CQ.I18n.getMessage('Save'),
        scope:this,
        handler: function() {
            this.fireEvent('saveModel');
        },
        tooltip: {
            title:CQ.I18n.getMessage('Save model'),
            text:('Saves the current model'), 
            autoHide:true
        }
    });
    this.saveAction.setDisabled(true);
    
    // toolbar fields
    var myThis = this;
    this.titleField = new CQ.form.InlineTextField({
        cls:'cq-wf-title',
        listeners: {
            render: function(comp) {
                new CQ.Ext.ToolTip({
                    target: comp.getEl(),
                    title: CQ.I18n.getMessage('Model Title'),
                    html: CQ.I18n.getMessage('Click to edit title of the model'),
                    trackMouse:true
                });
            },
            change: function(comp) {
                myThis.setDirty(true);
            }
        }
    });
    this.versionField = new CQ.form.InlineTextField({
        editable:false,
        cls:'cq-wf-version',
        listeners: {
            render: function(comp) {
                new CQ.Ext.ToolTip({
                    target: comp.getEl(),
                    title: CQ.I18n.getMessage('Model Version'),
                    html: CQ.I18n.getMessage('Current version of the model'),
                    trackMouse:true
                });
            },
            change: function(comp) {
                myThis.setDirty(true);
            }
        }
    });
    this.descriptionField = new CQ.form.InlineTextField({
        cls:'cq-wf-description',
        listeners: {
            render: function(comp) {
                new CQ.Ext.ToolTip({
                    target: comp.getEl(),
                    title: CQ.I18n.getMessage('Model Description'),
                    html: CQ.I18n.getMessage('Click to edit description of the model'),
                    trackMouse:true
                });
            },
            change: function(comp) {
                myThis.setDirty(true);
            }
        }
    });
    this.tagsField = new CQ.form.InlineTextField({
        cls:'cq-wf-tags',
        listeners: {
            render: function(comp) {
                new CQ.Ext.ToolTip({
                    target: comp.getEl(),
                    title: CQ.I18n.getMessage('Tags'),
                    html: CQ.I18n.getMessage('Click to edit tags of the model. The tags are comma separated'),
                    trackMouse:true
                });
            },
            change: function(comp) {
                myThis.setDirty(true);
            }
        }
    });
    CQ.Workflow.Editor.superclass.constructor.call(this, arguments[0]);
}

CQ.Ext.extend(CQ.Workflow.Editor, CQ.Ext.Panel, {
    cls:'cq-wf-editor',
    autoScroll:true,
    defaultType: 'cq.workflow.editor.column.wrapper',
    bodyStyle:{
        padding:"10px"
    },
    
    /**
     * Insert new step or split
     * @public
     */
    insert: function(target, atts) {
        if (atts.nodeType) {
            return this.insertNode(target, atts.nodeType);
        } else if (atts.splitType) {
            return this.insertSplit(target, atts.splitType);
        }
        return false;
    },
    
    /**
     * Insert new step
     * @private
     */
    insertNode: function(target, type, data, noHighlight) {
        var transition = new CQ.Workflow.Transition.Vertical({ editor:this });
        transition.setData({ metaData:{} });
        
        var node = new CQ.Workflow.Node({ editor:this });
        if (data) {
            node.setData(data);
        } else {
            node.setData(CQ.Workflow.ModelUtil.getNewNodeData(this, type));
        }
        var column = target.ownerCt;
        var tIndex = column.getIndex(target);
        var pIndex = tIndex;
        var pCount = 2;
        var appendItem;
        if ((target instanceof CQ.Workflow.Split)
            && (target.previous instanceof CQ.Workflow.Join)) {
            // add between 2 splits (dropped on split)
            
            // wire items
            node.previous = target.previous;
            node.next = target;
            target.previous.next = node;
            target.previous = node;
            
            appendItem = target;
            
            // insert node and check layout
            column.insert(tIndex, node);
            pCount = 1;
            
            CQ.Workflow.EditorUtil.addPlaceholder(
                this.getWrapper(), column, pIndex, pCount);
        } else if ((target instanceof CQ.Workflow.Join) 
            && (target.next instanceof CQ.Workflow.Split)) {
            // add between 2 splits (dropped in join)
            
            // wire items
            node.previous = target;
            node.next = target.next;
            target.next.previous = node;
            target.next = node;

            appendItem = target.next;

            // insert node and check layout
            column.insert(tIndex + 1, node);
            pCount = 1;
            pIndex = tIndex + 1;
            
            CQ.Workflow.EditorUtil.addPlaceholder(
                this.getWrapper(), column, pIndex, pCount);
        } else if (target instanceof CQ.Workflow.Split) {
            // add before split
            transition.previous = target.previous;
            transition.next = node;
            node.previous = transition;
            node.next = target;
            target.previous.next = transition;
            target.previous = node;
            
            appendItem = target;

            column.insert(tIndex, node);
            column.insert(tIndex, transition);
            
            CQ.Workflow.EditorUtil.addPlaceholder(
                this.getWrapper(), column, pIndex, pCount);
        } else if ((target instanceof CQ.Workflow.Transition.TL) 
            || (target instanceof CQ.Workflow.Transition.TR)) {
            // preppend item to the branch of a split
            node.previous = target;
            node.next = transition;
            transition.previous = node;
            transition.next = target.next;
            target.next.previous = transition;
            target.next = node;
            
            node.split = target.previous;
            transition.split = target.previous;
            
            appendItem = transition;
            
            column.insert(tIndex + 1, transition);
            column.insert(tIndex + 1, node);
            
            CQ.Workflow.EditorUtil.checkSplitLayout(target.previous, this);
        } else if ((target instanceof CQ.Workflow.Transition.BL) 
            || (target instanceof CQ.Workflow.Transition.BR)) {
            // append item to the branch of a split
            transition.previous = target.previous;
            transition.next = node;
            node.previous = transition;
            node.next = target;
            target.previous.next = transition;
            target.previous = node;
            
            node.split = target.next.split;
            transition.split = target.next.split;
            
            appendItem = target;
            
            column.insert(tIndex, node);
            column.insert(tIndex, transition);
            
            CQ.Workflow.EditorUtil.checkSplitLayout(target.next.split, this);
        } else {
            // normal insert (no split/join stuff)
            transition.next = target.next;
            transition.previous = node;
            node.previous = target;
            node.next = transition;
            target.next.previous = transition;
            target.next = node;
            
            appendItem = transition;
            
            column.insert(tIndex + 1, node);
            column.insert(tIndex + 2, transition);
            
            if (target.split && (!(target instanceof CQ.Workflow.Join))) {
                node.split = target.split;
                transition.split = target.split;
                CQ.Workflow.EditorUtil.checkSplitLayout(target.split, this);
            } else {
                pIndex = tIndex + 1;
                CQ.Workflow.EditorUtil.addPlaceholder(
                    this.getWrapper(), column, pIndex, pCount);
            }
        }
        this.doLayout();
        this.showProperties({ source:node });
        this.setDirty(true);
        
        // highlight nodes
        if (!noHighlight) {
            CQ.Ext.fly(node.getEl()).frame('#8db2e3', 1);
        }
        return appendItem;
    },
    
    /**
     * Insert new split
     * @private
     */
    insertSplit: function(target, type, noHighlight) {
        var wrapper = this.getWrapper();
        
        // remove target transition
        var column = target.ownerCt;
        var tIndex = column.getIndex(target);
        
        // insert split
        var split, join;
        if (type == CQ.Workflow.Split.AND) {
            split = new CQ.Workflow.Split.And({ editor:this });
            join = new CQ.Workflow.Join.And({ editor:this });
        } else if (type == CQ.Workflow.Split.OR) {
            split = new CQ.Workflow.Split.Or({ editor:this });
            join = new CQ.Workflow.Join.Or({ editor:this });
        }
        split.join = join;
        join.split = split;
        
        join.setData(CQ.Workflow.ModelUtil.getNewJoinData(this, type));
        split.setData(CQ.Workflow.ModelUtil.getNewSplitData(this, type, 
            CQ.Workflow.ModelUtil.generateNextID(join.nodeData.id)));
        
        var result = { split:split, join:join };
        
        var bIndex = tIndex;
        var preventPlaceholderDelete = false;
        if (target instanceof CQ.Workflow.Split) {
            // insert before an existing split
            join.next = target;
            split.previous = target.previous;
            target.previous.next = split;
            target.previous = join;
            
            column.insert(tIndex, join);
            column.insert(tIndex, new CQ.Workflow.Split.Placeholder());
            column.insert(tIndex, split);
            
            preventPlaceholderDelete = true;
        } else if (target instanceof CQ.Workflow.Join) {
            // insert split after exising join
            split.previous = target;
            join.next = target.next;
            target.next.previous = join;
            target.next = split;
            
            column.insert(tIndex + 1, join);
            column.insert(tIndex + 1, new CQ.Workflow.Split.Placeholder());
            column.insert(tIndex + 1, split);
            
            bIndex = tIndex + 1;
            preventPlaceholderDelete = true;
        } else {
            // insert split between to nodes
            join.next = target.next;
            target.next.previous = join;
            split.previous = target.previous;
            target.previous.next = split;
            
            column.remove(target);
            column.insert(tIndex, join);
            column.insert(tIndex, new CQ.Workflow.Split.Placeholder());
            column.insert(tIndex, split);
        }
        
        // check if a column is available, if not we need new columns
        var cIndex = wrapper.getIndex(column);
        var lColumn, rColumn;
        if (cIndex > 0) {
            lColumn = wrapper.getComponent(cIndex - 1);
            var branch = CQ.Workflow.EditorUtil.createBranchItems(split, join, CQ.Workflow.Split.BRANCH_LEFT, 
                lColumn, bIndex, preventPlaceholderDelete, split.nodeData.id, this);
            result.left = branch.node;
            
            rColumn = wrapper.getComponent(cIndex + 1);
            branch = CQ.Workflow.EditorUtil.createBranchItems(split, join, CQ.Workflow.Split.BRANCH_RIGHT, 
                rColumn, bIndex, preventPlaceholderDelete, branch.node.nodeData.id, this);
            result.right = branch.node;
        } else {
            lColumn = new CQ.Workflow.Editor.Column();
            wrapper.insert(cIndex, lColumn);
            
            CQ.Workflow.EditorUtil.addColumnPlaceholder(lColumn, tIndex);
            var branch = CQ.Workflow.EditorUtil.createBranchItems(split, join, CQ.Workflow.Split.BRANCH_LEFT, 
                lColumn, null, null, split.nodeData.id, this);
            result.left = branch.node;
            CQ.Workflow.EditorUtil.addColumnPlaceholder(lColumn, (column.items.getCount() - tIndex - 3));
            
            rColumn = new CQ.Workflow.Editor.Column();
            wrapper.add(rColumn);
            
            CQ.Workflow.EditorUtil.addColumnPlaceholder(rColumn, tIndex);
            branch = CQ.Workflow.EditorUtil.createBranchItems(split, join, CQ.Workflow.Split.BRANCH_RIGHT, rColumn, 
                null, null, branch.node.nodeData.id, this);
            result.right = branch.node;
            CQ.Workflow.EditorUtil.addColumnPlaceholder(rColumn, (column.items.getCount() - tIndex - 3));
        }
        this.doLayout();
        this.doLayout(); // need to layout again to render columns correctly
        this.setDirty(true);
        
        // highlight nodes
        if (!noHighlight) {
            CQ.Ext.fly(result.left.getEl()).frame('#8db2e3', 1);
            CQ.Ext.fly(result.right.getEl()).frame('#8db2e3', 1);
        }
        return result;
    },
    
    /**
     * Remove split or step
     * @public
     */
    removeItem: function(item) {
        var appendItem;
        if (item instanceof CQ.Workflow.Node) {
            // remove node from the model
            var column = item.ownerCt;
            var tIndex = column.getIndex(item);
                        
            // wire surrounding nodes
            if (item.previous instanceof CQ.Workflow.Join) {
                column.remove(item, true);
                
                if (item.next instanceof CQ.Workflow.Split) {
                    // in this case the step is between 2 splits
                    item.next.previous = item.previous;
                    item.previous.next = item.next;
                } else {
                    item.next.next.previous = item.previous;
                    item.previous.next = item.next.next;
                    column.remove(column.getComponent(tIndex), true);
                }
                CQ.Workflow.EditorUtil.removePlaceholder(this.getWrapper(), column, tIndex);
            } else if (item.split) {
                if (((item.previous instanceof CQ.Workflow.Transition.TL) 
                        && (item.next instanceof CQ.Workflow.Transition.BL))
                    || ((item.previous instanceof CQ.Workflow.Transition.TR) 
                        && (item.next instanceof CQ.Workflow.Transition.BR))) {
                    // last step in branch!! -> remove split and copy items
                    
                    // check which branch needs to be copied
                    var copyItem;
                    var copyData = new Array();
                    if (item.previous instanceof CQ.Workflow.Transition.TL) {
                        // need to copy right branch
                        copyItem = item.previous.previous.right.next;
                    } else {
                        // need to copy left branch
                        copyItem = item.previous.previous.left.next;
                    }
                    // copy node data
                    while ((!(copyItem instanceof CQ.Workflow.Transition.BL))
                        && (!(copyItem instanceof CQ.Workflow.Transition.BR))) {
                        if (copyItem instanceof CQ.Workflow.Node) {
                            copyData.push(copyItem.nodeData);
                        }
                        copyItem = copyItem.next;
                    }
                    // remove split
                    var appendItem = this.remove(item.previous.previous);                   
                    
                    // add new nodes (as serial list of nodes)
                    for (var i=0; i<copyData.length; i++) {
                        appendItem = this.insertNode(appendItem, copyData[i].type, copyData[i]);
                    }
                } else if ((item.previous instanceof CQ.Workflow.Transition.TL) 
                    || (item.previous instanceof CQ.Workflow.Transition.TR)) {
                    // first step in branch and not the only step in this branch
                    item.previous.next = item.next.next;
                    item.next.next.previous = item.previous;
                    
                    column.remove(item, true);
                    column.remove(column.getComponent(tIndex), true);
                    CQ.Workflow.EditorUtil.checkSplitLayout(item.split, this);
                } else if ((item.previous instanceof CQ.Workflow.Transition.BL) 
                    || (item.previous instanceof CQ.Workflow.Transition.BR)) {
                    // last step in branch and not the only step in this branch
                    item.next.previous = item.previous.previous;
                    item.previous.previous.next = iem.next;
                    
                    column.remove(item, true);
                    column.remove(column.getComponent(tIndex - 1), true);
                    CQ.Workflow.EditorUtil.checkSplitLayout(item.split, this);
                } else {
                    // step in branch that has a step before and after
                    item.next.previous = item.previous.previous;
                    item.previous.previous.next = item.next;
                    
                    column.remove(item, true);
                    column.remove(column.getComponent(tIndex - 1), true);
                    CQ.Workflow.EditorUtil.checkSplitLayout(item.split, this);
                }
            } else {
                item.next.previous = item.previous.previous;
                item.previous.previous.next = item.next;
                
                column.remove(item, true);
                column.remove(column.getComponent(tIndex - 1), true);
                CQ.Workflow.EditorUtil.removePlaceholder(this.getWrapper(), column, tIndex - 1);
            }
        } else if (item instanceof CQ.Workflow.Split) {
            // remove a split from the model
            var wrapper = this.getWrapper();
            
            var column = item.ownerCt;
            var colIndex = wrapper.getIndex(column);
            
            var leftCol = wrapper.getComponent(colIndex - 1);
            var rightCol = wrapper.getComponent(colIndex + 1);
            
            var splitIndex = column.getIndex(item);
            var joinIndex = column.getIndex(item.join);
            
            var rows = joinIndex - splitIndex;
            for (var i=0; i<=rows; i++) {
                column.remove(splitIndex);
                leftCol.remove(splitIndex);
                rightCol.remove(splitIndex);
            }
            if ((item.previous instanceof CQ.Workflow.NodeBase)
                && (item.join.next  instanceof CQ.Workflow.NodeBase)) {
                // split is between two nodes/steps -> add new transition
                var transition = new CQ.Workflow.Transition.Vertical({ editor:this });
                transition.setData({ metaData:{} });
                appendItem = transition;
                
                item.previous.next = transition;
                item.join.next.previous = transition;
                transition.previous = item.previous;
                transition.next = item.join.next;
                
                column.insert(splitIndex, transition);  
                CQ.Workflow.EditorUtil.addPlaceholder(
                    this.getWrapper(), column, splitIndex, 1);
            } else {
                // create append item to be used if a split is transformed into serial steps
                if (item.previous instanceof CQ.Workflow.NodeBase) {
                    appendItem = item.next;
                } else {
                    appendItem = item.previous;
                }
                item.previous.next = item.join.next;
                item.join.next.previous = item.previous;
            }
            // remove left/right columns if no longer needed
            var removeCols = true;
            for (var i=0; i<leftCol.items.getCount(); i++) {
                if (!(leftCol.items.get(i) instanceof CQ.Workflow.Split.Placeholder)) {
                    removeCols = false;
                }
            }
            if (removeCols) {
                wrapper.remove(leftCol, true);
                wrapper.remove(rightCol, true);
            }
        }
        this.doLayout();
        this.setDirty(true);
        return appendItem;
    },
    
    /**
     * Remove all items
     * @public
     */
    clear: function() {
        var wrapper = this.getWrapper();
        for (var i=0; i<wrapper.items.getCount(); i++) {
            wrapper.remove(wrapper.items.get(i), true);
        }
        this.doLayout();
    },
    
    /**
     * Sets a new version for the current loaded model.
     */ 
    setModelVersion: function(version) {
        this.versionField.setValue(version);
    },
    
    /**
     * Load a new model
     * @public
     */
    loadModel: function(model) {
        this.clear();

        // load model description
        this.modelId = model.id;
        this.titleField.setValue(model.title);
        this.versionField.setValue(model.version);
        this.descriptionField.setValue(model.description);
        this.tagsField.setValue((model.metaData && model.metaData.tags) ? model.metaData.tags : "");
        
        // load model
        var wrapper = this.getWrapper();
        var column = wrapper.add(new CQ.Workflow.Editor.Column());
        
        CQ.Workflow.ModelUtil.convertToLocalNodeTypes(model.nodes);
        var startData = CQ.Workflow.ModelUtil.getStartNode(model.nodes);
        var endData = CQ.Workflow.ModelUtil.getEndNode(model.nodes);
        
        // create initial start & end node + an initial transition for inserting items
        var start = new CQ.Workflow.Node.Start();
        start.setData(startData);
        var transition = new CQ.Workflow.Transition.Vertical({ 
            editor:this, 
            nodeData: { metaData: {} } 
        });
        var end = new CQ.Workflow.Node.End();
        end.setData(endData);
        
        transition.previous = start;
        transition.next = end;
        start.next = transition;
        end.previous = transition;
        
        column.add(start);
        column.add(transition);
        column.add(end);
                
        var node = start;
        var target = transition;
        var outs = CQ.Workflow.ModelUtil.getOuts(node.nodeData, model.transitions);
        while (outs.length > 0) {
            var ends = CQ.Workflow.ModelUtil.getTransitionEnds(outs[0], model.nodes);
            
            if (ends[0].type == CQ.Workflow.Node.END) {
                // nothing to add here (END was already added)
                outs = CQ.Workflow.ModelUtil.getOuts(ends[0], model.transitions);
            } else if ((ends[0].type == CQ.Workflow.Split.AND) 
                || (ends[0].type == CQ.Workflow.Split.OR)) { 

                // load split
                var splitItems = this.insertSplit(target, ends[0].type, true);
                
                // hide delete button (only when loading model)
                splitItems.split.items.get(0).hide();
                
                // set split + join node data
                splitItems.split.setData(ends[0]);
                var joinData = CQ.Workflow.ModelUtil.getJoin(splitItems.split.getData(), model.transitions, model.nodes);
                splitItems.join.setData(joinData);
                
                // load branches
                var splitOuts = CQ.Workflow.ModelUtil.getOuts(splitItems.split.nodeData, model.transitions);
                for (var i=0; i<splitOuts.length; i++) {
                    if (splitOuts[i].metaData.branch == CQ.Workflow.Split.BRANCH_LEFT) {
                        // set OR split transition data
                        if (splitItems.split instanceof CQ.Workflow.Split.Or) {
                            var tl = splitItems.split.left;
                            tl.setData(splitOuts[i]);
                        }
                        
                        // load left branch
                        ends = CQ.Workflow.ModelUtil.getTransitionEnds(splitOuts[i], model.nodes);
                        
                        splitItems.left.setData(ends[0]);
                        target = splitItems.left.next;
                        
                        var inBranchOuts = CQ.Workflow.ModelUtil.getOuts(ends[0], model.transitions);
                        ends = CQ.Workflow.ModelUtil.getTransitionEnds(inBranchOuts[0], model.nodes);
                        while ((ends[0].type != CQ.Workflow.Join.AND)
                            && (ends[0].type != CQ.Workflow.Join.OR)) {
                            this.insertNode(target, ends[0].type, ends[0], true);
                            inBranchOuts = CQ.Workflow.ModelUtil.getOuts(ends[0], model.transitions);
                            ends = CQ.Workflow.ModelUtil.getTransitionEnds(inBranchOuts[0], model.nodes);
                        }
                    } else if (splitOuts[i].metaData.branch == CQ.Workflow.Split.BRANCH_RIGHT) {
                        // set OR split transition data
                        if (splitItems.split instanceof CQ.Workflow.Split.Or) {
                            var tl = splitItems.split.right;
                            tl.setData(splitOuts[i]);
                        }
                        
                        // load right branch
                        ends = CQ.Workflow.ModelUtil.getTransitionEnds(splitOuts[i], model.nodes);
                        
                        splitItems.right.setData(ends[0]);
                        target = splitItems.right.next;
                        
                        var inBranchOuts = CQ.Workflow.ModelUtil.getOuts(ends[0], model.transitions);
                        ends = CQ.Workflow.ModelUtil.getTransitionEnds(inBranchOuts[0], model.nodes);
                        while ((ends[0].type != CQ.Workflow.Join.AND)
                            && (ends[0].type != CQ.Workflow.Join.OR)) {
                            this.insertNode(target, ends[0].type, ends[0], true);
                            inBranchOuts = CQ.Workflow.ModelUtil.getOuts(ends[0], model.transitions);
                            ends = CQ.Workflow.ModelUtil.getTransitionEnds(inBranchOuts[0], model.nodes);
                        }
                    }
                }
                target = splitItems.join;
                outs = CQ.Workflow.ModelUtil.getOuts(splitItems.join.nodeData, model.transitions);
            } else {
                // load node
                target = this.insertNode(target, ends[0].type, ends[0], true);
                outs = CQ.Workflow.ModelUtil.getOuts(ends[0], model.transitions);
            }
        }
        this.doLayout();
        this.setDirty(false);
    },
    
    /**
     * Get data (as JSON) of the current model
     * @public
     */
    getModel: function() {
        var model = new Object();
        model.metaData = new Object();
        model.nodes = new Array();
        model.transitions = new Array();
        
        // get model description
        model.id = this.modelId;
        model.title = this.titleField.getValue();
        model.version = this.versionField.getValue();
        model.description = this.descriptionField.getValue();
        model.metaData.tags = this.tagsField.getValue();
        
        // parse model and copy data to exported model object
        var wrapper = this.getWrapper();
        for (var i=0; i<wrapper.items.getCount(); i++) {
            var column = wrapper.items.get(i);
            
            for (var j=0; j<column.items.getCount(); j++) {
                
                var item = column.items.get(j);
                if (item instanceof CQ.Workflow.NodeBase) {
                    model.nodes.push(CQ.Workflow.ModelUtil.copyObject(item.getData()));
                } else if (item instanceof CQ.Workflow.TransitionBase) {
                    if (item instanceof CQ.Workflow.Transition.Placeholder) {
                        // these are just placeholders (no need to add them)
                        continue;
                    }
                    model.transitions.push(CQ.Workflow.ModelUtil.copyObject(item.getData()));
                } else if (item instanceof CQ.Workflow.Split) {
                    model.nodes.push(CQ.Workflow.ModelUtil.copyObject(item.getData()));
                    
                    // create missing incoming split transition (not displayed in editor for better look&feel)
                    var transition = new Object();
                    transition.from = item.previous.nodeData.id;
                    transition.to = item.nodeData.id;
                    model.transitions.push(transition);
                } else if (item instanceof CQ.Workflow.Join) {
                    model.nodes.push(CQ.Workflow.ModelUtil.copyObject(item.getData()));
                    
                    // create missing outgoing join transition (not displayed in editor for better look&feel)
                    // this is only needed if next item is not a split, in case item.next is a split the extra 
                    // transition will be added by the split
                    if (!(item.next instanceof CQ.Workflow.Split)) {
                        var transition = new Object();
                        transition.from = item.nodeData.id;
                        transition.to = item.next.nodeData.id;
                        model.transitions.push(transition);
                    }
                }
            }
        }
        CQ.Workflow.ModelUtil.convertToRemoteNodeTypes(model.nodes);
        return model;
    },
    
    /**
     * Returns the wrapper
     * @private
     */
    getWrapper: function() {
        return this.getComponent(0);
    },
    
    /**
     * Finds a node/step by ID
     * @private
     */
    getNode: function(id) {
        var wrapper = this.getWrapper();
        
        for (var i=0; i<wrapper.items.getCount(); i++) {
            var column = wrapper.items.get(i);
        
            for (var j=0; j<column.items.getCount(); j++) {
                var item = column.items.get(j);
        
                if ((item instanceof CQ.Workflow.Node) 
                    && (item.nodeData.id == id)) {
                    return item;
                }
            }
        }
    },
    
    /**
     * Finds nodes by node type
     * @private
     */
    getNodesByType: function(type) {
        var wrapper = this.getWrapper();
        
        var nodes = new Array();
        for (var i=0; i<wrapper.items.getCount(); i++) {
            var column = wrapper.items.get(i);
            
            for (var j=0; j<column.items.getCount(); j++) {
                var item = column.items.get(j);
                
                if ((item instanceof CQ.Workflow.Node)
                    &&(item.getData().type == type)) {
                    nodes.push(item);
                }
            }
        }
        return nodes;
    },
    
    listeners: {
        render: function(comp) {
            var tbar = comp.getTopToolbar();
            tbar.add(comp.saveAction);
            tbar.add('->');
            tbar.addField(comp.titleField);
            tbar.add(' ');tbar.add("-");tbar.add(' ');
            tbar.addField(comp.versionField);
            tbar.add(' ');tbar.add("-");tbar.add(' ');
            tbar.addField(comp.descriptionField);
            tbar.add(' ');tbar.add("-");tbar.add(' ');
            tbar.addField(comp.tagsField);
        }
    },
    
    initComponent: function() {
        this.addEvents({ 
            showProperties:true,
            saveModel:true,
            modelChanged:true 
        });
        CQ.Workflow.Editor.superclass.initComponent.call(this);
    },
    
    showProperties: function(atts) {
        this.fireEvent('showProperties', atts);
    },
    
    setDirty: function(dirty) {
        if (dirty) {
            this.saveAction.setDisabled(false);
            this.fireEvent('modelChanged');
        } else {
            this.saveAction.setDisabled(true);
        }
    },
    
    isDirty: function() {
        return !this.saveAction.isDisabled();
    }
});
CQ.Ext.override(CQ.Workflow.Editor, {
    /**
     * Ensure correct wrapper width according to number of columns
     */
    doLayout : CQ.Ext.Panel.prototype.doLayout.createSequence(function() {
        var width = CQ.Workflow.Editor.COLUMN_WIDTH * this.getWrapper().items.getCount();
        this.getWrapper().getEl().setWidth(width);
    })
});
CQ.Ext.reg('cq.workflow.editor', CQ.Workflow.Editor);

CQ.Workflow.Editor.DD_GROUP = 'cq.workflow.editor';
CQ.Workflow.Editor.COLUMN_WIDTH = 200;
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
 * Workflow editor panel
 */
CQ.Workflow.EditorPanel = CQ.Ext.extend(CQ.Ext.Panel, {
    border:false,
    
    conn:new CQ.Ext.data.Connection(),
    
    load:function() {
        this.loadMask.show();        
        CQ.Ext.apply(this, arguments[0]);
        
        this.conn.request({
            scope:this,
            url:this.modelLocation + ".json",
            success:function(response, options) {
                var model = CQ.Ext.decode(response.responseText);
                this.editor.loadModel(model);
                
                var ellipsisTitle = CQ.Ext.util.Format.ellipsis(model.title, 18);
                this.ownerCt.setTitle(ellipsisTitle);
                this.loadMask.hide();
            },
            failure:function(response, options) {
                CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                        CQ.I18n.getMessage("Could not load workflow model."));
                this.loadMask.hide();
            }
        });
    },
    
    save: function() {
        this.saveMask.show();
        
        var model = CQ.Ext.encode(this.editor.getModel());
        var con = new CQ.Ext.data.Connection();
        con.request({
            scope:this,
            url:this.modelLocation + ".json",
            params: {
                model:model,
                type:'JSON',
                "_charset_":"utf-8"
            },
            success:function(response, options) {
                var models = CQ.Ext.getCmp('cq.workflow.models');
                if (models) models.reload();
                
                this.conn.request({
                    scope:this,
                    url:this.modelLocation + ".json",
                    success:function(response, options) {
                        var model = CQ.Ext.decode(response.responseText);
                        this.editor.setModelVersion(model.version);
                        
                        var ellipsisTitle = CQ.Ext.util.Format.ellipsis(model.title, 18);
                        this.ownerCt.setTitle(ellipsisTitle);
                        this.editor.setDirty(false);
                        this.saveMask.hide();
                    },
                    failure:function(response, options) {
                        CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                                CQ.I18n.getMessage("Could not update workflow model version."));
                        this.saveMask.hide();
                    }
                });
                this.saveMask.hide();
            },
            failure:function(response, options) {
                CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),
                        CQ.I18n.getMessage("Could not save workflow model."));
                this.saveMask.hide();
            }
        });
    },
    
    initComponent:function() {
        this.toolbox = new CQ.Ext.tree.TreePanel({
            rootVisible:false,
            autoScroll:true,
            enableDrag:true,
            collapsed:false,
            ddGroup:CQ.Workflow.Editor.DD_GROUP,
            region:'west',
            title: 'Toolbox',
            collapsible: true,
            collapsed:false,
            split:true,
            width: 240,
            minSize: 175,
            maxSize: 400,
            margins:'5 0 5 5',
			cmargins:'5 5 5 5'
        });
        
        var nodes = new CQ.Ext.tree.TreeNode({ 
            text:CQ.I18n.getMessage('Steps'), draggable:false,
            qtip:CQ.I18n.getMessage('List of available workflow steps')
        });
        nodes.appendChild([
            new CQ.Ext.tree.TreeNode({
                iconCls:CQ.Workflow.Node.CONTAINER,
                nodeType:CQ.Workflow.Node.CONTAINER,
                qtip: CQ.I18n.getMessage('Drag to model to add a container for other workflows'),
                text:CQ.I18n.getMessage('Container Step'), draggable:true
            }),
            new CQ.Ext.tree.TreeNode({
                iconCls:CQ.Workflow.Node.PARTICIPANT,
                nodeType:CQ.Workflow.Node.PARTICIPANT,
                qtip: CQ.I18n.getMessage('Drag to model to add a step that involves a participant'),
                text:CQ.I18n.getMessage('Participant Step'), draggable:true
            }),
            new CQ.Ext.tree.TreeNode({
                iconCls:CQ.Workflow.Node.PROCESS,
                nodeType:CQ.Workflow.Node.PROCESS,
                qtip: CQ.I18n.getMessage('Drag to model to add a processed step'),
                text:CQ.I18n.getMessage('Process Step'), draggable:true
            })
        ]);
        
        var splits = new CQ.Ext.tree.TreeNode({ 
            text:CQ.I18n.getMessage('Splits'), draggable:false,
            qtip:CQ.I18n.getMessage('List of available workflow splits')
        });
        splits.appendChild([
            new CQ.Ext.tree.TreeNode({
                iconCls:CQ.Workflow.Split.AND,
                splitType:CQ.Workflow.Split.AND,
                qtip: CQ.I18n.getMessage('Adds an AND split to the workflow'),
                text:CQ.I18n.getMessage('AND Split'), draggable:true
            }),
            new CQ.Ext.tree.TreeNode({
                iconCls:CQ.Workflow.Split.OR,
                splitType:CQ.Workflow.Split.OR,
                qtip:CQ.I18n.getMessage('Adds an OR split to the workflow'),
                text:CQ.I18n.getMessage('OR Split'), draggable:true
            })
        ]);
        
        var root = new CQ.Ext.tree.TreeNode({ 
            text:CQ.I18n.getMessage('Workflow Tools'),
            draggable:false
        });
        this.toolbox.setRootNode(root);
        root.appendChild(nodes);
        root.appendChild(splits);
        
        this.propGrid = new CQ.PropertyGrid({
            region:'east',
            title:CQ.I18n.getMessage('Properties'),
            collapsible: true,
            collapsed:false,
            split:true,
            width: 300,
            minSize: 200,
            maxSize: 500,
            margins:'5 5 5 0',
			cmargins:'5 5 5 5'
        });
        this.editor = new CQ.Workflow.Editor({
            region:'center',
            margins:'5 0 5 0',
            tbar:new CQ.Ext.Toolbar({ autoWidth:true }),
            items:[{ width:200 }]
        });
        this.editor.on('showProperties', this.showProperties, this);
        this.editor.on('saveModel', this.save, this);
        this.editor.on('modelChanged', this.modelChanged, this);
        
        CQ.Ext.apply(this, {
            layout:'border',
            items:[
                this.toolbox,
                this.propGrid,
                this.editor
            ]
        });
        CQ.Workflow.EditorPanel.superclass.initComponent.call(this);
    },
    
    listeners: {
        render: function(comp) {
            comp.loadMask = new CQ.Ext.LoadMask(comp.bwrap);
            comp.saveMask = new CQ.Ext.LoadMask(comp.bwrap, { msg:CQ.I18n.getMessage('Saving') + "..." });
        }
    },
    
    showProperties: function(atts) {
        this.propGrid.showProperties(atts.source);
    },
    
    modelChanged: function() {
        var title = CQ.Ext.util.Format.ellipsis(this.ownerCt.title, 17);
        if (title.substring(title.length - 1) != '*') {
            title = title + '*';
        }
        this.ownerCt.setTitle(title);
    },
    
    isDirty: function() {
        return this.editor.isDirty();
    }
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

/**
 * Vertival editor column
 */
CQ.Workflow.Editor.Column = CQ.Ext.extend(CQ.Ext.Container, {
	cls:'cq-wf-column',
    autoEl: 'div',
    width:200,
	getIndex: function(child) {
		for (var i=0; i<this.items.length; i++) {
			if (child == this.items.get(i)) {
				return i;
			}
		}
	},
	listeners: {
		render: function(comp) {
			comp.getEl().setWidth(200);
			
			// trigger layout of column wrapper after
			// new column was rendered
			comp.ownerCt.doLayout();
		}
	}
});
CQ.Ext.reg('cq.workflow.editor.column', CQ.Workflow.Editor.Column);
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
 * Column wrapper for centering model in editor
 */
CQ.Workflow.Editor.Column.Wrapper = CQ.Ext.extend(CQ.Ext.Container, {
	layout:'column',
    defaultType: 'cq.workflow.column',
	cls:'cq-wf-column-wrapper',
    autoEl:'div',
    width:200,
	getIndex: function(child) {
		for (var i=0; i<this.items.length; i++) {
			if (child == this.items.get(i)) {
				return i;
			}
		}
	}
});
CQ.Ext.reg('cq.workflow.editor.column.wrapper', CQ.Workflow.Editor.Column.Wrapper);
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
 * Base class for transitions
 * @abstract
 */
CQ.Workflow.TransitionBase = CQ.Ext.extend(CQ.Ext.Container, {
    autoEl: 'div',
    setData: function(data) {
        this.nodeData = data;
    },
    getData: function() {
        this.nodeData.from = this.previous.getData().id;
        this.nodeData.to = this.next.getData().id;
        return this.nodeData;
    },
    listeners: {
        render: function(comp) {
            // create drop target for accepting item insert drops
            var dropTarget = new CQ.Workflow.Transition.DropTarget(comp.getEl(), {
                canDrop: function(atts) {
                    var transition = CQ.Ext.getCmp(this.id);
                    if (transition.split && atts.splitType) {
                        return false;
                    }
                    return true;
                },
                doDrop: function(atts) {
                    return comp.editor.insert(
                        CQ.Ext.getCmp(this.id), atts);
                }
            });
        }
    }
});
CQ.Ext.override(CQ.Workflow.TransitionBase, {
    /**
     * Set fixed size
     */
    doLayout : CQ.Ext.Container.prototype.doLayout.createSequence(function() {
        this.getEl().setWidth(200);
        this.getEl().setHeight(50);
        CQ.Workflow.TransitionBase.superclass.doLayout.call(this);
    })
});

CQ.Ext.namespace('CQ.Workflow.Transition');

/**
 * Vertical transition
 */
CQ.Workflow.Transition.Vertical = CQ.Ext.extend(CQ.Workflow.TransitionBase, { cls:'cq-wf-transition-vertical' });
CQ.Ext.reg('cq.workflow.transition.vertical', CQ.Workflow.Transition.Vertical);

/**
 * Vertical placeholder transition (used to fix split layout). No sucessor 
 * and predecessor available as with normal transitions.
 */
CQ.Workflow.Transition.Placeholder = CQ.Ext.extend(CQ.Workflow.Transition.Vertical, {
    listeners: {
        render: function(comp) {
            var dropTarget = new CQ.Workflow.Transition.DropTarget(comp.getEl(), {
                canDrop: function(atts) {
                    if (atts.splitType) {
                        return false;
                    }
                    return true;
                },
                doDrop: function(atts) {
                    var target = CQ.Ext.getCmp(this.id);
                    var column = target.ownerCt;
                    var index = column.getIndex(target);
                    
                    while ((!(target instanceof CQ.Workflow.Transition.BL))
                        && (!(target instanceof CQ.Workflow.Transition.BR))) {
                        target = column.getComponent(++index);
                    }
                    return comp.editor.insert(target, atts);
                }
            });
        }
    }
});
CQ.Ext.reg('cq.workflow.transition.placeholder', CQ.Workflow.Transition.Placeholder);

/**
 * Base class for transitions used for joins (bottom right + left)
 * @abstract
 */
CQ.Workflow.JoinTransition = CQ.Ext.extend(CQ.Workflow.TransitionBase, {
    listeners: {
        render: function(comp) {
            // drop target to insert items within a split
            var dropTarget = new CQ.Workflow.Transition.DropTarget(comp.getEl(), {
                canDrop: function(atts) {
                    if (atts.splitType) {
                        return false;
                    }
                    return true;
                },
                doDrop: function(atts) {
                    return comp.editor.insert(CQ.Ext.getCmp(this.id), atts);
                }
            });
        }
    }
});

/**
 * Bottom-left join transition
 */
CQ.Workflow.Transition.BL = CQ.Ext.extend(CQ.Workflow.JoinTransition, { cls:'cq-wf-transition-bl' });
CQ.Ext.reg('cq.workflow.transition.bl', CQ.Workflow.Transition.BL);

/**
 * Bottom-right join transition
 */
CQ.Workflow.Transition.BR = CQ.Ext.extend(CQ.Workflow.JoinTransition, { cls:'cq-wf-transition-br' });
CQ.Ext.reg('cq.workflow.transition.br', CQ.Workflow.Transition.BR);

/**
 * Base class for transitions that are used for splits (top left + right)
 * @abstract
 */
CQ.Workflow.SplitTransition = CQ.Ext.extend(CQ.Workflow.TransitionBase, {
    layout: 'absolute', isDefaultClassSuffix: '-default',
    listeners: {
        render: function(comp) {
            // add properties button (only transitions with OR split as source can have properties for now)
            if (comp.previous instanceof CQ.Workflow.Split.Or) {
                var propsBtn = new CQ.Ext.BoxComponent({ 
                    autoEl:'div', cls:'x-tool x-tool-gear', overCls:'x-tool-gear-over', 
                    width:15, height:15, x:91, y:18,
                    listeners: {
                        render: function(comp) {
                            comp.getEl().addListener('click', function() {
                                comp.ownerCt.editor.showProperties({ source:comp.ownerCt });
                            });
                            new CQ.Ext.ToolTip({ target: comp.getEl(), html: CQ.I18n.getMessage('Edit properties') });
                        }
                    }
                });
                comp.add(propsBtn);
            }
            // drop target to add items within splits
            var dropTarget = new CQ.Workflow.Transition.DropTarget(comp.getEl(), {
                canDrop: function(atts) {
                    if (atts.splitType) {
                        return false;
                    }
                    return true;
                },
                doDrop: function(atts) {
                    return comp.editor.insert(CQ.Ext.getCmp(this.id), atts);
                }
            });
        }
    },
    /**
     * Set properties modified with property grid
     */
    setProperties: function(props) {
        this.setDefault(props[CQ.I18n.getMessage('Default Route')]);
        this.nodeData.rule = props[CQ.I18n.getMessage('Rule')];
    },
    /**
     * Returns property object to be edited in property grid
     */
    getProperties: function() {
        var props = new Object();
        props[CQ.I18n.getMessage('Default Route')] = this.nodeData.metaData.isDefault == null ? false : this.nodeData.metaData.isDefault;
        props[CQ.I18n.getMessage('Rule')] = this.nodeData.rule == null ? '' : this.nodeData.rule;
        return props;
    },
    /**
     * Returns the editors for the properties of the object
     */
    getPropertyEditors: function() {
        return {};
    },
    /**
     * Callback for custom actions that must be executed after a property was changed
     */
    afterPropChange: function() {
        // disable other default split transitions, if this one is marked as default
        if (this.isDefault()) {
            if (this.previous.left == this) {
                this.previous.right.setDefault(false);
            } else if (this.previous.right == this) {
                this.previous.left.setDefault(false);
            }
        }
        this.editor.setDirty(true);
    },
    isDefault: function() {
        return this.nodeData.metaData.isDefault == null ? false : this.nodeData.metaData.isDefault;
    },
    setDefault: function(value) {
        this.nodeData.metaData.isDefault = value;
        var classModifier;
        if (this.nodeData.metaData.isDefault) {
            classModifier = function(comp, suffix) { comp.addClass(comp.cls + suffix); };
        } else {
            classModifier = function(comp, suffix) { comp.removeClass(comp.cls + suffix); };
        }
        var comp = this;
        while (!(comp instanceof CQ.Workflow.Join)) {
            classModifier(comp, this.isDefaultClassSuffix);
            comp = comp.next;
        }
    }
});

/**
 * Top-left split transition
 */
CQ.Workflow.Transition.TL = CQ.Ext.extend(CQ.Workflow.SplitTransition, { cls:'cq-wf-transition-tl' });
CQ.Ext.reg('cq.workflow.transition.tl', CQ.Workflow.Transition.TL);

/**
 * Top-right split transition
 */
CQ.Workflow.Transition.TR = CQ.Ext.extend(CQ.Workflow.SplitTransition, { cls:'cq-wf-transition-tr' });
CQ.Ext.reg('cq.workflow.transition.tr', CQ.Workflow.Transition.TR);
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
 * Base class for transition drop targets (for adding new items)
 * @abstract
 */
CQ.Workflow.Transition.DropTarget = CQ.Ext.extend(CQ.Ext.dd.DropTarget, {
	ddGroup:CQ.Workflow.Editor.DD_GROUP,
	notifyOver : function(dd, e, data) {
		if (data.node && this.canDrop(data.node.attributes)) {
			return this.dropAllowed;
		} else {
			return this.dropNotAllowed;
		}
    },
	notifyDrop: function(source, e, data) {
		if (data.node && this.canDrop(data.node.attributes)) {
			return this.doDrop(data.node.attributes);
		} else {
			return false;
		}
	},
	canDrop: function(atts) {
		// needs to be overwritten by sub classes
	},
	doDrop: function(atts) {
		// needs to be overwritten by sub classes
	}
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

/**
 * Base class for splits
 * @abstract
 */
CQ.Workflow.Split = CQ.Ext.extend(CQ.Ext.Container, {
    autoEl:'div', layout: 'absolute',
    listeners: {
        render: function(comp) {
            // add buton for deleting splits
            var deleteBtn = new CQ.Ext.BoxComponent({ 
                autoEl:'div', cls:'x-tool x-tool-close', 
                overCls: 'x-tool-close-over', 
                width:15, height:15, x:91, y:18,
                listeners: {
                    render: function(comp) {
                        comp.getEl().addListener('click', function() { 
                            comp.ownerCt.remove();
                        });
                        new CQ.Ext.ToolTip({ target: comp.getEl(), 
                            html: CQ.I18n.getMessage('Remove split from model') });
                    }
                }
            });
            comp.add(deleteBtn);
            
            // enable this to hide buttons if cursor is not over split
            comp.getEl().addListener('mouseover', function() { deleteBtn.show(); });
            comp.getEl().addListener('mouseout', function() { deleteBtn.hide(); });
            
            // drop target for inser iems before split
            var dropTarget = new CQ.Ext.dd.DropTarget(comp.getEl(), {
                ddGroup:CQ.Workflow.Editor.DD_GROUP,
                notifyDrop: function(source, e, data) {
                    return comp.editor.insert(
                        CQ.Ext.getCmp(this.id), data.node.attributes);
                }
            });
        }
    },
    setData: function(data) { this.nodeData = data; },
    getData: function() { return this.nodeData; },
    remove: function() {
        var split = this;
        CQ.Ext.MessageBox.confirm(CQ.I18n.getMessage('Delete Split?'), 
            CQ.I18n.getMessage('Do you really want to remove the split?') + '<br/>' 
            + CQ.I18n.getMessage('This will remove the whole split including all nested steps and can not be undone!'),
            function(btn) {
                if (btn == "yes") {
                    split.editor.removeItem(split);
                }
            }
        );
    }
});

CQ.Ext.override(CQ.Workflow.Split, {
    /**
     * Fix size
     */
    doLayout : CQ.Ext.Container.prototype.doLayout.createSequence(function() {
        this.getEl().setWidth(200);
        this.getEl().setHeight(50);
        CQ.Workflow.Split.superclass.doLayout.call(this);
    })
});

CQ.Workflow.Split.AND = 'AND_SPLIT';
CQ.Workflow.Split.OR = 'OR_SPLIT';

CQ.Workflow.Split.BRANCH_LEFT = 'left';
CQ.Workflow.Split.BRANCH_RIGHT = 'right';

CQ.Workflow.Split.NEW_NAME = CQ.I18n.getMessage('Split');

/**
 * AND split
 */
CQ.Workflow.Split.And = CQ.Ext.extend(CQ.Workflow.Split, { cls:'cq-wf-split-and' });
CQ.Ext.reg('cq.workflow.split.and', CQ.Workflow.Split.And);

/**
 * OR split
 */
CQ.Workflow.Split.Or = CQ.Ext.extend(CQ.Workflow.Split, { cls:'cq-wf-split-or' });
CQ.Ext.reg('cq.workflow.split.or', CQ.Workflow.Split.Or);
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
 * Base class for joins
 * @abstract
 */
CQ.Workflow.Join = CQ.Ext.extend(CQ.Ext.Container, {
    autoEl:'div', layout: 'absolute',
    setData: function(data) { this.nodeData = data; },
    getData: function() { return this.nodeData; },
    listeners: {
        render: function(comp) {
            // delete button for removing the complete split
            var deleteBtn = new CQ.Ext.BoxComponent({ 
                autoEl:'div', cls:'x-tool x-tool-close', 
                overCls: 'x-tool-close-over', 
                width:15, height:15, x:91, y:18,
                listeners: {
                    render: function(comp) {
                        comp.getEl().addListener('click', function() { 
                            comp.ownerCt.split.remove();
                        });
                        new CQ.Ext.ToolTip({ target: comp.getEl(), 
                            html:CQ.I18n.getMessage('Remove split from model') });
                    }
                }
            });
            comp.add(deleteBtn);
            deleteBtn.hide();
            
            // enable this to hide buttons if cursor is not over join
            comp.getEl().addListener('mouseover', function() { deleteBtn.show(); });
            comp.getEl().addListener('mouseout', function() { deleteBtn.hide(); });
            
            // drop target for adding items after the join
            var dropTarget = new CQ.Ext.dd.DropTarget(comp.getEl(), {
                ddGroup:CQ.Workflow.Editor.DD_GROUP,
                notifyDrop: function(source, e, data) {
                    return comp.editor.insert(
                        CQ.Ext.getCmp(this.id), data.node.attributes);
                }
            });
        }
    }
});

CQ.Ext.override(CQ.Workflow.Join, {
    /**
     * Ensure size
     */
    doLayout : CQ.Ext.Container.prototype.doLayout.createSequence(function() {
        this.getEl().setWidth(200);
        this.getEl().setHeight(50);
        CQ.Workflow.Join.superclass.doLayout.call(this);
    })
});

CQ.Workflow.Join.AND = 'AND_JOIN';
CQ.Workflow.Join.OR = 'OR_JOIN';

CQ.Workflow.Join.NEW_NAME = 'Join';

/**
 * AND join
 */
CQ.Workflow.Join.And = CQ.Ext.extend(CQ.Workflow.Join, { cls:'cq-wf-join-and' });
CQ.Ext.reg('cq.workflow.join.and', CQ.Workflow.Join.And);

/**
 * OR join
 */
CQ.Workflow.Join.Or = CQ.Ext.extend(CQ.Workflow.Join, { cls:'cq-wf-join-or' });
CQ.Ext.reg('cq.workflow.join.or', CQ.Workflow.Join.And);
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
 * Property button for node panels
 */
var propBtn = {
    id:'gear',
    qtip:CQ.I18n.getMessage('Edit step properties'),
    handler: function(e, target, panel) {
        panel.editor.showProperties({ source:panel });
    }
};

/**
 * Remove button for node panels
 */
var closeBtn = {
    id:'close',
    qtip:CQ.I18n.getMessage('Remove step from model'),
    handler: function(e, target, node) { 
        CQ.Ext.MessageBox.confirm(CQ.I18n.getMessage('Delete Step?'),
                CQ.I18n.getMessage('Do you really want to remove the step?') + '<br/>' 
            + CQ.I18n.getMessage('This operation can not be undone!'),
            function(btn) {
                if (btn == "yes") {
                    node.editor.removeItem(node)
                }
            }
        );
    }
};

/**
 * Base class for nodes (workflow steps)
 * @abstract
 */
CQ.Workflow.NodeBase = CQ.Ext.extend(CQ.Ext.Panel, {
    title: CQ.I18n.getMessage('Step'), html: '', 
    width:200, height:50, frame:true, cls:'cq-wf-node',
    tooltipTemplate: new CQ.Ext.Template(
        '<div><b>'+CQ.I18n.getMessage("Title")+':</b> {title}</div>',
        '<div><b>'+CQ.I18n.getMessage("Description")+':</b> {description}</div>',
        '<div><b>'+CQ.I18n.getMessage("Type")+':</b> {type}</div>'
    ).compile(),
    listeners: {
        render: function(comp) {
            comp.updateUI();
            
            new CQ.Ext.ToolTip({
                target: comp.getEl(), width:200, trackMouse:false,
                html: comp.tooltipTemplate.apply({
                    title:comp.nodeData.title,
                    description:comp.nodeData.description,
                    type:comp.nodeData.type
                })
            });
        }
    },
    updateUI: function() {
        if (this.rendered) {
            var ellipsisTitle = CQ.Ext.util.Format.ellipsis(this.nodeData.title, 22);
            this.setTitle(ellipsisTitle, "node-" + this.nodeData.type);
            
            var ellipsisDesc = CQ.Ext.util.Format.ellipsis(this.nodeData.description, 34);
            this.body.dom.innerHTML = ellipsisDesc;

            this.setWidth(200);
            this.setHeight(50);
            
            this.getEl().setWidth(200);
            this.getEl().setHeight(50);
        }
    },
    setData: function(data) {
        this.nodeData = data;
        this.updateUI();
    },
    getData: function() {
        return this.nodeData;
    }
});
CQ.Ext.override(CQ.Workflow.NodeBase, {
    doLayout : CQ.Ext.Panel.prototype.doLayout.createSequence(function() {
        this.setWidth(200);
        this.setHeight(50);
        
        this.getEl().setWidth(200);
        this.getEl().setHeight(50);

        CQ.Workflow.NodeBase.superclass.doLayout.call(this);
    })
});

/**
 * Standard node (workflow step)
 */
CQ.Workflow.Node = CQ.Ext.extend(CQ.Workflow.NodeBase, {
    tools: [ propBtn, closeBtn ],
    DD_GROUP:'cq.workflow.node',
    
    listeners: {
        render: function(comp) {
            comp.updateUI();
            
            // HACK: (only one of many)
            // somehow it doesn't work to add a draggable configuration as described in API docs
            // so we need to init the DragSource by hand to enable dragging to ourself
            comp.dd = new CQ.Ext.Panel.DD(this, { ddGroup:CQ.Workflow.Node.DD_GROUP });
            
            new CQ.Ext.dd.DropTarget(comp.getEl(), {
                ddGroup:CQ.Workflow.Node.DD_GROUP,
                notifyDrop: function(source, e, data) {
                    if (comp != data.panel) {
                        var dragData = data.panel.nodeData;
                        data.panel.setData(comp.getData());
                        comp.setData(dragData);
                        
                        // HACK: (actually there are to much hacks here)
                        // somehow dragged panel is resized after copying the data
                        // and it does not react on component resize operations,
                        // so we need to fix this by hand
                        data.panel.body.dom.style.height = '13px';
                    }
                }
            });
            new CQ.Ext.ToolTip({
                target: comp.getEl(), width:200, trackMouse:false,
                html: comp.tooltipTemplate.apply({
                    title:comp.nodeData.title,
                    description:comp.nodeData.description,
                    type:comp.nodeData.type
                })
            });
        }
    },
    
    typeName: CQ.I18n.getMessage('Type'),
    userGroupName: CQ.I18n.getMessage('User/Group'),
    implName: CQ.I18n.getMessage('Implementation'),
    subWfName: CQ.I18n.getMessage('Sub Workflow'),
    titleName: CQ.I18n.getMessage('Title'),
    descName: CQ.I18n.getMessage('Description'),
    timeoutName: CQ.I18n.getMessage('Timeout'),
    toHandlerName: CQ.I18n.getMessage('Timeout Handler'),
    handlerAdvanceName: CQ.I18n.getMessage('Handler Advance'),
    processArgs: CQ.I18n.getMessage('Process Arguments'),
    doNotify: CQ.I18n.getMessage('Email notification'),
    formPath: CQ.I18n.getMessage('Form path'),
    
    /**
     * Apply properties edited with property grid
     */
    setProperties: function(props) {
        this.nodeData.title = props[this.titleName];
        this.nodeData.description = props[this.descName];
        this.nodeData.type = props[this.typeName];
        
        // set type specific properties
        if (this.nodeData.type == CQ.Workflow.Node.PARTICIPANT) {
            this.nodeData.metaData.PARTICIPANT = props[this.userGroupName];
            this.nodeData.metaData.DO_NOTIFY = props[this.doNotify];
            this.nodeData.metaData.FORM_PATH = props[this.formPath];
        } else if (this.nodeData.type == CQ.Workflow.Node.PROCESS) {
            this.nodeData.metaData.PROCESS = props[this.implName];
            this.nodeData.metaData.PROCESS_AUTO_ADVANCE = props[this.handlerAdvanceName];
            this.nodeData.metaData.PROCESS_ARGS = props[this.processArgs];
        } else if (this.nodeData.type == CQ.Workflow.Node.CONTAINER) {
            this.nodeData.metaData.CONTAINER = props[this.subWfName];
        }
        // set timeout properties
        if (props[this.timeoutName] == CQ.I18n.getMessage('Off')) {
            delete this.nodeData.metaData.timeoutMillis;
        } else {
            this.nodeData.metaData.timeoutMillis = CQ.Workflow.ModelUtil.getTimeoutValue(props[this.timeoutName]);
            if (CQ.Workflow.ModelUtil.propertyIsSet(props[this.toHandlerName])) {
                this.nodeData.metaData.timeoutHandler = props[this.toHandlerName];
            } else {
                this.nodeData.metaData.timeoutHandler = CQ.Workflow.Node.TIMEOUT_HANDLER;
            }
        }
        this.updateUI();
    },
    /**
     * Returns properties to be edited with property grid
     */
    getProperties: function() {
        var props = new Object();
        props[this.titleName] = this.nodeData.title;
        props[this.descName] = this.nodeData.description;
        props[this.typeName] = this.nodeData.type;
        
        // set type specific properties
        if (this.nodeData.type == CQ.Workflow.Node.PARTICIPANT) {
            props[this.userGroupName] = this.nodeData.metaData.PARTICIPANT == null ? '' : this.nodeData.metaData.PARTICIPANT;
            props[this.doNotify] = this.nodeData.metaData.DO_NOTIFY == null ? false : this.nodeData.metaData.DO_NOTIFY;
            props[this.formPath] = this.nodeData.metaData.FORM_PATH == null ? '' : this.nodeData.metaData.FORM_PATH;
        } else if (this.nodeData.type == CQ.Workflow.Node.PROCESS) {
            props[this.implName] = this.nodeData.metaData.PROCESS == null ? '' : this.nodeData.metaData.PROCESS;
            props[this.handlerAdvanceName] = this.nodeData.metaData.PROCESS_AUTO_ADVANCE == null ? true : this.nodeData.metaData.PROCESS_AUTO_ADVANCE;
            props[this.processArgs] = this.nodeData.metaData.PROCESS_ARGS == null ? '' : this.nodeData.metaData.PROCESS_ARGS;
        } else if (this.nodeData.type == CQ.Workflow.Node.CONTAINER) {
            props[this.subWfName] = this.nodeData.metaData.CONTAINER == null ? '' : this.nodeData.metaData.CONTAINER;
        }
        // set timeout properties
        props[this.timeoutName] = this.nodeData.metaData.timeoutMillis == null ? CQ.I18n.getMessage('Off') : CQ.Workflow.ModelUtil.getTimeoutDisplay(this.nodeData.metaData.timeoutMillis);
        props[this.toHandlerName] = this.nodeData.metaData.timeoutHandler == null ? '' : this.nodeData.metaData.timeoutHandler;
        return props;
    },
    
    /**
     * Returns the editors for the properties of the object
     */
    getPropertyEditors: function() {
        var editors = {};
        editors[this.typeName] = new CQ.Ext.grid.GridEditor(new CQ.Ext.form.ComboBox({
            triggerAction: 'all',
            selectOnFocus:true,
            editable:false,
            store:CQ.Workflow.Node.TYPES
        }));
        editors[this.userGroupName] = new CQ.Ext.grid.GridEditor(
            new CQ.Ext.form.ComboBox({
                store: new CQ.Ext.data.Store({
                    proxy: new CQ.Ext.data.HttpProxy({
                        url:"/libs/cq/workflow/content/console/participants.json",
                        method:"GET"
                    }),
                    reader: new CQ.Ext.data.JsonReader(
                        {
                            totalProperty: 'results',
                            root:'participants'
                        },
                        [ {name: 'pid'}, {name: 'label'} ]
                    )
                }),
                listeners: {
                    exception: function(obj, action, data, it, response) {
                        CQ.shared.HTTP.handleForbidden(response);
                    }
                },
                displayField:'label',
                valueField:'pid',
                selectOnFocus:true,
                triggerAction: 'all',
                allowBlank:false,
                editable:false
            })
         );
        editors[this.implName] = new CQ.Ext.grid.GridEditor(
            new CQ.Ext.form.ComboBox({
                store: new CQ.Ext.data.Store({
                    proxy: new CQ.Ext.data.HttpProxy({
                        url:"/libs/cq/workflow/content/console/process.json",
                        method:"GET"
                    }),
                    reader: new CQ.Ext.data.JsonReader(
                        {
                            totalProperty: 'results',
                            root:'processes'
                        },
                        [ {name: 'rid'}, {name: 'label'} ]
                    )
                }),
                listeners: {
                    exception: function(obj, action, data, it, response) {
                        CQ.shared.HTTP.handleForbidden(response);
                    }
                },
                displayField:'label',
                valueField:'rid',
                selectOnFocus:true,
                triggerAction: 'all',
                allowBlank:false,
                editable:false
            })
         );
        editors[this.subWfName] = new CQ.Ext.grid.GridEditor(
            new CQ.Ext.form.ComboBox({
                store: new CQ.Ext.data.Store({
                    proxy: new CQ.Ext.data.HttpProxy({
                        url:"/libs/cq/workflow/content/console/workflows.json",
                        method:"GET"
                    }),
                    reader: new CQ.Ext.data.JsonReader(
                        {
                            totalProperty: 'results',
                            root:'workflows'
                        },
                        [ {name: 'wid'}, {name: 'label'} ]
                    )
                }),
                listeners: {
                    exception: function(obj, action, data, it, response) {
                        CQ.shared.HTTP.handleForbidden(response);
                    }
                },
                displayField:'label',
                valueField:'wid',
                selectOnFocus:true,
                triggerAction: 'all',
                allowBlank:false,
                editable:false
            })
         );
        editors[this.titleName] = new CQ.Ext.grid.GridEditor(new CQ.Ext.form.TextField({allowBlank:false}));
        editors[this.descName] = new CQ.Ext.grid.GridEditor(new CQ.Ext.form.TextField({allowBlank:false}));
        editors[this.timeoutName] = new CQ.Ext.grid.GridEditor(new CQ.Ext.form.ComboBox({
            triggerAction: 'all',selectOnFocus:true,
            store:CQ.Workflow.Node.TIMEOUT_INTERVAL
        }));
        editors[this.toHandlerName] = new CQ.Ext.grid.GridEditor(new CQ.Ext.form.ComboBox({
            store: new CQ.Ext.data.Store({
                proxy: new CQ.Ext.data.HttpProxy({
                    url:"/libs/cq/workflow/content/console/process.json",
                    method:"GET"
                }),
                reader: new CQ.Ext.data.JsonReader(
                    {
                        totalProperty: 'results',
                        root:'processes'
                    },
                    [ {name: 'rid'}, {name: 'label'} ]
                )
            }),
            listeners: {
                exception: function(obj, action, data, it, response) {
                    CQ.shared.HTTP.handleForbidden(response);
                }
            },
            displayField:'label',
            valueField:'rid',
            selectOnFocus:true,
            triggerAction: 'all',
            editable:false
        }));
        editors[this.doNotify] = new CQ.Ext.grid.GridEditor(new CQ.Ext.form.ComboBox({
            triggerAction: 'all',selectOnFocus:true,
            store:CQ.Workflow.Node.DO_NOTIFY_OPTS
        }));
        editors[this.formPath] = new CQ.Ext.grid.GridEditor(new CQ.form.PathField({
            fieldLabel:CQ.I18n.getMessage("Forms Path"),
            predicate: "hierarchy",
            listeners:{
                dialogselect:{
                    fn:function(pathField, path, anchor) {
                        this.nodeData.metaData.FORM_PATH = path;
                        this.afterPropChange();
                    },
                    scope:this
                }
            }
        }));
        return editors;
    },
    
    /**
     * Callback for custom actions that must be executed after a property was changed
     */
    afterPropChange: function() {
        this.editor.setDirty(true);
        this.editor.showProperties({ source:this });
    }
});
CQ.Ext.reg('cq.workflow.node', CQ.Workflow.Node);

// TODO check panel extensions so that node types can be initialized before Node Panel
CQ.Workflow.Node.ID_PREFIX = 'node';
CQ.Workflow.Node.NEW_NAME = CQ.I18n.getMessage('New Step');
CQ.Workflow.Node.NEW_DESC = CQ.I18n.getMessage('Description of the new step');

CQ.Workflow.Node.START = CQ.I18n.getMessage('Start');
CQ.Workflow.Node.END = CQ.I18n.getMessage('End');
CQ.Workflow.Node.CONTAINER = CQ.I18n.getMessage('Container');
CQ.Workflow.Node.PARTICIPANT = CQ.I18n.getMessage('Participant');
CQ.Workflow.Node.PROCESS = CQ.I18n.getMessage('Process');

// TODO: do not translate values!!!
CQ.Workflow.Node.TYPES = [
    [ CQ.Workflow.Node.CONTAINER, CQ.Workflow.Node.CONTAINER ],
    [ CQ.Workflow.Node.PARTICIPANT, CQ.Workflow.Node.PARTICIPANT ],
    [ CQ.Workflow.Node.PROCESS, CQ.Workflow.Node.PROCESS ]
];

CQ.Workflow.Node.TIMEOUT_HANDLER = 'com.day.cq.workflow.timeout.autoadvance.AutoAdvancer';
CQ.Workflow.Node.TIMEOUT_INTERVAL = [
    [ CQ.I18n.getMessage('Off'), CQ.I18n.getMessage('Off'), null ],
    [ CQ.I18n.getMessage('Immediate'), CQ.I18n.getMessage('Immediate'), 0 ],
    [ CQ.I18n.getMessage('1h'), CQ.I18n.getMessage('1h'), 3600 ],
    [ CQ.I18n.getMessage('6h'), CQ.I18n.getMessage('6h'), 21600 ],
    [ CQ.I18n.getMessage('12h'), CQ.I18n.getMessage('12h'), 43200 ],
    [ CQ.I18n.getMessage('24h'), CQ.I18n.getMessage('24h'), 86400 ]
];

CQ.Workflow.Node.DO_NOTIFY_OPTS = [
    [ 'off', CQ.I18n.getMessage('Off')],
    [ 'on', CQ.I18n.getMessage('On')]
]

/**
 * Special node for workflow start (reduces possible actions and sets some standard properties)
 */
CQ.Workflow.Node.Start = CQ.Ext.extend(CQ.Workflow.NodeBase, {
    nodeTitle:CQ.I18n.getMessage('Start'),
    nodeDescription:CQ.I18n.getMessage("Start of the workflow"),
    nodeType:CQ.Workflow.Node.START
});
CQ.Ext.reg('cq.workflow.node.start', CQ.Workflow.Node.Start);

/**
 * Special node for workflow end (reduces possible actions and sets some standard properties)
 */
CQ.Workflow.Node.End = CQ.Ext.extend(CQ.Workflow.NodeBase, {
    nodeTitle:CQ.I18n.getMessage('End'),
    nodeDescription:CQ.I18n.getMessage("End of the workflow"),
    nodeType:CQ.Workflow.Node.END
});
CQ.Ext.reg('cq.workflow.node.end', CQ.Workflow.Node.End);
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
 * Provides utility methods for working with workflow models
 */
CQ.Workflow.ModelUtil = {
	/**
	 * Returns outgoing transitions
	 */
	getOuts: function(node, transitions) {
		var outs = new Array();
		for (var i=0; i<transitions.length; i++) {
			if (transitions[i].from == node.id) {
				outs.push(transitions[i]);
			}
		}
		return outs;
	},
	
	/**
	 * Returns end nodes of a transition
	 */
	getTransitionEnds: function(transition, nodes) {
		var ends = new Array();
		for (var i=0; i<nodes.length; i++) {
			if (nodes[i].id == transition.to) {
				ends.push(nodes[i]);
			}
		}
		return ends;
	},
	
	/**
	 * Returns the start node
	 */
	getStartNode: function(nodes) {
		for (var i=0; i<nodes.length; i++) {
			if (nodes[i].type == CQ.Workflow.Node.START) {
				return nodes[i];
			}
		}
		return null;
	},
	
	/**
	 * Returns the end node
	 */
	getEndNode: function(nodes) {
		for (var i=0; i<nodes.length; i++) {
			if (nodes[i].type == CQ.Workflow.Node.END) {
				return nodes[i];
			}
		}
		return null;
	},
	
	/**
	 * Returns the respective join of the split
	 */
	getJoin: function(split, transitions, nodes) {
		var outs = this.getOuts(split, transitions);
		var ends = this.getTransitionEnds(outs[0], nodes);
		while ((ends[0].type != CQ.Workflow.Join.OR)
			&& (ends[0].type != CQ.Workflow.Join.AND)) {
			outs = this.getOuts(ends[0], transitions);
			ends = this.getTransitionEnds(outs[0], nodes);
		}
		return ends[0];
	},
	
	/**
	 * Creates a copy of an object
	 */
	// TODO use CQ.util.copyObject() instead
	copyObject: function(object) {
		var newObj;
	    if (object instanceof Array) {
	    	newObj = new Array();
	        for (var i = 0; i < object.length; i++) {
	        	if (typeof object[i] == "object") {
	            	newObj.push(CQ.Workflow.ModelUtil.copyObject(object[i]));
	            } else {
	            	newObj.push(object[i]);
	            }
	        }
	    } else {
			newObj = new Object();
	        for (var i in object) {
	        	if (typeof object[i] == "object") {
	        		newObj[i] = CQ.Workflow.ModelUtil.copyObject(object[i]);
	        	} else {
	        		newObj[i] = object[i];
	        	}
	    	}
		}
		return newObj;
	},
	
	/**
	 * Checks if a properties is set
	 */
	propertyIsSet: function(property) {
		return (property != null) && (property != "") && (property != "undefined");
	},
	
	/**
	 * Returns a new node data
	 */
	getNewNodeData: function(editor, type, id) {
		var data = this.getNewData(editor, type, id);
		data.title = CQ.Workflow.Node.NEW_NAME;
		data.description = CQ.Workflow.Node.NEW_DESC;
		return data;
	},
	
	/**
	 * Returns a new split data
	 */
	getNewSplitData: function(editor, type, id) {
		var data = this.getNewData(editor, type, id);
		data.title = CQ.Workflow.Split.NEW_NAME;
		return data;
	},
	
	/**
	 * Returns a new join data
	 */
	getNewJoinData: function(editor, type, id) {
		var data;
		if (type == CQ.Workflow.Split.AND) {
			data = this.getNewData(editor, CQ.Workflow.Join.AND, id);
		} else if (type == CQ.Workflow.Split.OR) {
			data = this.getNewData(editor, CQ.Workflow.Join.OR, id);
		}
		data.title = CQ.Workflow.Join.NEW_NAME;
		return data;
	},
	
	/**
	 * Creates a new data object
	 */
	getNewData: function(editor, type, id) {
		var data = new Object();
		data.metaData = new Object();
		data.type = type;
		
		if (id) data.id = id;
		else data.id = this.findNextID(editor);
		
		return data;
	},
	
	/**
	 * Creates display value for timeouts
	 */
	getTimeoutDisplay: function(value) {
		for (var i=0; i<CQ.Workflow.Node.TIMEOUT_INTERVAL.length; i++) {
			if (value == CQ.Workflow.Node.TIMEOUT_INTERVAL[i][2]) {
				return CQ.Workflow.Node.TIMEOUT_INTERVAL[i][0];
			}
		}
		return value;
	},
	
	/**
	 * Creates real timeout value from display value
	 */
	getTimeoutValue: function(value) {
		for (var i=0; i<CQ.Workflow.Node.TIMEOUT_INTERVAL.length; i++) {
			if (value == CQ.Workflow.Node.TIMEOUT_INTERVAL[i][0]) {
				return CQ.Workflow.Node.TIMEOUT_INTERVAL[i][2];
			}
		}
		return value;
	},
	
	/**
	 * Returns next node ID to be used
	 */
	findNextID: function(editor) {
		var maxID = 0;
		
		var wrapper = editor.getWrapper();
		for (var i=0; i<wrapper.items.getCount(); i++) {
			var column = wrapper.items.get(i);
			
			for (var j=0; j<column.items.getCount(); j++) {
				var item = column.items.get(j);
				
				if (item instanceof CQ.Workflow.NodeBase) {
					var id = parseInt(item.nodeData.id.substr(
						CQ.Workflow.Node.ID_PREFIX.length, 
						item.nodeData.id.length));

					if (id > maxID) {
						maxID = id
					};
				}
			}
		}
		return CQ.Workflow.Node.ID_PREFIX + ++maxID;
	},
	
	/**
	 * Generates next ID from given ID
	 */
	generateNextID: function(idString) {
		var id = parseInt(idString.substr(
			CQ.Workflow.Node.ID_PREFIX.length, 
			idString.length));
		return CQ.Workflow.Node.ID_PREFIX + ++id;
	},
	
	/**
	 * Convert node types to more readable (internationalized) node types
	 */
	convertToLocalNodeTypes: function(nodes) {
		this.convertNodeTypes(nodes, 
			CQ.Workflow.ModelUtil.REMOTE_TYPES, 
			CQ.Workflow.ModelUtil.LOCAL_TYPES);
	},
	
	/**
	 * Converts more readable (internationalized) node types back to real node types
	 */
	convertToRemoteNodeTypes: function(nodes) {
		this.convertNodeTypes(nodes, 
			CQ.Workflow.ModelUtil.LOCAL_TYPES,
			CQ.Workflow.ModelUtil.REMOTE_TYPES);
	},
	
	/**
	 * Converts node types
	 * @private
	 */
	convertNodeTypes: function(nodes, from, to) {
		for (var i=0; i<nodes.length; i++) {
			var node = nodes[i];
			
			// convert node types
			for (var j=0; j<from.length; j++) {
				if (node.type == from[j]) {
					node.type = to[j];
				}
			}
		}
	}
}

CQ.Workflow.ModelUtil.LOCAL_TYPES = [ 
	CQ.Workflow.Node.START,
	CQ.Workflow.Node.END,
	CQ.Workflow.Node.CONTAINER,
	CQ.Workflow.Node.PARTICIPANT,
	CQ.Workflow.Node.PROCESS
];

CQ.Workflow.ModelUtil.REMOTE_TYPES = [ 
	'START', 'END', 'CONTAINER', 'PARTICIPANT', 'PROCESS'
];

/**
 * Placeholder for ensuring split layouts (just an empty box with right size)
 */
CQ.Workflow.Split.Placeholder = CQ.Ext.extend(CQ.Ext.BoxComponent, {
	autoEl:'div',
	listeners: {
		render: function(comp) {
			comp.setWidth(200);
			comp.setHeight(50);
		}
	}
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

/**
 * Utility methods for the workflow editor
 */
CQ.Workflow.EditorUtil = {
    /**
     * Add placeholder for correc layout of items outside of splits
     */
    addColumnPlaceholder: function(target, index) {
        for (var i=0; i<index; i++) {
            target.add(new CQ.Workflow.Split.Placeholder());
        }
    },
    
    /**
     * Remove item placeholder
     */
    removePlaceholder: function(wrapper, column, index) {
        var cIndex = wrapper.getIndex(column);
        if (cIndex > 0) {
            column = wrapper.getComponent(cIndex - 1);
            CQ.Workflow.EditorUtil.removeIfPlaceholder(column, index);
            CQ.Workflow.EditorUtil.removeIfPlaceholder(column, index);
            
            column = wrapper.getComponent(cIndex + 1);
            CQ.Workflow.EditorUtil.removeIfPlaceholder(column, index);
            CQ.Workflow.EditorUtil.removeIfPlaceholder(column, index);
        }
    },
    
    /**
     * Remove only if really a placeholder
     */
    removeIfPlaceholder: function(column, index) {
        if (column.getComponent(index) instanceof CQ.Workflow.Split.Placeholder) {
            column.remove(column.getComponent(index));
        }
    },
    
    /**
     * Add split placeholder for correct layout
     */
    addPlaceholder: function(wrapper, column, index, count) {
        var cIndex = wrapper.getIndex(column);
        if (cIndex > 0) {
            for (var i=0; i<count; i++) {
                wrapper.getComponent(cIndex - 1).insert(index, new CQ.Workflow.Split.Placeholder());
                wrapper.getComponent(cIndex + 1).insert(index, new CQ.Workflow.Split.Placeholder());
            }
        }
    },
    
    /**
     * Create and add items of a new branch
     */
    createBranchItems: function(split, join, branch, column, index, preventPlaceholderDelete, idHint, editor) {
        var top, bottom;
        if (branch == CQ.Workflow.Split.BRANCH_LEFT) {
            bottom = new CQ.Workflow.Transition.BL({ editor:editor });
            top = new CQ.Workflow.Transition.TL({ editor:editor });
            top.setData({ metaData:{ branch: CQ.Workflow.Split.BRANCH_LEFT } });
                        
            split.left = top;
            join.left = bottom;
        } else if (branch == CQ.Workflow.Split.BRANCH_RIGHT) {
            bottom = new CQ.Workflow.Transition.BR({ editor:editor });
            top = new CQ.Workflow.Transition.TR({ editor:editor });
            top.setData({ metaData:{ branch: CQ.Workflow.Split.BRANCH_RIGHT } });
                        
            split.right = top;
            join.right = bottom;
        }       
        bottom.setData({ metaData:{} });
        top.bottom = bottom;
        bottom.top = top;
                
        var node = new CQ.Workflow.Node({ editor:editor });
        node.split = split;
        node.setData(CQ.Workflow.ModelUtil.getNewNodeData(this, 
            CQ.Workflow.Node.PARTICIPANT, 
            CQ.Workflow.ModelUtil.generateNextID(idHint)));
        
        top.previous = split;
        top.next = node;

        node.previous = top;
        node.next = bottom;

        bottom.previous = node;
        bottom.next = join;
        
        if (index) {
            if (!preventPlaceholderDelete) {
                column.remove(index);
            }
            column.insert(index, bottom);
            column.insert(index, node);
            column.insert(index, top);
        } else {
            column.add(top);
            column.add(node);
            column.add(bottom);
        }
        return { split:split, join:join, node:node };
    },
    
    /**
     * Ensure correct branch layout
     * @static
     */
    checkSplitLayout: function(split, editor) {
        var lCount = this.getBranchLength(split.left.next);
        var rCount = this.getBranchLength(split.right.next);
        
        var column = split.ownerCt;
        var splitIndex = column.getIndex(split);
        
        // remove split placeholder
        var item = column.getComponent(splitIndex + 1);
        while (!(item instanceof CQ.Workflow.Join)) {
            column.remove(item);
            item = column.getComponent(splitIndex + 1);
        }
        // insert new placeholder
        var pCount = lCount >= rCount ? lCount : rCount;
        for (var i=0; i<pCount; i++) {
            column.insert(splitIndex + 1, new CQ.Workflow.Split.Placeholder());
        }
        // adapt branches (insert placeholder transitions)
        this.removePlaceholderTransitions(split.left);
        this.removePlaceholderTransitions(split.right);
        if (lCount != rCount) {
            var branch = lCount < rCount ? 'left' : 'right';
            this.appendPlaceholderTransitions(split[branch], Math.abs(lCount - rCount), editor);
        }
    },
    
    /**
     * Calculate length of a branch
     * @private
     */
    getBranchLength: function(item, endType) {
        var result = 0;
        while ((!(item instanceof CQ.Workflow.Transition.BL))
            && (!(item instanceof CQ.Workflow.Transition.BR))) {
            result++;
            item = item.next;
        }
        return result;
    },
    
    /**
     * Remove placeholder transitions
     * @private
     */
    removePlaceholderTransitions: function(start, endType) {
        var column = start.ownerCt;
        var index = column.getIndex(start) + 1;
        
        var item = column.getComponent(index);
        while ((!(item instanceof CQ.Workflow.Transition.BL))
            && (!(item instanceof CQ.Workflow.Transition.BR))) {
            if (item instanceof CQ.Workflow.Transition.Placeholder) {
                column.remove(item);
                item = column.getComponent(index);
            } else {
                item = column.getComponent(++index);
            }
        }
    },
    
    /**
     * Add placeholder transitions
     * @private
     */
    appendPlaceholderTransitions: function(branch, count, editor) {
        var column = branch.ownerCt;
        var index = column.getIndex(branch) + 1;
        
        var item = column.getComponent(index);
        while ((!(item instanceof CQ.Workflow.Transition.BL))
            && (!(item instanceof CQ.Workflow.Transition.BR))) {
            item = column.getComponent(++index);
        }
        for (var i=0; i<count; i++) {
            column.insert(index, new CQ.Workflow.Transition.Placeholder({ editor:editor }));
        }
    }
}

/**
 * Placeholder for ensuring split layouts
 */
CQ.Workflow.Split.Placeholder = CQ.Ext.extend(CQ.Ext.BoxComponent, {
    autoEl:'div',
    listeners: {
        render: function(comp) {
            comp.setWidth(200);
            comp.setHeight(50);
        }
    }
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

CQ.workflow.InboxUtil = function() {
    var FILTER_PREFIX = "filter-";
    
    var titleTpl = new CQ.Ext.XTemplate(
        '<tpl if="payloadExists">',
            '<div>{title}</div>',
        '</tpl>',
        '<tpl if="!payloadExists">',
            '<div class="payload-error">{payloadErrorMsg}</div>',
        '</tpl>',
        '<tpl if="comment">',
            '<div class="comment">{comment}</div>',
        '</tpl>');
        
    var payloadTpl = new CQ.Ext.XTemplate(
        '<div class="payload-summary">',
            '<tpl if="icon"><div class="payload-summary-icon"><img src="{icon}"></div></tpl>',
            '<tpl if="payloadExists">',
                '<div><a href="javascript:CQ.shared.Util.open(\'{url}\');void(0);">{title}</a></div>',
            '</tpl>',
            '<tpl if="!payloadExists">',
                '<div>{payload}</div><div class="payload-error">{payloadErrorMsg}</div>',
            '</tpl>',
            '<tpl if="description"><div class="payload-summary-description">{description}</div></tpl>',
        '</div>');
    
    titleTpl.compile();
    payloadTpl.compile();
    
    return CQ.Ext.apply(new CQ.Ext.util.Observable (), {
        getInbox: function() {
            return CQ.Ext.getCmp(CQ.workflow.Inbox.List.ID);
        },
        
        getPayloadTitle: function(payload, record) {
            var title = record.get("payloadTitle");
            if (!title) {
                title = CQ.shared.XSS.getXSSRecordPropertyValue(record, "payloadPath")
            }
            if (!title && "Task" === record.get("inboxItemType") && record.json && record.json.taskInfo) {
                if (CQ.workflow.InboxUtil.isProjectTask(record)) {
                   title = CQ.I18n.getMessage("Project Management");
                } else {
                    // if there is still no title and we're dealing with a path,
                    // show the tasks 'contentPath';
                    title = record.json.taskInfo.contentPath;
                }
            }
            return title;
        },
        
        renderTitleAndComment: function(value, p, record) {
            return titleTpl.apply({
                "title": CQ.workflow.InboxUtil.getTitleValue(value, record),
                "comment": record.get("comment"),
                "payloadExists": CQ.workflow.InboxUtil.getPayloadValue(record),
                "payloadErrorMsg": CQ.I18n.getMessage("Unknown resource")
            });
        },

        renderPayload: function(value, p, record) {
            if (!value && CQ.workflow.InboxUtil.isProjectTask(record)) {
                value = CQ.workflow.InboxUtil.getProjectAdminUrl(record);
            }
            var url = CQ.HTTP.externalize(CQ.shared.XSS.getXSSValue(CQ.HTTP.encodePath(
                    value.replace(/%/g, "%25").replace(/'/g, "%27").replace(/\\/g, "%5C")
            )));
            var title = CQ.workflow.InboxUtil.getPayloadTitle(value, record);
            var icon = record.get("payloadSummary").icon;
            return payloadTpl.apply({
                "title": title,
                "url": url,
                "description": record.get("payloadSummary").description,
                "icon": icon ? CQ.HTTP.externalize(CQ.shared.XSS.getXSSValue(CQ.HTTP.encodePath(icon))) : null,
                "payload": CQ.shared.XSS.getXSSValue(CQ.workflow.InboxUtil.getPayloadValue(record)),
                "payloadExists": CQ.workflow.InboxUtil.getPayloadValue(record),
                "payloadErrorMsg": CQ.I18n.getMessage("The resource used to start this instance does not exist anymore.")
            });
        },

        getPayloadValue: function(record) {
            if ("Task" ===record.get("inboxItemType")) {
                if (record.json.taskInfo.contentPath) {
                    return record.json.taskInfo.contentPath;
                }
                return "no content specified";
            }
            return record.get("payloadPath");
        },

        getTitleValue: function(value, record) {
            if ("Task" !== record.get("inboxItemType")) {
                return value;
            }
            // for tasks always show the name
            return record.json.taskInfo.name;
        },

        isProjectTask: function(record) {
            if (record.json && record.json.taskInfo && record.json.taskInfo.taskType && "project" === record.json.taskInfo.taskType.toLowerCase()) {
                return true;
            }
            return false;
        },

        getProjectAdminUrl: function(record) {
            if (CQ.workflow.InboxUtil.isProjectTask(record)) {
                var result = "libs/cq/taskmanagement/content/taskmanager.html#/tasks/";
                var taskUiPath = "";
                // use the ID as the UI path, however strip off everything until the first /

                var taskId = record.json.taskInfo.id;
                if (taskId.indexOf("/") != -1) {
                    var indexAfterSlash = 1 + taskId.indexOf("/");
                    if (indexAfterSlash < taskId.length) {
                        taskUiPath = taskId.substring(indexAfterSlash);
                    }
                    return result + taskUiPath;
                }
                return result + record.json.taskInfo.name;
            }
            return "";
        },

        formatDate: function(date) {
            if (typeof date == "number") {
                date = new Date(date);
            }
            return date.format(CQ.I18n.getMessage("d-M-Y H:i", null, "Date format for ExtJS GridPanel (short, eg. two-digit year, http://extjs.com/deploy/ext/docs/output/Date.html)"));
        },

        getFilterFields: function() {
            var fields = [];
            var inbox = CQ.workflow.InboxUtil.getInbox();
            
            var tbar = inbox.getTopToolbar();
            if (tbar && tbar.items) {
                tbar.items.each(function(item) {
                    if (item instanceof CQ.Ext.form.Field) {
                        if (item.getName().match("^" + FILTER_PREFIX) == FILTER_PREFIX) {
                            fields.push(item);
                        }
                    }
                });
            }
            return fields;
        },
        
        registerForInboxSelection: function(btn) {

            var inbox = CQ.workflow.InboxUtil.getInbox();

            inbox.getSelectionModel().on("selectionchange", function(selModel) {

                if (selModel.hasSelection()) {

                    var records = selModel.getSelections();
                    if (records && records.length > 0) {
                        if (btn.supportedItemTypes) {
                            // loop over all records and only enable menu items available for all records
                            var recordNum;
                            var showItem = true;
                            for (recordNum=0; recordNum < records.length; recordNum++){
                                if (!btn.supportedItemTypes[records[recordNum].get("inboxItemType")]) {
                                    showItem = false;
                                    break;
                                }
                            }
                            btn.setDisabled(!showItem);
                        } else {
                            btn.setDisabled(false);
                        }
                    } else {
                        btn.setDisabled(true);
                    }
                } else {
                    btn.setDisabled(true);
                }
            });
        },

        showDetails: function() {
            var inbox = CQ.workflow.InboxUtil.getInbox();
            var items = inbox.getSelectionModel().getSelections();
            var action = CQ.Ext.getCmp("cq-workflow-inbox-details");

            if (items) {
                var itemType;
                if (items[0] && items[0].data && items[0].data.inboxItemType) {
                    itemType = items[0].data.inboxItemType;
                }
                if (itemType === "Task") {
                    CQ.workflow.InboxUtil.showTaskDetails(items[0].json.taskInfo);
                } else if (itemType === "FailureItem") {
                    var failureInfo = {
                        message: items[0].json.failureInfo.failureMessage,
                        stepTitle: items[0].json.failureInfo.failedNodeTitle,
                        stack: items[0].json.failureInfo.failureStack
                    };

                    var dialog = new CQ.workflow.FailureInfoDialog({}, failureInfo);
                    dialog.show();
                }
            }
        },

        showTaskDetails: function(taskInfo) {
            if (taskInfo === undefined) {
                return;
            }

            CQ.taskmanagement.TaskManagementAdmin.showTaskDetails(taskInfo, function(updatedTaskInfo) {
                var inbox = CQ.workflow.InboxUtil.getInbox();
                var items = inbox.getSelectionModel().getSelections();

                items[0].json.taskInfo = updatedTaskInfo;
                items[0].description = updatedTaskInfo.description;
                items[0].desc = updatedTaskInfo.description;
                items[0].participant = updatedTaskInfo.taskOwner;
                items[0].currentAssignee = updatedTaskInfo.taskOwner;
                /* shouldn't have to reload the entire store, however can't find an alternative. */
                CQ.workflow.InboxUtil.getInbox().reload();
            });
        }
    });
}();
/**
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
 */
CQ.workflow.FailureInfoDialog = CQ.Ext.extend(CQ.Dialog, {
    okHandler: function() {},

    constructor: function(config, failureInfo) {
        if (!config) {
            config = {};
        }
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }

        this.failureInfo = failureInfo;

        var panelConfig = {
            xtype: "panel",
            border: true,
            "buttonAlign": "right",
            "autoScroll": true,
            "margins": this.tabPanel ? "5 0 5 0" : "5 5 5 0",
            "labelWidth": 120,
            "defaults": {
                "anchor": CQ.Ext.isIE6 ? "92%" : CQ.Ext.isIE7 ? "96%" : "95%",
                "stateful": false
            },
            layout: {
                type: "form"
            },
            items: [
                {
                    xtype: 'textarea',
                    name: 'failureMessage',
                    fieldLabel: CQ.I18n.getMessage("Failure Message"),
                    readOnly: true
                },
                {
                    xtype: 'textfield',
                    name: 'failureStepTitle',
                    fieldLabel: CQ.I18n.getMessage("Step"),
                    readOnly: true
                },
                {
                    xtype: 'textarea',
                    name: 'failureStack',
                    fieldLabel: CQ.I18n.getMessage("Failure Stack"),
                    readOnly: true
                }
            ]
        };

        this.failureInfoPanel = new CQ.Ext.Panel(panelConfig); // new CQ.Ext.FormPanel(panelConfig);

        configDefaults = {
            closable: true,
            width: 615,
            border: false,
            modal: true,
            title: CQ.I18n.getMessage("Failure Details"),
            okText: CQ.I18n.getMessage("Ok"),
            items: {
                xtype: "panel",
                items: [
                    {
                        xtype: 'textarea',
                        name: 'failureMessage',
                        fieldLabel: CQ.I18n.getMessage("Failure Message"),
                        readOnly: true
                    },
                    {
                        xtype: 'textfield',
                        name: 'failureStepTitle',
                        fieldLabel: CQ.I18n.getMessage("Step"),
                        readOnly: true
                    },
                    {
                        xtype: 'textarea',
                        name: 'failureStack',
                        fieldLabel: CQ.I18n.getMessage("Failure Stack"),
                        readOnly: true,
                        anchor: CQ.themes.Dialog.ANCHOR + " -120px"
                    }
                    ]
            },

            buttons: [
                CQ.Dialog.OK
            ]
        };

        CQ.Util.applyDefaults(config, configDefaults);

        CQ.workflow.FailureInfoDialog.superclass.constructor.call(this, config);

        this.updateFailureInfoInUI();
    },

    updateFailureInfoInUI: function() {
        this.find("name", "failureMessage")[0].setValue(this.failureInfo.message);
        this.find("name", "failureStepTitle")[0].setValue(this.failureInfo.stepTitle?this.failureInfo.stepTitle:CQ.I18n.getMessage("Step title not available"));
        this.find("name", "failureStack")[0].setValue(this.failureInfo.stack?this.failureInfo.stack:CQ.I18n.getMessage("No Failure Stack information available"));
    }
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

/**
 * @class CQ.workflow.Inbox
 * @extends CQ.Ext.Viewport
 * The Inbox is a console providing access to work items.
 * @constructor
 * Creates a new Inbox.
 * @param {Object} config The config object
 */
CQ.workflow.Inbox = CQ.Ext.extend(CQ.Ext.Viewport, {
    shortcuts: [],
    
    constructor: function(config) {
        this.title = config.title;

        config = CQ.Util.applyDefaults(config, {
            "id": "cq-workflow-inbox"
        });

        this.debug = config.debug;
        var admin = this;
        var id = config.id;

        var body = CQ.Ext.getBody();
        body.setStyle("margin", "0");
        if (CQ.Ext.isIE) {
            body.dom.scroll = "no";
        } else {
            body.setStyle("overflow", "hidden");
        }
        
        var tbar = null;
        if (config.extensions) {
            if (config.extensions[CQ.workflow.Inbox.EXTENSION_TBAR]) {
                tbar = config.extensions[CQ.workflow.Inbox.EXTENSION_TBAR];
                tbar = CQ.Util.sortByRanking(tbar);
                
                // #20668 - add help
                var helpConfig = CQ.wcm.HelpBrowser.createHelpButton();
                helpConfig.id = id + "-help";
                tbar.push(helpConfig);

                for (var i=0; i<tbar.length; i++) {
                    if (tbar[i].sc) {
                        this.shortcuts.push(tbar[i].sc);
                    }
                }
            }
        }
        var cols = null;
        if (config.extensions) {
            if (config.extensions[CQ.workflow.Inbox.EXTENSION_COLS]) {
                cols = config.extensions[CQ.workflow.Inbox.EXTENSION_COLS];
                cols = CQ.Util.sortByRanking(cols);
            }
        }

        // list
        var listConfig = CQ.Util.applyDefaults(config.listConfig, {
            region:"center",
            margins:"5 5 5 5",
            stateful:true,
            tbar:tbar,
            cm:new CQ.Ext.grid.ColumnModel({
                columns:cols,
                defaultSortable:true
            })
        });
        
        // init component by calling super constructor
        CQ.workflow.Inbox.superclass.constructor.call(this, {
            "id":id,
            "cls":"cq-workflow-inbox-wrapper",
            "layout":"border",
            "border":false,
            "renderTo":CQ.Util.ROOT_ID,
            "items": [
                {
                    "id":"cq-header",
                    "xtype":"container",
                    "cls":id + "-header",
                    "autoEl":"div",
                    "region":"north",
                    "items":[
                        {
                            "xtype":"panel",
                            "border":false,
                            "layout":"column",
                            "cls": "cq-header-toolbar",
                            "items": [
                                new CQ.Switcher({}),
                                new CQ.UserInfo({}),
                                new CQ.HomeLink({})
                            ]
                        }
                    ]
                },{
                    cls:"cq-" + id + "-wrapper",
                    xtype:"panel",
                    region:"center",
                    layout:"border",
                    border:false,
                    items:[
                        new CQ.workflow.Inbox.List(listConfig)
                    ]
                }
            ]
        });

        // init history, check for anchor and open tree
        new CQ.Ext.form.Hidden({
            "id":CQ.Ext.History.fieldId,
            "renderTo":CQ.Util.ROOT_ID
        });
        var historyFrame = document.createElement("iframe");
        historyFrame.id = CQ.Ext.History.iframeId;
        historyFrame.src = CQ.Ext.SSL_SECURE_URL;
        historyFrame.className = "x-hidden";
        historyFrame.frameBorder = "0";
        historyFrame.border = "0";
        new CQ.Ext.Element(historyFrame).appendTo(CQ.Util.getRoot());

        CQ.Ext.History.init();
        CQ.Ext.History.on("change", function(token) {
            
        });
    },

    initComponent : function() {
        CQ.workflow.Inbox.superclass.initComponent.call(this);
        
        new CQ.Ext.KeyMap(window.document, this.shortcuts);
    }
});
CQ.Ext.reg("workflow-inbox", CQ.workflow.Inbox);

/**
 * The name of the Inbox tbar extension.
 * @static
 * @final
 * @type String
 */
CQ.workflow.Inbox.EXTENSION_TBAR = "tbar";

/**
 * The name of the Inbox column extension.
 * @static
 * @final
 * @type String
 */
CQ.workflow.Inbox.EXTENSION_COLS = "cols";
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
 * Work item list for the workflow inbox.
 *
 * @class CQ.workflow.Inbox.List
 * @extends CQ.Ext.grid.GridPanel
 */
CQ.workflow.Inbox.List = CQ.Ext.extend(CQ.Ext.grid.GridPanel, {
    pageSize:40,
    
    store:null,
    
    constructor: function(config) {
        var inbox = this;
        
        this.store = new CQ.Ext.data.Store({
            autoLoad:false,
            proxy: new CQ.Ext.data.HttpProxy({ 
                url:CQ.HTTP.getPath("/libs/cq/workflow/content/inbox") + "/list.json",
                method:"GET"
            }),
            reader: new CQ.Ext.data.JsonReader({
                root:"items",
                id: "item",
                totalProperty:"results",
                fields: [
                    "title",
                    "description",
                    "inboxItemType",
                    "computedItemType",
                    "actionNames",
                    "payload",
                    CQ.shared.XSS.getXSSPropertyName("payload"),
                    "payloadPath",
                    CQ.shared.XSS.getXSSPropertyName("payloadPath"),
                    "payloadTitle",
                    "payloadType",
                    "payloadSummary",
                    "currentAssignee",
                    "startTime",
                    "comment",
                    "workflowTitle",
                    "participant",
                    "dialog",
                    "metaData",
                    "lastModifiedBy",
                    "lastModified",
                    "replication",
                    "inWorkflow",
                    "workflows",
                    "lockedBy",
                    "monthlyHits",
                    "timeUntilValid",
                    "onTime",
                    "offTime",
                    "scheduledTasks"
                ]
            }),
            listeners:{
                beforeload:function(store, opts) {
                    if (!opts.params) opts.params = {};
                    
                    // add filter params
                    var fields = CQ.workflow.InboxUtil.getFilterFields();
                    for (var i=0; i<fields.length; i++) {
                        var field = fields[i];
                        var val = field.getValue();
                        if (val && (val != "")) {
                            opts.params[field.getName()] = val;
                        } else if (opts.params[field.getName()]) {
                            delete opts.params[field.getName()];
                        }
                    }
                },
                exception: function(obj, action, data, it, response) {
                        CQ.shared.HTTP.handleForbidden(response);
                }
            }
        });
        
        config.ctxMenu = [];
        for(var i = 0; i < config.tbar.length; ++i) {
            if(config.tbar[i].menuId == "cq-workflow-inbox-actions") {
                var cfg = CQ.Ext.copyTo({}, config.tbar[i], ["id", "text", "handler", "listeners", "supportedItemTypes"]);
                cfg.id = cfg.id + "-ctxmenu";
                config.ctxMenu.push(cfg);
            }
        }
        
        var bbar = new CQ.Ext.PagingToolbar({
            pageSize:config.pageSize ? config.pageSize : this.pageSize,
            store:this.store,
            displayInfo:true,
            displayMsg:CQ.I18n.getMessage("Displaying items {0} - {1} of {2}"),
            emptyMsg:CQ.I18n.getMessage("No items to display")
        });
        
        CQ.Util.applyDefaults(config, {
            id:CQ.workflow.Inbox.List.ID,
            loadMask:true,
            stripeRows:true,
            viewConfig:{
                emptyText:CQ.I18n.getMessage("There are currently no items in your inbox."),
                deferEmptyText:true,
                forceFit:true
            },
            store:this.store,
            sm:new CQ.Ext.grid.RowSelectionModel({ singleSelect:false }),
            bbar:bbar,
            listeners: {
                rowcontextmenu:function(grid, index, e) {
                    if (e.altKey) return;

                    var xy = e.getXY();
                    e.stopEvent();

                    var sm = grid.getSelectionModel();
                    if (!sm.hasSelection()) {
                        sm.selectRow(index);
                    } else if (!sm.isSelected(index)) {
                        sm.selectRow(index);
                    }

                    if (!grid.contextMenu) {
                        grid.contextMenu = new CQ.Ext.menu.Menu({
                            "items": config.ctxMenu
                        });
                    }

                    grid.contextMenu.showAt(xy);

                    // enable the menu for the current selection:
                    var menuItemIndex;
                    var records = this.getSelectionModel().getSelections();
                    if (records && records.length > 0) {
                        for(menuItemIndex=0; menuItemIndex<grid.contextMenu.items.length; menuItemIndex++) {
                            var menuItem = grid.contextMenu.get(menuItemIndex);
                            if (menuItem.supportedItemTypes) {
                                // loop over all records and only enable menu items available for all records
                                var recordNum;
                                var showItem = true;
                                for (recordNum=0; recordNum < records.length; recordNum++){
                                    var record = records[recordNum];
                                    var inboxItem = record.get("inboxItemType");
                                    if (!menuItem.supportedItemTypes[inboxItem]) {
                                        showItem = false;
                                        break;
                                    }
                                }
                                if (showItem) {
                                    menuItem.enable();
                                } else {
                                    menuItem.disable();
                                }
                            } else {
                                menuItem.enable();
                            }
                        }
                    }

                }
            }
        });
        CQ.workflow.Inbox.List.superclass.constructor.call(this, config);
    },
    
    initComponent: function() {
        CQ.workflow.Inbox.List.superclass.initComponent.call(this);
        
        this.on("rowdblclick", function(inbox, index, e) {
            inbox.open();
        });
        
        this.store.load({
            params:{
                start:0,
                limit:this.pageSize
            }
        });
    },
    
    reload: function() {
        this.store.reload();
    },
    
    open: function() {
        var records = this.getSelectionModel().getSelections();
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var url;
            if (CQ.workflow.InboxUtil.isProjectTask(record)) {
                url = CQ.workflow.InboxUtil.getProjectAdminUrl(record);
            } else if (record.get("payloadPath")) {
                url = CQ.HTTP.externalize(record.get("payload"));
            }

            if (url) {
                // check for multi window mode
                if (CQ.wcm.SiteAdmin.multiWinMode == undefined) {
                    var wm = CQ.User.getCurrentUser().getPreference("winMode");
                    CQ.wcm.SiteAdmin.multiWinMode = (wm != "single");
                }

                if (CQ.wcm.SiteAdmin.multiWinMode) {
                    CQ.shared.Util.open(url);
                } else {
                    CQ.shared.Util.load(url);
                }
            }
        }
    }
});

CQ.workflow.Inbox.List.ID = "cq-workflow-inbox-list";
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
 * @class CQ.workflow.Inbox.RowPlugin
 * @extends CQ.Ext.util.Observable
 * @constructor
 * @param {Object} config The config object
 */
CQ.workflow.Inbox.RowPlugin = CQ.Ext.extend(CQ.Ext.util.Observable, {
    id:'comments',
    
    tpl: new CQ.Ext.XTemplate(
        '<tpl if="comment">',
            '<div class="item-details">',
                '<span class="item-details-text" ext:qtip="{comment}">{comment}</span>',
             '</div>',
         '</tpl>'),
    
    constructor: function(config){
        CQ.Ext.apply(this, config);

        CQ.workflow.Inbox.RowPlugin.superclass.constructor.call(this);

        if (this.tpl) {
            if (typeof this.tpl == 'string') {
                this.tpl = new CQ.Ext.Template(this.tpl);
            }
            this.tpl.compile();
        }
    },
    
    init: function(grid) {
        this.grid = grid;

        var view = grid.getView();
        view.getRowClass = this.getRowClass.createDelegate(this);
        view.enableRowBody = true;
    },
    
    getRowClass: function(record, rowIndex, p, ds) {
        var content = this.tpl.apply(record.data);
        if (content) {
            p.body = content;
        } else {
            p.body = null;
        }
        return 'x-grid3-row-expanded';
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

CQ.workflow.flow.Step = function() {
    return {
        afterInsert:function(contentPath, definition) {
            var url = CQ.HTTP.externalize(contentPath);
            var params = {
                "_charset_": "utf-8"
            };
            
            for(var param in definition.config.params) {
                if(param.indexOf("jcr:") == -1 && param.indexOf("sling:") == -1) {
                    var targetProperty = param.replace("\./", "./metaData/");
                    params[param + "@Delete"] = "";
                    params[targetProperty] = definition.config.params[param];
                }
            }
            
            var response = CQ.HTTP.post(url, null, params);
        
            CQ.flow.Step.afterInsert.apply(this, [contentPath, definition]);
        }
    }
}();
