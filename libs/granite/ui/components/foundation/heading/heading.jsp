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

//Doc: https://zerowing.corp.adobe.com/display/granite/Heading
//Please keep in sync whenever possible

Config cfg = new Config(resource);

AttrBuilder attrs = new AttrBuilder(request, xssAPI);

attrs.add("id", cfg.get("id", String.class));
attrs.addRel(cfg.get("rel", String.class));
attrs.addClass(cfg.get("class", String.class));
attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "title", "text", "level");

String tag = getTag(cfg.get("level", 1));

%><<%= tag %> <%= attrs.build() %>><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></<%= tag %>>
<%!
String getTag(int level) {
    switch (level) {
        case 2:
            return "h2";
        case 3:
            return "h3";
        case 4:
            return "h4";
        case 5:
            return "h5";
        case 6:
            return "h6";
        default:
            return "h1";
    }
}
%>