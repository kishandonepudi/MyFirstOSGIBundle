<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%>
<%--    
    Forum Component
    
    This is full-size template which can be overridden in apps.  There
    is no need to copy the whole component if you want to change the
    look of the forum.  Just create a JSP at:
    /apps/social/forum/components/forum/fullsize-template.GET.jsp
    
--%> 
<%@include file="/libs/social/commons/commons.jsp" %><%
%><%@ page import="com.adobe.cq.social.forum.api.Post,
                   com.adobe.cq.social.forum.api.Forum,
                   com.adobe.cq.social.forum.api.ForumUtil,
                   org.apache.sling.api.request.RequestParameter,
                   org.apache.sling.api.SlingHttpServletRequest" %><%

    final Forum forum = resource.adaptTo(Forum.class);
    final int fromValue = (null != fromParam)? Integer.parseInt(fromParam.getString()):0;
    final int limitValue = ((null != fromParam) && (null != countParam))?Integer.parseInt(countParam.getString()):forum.getLimit();
      
%><div class="forum">
<div class="clear"></div>
<div class="forum-top title section clearfix">
    <h1><%= i18n.get("Topics") %></h1><%
     if (forum.isClosed()) {
        %><div class="status"><%= xssAPI.encodeForHTML(StringUtils.defaultIfEmpty(forum.getForumClosedText(), i18n.get("This forum is closed for further posting."))) %></div><%
     } else if (!ForumUtil.mayPost(resourceResolver, forum)) {
        %><div class="login"><%= xssAPI.encodeForHTML(StringUtils.defaultIfEmpty(forum.getNoPermissionText(), i18n.get("Sign in in order to post to this forum."))) %></div><%
     } else {
        %><sling:include path="<%=resource.getPath()%>" replaceSelectors="topiccreator"/><%

    }%>
</div>
<div class="topics"><ul><%
    if (forum.getTopics(fromValue, limitValue).size() > 0) {
        for (Post topic : forum.getTopics(fromValue, limitValue)) {
            if ((WCMMode.EDIT != wcmMode) && (!topic.isApproved() || topic.isSpam())) {
                    continue;
            }
            %><li<%=(topic.isPinned()) ? " class=\"pinned\"" : ""%>><sling:include resourceType="geometrixx-outdoors/components/forum/topic" path="<%=topic.getPath()%>" replaceSelectors="listitem-template"/></li><%
        }
        %></ul>
        </div><sling:include resourceType="geometrixx-outdoors/components/forum/forum/pagination" replaceSelectors="horizontalList-template"/><%
    } else {
        %></ul>
        </div><div class="status"><%=StringUtils.defaultIfEmpty(forum.getNoTopicsText(), i18n.get("Have a topic you'd like to discuss or a burning question for the community? Post to the forum."))%></div></div><%
    }
    if (forum.isFeedEnabled()) {
        %><link rel="alternate" type="application/atom+xml" title="Atom 1.0 (List)" href="<%= xssAPI.getValidHref(forum.getPath() + ".feed") %>" /><%
    }%>
<script type="text/javascript">
    $CQ(function(){
        CQ.soco.forum.attachToTopicComposer($CQ("#forumTopicComposerForm"), "<%=resource.getPath()%>");
        <%if( forum.isRTEEnabled()) {%>
        CQ.soco.commons.activateRTE($CQ("#forumTopicComposerForm"));
        <%}%>
		CQ.soco.commons.attachToPagination($CQ("#pagination"), $CQ(".topics>ul"), <%=fromValue%>, <%=limitValue%>, "<%=(isCORS)?externalizer.absoluteLink(slingRequest, slingRequest.getScheme(), resource.getPath()):resource.getPath()%>");
    });
</script>