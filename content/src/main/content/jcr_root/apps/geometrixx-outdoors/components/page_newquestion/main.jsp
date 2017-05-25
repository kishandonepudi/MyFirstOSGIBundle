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
%><%@ include file="/libs/social/commons/commons.jsp" %><%
%><%@ page import="com.adobe.cq.social.forum.api.Forum,
                   com.adobe.cq.social.forum.api.ForumUtil"%><%
%><%@ page contentType="text/html; charset=utf-8" %>
<div class="page-header-content page-header">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/><%
    final Forum forum = resource.adaptTo(Forum.class);
    
    if (!ForumUtil.mayPost(resourceResolver, forum)) {
        %><div class="login"><%= xssAPI.encodeForHTML(StringUtils.defaultIfEmpty(forum.getNoPermissionText(), i18n.get("Sign in in order to ask a question."))) %></div><%
    }
    else{
        %>
    <section class="page-par-left">
        <div class=new-question-title>
            <text id="newQuestion">New Question</text>
        </div>
        <cq:include path="par" resourceType="foundation/components/parsys"/>
    </section>
    <aside class="page-aside-right">
        <cq:include path="sidebar" resourceType="foundation/components/iparsys"/>
    </aside>
    <%
    }
    %>
</div>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>