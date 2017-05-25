<%--

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
--%><%@ page session="false"
             contentType="application/json"
             pageEncoding="utf-8"
             import="javax.jcr.Session,
                     org.apache.jackrabbit.util.Text,
                     org.apache.jackrabbit.api.JackrabbitSession,
                     org.apache.sling.commons.json.io.JSONWriter,
                     org.apache.jackrabbit.api.security.user.UserManager,
                     java.util.Iterator,
                     org.apache.jackrabbit.api.security.user.Authorizable,
                     org.apache.jackrabbit.api.security.user.User,
                     java.io.IOException,
                     org.apache.sling.commons.json.JSONException,
                     javax.jcr.RepositoryException,
                     javax.jcr.Value, javax.jcr.NodeIterator, javax.jcr.query.Query" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.1" %><%
%><sling:defineObjects/><%

        Session s = resourceResolver.adaptTo(Session.class);
        if (!(s instanceof JackrabbitSession)) {
            response.sendError(500, "No jackrabbit session");
            return;
        }
        String suffix = slingRequest.getRequestPathInfo().getSuffix();
        String userId = null;
        if (suffix != null && suffix.length() > 0) {
            String[] segs = Text.explode(suffix, '/');
            userId = segs[0];
        }

        JSONWriter w = new JSONWriter(response.getWriter());
        try {
            UserManager uMgr = ((JackrabbitSession) s).getUserManager();
            if (userId == null) {
                w.array();
                // workaround for bug GRANITE-1312
                Query q = s.getWorkspace().getQueryManager().createQuery("/jcr:root//element(*,rep:User)", Query.XPATH);
                NodeIterator iter = q.execute().getNodes();
                while (iter.hasNext()) {
                    String path = iter.nextNode().getPath();
                    User user = (User) uMgr.getAuthorizableByPath(path);
                    writeProfile(s, w, user);
                }
                w.endArray();
            } else {
                Authorizable auth = uMgr.getAuthorizable(userId);
                if (auth instanceof User) {
                    writeProfile(s, w, (User) auth);
                } else {
                    w.object().endObject();
                }

            }

        } catch (Exception e) {
            IOException io = new IOException();
            io.initCause(e);
            throw io;
        }
%><%!
    private void writeProfile(Session s, JSONWriter w, User user) throws RepositoryException, JSONException {
        w.object();
        w.key("userid").value(user.getID());
        Iterator<String> names = null;
        try {
            names = user.getPropertyNames("profile");
        } catch (RepositoryException e) {
            // ignore
        }
        String givenName = "";
        String familyName = "";
        while (names != null && names.hasNext()) {
            String name = names.next();
            Value[] vals = user.getProperty("profile/" + name);
            if (vals.length > 0) {
                w.key(name).value(vals[0].getString());
                if (name.equals("givenName")) {
                    givenName = vals[0].getString();
                } else if (name.equals("familyName")) {
                    familyName = vals[0].getString();
                }
            }
        }
        StringBuilder formattedName = new StringBuilder();
        if (givenName.length() > 0) {
            formattedName.append(givenName);
        }
        if (familyName.length() > 0) {
            if (formattedName.length() > 0) {
                formattedName.append(" ");
            }
            formattedName.append(familyName);
        }
        if (formattedName.length() == 0) {
            formattedName.append(user.getID());
        }
        w.key("formattedName").value(formattedName.toString());
        String avatarPath = user.getPath() + "/profile/photos/primary/image";
        if (!s.nodeExists(avatarPath)) {
            avatarPath = "";
        }
        w.key("avatar").value(avatarPath);
        w.endObject();

    }
%>