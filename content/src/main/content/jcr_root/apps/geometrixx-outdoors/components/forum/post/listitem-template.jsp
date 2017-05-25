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

    This template is used to list one topic.  It is used by the Forum component to render each topic in a list.  It
     could be used to create a topic creation flow that did not refresh the forum page.  If you want to change how a
      Topic looks in a list just add a file at:
--%>
<%
%><%@ page import="com.adobe.cq.social.forum.api.Post,
                   com.adobe.cq.social.forum.api.Forum,
                   com.day.cq.tagging.Tag"%>
<%@include file="/libs/social/commons/commons.jsp"%>
<%
    final Post post = resource.adaptTo(Post.class);
    final Post topic = resourceResolver.getResource(post.getTopic().getPath()).adaptTo(Post.class);

    final Forum forum = topic.getForum();
    final Resource res = resourceResolver.getResource(forum.getPath());

    final boolean allowThreadedReplies =  (res == null) ? false :
            res.adaptTo(ValueMap.class).get("allowReplyThread", false);

    final Post latestPost = topic.getLatestPost();
    String latestUrlPrefix = "";
    String latestUrlSuffix = "";

    if (null != latestPost) {
        latestUrlPrefix = "<a href=\"" + latestPost.getUrl() + "\">";
        latestUrlSuffix = "</a>";
    }


    if (null != post) {

        final String opClass = null != topic && post.getModifiedBy().equals(topic.getCreatedBy()) ? " op" : "";
    %><a name="<%= xssAPI.encodeForHTMLAttr(post.getId()) %>"></a>
    <sling:include path="<%=post.getPath()%>" replaceSelectors="modtag-template" />
    <div class="message<%=opClass%>">
        <div class="avatar-column">
            <sling:include resourceType="geometrixx-outdoors/components/forum/post" path="." replaceSelectors="authoravatar-template"/>
        </div>
        <div class="info-column">
            <%if(post.getCreated().getTime()==post.getSelfModified().getTime()){
                %><p class="time" title="<%=localizedDateFormatter.format(post.getCreated())%>"><%= i18n.get("Created") %>&nbsp;<%=fmt.format(post.getCreated().getTime(), true)%>
                </p><%  
            } else { 
                %><p class="time" title="<%=localizedDateFormatter.format(post.getCreated())%>"><%= i18n.get("Created") %>&nbsp;<%=fmt.format(post.getCreated().getTime(), true)%>,
                        <%= i18n.get("edited") %>&nbsp;<%=fmt.format(post.getSelfModified().getTime(), true)%>
                </p>
            <%}%>
            <p class="text"><%= xssAPI.filterHTML(post.getMessage()) %></p>
            <div class="attachments"><sling:include resourceType="geometrixx-outdoors/components/commons/comments/comment" path="." replaceSelectors="attachments"/></div>
            <div style="clear:both"></div><div class="toolbar-container">
                <cq:include script="toolbar-template.jsp" />
            </div>
        </div>
    </div><%
        if(allowThreadedReplies) {
            %><cq:include script="replies.jsp"/><%
            
        }
    } else {
        log.warn("resource couldn't be adapted to post at [{}].", resource.getPath());
    }
%>
