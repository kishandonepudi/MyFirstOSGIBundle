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
%><%@page import="java.util.List,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Value,
                  com.adobe.granite.ui.components.AttrBuilder"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
    //Please keep it in sync whenever possible

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("value", cfg.get("value", String.class));
    attrs.addDisabled(cfg.get("disabled", false));

    String name = cfg.get("name", String.class);
    String value = cfg.get("value", String.class);

    boolean isSelected = false;

    if (cfg.get("selected", null) != null) {
        // providing "selected" in configuration results in ignoring content data
        isSelected = cfg.get("selected", Boolean.class);
    } else if (!cfg.get("ignoreData", false)) {
        // mark selected if content value equals or contains config value
        String contentValue = val.get(name, "");
        String[] contentValueArray = val.get(name, new String[0]);
        List<String> contentValueList = java.util.Arrays.asList(contentValueArray);
        isSelected = (contentValue.equals(value) || contentValueList.contains(value));
    }
    attrs.addSelected(isSelected);

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "value", "text", "disabled", "selected");

%><option <%= attrs.build() %>><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></option>