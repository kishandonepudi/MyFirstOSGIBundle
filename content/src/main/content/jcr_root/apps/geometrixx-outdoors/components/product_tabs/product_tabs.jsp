<%--
  ADOBE CONFIDENTIAL
  __________________

   Copyright 2012 Adobe Systems Incorporated
   All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
%><%@ page contentType="text/html; charset=utf-8" import="
    com.adobe.cq.commerce.api.Product,
    com.adobe.cq.commerce.common.CommerceHelper,
    com.day.cq.i18n.I18n,
    java.util.List,
    java.util.ArrayList"
%><%

    Product currentProduct = CommerceHelper.findCurrentProduct(currentPage);
    final I18n i18n = new I18n(slingRequest);
    String[] tabs = properties.get("tabs", String[].class);

    List<String> tabTitles = new ArrayList<String>();
    List<String> tabContents = new ArrayList<String>();

    for (int i = 0; tabs != null && i < tabs.length; i++) {
        String[] parts = tabs[i].split("=", 2);
        if (parts.length == 2) {
            String title = parts[1];
            String propName = parts[0].trim();
            String propValue = currentProduct != null ? currentProduct.getProperty(propName, String.class) : null;
            tabTitles.add(i18n.getVar(title));
            if (propValue == null) {
                tabContents.add(i18n.get("N/A"));
            } else {
                tabContents.add(propValue);
            }
        }
    }

    // Create a unique name based on the component path, this will make it possible to have several tab components on the same page without conflicting IDs
    final String basePath = resource.getPath();
    final String tabRelativePath = basePath.substring(currentPage.getContentResource().getPath().length()+1);
    final String tabUniqueName = tabRelativePath.replaceAll("[^/a-zA-Z0-9]", "-").replaceAll("/", "_");

%>
<header class="tabctrl-header"><ul>
<% for (int i = 0; i < tabTitles.size(); i++) { %>
    <li><a href="#<%= tabUniqueName+"-"+i %>"><%= xssAPI.encodeForHTML(tabTitles.get(i)) %></a></li><%
} %>
    <li><a href="#reviews">Reviews</a></li>
</ul></header>
<div class="tabctrl-container">
    <% for (int i = 0; i < tabTitles.size(); i++) { %>
    <section id="<%= tabUniqueName+"-"+i %>" class="tabctrl-content" data-path="<%= xssAPI.getValidHref(basePath+"/tab-"+i) %>">
        <h2 class="tabctrl-title"><%= xssAPI.encodeForHTML(tabTitles.get(i)) %></h2>
        <%= xssAPI.filterHTML(tabContents.get(i)) %>
    </section>
<% } %>
    <section id="reviews" class="tabctrl-content">
        <h2 class="tabctrl-title">Product Summary</h2>        
            <cq:include path="ratings" resourceType="geometrixx-outdoors/components/reviews"/>
    </section>
</div>