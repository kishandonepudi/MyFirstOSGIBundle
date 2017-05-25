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
%><%@page import="com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config" %><%

Config cfg = new Config(resource);

AttrBuilder attrs = new AttrBuilder(request, xssAPI);

attrs.addRel(cfg.get("rel", String.class));
attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
attrs.add("action", cfg.get("action", String.class));
attrs.add("enctype", cfg.get("enctype", String.class));
attrs.add("method", cfg.get("method", String.class));
attrs.addClass(cfg.get("class", String.class));

attrs.addOthers(cfg.getProperties(), "rel", "title", "class", "action", "enctype", "method");

%><form <%= attrs.build() %>>
    <sling:include path="<%= resource.getPath() %>" resourceType="granite/ui/components/foundation/contsys" />
</form>
<ui:includeClientLib categories="granite.ui.foundation" />