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
<%@include file="/libs/foundation/global.jsp" %><%
%><%@page session="false" %>
<body >
    <div class="fullpage-ad-portrait">
        <cq:include path="adPortraitPar" resourceType="geometrixx-unlimited/components/advertisement-portrait" />
    </div>
    <div class="fullpage-ad-landscape">
        <cq:include path="adLandscapePar" resourceType="geometrixx-unlimited/components/advertisement-landscape" />
    </div>
</body>