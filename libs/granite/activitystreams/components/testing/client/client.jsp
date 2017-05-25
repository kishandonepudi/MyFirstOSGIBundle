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
             import="java.util.Iterator,
                     org.apache.jackrabbit.api.JackrabbitSession,
                     org.apache.jackrabbit.api.security.user.Authorizable,
                     org.apache.jackrabbit.api.security.user.User,
                     org.apache.jackrabbit.api.security.user.UserManager,
                     com.day.cq.widget.HtmlLibraryManager, javax.jcr.Session, javax.jcr.query.Query, javax.jcr.NodeIterator" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.1" %><%
%><sling:defineObjects/><%
    HtmlLibraryManager libMgr = sling.getService(HtmlLibraryManager.class);

    Session s = resourceResolver.adaptTo(Session.class);
    // workaround for bug GRANITE-1312
    Query q = s.getWorkspace().getQueryManager().createQuery("/jcr:root//element(*,rep:User)", Query.XPATH);
    NodeIterator iter = q.execute().getNodes();
    UserManager uMgr = ((JackrabbitSession) s).getUserManager();
    StringBuilder userOptions = new StringBuilder();
    while (iter.hasNext()) {
        String path = iter.nextNode().getPath();
        User user = (User) uMgr.getAuthorizableByPath(path);
        userOptions.append("<option value=\"").append(user.getPath()).append("\">").append(user.getID()).append("</option>");
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Activity Streams Client</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <%
        libMgr.writeIncludes(slingRequest, out, "granite.activitystreams.testing");
    %>
</head>
<body>
<div class="navbar navbar-fixed-top">
    <div class="navbar-inner">
        <ul class="nav">
            <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                    Administrator
                    <b class="caret"></b>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="#"><i class="icon-cog"></i> Settings</a></li>
                    <li><a href="/bin/logout" id="logout"><i class="icon-off"></i> Logout</a></li>
                </ul>
            </li>
            <li class="divider-vertical"></li>
            <li><a href="/">Home</a></li>
            <li class="active"><a href="/libs/granite/activitystreams/content/testing/client.html">Activities</a></li>
            <li><a href="/libs/granite/activitystreams/content/testing/social.html">Social</a></li>
            <li><a href="/crx/de">CRXDE</a></li>
        </ul>
    </div>
</div>


<div class="row">
    <div class="span6">
        <div class="page-header">
            <h1>Activity Stream</h1>
        </div>
        <div class="form-horizontal">
            <div class="control-group">
                <label class="control-label" for="input-user">User</label>
                <div class="controls">
                    <select class="input-xlarge" id="input-user" data-target="#activitystream"><%= userOptions %></select>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="input-stream">Stream</label>
                <div class="controls">
                    <select class="input-large" id="input-stream" data-target="#activitystream">
                        <!-- filled by template: -->
                        <script id="granite-tpl-activitystreamlist" type="text/template">
                            <@ _.each(model.models, function(value, key) { @>
                            <option value="<@= value.get('id') @>"><@= value.get('name') @> (<@= value.get('containerId') @>)</option>
                            <@ }); @>
                        </script>
                    </select>
                    <a href="#" class="btn" data-toggle="modal" data-target="#dlg-create-activitystream"><i class="icon-plus-sign"></i> Create</a>
                </div>
            </div>
        </div>
        <table class="table table-striped table-bordered table-condensed">
            <thead>
            <tr><th>Actor</th><th>Date</th><th>Title</th></tr>
            </thead>
            <tbody id="activitystream">
                <!-- filled by template -->
                <script id="granite-tpl-activitystream" type="text/template">
                    <@ _.each(model.models, function(value, key) { @>
                    <tr data-toggle="activity" data-activity-id="<@= value.get('id') @>" data-target="#json_dump">
                        <td><@= value.get('actorId') @></td>
                        <td><@= value.get('published') @></td>
                        <td><@= value.get('title') @></td>
                    </tr>
                    <@ }); @>
                </script>
            </tbody>
        </table>

    </div>
    <div class="span6">
        <div class="page-header">
            <h1>Activity <a href="#" class="btn pull-right" data-toggle="modal" data-target="#dlg-create-activity"><i class="icon-plus-sign"></i> Create</a></h1>
        </div>
        <div class="well" id="json_dump" data-url="<%= resource.getPath()%>.activity.html">
            <sling:include replaceSelectors="activity"/>
        </div>
    </div>

</div>



<div class="modal hide" id="dlg-create-activity" data-backdrop="false">
    <div class="modal-header">
        <a class="close" data-dismiss="modal">x</a>
        <h3>Create Activity</h3>
    </div>
    <div class="modal-body">
        <form class="form-horizontal">
            <div class="tabbable" style="margin-bottom: 18px;">
                <ul class="nav nav-tabs">
                    <li class="active"><a href="#tab1" data-toggle="tab">Activity</a></li>
                    <li class=""><a href="#tab2" data-toggle="tab">Object</a></li>
                    <li class=""><a href="#tab3" data-toggle="tab">Target</a></li>
                </ul>
                <div class="tab-content" style="padding-bottom: 9px; border-bottom: 1px solid #ddd;">
                    <div class="tab-pane active" id="tab1">
                        <fieldset>
                            <div class="control-group">
                                <label class="control-label">Stream</label>
                                <div class="controls">
                                    <input name="path" type="text" class="input-xlarge" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-actor">Actor</label>
                                <div class="controls">
                                    <select name="actorId" class="input-xlarge" id="input-actor" data-target="#activitystream"><%= userOptions %></select>
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-verb">Verb</label>
                                <div class="controls">
                                    <input name="verb" type="text" class="input-xlarge" id="input-verb" value="post">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-title">Title</label>
                                <div class="controls">
                                    <input name="title" type="text" class="input-xlarge" id="input-title" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-content">Content</label>
                                <div class="controls">
                                    <input name="content" type="text" class="input-xlarge" id="input-content" value="">
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div class="tab-pane" id="tab2">
                        <fieldset>
                            <div class="control-group">
                                <label class="control-label" for="input-obj-type">Object Type</label>
                                <div class="controls">
                                    <input name="object-type" type="text" class="input-xlarge" id="input-obj-type" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-obj-dispname">Display Name</label>
                                <div class="controls">
                                    <input name="object-displayname" type="text" class="input-xlarge" id="input-obj-dispname" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-obj-content">Content</label>
                                <div class="controls">
                                    <input name="object-content" type="text" class="input-xlarge" id="input-obj-content" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-obj-summary">Summary</label>
                                <div class="controls">
                                    <input name="object-summary" type="text" class="input-xlarge" id="input-obj-summary" value="">
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div class="tab-pane" id="tab3">
                        <fieldset>
                            <div class="control-group">
                                <label class="control-label" for="input-target-type">Object Type</label>
                                <div class="controls">
                                    <input name="target-type" type="text" class="input-xlarge" id="input-target-type" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-target-dispname">Display Name</label>
                                <div class="controls">
                                    <input name="target-displayname" type="text" class="input-xlarge" id="input-target-dispname" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-target-content">Content</label>
                                <div class="controls">
                                    <input name="target-content" type="text" class="input-xlarge" id="input-target-content" value="">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="input-target-summary">Summary</label>
                                <div class="controls">
                                    <input name="target-summary" type="text" class="input-xlarge" id="input-target-summary" value="">
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        </form>

    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" data-target="#activitystream" data-toggle="create-activity">Create</button>
    </div>
</div>

<div class="modal hide" id="dlg-create-activitystream" data-backdrop="false">
    <div class="modal-header">
        <a class="close" data-dismiss="modal">x</a>
        <h3>Create Activity Stream</h3>
    </div>
    <div class="modal-body">
        <form class="form-horizontal">
            <fieldset>
                <div class="control-group">
                    <label class="control-label" for="input-stream-container">Container</label>
                    <div class="controls">
                        <input name="container" type="text" class="input-xlarge" id="input-stream-container" value="">
                    </div>
                </div>
                <div class="control-group">
                    <label class="control-label" for="input-stream-name">Stream Name</label>
                    <div class="controls">
                        <input name="name" type="text" class="input-xlarge" id="input-stream-name" value="">
                    </div>
                </div>
            </fieldset>
        </form>

    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" data-target="#activitystream" data-toggle="create-activitystream">Create</button>
    </div>
</div>

<script>
    jQuery(function($){
        var app = new ActivityStreams.Client();
        app.start();
    })
</script>

</body>
</html>
