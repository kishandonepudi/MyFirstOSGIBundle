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

  Comment component

  Draws a comment.

--%><%@ page import="java.text.DateFormat,
                     com.adobe.cq.social.commons.Comment,
                     com.adobe.cq.social.commons.CommentSystem,
                     com.adobe.cq.social.commons.CollabUser,
                     com.day.cq.commons.date.DateUtil,
                     java.util.Locale,
                     com.adobe.cq.social.commons.CollabUtil,
                     com.day.cq.wcm.api.WCMMode" %><%
%><%@include file="/libs/social/commons/commons.jsp"%><%


    final Comment comment = resource.adaptTo(Comment.class);
    final CommentSystem cs = comment.getCommentSystem();

    String message = comment.getMessage();
    // #26898 - line breaks in comments
    // xss protection will remove line breaks before we can format them
    // for the output, so it is done here a a workaround:
    // first remove the CR, then replace the LF with <BR>
    message = message.replaceAll("\\r", "");
    message = message.replaceAll("\\n", "<br>");

    String id = comment.getId();

    CollabUser author = comment.getAuthor();

    //resolve name
    String authorName = resourceAuthorName;
    String authorImg = resourceAuthorAvatar;

	//resolve date
    DateFormat dateFormat = DateUtil.getDateFormat(cs.getProperty("dateFormat", String.class), DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT, pageLocale), pageLocale);
    String date = dateFormat.format(comment.getDate());

    %><cq:include script="header.jsp" />
        
    <div class="info-column">
        <div class="text-heading">
            <span><span class="username"><a href="<%= xssAPI.getValidHref(socialProfileUrl) %>"><%= xssAPI.encodeForHTML(authorName) %></a></span>
            <span><%= xssAPI.encodeForHTML(date) %></span><%    
        
            %><cq:include script="modtag-template"/>
            <div id="<%=xssAPI.encodeForHTMLAttr(comment.getId())%>" class="comment-body"><%
                %><%= xssAPI.filterHTML(message) %>
                    <sling:include resourceType="geometrixx-outdoors/components/commons/comments/comment" path="." replaceSelectors="attachments"/>
                <%
            %><cq:include script="toolbar-template.jsp"/></div><%
        
            if (!cs.isClosed()) {
                %><cq:include script="replies.jsp"/><%
            }
        %></div>
    </div><%

    if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
        %><script type="text/javascript">
            CQ.WCM.onEditableReady("<%= comment.getPath() %>",
                function(editable) {
                    editable.refreshCommentSystem = function() {
                        <%-- todo: does't work as expected yet
                        var cs = CQ.WCM.getEditable("<%= cs.getResource().getPath() %>");
                        if (cs) {
                            console.log("cs", cs.path);
                            cs.refresh();
                        } else {
                        --%>
                            CQ.wcm.EditBase.refreshPage();
                        <%-- } --%>
                    };
                }
            );
        </script><%
    }
%>
