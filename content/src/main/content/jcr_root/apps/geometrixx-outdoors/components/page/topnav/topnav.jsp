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
--%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
%><%@ page contentType="text/html; charset=utf-8" import="
    java.util.Iterator,
    com.day.cq.wcm.api.Page,
    com.day.cq.wcm.api.PageFilter,
    info.geometrixx.commons.util.GeoHelper"
%><%

    final Page rootPage = currentPage.getAbsoluteParent(currentStyle.get("absParent", 2));
    if (rootPage != null) {
        final boolean showSiteTitle = !currentStyle.get("hideSiteTitle", false);
        final String rootPath = rootPage.getPath() + ".html";
        final String rootTitle = GeoHelper.getNavTitle(rootPage);
%>
<nav>
    <% if (showSiteTitle) { %>
        <h1><a href="<%= xssAPI.getValidHref(rootPath) %>"><%= xssAPI.encodeForHTML(rootTitle) %></a></h1>
    <% } %>
    <ul><%
        Iterator<Page> children = rootPage.listChildren(new PageFilter(request));
        for (int item = 1; children.hasNext(); item++) {
            final Page child = children.next();
            final String childPath = child.getPath() + ".html";
            final String childTitle = GeoHelper.getNavTitle(child);

            String className = "topnav-item-"+item;
            if (item == 1) className += " topnav-first";
            if (!children.hasNext()) className += " topnav-last";

            %><li class="<%= xssAPI.encodeForHTMLAttr(className) %>"><a href="<%= xssAPI.getValidHref(childPath) %>"><%= xssAPI.encodeForHTML(childTitle) %></a></li><%
        }
    %></ul>
</nav>
<%
    }
%>