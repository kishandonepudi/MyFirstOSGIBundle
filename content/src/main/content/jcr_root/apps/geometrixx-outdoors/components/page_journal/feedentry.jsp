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

 Atom feed entry renderer for journal entries

 Draws the current journal entry as a feed entry.

--%><%@ page session="false" %><%
%><%@ page import="java.util.Date,
                   com.day.cq.tagging.Tag,
                   com.adobe.cq.social.journal.JournalEntry,
                   com.adobe.cq.social.journal.Journal,
                   com.adobe.cq.social.journal.JournalManager,
                   com.day.cq.wcm.api.WCMMode"%><%
%><%@ taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><%@ taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><%@ taglib prefix="atom" uri="http://sling.apache.org/taglibs/atom/1.0" %><%
%><%@ taglib prefix="media" uri="http://sling.apache.org/taglibs/mediarss/1.0" %><%
%><cq:defineObjects /><%

    try {
        WCMMode.DISABLED.toRequest(request);

        JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
        Journal journal = journalMgr.getJournal(slingRequest, resource.getPath());

        if (journal.isEntry()) {
            JournalEntry entry = journal.getEntry();
            String id = entry.getId();
            String link = entry.getFullUrl();
            String title = entry.getTitle();
            String author = entry.getAuthor();
            Date pdate = entry.getDate();
            Date udate = entry.getPage().getLastModified() != null ?
                    entry.getPage().getLastModified().getTime() :
                    entry.getPage().getProperties().get("jcr:lastModified", Date.class);
            Tag[] tags = entry.getTags();

            // NOTE WELL: atom: is a taglib, not generated output.  Don't be tempted to encode attribute
            // values.  (We may not even need to filter the HTML element content, but we currently do.)

            %><atom:entry
                    id="<%= id %>"
                    updated="<%= udate %>"
                    published="<%= pdate %>"><%
                %><atom:title><%= xssAPI.filterHTML(title) %></atom:title><%
                %><atom:author
                        name="<%= author %>"
                        email="noemail@noemail.org"/><% // todo: make configurable
                %><atom:link href="<%= link %>"/><%

                %><atom:content><%= xssAPI.filterHTML(entry.getText()) %></atom:content><%

                for (Tag tag : tags) {
                    %><atom:category term="<%= tag.getTitle() %>"/><%
                }

                // todo: list attachments as enclosures

            %></atom:entry><%
        }
    } catch (Exception e) {
        log.error("error while rendering feed entry for journal entry", e);
    }
%>