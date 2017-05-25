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

  Default comments component

  Includes all child resources (comments).

--%><%@ page import="java.util.List,
                     com.adobe.cq.social.commons.Comment,
                     com.adobe.cq.social.commons.CommentSystem,
                     com.adobe.cq.social.commons.CollabUtil,
                     com.day.cq.rewriter.linkchecker.LinkCheckerSettings,
                     com.day.cq.wcm.api.WCMMode,
                     com.day.cq.wcm.api.components.IncludeOptions,
                     com.day.cq.wcm.foundation.forms.FormsHelper,
                     com.day.cq.i18n.I18n,
                     java.util.Locale,
                     java.util.Iterator,
                     java.util.ResourceBundle,
                     org.apache.sling.api.resource.ResourceUtil,
                     org.apache.commons.lang3.StringEscapeUtils" %><%
%><%@taglib uri="http://www.day.com/taglibs/cq/personalization/1.0" prefix="personalization" %>
<%@include file="/libs/social/commons/commons.jsp"%><%

    final List<Resource> editResources = FormsHelper.getFormEditResources(slingRequest);
    final Resource editComment = (null != editResources && editResources.size() > 0) ? editResources.get(0) : null;
    Resource childComment = null;
    boolean isRenderByForm = false;
    if(editComment!=null && !ResourceUtil.isA(editComment, Comment.RESOURCE_TYPE)){
        //search for the first comments from child list
        childComment = resource.getResourceResolver().getResource(editComment, "comments") ;
        isRenderByForm = true;
    }
    final Resource csResource = (null != childComment ) ? childComment : resource;
    CommentSystem cs = csResource.adaptTo(CommentSystem.class);
    final Resource commentResource = resourceResolver.getResource(cs.getPath());
   
    if (cs == null) {
        log.error("failed to retrieve comment system for " + csResource.getPath());
        return;
    }
   
    final ValueMap values = cs.getResource().adaptTo(ValueMap.class);
    final Boolean isRTEenabled = (values != null) ? values.get("rteEnabled", false) : false;
    
    if(isRenderByForm ){
        cs.setPath(CollabUtil.getPagePath(editComment));
        request.setAttribute("isRenderByForm", isRenderByForm);
        request.setAttribute("commentsRoot", childComment.getPath());
    }

    request.setAttribute("cs", cs);

    String formattedName = "";
    String authorizableId = resourceAuthorID;
    formattedName = resourceAuthorName;
    if (StringUtils.isBlank(formattedName)) {
        formattedName = authorizableId;
    }

    String signedInText = cs.getProperty("signedInText", i18n.get("You are signed in as:"));

    if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
      %><cq:includeClientLib categories="cq.social.author"/><%
    }
%><cq:includeClientLib js="cq.social.publish_comments"/><%

%><div id="<%= cs.getId() %>">
    <div class="comment-signed-in-text" id="<%= cs.getId() %>-signed-in-text"><%= signedInText %><span class="comment-signed-in-user" id="<%= cs.getId() %>-signed-in-user"><%= StringEscapeUtils.escapeHtml4(formattedName) %></span></div>

    <sling:include resourceType="geometrixx-outdoors/components/commons/comments" replaceSelectors="header"/>
    <ul class="comments"><%

    if (cs.hasComments(WCMMode.fromRequest(request))) {

        out.flush();
        LinkCheckerSettings.fromRequest(slingRequest).setIgnoreExternals(true);

        for (Comment comment: cs.getComments(0, cs.countComments())) {
            if (cs.isModerated() && !comment.isApproved() &&
                    WCMMode.fromRequest(request) != WCMMode.EDIT) {
                continue;
            }

            if (comment.isSpam() && WCMMode.fromRequest(request) != WCMMode.EDIT) {
                continue;
            }

            if (editContext != null) {
                editContext.setAttribute("currentResource", comment.getResource());
            }
            // include comment
            IncludeOptions.getOptions(request, true).getCssClassNames().add("comment");
            %><li class="clearfix"><sling:include resourceType="geometrixx-outdoors/components/commons/comments/comment" resource="<%= comment.getResource() %>" replaceSelectors="listitem-template"/></li><%
        }

        out.flush();
        LinkCheckerSettings.fromRequest(slingRequest).setIgnoreExternals(false);

    }%>
    
</ul><%
    if (!cs.isClosed() && CollabUtil.canAddNode(resourceResolver.adaptTo(Session.class), cs.getRootPath())) {
    %><sling:include resourceType="geometrixx-outdoors/components/commons/composer" replaceSelectors="simple-template"/><%
    }
    if(!CollabUtil.canAddNode(resourceResolver.adaptTo(Session.class), cs.getRootPath())) {
        %><p><%=i18n.get("You are not allowed to post here, please sign in or join")%></p><%
    }

%></div><script>
$CQ(function(){
  
    var commentCount = <%=cs.countComments(WCMMode.fromRequest(request))%>;
  <%if( isRTEenabled) {%>
  CQ.soco.commons.activateRTE($CQ("#<%=cs.getId()%>").find("form").first());
  <%}%>
    //CQ.soco.comments.attachToComposer($CQ("#<%=cs.getId()%>").find("form").first(), $CQ("#<%=cs.getId()%> ul.comments"), "comment");
    $CQ("#<%=cs.getId()%>").bind(CQ.soco.comments.events.ADDED, function(event){
            CQ_Analytics.record({event: 'postComment',
                    values: {commenterName: '<%=loggedInUserID%>',
                            componentPath: '<%=resource.getResourceType()%>'
                            }
            });
            commentCount += 1;
  });
    $CQ("#<%=cs.getId()%>").bind(CQ.soco.comments.events.DELETE, function(event) {
        $CQ.post($CQ(event.target).closest("form").attr("action"), function(data, textStatus, jqXHR) {
            var parentComment = $CQ(event.target).closest(".comment").parent();
            var numReplies = +(parentComment.data("numreplies") || 0);
            parentComment.data("numreplies", (numReplies - 1));
            commentCount -= 1;
            $CQ(event.target).closest(".comment").remove();
        });     
    });
    CQ.soco.comments.bindOnAdded($CQ("#<%=cs.getId()%>"));
});
