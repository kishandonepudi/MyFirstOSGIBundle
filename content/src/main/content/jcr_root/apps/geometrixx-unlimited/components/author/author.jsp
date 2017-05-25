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
--%><%@include file="/apps/geometrixx-unlimited/global.jsp"%><%
%><%@page session="false" %>
<%
      ValueMap vm = currentPage.getProperties();
      String byLine = vm.get("dps-author",i18n.get("by Anonymous"));
%>
<div class="author-details">
    <div class="author-name"><%= xssAPI.encodeForHTMLAttr(byLine) %></div>
</div>