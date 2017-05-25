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

  Atom feed renderer for journal and journal entry nodes

  - Draws the current journal as a feed, listing its journal entries as feed entries
  - Draws the current journal entry as a feed, listing its comments as feed entries

--%><%@ page session="false" %><%
%><%@ page import="java.util.List,
                   java.util.ArrayList,
                   java.util.Collections,
                   com.adobe.cq.social.journal.Journal,
                   com.adobe.cq.social.journal.JournalManager,
                   com.adobe.cq.social.journal.JournalEntry,
                   com.adobe.cq.social.journal.JournalEntryFilter,
                   com.adobe.cq.social.journal.TagEntryFilter,
                   com.adobe.cq.social.journal.AuthorEntryFilter,
                   com.adobe.cq.social.commons.Comment,
                   com.day.cq.commons.ProductInfoService,
                   com.day.cq.commons.ProductInfo,
                   com.day.cq.wcm.api.WCMMode,
                   org.apache.sling.api.resource.Resource,
                   org.apache.sling.api.resource.ResourceResolver,
                   java.util.Iterator,
                   org.apache.sling.api.resource.ValueMap" %><%
%><%@ taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><%@ taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%
%><%@ taglib prefix="atom" uri="http://sling.apache.org/taglibs/atom/1.0" %><%
%><cq:defineObjects /><%!
    /**
     * Descends the resource hierarchy until a journal entry list component is found,
     * then the value of the limit property is returned.
     * @param res The resource
     * @return The limit
     */
    protected static int findLimit(Resource res) {
        int limit = -1;
        ResourceResolver rr = res.getResourceResolver();
        try {
            Iterator<Resource> children = rr.listChildren(res);
            while (children.hasNext()) {
                Resource child = children.next();
                if (child.getResourceType().equals("social/journal/components/entrylist")) {
                    limit = child.adaptTo(ValueMap.class).get("limit", -1);
                    break;
                }
                limit = findLimit(child);
            }
        } catch (Exception e) {}
        return limit;
    }

%><%

    try {
        ProductInfo pi = sling.getService(ProductInfoService.class).getInfo();
        WCMMode.DISABLED.toRequest(request);

        String tag = request.getParameter(Journal.PARAM_TAG);
        String author = request.getParameter(Journal.PARAM_AUTHOR);

        JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
        Journal journal = journalMgr.getJournal(slingRequest, resource.getPath());
        JournalEntry entry = journal.getEntry();

        String url = journal.getFullUrl();

        String feedUrl = journal.isEntry() ? entry.getFeedUrl(true) : journal.getFeedUrl(true);
        String link = journal.isEntry() ? entry.getFullUrl() : journal.getFullUrl();
        String title = journal.isEntry() ? entry.getTitle() : journal.getTitle();
        String subTitle = journal.isEntry() ? entry.getAuthor() : journal.getDescription();
        String genUri = pi.getUrl();
        String genName = pi.getName();
        String genVersion = pi.getShortVersion();
        int limit = findLimit(resource);

        // NOTE WELL: atom: is a taglib, not generated output.  Don't be tempted to encode attribute
        // values.  (We may not even need to filter the HTML element content, but we currently do.)

        %><atom:feed id="<%= url %>"><%
            %><atom:title><%= xssAPI.filterHTML(title) %></atom:title><%
            if (!"".equals(subTitle)) {
                %><atom:subtitle><%= xssAPI.filterHTML(subTitle) %></atom:subtitle><%
            }
        %><atom:link href="<%= feedUrl %>" rel="self"/><%
        %><atom:link href="<%= link %>"/><%
        %><atom:generator uri="<%= genUri %>" version="<%= genVersion %>"><%= xssAPI.filterHTML(genName) %></atom:generator><%

        if (journal.isEntry()) {
            // journal entry: list comments
            if (entry.hasComments()) {
            for (final Iterator<Comment> commentIterator = entry.getComments(); commentIterator.hasNext();) {
                   Comment comment = commentIterator.next();
                   String path = comment.getPath() + ".feedentry";
                   %><sling:include path="<%= path %>"/><%
                 }
            }
        } else {
            int count = 1;
            // journal: list journal entries
            List<JournalEntry> entries;
            if (tag != null || author != null) {
                List<JournalEntryFilter> filters = new ArrayList<JournalEntryFilter>();
                if (tag != null) {
                    filters.add(new TagEntryFilter(tag));
                }
                if (author != null) {
                    filters.add(new AuthorEntryFilter(author));
                }
                entries = journal.getEntries(filters);
            } else {
                entries = journal.getEntries();
            }
            for (JournalEntry child : entries) {
                String path = child.getPage().getContentResource().getPath() + ".feedentry";
                %><sling:include path="<%= path %>"/><%
                if (limit > 0 && count == limit) {
                    break;
                }
                count++;
            }
        }

        %></atom:feed><%

    } catch (Exception e) {
        log.error("error rendering feed for journal", e);
    }
%>