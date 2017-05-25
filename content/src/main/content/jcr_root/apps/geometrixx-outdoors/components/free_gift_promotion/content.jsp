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
%><%@page contentType="text/html" pageEncoding="utf-8" import="
      com.adobe.cq.commerce.api.Product,
      com.adobe.cq.commerce.common.CommerceHelper,
      com.day.cq.i18n.I18n,
      com.day.cq.wcm.api.WCMMode,
      com.day.cq.wcm.api.components.DropTarget" %><%
%><%@include file="/libs/foundation/global.jsp"%><%
    I18n i18n = new I18n(slingRequest);

    String pagePath = properties.get("giftProductPath", String.class);
    Page productPage = pagePath != null ? pageManager.getPage(pagePath) : null;
    Product product = productPage != null ? CommerceHelper.findCurrentProduct(productPage) : null;

%>
<h2 class="no-icon"><%= i18n.get("Free Gift Configuration")%></h2>
<ul>
    <li><div class="product-pairing-label"><%= i18n.get("Gift Product: ") %></div>
        <div class="<%= DropTarget.CSS_CLASS_PREFIX %>product li-bullet product-pairing"> <%
            if (product != null) { %>
            <img src="<%= xssAPI.getValidHref(product.getThumbnailUrl(80)) %>" width="80" height="60" alt="<%= xssAPI.encodeForHTMLAttr(product.getTitle()) %>"/>
            <div>
                <strong><%= xssAPI.encodeForHTML(product.getTitle()) %></strong><br/>
                <%= xssAPI.encodeForHTML(product.getSKU()) %>
            </div> <%
            } else if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
                if (pagePath != null) { %>
            <img src="/libs/cq/ui/resources/0.gif" class="cq-product-not-found" alt=""> <div  class="cq-product-not-found"><%= i18n.get("Catalog page not found.") %></div> <%
            } else { %>
            <img src="/libs/cq/ui/resources/0.gif" class="cq-reference-placeholder" alt=""> <%
                    }
                } %>
        </div>
    </li>
</ul>
