<%--
  Copyright 1997-2008 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Journal: Main component

  Creates a {com.day.cq.wcm.foundation.List} list from the request and sets
  it as a request attribute.

--%><%@ page import="com.adobe.cq.social.journal.Journal,
                     com.adobe.cq.social.journal.JournalManager,
                     com.day.cq.rewriter.linkchecker.LinkCheckerSettings,
                     com.day.cq.wcm.api.WCMMode" %><%!
%><%@include file="/libs/foundation/global.jsp"%><%

    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    Journal journal = journalMgr.getJournal(slingRequest);

    out.flush();
    LinkCheckerSettings.fromRequest(slingRequest).setIgnoreExternals(true);

    if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        %><cq:includeClientLib categories="cq.social.journal"/><%
    }

    if (journal.isEntry()) {
        %><cq:include path="../title" resourceType="geometrixx-outdoors/components/journal/entrytitle" /><%
        %><cq:include path="../par" resourceType="foundation/components/parsys" /><%
        %><cq:include path="../alt" resourceType="foundation/components/parsys" /><%
    } else {
        // handle views
        String view = journalMgr.getView(request);
        if (Journal.VIEW_NEW.equals(view)) {
            %><cq:include path="newentry" resourceType="social/journal/components/entryform" /><%
        } else {
            %><cq:include path="entries" resourceType="geometrixx-outdoors/components/journal/entrylist" /><%
        }
    }

    out.flush();
    LinkCheckerSettings.fromRequest(slingRequest).setIgnoreExternals(false);

%>