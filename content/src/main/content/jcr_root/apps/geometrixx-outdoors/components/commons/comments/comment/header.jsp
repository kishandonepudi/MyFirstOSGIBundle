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

  ==============================================================================

  Comment component sub-script

  Draws the comment header.

--%><%@ page import="java.text.DateFormat,
                     com.day.cq.commons.Externalizer,
                     com.day.cq.i18n.I18n,
                     com.adobe.cq.social.commons.Comment,
                     com.adobe.cq.social.commons.CommentSystem,
                     com.adobe.cq.social.commons.CollabUser,
                     com.day.cq.commons.date.DateUtil,
                     java.util.Locale,
                     com.adobe.cq.social.commons.CollabUtil,
                     javax.jcr.Session,
                     javax.jcr.Node,
                     org.apache.sling.api.resource.Resource,
                     org.apache.sling.api.scripting.SlingScriptHelper" %>
<%@include file="/libs/social/commons/commons.jsp"%><%


    SlingScriptHelper scriptHelper = bindings.getSling();

    Comment comment = resource.adaptTo(Comment.class);
    CommentSystem cs = comment.getCommentSystem();

    String id = comment.getId();

    CollabUser author = comment.getAuthor();

    //resolve name
    String authorName = resourceAuthorName;
    String authorImg = resourceAuthorAvatar;

  %><div class="avatar-column">
        <div
            class="comment-header-avatar"
            onclick="document.getElementById('<%= xssAPI.encodeForHTMLAttr(id) %>-avatar').style.display='inline';"><%
            %><img
                   id="<%= xssAPI.encodeForHTMLAttr(id) %>-avatar"
                   src="<%= xssAPI.getValidHref(authorImg) %>"
                   alt="<%= xssAPI.encodeForHTMLAttr(authorName) %>"
                   title="<%= xssAPI.encodeForHTMLAttr(authorName) %>"
                   style="width:auto;height:auto;display:none;position:absolute;float:right;"
                   onmouseout="this.style.display='none';"><%
            %><img src="<%= xssAPI.getValidHref(authorImg) %>" alt="<%= xssAPI.encodeForHTMLAttr(authorName) %>"><%
        %></div>
    </div>

