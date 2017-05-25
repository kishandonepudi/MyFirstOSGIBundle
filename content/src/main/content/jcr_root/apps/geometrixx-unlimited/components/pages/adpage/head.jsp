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
%><%@ page session="false"
           import="com.day.cq.commons.Doctype,
                   org.apache.commons.lang3.StringEscapeUtils" %><%
    String xs = Doctype.isXHTML(request) ? "/" : "";
    String favIcon = currentDesign.getPath() + "/favicon.ico";
    if (resourceResolver.getResource(favIcon) == null) {
        favIcon = null;
    }
%>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8"<%=xs%>>
    <meta http-equiv="keywords" content="<%= StringEscapeUtils.escapeHtml4(WCMUtils.getKeywords(currentPage, false)) %>"<%=xs%>>
    <meta http-equiv="description" content="<%= StringEscapeUtils.escapeHtml4(properties.get("jcr:description", "")) %>"<%=xs%>>
    <cq:include script="headlibs.jsp"/>
    <cq:include script="/libs/wcm/core/components/init/init.jsp"/>
    <cq:include script="stats.jsp"/>
    <% if (favIcon != null) { %>
    <link rel="icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>"<%=xs%>>
    <link rel="shortcut icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>"<%=xs%>>
    <% } %>
    <title><%= currentPage.getTitle() == null ? StringEscapeUtils.escapeHtml4(currentPage.getName()) : StringEscapeUtils.escapeHtml4(currentPage.getTitle()) %></title>
    <style type="text/css">
    div.fullpage-ad-landscape .ad-ipad-landscape {
        width:1024px;
    }
    
    div.fullpage-ad-portrait .ad-ipad-portrait {
        width:768px;
    }
    div.fullpage-ad-portrait .ad-ipad-portrait, div.fullpage-ad-landscape .ad-ipad-landscape{    
        display:block;
        max-width:100%;
        max-height:100%;
    }
    div.image {
        margin-bottom: 0px;
        overflow: hidden;
    }
    
    </style>
</head>