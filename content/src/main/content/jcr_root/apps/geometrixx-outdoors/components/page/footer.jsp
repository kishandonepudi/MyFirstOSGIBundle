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
    com.day.cq.i18n.I18n,
    java.util.Calendar"
%><%

    final I18n i18n = new I18n(slingRequest);
    final String year = String.valueOf(Calendar.getInstance().get(Calendar.YEAR));

%>
<footer>
    <nav><cq:include path="toolbar" resourceType="foundation/components/toolbar"/></nav>
    <p class="copyright"><%= xssAPI.filterHTML(i18n.get("&copy; {0} Geometrixx Outdoors. All rights reserved.", null, year)) %></p>
</footer>