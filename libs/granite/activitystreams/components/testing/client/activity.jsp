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
             contentType="text/html"
             pageEncoding="utf-8"
             import="org.apache.sling.commons.json.JSONObject,
                     org.apache.sling.commons.json.io.JSONWriter,
                     com.adobe.granite.activitystreams.Activity,
                     com.adobe.granite.activitystreams.ActivityManager,
                     org.apache.sling.commons.json.JSONArray,
                     org.apache.sling.commons.json.JSONException" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.1" %><%
%><sling:defineObjects/><%

    ActivityManager mgr = sling.getService(ActivityManager.class);
    String id = request.getParameter("id");
    Activity activity = mgr.getActivity(resourceResolver, id);

    %><div class="activity-preview"><%
    if (activity != null) {
        JSONObject obj = activity.toJSON();
        JSONWriter w = new JSONWriter(out);
        w.setTidy(true);
        dump(w,  (Object) obj);
    }

    %></div><%!

    private void dump(JSONWriter w, Object o) throws JSONException {
        if (o instanceof JSONObject) {
            w.object();
            dump(w, (JSONObject) o);
            w.endObject();
        } else if (o instanceof JSONArray) {
            w.array();
            dump(w, (JSONArray) o);
            w.endArray();
        } else {
            w.value(o);
        }
    }
    private void dump(JSONWriter w, JSONObject obj) throws JSONException {
        JSONArray names = obj.names();
        for (int i=0; i<names.length(); i++) {
            String name = names.getString(i);
            w.key(name);
            dump(w, obj.get(name));
        }
    }

    private void dump(JSONWriter w, JSONArray arr) throws JSONException {
        for (int i=0; i<arr.length(); i++) {
            dump(w, arr.get(i));
        }
    }

    %>
