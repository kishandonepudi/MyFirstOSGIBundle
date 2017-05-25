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
    com.day.cq.i18n.I18n,
    com.day.cq.wcm.api.WCMMode,
    com.day.cq.wcm.api.components.DropTarget"
%><%

I18n i18n = new I18n(slingRequest);

//drop target css class = dd prefix + name of the drop target in the edit config
String ddClassName = (WCMMode.fromRequest(request) == WCMMode.EDIT) ? DropTarget.CSS_CLASS_PREFIX+"image" : "";

String articleLink = properties.get("link", "#");
if (articleLink != "#") {
    articleLink += ".html";
}

%>
<a class="article <%= ddClassName %>" href="<%= xssAPI.getValidHref(articleLink) %>">
    <img src="<%= xssAPI.getValidHref(properties.get("image", "")) %>" alt="" />
    <div class="text">
        <h3><%= xssAPI.encodeForHTML(properties.get(NameConstants.PN_TITLE, i18n.get("Article"))) %></h3>
        <p class="description"><%= xssAPI.encodeForHTML(properties.get(NameConstants.PN_DESCRIPTION, "")) %></p>
        <p class="button"><%= xssAPI.encodeForHTML(properties.get("button", i18n.get("Read Article"))) %></p>
        <span class="bg"></span>
    </div>
</a>