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
%><%@page import="java.util.Iterator,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Value,
                  com.adobe.granite.ui.components.AttrBuilder"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
    //Please keep it in sync whenever possible

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    String name = cfg.get("name", String.class);
    String value = val.get(name);
    String type = cfg.get("type", "radio");
    boolean ignoreData = cfg.get("ignoreData", false);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass(cfg.get("class", "selector"));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("name", name);

%>
<div <%= attrs.build() %>>
    <%for (Iterator<Resource> items = cfg.getItems(); items.hasNext();) {
        Resource item = items.next();
        Config itemCfg = new Config(item, true);
        AttrBuilder itemAttrs = new AttrBuilder(request, xssAPI);

        String itemValue = itemCfg.get("value", String.class);

        itemAttrs.add("value", itemValue);
        itemAttrs.addClass(itemCfg.getInheritedDefault("class", String.class));
        itemAttrs.add("title", i18n.getVar(itemCfg.getInheritedDefault("title", String.class)));
        itemAttrs.addDisabled(itemCfg.getInherited("disabled", false));
        itemAttrs.add("name", name);
        itemAttrs.add("type", type);

        if (itemCfg.get("checked", null) != null) {
            // providing "checked" in configuration results in ignoring content data
            itemAttrs.addChecked(itemCfg.get("checked", false));
        } else if (!ignoreData) {
            // mark checked if content value equals the item's config value
            if (value.equals(itemValue)) {
                itemAttrs.addChecked(true);
            }
        }
        %>
    <label><input <%= itemAttrs.build() %>>
        <span><%= outVar(xssAPI, i18n, itemCfg.get("text", "")) %></span>
    </label><%
    }%>
</div>