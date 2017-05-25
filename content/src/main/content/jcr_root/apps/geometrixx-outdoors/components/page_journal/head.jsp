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

  Journal: Head script (included by page.jsp)

  ==============================================================================

--%><%@ page import="com.adobe.cq.social.journal.Journal,
                     com.adobe.cq.social.journal.JournalManager,
                     com.day.cq.i18n.I18n, java.util.ResourceBundle" %>
<%
%><%@include file="/libs/foundation/global.jsp" %><%

	JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
	Journal journal = journalMgr.getJournal(slingRequest);
    ResourceBundle bundle = slingRequest.getResourceBundle(currentPage.getLanguage(true));

%><head profile="http://gmpg.org/xfn/11">
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta http-equiv="keywords" content="<%= xssAPI.encodeForHTMLAttr(WCMUtils.getKeywords(currentPage)) %>">
    <meta name="generator" content="<%= Journal.GENERATOR_NAME %>">
    <title><%= journal.isEntry() ? xssAPI.filterHTML(journal.getEntry().getTitle()) + " &laquo; " : "" %><%= xssAPI.filterHTML(journal.getTitle()) %></title>
    <link rel="alternate" type="application/atom+xml" <%
        %>title="<%= xssAPI.encodeForHTMLAttr(I18n.get(bundle, "Atom Feed for '{0}'", null, journal.getTitle())) %>" <%
        %>href="<%= xssAPI.getValidHref(journal.getFeedUrl(false)) %>">
    <% currentDesign.writeCssIncludes(out); %>
    <cq:include script="headlibs.jsp"/>
    <cq:include script="init.jsp"/>
    <cq:include script="stats.jsp"/>
    <%
    if (journal.isEntry()) {
        String cssPath = currentDesign.getPath() + "/static_entry.css";
        if (resourceResolver.getResource(cssPath) != null) {
            %><link rel="stylesheet" href="<%= xssAPI.getValidHref(currentDesign.getPath()) %>/static_entry.css" type="text/css"><%
        }
    }
    %>
</head>
