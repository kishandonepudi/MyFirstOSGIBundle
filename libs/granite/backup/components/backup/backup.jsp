<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
            import="java.lang.management.ManagementFactory,
            		java.util.Date,
                    java.io.File,
                    java.io.IOException,
                    java.io.UnsupportedEncodingException,
                    java.text.DateFormat,
                    java.text.DecimalFormat,
                    java.net.URLEncoder,
                  	java.util.Set,
                  	javax.management.JMException,
                  	javax.management.MBeanServerConnection,
                  	javax.management.ObjectName,
                  	javax.management.OperationsException,
                  	org.apache.commons.lang3.StringEscapeUtils,
                  	com.day.cq.widget.HtmlLibraryManager" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

String path = request.getParameter("path");
if (path == null || path.trim().length() == 0) {
    response.sendError(404);
    return;
}

File file = new File(path);
%><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRX Backup | <%=StringEscapeUtils.escapeHtml4(file.getName())%></title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.backup");
    }
%>
</head>
<body>
<%
if (file.getAbsolutePath().equals(getCurrentPath(server, name))) {
%>
<div id="g-backup-backup" class="inprogress" data-role="page" data-url='<%=getCurrentUrl(request, file)%>'>

    <div data-role="header">
    	<h1><%=StringEscapeUtils.escapeHtml4(file.getName())%></h1>
    </div>

    <div data-role="content">
        <p><%=StringEscapeUtils.escapeHtml4(file.getAbsolutePath())%></p>
        <div class="progress"></div>
    </div>

    <div data-role="footer">
        <div class="g-buttonbar">
            <a data-role="button" onclick="_g.backup.cancelBackup()">Cancel</a>
        </div>
    </div>
    
    <script type="text/javascript">
    	(function() {
    		if (<%="true".equals(request.getParameter("new"))%>) {
    			_g.backup.setTargetDir("<%=StringEscapeUtils.escapeEcmaScript(file.getParent().replace("\\", "\\\\"))%>");
    			_g.backup.refreshList();
    		}
    		
    		var callback = function(data) {
        		if (data.inProgress) {
        			_g.$("#g-backup-backup.inprogress .progress").progressbar("value", data.progress / 10);
                } else {
                	_g.$.mobile.changePage("<%=getCurrentUrl(request, file)%>", {
               			allowSamePageTransition: true,
               			reloadPage: true,
               			pageContainer: _g.$("#g-backup-backup").parent(":jqmData(role='panel')")
                	});
                }
        	};
    		
    		_g.$("#g-backup-backup.inprogress").live("pagehide", function() {
    			_g.backup.unregisterProgress(callback);
    		});
    		
    		_g.$("#g-backup-backup.inprogress .progress").progressbar({
        		value: <%=getProgress(server, name) / 10%>
        	});
        	
        	_g.backup.registerProgress(callback);
    	})();
    </script>

</div>
<%
	return;
}

if (!file.exists()) {
    response.sendError(404);
    return;
}
%><div id="g-backup-backup" data-role="page" data-url='<%=request.getRequestURI() + "?path=" + encode(file.getAbsolutePath())%>'>

    <div data-role="header">
    	<h1><%=StringEscapeUtils.escapeHtml4(file.getName())%></h1>
    </div>

    <div data-role="content">
        <p>
            <%=lastModified(file)%><br/>
            <% if (!file.isDirectory()) {
                out.println(size(file) + "<br/>");
            } %>
            <%=StringEscapeUtils.escapeHtml4(file.getAbsolutePath())%>
        </p>
    </div>

    <div data-role="footer">
        <div class="g-buttonbar">
            <% if (!file.isDirectory()) { %>
                <a href="<%=request.getContextPath() + "/libs/granite/backup/content/admin/backup.download.html?path=" + encode(file.getAbsolutePath()) %>" data-role="button" data-ajax="false">Download</a>
                <a id="g-backup-backup-delete" data-role="button" onclick="_g.backup.deleteBackup('<%=StringEscapeUtils.escapeEcmaScript(file.getAbsolutePath()) %>');">Delete</a>
            <% } %>
        </div>
    </div>
    
    <div data-role="confirm" data-for="g-backup-backup-delete">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete the backup?</p>
        <a data-role="button" data-rel="cancel" data-inline="true">Cancel</a>
        <a data-role="button" data-rel="confirm" data-inline="true">Delete</a>
    </div>

</div>
</body>
</html>
<%!
private static String getCurrentUrl(HttpServletRequest request, File file) {
    return request.getRequestURI() + "?path=" + encode(file.getAbsolutePath());
}

private static String encode(String url) {
    try {
        return URLEncoder.encode(url, "UTF-8");
    } catch (UnsupportedEncodingException e) {
        throw new RuntimeException(e);
    }
}

private static String lastModified(File file) {
    return DateFormat.getDateTimeInstance(DateFormat.FULL, DateFormat.FULL).format(new Date(file.lastModified()));
}

private static String size(File file) {
    long v = file.length();

    if (v / 1000000000 > 1) {
        return (new DecimalFormat("##0.## GB")).format(v / 1000000000.0);
    }
    
    if (v / 1000000 > 1) {
        return (new DecimalFormat("##0.# MB")).format(v / 1000000.0);
    }

    return (new DecimalFormat("##0 KB")).format(v / 1000.0);
}

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