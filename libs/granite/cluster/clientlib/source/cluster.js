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

_g.cluster = (function() {
    var contextPath = _g.HTTP.getContextPath() || "";

    function refreshList() {
        var url = contextPath + "/libs/granite/cluster/content/admin/cluster.list.json";
        
        _g.$.getJSON(url, function(data) {
        	var masterIndex;
        	_g.$.each(data.nodes, function(i, item) {
        		if (item.id == data.masterId) {
        			masterIndex = i;
        			return false;
        		}
        	});
        	
        	if (masterIndex) {
        		var master = data.nodes.splice(masterIndex, 1);
        		data.nodes.unshift(master[0]);
        	}
        	
            var listEl = _g.$("#node-list");

            listEl.processTemplate(data);
            listEl.listview("refresh");
            listEl.show();
        });
    };
    
    function promote() {
    	var url = contextPath + "/libs/granite/cluster/content/admin/node.promote.html";
        
        _g.$.post(url, function(data) {
        	location.hash = "";
            refreshList();
        });
	}

    return {
        refreshList: refreshList,
        promote: promote
    };
})();
