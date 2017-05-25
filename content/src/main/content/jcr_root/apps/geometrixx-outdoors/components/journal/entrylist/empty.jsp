<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2011 Adobe Systems Incorporated
  All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.

  ==============================================================================

  Blog: List component sub-script override

--%><%@ page import="com.day.cq.i18n.I18n,
                     com.adobe.cq.social.blog.Blog" %>
<%
%><%@include file="/libs/foundation/global.jsp"%><%
    String query = request.getParameter(Blog.PARAM_QUERY);
%><h3 class="pagetitle"><%= I18n.get(slingRequest.getResourceBundle(currentPage.getLanguage(true)), "Welcome to this new community! Be the first to introduce yourself or tell a story by posting to the journal.") %></h3>
<span record="'blogSearchNoresults', {'blogSearchKeyword': '<%= xssAPI.encodeForJSString(query) %>', 'blogSearchResults':'zero'}"></span>
