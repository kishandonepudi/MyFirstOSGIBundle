<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
            import="java.io.File,
                    java.io.InputStream,
                    java.io.BufferedInputStream,
                    java.io.FileInputStream,
                    java.io.OutputStream"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

String path = slingRequest.getParameter("path");
if (path == null) {
    response.sendError(404);
    return;
}

File file = new File(path);

if (!file.exists() || !file.getName().endsWith(".zip")) {
    response.sendError(404);
    return;
}

response.setContentType("application/zip");
response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
InputStream in = new BufferedInputStream(new FileInputStream(file));
try {
    OutputStream responseOut = response.getOutputStream();
    byte[] buffer = new byte[4 * 1024];
    while (true) {
        int len = in.read(buffer, 0, buffer.length);
        if (len < 0) {
            break;
        }
        responseOut.write(buffer, 0, len);
    }
    responseOut.flush();
} finally {
    in.close();
}
%>