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
    info.geometrixx.commons.util.GeoHelper"
%><%!

String mapTagName(String type) {
    if (type.toLowerCase().equals("small"))  return "h3";
    if (type.toLowerCase().equals("medium")) return "h2";
    if (type.toLowerCase().equals("large"))  return "h1";
    else                                     return "h1";
}

%><%

final String title = GeoHelper.getTitle(resource, currentPage);
final String type  = properties.get("type", currentStyle.get("defaultType", "large"));
final String link  = properties.get("href", String.class);
final String css = properties.get("css", "");

%>
<% if (GeoHelper.notEmpty(link)) { %><a href="<%= xssAPI.getValidHref(link) %>"><% } %>
<cq:text value="<%= title %>" tagName="<%= mapTagName(type) %>" tagClass="<%= css %>" escapeXml="true"/>
<% if (GeoHelper.notEmpty(link)) { %></a><% } %>