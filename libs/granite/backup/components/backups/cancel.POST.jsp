<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
          import="java.io.IOException,
                  java.io.UnsupportedEncodingException,
                  java.lang.management.ManagementFactory,
                  java.util.Set,
                  java.net.URLEncoder,
                  javax.management.Attribute,
                  javax.management.JMException,
                  javax.management.MBeanServerConnection,
                  javax.management.ObjectName,
                  javax.management.OperationsException,
                  org.apache.sling.api.request.RequestPathInfo" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

cancelBackup(server, name);
%><%!
private static void cancelBackup(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        server.invoke(name, "cancelBackup", new Object[] {},
            new String[] {});
    } catch (JMException e) {
        throw new Exception("Error occur cancelling backup", e);
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