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
%><%@page import="com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.AttrBuilder" %><%

    // Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
    // Please keep it in sync whenever possible

    Config cfg = new Config(resource);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass("button");
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.addDisabled(cfg.get("disabled", false));
    attrs.add("form", cfg.get("formId", String.class));

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "disabled", "text", "formId");

%><button type="reset" <%= attrs.build() %>><%= i18n.getVar(cfg.get("text", String.class)) %></button>