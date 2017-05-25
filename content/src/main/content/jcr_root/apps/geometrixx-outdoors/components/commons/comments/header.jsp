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

  Comments component sub-script

  Draws the header.

--%><%@ page import="com.adobe.cq.social.commons.CommentSystem,
                     com.day.cq.i18n.I18n,
                     com.day.cq.wcm.api.WCMMode,
                     java.util.Locale,
                     java.util.ResourceBundle" %><%
%><%@include file="/libs/foundation/global.jsp"%><%

    I18n i18n = new I18n(slingRequest.getResourceBundle(currentPage.getLanguage(false)));

    CommentSystem cs = (CommentSystem)request.getAttribute("cs");

    String idPrefix = cs.getId();
    int num = cs.countComments(WCMMode.fromRequest(request));

    %><%
        if (num == 0) {
            %><%= i18n.get("No comments yet") %><%
        } else { %>
            <div id="<%= idPrefix %>-count" class="topic-top title section gray clearfix">
                <h1><%= i18n.get("Comments") %></h1>
            </div><%
        }
    %>
