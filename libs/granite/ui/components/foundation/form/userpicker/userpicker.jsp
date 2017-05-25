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
--%><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page import="com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Value,
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.AttrBuilder"
          session="false" %><%

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);
    AttrBuilder attrsSelect = new AttrBuilder(request, xssAPI);

    String name = cfg.get("name", String.class);
    boolean multiple = cfg.get("multiple", false);
    boolean impersonatesOnly = cfg.get("impersonatesOnly", false);

    String fieldLabel = cfg.get("fieldLabel", String.class);


    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrsSelect.add("name", name);
    //attrs.add("value", cfg.get("value", String.class));
    attrs.add("data-placeholder", cfg.get("emptyText", String.class)); // placeholder is not valid for divs so we use data-placeholder
    attrs.addDisabled(cfg.get("disabled", false));
    attrs.addClass("filters granite-userpicker " + cfg.get("class", ""));

    // Currently not implemented
    // if (multiple) {
    //    attrs.add("data-multiple", "true");
    //    attrsSelect.add("multiple", "multiple");
    //}

    if (cfg.get("stacking", false)) {
        attrs.add("data-stacking", "true");
    }

    attrs.addOthers(cfg.getProperties(), "rel", "title", "name", "value", "emptyText", "disabled", "stacking");

    String contentValue = val.get(name, null);

    // Mark our element as new
// attrs.add("data-granite-userpicker", "new");


%><%
        
    String rootClass = Field.getRootClass(cfg, contentValue);

    if (fieldLabel != null) {
        %><label class="<%= rootClass %>"><span><%= outVar(xssAPI, i18n, fieldLabel) %></span><%
        rootClass = "";
    }

    if (cfg.get("renderReadOnly", false)) {
        attrs.addClass("foundation-field-edit");
        %><span class="foundation-field-editable <%= rootClass %>"><span class="foundation-field-readonly"><%= (contentValue != null) ? xssAPI.filterHTML(contentValue) : "" %></span><%
    } else {
        attrs.addClass(rootClass);
    }

    attrs.addOther("userpicker-path", currentNode.getPath());
    attrs.addOther("userpicker-impersonates-only", (impersonatesOnly) ? "true" : "false");

%>
<div <%= attrs.build() %> >
    <input type="text" />
    <select <%= attrsSelect.build() %> />
        <% if (contentValue != null) { %>
        <option selected><%= xssAPI.encodeForHTML(contentValue) %></option>
        <% } %>
    </select>
</div>
<%
if (cfg.get("renderReadOnly", false)) {
    %></span><%
}
if (fieldLabel != null) {
    %></label><%
}    
%>