/*************************************************************************
 ADOBE CONFIDENTIAL
 __________________

 Copyright $today.year Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 **************************************************************************/

/*************************************************************************
 ADOBE CONFIDENTIAL
 __________________

 Copyright $today.year Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 **************************************************************************/

// initialize CQ.taskmanagement package
CQ.taskmanagement = {};


// initialize CQ.taskmanagement.themes package
CQ.taskmanagement.themes = {};
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
CQ.taskmanagement.TaskManagementAdmin = { };

CQ.taskmanagement.TaskManagementAdmin.createTask = function(action, event) {

    var config = {
        "okHandler": function(taskInfo) {
            var selectedNode = CQ.taskmanagement.TaskManagementAdmin.getSelectedNode();
            if (!selectedNode) {
                return;
            }

            var url = "/libs/granite/taskmanager/createtask";

            CQ.Ext.Ajax.request({
                "url": url,
                "method": "POST",
                "jsonData": JSON.stringify(taskInfo),
                "params":{
                    "_charset_":"utf-8"
                },
                "success": function(response, options) {
                    CQ.Notification.notify(null, CQ.I18n.getMessage("Task Created"));

                    var nodeToReload = selectedNode;
                    if (nodeToReload) {
                        if (!nodeToReload.reload) {
                            nodeToReload = nodeToReload.parentNode;
                        }
                        nodeToReload.reload(function() {
                            CQ.taskmanagement.TaskManagementAdmin.getTaskTree().selectPath(nodeToReload.getPath(), null, function(success, node) {
                                CQ.Ext.getCmp("cq-taskmanager" + "-grid").getStore().reload();
                                if (success) {
                                    nodeToReload.expand();
                                }
                            });
                        });
                    }
                },
                "failure": function(response, options) {
                    CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to create task"));
                }
            });
        }
    };

    var mySelectedNode = CQ.taskmanagement.TaskManagementAdmin.getSelectedNode();
    var parentTaskId;
    if (mySelectedNode) {
        parentTaskId = mySelectedNode.attributes.id;
        if (parentTaskId!=null && parentTaskId.match("^xnode")!=null) {
            parentTaskId = null;
        }
    }
    var dialog = new  CQ.taskmanagement.CreateTaskDialog(config, parentTaskId);
    dialog.show();
};

CQ.taskmanagement.TaskManagementAdmin.showTaskDetails = function(taskInfo, onSuccessCallback) {

    var config = {
        "okHandler": function(updatedTaskInfo) {
            var url = "/libs/granite/taskmanager/updatetask";
            var doComplete = false;

            CQ.Ext.Ajax.request({
                "url": url,
                "method": "POST",
                "params": {
                    taskId: this.taskInfo.id,
                    _charset_:"utf-8"
                },
                "jsonData": JSON.stringify(updatedTaskInfo),
                "success": function(response, options) {
                    if (doComplete) {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Task Completed"));
                    } else {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Task Updated"));
                    }

                    if (onSuccessCallback) {
                        var updatedTaskInfo = JSON.parse(response.responseText);
                        onSuccessCallback(updatedTaskInfo);
                    }
                },
                "failure": function(response, options) {
                    if (doComplete) {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to complete task"));
                    } else {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to update task"));
                    }
                }
            });
        }
    };

    var dialog = new  CQ.taskmanagement.TaskDetailsDialog(config, taskInfo);
    dialog.show();
};

CQ.taskmanagement.TaskManagementAdmin.createTaskFromAnnotation = function(aAnnotation, taskCreatedCallback) {
    var config = {
        "okHandler": function(taskInfo) {
            var url = "/libs/granite/taskmanager/createtask";

            CQ.Ext.Ajax.request({
                "url": url,
                "method": "POST",
                "jsonData": JSON.stringify(taskInfo),
                "params":{
                    "_charset_":"utf-8"
                },
                "success": function(response, options) {
                    CQ.Notification.notify(null, CQ.I18n.getMessage("Task Created"));

                    var taskResponse = undefined;
                    if (response !== undefined && response.responseText !== undefined) {
                        taskResponse = JSON.parse(response.responseText);
                    }
                    if (taskResponse!==undefined) {
                        alert("Got a task id back: "+taskResponse.id);
                    } else {
                        alert("unknown reply");
                    }
                },
                "failure": function(response, options) {
                    CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to create task"));
                }
            });
        }
    };

    var parentTaskId = null;
    var dialog = new  CQ.taskmanagement.CreateAnnotationTaskDialog(config, parentTaskId, aAnnotation);
    dialog.show();
};

CQ.taskmanagement.TaskManagementAdmin.openTasks = function(newWindow, evt) {
    if (typeof newWindow == "object" && evt) {
        newWindow = evt.shiftKey; // workaround for action calls
    }

    var grid = CQ.taskmanagement.TaskManagementAdmin.getActiveGrid();
    var selections = grid.getSelectionModel().getSelections();
    for (var i = 0; i < selections.length; i++) {
        CQ.taskmanagement.TaskManagementAdmin.openTask(selections[i].id, selections[i].get("type"), newWindow, selections[i]);
        newWindow = true; // force new window when opening multiple pages
    }
};

CQ.taskmanagement.TaskManagementAdmin.deleteTasks = function(newWindow, evt) {
    var selectedNode = CQ.taskmanagement.TaskManagementAdmin.getSelectedNode();

    var grid = CQ.taskmanagement.TaskManagementAdmin.getActiveGrid();
    var selections = grid.getSelectionModel().getSelections();

    if (selections) {
        CQ.taskmanagement.TaskManagementAdmin.promptForDelete(selections, selectedNode,
            function(cSelections, cSelectedNode) {
                for (var i = 0; i < cSelections.length; i++) {
                    CQ.taskmanagement.TaskManagementAdmin.deleteTaskOnServer(cSelections[i].id, cSelectedNode);
                }
            });
    }
};

CQ.taskmanagement.TaskManagementAdmin.deleteTaskOnServer = function(taskId, selectedNode) {
    var url = "/libs/granite/taskmanager/deletetask";

    CQ.Ext.Ajax.request({
        "url": url,
        "method": "POST",
        "params": {
            taskId: taskId,
            _charset_:"utf-8"
        },
        "success": function(response, options) {
            CQ.Notification.notify(null, CQ.I18n.getMessage("Task Deleted"));

            // reload everything...
            // admin is not defined here: admin.reloadPages();
            var nodeToReload = selectedNode;
            if (nodeToReload) {
                if (!nodeToReload.reload) {
                    nodeToReload = nodeToReload.parentNode;
                }
                nodeToReload.reload(function() {
                    CQ.taskmanagement.TaskManagementAdmin.getTaskTree().selectPath(selectedNode.getPath(), null, function(success, node) {
                        CQ.Ext.getCmp("cq-taskmanager" + "-grid").getStore().reload();
                        if (success) {
                            selectedNode.expand();
                        }
                    });
                });
            }
        },
        "failure": function(response, options) {
            CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to delete task"));
        }
    });
};

CQ.taskmanagement.TaskManagementAdmin.promptForDelete = function(selections, selectedNode, deleteCallBack) {
    if (!selections) {
        return;
    }

    var msg, title;
    if (selections.length > 1) {
        msg = CQ.I18n.getMessage("Are you sure you want to permanently delete these tasks?");
        title = CQ.I18n.getMessage("Delete Tasks");
    } else {
        msg = CQ.I18n.getMessage("Are you sure you want to permanently delete this task?");
        title = CQ.I18n.getMessage("Delete Task");
    }

    CQ.Ext.Msg.show({
        "title":title,
        "msg":msg,
        "buttons":CQ.Ext.Msg.YESNO,
        "icon":CQ.Ext.MessageBox.QUESTION,
        "fn":function(btnId) {
            if (btnId == "yes") {
                deleteCallBack(selections, selectedNode);
            }
        },
        "scope":this
    });
};

CQ.taskmanagement.TaskManagementAdmin.openTask = function(path, type, newWindow, selection) {
    var config = {};
    config = CQ.utils.Util.applyDefaults(config, {
        "xtype": "taskeditor",
        "contentPath": "/jcr:content/metadata",
        "assetInfo": {
            "width": 50,
            "height": 20,
            "size": 30,
            "lastModified": 0,
            "title": "Task Editor",
            "mime": ""
        },
        "readOnly": false,
        taskInfo:selection.json
    });

    config.id =  config.taskInfo.id;
    config.path = config.taskInfo.contentPath;
    config.title = config.taskInfo.name;

    var editor = CQ.Util.build(config, true);

    var tabPanel = CQ.Ext.getCmp("cq-taskmanager-tabpanel");
    tabPanel.add(editor);

    tabPanel.setActiveTab(editor);
};

CQ.taskmanagement.TaskManagementAdmin.createTaskProject = function(action, event) {
    var config = {
        "okHandler": function(taskInfo) {
            var selectedNode = CQ.taskmanagement.TaskManagementAdmin.getSelectedNode();
            if (!selectedNode) {
                return;
            }

            var url = "/libs/granite/taskmanager/createtask";

            CQ.Ext.Ajax.request({
                "url": url,
                "method": "POST",
                "jsonData": JSON.stringify(taskInfo),
                "params":{
                    "_charset_":"utf-8"
                },
                "success": function(response, options) {
                    CQ.Notification.notify(null, CQ.I18n.getMessage("Project Created"));

                    // reload everything...
                    // admin is not defined here: admin.reloadPages();
                    var nodeToReload = selectedNode;
                    if (nodeToReload) {
                        if (!nodeToReload.reload) {
                            nodeToReload = nodeToReload.parentNode;
                        }
                        nodeToReload.reload(function() {
                            CQ.taskmanagement.TaskManagementAdmin.getTaskTree().selectPath(selectedNode.getPath(), null, function(success, node) {
                                CQ.Ext.getCmp("cq-taskmanager" + "-grid").getStore().reload();
                                if (success) {
                                    selectedNode.expand();
                                }
                            });
                        });
                    }
                },
                "failure": function(response, options) {
                    CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to create task"));
                }
            });
        }
    };

    var mySelectedNode = CQ.taskmanagement.TaskManagementAdmin.getSelectedNode();
    var parentTaskId;
    if (mySelectedNode) {
        parentTaskId = mySelectedNode.attributes.id;
        if (parentTaskId!=null && parentTaskId.match("^xnode")!=null) {
            parentTaskId = null;
        }
    }
    var dialog = new  CQ.taskmanagement.CreateTaskProjectDialog(config, parentTaskId);
    dialog.show();
};

// @private
CQ.taskmanagement.TaskManagementAdmin.getSelectedNode = function() {
    var tree = CQ.taskmanagement.TaskManagementAdmin.getTaskTree();
    var selectedNode;
    try {
        selectedNode = tree.getSelectionModel().getSelectedNode();
    } catch (e) {
    }

    return selectedNode;
};

CQ.taskmanagement.TaskManagementAdmin.reloadSelectedNode = function() {
    var tree = CQ.taskmanagement.TaskManagementAdmin.getTaskTree();
    var selectedNode;
    try {
        selectedNode = tree.getSelectionModel().getSelectedNode();
    } catch (e) {
    }
    if (selectedNode && selectedNode != tree.getRootNode()) {
        var selectedPath = selectedNode.getPath();
        selectedNode.parentNode.reload(function() {
            tree.selectPath(selectedPath, null, function(success, node) {
                if (success) {
                    node.expand();
                }
            });
        });
    } else {
        tree.getRootNode().reload();
    }
    CQ.taskmanagement.TaskManagementAdmin.getActiveGrid().getStore().reload();
};

// @private
CQ.taskmanagement.TaskManagementAdmin.getTaskTree = function() {
    return CQ.Ext.getCmp("cq-taskmanager-tree");
};

CQ.taskmanagement.TaskManagementAdmin.getActiveGrid = function() {
    var grid = CQ.Ext.getCmp("cq-taskmanager-grid");
    var tabPanel = CQ.Ext.getCmp("cq-taskmanager-tabpanel");
    if (tabPanel) {
        var g = CQ.Ext.getCmp(tabPanel.getActiveTab().id + "-grid");
        if(g) {
            grid = g;
        }
    }
    return grid;
};

CQ.taskmanagement.TaskManagementAdmin.hasListSelection = function() {
    var grid = CQ.taskmanagement.TaskManagementAdmin.getActiveGrid();
    if (grid) {
        var selections = grid.getSelectionModel().getSelections();
        return selections.length > 0;
    }
    return false;
};

CQ.taskmanagement.TaskManagementAdmin.hasProjectSelected = function() {
    var taskTree = CQ.taskmanagement.TaskManagementAdmin.getTaskTree();
    if (taskTree) {
        var selectedNode = taskTree.getSelectionModel().getSelectedNode();
        return selectedNode && (selectedNode.attributes.taskType === "project");
    }
    return false;
};

CQ.taskmanagement.TaskManagementAdmin.hasTaskSelected = function() {
    var taskTree = CQ.taskmanagement.TaskManagementAdmin.getTaskTree();
    if (taskTree) {
        var selectedNode = taskTree.getSelectionModel().getSelectedNode();
        return selectedNode && (selectedNode.attributes.taskType === "projectsubtask");
    }
    return false;
};

CQ.taskmanagement.TaskManagementAdmin.hasTreeRootSelected = function() {
    var taskTree = CQ.taskmanagement.TaskManagementAdmin.getTaskTree();
    if (taskTree) {
        var selectedNode = taskTree.getSelectionModel().getSelectedNode();
        return selectedNode && (selectedNode.parentNode===null);
    }
    return false;
};

CQ.taskmanagement.TaskManagementAdmin.canCreateTasks = function() {
    return CQ.taskmanagement.TaskManagementAdmin.hasProjectSelected() || CQ.taskmanagement.TaskManagementAdmin.hasTaskSelected();
};

CQ.taskmanagement.TaskManagementAdmin.canCreateProjects = function() {
   return true;
};

CQ.taskmanagement.TaskManagementAdmin.getTargetFromList = function() {
    if (CQ.taskmanagement.TaskManagementAdmin.hasListSelection()) {
        var grid = CQ.taskmanagement.TaskManagementAdmin.getActiveGrid();
        if (grid) {
            var selections = grid.getSelectionModel().getSelections();
            return selections[0].id;
        }
    }
    return null;
};

CQ.taskmanagement.TaskManagementAdmin.getTargetFromTree = function() {
    if (CQ.taskmanagement.TaskManagementAdmin.hasTreeSelection()) {
        var taskTree = CQ.taskmanagement.TaskManagementAdmin.getTaskTree();
        if (taskTree) {
            return taskTree.getSelectionModel().getSelectedNode();
        }
    }
    return null;
};

CQ.taskmanagement.TaskManagementAdmin.canDoFolderOp = function() {
    return true;
};

CQ.taskmanagement.TaskManagementAdmin.hasTreeSelection = function() {
    var tree = CQ.Ext.getCmp("cq-taskmanager-tree");
    if (tree) {
        var selectedNode = tree.getSelectionModel().getSelectedNode();
        return selectedNode != null;
    }
    return false;
};
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

/**
 * @class CQ.taskmanagement.TaskProjects
 * @extends CQ.Ext.Viewport
 * The TaskProjects is a console providing project and task management functions.
 * @constructor
 * Creates a new TaskProjects console.
 * @param {Object} config The config object
 */
CQ.taskmanagement.TaskProjects = CQ.Ext.extend(CQ.Ext.Viewport, {

    /**
     * Internal clipboard for copy operations.
     * @private
     */
    copyClipboard: null,

    /**
     * @cfg {Object} search
     * The config options of the search field in the grid. Must be a valid
     * {@link CQ.form.SearchField} configuration.
     * Defaults to {"width":200}.
     */

    /**
     * @cfg {Boolean} noSearch
     * <code>true</code> to not render the search field in the grid.
     * @since 5.5
     */

    /**
     * @cfg {} searchPanel
     * The config for the search panel. If defined, the console will be wrapped
     * by a tab panel.
     * @since 5.5
     */

    /**
     * @cfg {String} tabTitle
     * If defined the console will be wrapped by a tab panel.
     */

    /**
     * @cfg {Object} treeLoader
     * The config options of the tree loader. Must be a valid
     * {@link CQ.Ext.tree.TreeLoader} configuration.
     */

    /**
     * @cfg {Object} treeRoot
     * The config options of the tree root. Must be a valid
     * {@link CQ.Ext.tree.TreeNode} configuration.
     */

    /**
     * @cfg {Object} actions
     * Object containing the config options for actions and menu items.
     * Must be valid {@link CQ.Ext.Action} configurations.
     */

    /**
     * @cfg {Object} grid
     * An object containing the grid configurations for different paths.
     * <ul>
     * <li>&lt;Config name&gt;<ul>
     * <li>pageSize: Maximum number of items per page (defaults to {@link CQ.themes.wcm.SiteAdmin.GRID_PAGE_SIZE})</li>
     * <li>pathRegex: Regular expression for the path (defaults to "(/.*)?")</li>
     * <li>storeProxyPrefix: The prefix for the URL used by the store (defaults to "")</li>
     * <li>storeProxySuffix: The suffix for the URL used by the store (defaults to ".pages.json")</li>
     * <li>storePredicate: The predicate used to retrieve the list of pages (defaults to "siteadmin")</li>
     * <li>storeReaderTotalProperty: The property containing the number of pages returned (see {@link CQ.Ext.data.JsonReader}), defaults to "results"</li>
     * <li>storeReaderRoot: The root property to start reading at (see {@link CQ.Ext.data.JsonReader}), defaults to "pages"</li>
     * <li>storeReaderId: The property containing the ID (see {@link CQ.Ext.data.JsonReader}), defaults to "path"</li>
     * <li>storeReaderFields: The fields to read (see {@link CQ.Ext.data.JsonReader}).</li>
     * <li>columns: The column configurations (see {@link CQ.Ext.grid.GridPanel#columns})</li>
     * <li>defaultSortable: True if the grid should be sortable by default (defaults to true)</li>
     * </ul></li></ul>
     */

    /**
     * @cfg {Number} treeAutoExpandMax
     * The maximum number of allowed child nodes for automatic
     * (slingeclick) expansion (defaults to {@link CQ.TREE_AUTOEXPAND_MAX})
     */

    /**
     * @cfg {Object} attribFilter
     * An attribute based node filter.
     * @private
     */

    /**
     * @cfg {Boolean} considerSubNodes
     * True if subnodes should be calculated to ensure correct display of
     * filtered subnodes (defaults to true).
     * @private
     */

    constructor: function(config) {
        var admin = this;
        this.title = config.title;
        config = CQ.Util.applyDefaults(config, {
            "id": "cq-taskprojects",
            "search": {
                "width": 145,
                "listWidth": 260,
                "listAlign": "tr-br",
                "minChars": 3,
                "queryDelay": 500
            },
            "grid": {
                "assets": {
                    "pathRegex":"(/.*)?",
                    "storeProxyPrefix":"",
                    "storeProxySuffix": ".tasks.json",
                    "storePredicate":"taskprojects",
                    "storeReaderTotalProperty": "results",
                    "storeReaderRoot": "tasks",
                    "storeReaderId": "id",
                    "storeReaderFields": [
                        "parentTaskId",
                        "updateTime",
                        "createTime",
                        "completeTime",
                        {
                            name: "description",
                            mapping: "description",
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        {
                            name: "instructions",
                            mapping: "instructions",
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        {
                            name: "contentPath",
                            mapping: "contentPath",
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        {
                            name: "name",
                            mapping: "name",
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        {
                            name: "ownerId",
                            mapping: "ownerId",
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        {
                            name: "selectedAction",
                            mapping: "selectedAction",
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        {
                            name: "status",
                            mapping: "status",
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        {
                            name: 'taskPriority',
                            mapping: 'properties.taskPriority'
                        },
                        {
                            name: 'taskDueDate',
                            mapping: 'properties.taskDueDate'
                        },
                        {
                            name: 'taskComment',
                            mapping: 'properties.comment',
                            sortType: CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase
                        },
                        "createdBy",
                        "nameHierarchy",
                        "taskType",
                        "hasSubTasks"
                    ],
                    "columns": [
                        CQ.taskmanagement.TaskProjects.COLUMNS["numberer"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["name"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["contentPath"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["assignedTo"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["priority"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["description"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["duedate"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["taskStatus"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["selectedAction"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["createTime"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["completeTime"],
                        CQ.taskmanagement.TaskProjects.COLUMNS["comment"]
                   ],
                  "defaultSortable": true
                }
            }
        });

        // set up grid configs
        this.lastClickedRow = -1;
        var gridCfgs = {};
        for (var name in config.grid) {
            if (!config.grid[name].pathRegex) {
                // reject grid configs without pathRegex
                // to avoid overriding default config
                continue;
            }
            gridCfgs[name] = config.grid[name];
            if (name != "pages") {
                // fill missing options with defaults
                gridCfgs[name] = CQ.Ext.applyIf(gridCfgs[name], config.grid["pages"]);
            }
            if (gridCfgs[name].pageSize == undefined) {
                gridCfgs[name].pageSize = CQ.themes.wcm.SiteAdmin.GRID_PAGE_SIZE;
            }
            if (gridCfgs[name].pageText == undefined) {
                gridCfgs[name].pageText = CQ.themes.wcm.SiteAdmin.GRID_PAGE_TEXT;
            }
            gridCfgs[name].storeConfig = CQ.Util.applyDefaults(config.store, {
                "autoLoad":false,
                "remoteSort":false,
                "listeners":gridCfgs[name].storeListeners,
                "proxy": new CQ.Ext.data.HttpProxy({
                    "api": {
                        "read": {
                            "url":gridCfgs[name].storeProxyPrefix,
                            "method":"GET"
                        }
                    }
                }),
                "reader": new CQ.Ext.data.JsonReader({
                    "totalProperty": gridCfgs[name].storeReaderTotalProperty,
                    "root": gridCfgs[name].storeReaderRoot,
                    "id": gridCfgs[name].storeReaderId,
                    "fields": gridCfgs[name].storeReaderFields
                }),
                "baseParams": {
                    "start":0,
                    "limit":gridCfgs[name].pageSize,
                    "predicate":gridCfgs[name].storePredicate,
                    "_charset_":"utf-8"
                }
            });
            gridCfgs[name].colModelColumns = new Array();
            for (var i = 0; i < gridCfgs[name].columns.length; i++) {
                var c = gridCfgs[name].columns[i];
                var pref = null;
                if (typeof c == "string") {
                    pref = c;
                } else if (typeof c == "object") {
                    if (c.usePredefined) {
                        pref = c.usePredefined;
                    }
                    if (c.editor) {
                        if (typeof c.editor == "string") {
                            try {
                                eval("c.editor = " + c.editor + ";");
                            } catch (e) { }
                        }
                        try {
                            c.editor = c.editor.cloneConfig();
                        } catch (e) { }
                    }

                    // #33555 - Site Admin: vulnerable to XSS
                    CQ.shared.XSS.updatePropertyName(c, "dataIndex");
                }

                if (pref && CQ.taskmanagement.TaskProjects.COLUMNS[pref]) {
                    var prefCfg = CQ.Util.copyObject(CQ.taskmanagement.TaskProjects.COLUMNS[pref]);
                    // overlay config options
                    for (var prop in c) {
                        if (prop == "usePredefined") continue;
                        prefCfg[prop] = c[prop];
                    }
                    gridCfgs[name].colModelColumns.push(prefCfg);
                } else {
                    gridCfgs[name].colModelColumns.push(c);
                }
            }
        }

        this.debug = config.debug;
        var id = config.id;

        var body = CQ.Ext.getBody();
        body.setStyle("margin", "0");
        if (CQ.Ext.isIE) {
            body.dom.scroll = "no";
        }
        else {
            body.setStyle("overflow", "hidden");
        }

        // actions
        this.actions = [];
        this.checkedActions = [];
        var gridContextActions = [];

        // add global actions
        this.actions.push({
            "id":id + "-grid-refresh",
            "iconCls":"cq-siteadmin-refresh",
            "handler": this.reloadPages,
            "scope":this,
            "tooltip": {
                "title": id == "cq-damadmin" ? CQ.I18n.getMessage("Refresh Asset List") : CQ.I18n.getMessage("Refresh Page List"),
                "text": id == "cq-damadmin" ? CQ.I18n.getMessage("Refreshs the list of assets") : CQ.I18n.getMessage("Refreshs the list of pages"),
                "autoHide":true
            }
        });

        // add custom actions
        this.actions.push("-");
        this.actions = this.actions.concat(
                this.formatActions(config.actions, gridContextActions));

        this.actions.push("->");

        var autoExpandMax = config.treeAutoExpandMax || CQ.TREE_AUTOEXPAND_MAX;

        // tree config
        var treeLdrCfg = CQ.Util.applyDefaults(config.treeLoader, {
            "requestMethod":"GET",
            "dataUrl":"/libs/granite/taskmanager/list.json",
            "baseParams": {
                "ncc":autoExpandMax,
                "_charset_": "utf-8",
                "returnCompleted": true,
                "taskType": "project"
            },
            "baseAttrs": {
                "autoExpandMax":autoExpandMax,
                "singleClickExpand":true
            },
            "listeners": {
                "beforeload": function(loader, node) {
                    this.baseParams.path = node.getPath();
                    // don't add a parentTaskid if we node is the rootnode (i.e. parentNode is null)
                    if ((node.parentNode!=null) && node.attributes && node.attributes.id) {
                        this.baseParams.parentTaskId = node.attributes.id;
                    } else {
                        delete this.baseParams.parentTaskId;
                    }
                }
            },
            createNode : function(attr) {
                attr.text = attr.name;
                if (attr.hasSubTasks) {
                    attr.type = "sling:Folder";
                    attr.cls = "folder";
                    attr.iconCls = "folder";
                    attr.sub = 1;
                } else {
                    attr.type = "OrderedFolder";
                    attr.cls="folder";  // "file";
                    attr.iconCls = "folder"; // "file";
                }

                if (this.baseAttrs) {
                    CQ.Ext.applyIf(attr, this.baseAttrs);
                }

                if (this.applyLoader !== false) {
                    attr.loader = this;
                }
                if (typeof attr.uiProvider == 'string') {
                    attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
                }

                var node;
                if (!attr.hasSubTasks) {
                    node = new CQ.Ext.tree.TreeNode(attr);
                } else {
                    node = new CQ.Ext.tree.AsyncTreeNode(attr);
                }
                return node;
            }
        });
        this.treeRootCfg = CQ.Util.applyDefaults(config.treeRoot, {
            "name":"content",
            "text":CQ.I18n.getMessage("Websites"),
            "draggable":false,
            "expanded":true,
            "iconCls":"file"
        });

        // look for anchor and clear existing tree state if present
        var anchor = CQ.HTTP.getAnchor(document.location.href);
        if (anchor) {
            var state = CQ.Ext.state.Manager.get(id + "-tree");
            if (state) {
                CQ.Ext.state.Manager.set(id + "-tree", state.width ?
                        { width:state.width } : {});
            }
        }

        // the panel holding the tree and the grid
        var consolePanel = {
            "id":id + "-wrapper",
            "cls":"cq-taskadmin-wrapper",
            "xtype":"panel",
            "layout":"border",
            "border":false,
            "items": [
                {
                    "xtype":"treepanel",
                    "id":id + "-tree",
                    "cls":"cq-taskadmin-tree",
                    "region":"west",
                    "margins":"5 0 5 5",
                    "width": CQ.themes.wcm.SiteAdmin.TREE_WIDTH,
                    "autoScroll":true,
                    "containerScroll":true,
                    "collapsible":true,
                    "collapseMode":"mini",
                    "hideCollapseTool": true,
                    "animate":true,
                    "split":true,
                    "stateful":true,
                    "enableDD":false,
                    "loader": new CQ.Ext.tree.TreeLoader(treeLdrCfg),
                    "root": new CQ.Ext.tree.AsyncTreeNode(this.treeRootCfg),
                    "tbar": [
                        {
                            "id":id + "-tree-refresh",
                            "iconCls":"cq-siteadmin-refresh",
                            "handler":function() {
                                admin.mask();
                                CQ.Ext.getCmp(id + "-tree").getRootNode().reload();
                                admin.loadPath();
                            },
                            "tooltip": {
                                "title":CQ.I18n.getMessage("Refresh Page Tree"),
                                "text":CQ.I18n.getMessage("Refreshs the page tree"),
                                "autoHide":true
                            }
                        }
                    ]
                },{
                    "xtype": "siteadmingrid",
                    "id":id + "-grid",
                    "region":"center",
                    "enableDragDrop":false,
                    "tbar":this.actions,
                    "contextActions": gridContextActions,
                    "admin": this,
                    "listeners":{
                        "rowdblclick":CQ.taskmanagement.TaskManagementAdmin.openTasks,
                    	"render": function(grid) {
                            grid.getSelectionModel().on("selectionchange",
                                function(sm) {
                                    // enable/disable toolbar items
                                    admin.checkActions();
                                }
                            );

                            var grd = document.getElementById(grid.id);
                            var addEvent = grd.addEventListener;
                            if (!addEvent) {
                                addEvent = grd.attachEvent;
                            }


                            // bottom margin to allow reordering at the end of the list
                            grid.getView().mainBody.setStyle("padding-bottom","22px");
                        }
                    }
                }
            ]
        };

        var centerPanel;

        if (config.tabTitle || config.tabs) {
            consolePanel.title = config.tabTitle ? config.tabTitle : CQ.I18n.getMessage("Console");

            var items = [consolePanel];
            
            if(config.tabs) {
	            for(var i=0; i<config.tabs.length; i++) {
	            	items.push(CQ.Util.applyDefaults(config.tabs[i], {"admin": this}));
	            }
            }
            
            centerPanel = {
                "activeTab": 0,
                "region": "center",
                "id": id + "-tabpanel",
                "xtype": "tabpanel",
                "cls": "cq-taskadmin-tabpanel",
                "border": false,
                "enableTabScroll": true,
                "items": items,
                "listeners": {
                    "tabchange": function(panel, tab) {
                        if (tab.path) {
                            // asset tab
                            admin.tabPath = tab.path;
                            admin.setDocumentTitle(tab.path.substring(tab.path.lastIndexOf("/") + 1));
                            CQ.Ext.History.add(tab.path, true);
                        }
                        else if (tab.treePath) {
                        	// admin tab
                            admin.tabPath = "";
                            var title = admin.treePath ? admin.treePath.substring(admin.treePath.lastIndexOf("/") + 1) : "";
                            admin.setDocumentTitle(title);
                            if (admin.treePath) {
                                // avoid history entry on initial tabchange where treePath is undefined
                                CQ.Ext.History.add(admin.treePath, true);
                            }
                        }
                        else if(tab.performSearch) {
                            //search tab
                        	tab.reloadPages();
                        }
                    }
                }
            };
        }
        else {
            consolePanel.region = "center";
            centerPanel = consolePanel;
        }

        CQ.taskmanagement.TaskProjects.superclass.constructor.call(this, {
            "id":id,
            "layout":"border",
            "renderTo":CQ.Util.ROOT_ID,
            "gridConfig": gridCfgs,
            "items": [
                {
                    "id":"cq-header",
                    "xtype":"container",
                    "cls": id + "-header",
                    "autoEl":"div",
                    "region":"north",
                    "items": [
                        new CQ.HomeLink({})
                    ]
                },
                centerPanel
            ]
        });

//        var tree = CQ.Ext.getCmp(id + "-tree");

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
            var current = admin.getCurrentPath();
            if (admin.id == "cq-damadmin") {
                // check if token is a tree node (direcotry) or an asset
                var tree = CQ.Ext.getCmp(window.TaskAdmin_id + "-tree");
                var isTreeNode = false;
                tree.selectPath(token, "name",
                    function(success) {
                        if (success) isTreeNode = true;
                    }
                );

                var tabPanel = CQ.Ext.getCmp(window.TaskAdmin_id + "-tabpanel");

                if (isTreeNode) {
                    // token is directory: => open admin tab
                    tabPanel.setActiveTab(admin.id + "-wrapper");
                }
                else {
                    // token is asset => open asset
                    var id = CQ.DOM.encodeId(token);
                    var editor = CQ.Ext.getCmp(id);
                    if (editor) {
                        // asset is already open: switch to tab
                        tabPanel.setActiveTab(editor);

                    }
                    else {
                        // asset is not open: load path in tree and open asset
                        admin.loadPath(token);
                        tabPanel.setActiveTab(admin.id + "-wrapper");
                    }
                }
            }
            else {
                if (token != current) {
                    admin.loadPath(token);
                }
            }
        });

        if (anchor) {
            admin.loadPath(decodeURI(anchor));
        }
        window.TaskAdmin_id = id;

        // stop editing when window loses focus
        CQ.Ext.EventManager.on(window, "blur", function() {
            window.setTimeout(function() {
            	CQ.Ext.getCmp(id + "-grid").stopEditing(true);
            },500);
        });

        this.typeCache = {};
    },

    initComponent : function() {
        CQ.taskmanagement.TaskProjects.superclass.initComponent.call(this);

        var admin = this;
        CQ.Ext.getCmp(admin.id + "-tree").getSelectionModel().on(
            "selectionchange",
            function(selModel, node) {
                if (node) {
                    var path = node.getPath();
                    admin.loadPages(node);
                    CQ.Ext.History.add(path, true);
                    admin.setDocumentTitle(node.text);
                    admin.checkActions();
                }
            }
        );
    },

    setDocumentTitle: function(text) {
        var t = this.title;
        if (text) t += " | " + text;
        document.title = t;
    },

    /**
     * Returns the node or resource type of the node at the specified path.
     * @param path The path
     * @return The type
     */
    getType: function(path) {
        if (!this.typeCache[path]) {
            var info = CQ.HTTP.eval(path + ".json");
            if (info) {
                this.typeCache[path] = info["jcr:primaryType"];
            }
        }
        return this.typeCache[path];
    },

    copySelectionToClipboard: function() {
        this.copyClipboard = new Array();

        var selections = this.getSelectedPages();
        for (var i=0; i<selections.length; i++) {
            this.copyClipboard.push(selections[i].id);
        }
        this.checkActions();
    },

    hasClipboardSelection: function() {
        return ((this.copyClipboard != null) && (this.copyClipboard.length > 0));
    },

    getGridConfigId: function(path) {
        if (!path) path = "/";
        var gridCfgs = this.initialConfig.gridConfig;
        var id;
        for (id in gridCfgs) {
            gridCfg = gridCfgs[id];
            if (new RegExp(gridCfgs[id].pathRegex).test(path)) {
                break;
            }
        }
        if (!id) id = "pages";
        return id;
    },

    getGridConfig: function(path) {
        var gridCfgs = this.initialConfig.gridConfig;
        var id = this.getGridConfigId(path);
        if (id) {
            return gridCfgs[id];
        } else {
            return null;
        }
    },

    reconfigureGrid: function(grid, path, parentTaskId) {
        grid.inProgress = [];
        var gridCfg = this.getGridConfig(path);
        if (!gridCfg) {
            // should actually never happen, but just in case
            return grid.getStore();
        }
        if (!gridCfg.inited) {
            gridCfg.store = new CQ.Ext.data.Store(gridCfg.storeConfig);
            gridCfg.store.on("beforeload", function() {
                grid.inProgress = [];
            });
            gridCfg.colModel = new CQ.Ext.grid.ColumnModel({
                "columns": gridCfg.colModelColumns,
                "defaults": {
                    "sortable": true
                }
            });
            gridCfg.colModel.on("hiddenchange", function(cm, index, hidden) {
                // make sure grid state is saved when columns are hidden or shown
                grid.saveState();
                if (!hidden && cm.getColumnById(cm.getColumnId(index)).refreshOnHiddenchange) {
                    // refresh thumbnail column when shown
                    grid.getView().refresh(true);
                }

            });
            gridCfg.inited = true;
        }
        // update store url
        var url = "/libs/granite/taskmanager/list.json";


        url = url + "?returnCompleted=true";
        if (parentTaskId) {
            url = url + "&parentTaskId="+CQ.HTTP.encodePath(parentTaskId);
        } else {
            // if we do not have a parent task specified, then we want to return project tasks with no parent
            url = url + "&taskType=project";
        }

        gridCfg.store.proxy.api["read"].url = url;
        // forget last options
        if (gridCfg.store.lastOptions) {
            delete gridCfg.store.lastOptions;
        }

        // check if grid needs to be reconfigured
        if (gridCfg.pathRegex != this.lastGridPathRegex) {
            grid.reconfigure(gridCfg.store, gridCfg.colModel);
            var id = this.getGridConfigId(this.treePath);
            grid.stateId = grid.id + "-" + id;
            grid.initState();
            this.lastGridPathRegex = gridCfg.pathRegex;
            gridCfg.store.removeAll();
        }
        return gridCfg.store;
    },

    reloadPages: function() {
        this.mask();
        var store = CQ.Ext.getCmp(this.id + "-grid").getStore();
        store.reload({
            "callback": function() {
                this.unmask();
            },
            "scope": this
        });
    },

    loadPages: function(node, selectRecord) {
        this.mask();
        this.lastClickedRow = -1;
        var path = node.getPath();
        this.treePath = path;
        this.treePathEncoded = CQ.HTTP.encodePath(path);
        var grid = CQ.Ext.getCmp(this.id + "-grid");



        var parentTaskId = null;
        if ((node.parentNode!=null) && node.attributes && node.attributes.id) {
            parentTaskId = node.attributes.id;
        }

        var store = this.reconfigureGrid(grid, this.treePath, parentTaskId);
        var id = this.id;
        var admin = this;
        store.reload({
            callback: function(records, options, success) {
                var recSelected = false;
                if (selectRecord) {
                    var selModel = grid.getSelectionModel();
                    for (var i = 0; i < records.length; i++) {
                        if (records[i].id == selectRecord) {
                            selModel.clearSelections();
                            selModel.selectRecords([records[i]]);
                            recSelected = true;
                        }
                    }
                    if (id == "cq-damadmin" && selModel.hasSelection()) {
                        CQ.taskmanagement.TaskProjects.openPages.call(admin);
                    }
                }

                if (selectRecord && !recSelected) {
                    try {
                        var sort = grid.getStore().sortInfo;
                        var url = store.proxy.api.read.url;
                        for (var param in store.baseParams) {
                            url = CQ.HTTP.addParameter(url, param, store.baseParams[param]);
                        }
                        if (sort) {
                            url = CQ.HTTP.addParameter(url, "sort", sort.field);
                            url = CQ.HTTP.addParameter(url, "dir", sort.direction);
                        }
                        url = CQ.HTTP.addParameter(url, "index", "true");
                        url = CQ.HTTP.addParameter(url, "path", selectRecord);

                        var index = CQ.HTTP.eval(url).index + 1;
                        if (index > 0) {
                            var selectRow = function(recs) {
                                grid.getSelectionModel().selectRecords([this.getById(selectRecord)]);
                                this.un("load", selectRecord);
                            };
                            grid.getStore().on("load", selectRow);
                        }
                    } catch (e) {
                        //console.log("error:" + e);
                    }
                }
                admin.unmask();
            }
        });
    },

    loadPath: function(path, selectRecord) {
        var admin = this;
        var callback = function(success, node, selectRecord) {
            if (success) {
                this.loadPages(node, selectRecord);
                node.expand();
            }
            else {
                // path not found => load parent
                this.loadPath(this.treePath.substring(0, this.treePath.lastIndexOf("/")), this.treePath);
            }
        };

        // select tree path
        var tree = CQ.Ext.getCmp(this.id + "-tree");

        if (!path && !this.treePath) {
            this.treePath = tree.getRootNode().getPath();
            tree.selectPath(tree.getRootNode().id, "id",
                function(success, node) {
                    callback.call(admin, success, node, selectRecord);
                }
            );
        } else {
            if (path) {
                this.treePath = path;
            }
            if (this.treePath == tree.getRootNode().getPath()) {
                tree.selectPath(tree.getRootNode().id, "id",
                    function(success, node) {
                        callback.call(admin, success, node, selectRecord);
                    }
                );
            } else {
                tree.selectPath(this.treePath, "name",
                    function(success, node) {
                        callback.call(admin, success, node, selectRecord);
                    }
                );
            }
        }
    },

    reloadCurrentTreeNode: function() {
        // TODO insert new tree node directly instead of reloading parent
        var tree = CQ.Ext.getCmp(this.id + "-tree");
        var selectedNode;
        try {
            selectedNode = tree.getSelectionModel().getSelectedNode();
        } catch (e) {
        }
        if (selectedNode && selectedNode != tree.getRootNode()) {
            var selectedPath = selectedNode.getPath();
            selectedNode.parentNode.reload(function() {
                tree.selectPath(selectedPath, null, function(success, node) {
                    if (success) {
                        node.expand();
                    }
                });
            });
        } else {
            tree.getRootNode().reload();
        }
        CQ.Ext.getCmp(this.id + "-grid").getStore().reload();
        this.unmask();
    },

    /**
     * Returns the currently selected path in the tree.
     * @return {String} The current path
     */
    getCurrentPath: function() {
        var tree = CQ.Ext.getCmp(this.id + "-tree");
        var node = tree.getSelectionModel().getSelectedNode();
        if (node != null) {
            return node.getPath();
        }
    },

    /**
     * Returns the currently selected pages in the grid.
     * @return {Object[]} The selected pages
     */
    getSelectedPages: function() {
    	
    	var gridSel = CQ.Ext.getCmp(this.id + "-grid").getSelectionModel().getSelections();
    	
    	//use grid from active tab
    	var tabPanel = CQ.Ext.getCmp(window.TaskAdmin_id + "-tabpanel");
        if (tabPanel) {
        	var grid = CQ.Ext.getCmp(tabPanel.getActiveTab().id + "-grid");
        	if(grid) {
        		gridSel = grid.getSelectionModel().getSelections();
        	}
        }
        
        if (gridSel.length > 0) {
            return gridSel;
        } else if (this.treePath) {
        	var admin = this;
            var node = CQ.Ext.getCmp(this.id + "-tree").getSelectionModel().getSelectedNode();
            return [{
                "id": admin.treePath,
                "label":admin.treePath.substring(admin.treePath.lastIndexOf("/")+1),
                "replication": node && node.attributes ? node.attributes.replication : null,
                "title":node ? node.text : null,
                "type":null,
                "_displayTitle_": true,
                "get":function(name) {
                    // fake getter
                    return this[name];
                }
            }];
        } else {
            return [];
        }
    },

    /**
     * Masks the main panel for loading.
     */
    mask: function() {
        if (!this.loadMask) {
            this.loadMask = new CQ.Ext.LoadMask(this.id + "-wrapper", {
                "msg": CQ.I18n.getMessage("Loading...")
            });
        }
        this.loadMask.show();
    },

    /**
     * Unmasks the main panel after loading.
     */
    unmask: function(timeout) {
        if (!this.loadMask) return;
        this.loadMask.hide();
    }

});

CQ.Ext.reg("taskprojects", CQ.taskmanagement.TaskProjects);

//overrides current CQ.taskmanagement.TaskProjects class with methods contained in CQ.wcm.AdminBase.
CQ.Ext.override(CQ.taskmanagement.TaskProjects, CQ.wcm.AdminBase);


CQ.taskmanagement.TaskProjects.formatDate = function(date) {
    if (typeof date == "string") {
        // nothing we can do here, it's already formatted.
        return date;
    }
    if (typeof date == "number") {
        date = new Date(date);
    }
    var fmt = CQ.I18n.getMessage("d-M-Y H:i", null, "Date format for ExtJS SiteAdmin (short, eg. two-digit year, http://extjs.com/deploy/ext/docs/output/Date.html)");
    return date.format(fmt);
};

CQ.taskmanagement.TaskProjects.sortTypeIgnoreCase = function(value) {
    if (value) {
        return value.toLowerCase();
    }
    return value;
}

/**
 * Returns the 'New file' upload URL
 * @param {String} path Upload path
 * @param {String} fileName File name
 * @return {String} Upload URL
 * @since 5.5
 */
CQ.taskmanagement.TaskProjects.getPostUploadUrl = function(path, fileName) {
    var url = path;
    if (path.match(/^\/content\/dam.*/)) {
        url += ".createasset.html";
    } else if (fileName) {
        url += "/" + fileName;
    }
    return url;
};

// constants
CQ.taskmanagement.TaskProjects.DD_GROUP_TREE = "cq.siteadmin.tree";
CQ.taskmanagement.TaskProjects.DD_GROUP_GRID = "cq.siteadmin.grid";

CQ.taskmanagement.TaskProjects.TEXT_EDITOR = new CQ.Ext.form.TextField({
    "enableKeyEvents":true,
    "listeners": {
        "render": function() {
            window.CQ_TextEditor = this;
            this.enterPressed = false;
        },
        "keydown": function(field, evt) {
            this.enterPressed = (evt.getKey() == evt.ENTER);
        }
    }
});

CQ.taskmanagement.TaskProjects.GRID_LISTENERS = {
    "beforeedit": {
        "title": function(params) {
        	 var lockedBy = params.record.data.lockedBy;
             var currentUserId = CQ.User.getUserID();
             var locked = lockedBy != undefined && lockedBy.length > 0 && lockedBy != currentUserId;
             if(locked){
                 return false;
             }
            return this.inProgress.indexOf(params.record.id) == -1;
        }
    },
    "afteredit": {
        "title": function(params) {
            if (window.CQ_TextEditor.enterPressed) {
                if (params.originalValue == undefined) {
                    params.originalValue = "";
                }
                CQ.Ext.Msg.confirm(
                    CQ.I18n.getMessage("Change title"),
                    CQ.I18n.getMessage("Are you sure you want to change the title from '{0}' to '{1}'?", [CQ.shared.XSS.getXSSValue(params.originalValue), CQ.shared.XSS.getXSSValue(params.value)]),
                    function(btn) {
                        if (btn == 'yes') {
                            var titleProp = "./jcr:content/jcr:title";
                            if (params.record.get("type") == "dam:Asset") {
                                titleProp = "./jcr:content/metadata/dc:title";
                            }
                            var postParams = {};
                            postParams["_charset_"] = "utf-8";
                            postParams["./jcr:content/jcr:primaryType"] = "nt:unstructured";
                            postParams[titleProp] = params.value;

                            var response = CQ.HTTP.post(params.record.id, null, postParams);
                            if (CQ.HTTP.isOk(response)) {
                                params.record.commit();
                                try {
                                    CQ.Ext.getCmp(window.TaskAdmin_id + "-tree").getSelectionModel()
                                            .getSelectedNode().reload();
                                } catch (e) { }
                            } else {
                                params.record.reject();
                            }
                        } else {
                            params.record.reject();
                        }
                    },
                    this
                );
            } else {
                params.record.reject();
            }
        },
        "label": function(params) {
            // set new ID in page list
            var oldID = params.record.id;
            params.record.id = oldID.substring(0, oldID.lastIndexOf("/") + 1) + params.value;

            // update tree node name
            var tree = CQ.Ext.getCmp(this.id + "-tree");
            var root = tree.getRootNode();

            var node;
            var path = oldID.split("/");
            for (var i = 1; i < path.length; i++) {
                var name = path[i];
                if (name == root.attributes.name) {
                    node = root;
                } else {
                    node = node.findChild("name", name);
                }
            }
            node.attributes.name = params.value;
        }
    }
};

CQ.taskmanagement.TaskProjects.COLUMNS = {
    "numberer": {
        "id":"numberer",
        "header":CQ.I18n.getMessage(""),
        "width":23,
        "menuDisabled":true,
        "fixed":true,
        "hideable":false,
        "dataIndex":"index",
        "renderer": function(v, params, record) {
            if (v != undefined) {
                return v + 1;
            }
            return "";
        }
    },
    "name": {
        "header":CQ.I18n.getMessage("Task"),
        "id":"name",
        "dataIndex":"name",
        "width":60
    },
    "contentPath": {
        "header":CQ.I18n.getMessage("Asset"),
        "id":"contentPath",
        "dataIndex":"contentPath",
        "renderer":function(v, params, record) {
            if (record && record.json) {
                if (record.json.properties) {
                    if (record.json.contentPath) {
                        return record.json.contentPath;
                    }
                }
            }
            return "";
        }
    },
    "assignedTo": {
        "header":CQ.I18n.getMessage("Assigned To"),
        "id":"assignedTo",
        "dataIndex":"ownerId",
        "renderer":function(v, params, record) {
            if (record && record.json) {
                if (record.json.ownerId) {
                    return record.json.ownerId;
                }
            }
            return "";
        },
        "width":50
    },
    "priority": {
        "header":CQ.I18n.getMessage("Priority"),
        "id":"priority",
        "dataIndex":"taskPriority",
        "width":50
    },
    "description": {
        "header":CQ.I18n.getMessage("Description"),
        "id":"description",
        "dataIndex":"description"
    },
    "taskDueDate": {
        "header":CQ.I18n.getMessage("Due Date"),
        "id":"duedate",
        "dataIndex":"taskDueDate",
        "renderer":function(v, params, record) {
            if (record.get("taskDueDate")) {
                return CQ.taskmanagement.TaskProjects.formatDate(record.get("taskDueDate"));
            }
            return "";
        }
    },
    "taskStatus": {
        "header":CQ.I18n.getMessage("Status"),
        "id":"status",
        "dataIndex":"status"
    },
    "selectedAction": {
        "header":CQ.I18n.getMessage("Selected Action"),
        "id":"selectedAction",
        "dataIndex":"selectedAction",
        "renderer":function(v, params, record) {
            if (record && record.json && record.json.selectedAction)  {
                return record.json.selectedAction;
            }
            return "";
        }
    },
    "createTime": {
        "header":CQ.I18n.getMessage("Created"),
        "id":"createTime",
        "dataIndex":"createTime",
        "renderer":function(v, params, record) {
            if (record.get("createTime")) {
                return CQ.taskmanagement.TaskProjects.formatDate(record.get("createTime"));
            }
            return "";
        }
    },
    "completeTime": {
        "header":CQ.I18n.getMessage("Completed"),
        "id":"completeTime",
        "dataIndex":"completeTime",
        "renderer":function(v, params, record) {
            if (record.get("completeTime")) {
                return CQ.taskmanagement.TaskProjects.formatDate(record.get("completeTime"));
            }
            return "";
        }
    },
    "comment": {
        "header":CQ.I18n.getMessage("Comment"),
        "id":"comment",
        "dataIndex":"taskComment"
    }
};

/**
 * The context value for actions to appear on the tool bar.
 * @static
 * @final
 * @type String
 */
CQ.taskmanagement.TaskProjects.CONTEXT_TOOLBAR = "toolbar";

/**
 * The context value for actions to appear on the context menu.
 * @static
 * @final
 * @type String
 */
CQ.taskmanagement.TaskProjects.CONTEXT_CONTEXTMENU = "contextmenu";

/**
 * The regular expression to identify that file upload will create a DAM asset.
 * @static
 * @final
 * @type String
 */
CQ.taskmanagement.TaskProjects.UPLOAD_URL_ASSET_REGEXP = /\.createasset\.html$/;
/**
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2011 Adobe Systems Incorporated
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
CQ.taskmanagement.CreateAnnotationTaskDialog = CQ.Ext.extend(CQ.Dialog, {

    /**
     * contains the parent task Id under which we're creating this task
     */
    parentTaskId: null,

    authSelection: null,

    okHandler: function() {},

    constructor: function(config, parentTaskId, aAnnotation) {

        this.parentTaskId = parentTaskId;
        this.annotation = aAnnotation;
        if (!config) {
            config = {};
        }
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }

        configDefaults = {
            closable: true,
            width: 615,
            height: 450,
            border: false,
            modal: true,
            title: CQ.I18n.getMessage("Create Task"),
            items: {
                xtype: "panel",
                items: [
                    {
                        xtype: 'textfield',
                        name: 'taskName',
                        fieldLabel: CQ.I18n.getMessage("Name"),
                        fieldDescription : CQ.I18n.getMessage("Give a name to this task"),
                        allowBlank:false
                    }, {
                        xtype: 'authselection',
                        name: 'taskOwner',
                        displayField:"principal",
                        fieldDescription: CQ.I18n.getMessage("The owner of this task"),
                        fieldLabel: CQ.I18n.getMessage("Assign To")
                    },
                    {
                        "xtype":"combo",
                        "name":"taskPriority",
                        "fieldLabel":CQ.I18n.getMessage("Task Priority"),
                        "fieldDescription":CQ.I18n.getMessage("Select a priority for this task"),
                        "displayField":"name",
                        "valueField":"priority",
                        "selectOnFocus":true,
                        "triggerAction":"all",
                        "editable":false,
                        "mode": 'local',
                        "store":
                            new CQ.Ext.data.SimpleStore({
                                    fields: ['priority','name'],
                                    data: [
                                        ["High","High"],
                                        ["Medium","Medium"],
                                        ["Low","Low"]
                                    ]
                                }
                            )
                    },
                    {
                    xtype: 'textarea',
                    name: 'taskDescription',
                    fieldLabel: CQ.I18n.getMessage("Description"),
                    fieldDescription : CQ.I18n.getMessage("Provide a description of the task"),
                    value : this.getAnnotationText()
                }, {
                    xtype: 'pathfield',
                    name: 'contentPath',
                    fieldLabel: CQ.I18n.getMessage("Content Path"),
                    fieldDescription : CQ.I18n.getMessage("The content to monitor for this task"),
                    rootTitle : CQ.I18n.getMessage("Content"),
                    value : this.getAnnotationLocation()
                },  {
                    xtype: 'datetime',
                    name: 'taskDueDate',
                    fieldLabel: CQ.I18n.getMessage("Due Date"),
                    fieldDescription: CQ.I18n.getMessage("The due date of this task")
                }
                ]
            },
            buttons: [
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ]
        };

        CQ.Util.applyDefaults(config, configDefaults);

        CQ.taskmanagement.CreateAnnotationTaskDialog.superclass.constructor.call(this, config);
    },

    getAnnotationText : function() {
        if (this.annotation && this.annotation.field) {
            return this.annotation.field.getValue();
        }
        return "";
    },

    getAnnotationLocation : function(annotationPath) {
        if (this.annotation && this.annotation.path) {
            var annotationPath = this.annotation.path;
            var annotPathPartLocation = annotationPath.indexOf("/cq:annotations");
            if (annotPathPartLocation!=-1) {
                return annotationPath.substring(0, annotPathPartLocation);
            }
        }
        return "";
    },

    /**
     * Returns the config for the default OK button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
    getOkConfig: function() {
        return {
            text: this.okText,
            cls: "cq-btn-ok",
            handler: function(button) {
                this.hide();
                var taskInfo = this.getTaskDataFromDialog();
                this.okHandler(taskInfo);
            }
        };
    },
    getTaskDataFromDialog: function() {
        var taskCreateInfo = {
            properties: {
                taskPriority: this.getField("taskPriority").getValue(),
                taskDueDate: this.getField("taskDueDate").getValue()
            },
            contentPath: this.getField("contentPath").getValue(),
            taskType: "projectsubtask",
            name: this.getField("taskName").getValue(),
            description: this.getField("taskDescription").getValue(),
            ownerId: this.getField("taskOwner").getValue()
        };
        if (this.parentTaskId!=null) {
            taskCreateInfo.parentTaskId = this.parentTaskId;
        }

        return taskCreateInfo;
    }
});

CQ.Ext.reg('createannotationtaskdialog', CQ.taskmanagement.CreateAnnotationTaskDialog);
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
 * @class CQ.taskmanagement.ProjectTaskSelection
 * @extends CQ.Ext.form.ComboBox
 *
 * A specialized {@link CQ.Ext.form.ComboBox ComboBox} to select and search
 * for tasks of type 'project' (i.e. Project selection).<p>
 *
 * based on CQ.security.AuthorizableSelection
 *
 */
CQ.taskmanagement.ProjectTaskSelection = CQ.Ext.extend(CQ.Ext.form.ComboBox, {

    filterButtons: false,

    storeUrl: "/libs/granite/taskmanager/list.json",

    storeLimit: 25,

    filter: null,

    constructor:function(config) {

        CQ.Util.applyDefaults(config,{
            "stateful":false,
            "minChars":0,
            "minListWidth":200,
            "queryParam":"filter",
            "triggerClass": "x-form-search-trigger",
            "tpl" :new CQ.Ext.XTemplate(
                    '<tpl for=".">',
                        '<div class="cq-auth-list">',
                            '<div class="cq-auth-list-entry {[values.type=="group"? "cq-group-icon": "cq-user-icon"]}">',
                                '{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"name\") == "" ? values.name : CQ.shared.XSS.getXSSTablePropertyValue(values, \"name\", 100)]}',
                            '</div>',
                        '</div>',
                    '</tpl>'),
            "itemSelector" :"div.cq-auth-list",
            valueField: 'id',
            displayField: 'name',
            "storeConfig":{
                "autoLoad":false,
                "proxy": new CQ.Ext.data.HttpProxy({
                    "url":this.storeUrl,
                    "method":"GET"
                }),
                "baseParams": {
                    "limit":this.storeLimit,
                    "_charset_":"utf-8",
                    "taskType":"project"
                },
                idProperty: 'name',
                fields: [ "id", "name", "description"],
                "totalProperty": "results",
                "root": "tasks",
                "id": "id"
            }
        });

        this.authStore = new CQ.Ext.data.JsonStore(config.storeConfig);

        config.store = this.authStore;
        CQ.taskmanagement.ProjectTaskSelection.superclass.constructor.call(this, config);
    },

    /**
     * @method initComponent
     */
    initComponent: function() {
        CQ.taskmanagement.ProjectTaskSelection.superclass.initComponent.call(this);
        if (this.filter) {
            this.authStore.baseParams[this.filter] = "true";
        }
    },

    /**
     * @private
     */
    onRender: function(ct, pos) {
        CQ.taskmanagement.ProjectTaskSelection.superclass.onRender.call(this, ct, pos);
    }
});

CQ.Ext.reg("projecttaskselection", CQ.taskmanagement.ProjectTaskSelection);
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
CQ.taskmanagement.CreateTaskDialog = CQ.Ext.extend(CQ.Dialog, {

    /**
     * contains the parent task Id under which we're creating this task
     */
    parentTaskId: null,

    authSelection: null,

    okHandler: function() {},

    constructor: function(config, parentTaskId) {

        this.parentTaskId = parentTaskId;
        if (!config) {
            config = {};
        }
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }

        configDefaults = {
            closable: true,
            width: 615,
            height: 470,
            border: false,
            modal: true,
            title: CQ.I18n.getMessage("Create Task"),
            items: {
                xtype: "panel",
                items: [
                    {
                        xtype: 'textfield',
                        name: 'task:name',
                        fieldLabel: CQ.I18n.getMessage("Name"),
                        fieldDescription : CQ.I18n.getMessage("Give a name to this task"),
                        allowBlank:false
                    },
                    {
                        xtype: 'authselection',
                        name: 'task:owner',
                        displayField:"principal",
                        fieldDescription: CQ.I18n.getMessage("The owner of this task"),
                        fieldLabel: CQ.I18n.getMessage("Assign To"),
                        allowBlank:false
                    },
                    {
                        xtype: 'pathfield',
                        name: 'task:contentPath',
                        fieldLabel: CQ.I18n.getMessage("Content Path"),
                        fieldDescription : CQ.I18n.getMessage("The content to monitor for this task"),
                        rootTitle : CQ.I18n.getMessage("Content")
                    },
                    {
                        xtype: 'textarea',
                        name: 'task:description',
                        fieldLabel: CQ.I18n.getMessage("Description"),
                        fieldDescription : CQ.I18n.getMessage("Provide a description of the task")
                    },
                    {
                        "xtype":"combo",
                        "name":"task:priority",
                        "fieldLabel":CQ.I18n.getMessage("Task Priority"),
                        "fieldDescription":CQ.I18n.getMessage("Select a priority for this task"),
                        "displayField":"name",
                        "valueField":"priority",
                        "selectOnFocus":true,
                        "triggerAction":"all",
                        "editable":false,
                        "mode": 'local',
                        "store":
                            new CQ.Ext.data.SimpleStore({
                                    fields: ['priority','name'],
                                    data: [
                                        ["High","High"],
                                        ["Medium","Medium"],
                                        ["Low","Low"]
                                    ]
                                }
                            )
                    },
                    {
                        xtype: 'datetime',
                        name: 'task:dueDate',
                        fieldLabel: CQ.I18n.getMessage("Due Date"),
                        fieldDescription: CQ.I18n.getMessage("The due date of this task"),
                        validate: function() {
                            var currentValue = this.getValue();
                            if (currentValue===undefined || currentValue==="") {
                                // empty due date is allowed
                                return true;
                            }
                            // we have a date -> make sure it's later than right now...
                            var currentDate = new Date();
                            // add one minute
                            currentDate.setMinutes(currentDate.getMinutes()+2);
                            var result = currentDate<currentValue;
                            if (!result) {
                                var dtfInvalidMsg = CQ.I18n.getMessage("Due date set in the past");
                                this.tf.markInvalid(dtfInvalidMsg);
                                this.df.markInvalid(dtfInvalidMsg);
                                this.markInvalid("..");
                                return false;
                            } else {
                                this.tf.clearInvalid();
                                this.df.clearInvalid();
                                return true;
                            }

                        }
                    },
                    {
                        xtype: 'hidden',
                        name: 'task:taskType',
                        value: "projectsubtask"
                    },
                    {
                        xtype: 'hidden',
                        name: 'task:parentTaskId',
                        value: this.parentTaskId
                    }
                ]
            },
            buttons: [
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ]
        };

        CQ.Util.applyDefaults(config, configDefaults);

        CQ.taskmanagement.CreateTaskDialog.superclass.constructor.call(this, config);

        this.setUpDateTimeFieldErrorClearer();
    },

    // the DateTimeField only clears either the time or the date sub-field
    // -> add a change listener to clear both fields
    setUpDateTimeFieldErrorClearer: function() {
        var dateTimeField = this.getField("task:dueDate");
        if (dateTimeField) {
            dateTimeField.df.addListener("change", function() {
                dateTimeField.df.clearInvalid();
                dateTimeField.tf.clearInvalid();
            });
            dateTimeField.tf.addListener("change", function() {
                dateTimeField.df.clearInvalid();
                dateTimeField.tf.clearInvalid();
            });
        }
    },


   /* selectionAction: function(grid) {
        var rec = grid.getSelectionModel().getSelected()
        var name = rec.get("name");
        *//*if (name) {
            alert(name);
        }*//*
    },*/

    /**
     * Returns the config for the default OK button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
     getOkConfig: function() {
        var createTaskDialog = this;
        return {
            text: this.okText,
            cls: "cq-btn-ok",
            handler: function(button) {
                if (!this.form.isValid()) {
                    CQ.Ext.Msg.show({
                        title:CQ.I18n.getMessage('Validation Failed'),
                        msg: CQ.I18n.getMessage('Verify the values of the marked fields.'),
                        buttons: CQ.Ext.Msg.OK,
                        icon: CQ.Ext.Msg.ERROR
                    });
                    return;
                }
                var taskInfo = createTaskDialog.getTaskDataFromDialog();
                createTaskDialog.hide();
                createTaskDialog.okHandler(taskInfo);
            }
        };
    },
    dialogInfoValid: function() {
        for(var index=0; index<this.items.length; index++) {
            var item = this.items[index];
            if (!item.validate()) {
                return false;
            }
        }
        return true;
    },
    getTaskDataFromDialog: function() {
        var taskCreateInfo = {
            properties: {
                "taskPriority": this.getField("task:priority").getValue(),
                "taskDueDate": this.getField("task:dueDate").getValue()
            },
            "contentPath": this.getField("task:contentPath").getValue(),
            "taskType": "projectsubtask",
            "name": this.getField("task:name").getValue(),
            "description": this.getField("task:description").getValue(),
            "ownerId": this.getField("task:owner").getValue()
        };
        if (this.parentTaskId!=null) {
            taskCreateInfo.parentTaskId = this.parentTaskId;
        }

        return taskCreateInfo;
    }
});

CQ.Ext.reg('createtaskdialog', CQ.taskmanagement.CreateTaskDialog);
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
CQ.taskmanagement.CreateTaskProjectDialog = CQ.Ext.extend(CQ.Dialog, {

    /**
     * contains the parent task Id under which we're creating this task
     */
    parentTaskId: null,

    authSelection: null,

    okHandler: function() {},

    constructor: function(config, parentTaskId) {

        this.parentTaskId = parentTaskId;
        if (!config) {
            config = {};
        }
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }

        configDefaults = {
            closable: true,
            width: 615,
            height: 380,
            border: false,
            modal: true,
            title: CQ.I18n.getMessage("Create Project"),
            items: {
                xtype: "panel",
                items: [
                    {
                    xtype: 'textfield',
                    name: 'projectName',
                    fieldLabel: CQ.I18n.getMessage("Name"),
                    fieldDescription : CQ.I18n.getMessage("Give a name to this project"),
                    allowBlank:false
                }, {
                    xtype: 'textarea',
                    name: 'projectDescription',
                    fieldLabel: CQ.I18n.getMessage("Description"),
                    fieldDescription : CQ.I18n.getMessage("Provide a description of the project")
                }
                ]
            },
            buttons: [
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ]
        };

        CQ.Util.applyDefaults(config, configDefaults);

        CQ.taskmanagement.CreateTaskProjectDialog.superclass.constructor.call(this, config);
    },

    /**
     * Returns the config for the default OK button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
    getOkConfig: function() {
        return {
            text: this.okText,
            cls: "cq-btn-ok",
            handler: function(button) {
                if (!this.form.isValid()) {
                    CQ.Ext.Msg.show({
                        title:CQ.I18n.getMessage('Validation Failed'),
                        msg: CQ.I18n.getMessage('Verify the values of the marked fields.'),
                        buttons: CQ.Ext.Msg.OK,
                        icon: CQ.Ext.Msg.ERROR
                    });
                    return;
                }
                this.hide();
                var taskInfo = this.getTaskDataFromDialog();
                this.okHandler(taskInfo);
            }
        };
    },
    getTaskDataFromDialog: function() {
        var projectCreateInfo = {
            properties: {
            },

            taskType: "project",
            name: this.getField("projectName").getValue(),
            description: this.getField("projectDescription").getValue()
        };
        if (this.parentTaskId!=null) {
            projectCreateInfo.parentTaskId = this.parentTaskId;
        }

        return projectCreateInfo;
    }
});

CQ.Ext.reg('createtaskprojectdialog', CQ.taskmanagement.CreateTaskProjectDialog);
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

/**
 * @class CQ.taskmanagement.TaskEditor
 * @extends CQ.Ext.Panel
 * The Task Editor used in Task Management
 * @constructor
 * Creates a new Task Editor.
 */
CQ.taskmanagement.TaskEditor = CQ.Ext.extend(CQ.Ext.Panel, {
    /**
     * @cfg {Object} infoPanel
     * The config for the panel wrapping the thumbnail and general information.
     * See {@link CQ.Ext.Panel} for config options.
     */

    tabs: [],

    /**
     * Processes the specified records. This method should only be used as
     * a callback by the component's store when loading content.
     * @param {CQ.Ext.data.Record[]} recs The records
     * @param {Object} opts (optional) The options, such as the scope
     * @param {Boolean} success True if retrieval of records was
     *        successful
     * @private
     */
    processRecords: function(recs, opts, success) {
        var rec;
        if (success) {
            rec = recs[0];
        } else {
            CQ.Log.warn("CQ.taskmanagement.TaskEditor#processRecords: retrieval of records unsuccessful");
            rec = new CQ.data.SlingRecord();
            rec.data = {};
        }

        this.hideLoadMask();
        this.fireEvent("loadcontent", this, recs, opts, success);
    },

    getTaskDataFromInfoPanel: function() {
        var taskCreateInfo = {
            properties: {
                taskPriority: this.taskInfoPanel.find("name", "taskPriority")[0].getValue(),
                taskDueDate: this.taskInfoPanel.find("name", "taskDueDate")[0].getValue()
            },
            contentPath: this.taskInfoPanel.find("name", "contentPath")[0].getValue(),
            name: this.taskInfoPanel.find("name", "taskName")[0].getValue(),
            description: this.taskInfoPanel.find("name", "taskDescription")[0].getValue(),
            ownerId: this.taskInfoPanel.find("name", "taskOwner")[0].getValue()
        };
        if (this.parentTaskId!=null) {
            taskCreateInfo.parentTaskId = this.parentTaskId;
        }

        return taskCreateInfo;
    },

    /**
     * @private
     */
    updateTask: function(doComplete, selectedAction, commentFromDialog) {
        var taskEditor = this;
        var config = {
            "success": function() {
                // timeout required for modified date in info
                window.setTimeout(function() {
                    taskEditor.refreshGrid();
                    delete taskEditor.info;
                    taskEditor.refreshInfo();
                }, 600);
            },
            "failure": function(panel, action) {
                taskEditor.hideLoadMask();
                taskEditor.notify(action.result ? action.result.Message : "");
            }
        };

        if (taskEditor.isTaskInfoValid()) {
            var updatedTaskInfo = this.getTaskDataFromInfoPanel();
            if (doComplete===true) {
                updatedTaskInfo.status = "COMPLETE";
            }
            if (commentFromDialog) {
                if (updatedTaskInfo.properties) {
                    updatedTaskInfo.properties.comment = commentFromDialog;
                } else {
                    updatedTaskInfo.properties = {
                        "comment": commentFromDialog
                    };
                }
            }

            var url = "/libs/granite/taskmanager/updatetask";
            var completeParams = {
                taskId: this.taskInfo.id,
                _charset_:"utf-8"
            };
            if (selectedAction) {
                completeParams.selectedAction = selectedAction;
            }

            CQ.Ext.Ajax.request({
                "url": url,
                "method": "POST",
                "jsonData": JSON.stringify(updatedTaskInfo),
                "params": completeParams,
                "success": function(response, options) {
                    if (doComplete) {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Task Completed"));
                    } else {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Task Updated"));
                    }

                    taskEditor.taskInfo = JSON.parse(response.responseText);
                    taskEditor.updateTaskInUI();
                    taskEditor.enableButtonsFromTaskInfo();
                    taskEditor.refreshGrid();
                },
                "failure": function(response, options) {
                    if (doComplete) {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to complete task"));
                    } else {
                        CQ.Notification.notify(null, CQ.I18n.getMessage("Failed to update task"));
                    }
                }
            });
        } else {
            CQ.Ext.Msg.show({
                title:CQ.I18n.getMessage('Validation Failed'),
                msg: CQ.I18n.getMessage('Verify the values of the marked fields.'),
                buttons: CQ.Ext.Msg.OK,
                icon: CQ.Ext.Msg.ERROR
            });
        }
    },
    isTaskInfoValid: function() {
        return this.taskInfoPanel.form.isValid();
    },



    /**
     * Returns an array of configs for the buttons
     * @type {Object[]}
     * @private
     */
    getButtonsConfig: function(buttons, actionNames) {
        var taskEditor = this;
        var b = [ "->" ];
        if (typeof buttons == "string") {
            // buttons: CQ.taskmanagement.TaskEditor.SAVE  =>  buttons: [ CQ.taskmanagement.TaskEditor.SAVE ]
            buttons = [buttons];
        }
        for (var i=0; i < buttons.length; i++) {
            if (typeof buttons[i] == "string") {

                // save button
                if (buttons[i] == CQ.taskmanagement.TaskEditor.SAVE) {
                    var saveButton = new CQ.Ext.Button({
                        "text": CQ.I18n.getMessage("Save"),
                        "disabled": this.readOnly,
                        "cls": "cq-btn-save",
                        "scope": this,
                        "minWidth": CQ.taskmanagement.themes.TaskEditor.MIN_BUTTON_WIDTH,
                        "handler": function(button) {
                            this.updateTask(false, null);
                        }
                    });
                    b.push(saveButton);
                }

                else if (buttons[i] == CQ.taskmanagement.TaskEditor.COMPLETE) {
                    var taskEditor = this;
                    var completeButton = new CQ.Ext.Button({
                        "text": CQ.I18n.getMessage("Complete Task..."),
                        "disabled": this.readOnly,
                        "cls": "cq-btn-complete",
                        "scope": this,
                        "minWidth": CQ.taskmanagement.themes.TaskEditor.MIN_BUTTON_WIDTH,
                        "handler": function(button) {
                            var completeTaskDialogConfig = {
                                "okHandler": function(selectedActionId, commentFromDialog) {
                                    taskEditor.updateTask(true, selectedActionId, commentFromDialog);
                                }
                            };

                            var dialog = new  CQ.taskmanagement.CompleteTaskDialog(completeTaskDialogConfig, actionNames);
                            dialog.show();
                        }
                    });
                    b.push(completeButton);
                }

                // reset button
                else if (buttons[i] == CQ.taskmanagement.TaskEditor.RESET) {
                    var resetButton = new CQ.Ext.Button({
                        "text": CQ.I18n.getMessage("Reset"),
                        "disabled": this.readOnly,
                        "cls": "cq-btn-reset",
                        "scope": this,
                        "minWidth": CQ.taskmanagement.themes.TaskEditor.MIN_BUTTON_WIDTH,
                        "handler": function(button) {
                            taskEditor.loadMask.show();
                        }
                    });
                    b.push(resetButton);
                }
                // refresh info panel button
                else if (buttons[i] == CQ.taskmanagement.TaskEditor.REFRESH_INFO) {
                    var refreshButton = new CQ.Ext.Button({
                        "tooltip": CQ.I18n.getMessage("Refresh"),
                        "tooltipType": "title",
                        "iconCls":"cq-siteadmin-refresh",
                        "scope": this,
                        "handler": function(button) {
                            var now = new Date().getTime();
                            m.show();
                            delete this.info;
                            this.refreshInfo();
                            window.setTimeout(function(){m.hide();}, this.getTimeoutTime(now));
                        }
                    });
                    b.push(refreshButton);
              }
            }
            else {
                if(buttons[i]) {
                    if (typeof buttons[i].handler == "string") {
                        buttons[i].handler = eval(buttons[i].handler);
                    }

                    b.push(CQ.Util.applyDefaults(buttons[i], {
                        "minWidth": CQ.taskmanagement.themes.TaskEditor.MIN_BUTTON_WIDTH,
                        "scope": this
                    }));
                }
            }
        }
        return b;
    },

    /**
     * Returns if the asset is of a GIF, PNG or JPEG image.
     * @param {String} name
     * @private
     */
    isImage: function(name) {
        name = name ? name.toLowerCase() : this.fileName.toLowerCase();
        if (name.indexOf(".") == -1) return false; // no extension
        var is = false;
        var ext = ["jpg", "gif", "png", "jpeg"];
        for (var i = 0; i < ext.length; i++) {
            if (name.lastIndexOf("." + ext[i]) == name.length - ext[i].length - 1) {
                is = true;
                break;
            }
        }
        return is;
    },

    /**
     * Returns info of the specified name.
     * @param {String} name
     * @param {boolean} force True to request the info from the server
     * @private
     */
    getInfo: function(name, force) {
        if (force || !this.info) {
            var info = {};

            var mod = "";
            try {
                mod = new Date(info["jcr:content"]["jcr:lastModified"]);
                mod = CQ.taskmanagement.TaskProjects.formatDate(mod);
            }
            catch (e) {}


            var dim = "";


            this.info = {
                "title": this.taskInfo.name, // "Hacked Title", // meta["dc:title"] ? meta["dc:title"] : "",
                "name":this.taskInfo.name,
                "lastModified": mod,
                "dimensions": dim
            };
        }
        return this.info[name];
    },

    /**
     * Returns an array of configs for the tabs
     * @type {Object[]}
     * @private
     */
    getTabsConfig: function(tabs) {
        var t = [];
        if (typeof tabs == "string") {
            // tabs: CQ.taskmanagement.TaskEditor.SUBASSETS  =>  tabs: [ CQ.taskmanagement.TaskEditor.SUBASSETS ]
            tabs = [tabs];
        }

        for (var i=0; i < tabs.length; i++) {
            if (typeof tabs[i] == "string") {

            }
        }
        return t;
    },

    /**
     * Refreshes the info
     * @private
     */
    refresh: function() {
        delete this.info;
        this.refreshInfo();
        this.refreshGrid();
    },

    /**
     * Refreshes the info panel
     * @private
     */
    refreshInfo: function() {
        this.titleInfo.updateText(this.getInfo("title"));
        this.lastModifiedInfo.updateText(this.getInfo("lastModified"));
        if (this.dimensionsInfo) this.dimensionsInfo.updateHtml(this.getInfo("dimensions"));
    },

    /**
     * Refreshes the taskmanager grid
     */
    refreshGrid: function() {
        CQ.Ext.getCmp("cq-taskmanager" + "-grid").getStore().reload();
        CQ.taskmanagement.TaskManagementAdmin.reloadSelectedNode();
    },

    /**
     * Shows the loading mask with the given message or "Saving...".
     * @param msg {String} The message (optional)
     */
    showSaveMask: function(msg) {
        this.showLoadMask(msg || CQ.I18n.getMessage("Saving..."));
    },

    /**
     * Shows the loading mask with the given message or "Loading...".
     * @param msg {String} The message (optional)
     */
    showLoadMask: function(msg) {
        // apply mask to this.body in order to be able to close a tab in case
        // the mask is unexpected not hidden
        this.loadMask = new CQ.Ext.LoadMask(this.body, {
            "msg": msg || CQ.I18n.getMessage("Loading...")
        });
        this.loadMask.show();
    },

    /**
     * Hides the loading mask
     */
    hideLoadMask: function() {
        if (this.loadMask) this.loadMask.hide();
    },

    /**
     * Hides the loading mask
     * @deprecated
     */
    hideSaveMask: function() {
        this.hideLoadMask();
    },


    // to avoid flickering display loading messages at least 600 ms
    getTimeoutTime: function(time) {
        var delta = new Date().getTime() - time;
        var min = 600;
        if (delta > min) return 1;
        return min - delta;
    },

    /**
     * Displays the specified error message and hides the loading mask.
     * @param msg {String} The error message (optional)
     */
    notify: function(msg) {
        this.hideLoadMask();
        if (!msg) msg = CQ.I18n.getMessage("Unspecified error");
        CQ.Notification.notify(CQ.I18n.getMessage("Error"), msg);
    },

    /**
     * Applies {@link CQ.Ext.form.Field#readOnly readOnly} recursively to the specified items.
     * @param items
     * @private
     */
    applyReadOnly: function(items) {

        if (items === undefined) {
            return;
        }
        for (var i = 0; i < items.length; i++) {
            try {
                if (items[i].items) {
                    // assuming is panel
                    this.applyReadOnly(items[i].item);
                }
                items[i].readOnly = true;
            }
            catch (e) {
                CQ.Log.warn("CQ.taskmanagement.TaskEditor#applyReadOnly: " + e.message);
            }
        }
    },

    constructor: function(config) {
        var ae = this;
        this.path = config.path;
        this.taskInfo = config.taskInfo;
        this.pathEncoded = CQ.HTTP.encodePath(this.path);
        if (config.path) {
            this.fileName = config.path.substring(config.path.lastIndexOf("/") + 1);
            this.parentPath = config.path.substring(0, config.path.lastIndexOf("/"));
        }
        this.readOnly = config.readOnly || config.taskInfo.status==="COMPLETE";

        var taskEditorCustomBBar = [
            "->",
            CQ.taskmanagement.TaskEditor.SAVE
            ];
        if (this.taskInfo.actionNames) {
            this.taskInfo.actionNames.map(function(item) { taskEditorCustomBBar.push(item); });
        } else {
            taskEditorCustomBBar.push(CQ.taskmanagement.TaskEditor.COMPLETE);
        }
        taskEditorCustomBBar.push(CQ.taskmanagement.TaskEditor.RESET);

        config = CQ.Util.applyDefaults(config, {
            "layout": "border",
            "closable": true,
            "header": false,
            "border": false,
            "cls": "cq-taskeditor",
            "contentPath": "/jcr:content/metadata",
            "title": CQ.shared.XSS.getXSSValue(CQ.shared.Util.ellipsis(this.fileName, 30)),
            "thumbnailWidth": 250, // TODO - 319
            "thumbnailHeight": 250, // TODO - 319
            "thumbnailServlet": "thumb",
            "thumbnailExtension": "png",
            "bbar": taskEditorCustomBBar,
            "bbarCfg": { buttonAlign: "right" },
            "bbarWest": [
                CQ.taskmanagement.TaskEditor.REFRESH_INFO
            ],
            "tabs": [ ]
        });


        // ---------------------------------------------------------------------
        // info panel (west)
        // ---------------------------------------------------------------------

        var items = [];

        this.titleInfo = new CQ.Static({
           "cls": "cq-taskeditor-title",
           "text": this.getInfo("title"),
           "colspan": 2
        });
        items.push(this.titleInfo);

        items.push(new CQ.Static({
            "cls": "infoLabel",
            "small": true,
            "text": CQ.I18n.getMessage("Name")
        }));
        items.push(new CQ.Static({
            "small": true,
            "right": true,
            "text": this.fileName
        }));

        if (config.assetInfo.size) {
            items.push(new CQ.Static({
                "cls": "infoLabel",
                "small": true,
                "text": CQ.I18n.getMessage("Size")
            }));
            this.sizeInfo = new CQ.Static({
                "small": true,
                "right": true,
                "text": CQ.Util.formatFileSize(config.assetInfo.size)
            });
            items.push(this.sizeInfo);
        }

        items.push(new CQ.Static({
            "cls": "infoLabel",
            "small": true,
            "text": CQ.I18n.getMessage("Modified")
        }));
        this.lastModifiedInfo = new CQ.Static({
            "small": true,
            "right": true,
            "text": config.assetInfo.lastModified ? CQ.taskmanagement.TaskProjects.formatDate(new Date(config.assetInfo.lastModified)) : ""
        });
        items.push(this.lastModifiedInfo);

        if (config.assetInfo.mime) {
            items.push(new CQ.Static({
                "cls": "infoLabel",
                "small": true,
                "text": CQ.I18n.getMessage("Type")
            }));
            this.typeInfo = new CQ.Static({
                "small": true,
                "right": true,
                "text": config.assetInfo.mime
            });
            items.push(this.typeInfo);
        }

        if (config.assetInfo.width && config.assetInfo.height) {
            items.push(new CQ.Static({
                "cls": "infoLabel",
                "small": true,
                "text": CQ.I18n.getMessage("Dimensions")
            }));
            this.dimensionsInfo = new CQ.Static({
                "small": true,
                "right": true,
                "html": config.assetInfo.width + ' &times; ' + config.assetInfo.height
            });
            items.push(this.dimensionsInfo);
        }

        items.push(new CQ.Static({
            "colspan": 2,
            "small": true,
            "right": true,
            "cls": "cq-taskeditor-download",
            "html": '<a href="' + CQ.HTTP.externalize(CQ.shared.XSS.getXSSValue(this.pathEncoded)) + '" target="_blank" title="' + CQ.shared.XSS.getXSSValue(this.path) + '">' + CQ.I18n.getMessage("Download") + '</a>'
        }));

        // ---------------------------------------------------------------------
        // tab panel (east)
        // ---------------------------------------------------------------------

        var tabs = this.getTabsConfig(config.tabs);
        if (tabs.length > 0) {
            var tabPanelConfig = CQ.Util.applyDefaults(config.tabPanel, {
                "xtype": "tabpanel",
                "region": "east",
                "width": CQ.taskmanagement.themes.TaskEditor.EAST_PANEL_WIDTH,
                "split": true,
                "collapsible":true,
                "collapseMode":"mini",
                "hideCollapseTool": true,
                "margins":"5 5 5 0",
                "enableTabScroll": true,
                "cls": "cq-taskeditor-east",
                "activeTab": 0,
                "plain": true,
                "footer": false,
                "items": tabs,
                "listeners": {
                    "tabchange": function (tabpanel, panel) {
                        panel.doLayout();
                    }
                }
            });
            this.tabPanel = CQ.Util.build(tabPanelConfig);
        }


        // ---------------------------------------------------------------------
        // form panel (center)
        // ---------------------------------------------------------------------

        // delete the bbar cfg - otherwise would be used as buttons config for the main panel
        delete config.bbar;

        var buttonsArray = [CQ.taskmanagement.TaskEditor.SAVE];
        buttonsArray.push(CQ.taskmanagement.TaskEditor.COMPLETE);
        buttonsArray.push(CQ.taskmanagement.TaskEditor.RESET);

        var customButtonBarConfig = this.getButtonsConfig(buttonsArray, this.taskInfo.actionNames);
        var panelConfig = {
            "region": "center",
            "buttonAlign": "right",
            "autoScroll": true,
            "cls": "cq-taskeditor-center",
            "margins": this.tabPanel ? "5 0 5 0" : "5 5 5 0",
            "labelWidth": CQ.taskmanagement.themes.TaskEditor.LABEL_WIDTH,
            "defaults": {
                "anchor": CQ.Ext.isIE6 ? "92%" : CQ.Ext.isIE7 ? "96%" : "100%",
                "stateful": false
            },
            "bbar": customButtonBarConfig,
            "cleanUp": function() {
                // used in TagInputField when default namespace is undefined and
                // a new label has been entered (bug 29859)
                ae.hideLoadMask();
            },
            layout: {
                type: "form"
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'taskName',
                    fieldLabel: CQ.I18n.getMessage("Name"),
                    fieldDescription : CQ.I18n.getMessage("The name of this task"),
                    readOnly: true
                },
                {
                    xtype: 'textfield',
                    name: 'taskStatus',
                    fieldLabel: CQ.I18n.getMessage("Status"),
                    fieldDescription : CQ.I18n.getMessage("The status of this task"),
                    readOnly: true
                },
                {
                    xtype: 'authselection',
                    name: 'taskOwner',
                    displayField:"principal",
                    fieldDescription: CQ.I18n.getMessage("The owner of this task"),
                    fieldLabel: CQ.I18n.getMessage("Assign To"),
                    allowBlank:false
                },
                {
                    xtype: 'pathfield',
                    name: 'contentPath',
                    fieldLabel: CQ.I18n.getMessage("Content Path"),
                    fieldDescription : CQ.I18n.getMessage("The content to monitor for this task"),
                    rootTitle : CQ.I18n.getMessage("Content")
                },
                {
                    xtype: 'textarea',
                    name: 'taskDescription',
                    fieldLabel: CQ.I18n.getMessage("Description"),
                    fieldDescription : CQ.I18n.getMessage("Provide a description of the task")
                },
                {
                    "xtype":"combo",
                    "name":"taskPriority",
                    "fieldLabel":CQ.I18n.getMessage("Task Priority"),
                    "fieldDescription":CQ.I18n.getMessage("Select a priority for this task"),
                    "displayField":"name",
                    "valueField":"priority",
                    "selectOnFocus":true,
                    "triggerAction":"all",
                    "editable":false,
                    "mode": 'local',
                    "store":
                        new CQ.Ext.data.SimpleStore({
                                fields: ['priority','name'],
                                data: [
                                    ["High","High"],
                                    ["Medium","Medium"],
                                    ["Low","Low"]
                                ]
                            }
                        )
                },
                {
                    xtype: 'datetime',
                    name: 'taskDueDate',
                    fieldLabel: CQ.I18n.getMessage("Due Date"),
                    fieldDescription: CQ.I18n.getMessage("The due date of this task"),
                    validate: function() {
                        var currentValue = this.getValue();
                        if (currentValue===undefined || currentValue==="") {
                            // empty due date is allowed
                            return true;
                        }
                        // we have a date -> make sure it's later than right now...
                        var currentDate = new Date();
                        // add one minute
                        currentDate.setMinutes(currentDate.getMinutes()+2);
                        var result = currentDate<currentValue;
                        if (!result) {
                            var dtfInvalidMsg = CQ.I18n.getMessage("Due date set in the past");
                            this.tf.markInvalid(dtfInvalidMsg);
                            this.df.markInvalid(dtfInvalidMsg);
                            this.markInvalid("..");
                            return false;
                        } else {
                            this.tf.clearInvalid();
                            this.df.clearInvalid();
                            return true;
                        }

                    }
                }
            ]
        };

        if (this.readOnly) {
            this.applyReadOnly(panelConfig.items);
        }

        this.taskInfoPanel = new CQ.Ext.FormPanel(panelConfig);

        config.items = [];
        if (this.tabPanel) config.items.push(this.tabPanel);
        config.items.push(this.taskInfoPanel);

        this.updateTaskInUI();
        this.enableButtonsFromTaskInfo();
        CQ.taskmanagement.TaskEditor.superclass.constructor.call(this, config);

        this.setUpDateTimeFieldErrorClearer();
    },
    updateTaskInUI: function() {
        this.taskInfoPanel.find("name", "taskName")[0].setValue(this.taskInfo.name);
        this.taskInfoPanel.find("name", "taskStatus")[0].setValue(this.taskInfo.status);
        this.taskInfoPanel.find("name", "taskOwner")[0].setValue(this.taskInfo.ownerId);
        this.taskInfoPanel.find("name", "taskPriority")[0].setValue(this.taskInfo.properties.taskPriority);
        this.taskInfoPanel.find("name", "taskDescription")[0].setValue(this.taskInfo.description);
        this.taskInfoPanel.find("name", "contentPath")[0].setValue(this.taskInfo.contentPath);
        this.taskInfoPanel.find("name", "taskDueDate")[0].setValue(this.taskInfo.properties.taskDueDate);
    },
    enableButtonsFromTaskInfo: function() {
        this.taskInfoPanel.getBottomToolbar().items.each(function(button) {
            if (button instanceof CQ.Ext.Button) {
                button.setDisabled(this.isTaskCompleted());
            }
        }, this)
    },
    isTaskCompleted: function() {
        return this.taskInfo && this.taskInfo.status && this.taskInfo.status.toLowerCase()=="complete";
    },

    // the DateTimeField only clears either the time or the date sub-field
    // -> add a change listener to clear both fields
    setUpDateTimeFieldErrorClearer: function() {
        var dateTimeField = this.taskInfoPanel.find("name", "taskDueDate")[0];
        if (dateTimeField) {
            dateTimeField.df.addListener("change", function() {
                dateTimeField.df.clearInvalid();
                dateTimeField.tf.clearInvalid();
            });
            dateTimeField.tf.addListener("change", function() {
                dateTimeField.df.clearInvalid();
                dateTimeField.tf.clearInvalid();
            });
        }
    },

    initComponent: function(){
        CQ.taskmanagement.TaskEditor.superclass.initComponent.call(this);

        //todo: find out why some panels need an extra doLayout
        var ae = this;
        window.setTimeout(function() {
            ae.taskInfoPanel.doLayout(); // required for empty tag fields

            if (ae.tabPanel) ae.tabPanel.doLayout();
            try {
                //todo: does not work reliably in IE
                ae.loadMask = new CQ.Ext.LoadMask(ae.formPanel.body);
                ae.loadMask.show();
            }
            catch(e) {}
        }, 1);
    }
    
    
});

CQ.Ext.reg("taskeditor", CQ.taskmanagement.TaskEditor);

/**
 * The value for {@link #bbar} to create the Save button.
 * @static
 * @final
 * @type String
 */
CQ.taskmanagement.TaskEditor.SAVE = "SAVE";

/**
 * The value for {@link #bbar} to create the Complete button.
 * @static
 * @final
 * @type String
 */
CQ.taskmanagement.TaskEditor.COMPLETE = "COMPLETE";

/**
 * The value for {@link #bbar} to create the Reset button.
 * @static
 * @final
 * @type String
 */
CQ.taskmanagement.TaskEditor.RESET = "RESET";

/**
 * The value for {@link #bbarWest} to create the refresh button.
 * @static
 * @final
 * @type String
 */
CQ.taskmanagement.TaskEditor.REFRESH_INFO = "REFRESH_INFO";

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
CQ.taskmanagement.TaskDetailsDialog = CQ.Ext.extend(CQ.Dialog, {

    /*
        TODO - removed code overlap with TaskEditor
     */

    /**
     * contains the parent task Id under which we're creating this task
     */
    parentTaskId: null,

    authSelection: null,

    okHandler: function() {},

    constructor: function(config, taskInfo) {
        if (!config) {
            config = {};
        }
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }

        this.taskInfo = taskInfo;

        var panelConfig = {
            xtype: "panel",
            border: false,
            "buttonAlign": "right",
            "autoScroll": true,
            "margins": this.tabPanel ? "5 0 5 0" : "5 5 5 0",
            "labelWidth": CQ.taskmanagement.themes.TaskEditor.LABEL_WIDTH,
            "defaults": {
                "anchor": CQ.Ext.isIE6 ? "92%" : CQ.Ext.isIE7 ? "96%" : "95%",
                "stateful": false
            },
            layout: {
                type: "form"
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'taskName',
                    fieldLabel: CQ.I18n.getMessage("Name"),
                    fieldDescription : CQ.I18n.getMessage("The name of this task"),
                    readOnly: true
                },
                {
                    xtype: 'textfield',
                    name: 'taskStatus',
                    fieldLabel: CQ.I18n.getMessage("Status"),
                    fieldDescription : CQ.I18n.getMessage("The status of this task"),
                    readOnly: true
                },
                {
                    xtype: 'authselection',
                    name: 'taskOwner',
                    displayField:"principal",
                    fieldDescription: CQ.I18n.getMessage("The owner of this task"),
                    fieldLabel: CQ.I18n.getMessage("Assign To"),
                    allowBlank:false
                },
                {
                    xtype: 'pathfield',
                    name: 'contentPath',
                    fieldLabel: CQ.I18n.getMessage("Content Path"),
                    fieldDescription : CQ.I18n.getMessage("The content to monitor for this task"),
                    rootTitle : CQ.I18n.getMessage("Content")
                },
                {
                    xtype: 'textarea',
                    name: 'taskDescription',
                    fieldLabel: CQ.I18n.getMessage("Description"),
                    fieldDescription : CQ.I18n.getMessage("Provide a description of the task")
                },
                {
                    "xtype":"combo",
                    "name":"taskPriority",
                    "fieldLabel":CQ.I18n.getMessage("Task Priority"),
                    "fieldDescription":CQ.I18n.getMessage("Select a priority for this task"),
                    "displayField":"name",
                    "valueField":"priority",
                    "selectOnFocus":true,
                    "triggerAction":"all",
                    "editable":false,
                    "mode": 'local',
                    "store":
                        new CQ.Ext.data.SimpleStore({
                                fields: ['priority','name'],
                                data: [
                                    ["High","High"],
                                    ["Medium","Medium"],
                                    ["Low","Low"]
                                ]
                            }
                        )
                },
                {
                    xtype: 'datetime',
                    name: 'taskDueDate',
                    fieldLabel: CQ.I18n.getMessage("Due Date"),
                    fieldDescription: CQ.I18n.getMessage("The due date of this task"),
                    validate: function() {
                        var currentValue = this.getValue();
                        if (currentValue===undefined || currentValue==="") {
                            // empty due date is allowed
                            return true;
                        }
                        // we have a date -> make sure it's later than right now...
                        var currentDate = new Date();
                        // add one minute
                        currentDate.setMinutes(currentDate.getMinutes()+2);
                        var result = currentDate<currentValue;
                        if (!result) {
                            var dtfInvalidMsg = CQ.I18n.getMessage("Due date set in the past");
                            this.tf.markInvalid(dtfInvalidMsg);
                            this.df.markInvalid(dtfInvalidMsg);
                            this.markInvalid("..");
                            return false;
                        } else {
                            this.tf.clearInvalid();
                            this.df.clearInvalid();
                            return true;
                        }

                    }
                }
            ]
        };

//        if (this.readOnly) {
//            this.applyReadOnly(panelConfig.items);
//        }

        this.taskInfoPanel = new CQ.Ext.Panel(panelConfig); // new CQ.Ext.FormPanel(panelConfig);

        configDefaults = {
            closable: true,
            width: 615,
            height: 540,
            border: false,
            modal: true,
            title: CQ.I18n.getMessage("Task Details"),
            okText: CQ.I18n.getMessage("Save Task"),
            items: {
                xtype: "panel",
                items: [
                    this.taskInfoPanel
                    ]
            },

            buttons: [
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ]
        };

        CQ.Util.applyDefaults(config, configDefaults);

        CQ.taskmanagement.TaskDetailsDialog.superclass.constructor.call(this, config);

        this.updateTaskInUI();
        this.setUpDateTimeFieldErrorClearer();
    },

    updateTaskInUI: function() {
        this.find("name", "taskName")[0].setValue(this.taskInfo.name);
        this.find("name", "taskStatus")[0].setValue(this.taskInfo.status);
        this.find("name", "taskOwner")[0].setValue(this.taskInfo.ownerId);
        this.find("name", "taskPriority")[0].setValue(this.taskInfo.properties.taskPriority);
        this.find("name", "taskDescription")[0].setValue(this.taskInfo.description);
        this.find("name", "contentPath")[0].setValue(this.taskInfo.contentPath);
        this.find("name", "taskDueDate")[0].setValue(this.taskInfo.properties.taskDueDate);
    },

    // the DateTimeField only clears either the time or the date sub-field
    // -> add a change listener to clear both fields
    setUpDateTimeFieldErrorClearer: function() {
        var dateTimeField = this.getField("task:dueDate");
        if (dateTimeField) {
            dateTimeField.df.addListener("change", function() {
                dateTimeField.df.clearInvalid();
                dateTimeField.tf.clearInvalid();
            });
            dateTimeField.tf.addListener("change", function() {
                dateTimeField.df.clearInvalid();
                dateTimeField.tf.clearInvalid();
            });
        }
    },

    /**
     * Returns the config for the default OK button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
     getOkConfig: function() {
        var taskDetailsDialog = this;
        return {
            text: this.okText,
            cls: "cq-btn-ok",
            handler: function(button) {
//                if (!taskDetailsDialog.taskInfoPanel.form.isValid()) {
//                    CQ.Ext.Msg.show({
//                        title:CQ.I18n.getMessage('Validation Failed'),
//                        msg: CQ.I18n.getMessage('Verify the values of the marked fields.'),
//                        buttons: CQ.Ext.Msg.OK,
//                        icon: CQ.Ext.Msg.ERROR
//                    });
//                    return;
//                }
//                if (console) {
//                    console.log("form is valid: '"+taskDetailsDialog.form.isValid()+"'");
//                }
                var taskInfo = taskDetailsDialog.getTaskDataFromInfoPanel();
                taskDetailsDialog.hide();
                taskDetailsDialog.okHandler(taskInfo);
            }
        };
    },
    dialogInfoValid: function() {
        for(var index=0; index<this.items.length; index++) {
            var item = this.items[index];
            if (!item.validate()) {
                return false;
            }
        }
        return true;
    },
    getTaskDataFromInfoPanel: function() {
        var taskCreateInfo = {
            properties: {
                taskPriority: this.taskInfoPanel.find("name", "taskPriority")[0].getValue(),
                taskDueDate: this.taskInfoPanel.find("name", "taskDueDate")[0].getValue()
            },
            contentPath: this.taskInfoPanel.find("name", "contentPath")[0].getValue(),
            name: this.taskInfoPanel.find("name", "taskName")[0].getValue(),
            description: this.taskInfoPanel.find("name", "taskDescription")[0].getValue(),
            ownerId: this.taskInfoPanel.find("name", "taskOwner")[0].getValue()
        };
        if (this.parentTaskId!=null) {
            taskCreateInfo.parentTaskId = this.parentTaskId;
        }

        return taskCreateInfo;
    }
});

CQ.Ext.reg('taskdetailsdialog', CQ.taskmanagement.TaskDetailsDialog);
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
CQ.taskmanagement.CompleteTaskDialog = CQ.Ext.extend(CQ.Dialog, {

    actionRequired: false,

    okHandler: function() {},

    constructor: function(config, actionNames) {
        if (!config) {
            config = {};
        }
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }

        if (!config.okText) {
            config.okText = CQ.I18n.getMessage("Complete Task");
        }
        if (!config.dialogTitle) {
            config.dialogTitle = CQ.I18n.getMessage("Complete Task");
        }
        if (!config.hasOwnProperty("showActions")) {
            config.showActions = true;
        }

        if (config.showActions) {
            var isComboDisabled = false;
            var comboFieldDescription = CQ.I18n.getMessage("Select an action for this task.");
            var comboActionArray = [];

            if (actionNames && actionNames.length>0) {
                this.actionRequired = true;

                // create combobox array
                // (which is an array of arrays ...
                for(var actionIndex=0; actionIndex<actionNames.length; actionIndex++) {
                    var item = [ actionNames[actionIndex] ];
                    comboActionArray.push(item);
                }
            } else {
                this.actionRequired = false;
                isComboDisabled = true;
                comboFieldDescription = CQ.I18n.getMessage("This task has no actions to select.");
            }

            var actionCombo = {
                "xtype":"combo",
                "name":"taskActionCombo",
                "fieldLabel":CQ.I18n.getMessage("Action"),
                "fieldDescription": comboFieldDescription,
                "displayField":"actionId",
                "valueField":"actionId",
                "selectOnFocus":true,
                "triggerAction":"all",
                "editable":false,
                "mode": 'local',
                "allowBlank": isComboDisabled,
                "anchor":"100%",
                "disabled":isComboDisabled,
                "store":
                    new CQ.Ext.data.SimpleStore({
                            fields: ['actionId'],
                            data: comboActionArray
                        }
                    )
            };
        }

        var dialogItems = [];
        if (actionCombo) {
            dialogItems.push(actionCombo);
        }
        dialogItems.push({
                xtype:"textarea",
                name:"taskcomment",
                height:100,
                anchor:CQ.themes.Dialog.ANCHOR,
                fieldLabel:CQ.I18n.getMessage("Comment"),
                fieldDescription:CQ.I18n.getMessage("Optional comment to describe what has been done.")
        });

        var panelConfig = {
            xtype: "panel",
            border: false,
            "buttonAlign": "right",
            "autoScroll": false,
            "labelWidth": 70,
            layout: {
                type: "form"
            },
            items: dialogItems
        };

        this.taskActionPanel = new CQ.Ext.Panel(panelConfig); // new CQ.Ext.FormPanel(panelConfig);

        configDefaults = {
            closable: true,
            width: 400,
            height: 300,
            border: false,
            modal: true,
            title: config.dialogTitle,
            okText: config.okText,
            items: {
                xtype: "panel",
                items: [
                    this.taskActionPanel
                ]
            },

            buttons: [
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ]
        };

        CQ.Util.applyDefaults(config, configDefaults);

        CQ.taskmanagement.CompleteTaskDialog.superclass.constructor.call(this, config);
    },

    /**
     * Returns the config for the default OK button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
    getOkConfig: function() {
        var completeTaskDialog = this;
        return {
            text: this.okText,
            cls: "cq-btn-ok",
            handler: function(button) {
                var selectedAction = null;

                var comboControl = this.taskActionPanel.find("name", "taskActionCombo")[0];
                if (comboControl) {
                    selectedAction = comboControl.getValue();
                    if (!selectedAction && completeTaskDialog.actionRequired) {
                        return;
                    }
                }
                var comment = null;
                var commentControl = this.taskActionPanel.find("name", "taskcomment")[0];
                if (commentControl) {
                    comment = commentControl.getValue();
                }
                completeTaskDialog.hide();
                completeTaskDialog.okHandler(selectedAction, comment);
            }
        };
    }
});

CQ.Ext.reg('taskcompletedialog', CQ.taskmanagement.CompleteTaskDialog);
