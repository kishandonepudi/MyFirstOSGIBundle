<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
          import="java.io.IOException,
                  java.util.Set,
                  java.lang.management.ManagementFactory,
                  javax.management.JMException,
                  javax.management.MBeanServerConnection,
                  javax.management.ObjectName,
                  javax.management.OperationsException,
                  org.apache.sling.commons.json.io.JSONWriter" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%
	
MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

response.setContentType("application/json; charset=utf-8");
JSONWriter writer = new JSONWriter(out);

writer.object();

writer.key("inProgress").value(isInProgress(server, name));
writer.key("progress").value(getProgress(server, name));

writer.endObject();
%><%!
private static boolean isInProgress(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (Boolean) server.getAttribute(name, "BackupInProgress");
    } catch (JMException e) {
        throw new Exception("Error occur getting if backup is in progress", e);
    }
}

private static int getProgress(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (Integer) server.getAttribute(name, "BackupProgress");
    } catch (JMException e) {
        throw new Exception("Error occur getting backup progress", e);
    }
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