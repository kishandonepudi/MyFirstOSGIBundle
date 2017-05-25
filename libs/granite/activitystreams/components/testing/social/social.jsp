<%--

ADOBE CONFIDENTIAL
__________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

NOTICE:  All information contained herein is, and remains
the property of Adobe Systems Incorporated and its suppliers,
if any.  The intellectual and technical concepts contained
herein are proprietary to Adobe Systems Incorporated and its
suppliers and are protected by trade secret or copyright law.
Dissemination of this information or reproduction of this material
is strictly forbidden unless prior written permission is obtained
from Adobe Systems Incorporated.
--%><%@ page session="false"
             contentType="text/html"
             pageEncoding="utf-8"
             import="com.day.cq.widget.HtmlLibraryManager" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.1" %><%
%><sling:defineObjects/><%
    HtmlLibraryManager libMgr = sling.getService(HtmlLibraryManager.class);
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Social Graph Client</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <%
        libMgr.writeIncludes(slingRequest, out, "granite.activitystreams.testing");
    %>
    <sling:include replaceSelectors="templates"/>
</head>
<body>
<div class="navbar navbar-fixed-top">
    <div class="navbar-inner">
        <ul class="nav">
            <li class="dropdown">
                <ul id="nav-menu-userselect" class="nav">
                    <!-- will be replaced by template -->
                    <li>
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-user"></i>
                            Administrator
                            <b class="caret"></b>
                        </a>
                    </li>
                </ul>
                <ul class="dropdown-menu">
                    <li><a href="#"><i class="icon-cog"></i> Settings</a></li>
                    <li><a href="/bin/logout" id="logout"><i class="icon-off"></i> Logout</a></li>
                </ul>
            </li>
            <li class="divider-vertical"></li>
            <li><a href="/">Home</a></li>
            <li><a href="/libs/granite/activitystreams/content/testing/client.html">Activities</a></li>
            <li class="active"><a href="/libs/granite/activitystreams/content/testing/social.html">Social</a></li>
            <li><a href="/crx/de">CRXDE</a></li>
        </ul>
    </div>
</div>


<div class="row">
    <div id="content" class="span6"></div>
    <div class="span4">
        <div class="row">
            <div id="following" class="span4"></div>
        </div>
        <div class="row">
            <div id="followers" class="span4"></div>
        </div>
    </div>
</div>

<script>
    jQuery(function($){
        app = new Social.AppRouter();
        Backbone.history.start();
    })
</script>

</body>
</html>
