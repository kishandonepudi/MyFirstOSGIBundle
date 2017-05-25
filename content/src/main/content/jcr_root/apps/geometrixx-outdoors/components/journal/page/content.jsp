<%--
  Copyright 1997-2009 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Journal: Content script (included by body.jsp)

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
        <h1><%= i18n.get("Journal") %></h1><%
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
    <cq:include path="journal" resourceType="geometrixx-outdoors/components/journal/main" />

</div>