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

  Blog: Content script (included by body.jsp)

  ==============================================================================

--%><%@ page import="com.adobe.cq.social.journal.Journal,
                     com.adobe.cq.social.journal.JournalEntry,
                     com.adobe.cq.social.journal.JournalManager,
                     com.adobe.granite.security.user.UserProperties,
                     com.adobe.granite.security.user.UserPropertiesService,
                     com.adobe.cq.social.group.api.GroupConstants,
                     com.adobe.cq.social.group.api.GroupUtil" %><%
%><%@include file="/libs/foundation/global.jsp" %>
<%@include file="/libs/social/commons/commons.jsp" %><%

    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    Journal journal = journalMgr.getJournal(slingRequest);
    String newPostLink = currentPage.getPath() + "/newjournalform/jcr:content/par.html";
    final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class) ;
    String groupID = currentPage.getAbsoluteParent(currentStyle.get("absParent", 4)).getName()+"-members";
    boolean isMember = GroupUtil.isMember(userPropertiesService, resourceResolver, loggedInUserID, groupID);
%><div id="content" class="<%= journal.isEntry() ? "widecolumn" : "narrowcolumn" %>">

    <div class="overview title has-button section clearfix">
        <h1><%= i18n.get("Blog") %></h1><%
    if (journal.isEntry()) {
            JournalEntry entry = journalMgr.getJournalEntry(slingRequest, currentPage.getPath());
            String author = entry.getAuthor();
            String editPostLink = null;
            String user = loggedInUserName;
            if(user!=null && entry!=null && user.equals(author)){
                String formUrl = journal.getPage().getProperties().get("editForm", String.class);
                if(formUrl == null || formUrl=="") {
                    formUrl = entry.getUrl().replace(".html", "/editjournalform");
                }
                editPostLink = entry.getUrl();
                editPostLink = editPostLink.replace(".html", ".form.html" + formUrl);%>
        <a data-title="Edit Post" href="<%= editPostLink %>">[<%= i18n.get("edit") %>]</a><%
        }
    } else if (isMember) {%>
        <a data-title="New Post" class="lightbox btn action" href="<%= newPostLink %>"><%= i18n.get("New Post") %></a><%
    }%>
    </div>
    <cq:include path="blog" resourceType="geometrixx-outdoors/components/blog/main" />

</div>