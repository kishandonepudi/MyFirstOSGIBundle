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
    java.text.MessageFormat,
    java.util.HashMap,
    java.util.Map,
    com.adobe.cq.commerce.api.CommerceService,
    com.adobe.cq.commerce.api.CommerceSession,
    com.adobe.cq.commerce.api.Product,
    com.adobe.cq.commerce.api.promotion.Promotion,
    com.adobe.cq.commerce.api.promotion.PromotionHandler,
    com.adobe.cq.commerce.common.AbstractJcrCommerceSession,
    com.adobe.cq.commerce.common.CommerceHelper,
    com.adobe.cq.commerce.common.promotion.PerfectPartnerPromotionHandler,
    com.day.cq.i18n.I18n" %><%

    I18n i18n = new I18n(slingRequest);

    String backgroundImage = properties.get("backgroundImage", String.class);
    if (backgroundImage != null) {
        backgroundImage = resourceResolver.map(request, backgroundImage);
    }

    CommerceService commerceService = resource.adaptTo(CommerceService.class);
    CommerceSession commerceSession = commerceService.login(slingRequest, slingResponse);

    Map<String, String> potentials = new HashMap<String, String>();
    if (commerceSession instanceof AbstractJcrCommerceSession) {
        java.util.List<Promotion> promos = ((AbstractJcrCommerceSession) commerceSession).getActivePromotions();
        for (Promotion p : promos) {
            PromotionHandler ph = p.adaptTo(PromotionHandler.class);
            if (ph instanceof PerfectPartnerPromotionHandler) {
                ((PerfectPartnerPromotionHandler) ph).getPotentials(commerceSession, p, potentials);
            }
        }
    }

    if (request.getAttribute("teaserPageRendering") != null) {
        potentials.put("teaserPageMode", "teaserPageMode");
    }

    if (!potentials.isEmpty()) {
%>
<div class="cross-sell-products" style="background: url('<%= backgroundImage %>') left top repeat-x">
    <h3><%= xssAPI.encodeForHTML(properties.get("heading", "")) %></h3>
    <%
        for (Map.Entry<String, String> potential : potentials.entrySet()) {
            String referenceTitle = "{" + i18n.get("Reference Product") + "}";
            String crossSellTitle = "{" + i18n.get("Cross-sell Product") + "}";
            String crossSellUrl = "";
            String imageUrl = "/libs/cq/ui/resources/0.gif";
            String imageClass = "cq-teaser-placeholder";

            if (!potential.getKey().equals("teaserPageMode")) {
                Page page1 = pageManager.getPage(potential.getKey());
                Page page2 = pageManager.getPage(potential.getValue());
                Product referenceProduct = page1 != null ? CommerceHelper.findCurrentProduct(page1) : null;
                Product crossSellProduct = page2 != null ? CommerceHelper.findCurrentProduct(page2) : null;
                if (referenceProduct == null || crossSellProduct == null) {
                    continue;
                }
                referenceTitle = referenceProduct.getTitle();
                crossSellTitle = crossSellProduct.getTitle();
                crossSellUrl = potential.getValue() + ".html";
                // get a transparent thumbnail so we can composite it nicely over the background:
                imageUrl = crossSellProduct.getImageUrl();
                imageUrl += ".thumbnail.140.transparent.gif";
                imageClass = "";
            }
    %>
    <a class="cross-sell-teaser" href="<%= xssAPI.getValidHref(crossSellUrl) %>">
        <p class="description"><%= xssAPI.encodeForHTML(MessageFormat.format(properties.get("message", ""), "", referenceTitle, crossSellTitle)) %></p>
        <img class="product <%= imageClass %>" src="<%= xssAPI.encodeForHTMLAttr(imageUrl) %>" alt="" />
        <p class="call-to-action"><%= xssAPI.encodeForHTML(properties.get("calltoaction", ""))%></p>
    </a>
    <%
        }
    %>
</div>
<%
    }
%>