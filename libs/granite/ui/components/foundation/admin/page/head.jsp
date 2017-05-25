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
%><%@page import="com.adobe.granite.i18n.LocaleUtil"%><%
%><%@include file="/libs/granite/ui/global.jsp"%><%
%><head>
    <meta charset="utf-8">
    <title><sling:include replaceSelectors="title" /></title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
    <meta http-equiv="X-UA-Compatible" content="chrome=1" />
    <sling:include path="<%= resource.getPath() + "/head" %>" resourceType="granite/ui/components/foundation/contsys" />
    
    <ui:includeClientLib categories="granite.utils" />
    <script>
        Granite.I18n.init({
            locale: "<%= LocaleUtil.toRFC4646(request.getLocale()).toLowerCase() %>",
            urlPrefix: "<%= request.getContextPath() %>/libs/cq/i18n/dict."
        });
    </script>
    <ui:includeClientLib categories="granite.ui.foundation, granite.ui.foundation.admin" />
</head>
