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
%><%@include file="/libs/foundation/global.jsp" %><%
%><%@ page session="false"
           import="com.adobe.cq.media.publishing.dps.DPSArticle" %>
<%
DPSArticle article = currentPage.adaptTo(DPSArticle.class);
String category = article==null? "":xssAPI.encodeForHTML(article.getKicker());
%>
<div class="article-category"><span><%= category %></span></div>
<div class="category-trim">&nbsp;</div>
<cq:include path="article-image" resourceType="geometrixx-unlimited/components/image"/>
<div class="title-and-author">
    <cq:include path="article-title" resourceType="geometrixx-unlimited/components/title"/>
</div>