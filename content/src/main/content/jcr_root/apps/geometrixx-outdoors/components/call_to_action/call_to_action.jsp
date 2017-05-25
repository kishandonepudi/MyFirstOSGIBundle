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
    com.day.cq.i18n.I18n" %><%

    I18n i18n = new I18n(slingRequest);

    String backgroundImage = properties.get("backgroundImage", String.class);
    String backgroundStyleAttr = "";
    if (backgroundImage != null) {
        backgroundStyleAttr = "style=\"background: url('" + resourceResolver.map(request, backgroundImage) + "') left top repeat-x\"";
    }

    String callToActionUrl = properties.get("callToActionPath", "");
    if (callToActionUrl.length() > 0) {
        callToActionUrl += ".html";
    }

%>
<div class="call-to-action" <%= backgroundStyleAttr %>>
    <h3><%= xssAPI.encodeForHTML(properties.get("heading", "")) %></h3>
    <p class="message"><%= xssAPI.encodeForHTML(properties.get("message", i18n.get("Message"))) %></p>
    <a href="<%= xssAPI.getValidHref(callToActionUrl) %>">
        <p class="call-to-action"><%= xssAPI.encodeForHTML(properties.get("callToAction", i18n.get("Call to Action")))%></p>
    </a>
</div>
