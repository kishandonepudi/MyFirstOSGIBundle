<%@page session="false"%><%
%><%@page import="com.day.cq.widget.HtmlLibraryManager"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%><%
%><%@taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0"%><%
%><sling:defineObjects /><%
    String categs = request.getParameter("categories");
    if (categs == null) {
        categs = "";
    }
%><html>
<head>
    <title>Client Libraries Test Output</title>
</head>
<body>
<form action="">
    Categories: <input name="categories" value="<%= categs %>">&nbsp;&nbsp;&nbsp;
    <input type="submit"/>
</form>
<h1>Test Output</h1><%

    HtmlLibraryManager mgr = sling.getService(HtmlLibraryManager.class);
    mgr.writeIncludes(slingRequest, out, "granite.ui.test");
    %>

<h2>&lt;ui:includeClientLib categories="<%= categs %>" /&gt;</h2>
<xmp><ui:includeClientLib categories="<%= categs %>"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>

<h2>&lt;ui:includeClientLib js="<%= categs %>" /&gt;</h2>
<xmp><ui:includeClientLib js="<%= categs %>"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>

<h2>&lt;ui:includeClientLib js="<%= categs %>" themed="false" /&gt;</h2>
<xmp><ui:includeClientLib js="<%= categs %>" themed="false"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>

<h2>&lt;ui:includeClientLib js="<%= categs %>" themed="true" /&gt;</h2>
<xmp><ui:includeClientLib js="<%= categs %>" themed="true"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>

<h2>&lt;ui:includeClientLib css="<%= categs %>" /&gt;</h2>
<xmp><ui:includeClientLib css="<%= categs %>"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>

<h2>&lt;ui:includeClientLib css="<%= categs %>" themed="false" /&gt;</h2>
<xmp><ui:includeClientLib css="<%= categs %>" themed="false"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>

<h2>&lt;ui:includeClientLib css="<%= categs %>" themed="true" /&gt;</h2>
<xmp><ui:includeClientLib css="<%= categs %>" themed="true"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>

<h2>&lt;ui:includeClientLib theme="<%= categs %>" /&gt;</h2>
<xmp><ui:includeClientLib theme="<%= categs %>"/></xmp>
<% request.setAttribute(HtmlLibraryManager.class.getName() + ".included", null); %>
