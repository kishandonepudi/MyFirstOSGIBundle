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
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.AttrBuilder" %><%
%><div class="rail-switch">
    <nav class="toolbar icongroup"><%

        Config cfg = new Config(resource);
        String active = cfg.get("active", String.class);

        // create header
        int count = 0;
        for (Iterator<Resource> it = cfg.getItems(); it.hasNext();) {
            Resource nav = it.next();
            Config navCfg = new Config(nav);
            
            AttrBuilder anchorAttrs = new AttrBuilder(request, xssAPI);
            AttrBuilder iconAttrs = new AttrBuilder(request, xssAPI);
            
            anchorAttrs.addHref("href", navCfg.get("href", "#"));
            iconAttrs.addClass(navCfg.get("icon", String.class));
            
            String navView = navCfg.get("view", nav.getName());
            anchorAttrs.add("data-view", navView);

            if (count == 0 && active == null) {
                anchorAttrs.addClass("active");
            } else if (navView.equals(active)) {
                anchorAttrs.addClass("active");
            }

            count++;
            %><a <%= anchorAttrs.build() %>><i <%= iconAttrs.build() %>><%= navCfg.get("name", nav.getName()) %></i></a><%
        }
    %></nav>
</div>
<%
    // create groups
    count = 0;
    for (Iterator<Resource> it = cfg.getItems(); it.hasNext();) {
        Resource nav = it.next();
        Config navCfg = new Config(nav);
        
        AttrBuilder anchorAttrs = new AttrBuilder(request, xssAPI);
        
        anchorAttrs.addClass("rail-view group");
        
        String navView = navCfg.get("view", nav.getName());
        anchorAttrs.add("data-view", navView);
        
        if (count == 0 && active == null) {
            anchorAttrs.addClass("active");
        } else if (navView.equals(active)) {
            anchorAttrs.addClass("active");
        }
        
        String navResourceType = navCfg.get("sling:resourceType", "granite/ui/components/foundation/contsys");
    
        count++;
        %><div <%= anchorAttrs.build() %>>
            <sling:include path="<%= nav.getPath() %>" resourceType="<%= navResourceType %>" />
        </div><%
    }
%>
