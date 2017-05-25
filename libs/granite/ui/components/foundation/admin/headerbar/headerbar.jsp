<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%@page session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><header class="top">
    <div class="logo"><a href="<%= request.getContextPath() %>/"><img alt="logo" src="<%= request.getContextPath() %>/libs/granite/ui/components/foundation/admin/clientlibs/admin/css/resources/mc_logo.png"></a></div>
    <sling:include path="<%= resource.getPath() %>" resourceType="granite/ui/components/foundation/contsys" />
    <sling:include path="/libs/granite/ui/content/userproperties-activator" resourceType="/libs/granite/ui/components/foundation/admin/userproperties-activator" />
</header>
