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
             import="java.text.DateFormat,
                     java.text.SimpleDateFormat,
                     java.util.Date,
                     com.adobe.granite.activitystreams.Activity,
                     com.adobe.granite.activitystreams.ActivityCollection,
                     com.adobe.granite.activitystreams.ActivityManager" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.1" %><%
%><sling:defineObjects/><%
    DateFormat fmt = new SimpleDateFormat("yyyy.MM.dd HH:mm:ss");
    ActivityManager mgr = sling.getService(ActivityManager.class);
    String userId = request.getParameter("userId");
    ActivityCollection coll = mgr.getActivities(resourceResolver, userId);
%><thead>
    <tr><th>Actor</th><th>Date</th><th>Title</th></tr>
</thead>
<tbody>
    <% for (Activity activity: coll.getActivities(0, 0)) { %>
    <tr data-toggle="activity" data-activity-id="<%= activity.getId()%>" data-target="#json_dump">
        <td><%= activity.getActorUserId() %></td>
        <td><%= fmt.format(new Date(activity.getPublished())) %></td>
        <td><%= activity.getTitle() %></td>
    </tr>
    <% } %>
</tbody>