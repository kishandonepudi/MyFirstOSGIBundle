<%--
  Copyright 2011 Adobe Systems Incorporated.
  All Rights Reserved.

  ==============================================================================

  jQuery Mobile Based Backup Admin

  ==============================================================================

--%><%@page import="java.util.ArrayList"%>
<%@page session="false"
          import="java.io.File,
                  java.io.FilenameFilter,
                  java.io.IOException,
                  java.lang.management.ManagementFactory,
                  java.util.Arrays,
                  java.util.Comparator,
                  java.util.Set,
                  javax.management.JMException,
                  javax.management.MBeanServerConnection,
                  javax.management.ObjectName,
                  javax.management.OperationsException,
                  org.apache.sling.commons.json.io.JSONWriter" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

MBeanServerConnection server = ManagementFactory.getPlatformMBeanServer();
ObjectName name = getRepositoryMBean(server);

String dir = request.getParameter("dir");

response.setContentType("application/json; charset=utf-8");
JSONWriter writer = new JSONWriter(out);

File current = getCurrent(server, name, dir);
File[] files = getBackups(server, name, dir);

writer.array();

if (current != null) {
	writer.object();
	writer.key("name").value(current.getName());
	writer.key("path").value(current.getAbsolutePath());
	writer.key("inprogress").value(true);
	writer.key("progress").value(getProgress(server, name));
	writer.endObject();
}
  
for (File file : files) {
    writer.object();
    writer.key("name").value(file.getName());
    writer.key("length").value(file.length());
    writer.key("lastModified").value(file.lastModified());
    writer.key("path").value(file.getAbsolutePath());
    writer.endObject();
}
writer.endArray();
%><%!
private static File getCurrent(MBeanServerConnection server, ObjectName name, String targetDir) throws Exception {
    String currentPath = getCurrentPath(server, name);
    File dir = getTargetDir(server, name, targetDir);
    
    if (currentPath != null && currentPath.endsWith(".zip") && currentPath.startsWith(dir.getAbsolutePath())) {
        return new File(currentPath);
    }
    
    return null;
}

private static File getTargetDir(MBeanServerConnection server, ObjectName name, String targetDir) throws Exception {
    if (targetDir == null || targetDir.trim().length() == 0)
        return new File(getHomeDir(server, name)).getCanonicalFile().getParentFile().getParentFile().getParentFile();
    else {
        return new File(targetDir);
    }
}

private static File[] getBackups(MBeanServerConnection server, ObjectName name, String targetDir) throws Exception {
    File dir = getTargetDir(server, name, targetDir);
    
    File[] list = dir.listFiles(new FilenameFilter() {
        public boolean accept(File dir, String name) {
            return name.endsWith(".zip");
        }
    });
    
    if (list == null) {
        list = new File[0];
    }
    
    Arrays.sort(list, new Comparator<File>() {
        public int compare(File a, File b) {
            long ma = a.lastModified();
            long mb = b.lastModified();
            return ma < mb ? 1 : ma > mb ? -1 : 0;
        }
    });
    
    return list;
}

private static String getCurrentPath(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (String) server.getAttribute(name, "CurrentBackupTarget");
    } catch (JMException e) {
        throw new Exception("Error occur getting current backup target", e);
    }
}

private static int getProgress(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (Integer) server.getAttribute(name, "BackupProgress");
    } catch (JMException e) {
        throw new Exception("Error occur getting backup progress", e);
    }
}

private static String getHomeDir(MBeanServerConnection server, ObjectName name) throws Exception {
    try {
        return (String) server.getAttribute(name, "HomeDir");
    } catch (JMException e) {
        throw new Exception("Error occur getting repository home dir", e);
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