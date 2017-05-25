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
                  org.apache.sling.api.resource.Resource,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Value,
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.AttrBuilder,
                  org.apache.jackrabbit.JcrConstants"%><%

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    String name = cfg.get("name");
    String value = val.getContentValue(name);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass("radiogroup");
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "text", "renderReadOnly");

    String text = i18n.getVar(cfg.get("text", String.class));

    boolean renderReadOnly = cfg.get("renderReadOnly", false);
    if (renderReadOnly) {
        attrs.addClass(Field.getRootClass(cfg, value));
    }


%><fieldset <%= attrs.build() %>>
    <% if (text != null) {
        %><legend><%= text %></legend><%
    }

    if (renderReadOnly) {
        String checkedText = getCheckedText(value, cfg);
        %><span class="foundation-field-editable"
            ><span class="foundation-field-readonly"><%= outVar(xssAPI, i18n, checkedText) %></span
            ><span class="foundation-field-edit"><sling:include path="<%= resource.getPath() %>" resourceType="granite/ui/components/foundation/contsys" /></span
        ></span><%
    } else {
        %><sling:include path="<%= resource.getPath() %>" resourceType="granite/ui/components/foundation/contsys" /><%
    } %>
</fieldset>
<%!
String getCheckedText(String contentValue, Config cfg) {

    for (Iterator<Resource> items = cfg.getItems(); items.hasNext();) {
        Resource item = items.next();
        if (JcrConstants.JCR_CONTENT.equals(item.getName())) {
            continue;
        }
        Config itemCfg = new Config(item, true);
        String value = itemCfg.get("value", String.class);

        //todo: same logic as in radio >> merge
        if (itemCfg.get("checked", Boolean.class) != null) {
            // providing "checked" in configuration results in ignoring content data
            return itemCfg.get("text", "");
        } else if (!itemCfg.getInherited("ignoreData", false)) {
            // mark checked if content value equals config value
            if (contentValue.equals(value)) {
                return itemCfg.get("text", "");
            }
        }
    }
    return "";
}
%>