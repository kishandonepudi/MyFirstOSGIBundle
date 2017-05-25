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
%><%@page session="false" %>
<body>

    <cq:include path="clientcontext" resourceType="geometrixx-media/personalization/components/clientcontext"/>

    <div class="media-page-header">
        <div class="container">
            <cq:include script="header.jsp" />
        </div>
    </div>
    <div class="media-page-content">
        <div class="container">
            <cq:include script="content.jsp" />
        </div>
    </div>
    <div class="media-page-footer">
        <div class="container">
            <cq:include script="footer.jsp" />
        </div>
    </div>

    <cq:include path="timing" resourceType="foundation/components/timing"/>
    <cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>