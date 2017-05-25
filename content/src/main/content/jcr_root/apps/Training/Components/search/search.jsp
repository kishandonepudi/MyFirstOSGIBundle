<%@include file="/libs/foundation/global.jsp"%>
<%@ page import="javax.jcr.query.QueryResult,
                javax.jcr.query.Query,
                javax.jcr.Node,
                javax.jcr.NodeIterator,
                org.apache.commons.lang.StringEscapeUtils" %>
<%
String queryString = (slingRequest.getParameter("q") != null) ? StringEscapeUtils.escapeXml(slingRequest.getParameter("q")) : "";
%>
<center>
	<form action="<%= currentPage.getPath() %>.html">
	   <input name="q" value="<%= queryString %>" />
	   <input value="Search" type="submit" />
	</form>
</center>
<br />
<%
if (slingRequest.getParameter("q") != null) {
	String stmt = "select * from cq:Page where jcr:path like '/content/TrainingPage/%' and contains(*, '" + slingRequest.getParameter("q") + "') order by jcr:score desc";
	Query query = currentNode.getSession().getWorkspace().getQueryManager().createQuery(stmt, Query.SQL);
	QueryResult results = query.execute();
	if (results.getNodes() != null && results.getNodes().hasNext()) {
		NodeIterator it = results.getNodes();
		while (it.hasNext()) {
			Node node = it.nextNode();
			String npath = node.getPath();
			Page contentPage = pageManager.getContainingPage(resourceResolver.getResource(npath));
			String title = contentPage.getTitle();
			String path = contentPage.getPath() + ".html";
			%>
			<div class="searchresult"><a href="<%= path %>"><%= title %></a></div>
			<%
		}
	} else {
		%>
		<div class="searchresult">No results found ... Please try again ...</div>
		<%
	}
}
%>