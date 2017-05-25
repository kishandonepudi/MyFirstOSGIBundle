<%@page session="false"%><%--

  ADOBE CONFIDENTIAL
  __________________

   Copyright 2012 Adobe Systems Incorporated
   All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
  --%>
<%
%><%@page import="java.io.IOException,
            java.io.PrintWriter,
            javax.jcr.Node,
            javax.jcr.NodeIterator,
            javax.jcr.RepositoryException,
            javax.jcr.Session,
            com.day.cq.widget.HtmlLibrary,
            com.day.cq.widget.HtmlLibraryManager,
            com.day.cq.widget.LibraryType" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%><%!

    public static String TMP_LOCATION = "/var/clientlibs";

    private long rebuild(HtmlLibrary lib, boolean minified, PrintWriter w) {
        long now = System.currentTimeMillis();
        String path = lib.getPath(minified);
        w.printf("building <a href=\"%s\">%s</a>...", path, path);
        w.flush();
        try {
            lib.getInputStream(minified).close();
        } catch (IOException e) {
            w.printf("<font color=\"red\">error: %s</font><br>", e.toString());
            w.flush();
            return 0;
        }
        long time = System.currentTimeMillis() - now;
        w.printf("done (%dms)<br>", time);
        w.flush();
        return time;
    }

    private void removeGenerated(Node parent, PrintWriter w) throws RepositoryException {
        if (parent.hasNode("generated")) {
            Node node = parent.getNode("generated");
            long now = System.currentTimeMillis();
            w.printf("Removing <strong>%s</strong>...", node.getPath());
            w.flush();
            node.remove();
            parent.getSession().save();
            w.printf("done (%dms)<br>", System.currentTimeMillis() - now);
            w.flush();
        }
        NodeIterator iter = parent.getNodes();
        while (iter.hasNext()) {
            removeGenerated(iter.nextNode(), w);
        }
    }
%><sling:defineObjects />
<html>
<head>
    <title>Rebuild Client Libraries</title>
</head>
<body>
<h1>Rebuild Client Libraries</h1>
<form action="#end">
    <button name="invalidate" value="true">Invalidate Caches</button><br>
    <button name="rebuild" value="true">Rebuild Libraries</button>
</form>
<%
    HtmlLibraryManager mgr = sling.getService(HtmlLibraryManager.class);
    PrintWriter w = new PrintWriter(out);
    Session s = slingRequest.getResourceResolver().adaptTo(Session.class);
    if ("true".equals(request.getParameter("invalidate"))) {
        w.print("<hr size=1><h2>Invalidate Caches</h2>");
        if (s.nodeExists(TMP_LOCATION)) {
            long now = System.currentTimeMillis();
            w.println("Removing <strong>" + TMP_LOCATION + "</strong>...");
            w.flush();
            s.getNode(TMP_LOCATION).remove();
            s.save();
            w.printf("done (%dms)<br>", System.currentTimeMillis() - now);
        }
        for (String path: mgr.getLibraries().keySet()) {
            if (s.nodeExists(path)) {
                removeGenerated(s.getNode(path), w);
            }
        }
        w.println("<strong>done.</strong>");
    }

    if ("true".equals(request.getParameter("rebuild"))) {
        w.print("<hr size=1><h2>Rebuilding Libraries</h2>");
        long totalCSS = 0;
        long totalJS = 0;
        long totalMinCSS = 0;
        long totalMinJS = 0;
        int numCSS = 0;
        int numJS = 0;
        for (String path: mgr.getLibraries().keySet()) {
            HtmlLibrary lib = mgr.getLibrary(LibraryType.JS, path);
            if (lib != null) {
                numJS++;
                totalJS += rebuild(lib, false, w);
                totalMinJS += rebuild(lib, true, w);
            }
            lib = mgr.getLibrary(LibraryType.CSS, path);
            if (lib != null) {
                numCSS++;
                totalCSS += rebuild(lib, false, w);
                totalMinCSS += rebuild(lib, true, w);
            }
        }
        w.printf("<br><strong>done.</strong><br>");
        w.printf("<br>Rebuilt %d CSS libraries in %dms (%dms minified)<br>", numCSS, totalCSS, totalMinCSS);
        w.printf("Rebuilt %d JS libraries in %dms (%dms minified)<br>", numJS, totalJS, totalMinJS);
        w.printf("<br>Total: <strong>%.3f seconds</strong><br>", (float) (totalCSS+totalJS+totalMinCSS+totalMinJS) / 1000.0);
    }

%><a name="end"></a>
</body>
</html>
