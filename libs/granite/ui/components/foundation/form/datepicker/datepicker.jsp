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
                  com.adobe.granite.ui.components.AttrBuilder,
                  org.json.JSONArray"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
    //Please keep it in sync whenever possible
      
    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    String name = cfg.get("name", String.class);

    String fieldLabel = cfg.get("fieldLabel", String.class);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass("datepicker");
    attrs.addClass(cfg.get("class", String.class));
    attrs.add("data-init", "datepicker");
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("value", cfg.get("value", String.class));

    String displayedFormat = cfg.get("displayedFormat", String.class);
    if (displayedFormat == null) displayedFormat = "YYYY-MM-DD HH:mm"; // Force default format
    
    attrs.addOther("displayed-format", displayedFormat);
    
    // Use CQ5 standard date format for storage 
    attrs.addOther("stored-format", "YYYY-MM-DD[T]HH:mm:ss.000Z");

    String[] monthNames = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};
    for(int i = 0; i < monthNames.length; i++) monthNames[i] = i18n.getVar(monthNames[i]);
    String months = new JSONArray(monthNames).toString();
    attrs.addOther("month-names", months);

    String[] dayNames = {"Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"};
    for(int i = 0; i < dayNames.length; i++) dayNames[i] = i18n.getVar(dayNames[i]);
    String days = new JSONArray(dayNames).toString();
    attrs.addOther("day-names", days);


    AttrBuilder attrsInput = new AttrBuilder(request, xssAPI);
    attrsInput.add("name", name);
    attrsInput.addDisabled(cfg.get("disabled", false));
    attrsInput.add("placeholder", i18n.getVar(cfg.get("emptyText", String.class)));
    attrsInput.add("type", cfg.get("type", "date"));

    String value = val.get(name);
    attrsInput.add("value", value);

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "value", "renderReadOnly", "fieldLabel", "type", "displayedFormat");

    String rootClass = Field.getRootClass(cfg, value);

    if (fieldLabel != null) {
        %><label class="<%= rootClass %>"><span><%= outVar(xssAPI, i18n, fieldLabel) %></span><%
        rootClass = "";
    }

    if (cfg.get("renderReadOnly", false)) {
        attrs.addClass("foundation-field-edit");
        %><span class="foundation-field-editable <%= rootClass %>"
            ><span class="foundation-field-readonly">
                <span data-datepicker-format="<%= xssAPI.filterHTML(displayedFormat)  %>"><%= xssAPI.filterHTML(value) %></span>
            </span
            ><span <%= attrs.build() %>
                ><input <%= attrsInput.build() %>
                ><button class="icon-calendar small" type="button"><%= i18n.get("Date Picker") %></button
            ></span
        ></span><%
    } else {
        attrs.addClass(rootClass);
        %><span <%= attrs.build() %>
            ><input <%= attrsInput.build() %>
            ><button class="icon-calendar small" type="button"><%= i18n.get("Date Picker") %></button
        ></span><%
    }

    if (fieldLabel != null) {
        %></label><%
    }
%>
