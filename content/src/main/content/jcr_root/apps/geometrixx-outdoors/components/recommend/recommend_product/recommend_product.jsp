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
    java.util.Iterator,
    org.apache.commons.lang3.StringEscapeUtils,
    org.apache.sling.api.resource.Resource,
    org.apache.sling.api.resource.ResourceUtil,
    com.day.cq.wcm.api.PageManager,
    com.day.cq.wcm.api.WCMMode,
    com.day.cq.wcm.api.components.DropTarget,
    com.adobe.cq.commerce.api.*"
%><%

    String ddClassName = DropTarget.CSS_CLASS_PREFIX + "page";

    String path = properties.get("./path",String.class);
    Resource ref = path != null ? resourceResolver.getResource(path) : null;

    // find product resource
    Product product = null;
    if(ref != null) {
        Iterator<Resource> iter = ref.getChild("jcr:content/par").listChildren();
        while(iter.hasNext()) {
            Resource r = iter.next();
            if(ResourceUtil.isA(r, "commerce/components/product")) {
                product = r.adaptTo(Product.class);
                break;
            }
        }
    }
    
    if(product != null) {
        InheritanceValueMap productProperties = product.adaptTo(InheritanceValueMap.class);

        // set title and description
        String title = productProperties.getInherited(NameConstants.PN_TITLE, "");
        String description = productProperties.getInherited(NameConstants.PN_DESCRIPTION, "");

        // set image path
        String imagePath = product.getImageUrl();
        if(imagePath.indexOf(".") == -1) {
            imagePath += ".banner.jpg";
        }
        
        // set price info
        CommerceSession cs = ref.adaptTo(CommerceService.class).login(slingRequest, slingResponse);
        String price = cs.getProductPrice(product);

        // set target path
        PageManager pm = resourceResolver.adaptTo(PageManager.class);
%>
<a href="<%=request.getContextPath() + path%>.html">
    <img src="<%=imagePath%>" width="146" height="146" alt="" />
    <div class="description">
        <p><span><%=
            StringEscapeUtils.escapeHtml4(title != null ? title : "")
        %></span> <strong><%=
            StringEscapeUtils.escapeHtml4(price)
        %></strong></p>
        <span class="bg"></span>
    </div>
    <span class="inset-shadow"></span>
</a>
<script>
jQuery(function($) {
    var isMobile = $("body").is(".page-mobile");
    $(".recommend_product:last").closest(".campaign").addClass(isMobile ? "campaign-products-mobile" : "campaign-products");
});
</script>
<%

    } else {
        if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
            %><p><img src="/libs/cq/ui/resources/0.gif" class="cq-reference-placeholder <%= ddClassName %>" alt=""></p><%
        }
    }

%>