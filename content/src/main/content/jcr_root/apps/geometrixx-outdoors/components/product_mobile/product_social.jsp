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
%><%@ page contentType="text/html; charset=utf-8" %><%
    String productTrackingPath = (String) request.getAttribute("cq.commerce.productTrackingPath");
    String productPagePath = (String) request.getAttribute("cq.commerce.productPagePath");
    productPagePath = productPagePath.substring(0, productPagePath.lastIndexOf("."));
%>
<div class="product-social">
    <cq:include path="<%=productTrackingPath + "/jcr:content/rating"%>" resourceType="social/tally/components/rating"/>
    <cq:include path="<%= productPagePath + "/twitter_share" %>" resourceType="social/plugins/twitter/twittershare"/>
</div>
