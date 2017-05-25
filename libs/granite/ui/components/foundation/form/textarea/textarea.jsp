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
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.AttrBuilder" %><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
    //Please keep it in sync whenever possible

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    String name = cfg.get("name", String.class);
    String text = xssAPI.encodeForHTML(val.get(name));
    String fieldLabel = cfg.get("fieldLabel", String.class);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("name", name);
    attrs.add("placeholder", i18n.getVar(cfg.get("emptyText", String.class)));
    attrs.addDisabled(cfg.get("disabled", false));
    attrs.add("cols", cfg.get("cols", String.class));
    attrs.add("rows", cfg.get("rows", String.class));

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "value", "emptyText", "disabled", "cols", "rows", "renderReadOnly", "fieldLabel", "ignoreData");

    String rootClass = Field.getRootClass(cfg, text);

    if (fieldLabel != null) {
        %><label class="<%= rootClass %>"><span><%= outVar(xssAPI, i18n, fieldLabel) %></span><%
        rootClass = "";
    }

    if (cfg.get("renderReadOnly", false)) {
        attrs.addClass("foundation-field-edit");
        %><span class="foundation-field-editable <%= rootClass %>"><span class="foundation-field-readonly"><%= text %></span><textarea <%= attrs.build() %>><%= text %></textarea></span><%
    } else {
        attrs.addClass(rootClass);
        %><textarea <%= attrs.build() %>><%= text %></textarea><%
    }

    if (fieldLabel != null) {
        %></label><%
    }

%>