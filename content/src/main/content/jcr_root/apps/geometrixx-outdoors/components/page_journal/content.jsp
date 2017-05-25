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
                     com.adobe.cq.social.journal.JournalManager" %><%
%><%@include file="/libs/foundation/global.jsp" %><%

    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    Journal journal = journalMgr.getJournal(slingRequest);

%><div id="content" class="<%= journal.isEntry() ? "widecolumn" : "narrowcolumn" %>">

<cq:include path="journal" resourceType="social/journal/components/main" />

</div>
<%

    if (!journal.isEntry()) {
    
    %>
    <div id="sidebar">
        <ul>
            <cq:include path="sidebar" resourceType="foundation/components/iparsys"/>
        </ul>
    </div>
    <%
    }
%>