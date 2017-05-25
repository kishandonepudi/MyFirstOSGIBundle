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
%><%@include file="/apps/geometrixx-media/global.jsp" %><%
%><%@page session="false" %><%
    ValueMap vm = currentPage.getProperties();
    String title = vm.get("jcr:title", "");
    String subtitle = vm.get("subtitle", "");
%>

<div class="row-fluid">
    <span class="span5 title"><%= xssAPI.encodeForHTML(title) %></span>
    <span class="span7 subtitle"><%= xssAPI.encodeForHTML(subtitle) %></span>
</div>
<div class="row-fluid">
    <hr class="span12 stripeHr"/>
</div>