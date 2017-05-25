<%@page session="false"%><%
%><%@page import="java.util.Collection,
            java.util.LinkedList,
            java.util.List,
            java.util.TreeMap,
            com.day.cq.widget.ClientLibrary,
            com.day.cq.widget.HtmlLibraryManager,
            com.day.text.Text,
            com.day.cq.widget.LibraryType,
            org.apache.commons.lang3.StringEscapeUtils" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%><%
%><sling:defineObjects />
<html>
<head>
    <style type="text/css">
        table {
            border-collapse:collapse;
            border: 1px solid #cccccc;
        }
        td {
            border: 1px solid #cccccc;
            vertical-align:top;
        }
        a, a:visited {
            color:black;
        }
        a:active, a:hover {
            color:#888888;
            text-decoration: underline;
        }
    </style>
    <title>Client Libraries</title>
</head>
<body>
<h1>Test Category Resolution</h1>
<%
    String cs = request.getParameter("categories");
    String theme = request.getParameter("theme");
    if (theme != null && theme.length() == 0) {
        theme = null;
    }
    LibraryType type ;
    try {
        type = LibraryType.valueOf(request.getParameter("type").toUpperCase());
    } catch (Exception e) {
        type = LibraryType.JS;
    }
    boolean trans = "true".equals(request.getParameter("trans"));
    boolean ignore = "true".equals(request.getParameter("ignore"));

%>
<form action="">
    Categories: <input name="categories" value="<%= cs == null ? "" : StringEscapeUtils.escapeHtml4(cs) %>">&nbsp;&nbsp;&nbsp;
    Type:<input name="type" value="<%= type == null ? "js" : type %>">&nbsp;&nbsp;&nbsp;
    Transitive: <input type="checkbox" name="trans" value="true" <%= trans ? "checked" : "" %>>&nbsp;&nbsp;&nbsp;
    Ignore Themed: <input type="checkbox" name="ignore" value="true" <%= ignore ? "checked" : "" %>>&nbsp;&nbsp;&nbsp;
    Theme:<input name="theme" value="<%= theme  == null ? "" : StringEscapeUtils.escapeHtml4(theme) %>">&nbsp;&nbsp;&nbsp;
    <input type="submit">
</form>
<%
    HtmlLibraryManager mgr = sling.getService(HtmlLibraryManager.class);
    if (cs != null && cs.length() > 0) {
        String[] categs = Text.explode(cs, ',');
        %>Result:<br><%
        if (theme == null) {
            for (ClientLibrary lib: mgr.getLibraries(categs, type, ignore, trans)) {
                %><a href="#<%= lib.getPath()%>"><%= lib.getPath()%></a><br><%
            }
        } else {
            for (ClientLibrary lib: mgr.getThemeLibraries(categs, type, theme, trans)) {
                %><a href="#<%= lib.getPath()%>"><%= lib.getPath()%></a><br><%
            }
        }
    }
%>
<br>
Click <a href="<%= resource.getPath() %>.test.html">here</a> for output testing.<br>
Click <a href="<%= resource.getPath() %>.rebuild.html">here</a> for rebuilding all libraries.<br>
<h1>Libraries by Path</h1>
<table>
    <tr><th>Name</th><th>Types</th><th>Categories</th><th>Theme</th><th>Channels</th><th>Dependencies</th><th>Embedded</th></tr>
<%
    TreeMap<String, List<ClientLibrary>> categs = new TreeMap<String, List<ClientLibrary>>();
    TreeMap<String, List<ClientLibrary>> channels = new TreeMap<String, List<ClientLibrary>>();
    for (ClientLibrary lib: mgr.getLibraries().values()) {
        for (String c: lib.getCategories()) {
            List<ClientLibrary> list = categs.get(c);
            if (list == null) {
                list = new LinkedList<ClientLibrary>();
                categs.put(c, list);
            }
            list.add(lib);
        }
        for (String c: lib.getChannels()) {
            List<ClientLibrary> list = channels.get(c);
            if (list == null) {
                list = new LinkedList<ClientLibrary>();
                channels.put(c, list);
            }
            list.add(lib);
        }
        %>
            <tr><td><a name="<%= lib.getPath() %>"><%= lib.getPath() %></a></td>
            <td><% dumpTypes(out, lib); %></td>
            <td><% dumpCategs(out, lib.getCategories()); %></td>
            <td><% dumpTheme(out, lib); %></td>
            <td><% dumpChannels(out, lib.getChannels()); %></td>
            <td><% dumpDeps(out, lib.getDependencies(false).values()); %></td>
            <td><% dumpDeps(out, lib.getEmbedded(null).values()); %></td>
        </tr><%
    }
    %></table>
<h1>Libraries by Category</h1>
    <table>
        <tr><th>Category</th><th>Libraries</th></tr>
    <%
    for (String c: categs.keySet()) {
        StringBuffer treeURL = new StringBuffer();
        treeURL.append(resource.getPath());
        treeURL.append(".tree.html");
        treeURL.append("?categories=").append(c);
        if( type != null ) {
            treeURL.append("&type=").append(type);
        }
        treeURL.append("&ignore=").append(ignore);
        if( theme != null ) {
            treeURL.append("&theme=").append(theme);
        }
        %><tr><td><a name="<%=c%>" href="<%=treeURL%>"><%=c%></a></td><td><%
        for (ClientLibrary lib: categs.get(c)) {
            String p = lib.getPath();
            %><a href="#<%= p%>"><%=p%></a><br><%
        }
        %></td></tr><%
    }
    %></table>

<h1>Libraries by Channel</h1>
    <table>
        <tr><th>Channel</th><th>Libraries</th></tr>
    <%
    for (String c: channels.keySet()) {
        %><tr><td><a name="channel_<%=c%>"><%=c%></a></td><td><%
        for (ClientLibrary lib: channels.get(c)) {
            String p = lib.getPath();
            %><a href="#<%= p%>"><%=p%></a><br><%
        }
        %></td></tr><%
    }
    %></table><%

%></body></html><%!
    private void dumpCategs(JspWriter out, String[] categs) throws java.io.IOException {
        for (String c: categs) {
            out.print("<a href=\"#");
            out.print(c);
            out.print("\">");
            out.print(c);
            out.print("</a><br>");
        }
    }
    private void dumpChannels(JspWriter out, String[] categs) throws java.io.IOException {
        for (String c: categs) {
            out.print("<a href=\"#channel_");
            out.print(c);
            out.print("\">");
            out.print(c);
            out.print("</a><br>");
        }
    }
    private void dumpTypes(JspWriter out, ClientLibrary lib) throws java.io.IOException {
        for (LibraryType type: lib.getTypes()) {
            out.print("<a href=\"");
            out.print(lib.getIncludePath(type));
            out.print("\">");
            out.print(type);
            out.print("</a><br>");
        }
    }
    private void dumpTheme(JspWriter out, ClientLibrary lib) throws java.io.IOException {
        out.print(lib.getThemeName() != null ? lib.getThemeName() : "");
    }
    private void dumpDeps(JspWriter out, Collection<? extends ClientLibrary> categs) throws java.io.IOException {
        for (ClientLibrary c: categs) {
            out.print("<a href=\"#");
            out.print(c.getPath());
            out.print("\">");
            out.print(c.getPath());
            out.print("</a><br>");
        }

    }
%>