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
%><%@page import="com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config" %><%

Config cfg = new Config(resource);

AttrBuilder attrs = new AttrBuilder(request, xssAPI);

attrs.add("id", cfg.get("id", String.class));
attrs.addRel(cfg.get("rel", String.class));
attrs.addClass("foundation-admin-rail-toggle");
attrs.addClass(cfg.get("class", String.class));
attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
attrs.add("type", "button");
attrs.addDisabled(cfg.get("disabled", false));
attrs.addClass(cfg.get("icon", String.class));
attrs.add("data-target", cfg.get("target", String.class));
attrs.add("autocomplete", "off"); // to prevent annoying FF disabling the button whenever it wishes to

attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "title", "type", "disabled", "icon", "target", "text", "autoComplete", "hideText");

if (!cfg.get("hideText", false)) {
    attrs.addClass("withLabel");
}

%><button <%= attrs.build() %>><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></button>
<ui:includeClientLib categories="granite.ui.foundation.admin" />
