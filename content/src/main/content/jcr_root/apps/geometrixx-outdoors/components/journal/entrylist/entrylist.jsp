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

  Journal: Entry List component (extends List component)

--%><%@ page import="com.day.cq.wcm.foundation.List,
                     com.adobe.cq.social.journal.Journal"
%><%@include file="/libs/foundation/global.jsp"%><%
%><cq:include script="/libs/foundation/components/list/list.jsp"/><%

List list = (List)request.getAttribute("list");
String query = request.getParameter(Journal.PARAM_QUERY);
int journalSearchResults = list.size();
int journalPageNumber = 1 + (int)Math.floor((double)list.getPageStart() / (double)list.getPageMaximum());
if (query != null && journalSearchResults > 0) {
    %><span record="'journalSearch', {<%
        %>'journalSearchKeyword': '<%= xssAPI.encodeForJSString(query) %>', <%
        %>'journalSearchResults': '<%= journalSearchResults %>', <%
        %>'journalPageNumber': '<%= journalPageNumber %>'<%
    %>}"></span><%
}
%>

<script type="text/javascript">

   function journalSearchTrackClick(journalSearchSelectionTitle) {

                CQ_Analytics.record({event: 'journalSearchSelection', 
                                     values: {
                                        'journalSearchKeyword': '<%= xssAPI.encodeForJSString(query) %>',
                                        'journalSearchResults': '<%= journalSearchResults %>',
                                        'journalPageNumber': '<%= journalPageNumber %>',
                                        'journalSearchSelectionTitle': journalSearchSelectionTitle },
                                     componentPath: '<%=resource.getResourceType()%>'
                });
    
                return false;
            }
</script>
  