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
--%>
<%@include file="/libs/foundation/global.jsp"%><%
%><%@page session="false" %>
<%
    String teaser = pageProperties.get("jcr:description", "");
%>
<div class="article-primary-title"><cq:include path="article-title" resourceType="foundation/components/title"/></div>
<div class="article-teaser"><%= xssAPI.encodeForHTML(teaser) %></div>
<cq:include path="article-author" resourceType="geometrixx-unlimited/components/author"/>