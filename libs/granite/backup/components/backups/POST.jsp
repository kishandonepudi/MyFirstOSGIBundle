<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page session="false"
          import="java.io.File,
                  java.io.IOException,
                  java.io.UnsupportedEncodingException,
                  java.lang.management.ManagementFactory,
                  java.util.Set,
                  java.net.URLEncoder,
                  javax.management.Attribute,
                  javax.management.JMException,
                  javax.management.MBeanServerConnection,
                  javax.management.ObjectName,
                  javax.management.OperationsException" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

if (isInProgress(server, name)) {
    response.sendRedirect(request.getContextPath() + "/libs/granite/backup/content/admin/backup.inprogress.html");
    return;
}

String target = request.getParameter("target");
String installDirPath = request.getParameter("installDir");
boolean force = "true".equals(request.getParameter("force"));

if (!force) {
    String key = check(server, name, installDirPath, target);
    if (key != null) {
        response.sendRedirect(request.getContextPath() + "/libs/granite/backup/content/admin/backup.confirm.html?key=" + key);
        return;
    }
}

String delayRaw = request.getParameter("delay");
Integer delay = null;
if (delayRaw != null && delayRaw.trim().length() > 0) {
    delay = new Integer(delayRaw);
    setDelay(server, name, delay);
}

startBackup(server, name, installDirPath, target);

response.sendRedirect(request.getContextPath() + "/libs/granite/backup/content/admin/backup.html?new=true&path=" + encode(getCurrentPath(server, name)));
%><%!
private static String check(MBeanServerConnection server, ObjectName name, String installDirPath, String target) throws Exception {
    if (target == null || target.length() == 0) {
        return null;
    }
    
    if (target.endsWith(".zip")) {
        return null;
    }
    
    // Duplicating target resolution logic to avoid changing the core backup. See #39463
    // TODO avoid duplication :P
    File homeDir = null;
    try {
        String homeDirString = (String) server.getAttribute(name, "HomeDir");
        homeDir = new File(homeDirString);
        homeDir = homeDir.getCanonicalFile();
    } catch (JMException e) {
        throw new Exception("Error occur getting if backup is in progress", e);
    } catch (IOException e) {
        throw new Exception("Unexpected repository directory: " + homeDir, e);
    }

    File installDir = new File(installDirPath);
    File targetFile = new File(target);

    if (!targetFile.isAbsolute()) {
        targetFile = new File(installDir.getParentFile(), target);
    }
    
    String[] list = targetFile.list();
    if (list != null && list.length > 0)
        return "notempty";
    
    return null;
}

private static String encode(String url) {
    try {
        return URLEncoder.encode(url, "UTF-8");
    } catch (UnsupportedEncodingException e) {
        throw new RuntimeException(e);
    }
}

private static boolean isInProgress(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (Boolean) server.getAttribute(name, "BackupInProgress");
    } catch (JMException e) {
        throw new Exception("Error occur getting if backup is in progress", e);
    }
}

private static String getCurrentPath(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (String) server.getAttribute(name, "CurrentBackupTarget");
    } catch (JMException e) {
        throw new Exception("Error occur getting current backup", e);
    }
}

private static void setDelay(MBeanServerConnection server, ObjectName name, int delay) throws Exception {
    try {
        Attribute a = new Attribute("BackupDelay", new Integer(delay));
        server.setAttribute(name, a);
    } catch (JMException e) {
        throw new Exception("Error occur starting backup", e);
    }
}

private static void startBackup(MBeanServerConnection server, ObjectName name, String installDirPath, String target) throws Exception {
    try {
        server.invoke(name, "startBackup", new Object[] { installDirPath, target },
            new String[] { String.class.getName(), String.class.getName() });
    } catch (JMException e) {
        throw new Exception("Error occur starting backup", e);
    }
}

private static ObjectName getRepositoryMBean(MBeanServerConnection server)
        throws OperationsException, IOException {
    Set<ObjectName> names = server.queryNames(new ObjectName(
        "com.adobe.granite:type=Repository,*"), null);

    if (names.isEmpty()) {
        return null;
    }

    return names.iterator().next();
}
%>