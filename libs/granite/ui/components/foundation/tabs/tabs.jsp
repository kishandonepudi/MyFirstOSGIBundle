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
%><%@include file="/libs/granite/ui/global.jsp"%><%
%><%@page import="java.util.Iterator,
                  org.apache.jackrabbit.JcrConstants,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.AttrBuilder"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Tabs
    //Please keep in sync whenever possible

    Config cfg = new Config(resource);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.addClass(cfg.get("class", String.class));
    attrs.addClass("tabs");
    if (cfg.get("type", "").equals("nav")) attrs.addClass("nav");
    if (cfg.get("type", "").equals("white")) attrs.addClass("white");
    if (cfg.get("type", "").equals("stacked")) attrs.addClass("stacked");

    attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "type");


%>
<div <%= attrs.build() %>>
    <nav>
    <%
    for (Iterator<Resource> items = cfg.getItems(); items.hasNext();) {
        
        Resource item = items.next();
        if (JcrConstants.JCR_CONTENT.equals(item.getName())) continue;
        Config ccfg = new Config(item);
        String title = ccfg.get("title", "");
        
        AttrBuilder attrsTab = new AttrBuilder(request, xssAPI);
        attrsTab.add("id", ccfg.get("id", String.class));
        attrsTab.add("data-toggle", "tab");
        attrsTab.addClass(ccfg.get("class", String.class));
        
        if (ccfg.get("active", false)) {
            attrsTab.addClass("active");
        }
        
        %>
        <a href="#" <%= attrsTab.build() %>><%= outVar(xssAPI, i18n, title) %></a>
        <%
    }
    %>
    </nav>

    <%
    for (Iterator<Resource> items = cfg.getItems(); items.hasNext();) {
        Resource item = items.next();
        if (JcrConstants.JCR_CONTENT.equals(item.getName())) continue;
        Config ccfg = new Config(item);
        boolean active = ccfg.get("active", false);
        %>
        <section <%= (active) ? "class=\"active\"" : "" %>>
            <sling:include path="<%= item.getPath() %>" />
        </section>
        <%
    } %>
</div>