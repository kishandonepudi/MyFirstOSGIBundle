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
<header>
    <div class="nav-buttons">
        <a id="nav-button-userinfo" href="#userinfo"><span>User</span></a>
        <a id="nav-button-search" href="#search"><span>Search</span></a>
    </div>
    <cq:include path="topnav" resourceType="geometrixx-outdoors/components/page/topnav"/>
    <cq:include path="userinfo" resourceType="geometrixx-outdoors/components/page/userinfo"/>
    <cq:include path="search" resourceType="geometrixx-outdoors/components/page/search"/>
</header>