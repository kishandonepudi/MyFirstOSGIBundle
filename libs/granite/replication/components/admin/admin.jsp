<%--

ADOBE CONFIDENTIAL
__________________

 Copyright 2011 Adobe Systems Incorporated
 All Rights Reserved.

NOTICE:  All information contained herein is, and remains
the property of Adobe Systems Incorporated and its suppliers,
if any.  The intellectual and technical concepts contained
herein are proprietary to Adobe Systems Incorporated and its
suppliers and are protected by trade secret or copyright law.
Dissemination of this information or reproduction of this material
is strictly forbidden unless prior written permission is obtained
from Adobe Systems Incorporated.
--%><%@page session="false"
            import="com.day.cq.widget.HtmlLibraryManager" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><!DOCTYPE HTML>
<html>
<head>
    <meta charset="utf-8">
    <title>CRX Replication | Welcome</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
<%
    HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
    if (htmlMgr != null) {
        htmlMgr.writeIncludes(slingRequest, out, "granite.replication");
    }
%>
</head>
<body>
    <div data-role="globalheader" data-title="Replication" data-theme="a"></div>
    
    <div data-role="panel" data-id="menu">
        <sling:include path="agents.html" />
    </div>

    <div data-role="panel" data-id="main">
        <div data-role="page">
            
            <div data-role="header"></div>
            
            <div data-role="content">
                <span class="g-big">Welcome to Adobe CRX Replication</span>
            </div>
            
            <div data-role="footer"></div>
        </div>
    </div>
</body>
</html>