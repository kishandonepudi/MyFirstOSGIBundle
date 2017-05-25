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
    /apps/social/qna/components/topic/fullsize-template.GET.jsp

--%>
<%@include file="/libs/social/commons/commons.jsp" %>
<%@page import="com.adobe.cq.social.forum.api.Post,
                com.adobe.cq.social.forum.api.Forum,
                com.adobe.cq.social.forum.api.ForumUtil,
                com.adobe.cq.social.forum.api.RelatedSearchUtil,
                com.adobe.cq.social.qna.api.QnaPost,
                java.util.Iterator,
                java.util.List,
                com.day.cq.tagging.Tag" %>
                <cq:includeClientLib categories="cq.social.qna"/><%

    final Post topic = resource.adaptTo(Post.class);
    final Forum forum = topic.getForum();
    final String forumUrl = forum.getUrl();
    final boolean allowEdits = resourceResolver.resolve(forum.getPath())
            .adaptTo(ValueMap.class).get("allowEditComments", false);

    final Iterator<Post> posts = topic.getPosts();
    final int numberOfPosts = topic.getRepliesCount();
/*
    // To be removed:
                org.apache.commons.collections.CollectionUtils,
                org.apache.commons.collections.Predicate,
                java.util.Collection,

    final Collection filteredPosts = CollectionUtils.select(posts, new Predicate() {
        public boolean evaluate(final Object object) {
            final Post post = (Post) object;
            return WCMMode.EDIT == wcmMode || post.isApproved();
        }
    });
*/
    final Boolean richTextEditorEnabled = false; //per Lars' request //topic.getForum().isRTEEnabled();
    final Boolean allowFileUploads = topic.getForum().allowFileUploads();
    final int fromValue = (null != fromParam)? Integer.parseInt(fromParam.getString()):0;
    final int limitValue = ((null != fromParam) && (null != countParam))?Integer.parseInt(countParam.getString()):topic.getLimit();

    final QnaPost qnaTopic = resourceResolver.getResource(topic.getPath()).adaptTo(QnaPost.class);
    boolean isQuestionAnswered = qnaTopic.isAnswered();
    request.setAttribute("isQuestionAnswered", isQuestionAnswered);
    request.setAttribute(Forum.ATTRIBUTE_NAME_TOPIC, topic);

%>
    <a name="<%=xssAPI.encodeForHTMLAttr(topic.getId())%>"></a>
    <div class="topic-top title section italic clearfix">
        <h1><%=xssAPI.filterHTML(StringEscapeUtils.escapeHtml4(topic.getSubject()))%></h1><%
        if (!isQuestionAnswered && !topic.isClosed() && ForumUtil.mayPost(resourceResolver, forum)) {
            %>
        <button class="btn action new-thread"><a href="#composer-id"><%=i18n.get("Answer")%></a></button><%
        }%>
    </div>
    <sling:include path="<%=topic.getPath()%>" replaceSelectors="modtag-template"/>
        <div class="message">
            <div class="avatar-column">
                <sling:include path="." resourceType="geometrixx-outdoors/components/qna/post" replaceSelectors="authoravatar-template"/>
            </div>
            <div class="info-column"><%
                    if(topic.getCreated().getTime()==topic.getSelfModified().getTime()){
                %>
                    <p class="time" title="<%=localizedDateFormatter.format(topic.getCreated())%>"><%= i18n.get("Created") %>&nbsp;<%=fmt.format(topic.getCreated().getTime(), true)%></p>
                <%  } else { %>
                    <p class="time" title="<%=localizedDateFormatter.format(topic.getCreated())%>">
                        <%= i18n.get("Created") %> <%=fmt.format(topic.getCreated().getTime(), true)%>,
                        <%= i18n.get("edited") %> <%=fmt.format(topic.getSelfModified().getTime(), true)%></p>
                <%  } %>
                <sling:include resourceType="geometrixx-outdoors/components/commons/comments/comment" path="." replaceSelectors="attachments"/>
                <p class="text"><%= xssAPI.filterHTML(topic.getMessage()) %></p><%
                if(!isQuestionAnswered){
                    %><div class="toolbar-container"><sling:include path="<%=topic.getPath()%>" replaceSelectors="toolbar-template"/></div><%
                }
%>
                </div>
            </div>
            <!-- End .message -->

<%
        if (!ForumUtil.mayPost(resourceResolver, forum)) {
            %><div class="login"><%=StringUtils.defaultIfEmpty(forum.getNoPermissionText(),
                                                                                i18n.get("Sign in in order to submit an answer to this question."))%></div><%

        } else if (topic.isClosed()) {
            %><div class="status"><%=StringUtils.defaultIfEmpty(forum.getForumClosedText(),
                                                                                 i18n.get("This question is closed for further posting."))%></div><%

        }%>
        
        <!-- TODO: Add logic for isAnswered -->
        <ul class="commentsList"><%
            for (final com.adobe.cq.social.forum.api.Post comment : topic.getPosts(fromValue,limitValue)) {

                if (WCMMode.EDIT != wcmMode && !comment.isApproved()) {
                    continue;
                }
                %><li><sling:include path="<%=comment.getPath()%>" replaceSelectors="listitem-template"/></li><%
            }%>
        </ul>

<sling:include resourceType="geometrixx-outdoors/components/forum/forum/pagination" replaceSelectors="horizontalList-template"/>
<br/><!-- TODO: REMOVE -->
<%
            if (forum.isFeedEnabled()) {
                final String suffix = topic.getPath();
                %>
                <link rel="alternate" type="application/atom+xml" title="Atom 1.0 (List)" href="<%= xssAPI.getValidHref(forum.getPath() + ".feed" + suffix) %>" />
                <%
            }

if (!isQuestionAnswered && !topic.isClosed() && ForumUtil.mayPost(resourceResolver, forum)) {
    %>
    <div id="composerHolder" class="composer-container">
        <sling:include path="." resourceType="geometrixx-outdoors/components/qna/composer"/>
    </div><%
}%>

<div id="removeAnswerDialog" title="Remove this as the selected answer?">
    <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span><%=i18n.get("This will remove this answer as the selected answer for this question. Are you sure?")%></p>
</div>

<div id="deleteConfirmationDialog" title="Delete this Post?">
    <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span><%=i18n.get("This will delete the post.  Are you sure?")%></p>
</div>

<script>
    $CQ(function(){
        CQ.soco.qna.handleComposerToggle($CQ("#composerHolder"));
        <%if( forum.isRTEEnabled()) {
            %>CQ.soco.commons.activateRTE($CQ("#composerHolder form"));<%
        }%>
        CQ.soco.qna.attachToAnswerComposer($CQ("#composerHolder form"), $CQ("ul.commentsList"), $CQ("span.stat"), <%=numberOfPosts%>);
        CQ.soco.qna.listenForRemoveAnswer($CQ("div.topic"), $CQ("#removeAnswerDialog"));
        CQ.soco.qna.listenForDeletePost($CQ("div.topic"), $CQ("#deleteConfirmationDialog"));
    });
</script>
