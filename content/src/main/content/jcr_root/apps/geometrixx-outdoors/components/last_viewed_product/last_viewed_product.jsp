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
    com.adobe.cq.commerce.api.CommerceService,
    com.adobe.cq.commerce.api.Product,
    com.adobe.cq.commerce.common.CommerceHelper,
    com.day.cq.wcm.api.Page" %><%

    CommerceService commerceService = resource.adaptTo(CommerceService.class);

    String pagePath = properties.get("defaultProductPagePath", String.class);
    Page productPage = pagePath != null ? pageManager.getPage(pagePath) : null;
    Product defaultProduct = productPage != null ? CommerceHelper.findCurrentProduct(productPage) : null;

    String backgroundImage = properties.get("backgroundImage", String.class);
    if (backgroundImage != null) {
        backgroundImage = resourceResolver.map(request, backgroundImage);
    }

    String suffix = resource.getPath().replaceAll("/","-").replaceAll(":","-");
    String anchorId = "last-viewed-teaser-" + suffix;
    String imageId = "product-" + suffix;
    String messageId = "message-" + suffix;

%>
<script type="text/javascript">
    $CQ(document).ready(function() {
        var productPath = "<%= pagePath %>.html";
        var imagePath = "<%= xssAPI.encodeForJSString(defaultProduct == null ? "" : defaultProduct.getImageUrl()) %>";
        var productTitle = "<%= xssAPI.encodeForJSString(defaultProduct == null ? "" : defaultProduct.getTitle()) %>";
    <% if (request.getAttribute("teaserPageRendering") == null) { %>
        if (CQ_Analytics.ViewedProducts) {
            var lastProduct = CQ_Analytics.ViewedProducts.mostRecentNotInCart();
            if (lastProduct) {
                productPath = lastProduct.path;
                imagePath = lastProduct.image;
                productTitle = lastProduct.title;
            }
        }
    <% } %>
        document.getElementById("<%= xssAPI.encodeForJSString(anchorId) %>").setAttribute("href", CQ.shared.HTTP.externalize(productPath));
        document.getElementById("<%= xssAPI.encodeForJSString(imageId) %>").setAttribute("src", CQ.shared.HTTP.externalize(imagePath) + ".thumbnail.140.transparent.gif");
        document.getElementById("<%= xssAPI.encodeForJSString(messageId) %>").innerHTML = "<%= xssAPI.encodeForJSString(properties.get("message", "")) %>".replace(/\{1\}/g, productTitle);
    });
</script>
<div class="last-viewed-product" style="background: url('<%= backgroundImage %>') left top repeat-x">
    <h3><%= xssAPI.encodeForHTML(properties.get("heading", "")) %></h3>
    <a class="last-viewed-teaser" id="<%= xssAPI.encodeForHTMLAttr(anchorId) %>" href="">
        <p class="description" id="<%= xssAPI.encodeForHTMLAttr(messageId) %>">&nbsp;</p>
        <img class="product" id="<%= xssAPI.encodeForHTMLAttr(imageId) %>" src="" alt="" />
        <p class="call-to-action"><%= xssAPI.encodeForHTML(properties.get("calltoaction", ""))%></p>
    </a>
</div>
