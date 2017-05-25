<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
            import="java.io.File,
                    org.apache.sling.api.request.RequestPathInfo"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

String path = request.getParameter("path");
if (path == null || path.trim().length() == 0) {
    response.sendError(404);
    return;
}

File file = new File(path);

if (!file.exists()) {
    response.sendError(404);
    return;
}

if (file.getAbsolutePath().endsWith(".zip")) {
    file.delete();
}
%>