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
					javax.management.OperationsException"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects /><%

promote();

%><%!
private static void promote() throws Exception {
    MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
    ObjectName name = getRepositoryMBean(server);

    server.invoke(name, "becomeClusterMaster", new Object[0], new String[0]);
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