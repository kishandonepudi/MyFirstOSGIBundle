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

    This template is used to for a topic.  It renders a list of
    comments and a composer for the user to enter a new comment with.
    The topic then posts the comment to the server and recieves back a
    fully rendered comment based on the template passed in the Accept
    header.
    If you want to change how a Topic looks just add a file at:
    /apps/social/forum/components/topic/fullsize-template.GET.jsp
--%>
<%@include file="/libs/social/commons/commons.jsp" %>
<%@page import="com.adobe.cq.social.forum.api.Post,
                com.adobe.cq.social.forum.api.Forum,
                com.adobe.cq.social.forum.api.ForumUtil,
                java.util.List,
                org.apache.commons.collections.CollectionUtils,
                org.apache.commons.collections.Predicate,
                java.util.Collection,
                java.util.Iterator,
                org.apache.commons.lang3.StringEscapeUtils,
                com.day.cq.tagging.Tag,
                com.day.cq.commons.jcr.JcrUtil" %><%
    
    final Post topic = resource.adaptTo(Post.class);
    final Forum forum = topic.getForum();
    final String forumUrl = forum.getUrl();
    
    final Resource res = resourceResolver.getResource(forum.getPath());
        
    final int numberOfPosts = topic.getRepliesCount();
    final Boolean richTextEditorEnabled = topic.getForum().isRTEEnabled();
    final Boolean allowFileUploads = topic.getForum().allowFileUploads();
    final int fromValue = (null != fromParam)? Integer.parseInt(fromParam.getString()):0;
    int limitValue = ((null != fromParam) && (null != countParam))?Integer.parseInt(countParam.getString()):topic.getLimit();    
%>
    <a name="<%=xssAPI.encodeForHTMLAttr(topic.getId())%>"></a>
    <sling:include path="<%=topic.getPath()%>" replaceSelectors="modtag-template" />
    <div class="topic-top title section italic clearfix">
        <h1><%=xssAPI.filterHTML(StringEscapeUtils.escapeHtml4(topic.getSubject()))%></h1>
    </div>
    <div class="message">
        <div class="avatar-column">
            <sling:include resourceType="geometrixx-outdoors/components/forum/post" path="." replaceSelectors="authoravatar-template"/>
        </div>
        <div class="info-column"><%
            if(topic.getCreated().getTime()==topic.getSelfModified().getTime()){
                %><p class="time" title="<%=topic.getCreated()%>"><%= i18n.get("Created") %>&nbsp;<%=fmt.format(topic.getCreated().getTime(), true)%>

                </p><%  
            } else {
                %><p class="time" title="<%=topic.getCreated()%>"><%= i18n.get("Created") %>&nbsp;<%=fmt.format(topic.getCreated().getTime(), true)%>,
                    <%= i18n.get("edited") %>&nbsp;<%=fmt.format(topic.getSelfModified().getTime(), true)%>
                </p><%  
            }%>
            <sling:include resourceType="geometrixx-outdoors/components/commons/comments/comment" path="." replaceSelectors="attachments"/>
            <p class="text"><%= xssAPI.filterHTML(topic.getMessage()) %></p><%
            if(!topic.isClosed() && ForumUtil.mayPost(resourceResolver, forum)) {%>
                <div class="reply"><a href="#composer"><%=i18n.get("Reply")%></a></div><%
            }%>
            <div style="clear:both"></div>
            <div class="toolbar-container">
                <cq:include script="toolbar-template.jsp" />
            </div>
        </div>
    </div>
<ul class="commentsList"><%
        for (final com.adobe.cq.social.forum.api.Post comment : topic.getPosts(fromValue,limitValue)) {

            if (WCMMode.EDIT != wcmMode && !comment.isApproved()) {
                limitValue += 1;
                continue;
            }
            %><li><sling:include resourceType="geometrixx-outdoors/components/forum/post" path="<%=comment.getPath()%>" replaceSelectors="listitem-template"/></li><%
        }

%></ul><sling:include resourceType="geometrixx-outdoors/components/forum/forum/pagination" replaceSelectors="horizontalList-template"/>
    <a name="composer"></a><%
    if (ForumUtil.mayPost(resourceResolver, forum)) {%>
        <sling:include resourceType="geometrixx-outdoors/components/forum/topic/composer" replaceSelectors="simple-template"/><%
    } else {
        %><div><%= xssAPI.encodeForHTML(StringUtils.defaultIfEmpty(forum.getNoPermissionText(), i18n.get("Sign in in order to post to this forum."))) %></div><%
    }    
    if (forum.isFeedEnabled()) {
        final String suffix = topic.getPath();
            %><link rel="alternate" type="application/atom+xml" title="Atom 1.0 (List)" href="<%= xssAPI.getValidHref(topic.getPath() + ".feed") %>" /><%
    }
%><script>
    $CQ(function(){
        <%if( forum.isRTEEnabled()) {%>
        CQ.soco.commons.activateRTE($CQ("form.comment"));
        <%}%>CQ.soco.topic.numPosts = <%= topic.getRepliesCount()%>;
        CQ.soco.topic.attachToCommentComposer($CQ("form.comment"), $CQ(".commentsList"), $CQ(".stats"), "<%=resource.getPath()%>");
        CQ.soco.commons.attachToPagination($CQ("#pagination"), $CQ(".commentsList"), <%=fromValue%>, <%=limitValue%>, "<%=resource.getPath()%>");
        CQ.soco.comments.bindOnRemove($CQ(".commentsList"));
        CQ.soco.comments.bindOnAdded($CQ(".commentsList"));
        $CQ("div.message").first().bind(CQ.soco.comments.events.DELETE, function(event) {
            event.stopPropagation();
            $CQ.post($CQ(event.target).closest("form").attr("action"), function(data, textStatus, jqXHR){
                window.location = "<%=forumUrl%>";
            }); 
        });
    });    
</script>