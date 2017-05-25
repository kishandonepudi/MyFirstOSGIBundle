<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
            import="java.io.File,
                    java.io.IOException,
                    java.io.UnsupportedEncodingException,
                    java.lang.management.ManagementFactory,
                    java.text.DateFormat,
                    java.text.DecimalFormat,
                    java.net.URLEncoder,
                    java.util.Date,
                    java.util.Set,
                    javax.management.JMException,
                  	javax.management.MBeanServerConnection,
                  	javax.management.ObjectName,
                  	javax.management.OperationsException,
                    org.apache.commons.lang3.StringEscapeUtils,
                  	com.day.cq.widget.HtmlLibraryManager"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

%><html>
<head>
    <meta charset="utf-8">
    <title>CRX Backup | New</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.backup");
    }
%>
</head>
<body>
<div id="g-backup-new" data-role="page">

    <div data-role="header">
    	<h1>New Backup</h1>
    </div>

    <div data-role="content">
        <form action="<%=request.getContextPath()%>/libs/granite/backup/content/admin/backups/" method="post">
        	<input name="_charset_" type="hidden" value="utf-8" />
        	<input name="force" type="hidden" value="false" />
            <div data-role="fieldcontain">
                <label for="g-backup-new-installdir">Source Directory</label>
                <%
                   File sourceDirDefault = new File(getHomeDir()).getAbsoluteFile().getParentFile().getParentFile().getCanonicalFile();
                %>
                <input id="g-backup-new-installdir" name="installDir" type="text" value="<%= StringEscapeUtils.escapeHtml4(sourceDirDefault.getAbsolutePath()) %>"/>
                <p class="ui-input-desc">CRX installation directory path.</p>
            </div>
        	<div data-role="fieldcontain">
        		<label for="g-backup-new-target">Target Path</label>
        		<input id="g-backup-new-target" name="target" type="text" />
        		<p class="ui-input-desc">Depending on whether this path ends with ".zip", the backup target is set to the specified zip file or directory.
        		If the path is not absolute, it is interpreted relative to the parent of the crx-quickstart directory.
        		If the path is blank, a default "backup-YYYYMMDD-hhmm.zip" file is used.</p>
        	</div>
        	<div data-role="fieldcontain">
        		<label for="g-backup-new-delay">Delay</label>
        		<input id="g-backup-new-delay" name="delay" type="number" value="<%= getDelay(server, name) %>" />
        	</div>
        	<input type="submit" value="Start" data-theme="a" />
        </form>
    </div>

    <div data-role="footer"></div>
    
    <script type="text/javascript">
        (function() {
            _g.$('#g-backup-confirm .yes').live("click", function() {
                var form = _g.$("#g-backup-new form");
                form.find('input[name="force"]').val(true);
                form.submit();
                form.find('input[name="force"]').val(false);
            });
        })();
    </script>

</div>
</body>
</html>
<%!
private static String getHomeDir() throws Exception {
    try {
        MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
        ObjectName name = getRepositoryMBean(server);

        return (String) server.getAttribute(name, "HomeDir");
    } catch (JMException e) {
        throw new Exception("Error occurred getting home directory", e);
    }
}

private static int getDelay(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (Integer) server.getAttribute(name, "BackupDelay");
    } catch (JMException e) {
        throw new Exception("Error occur getting backup delay", e);
    }
}

private static String getHomeDir(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (String) server.getAttribute(name, "HomeDir");
    } catch (JMException e) {
        throw new Exception("Error occur getting repository home dir", e);
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