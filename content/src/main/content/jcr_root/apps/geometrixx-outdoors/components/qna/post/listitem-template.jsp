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
                   com.adobe.cq.social.qna.api.QnaPost,
                   com.day.cq.tagging.Tag"%>
<%@include file="/libs/social/commons/commons.jsp"%>
<%
    final QnaPost post = resource.adaptTo(QnaPost.class);
	final QnaPost qnaTopic = resourceResolver.getResource(post.getTopic().getPath()).adaptTo(QnaPost.class);

	final Forum forum = qnaTopic.getForum();

    final boolean allowEdits = resourceResolver.resolve(forum.getPath())
            .adaptTo(ValueMap.class).get("allowEditComments", false);


    final Post latestPost = qnaTopic.getLatestPost();
    String latestUrlPrefix = "";
    String latestUrlSuffix = "";

    if (null != latestPost) {
        latestUrlPrefix = "<a href=\"" + latestPost.getUrl() + "\">";
        latestUrlSuffix = "</a>";
    }

    if (null != post) {

        final String opClass = null != qnaTopic && post.getModifiedBy().equals(qnaTopic.getCreatedBy()) ? " op" : "";
    %><a name="<%= xssAPI.encodeForHTMLAttr(post.getId()) %>"></a>
	<sling:include path="<%=post.getPath()%>" replaceSelectors="modtag-template" />
	<div class="message<%=opClass%>">
		<div class="avatar-column">
			<sling:include resourceType="geometrixx-outdoors/components/qna/post" path="." replaceSelectors="authoravatar-template"/>
            <div class="answerVoteControls">
                <cq:include script="voting.jsp" />
			</div>
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
            <p class="location"><%=xssAPI.filterHTML(post.getCreatedBy().getFullLocation())%></p>
			<div style="clear:both"></div>
			<div class="toolbar-container">
			<sling:include path="<%=post.getPath()%>"
				replaceSelectors="toolbar-template" />
			</div>
			<div style="clear:both"></div>
		</div>

		<div class="detail-column">		
				<%
                    if (!qnaTopic.isAnswered()) {
                        if(loggedInUserID!=null && qnaTopic!=null && loggedInUserID.equals(qnaTopic.getCreatedBy().getUserID())){

                            final String chosenFormAction = resource.getPath() + ".social.chooseanswer.html";
                            final String answeredText = i18n.get("Select Answer");

                            %>
				<form action="<%= xssAPI.encodeForHTMLAttr(chosenFormAction ) %>"
					method="POST">
					<input name="answered" type="submit" value="<%=answeredText%>"/>
					<input type="hidden" name="_charset_" value="UTF-8" />
				</form>
				<%
                        }
                    }
                    
                %><sling:include path="<%=post.getPath()%>" replaceSelectors="tags" /><%
                    final Tag[] tags = post.getTags();
                    if (tags.length != 0) {
                        for (Tag tag : tags) {
                            final String chosenTagName = "chosenanswer";
                            if (tag.getName().equals(chosenTagName) && qnaTopic!=null) {
                                if (loggedInUserID!=null && loggedInUserID.equals(qnaTopic.getCreatedBy().getUserID())) {
                                  %><button class="btn btn-warning btn-mini"
                                    onclick="$CQ(event.target).trigger(CQ.soco.qna.events.REMOVE_ANSWERED_REQUEST, '<%=post.getPath() + ".social.removeanswer.html"%>')">Unmark chosen answer</button><%
                                } else {
                                    %><div style="height:100%" class="top-comment"><p style="margin-left:40px"><%=i18n.get("Selected Answer")%></p></div><%
                                }
                            }
                        }
                    }
%>

		</div>
			<script type="text/javascript">
				function markChosenAnswer() {
					document.getElementById('answerPanel').style.display = 'none';
					document.getElementById('submitAnswer').style.display = 'none';
				}
			</script>
			<%
    if(loggedInUserID!=null && post!=null && loggedInUserID.equals(post.getCreatedBy().getUserID()) && !qnaTopic.isAnswered()){
        %><cq:includeClientLib categories="cq.social.dialog" />
			<script type="text/javascript">
				function deleteQuestion(event, topicUrl, redirectUrl) {
					event.preventDefault();
					if (this.deleteQuestionDialog) {
						this.deleteQuestionDialog.toggle();
					} else {
						this.deleteQuestionDialog = new CQ.Social.commons.views.dialog(
								{
									model : {
										header : "Are you sure?",
										body : "Do you want to delete this question?",
										hasClose : true,
										hasPrimary : true,
										txtClose : "Cancel",
										txtPrimary : "Ok"
									}
								});
						this.deleteQuestionDialog.on("primaryClicked", Fossil
								.curry(this.ondeleteQuestionOk, this, topicUrl,
										redirectUrl));
					}
				}

				function ondeleteQuestionOk(topicUrl, redirectUrl) {
					var target = topicUrl + ".social.deleteqnapost.html";
					jQuery.post(target, null, function() {
						parent.location = redirectUrl;
					});
				}
			</script>
			<%
    }
%>
		</div><%

    } else {
        log.warn("resource couldn't be adapted to post at [{}].", resource.getPath());
    }
%>
