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
			        javax.management.JMException,
			        javax.management.MBeanServerConnection,
			        javax.management.ObjectName,
			        javax.management.OperationsException,
			        javax.management.openmbean.CompositeData,
			        javax.management.openmbean.CompositeType,
			        javax.management.openmbean.TabularData,
			        org.apache.sling.commons.json.io.JSONWriter" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%
    
response.setContentType("application/json; charset=utf-8");
JSONWriter writer = new JSONWriter(out);

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

TabularData data = (TabularData) server.getAttribute(name, "ClusterNodes");

writer.object();
writer.key("masterId").value(getAttribute(server, name, "ClusterMasterId"));
writer.key("nodeId").value(getAttribute(server, name, "ClusterNodeId"));

writer.key("nodes").array();
for (Object o : data.values()) {
    CompositeData row = (CompositeData) o;
    CompositeType type = row.getCompositeType();
    
    writer.object();
    for (Object k : type.keySet()) {
        String key = k.toString();
        writer.key(key).value(row.get(key));
    }
    writer.endObject();
}
writer.endArray();

writer.endObject();
%><%!
private static String getAttribute(MBeanServerConnection server, ObjectName name, String attribute)
		throws Exception {
    return (String) server.getAttribute(name, attribute);
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