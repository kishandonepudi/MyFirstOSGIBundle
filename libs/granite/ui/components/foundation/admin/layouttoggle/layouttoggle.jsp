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
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.LayoutBuilder" %><%

    Config cfg = new Config(resource, null, null);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.addClass("foundation-admin-layouttoggle");
    attrs.addClass(cfg.get("class", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("data-target", cfg.get("target", String.class));

    attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "title", "target");

    %><div <%= attrs.build() %>><%
    int i = 0;
    for (Iterator<Resource> items = cfg.getItems(); items.hasNext();) {
        Resource item = items.next();

        Config itemCfg = new Config(item);
        AttrBuilder itemAttrs = new AttrBuilder(request, xssAPI);

        itemAttrs.add("id", itemCfg.get("id", String.class));
        itemAttrs.addRel(itemCfg.get("rel", String.class));
        itemAttrs.addClass(itemCfg.get("class", String.class));
        itemAttrs.addClass(itemCfg.get("icon", String.class));
        itemAttrs.add("title", i18n.getVar(itemCfg.get("title", String.class)));
        itemAttrs.add("type", "button");
        itemAttrs.add("autocomplete", "off"); // to prevent annoying FF disabling the button whenever it wishes to

        if (i > 0) {
            itemAttrs.addClass("hide");
        }

        LayoutBuilder layout = LayoutBuilder.from(itemCfg);
        itemAttrs.add("data-foundation-admin-layouttoggle-layout", layout.toJSON().toString());

        String text = outVar(xssAPI, i18n, itemCfg.get("text"));

        itemAttrs.addOthers(itemCfg.getProperties(), "id", "rel", "class", "icon", "title", "type", "text", "hideText", "autoComplete");
        i++;
        
        if (!itemCfg.get("hideText", false)) {
            itemAttrs.addClass("withLabel");
        }
        %><button <%= itemAttrs.build() %>><span><%= text %></span></button><%
    }
%></div>
<ui:includeClientLib categories="granite.ui.foundation.admin" />