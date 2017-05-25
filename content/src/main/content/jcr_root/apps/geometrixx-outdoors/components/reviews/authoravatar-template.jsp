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
%><%@include file="/libs/social/commons/commons.jsp"%><%
%><%@ page import="com.adobe.cq.social.commons.Comment,
                    com.adobe.cq.social.commons.CollabUser,
                    com.adobe.cq.social.commons.CollabUtil" %><%
%><%
    final Comment post = resource.adaptTo(Comment.class);
    final String badgePath= currentPage.getPath() + "/jcr:content/badge";
    if (null != post) {
        final CollabUser creator = post.getAuthor();
%>
        <div class="forum_userinfo">
            <div class="avatar">
                <a href="<%=xssAPI.getValidHref(socialProfileUrl)%>"><img src="<%= xssAPI.getValidHref(resourceAuthorAvatar) %>" <%
                        %>alt="<%= xssAPI.encodeForHTMLAttr(resourceAuthorName) %>" <%
                        %>title="<%= xssAPI.encodeForHTMLAttr(resourceAuthorName) %>"/></a>
            </div>
        </div>
    <%}%>
