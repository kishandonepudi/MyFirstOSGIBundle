<%@page session="false"%><%
%><%@page import="com.day.cq.widget.ClientLibrary,
            com.day.cq.widget.HtmlLibraryManager,
            com.day.text.Text,
            com.day.cq.widget.LibraryType,
            org.apache.commons.lang3.StringEscapeUtils,
            java.util.Collection,
            java.util.Set,
            java.util.Arrays,
            java.util.Iterator,
            java.util.HashSet" %><%
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
<h1>View Category Dependency Tree</h1>
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
    String[] categs = null;
    HtmlLibraryManager mgr = sling.getService(HtmlLibraryManager.class);
    if (cs != null && cs.length() > 0) {
        categs = Text.explode(cs, ',');
        %>Result:<br><%
        if (theme == null) {
            for (ClientLibrary lib: mgr.getLibraries(categs, type, ignore, trans)) {
                %><a href="<%=resource.getPath()%>.html#<%= lib.getPath()%>"><%= lib.getPath()%></a><br><%
            }
        } else {
            for (ClientLibrary lib: mgr.getThemeLibraries(categs, type, theme, trans)) {
                %><a href="<%=resource.getPath()%>.html#<%= lib.getPath()%>"><%= lib.getPath()%></a><br><%
            }
        }
    }
%>
<br>
Click <a href="<%= resource.getPath() %>.test.html">here</a> for output testing.
<h2>Dependency tree</h2>
<%
    if( categs != null) {
        dumpTree(out, mgr, categs, type, ignore);
    }
%><%!

    private void dumpTree(JspWriter out, HtmlLibraryManager mgr, String[] categories, LibraryType reqType, boolean ignoreTheme) throws java.io.IOException {
        // get all libs
        Collection<ClientLibrary> libs = mgr.getLibraries(categories,reqType,ignoreTheme,true);

        out.print("<table>");
        out.print("<tr><th>Include Path</th><th>Categories</th><th>Dependencies</th><th>Embedded</th></tr>");
        Set<String> included = new HashSet<String>();
        // ensure that the client lib mgr is loaded (includes GraniteTiming)
        for(String currentCategory: categories) {
            dumpDepTree(out, libs, reqType, currentCategory, included, 0);
        }


        out.print("</table>");
    }

    private void dumpDepTree(JspWriter out, Collection<ClientLibrary> libs, LibraryType type, String category, Set<String> included, int level)  throws java.io.IOException {
        for (ClientLibrary lib: libs) {
            if( Arrays.asList(lib.getCategories()).contains(category)) {
                Iterator<LibraryType> iter = lib.getTypes().iterator();
                while(iter.hasNext()) {
                    LibraryType currentType = iter.next();
                    if( type == null || currentType.equals(type)) {
                        dumpLib(out,lib, currentType, included, level);
                        String[] deps = lib.getDependentCategories();
                        for(int i = 0;i<deps.length;i++) {
                            if( !included.contains(deps[i]) ) {
                                dumpDepTree(out, libs, currentType, deps[i], included, level+1);
                            }
                        }
                    }
                }
            }
        }
    }

    private void indent(JspWriter out, int level) throws java.io.IOException {
        for( int i=0;i<level;i++) {
            out.print("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
        }
    }

    private void dumpLib(JspWriter out, ClientLibrary lib, LibraryType type, Set<String> included, int level) throws java.io.IOException {
        included.addAll(Arrays.asList(lib.getCategories()));

        out.print("<tr>");

        //path
        out.print("<td>");
        indent(out, level);
        String path = lib.getIncludePath(type);
        out.print("<a href=\"/libs/granite/ui/content/dumplibs.reverse.html?path=");
        out.print(path);
        out.print("\">");
        out.print(path);
        out.print("</a>");
        out.print("</td>");

        //categories
        out.print("<td>");
        indent(out, level);
        dumpCats(out,lib.getCategories(),included, false);
        out.print("</td>");

        out.print("<td>");
        dumpCats(out,lib.getDependentCategories(),included, true);
        out.print("</td>");

        out.print("<td>");
        dumpCats(out,lib.getEmbeddedCategories(),included, false);
        out.print("</td>");

        out.print("</tr>");
    }

    private void dumpCats(JspWriter out, String[] cats, Set<String> included, boolean markIncluded) throws java.io.IOException {
        for( int i = 0; i < cats.length; i++) {
            String c = cats[i];
            if( markIncluded && included.contains(c)) {
                c = "<s>" + c + "</s>";
            }
            out.print("<a href=\"");
            out.print("/libs/granite/ui/content/dumplibs.html#" + c);
            out.print("\"/>");
            if( markIncluded && included.contains(c)) {
                out.print("<s>" + c + "</s>");
            } else {
                out.print(c);
            }
            out.print("</a> ");

        }
    }
%>