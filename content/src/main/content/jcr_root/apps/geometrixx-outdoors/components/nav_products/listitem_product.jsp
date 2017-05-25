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
    com.adobe.cq.commerce.api.CommerceSession,
    com.adobe.cq.commerce.common.CommerceHelper,
    com.adobe.cq.commerce.api.Product,
    info.geometrixx.commons.util.GeoHelper,
    com.adobe.cq.commerce.api.CommerceService" %><%

    CommerceService commerceService = resource.adaptTo(CommerceService.class);
    CommerceSession session = commerceService.login(slingRequest, slingResponse);

    final Page listItem = (Page)request.getAttribute("listitem");
    final Product product = CommerceHelper.findCurrentProduct(listItem);
    if (product != null) {
        final ValueMap productProperties = product.adaptTo(ValueMap.class);
        final String pagePath = listItem.getPath();
        final String imagePath = product.getImageUrl() + ".nav.jpg";
        final String title = product.getTitle();
        final String price = session.getProductPrice(product);

%><li>
    <a href="<%= xssAPI.getValidHref(pagePath) %>.html" title="<%= xssAPI.encodeForHTMLAttr(title) %>"
       onclick="CQ_Analytics.record({event: 'listItemClicked', values: { listItemPath: '<%= xssAPI.encodeForJSString(pagePath) %>' }, collect: false, options: { obj: this }})">
        <img src="<%= xssAPI.getValidHref(imagePath) %>" width="160" height="120" alt="<%= xssAPI.encodeForHTMLAttr(title) %>"/>
        <h4><%= xssAPI.encodeForHTML(title) %></h4>
        <% if (GeoHelper.notEmpty(price)) { %> <p><%= xssAPI.encodeForHTML(price) %></p><% } %>
    </a>
</li><%

    }

%>