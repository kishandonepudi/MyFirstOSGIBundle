<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Cluster Admin

  ==============================================================================

--%><%@page session="false"
            import="org.apache.commons.lang3.StringEscapeUtils,
            		com.day.cq.widget.HtmlLibraryManager"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects /><%
%><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRX Clustering | Join</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.cluster");
    }
%>
</head>
<body>
    <div data-role="page" id="g-cluster-join" data-url="<%=request.getRequestURI()%>">
        
        <div data-role="header" data-backbtn="false">
            <h1>Cluster Join</h1>
        </div>
        
        <div data-role="content">
        	<%
        		String error = request.getParameter("error");
        		if (error != null && error.trim().length() > 0) { %>
	        		<p class="error"><%=StringEscapeUtils.escapeHtml4(request.getParameter("error"))%></p>
        	<% } %>
        
	        <form action="<%=request.getContextPath()%>/libs/granite/cluster/content/admin/cluster/" method="post">
	        	<div data-role="fieldcontain">
	        		<label for="g-cluster-new-url">Master URL</label>
	        		<input id="g-cluster-new-url" name="url" type="url" required="required" />
	        		<p class="ui-input-desc">URL of the web app of a running cluster node, e.g. http://myserver:1234/mycontextpath.</p>
	        	</div>
	        	<div data-role="fieldcontain">
	        		<label for="g-cluster-new-username">Username</label>
	        		<input id="g-cluster-new-username" name="username" type="text" />
	        	</div>
	        	<div data-role="fieldcontain">
	        		<label for="g-cluster-new-password">Password</label>
	        		<input id="g-cluster-new-password" name="password" type="password" />
	        	</div>
	        	<input type="submit" value="Join" data-theme="a" />
	        </form>
	    </div>
        
        <div data-role="footer"></div>
    </div>
</body>
</html>