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
<%--

    Topic Component

    This template is used to list one topic.  It is used by the Forum
    component to render each topic in a list.  It could be used to
    create a topic creation flow that did not refresh the forum page.
    If you want to change how a Topic looks in a list just add a file 
    at:
    /apps/social/forum/components/topic/listitem-template.jsp
--%>
<%
%><%@ page import="com.adobe.cq.social.forum.api.Post,
                    com.day.cq.tagging.Tag,
                    com.day.cq.commons.jcr.JcrUtil" %><%
%><%@include file="/libs/social/commons/commons.jsp" %><%
    final Post topic = resource.adaptTo(Post.class);
    final Post latestPost = topic.getLatestPost();
    String latestUrlPrefix = "";
    String latestUrlSuffix = "";

    if (null != latestPost) {
        latestUrlPrefix = "<a href=\"" + latestPost.getUrl() + "\">";
        latestUrlSuffix = "</a>";
    }
%><sling:include path="." replaceSelectors="modtag-template"/>
    <div class="avatar-column">
        <a href="<%=xssAPI.getValidHref(socialProfileUrl)%>"><img style="width:32px;height:32px" src="<%=xssAPI.getValidHref(resourceAuthorAvatar)%>" alt="<%=xssAPI.encodeForHTMLAttr(resourceAuthorName)%>" title="<%=xssAPI.encodeForHTMLAttr(resourceAuthorName)%>"/></a>
    </div>
    <div class="info-column topic">
        <p class="subject"><a name="<%=xssAPI.encodeForHTMLAttr(topic.getId())%>"></a><a class="post-link" href="<%=xssAPI.getValidHref((isCORS)?externalizer.absoluteLink(slingRequest, slingRequest.getScheme(),topic.getUrl()):topic.getUrl())%>"><%=xssAPI.encodeForHTML(topic.getSubject())%></a></p>
        <p class="lastpost">
            <span class="user"><%=xssAPI.filterHTML(topic.getModifiedBy().getFullName())%></span>
            <span class="time"><%=latestUrlPrefix%><%=fmt.format(topic.getModified().getTime(), true)%><%=latestUrlSuffix%></span>
        </p>
        <p class="post-summary"><%= xssAPI.filterHTML(topic.getMessage()) %></p>
    </div>
    <div class="detail-column">
        <p class="replies"><%=topic.getRepliesCount()%></p>
        <sling:include path="<%=topic.getPath()%>" replaceSelectors="tags"/>
    </div>
<div style="clear:both"/>