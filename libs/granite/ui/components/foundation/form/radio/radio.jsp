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
                  com.adobe.granite.ui.components.Value,
                  com.adobe.granite.ui.components.AttrBuilder"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
    //Please keep it in sync whenever possible

    Config cfg = new Config(resource, true);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    String name = cfg.getInherited("name");
    String value = cfg.get("value", String.class);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass(cfg.getInheritedDefault("class", String.class));
    attrs.addDisabled(cfg.getInheritedDefault("disabled", false));
    attrs.addRel(cfg.getInheritedDefault("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("name", name);
    attrs.add("value", value);

    if (cfg.get("checked", Boolean.class) != null) {
        // providing "checked" in configuration results in ignoring content data
        attrs.addChecked(cfg.get("checked", false));
    } else if (!cfg.getInherited("ignoreData", false)) {
        // mark checked if content value equals config value
        String contentValue = val.getContentValue(name);
        if (contentValue.equals(value)) {
            attrs.addChecked(true);
        }
    }

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "value", "text", "disabled", "checked", "ignoreData");

%><label><input type="radio" <%= attrs.build() %>><span><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></span></label>