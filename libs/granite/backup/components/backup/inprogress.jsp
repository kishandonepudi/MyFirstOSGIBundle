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
	              	javax.management.JMException,
	              	javax.management.MBeanServerConnection,
	              	javax.management.ObjectName,
	              	javax.management.OperationsException,
	              	org.apache.sling.api.SlingHttpServletRequest,
	              	org.apache.commons.lang3.StringEscapeUtils,
	              	com.day.cq.widget.HtmlLibraryManager" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects /><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

%><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRX Backup | In Progress</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.backup");
    }
%>
</head>
<body>
<div id="g-backup-inprogress" data-role="page" data-url="<%=request.getRequestURI()%>">

    <div data-role="header">
    	<h1>Backup in Progress</h1>
    </div>

    <div data-role="content">
    	<% String path = getCurrentPath(server, name); %>
    	<p>There is a backup in progress at <a href="<%=request.getContextPath()%>/libs/granite/backup/content/admin/backup.html?path=<%=encode(path)%>"><%=StringEscapeUtils.escapeHtml4(path)%></a></p>
    </div>

    <div data-role="footer"></div>
    
</div>
<%!
private static String encode(String path) {
    try {
        return URLEncoder.encode(path, "UTF-8");
    } catch (UnsupportedEncodingException e) {
        throw new RuntimeException(e);
    }
}

private static String getCurrentPath(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (String) server.getAttribute(name, "CurrentBackupTarget");
    } catch (JMException e) {
        throw new Exception("Error occur getting current backup target", e);
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