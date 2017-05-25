/*
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */


/**
 * The <code>$g</code> library contains all granite component classes and
 * utilities.
 * @static
 * @class _g
 */
window._g = window._g || {};

// -----------------------------------------------------------------------------

_g.backup = (function() {
	var contextPath = _g.HTTP.getContextPath();
	
    var params = {
        filesize: function(v) {
            if (v / 1000000000 > 1)
                return (v / 1000000000).toFixed(2) + " GB";

            if (v / 1000000 > 1)
                return (v / 1000000).toFixed(1) + " MB";

            return (v / 1000).toFixed(0) + " KB";
        },
        date: function(v) {
            return (new Date(v)).toLocaleString();
        }
    };

    var progressListeners = [];
    function registerProgress(callback) {
    	progressListeners.push(callback);
    	
    	if (!checkProgressRunning)
    		checkProgress();
    };
    
    function unregisterProgress(callback) {
    	for (var i = 0, ln = progressListeners.length; i < ln; i++) {
			var cb = progressListeners[i];
			if (cb === callback) {
				progressListeners.splice(i, 1);
				break;
			}
		}
    };
    
    var checkProgressRunning = false;
    function checkProgress() {
    	if (progressListeners.length > 0) {
    		checkProgressRunning = true;
    		_g.$.getJSON(contextPath + "/libs/granite/backup/content/admin/backups.progress.json", function(data) {
    			for (var i in progressListeners) {
    				var list = progressListeners[i];
    				list(data);
    			}
    			if (data.inProgress)
    				setTimeout(checkProgress, 2000);
    			else {
    				progressListeners = [];
    				checkProgressRunning = false;
    			}
    		});
    	}
    };
    
    var callback;
    function refreshList() {
    	var url = contextPath + "/libs/granite/backup/content/admin/backups.list.json";
    	if (targetDir)
    		url += "?dir=" + targetDir;
    	
        _g.$.getJSON(url, function(data) {
            var listEl = _g.$("#backup-list");

            listEl.processTemplate(data, params);
            listEl.listview("refresh");
            
            if (callback) {
            	unregisterProgress(callback);
            	callback = undefined;
            }
            
            var el = listEl.find(".progress").progressbar();
            if (el.length > 0) {
            	callback = function(data) {
            		if (data.inProgress) {
            			el.progressbar("value", data.progress / 10);
                    } else {
                    	refreshList();
                    }
            	};
            	registerProgress(callback);
            }
            
            listEl.show();
        });
    };
    
    function cancelBackup() {
        _g.$.ajax({
            url: contextPath + "/libs/granite/backup/content/admin/backups.cancel.html",
            type: "POST",
            success: function(data, textStatus, jqXHR) {
            	checkProgressRunning = false;
            	location.hash = "";
                refreshList();
            }
        });
    };

    function deleteBackup(path) {
        _g.$.ajax({
            url: contextPath + "/libs/granite/backup/content/admin/backup.delete.html",
            type: "POST",
            data: {
                path: path,
                "_charset_": "utf-8"
            },
            success: function(data, textStatus, jqXHR) {
                location.hash = "";
                refreshList();
            }
        });
    };
    
    var targetDir;
    function setTargetDir(dir) {
    	targetDir = dir;
    };

    return {
    	setTargetDir: setTargetDir,
        refreshList: refreshList,
        registerProgress: registerProgress,
        unregisterProgress: unregisterProgress,
        cancelBackup: cancelBackup,
        deleteBackup: deleteBackup
    };
})();
