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
%><%@ page contentType="text/html; charset=utf-8" %>
<div class="page-header-content">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content <%= currentPage.getName() %>">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/>
    <section class="page-par left">
        <cq:include path="par" resourceType="foundation/components/parsys"/>
    </section>
    <aside class="page-aside right par">
        <cq:include path="sidebar" resourceType="foundation/components/parsys"/>
    </aside>
</div>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>