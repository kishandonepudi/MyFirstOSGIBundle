<%@ page import="com.day.cq.i18n.I18n,
                 com.day.cq.wcm.foundation.List,
                 java.util.Locale,
                 com.adobe.cq.social.journal.Journal, 
                 java.util.ResourceBundle" %><%
%><%@ include file="/libs/foundation/global.jsp"%><%

List list = (List)request.getAttribute("list");
Locale pageLocale = currentPage.getLanguage(true);
ResourceBundle resourceBundle = slingRequest.getResourceBundle(pageLocale);
I18n i18n = new I18n(resourceBundle);

String query = request.getParameter(Journal.PARAM_QUERY);     
int journalSearchResults = list.size();
int journalPageNumber = 1 + (int)Math.floor((double)list.getPageStart() / (double)list.getPageMaximum());

%><div class="pagination"><%
    String previousPageLink = list.getPreviousPageLink();
    if (previousPageLink != null) {
        %><div class="previous"><%
            %><a href="<%= xssAPI.getValidHref(previousPageLink) %>" onclick="journalSearchTracPageClick('<%= journalPageNumber - 1 %>')">&laquo; <%= i18n.get("Newer Posts") %></a><%
        %></div><%
    }
    String nextPageLink = list.getNextPageLink();
    if (nextPageLink != null) {
        %><div class="next"><%
            %><a href="<%= xssAPI.getValidHref(nextPageLink) %>" onclick="journalSearchTrackPageClick('<%= journalPageNumber + 1 %>')"><%= i18n.get("Older Posts") %> &raquo;</a><%
        %></div><%
    }
%></div>

<script type="text/javascript">
   function journalSearchTrackPageClick(journalPageNumber) {

                CQ_Analytics.record({event: 'journalPageClicked', 
                                     values: {
                                        'journalSearchKeyword': '<%= xssAPI.encodeForJSString(query) %>',
                                        'journalSearchResults': '<%= journalSearchResults %>',
                                        'journalPageNumber': journalPageNumber},
                                    componentPath: '<%=resource.getResourceType()%>'
                });
                return false;
            }
</script>
