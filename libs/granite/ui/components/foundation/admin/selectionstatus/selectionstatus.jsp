<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%@page session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page import="com.adobe.granite.ui.components.Config" %><%

// Doc: https://zerowing.corp.adobe.com/display/granite/Selection+Status
// Please keep in sync whenever possible

Config cfg = new Config(resource);

String template = i18n.get("{0} selected", null, "{{count}}");
String initialValue = i18n.get("{0} selected", null, 0);

String targetAttr = "";
String target = cfg.get("target", String.class);
if (target != null) {
    targetAttr = "data-target='" + xssAPI.encodeForHTMLAttr(target) + "'";
}

%><span class="foundation-admin-selectionstatus text" data-template='<%= template %>' <%= targetAttr %>><%= initialValue %></span>
<ui:includeClientLib categories="granite.ui.foundation.admin" />