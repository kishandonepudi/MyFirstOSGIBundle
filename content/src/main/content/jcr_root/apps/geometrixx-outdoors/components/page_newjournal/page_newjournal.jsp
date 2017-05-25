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

  Journal: Page component

  ==============================================================================

--%><%@page session="false" contentType="text/html; charset=utf-8" %><%
%><%@ page import="com.adobe.cq.social.journal.Journal,
                     com.adobe.cq.social.journal.JournalManager" %><%
%><%@include file="/libs/foundation/global.jsp" %><%
%><%

    String journalPath = currentPage.getParent().getPath();
    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    Journal journal = journalMgr.getJournal(slingRequest, journalPath);
    if (journal != null) {
        slingRequest.setAttribute(JournalManager.ATTR_JOURNAL, journal);
    }


%><html>
<cq:include script="head.jsp"/>
<cq:include script="body.jsp"/>
</html>
