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

  Atom feed renderer for all journal comments

  - Draws the current journal as a feed, listing its journal entries as feed entries
  - Draws the current journal entry as a feed, listing its comments as feed entries

--%><%@ page session="false" %><%
%><%@ page import="com.adobe.cq.social.journal.JournalManager,
                   com.adobe.cq.social.journal.Journal,
                   com.adobe.cq.social.journal.JournalEntry,
                   com.adobe.cq.social.commons.CommentSystem,
                   com.adobe.cq.social.commons.Comment,
                   com.day.cq.commons.ProductInfo,
                   com.day.cq.commons.ProductInfoService,
                   java.util.List,
                   java.util.ArrayList,
                   java.util.Collections,
                   java.util.Comparator,
                   java.util.Iterator" %><%
%><%@ taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><%@ taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%
%><%@ taglib prefix="atom" uri="http://sling.apache.org/taglibs/atom/1.0" %><%
%><cq:defineObjects /><%

    try {
        JournalManager journalMgr = resourceResolver.adaptTo(JournalManager.class);
        Journal journal = journalMgr.getJournal(slingRequest);

        ProductInfoService pis = sling.getService(ProductInfoService.class);
        ProductInfo pi = pis.getInfo();
        String genUri = pi.getUrl();
        String genName = pi.getName();
        String genVersion = pi.getShortVersion();

        // gather comments from journal entries
        List<Comment> allComments = new ArrayList<Comment>();
        for (JournalEntry entry : journal.getEntries()) {        
          for (final Iterator<Comment> commentIterator = entry.getComments(); commentIterator.hasNext();) {
              allComments.add(commentIterator.next());
          }
        }
        
        // and sort them by date
        Collections.sort(allComments, new Comparator<Comment>() {
            public int compare(Comment a, Comment b) {
                long aTime = a.getDate().getTime();
                long bTime = b.getDate().getTime();
                if(aTime > bTime) {
                    return 1;
                } else if(aTime < bTime) {
                    return -1;
                }
                return 0;
            }
        });

        // NOTE WELL: atom: is a taglib, not generated output.  Don't be tempted to encode attribute
        // values.  (We may not even need to filter the HTML element content, but we currently do.)

        %><atom:feed id="<%= journal.getFullUrl() %>"><%
            %><atom:title>Comments for <%= xssAPI.filterHTML(journal.getTitle()) %></atom:title><%
            if (!"".equals(journal.getDescription())) {
                %><atom:subtitle><%= xssAPI.filterHTML(journal.getDescription()) %></atom:subtitle><%
            }
        %><atom:link href="<%= journal.getFullUrl() %>" rel="self"/><%
        %><atom:generator uri="<%= genUri %>" version="<%= genVersion %>"><%= xssAPI.filterHTML(genName) %></atom:generator><%

        for (Comment comment : allComments) {
            try {
                if (comment.isSpam()) {
                    continue;
                }
                CommentSystem cs = comment.getCommentSystem();
                if (cs.isModerated() && !comment.isApproved()) {
                    continue;
                }
                JournalEntry entry = resourceResolver.getResource(cs.getPath()).adaptTo(JournalEntry.class);
                %><atom:entry
                        id="<%= comment.getFullUrl(slingRequest) %>"
                        updated="<%= comment.getDate() %>"
                        published="<%= comment.getDate() %>"><%
                    %><atom:title>Comment on <%= xssAPI.filterHTML(entry.getTitle()) %></atom:title><%
                    %><atom:author
                            name="<%= comment.getAuthor().getName() %>"
                            email="noemail@noemail.org"/><% // todo: make configurable
                    %><atom:link href="<%= comment.getFullUrl(slingRequest) %>"/><%
                    %><atom:content><%= xssAPI.filterHTML(comment.getMessage()) %></atom:content><%
                %></atom:entry><%
            } catch (Exception ex) {
                log.error("error rendering feed for comment " + comment.getPath());
            }
        }

        %></atom:feed><%

    } catch (Exception e) {
        log.error("error rendering feed for all journal comments", e);
    }
%>