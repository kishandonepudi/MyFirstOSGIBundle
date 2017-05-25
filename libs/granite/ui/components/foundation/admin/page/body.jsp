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
                  com.adobe.granite.ui.components.ClientState" %><%
%><body><%
    Resource header = resource.getChild("header");
    if (header != null) {
        ValueMap headerVm = header.adaptTo(ValueMap.class);
        String headerResourceType = headerVm.get("sling:resourceType", "granite/ui/components/foundation/contsys");
%><sling:include path="<%= header.getPath() %>" resourceType="<%= headerResourceType %>" /><%
    }

    // page class attributes
    AttrBuilder pageAttrs = new AttrBuilder(request, xssAPI);
    ValueMap pageVm = resource.adaptTo(ValueMap.class);

    pageAttrs.addClass("page"); //default class
    pageAttrs.addClass(pageVm.get("class", String.class));
    pageAttrs.add("role", "main");

%><div <%= pageAttrs.build() %>><%
    Resource rail = resource.getChild("rail");
    if (rail != null) {
        AttrBuilder railAttrs = new AttrBuilder(request, xssAPI);
        railAttrs.addClass("rail");
        railAttrs.addClass("left");
        railAttrs.add("id", "rail");
        railAttrs.add("role", "complementary");

        ValueMap railVm = rail.adaptTo(ValueMap.class);
        String railResourceType = railVm.get("sling:resourceType", "granite/ui/components/foundation/contsys");

        ClientState state = new ClientState(slingRequest);
        state.restoreState(railAttrs, "#rail", new String[] {"class"});
%><div <%= railAttrs.build() %>>
    <div class="wrap"><sling:include path="<%= rail.getPath() %>" resourceType="<%= railResourceType %>" /></div>
</div><%
    }

    Resource content = resource.getChild("content");
    if (content != null) {
        ValueMap contentVm = content.adaptTo(ValueMap.class);
        String contentResourceType = contentVm.get("sling:resourceType", "granite/ui/components/foundation/contsys");

%><div id="content" class="content foundation-content">
    <div class="foundation-content-current">
        <sling:include path="<%= content.getPath() %>" resourceType="<%= contentResourceType %>" />
    </div>
</div>
    <ui:includeClientLib categories="granite.ui.foundation.content" /><%
        }
    %></div>
<sling:include replaceSelectors="includelibs" />
</body>
