<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page import="org.apache.sling.api.resource.Resource"%>
<%@page session="false"
            import="java.lang.management.ManagementFactory,
            		java.util.Set,
            		java.io.File,
            		java.io.IOException,
                    javax.management.JMException,
                  	javax.management.MBeanServerConnection,
                  	javax.management.ObjectName,
                  	javax.management.OperationsException,
                    org.apache.commons.lang3.StringEscapeUtils,
            		com.day.cq.widget.HtmlLibraryManager"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects /><%
%><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRX Backup | Welcome</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.backup");
    }
%>
</head>
<body>
    <div data-role="globalheader" data-title="Backup" data-theme="a"></div>
    
    <div data-role="panel" data-id="menu">
        <div id="g-backup-welcome-menu" data-role="page">

            <div data-role="header">
                <h1 class="g-uppercase">Current Backups</h1>
            </div>

            <div data-role="content" data-scroll="y" data-theme="c">
                <ul id="backup-list" data-role="listview" style="display:none;"></ul>
            </div>

            <textarea id="backup-list-tpl" style="display:none;">
                {#foreach $T as record}
                    <li data-icon="false">
                        <a href="<%=request.getContextPath()%>/libs/granite/backup/content/admin/backup.html?path={encodeURIComponent($T.record.path)}&_charset_=utf-8" data-panel="main">
                            <h3>{$T.record.name}</h3>
                            <p>
                            	{$T.record.lastModified ? $P.date($T.record.lastModified) + "<br/>" : ""}
                            	{$T.record.length ? $P.filesize($T.record.length) + "<br/>" : ""}
                                {$T.record.path}
                            </p>
                            {$T.record.inprogress ? "<div class='progress'></div>" : ""}
                        </a>
                    </li>
                {#/for}
            </textarea>

            <div data-role="footer">
                <div class="g-buttonbar">
                	<a id="g-backup-welcome-new-backup" href="<%=request.getContextPath()%>/libs/granite/backup/content/admin/backup.new.html" data-role="button" data-panel="main">New Backup</a>
                </div>
            </div>
        </div>
    </div>
    
    <div data-role="panel" data-id="main">
        <div data-role="page" id="g-backup-welcome-main">
            
            <div data-role="header"></div>
            
            <div data-role="content">
                <span class="g-big">Welcome to Adobe CRX Backup</span>
                
                <p>To create a backup, please use the following form:</p>
                
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
		        		<input id="g-backup-new-delay" name="delay" type="number" value="<%= getDelay() %>" />
		        	</div>
		        	<input type="submit" value="Start" data-theme="a" />
		        </form>
            </div>
            
            <div data-role="footer"></div>
        </div>
    </div>
    
    <script type="text/javascript">
    	(function() {
    		_g.$(function() {
	            var listEl = _g.$("#backup-list");
	            listEl.setTemplateElement("backup-list-tpl");
	        });
	
	        _g.$("#g-backup-welcome-menu").live("pageshow", function() {
	            _g.backup.refreshList();
	        });
	        
	        _g.$('#g-backup-confirm .yes').live("click", function() {
	        	var form = _g.$("#g-backup-welcome-main form");
	        	form.find('input[name="force"]').val(true);
	        	form.submit();
	        	form.find('input[name="force"]').val(false);
	        });
    	})();
    </script>
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

private static int getDelay() throws Exception {
    try {
        MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
        ObjectName name = getRepositoryMBean(server);

        return (Integer) server.getAttribute(name, "BackupDelay");
    } catch (JMException e) {
        throw new Exception("Error occurred getting backup delay", e);
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