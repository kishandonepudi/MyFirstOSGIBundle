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

// Doc: https://zerowing.corp.adobe.com/display/granite/Hyperlink
// Please keep in sync whenever possible

Config cfg = new Config(resource);

AttrBuilder attrs = new AttrBuilder(request, xssAPI);

attrs.add("id", cfg.get("id", String.class));
attrs.addRel(cfg.get("rel", String.class));
attrs.addClass(cfg.get("class", String.class));
attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
attrs.addClass(cfg.get("icon", String.class));
attrs.add("target", cfg.get("target", String.class));

String href = cfg.get("href", String.class);


if (href != null && href.trim().length() > 0 && cfg.get("appendSuffix", false)) {
    String suffix = slingRequest.getRequestPathInfo().getSuffix();
    if (suffix != null) {
        href += suffix;
    }
}

if (Boolean.TRUE.equals(request.getAttribute("pulldown_disabled"))) {
    attrs.addClass("disabled");
} else {
    attrs.addHref("href", href);
}

// Link checker
attrs.add("x-cq-linkchecker", cfg.get("x-cq-linkchecker", String.class));

attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "href", "title", "text", "icon", "target", "hideText", "allowEmptySuffix", "appendSuffix", "suffixMinLevel", "x-cq-linkchecker");

if (!cfg.get("hideText", false)) {
    attrs.addClass("withLabel");
}

%><a <%= attrs.build() %>><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></a>
