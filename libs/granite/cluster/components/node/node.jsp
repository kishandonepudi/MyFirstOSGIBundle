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
					javax.management.openmbean.CompositeType,
					javax.management.openmbean.TabularData,
					org.apache.sling.api.request.RequestPathInfo,
            		com.day.cq.widget.HtmlLibraryManager"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects /><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);
	
String nodeId = request.getParameter("id");

String currentNodeId;
if (nodeId == null) {
    nodeId = getAttribute(server, name, "ClusterNodeId");
    currentNodeId = nodeId;
} else {
    currentNodeId = getAttribute(server, name, "ClusterNodeId");
}

CompositeData node = getNode(server, name, nodeId);

if (node == null) {
   	response.sendError(404);
	return;
}

nodeId = node.get("id").toString();
String masterId = getAttribute(server, name, "ClusterMasterId");
boolean promotable = !masterId.equals(currentNodeId) && currentNodeId.equals(nodeId);

%><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRX Clustering | <%=nodeId%></title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.cluster");
    }
%>
</head>
<body>
    <div data-role="page" id="g-cluster-node" data-url="<%=request.getRequestURI()%>?id=<%=nodeId%>">
        
        <div data-role="header" data-backbtn="false">
            <h1><%=nodeId%></h1>
        </div>
        
        <div data-role="content">
            <h2>Operating System</h2>
            <p><%=node.get("OS")%></p>
            <h2>Host Name</h2>
            <p><%=node.get("hostname")%></p>
            <h2>Repository Home</h2>
            <p><%=node.get("repositoryHome")%></p>
        </div>
        
        <div data-role="footer">
            <div class="g-buttonbar">
                <% if (promotable) { %>
                    <a id="g-cluster-node-promote" data-role="button" onclick="_g.cluster.promote()">Make Master</a>
                <% } %>
            </div>
		</div>
		
		<% if (promotable) { %>
			<div data-role="confirm" data-for="g-cluster-node-promote">
                <h2>Confirm</h2>
                <p>Are you sure you want to make this node master?</p>
                <a data-role="button" data-rel="cancel" data-inline="true">Cancel</a>
		        <a data-role="button" data-rel="confirm" data-inline="true">Make Master</a>
		    </div>
	    <% } %>
		
		<% if ("true".equals(request.getParameter("refresh"))) { %>
			<script type="text/javascript">
				window.setTimeout(function() {
					_g.cluster.refreshList();
				}, 200);
			</script>
		<% } %>
    </div>
</body>
</html>
<%!
private static String getAttribute(MBeanServerConnection server, ObjectName name, String attribute)
		throws Exception {
    return (String) server.getAttribute(name, attribute);
}

private static CompositeData getNode(MBeanServerConnection server, ObjectName name, String nodeId) throws Exception {
    TabularData data = (TabularData) server.getAttribute(name, "ClusterNodes");
    return data.get(new String[] { nodeId });
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