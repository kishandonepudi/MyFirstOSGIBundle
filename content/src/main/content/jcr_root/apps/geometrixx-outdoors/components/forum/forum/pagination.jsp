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
<%@include file="/libs/social/commons/commons.jsp" %>
<%@ page import="com.adobe.cq.social.forum.api.Post,
					com.adobe.cq.social.forum.api.Forum"%><%
	final Forum forum = resource.adaptTo(Forum.class);
    final int fromValue = (null != fromParam)? Integer.parseInt(fromParam.getString()):0;
    final int limitValue = ((null != fromParam) && (null != countParam))?Integer.parseInt(countParam.getString()):forum.getLimit();
    if (forum.getTopics(fromValue, limitValue).size() > 0) {
        for (Post topic : forum.getTopics(fromValue, limitValue)) {
            if ((WCMMode.EDIT != wcmMode) && (!topic.isApproved() || topic.isSpam())) {
                    continue;
            }
            %><li><sling:include path="<%=topic.getPath()%>" replaceSelectors="listitem-template"/></li><%
        }
    }
 %>