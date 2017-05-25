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
%><%@page import="java.util.Iterator,
                  org.apache.sling.api.resource.Resource,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.LayoutBuilder"
        session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Wizard
    //Please keep in sync whenever possible
    
    Config cfg = new Config(resource);

    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.addClass("foundation-wizard wizard");
    attrs.addClass(cfg.get("class", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.addHref("action", cfg.get("action", String.class));
    attrs.add("enctype", cfg.get("enctype", String.class));
    attrs.add("method", cfg.get("method", String.class));

    attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "title", "action", "enctype", "method");
    
    LayoutBuilder layout = LayoutBuilder.from(cfg);
    if (layout.hasName()) {
        attrs.add("data-foundation-layout", layout.toJSON().toString());
    }

%><form <%= attrs.build() %>>
    <nav class="toolbar">
        <span class="left"><button class="foundation-wizard-control back" type="button" autocomplete="false" data-foundation-wizard-control-action="prev"><%= i18n.get("Back") %></button></span>
        <span class="right"><button class="foundation-wizard-control next" type="button" autocomplete="false" data-foundation-wizard-control-action="next"><%= i18n.get("Next") %></button></span>
        <ol class="center"><%
            for (Iterator<Resource> it = cfg.getItems(); it.hasNext();) {
                Config itemConfig = new Config(it.next());
                %><li><%= outVar(xssAPI, i18n, itemConfig.get("jcr:title", "")) %></li><%
            }
        %></ol>
    </nav>
    <sling:include path="<%= resource.getPath() %>" resourceType="granite/ui/components/foundation/contsys" />
</form>
