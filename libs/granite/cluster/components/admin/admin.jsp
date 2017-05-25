<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Cluster Admin

  ==============================================================================

--%><%@page session="false"
            import="java.lang.management.ManagementFactory,
					java.io.IOException,
					java.util.Set,
					javax.management.MBeanServerConnection,
					javax.management.ObjectName,
					javax.management.OperationsException,
					javax.management.openmbean.CompositeData,
					javax.management.openmbean.TabularData,
					com.day.cq.widget.HtmlLibraryManager"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects /><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

%><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRX Clustering | Welcome</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.cluster");
    }
%>
</head>
<body>
    <div data-role="globalheader" data-title="Cluster" data-theme="a"></div>
    
    <div data-role="panel" data-id="menu">
        <div id="g-cluster-welcome-menu" data-role="page">

            <div data-role="header">
                <h1 class="g-uppercase">Cluster Nodes</h1>
            </div>

            <div data-role="content" data-scroll="y" data-theme="c">
                <ul id="node-list" data-role="listview" style="display:none;"></ul>
            </div>

            <textarea id="node-list-tpl" style="display:none;">
                {#foreach $T.nodes as node}
                    <li data-icon="false">
                        <a href="<%=request.getContextPath()%>/libs/granite/cluster/content/admin/node.html?id={$T.node.id}" data-panel="main">
                            <h3>{$T.node.id}</h3>
                            <p>{$T.node.id == $T.masterId ? "Master" : "Slave"}{$T.node.id == $T.nodeId ? " <em>(me)</em>" : ""}</p>
                        </a>
                    </li>
                {#/for}
            </textarea>

            <div data-role="footer">
                <div class="g-buttonbar">
                	<a id="g-cluster-welcome-join" href="<%=request.getContextPath()%>/libs/granite/cluster/content/admin/node.new.html" data-role="button" data-panel="main">Join Cluster</a>
                </div>
            </div>
        </div>
    </div>
    
    <div data-role="panel" data-id="main">
        <div data-role="page" id="g-cluster-welcome-main">
            
            <div data-role="header"></div>
            
            <div data-role="content">
                <span class="g-big">Welcome to Adobe CRX Clustering</span>
                
					<%
						String nodeId = getAttribute(server, name, "ClusterNodeId");
					
						TabularData tabular = getProperties(server, name);
                        CompositeData membersData = tabular.get(new String[] {"members"});
                        
                        String[] members;
                        if (membersData == null) {
                            members = new String[0];
                        } else {
                            String memberCsv = (String) membersData.get("value");
                            members = memberCsv.split(",");
                        }
                        
                        if (members.length > 1) {
                            CompositeData clusterIdData = tabular.get(new String[] {"cluster_id"});
                            String clusterId = clusterIdData.get("value").toString();
                            %>
                            <p>The current node is <a href="<%=request.getContextPath()%>/libs/granite/cluster/content/admin/node.html?id=<%=nodeId%>"><%=nodeId%></a> and it is part of cluster <%=clusterId%>. The current nodes of the cluster are listed on the list on the left.</p>
                            <%
                        } else {%>
                            <p>The current node is <a href="<%=request.getContextPath()%>/libs/granite/cluster/content/admin/node.html?id=<%=nodeId%>"><%=nodeId%></a> and it is not part of any cluster.</p>
                            <p>To join a cluster, please use the following form:</p>
                            <form action="<%=request.getContextPath()%>/libs/granite/cluster/content/admin/cluster/" method="post">
					        	<div data-role="fieldcontain">
					        		<label for="g-cluster-new-url">Master URL</label>
					        		<input id="g-cluster-new-url" name="url" type="url" required="required" />
					        		<p class="ui-input-desc">URL of the web app of a running cluster node, e.g. http://myserver:1234/mycontextpath.</p>
					        	</div>
					        	<div data-role="fieldcontain">
					        		<label for="g-cluster-new-username">Username</label>
					        		<input id="g-cluster-new-username" name="username" type="text" />
					        	</div>
					        	<div data-role="fieldcontain">
					        		<label for="g-cluster-new-password">Password</label>
					        		<input id="g-cluster-new-password" name="password" type="password" />
					        	</div>
					        	<input type="submit" value="Join" data-theme="a" />
					        </form>
                        <%}
					%>
            </div>
            
            <div data-role="footer"></div>
        </div>
    </div>
    
    <script type="text/javascript">
    	(function() {
    		_g.$("#node-list").setTemplateElement("node-list-tpl");
	
	        _g.$("#g-cluster-welcome-menu").live("pageshow", function() {
	            _g.cluster.refreshList();
	        });
    	})();
    </script>
</body>
</html>
<%!
private static String getAttribute(MBeanServerConnection server, ObjectName name, String attribute)
		throws Exception {
    return (String) server.getAttribute(name, attribute);
}

private static TabularData getProperties(MBeanServerConnection server, ObjectName name) throws Exception {
    return (TabularData) server.getAttribute(name, "ClusterProperties");
}

private static ObjectName getRepositoryMBean(MBeanServerConnection server)
        throws OperationsException, IOException {
    Set<ObjectName> names = server.queryNames(new ObjectName(
        "com.adobe.granite:type=Repository,*"), null);

    if (names.isEmpty()) {
        return null;
    }

    return names.iterator().next();
}
%>