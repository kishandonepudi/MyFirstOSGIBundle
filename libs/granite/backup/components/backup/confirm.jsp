<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
			import="java.io.UnsupportedEncodingException,
	              	java.net.URLEncoder,
	              	org.apache.commons.lang3.StringEscapeUtils,
	              	com.day.cq.widget.HtmlLibraryManager" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects /><%

String key = request.getParameter("key");

%><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Backup | Confirm</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.backup");
    }
%>
</head>
<body>
<div id="g-backup-confirm" data-role="dialog">

    <div data-role="header">
    	<h1>Confirm</h1>
    </div>

    <div data-role="content">
    	<% if ("notempty".equals(key)) { %>
    	    <h1>WARNING: Target directory is not empty</h1>
    	    <p>Target directory will be synced with the backup source, which may cause <strong>DATA LOSS</strong>. This is OK for the purpose of incremental backup.</p>
    	    <p>Are you sure to start the backup?</p>
    	    <a class="yes" href="#" data-role="button" data-theme="a">Start Backup</a>
            <a href="#" data-role="button" data-rel="back">Cancel</a>
        <% } %>
    </div>

</div>
