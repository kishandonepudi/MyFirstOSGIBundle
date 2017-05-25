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
                  java.util.List,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Value,
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.AttrBuilder"%><%

//Doc: https://zerowing.corp.adobe.com/display/granite/Form+Inputs
//Please keep it in sync whenever possible

Config cfg = new Config(resource);
Value val = new Value(slingRequest, cfg);

String name = cfg.get("name", String.class);

AttrBuilder attrs = new AttrBuilder(request, xssAPI);
attrs.add("id", cfg.get("id", String.class));
attrs.addClass("dropdown");
attrs.addClass(cfg.get("class", String.class));
attrs.addRel(cfg.get("rel", String.class));
attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
attrs.add("data-init", "dropdown");
attrs.add("data-placeholder", i18n.getVar(cfg.get("emptyText", String.class)));
attrs.addBoolean("data-disabled", cfg.get("disabled", false));

AttrBuilder attrsSelect = new AttrBuilder(request, xssAPI);
attrsSelect.add("name", name);
attrsSelect.addDisabled(cfg.get("disabled", false));

if (cfg.get("type", "").equals("multiple")) {
    attrs.add("data-multiple", "true");
    attrsSelect.addBoolean("multiple", true);
} else if (cfg.get("type", "").equals("editable")) {
    attrs.addClass("dropdown-editable");
    attrs.add("data-editable", "true");
}

attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "emptyText", "renderReadOnly", "fieldLabel", "type", "disabled");

String fieldLabel = cfg.get("fieldLabel", String.class);

String contentValue = val.get(name, "");
String[] contentValueArray = val.get(name, new String[0]);
List<String> contentValueList = java.util.Arrays.asList(contentValueArray);

String rootClass = Field.getRootClass(cfg, "".equals(contentValue) && contentValueArray.length <= 1);

if (cfg.get("renderReadOnly", false)) {
    attrs.addClass("foundation-field-edit");
    
    %><label class="select <%= rootClass %>"><%
        if (fieldLabel != null) {
            %><span><%= outVar(xssAPI, i18n, fieldLabel) %></span><%
        }
        %><div class="foundation-field-editable">
            <ol class="foundation-field-readonly"><%
                for (Iterator<Resource> it = cfg.getItems(); it.hasNext();) {
                    Config itemConfig = new Config(it.next());
                    String value = itemConfig.get("value", "");
                    
                    boolean selected = contentValue.equals(value) || contentValueList.contains(value);
                    
                    if (selected) {
                        %><li><%= outVar(xssAPI, i18n, itemConfig.get("text", "")) %></li><%
                    }
                }
            %></ol>
            <div <%= attrs.build() %>>
                <button type="button"><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></button>
                <select <%= attrsSelect.build() %>>
                <%
                for (Iterator<Resource> it = cfg.getItems(); it.hasNext();) {
                    Config itemConfig = new Config(it.next());

                    String value = itemConfig.get("value", "");
                    
                    AttrBuilder optionAttrs = new AttrBuilder(request, xssAPI);
                    optionAttrs.addSelected(contentValue.equals(value) || contentValueList.contains(value));
                    optionAttrs.add("value", value);
                    
                    %><option <%= optionAttrs.build() %>><%= outVar(xssAPI, i18n, itemConfig.get("text", "")) %></option><%
                }
                %>
                </select>
            </div>
        </div>
    </label><%
} else {
    if (fieldLabel != null) {
        %><label class="<%= rootClass %>"><span><%= outVar(xssAPI, i18n, fieldLabel) %></span><%
        rootClass = "";
    }
    attrs.addClass(rootClass);
    %><div <%= attrs.build() %>>
        <button type="button"><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></button>
        <select <%= attrsSelect.build() %>>
        <%
        for (Iterator<Resource> it = cfg.getItems(); it.hasNext(); ) {
            Config itemConfig = new Config(it.next());
            
            String value = itemConfig.get("value", "");
            
            AttrBuilder optionAttrs = new AttrBuilder(request, xssAPI);
            optionAttrs.addSelected(contentValue.equals(value) || contentValueList.contains(value));
            optionAttrs.add("value", value);

            %><option <%= optionAttrs.build() %>><%
                if (!cfg.get("doNotTranslateOptions", false)) {
                    %><%= outVar(xssAPI, i18n, itemConfig.get("text", "")) %><%
                } else {
                    %><%= xssAPI.encodeForHTML(itemConfig.get("text", "")) %><%
                }
            %></option><%
        }
        %>
        </select>
    </div><%
    
    if (fieldLabel != null) {
        %></label><%
    }
}
%>