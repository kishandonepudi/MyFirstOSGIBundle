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
--%><%
%><%@ page session="false"
           import="java.util.Calendar,
                   java.text.SimpleDateFormat"%><%
%><%@include file="/apps/geometrixx-media/global.jsp" %><%
    // Render details on the author of this article
    String authorPath = properties.get("articleAuthor", "");
    String authorAvatarPath = "/etc/designs/default/images/collab/avatar.png";
    Node authorNode = null;

    if (authorPath.length() > 0) {
        // Get the author's profile node
        Resource authorResource = resourceResolver.getResource(authorPath + "/profile");
        if (authorResource != null) {
            authorNode = authorResource.adaptTo(Node.class);
        }
        String authorImageNodePath = authorPath + "/profile/photos/primary/image";
        Resource authorImageNode = resourceResolver.getResource(authorImageNodePath);
        if (authorImageNode != null) {
            // Render a 36x36 thumbnail of their profile image
            authorAvatarPath = request.getContextPath() + authorImageNodePath + ".prof.thumbnail.40.jpg";
        }
    }

    String authorName = "";
    if (authorNode != null) {
        if (authorNode.hasProperty("givenName")) {
            authorName = authorNode.getProperty("givenName").getString() + " ";

        }
        if (authorNode.hasProperty("familyName")) {
            authorName += authorNode.getProperty("familyName").getString();
        }
    }
    if (authorName.length() == 0) {
        authorName = i18n.get("Anonymous");
    }

    String publishedDateString = null;
    if (currentNode != null && currentNode.hasProperty("publishedDate")) {
        Calendar publishedDate = currentNode.getProperty("publishedDate").getDate();
        SimpleDateFormat dateFormat = new SimpleDateFormat(i18n.get("MM/dd/yyyy"));
        publishedDateString = dateFormat.format(publishedDate.getTime());
    }
    else {
        publishedDateString = i18n.get("No date");
    }
%>

<div class="author-section clearfix">
    <img class="author-avatar" src="<%= xssAPI.encodeForHTMLAttr(authorAvatarPath) %>" />
    <div class="author-details">
        <div class="author-name">by <%= xssAPI.encodeForHTMLAttr(authorName) %></div>
        <div class="article-date"><%= xssAPI.encodeForHTMLAttr(publishedDateString) %></div>
    </div>
</div>
