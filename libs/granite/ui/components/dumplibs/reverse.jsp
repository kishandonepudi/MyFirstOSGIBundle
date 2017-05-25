<%@page session="false"%><%
%><%@page import="com.day.cq.widget.ClientLibrary,
            com.day.cq.widget.HtmlLibrary,
            com.day.cq.widget.HtmlLibraryManager,
            com.day.cq.widget.LibraryType,
            com.day.text.Text,
            org.apache.commons.lang3.StringEscapeUtils,
            java.util.*" %><%
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
<h1>View Path/Category Reverse Dependency Tree</h1>
    <%
    String path = request.getParameter("path");

    String cs = request.getParameter("categories");
    if (cs == null ) {
        cs = "";
    }
    LibraryType type ;
    try {
        type = LibraryType.valueOf(request.getParameter("type").toUpperCase());
    } catch (Exception e) {
        type = LibraryType.JS;
    }
    boolean ignore = "true".equals(request.getParameter("ignore"));

%>
<form action="">
    Path: <input name="path" value="<%= path == null ? "" : StringEscapeUtils.escapeHtml4(path) %>" size="78">&nbsp;&nbsp;&nbsp;
    <input type="submit">
</form>
<form action="">
    Categories: <input name="categories" value="<%= cs == null ? "" : StringEscapeUtils.escapeHtml4(cs) %>">&nbsp;&nbsp;&nbsp;
    Type:<input name="type" value="<%= type == null ? "js" : type %>">&nbsp;&nbsp;&nbsp;
    Ignore Themed: <input type="checkbox" name="ignore" value="true" <%= ignore ? "checked" : "" %>>&nbsp;&nbsp;&nbsp;
    <input type="submit">
</form>
    <%
    HtmlLibraryManager mgr = sling.getService(HtmlLibraryManager.class);
%>
<h2>Reverse Dependency tree</h2>
<%
    // get all libs
    Map<String, ClientLibrary> libs = mgr.getLibraries();

    if( path != null) {
        type = LibraryType.JS;
        if( path.endsWith(LibraryType.CSS.extension)) {
            type = LibraryType.CSS;
        }
        path = path.substring(0, path.lastIndexOf("."));

        ClientLibrary lib = libs.get(path);

        dumpReverseTree(out, mgr, libs, lib,  type);
    } else {
        Collection<ClientLibrary> foundLibs = mgr.getLibraries(cs.split(","), type, ignore, false);
        for(ClientLibrary lib: foundLibs) {
            dumpReverseTree(out, mgr, libs, lib,  type);
        }
    }
%><%!

    private void dumpReverseTree(JspWriter out, HtmlLibraryManager mgr, Map<String, ClientLibrary> allLibs, ClientLibrary lib, LibraryType type) throws java.io.IOException {

        out.print("<br>");
        out.print("<br>");
        out.print("<br>");

        out.print("<a href=\"");
        out.print("/libs/granite/ui/content/dumplibs.html#" + lib.getPath());
        out.print("\"/>");
        out.print(lib.getPath());
        out.print("</a> ");

        out.print("<br>");
        out.print("<br>");

        out.print("<table>");
        out.print("<tr><th>Include Path</th><th>Categories</th><th>Dependencies</th><th>Embedded</th></tr>");

        if( lib != null ) {
            //compute root categories
            Set<String> roots = new HashSet<String>();
            Collection<ClientLibrary> filteredLibs = new ArrayList<ClientLibrary>();
            filteredLibs.add(lib);
            String[] cats = lib.getCategories();
            roots.addAll(Arrays.asList(cats));

            //filter the libs and isolate the roots
            reverseFindDep( allLibs, roots, filteredLibs, cats);

            //output the tree
            for(String currentCategory: roots) {
                dumpReverseCatTree(out, lib.getPath(), filteredLibs, type, currentCategory, 0);
            }
        }

        out.print("</table>");
    }

    private void reverseFindDep(Map<String, ClientLibrary> libs, Set<String> roots, Collection<ClientLibrary> filteredLibs, String[] cats) throws java.io.IOException {
        for(int i = 0; i < cats.length;i++) {
            for(String p: libs.keySet()) {
                ClientLibrary cLib = libs.get(p);
                if( !filteredLibs.contains(cLib) && Arrays.asList(cLib.getDependentCategories()).contains(cats[i])) {
                    roots.addAll(Arrays.asList(cLib.getCategories()));
                    roots.remove(cats[i]);

                    filteredLibs.add(cLib);

                    reverseFindDep( libs, roots, filteredLibs, cLib.getCategories());
                }
            }
        }
    }


    private void dumpReverseCatTree(JspWriter out, String path, Collection<ClientLibrary> libs, LibraryType type, String category, int level)  throws java.io.IOException {
        for (ClientLibrary lib: libs) {
            if( Arrays.asList(lib.getCategories()).contains(category)) {
                Iterator<LibraryType> iter = lib.getTypes().iterator();
                while(iter.hasNext()) {
                    LibraryType currentType = iter.next();
                    if( type == null || currentType.equals(type)) {
                        dumpLib(out, path, lib, currentType, level);
                        String[] deps = lib.getDependentCategories();
                        if( !lib.getPath().equals(path)) {
                            for(int i = 0;i<deps.length;i++) {
                                dumpReverseCatTree(out, path, libs, currentType, deps[i], level+1);
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

    private void dumpLib(JspWriter out, String selectedPath, ClientLibrary lib, LibraryType type, int level) throws java.io.IOException {
        out.print("<tr>");

        //path
        out.print("<td>");
        indent(out, level);
        String path = lib.getIncludePath(type);
        if( lib.getPath().equals(selectedPath) ) {
            out.print("<b>");
        }
        out.print("<a href=\"?path=");
        out.print(path);
        out.print("\">");
        out.print(path);
        out.print("</a>");
        if( lib.getPath().equals(selectedPath) ) {
            out.print("</b>");
        }
        out.print("</td>");

        //categories
        out.print("<td>");
        indent(out, level);
        dumpCats(out,lib.getCategories());
        out.print("</td>");

        out.print("<td>");
        dumpCats(out,lib.getDependentCategories());
        out.print("</td>");

        out.print("<td>");
        dumpCats(out,lib.getEmbeddedCategories());
        out.print("</td>");

        out.print("</tr>");
    }

    private void dumpCats(JspWriter out, String[] cats) throws java.io.IOException {
        for( int i = 0; i < cats.length; i++) {
            String c = cats[i];
            out.print("<a href=\"");
            out.print("/libs/granite/ui/content/dumplibs.html#" + c);
            out.print("\"/>");
            out.print(c);
            out.print("</a> ");

        }
    }
%>