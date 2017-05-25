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
    org.apache.commons.lang3.StringEscapeUtils"
%><%

    String className = component.getProperties().get("className", "");
    pageContext.setAttribute("className", StringEscapeUtils.escapeHtml4(className));

%>
<body class="${className}">
    <cq:include path="clientcontext" resourceType="cq/personalization/components/clientcontext"/>
    <div id="main" class="page-main">
        <cq:include script="main.jsp"/>
    </div>
    <cq:include path="timing" resourceType="foundation/components/timing"/>
    <cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>