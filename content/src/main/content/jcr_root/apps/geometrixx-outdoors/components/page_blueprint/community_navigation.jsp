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

    final Page rootPage = currentPage.getAbsoluteParent(currentStyle.get("absParent", 4));
    if (rootPage != null) {
        final boolean showSiteTitle = !currentStyle.get("hideSiteTitle", false);
        final String rootPath = rootPage.getPath() + ".html";
        final String rootTitle = GeoHelper.getNavTitle(rootPage);
%>
<div class="title section sub-nav">
    <% if (showSiteTitle) { %>
    <h1><strong>Community</strong> <%= xssAPI.encodeForHTML(rootTitle) %></h1>
    <% } %>
    <nav>
        <ul>
            <%
                String className = "topnav-item-0";
                if (currentPage.getPath().equals(rootPage.getPath())) className += " current";
            %>
            <li class="<%= className %>"><a href="<%= xssAPI.getValidHref(rootPage.getPath()) %>.html">Home</a></li>
            <%
            Iterator<Page> children = rootPage.listChildren(new PageFilter(request));
            for (int item = 1; children.hasNext(); item++) {
                final Page child = children.next();
                final String childPath = child.getPath() + ".html";
                final String childTitle = GeoHelper.getNavTitle(child);

                className = "topnav-item-"+item;
                if (currentPage.getPath().equals(child.getPath())) className += " current";
                if (!children.hasNext()) className += " topnav-last";
    
            %><li class="<%= className %>"><a href="<%= xssAPI.getValidHref(childPath) %>"><%= xssAPI.encodeForHTML(childTitle) %></a></li><%
            }
            %>
        </ul>
    </nav>
    <div>

    <div class="button-pair">
    <% int depth = currentPage.getDepth() - currentStyle.get("relParent", 1); %>
    <% if (depth == 4) { %>
        <cq:include path="statustoggle" resourceType="geometrixx-outdoors/components/commons/toggle"/>
    <% } else if (depth == 5) { %>
        <cq:include path="../../jcr:content/statustoggle" resourceType="geometrixx-outdoors/components/commons/toggle"/>
    <% } %>
    </div>

    <!--div class="button-pair">
        <div class="gray-button"><a href="#">Join (S)</a></div>
        <div class="gray-button last"><a href="#">Invite (S)</a></div>
    </div-->
    </div>
</div>
<nav>


</nav>
<%
    }
%>