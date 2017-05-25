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
    info.geometrixx.commons.util.GeoHelper,
    com.day.cq.i18n.I18n"
%><%

    final I18n i18n = new I18n(slingRequest);
    String[] tabTitles = properties.get("tabs", String[].class);
    if (tabTitles == null || tabTitles.length == 0) {
        tabTitles = new String[1];
        tabTitles[0] = i18n.get("Tab One");
    }

    // Create a unique name based on the component path, this will make it possible to have several tab components on the same page without conflicting IDs
    final String basePath = resource.getPath();
    final String tabRelativePath = basePath.substring(currentPage.getContentResource().getPath().length()+1);
    final String tabUniqueName = tabRelativePath.replaceAll("[^/a-zA-Z0-9]", "-").replaceAll("/", "_");

%>
<header class="tabctrl-header"><ul>
<% for (int i = 0; i < tabTitles.length; i++) { %>
    <% if (GeoHelper.notEmpty(tabTitles[i])) { %>
        <li><a href="#<%= tabUniqueName+"-"+i %>"><%= xssAPI.encodeForHTML(tabTitles[i]) %></a></li>
    <% } %>
<% } %>
</ul></header>
<div class="tabctrl-container">
<% for (int i = 0; i < tabTitles.length; i++) { %>
    <% if (GeoHelper.notEmpty(tabTitles[i])) { %>
        <section id="<%= tabUniqueName+"-"+i %>" class="tabctrl-content" data-path="<%= xssAPI.getValidHref(basePath+"/tab-"+i) %>">
            <h2 class="tabctrl-title"><%= xssAPI.encodeForHTML(tabTitles[i]) %></h2>
            <cq:include path="<%= "tab-"+i %>" resourceType="foundation/components/parsys"/>
        </section>
    <% } %>
<% } %>
</div>