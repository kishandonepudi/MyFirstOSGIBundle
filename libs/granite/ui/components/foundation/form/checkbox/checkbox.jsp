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
                  com.adobe.granite.ui.components.AttrBuilder"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
    //Please keep it in sync whenever possible


    // TODO: Currently this component uses strings to distinguish between checked and non-checked status, which seems
    // to be more compatible to old releases. But it would be more straightforward to use boolean values.

    Config cfg = new Config(resource, false);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);
    AttrBuilder attrsReadOnly = new AttrBuilder(request, xssAPI);

    attrsReadOnly.add("disabled", "disabled");

    String name = cfg.get("name", String.class);
    String value = cfg.get("value", String.class);
    String text = cfg.get("text", String.class);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("name", name);
    attrs.add("value", value);
    attrs.addDisabled(cfg.get("disabled", false));

    String rootClass = "";

    boolean checked = false;
    boolean partial = false;

    if (cfg.get("checked", null) != null || cfg.get("partial", null) != null) {
        // providing "checked" or "partial" in configuration results in ignoring content data
        checked = cfg.get("checked", false);
        partial = cfg.get("partial", false);
        attrs.addChecked(checked);
        attrsReadOnly.addChecked(checked);
        if (partial) {
            attrs.addClass("partial");
            attrsReadOnly.addClass("partial");
        }
        rootClass = Field.getRootClass(cfg, !checked && !partial);
    } else if (!cfg.get("ignoreData", false)) {
        // mark checked if content value equals config value
        String[] contentValues = val.get(name, new String[0]);
        checked = false;
        for (int i = 0; i < contentValues.length; i++) {
            if (contentValues[i].equals(value)) {
                attrs.addChecked(true);
                attrsReadOnly.addChecked(true);
                checked = true;
                break;
            }
        }
        rootClass = Field.getRootClass(cfg, !checked);
    }

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "value", "text", "disabled", "checked", "partial");

%><label class="<%= rootClass %>"><%

    if (cfg.get("renderReadOnly", false)) {
        %>
            <span class="foundation-field-editable"><%
                if(checked) { %>
                    <i class="foundation-field-readonly checkbox-status icon-check withLabel"><%= outVar(xssAPI, i18n, text) %></i><%
                } else {
                    if(cfg.get("renderReadOnlyUnchecked", false)) { %>
                        <span class="foundation-field-readonly checkbox-status"><%= outVar(xssAPI, i18n, text) %></span><%
                        }
                    } %>
                <span class="foundation-field-edit"><%
        } %>
        <input type="checkbox" <%= attrs.build() %>>
        <span><%= outVar(xssAPI, i18n, text) %></span><%

    if (cfg.get("renderReadOnly", false)) {
        %>
                </span>
            </span><%
    }

%></label>