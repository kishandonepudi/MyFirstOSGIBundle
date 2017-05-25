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
%><%@page import="com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.ClientState,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.LayoutBuilder"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Container
    //Please keep in sync whenever possible

    Config cfg = new Config(resource);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.addClass(cfg.get("class", String.class));

    LayoutBuilder layout = LayoutBuilder.from(cfg);

    if (layout.hasName()) {
        attrs.addClass(layout.getName());
        attrs.addOther("foundation-layout", layout.toJSON().toString());
    }

    attrs.addOthers(cfg.getProperties(), "id", "rel", "class");

%><div <%= attrs.build() %>>
    <sling:include path="<%= resource.getPath() %>" resourceType="granite/ui/components/foundation/contsys" />
</div>