<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Cluster Admin

  ==============================================================================

--%><%@page session="false"
			import="java.io.IOException,
			        java.io.UnsupportedEncodingException,
			        java.lang.management.ManagementFactory,
			        java.util.Set,
			        java.net.URLEncoder,
			        java.net.UnknownHostException,
			        javax.management.Attribute,
			        javax.management.JMException,
			        javax.management.MBeanException,
			        javax.management.MBeanServerConnection,
			        javax.management.ObjectName,
			        javax.management.OperationsException" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

String url = request.getParameter("url");
String username = request.getParameter("username");
String password = request.getParameter("password");

try {
	join(server, name, url, username, password);
} catch(MBeanException e) {
	String msg;
	if (e.getCause() == null) {
	    msg = e.getMessage();
	} else if (e.getCause() instanceof UnknownHostException) {
	    msg = "Unknown host name: " + e.getCause().getMessage();
	} else {
	    msg = e.getCause().toString();
	}
      
	response.sendRedirect(request.getContextPath() + "/libs/granite/cluster/content/admin/node.new.html?error=" + encode(msg));
	return;
} catch (Exception e) {
	response.sendRedirect(request.getContextPath() + "/libs/granite/cluster/content/admin/node.new.html?error=" + encode(e.toString()));
	return;
}
  
response.sendRedirect(request.getContextPath() + "/libs/granite/cluster/content/admin/node.html?refresh=true");
%><%!
private static String encode(String url) {
    try {
        return URLEncoder.encode(url, "UTF-8");
    } catch (UnsupportedEncodingException e) {
        throw new RuntimeException(e);
    }
}

private static void join(MBeanServerConnection server, ObjectName name, String url, String username, String password) throws Exception {
	server.invoke(name, "joinCluster", new Object[] { url, username, password },
	    new String[] { String.class.getName(), String.class.getName(), String.class.getName() });
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