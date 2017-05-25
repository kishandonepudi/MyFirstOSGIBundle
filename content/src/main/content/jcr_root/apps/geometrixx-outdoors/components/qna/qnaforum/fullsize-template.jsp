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

  Q & A Forum Component

--%><%@include file="/libs/social/commons/commons.jsp" %><%
%><%@ page import="com.adobe.cq.social.forum.api.Post,
                   com.adobe.cq.social.forum.api.Forum,
                   com.adobe.cq.social.forum.api.ForumUtil,
                   org.apache.sling.api.request.RequestParameter,
                   org.apache.sling.api.SlingHttpServletRequest" %><%

    final Forum forum = resource.adaptTo(Forum.class);
    final int fromValue = (null != fromParam)? Integer.parseInt(fromParam.getString()):0;
    int limitValue = ((null != fromParam) && (null != countParam))?Integer.parseInt(countParam.getString()):forum.getLimit();

  if (forum.isClosed()) {
      %><div class="status"><%= xssAPI.encodeForHTML(StringUtils.defaultIfEmpty(forum.getForumClosedText(), i18n.get("This Q&A is closed for further posting."))) %></div><%
  } else if (!ForumUtil.mayPost(resourceResolver, forum)) {
    %><div class="qnalogin"><%= xssAPI.encodeForHTML(StringUtils.defaultIfEmpty(forum.getNoPermissionText(), i18n.get("Sign in in order to ask a question."))) %></div><%
  } else {
    %><sling:include path="." replaceSelectors="topiccreator"/><%
  }%>
  <div class="forum-top title section clearfix">
      <h1><%=i18n.get("Recent Q&A")%></h1>
  </div>
  <div class="askquestionbox section"></div>
  <div class="topics"><ul><%
  if (null != forum) {
     for (final Post topic : forum.getTopics(fromValue, limitValue)) {
         if((topic.isSpam() || !topic.isApproved()) && wcmMode != WCMMode.EDIT) {
             limitValue += 1;
             continue;
         }
         %><li<%=(topic.isPinned()) ? " class=\"pinned\"" : ""%>><sling:include resourceType="geometrixx-outdoors/components/qna/topic" path="<%= topic.getPath() %>" replaceSelectors="listitem-template"/></li><%
      }
  }
  %>
  </ul></div>
      <sling:include resourceType="geometrixx-outdoors/components/forum/pagination" replaceSelectors="horizontalList-template"/>

  <script>
    $CQ(function(){
      CQ.soco.commons.attachToPagination($CQ("#pagination"), $CQ(".topics>ul"), <%=fromValue%>, <%=limitValue%>, "<%=resource.getPath()%>");
    });
  </script>
