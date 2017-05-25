<%--

  ADOBE CONFIDENTIAL
  __________________

   Copyright 2011 Adobe Systems Incorporated
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
<%@page session="false"
        import="com.day.cq.replication.*,
                org.apache.commons.lang3.StringEscapeUtils,
                java.io.UnsupportedEncodingException,
                java.net.URLEncoder" %>
<%
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %>
<%
%><sling:defineObjects/><%

    String path = request.getParameter("path");
    AgentManager mgr = sling.getService(AgentManager.class);
    ConfigManager cfgMgr = sling.getService(ConfigManager.class);
    AgentConfig cfg = cfgMgr.getConfigurations().get(path);

    if (cfg == null) {
        response.sendError(404);
        return;
    }

    Agent agent = mgr.getAgents().get(cfg.getAgentId());
    ReplicationQueue queue = agent == null ? null : agent.getQueue();

    String queueStr = "not active";
    String queueCls = "agent-queue";
    boolean paused;
    if (queue != null) {
        paused = queue.isPaused();
        int num = queue.entries().size();
        if (queue.isPaused()) {
            queueStr = "paused";
            queueCls += "-blocked";
        } else if (queue.getStatus().getNextRetryTime() > 0) {
            queueStr = "blocked - " + num + " pending";
            queueCls += "-blocked";
        } else {
            if (num == 0) {
                queueStr = "idle";
                queueCls += "-idle";
            } else {
                queueStr = "active - " + num + " pending";
                queueCls += "-active";
            }
        }
    } else {
        queueCls += "-inactive";
        paused = false;
    }

    String status;
    String uri = cfg.getProperties().get("transportUri", "(not configured)");
    String message = "Replicating to <strong>" + uri + "</strong>";
    String globalIcnCls = "agent-header";
    String statusIcnCls = "agent-status";
    if (agent == null) {
        status = "not active";
        statusIcnCls += "-inactive";
        globalIcnCls += "-off";
    } else {
        try {
            agent.checkValid();
            if (agent.isEnabled()) {
                status = "enabled";
                globalIcnCls += "-on";
                statusIcnCls += "-ok";
            } else {
                status = "disabled";
                globalIcnCls += "-off";
                statusIcnCls += "-disabled";
            }
        } catch (IllegalArgumentException e) {
            message = StringEscapeUtils.escapeHtml4(e.getMessage());
            status = "not valid";
            globalIcnCls += "-off";
            statusIcnCls += "-invalid";
        }
    }

    String pageId = "g-agent-" + cfg.getAgentId();
    String name = cfg.getName();
    if ("".equals(name)) name = cfg.getAgentId();
    String escapedName = StringEscapeUtils.escapeHtml4(name);
%>
<div id="<%=pageId%>" data-role="page"
     data-title="CRX Replication | <%= escapedName %>"
     data-url="<%=request.getRequestURI()%>?path=<%=encode(path)%>">

<div data-role="header">
    <h1><%= escapedName %>
    </h1>
</div>

<div data-role="content">
    <div class="agent">
        <h1><%= escapedName %>
            (<%= StringEscapeUtils.escapeHtml4(cfg.getAgentId()) %>)</h1>

        <p><%= StringEscapeUtils.escapeHtml4(cfg.getProperties().get("jcr:description", "")) %>
        </p>

        <ul class="status">
            <li class="enabled <%= statusIcnCls %>"><p>Agent is
                <strong><%= status %>
                </strong>. <%= message %>
            </p></li>
            <li class="queue <%= queueCls %>"><p>Queue is
                <strong><%= queueStr %>
                </strong></p></li>

            <% if (cfg.isSpecific()) { %>
            <li><p>Agent is ignored on normal replication</p></li>
            <% } %>

            <% if (cfg.isTriggeredOnModification()) { %>
            <li><p>Agent is triggered on modification</p></li>
            <% } %>

            <% if (cfg.isTriggeredOnOffTime()) { %>
            <li><p>Agent is triggered when on-/off-time reached</p></li>
            <% } %>

            <% if (cfg.isTriggeredOnReceive()) { %>
            <li><p>Agent is triggered on replication receive</p></li>
            <% } %>

            <% if (cfg.isTriggeredOnReceive()) { %>
            <li><p>Agent is triggered when receiving replication events</p></li>
            <% } %>

            <% if (agent != null) { %>
            <li><p><a href="agent.log.html?id=<%= encode(agent.getId()) %>">View
                log</a></p></li>
            <% } %>
        </ul>
    </div>

    <h2>Queue</h2>

    <div class="toolbar" data-role="controlgroup" data-type="horizontal">
        <a class="refresh" href="#" data-role="button">Refresh</a>
        <% if (agent != null) { %>
        <a class="retry" href="#" data-role="button">Retry</a>
        <a class="clear" href="#" data-role="button">Clear</a>
        <a class="pause" href="#"
           data-role="button"><%= paused ? "Continue" : "Pause" %>
        </a>
        <a href="agent.test.html?id=<%= encode(agent.getId()) %>"
           data-role="button">Test Connection...</a>
        <% } %>
    </div>
    <p class="error"></p>
    <table class="queue">
        <thead>
        <tr>
            <th>Time</th>
            <th>Type</th>
            <th>User</th>
            <th>Path</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
    <textarea id="<%=pageId%>-queue-tpl" style="display:none;">
        {#foreach $T.rows as record}
        <tr>
            <td>{$T.record.time_str}</td>
            <td>{$T.record.type}</td>
            <td>{$T.record.userid}</td>
            <td>{$T.record.path}</td>
            <td class="last"><a data-role="button" data-icon="delete"
                                data-iconpos="notext" data-id="{$T.record.id}">Remove</a>
            </td>
        </tr>
        {#/for}
        {#if $T.rows.length == 0}
        <tr>
            <td colspan="5"><br/>Queue is empty</td>
        </tr>
        {#/if}
    </textarea>
</div>

<div data-role="footer">
    <div class="g-buttonbar">
        <a href="agent.edit.html?path=<%=encode(path)%>" class="ui-btn-right"
           data-icon="edit" data-iconpos="notext">Edit</a>
    </div>
</div>

<div id="<%=pageId%>-clearconfirm" data-role="confirm">
    <h2>Confirm Clear</h2>

    <p>Are you sure you want to clear the queue?</p>
    <a data-role="button" data-rel="cancel" data-inline="true">Cancel</a>
    <a data-role="button" data-rel="confirm" data-inline="true">Clear</a>
</div>

<div id="<%=pageId%>-removeconfirm" data-role="confirm">
    <h2>Confirm Item Removal</h2>

    <p>Are you sure you want to remove the item from the queue?</p>
    <a data-role="button" data-rel="confirm" data-theme="a">Remove</a>
    <a data-role="button" data-rel="cancel">Cancel</a>
</div>

<script type="text/javascript">
    (function () {
        <% if ("true".equals(request.getParameter("refresh"))) { %>
        _g.agentsStore.load();
        <% } %>

        function refresh() {
            _g.$.mobile.changePage("<%=request.getRequestURI()%>?path=<%=encode(path)%>", {
                allowSamePageTransition:true,
                reloadPage:true
            });
        }

        _g.$("#<%=pageId%> .toolbar .refresh").click(function (e) {
            refresh();
        });

        <% if (agent != null) { %>
        _g.$("#<%=pageId%> .toolbar .retry").click(function (e) {
            _g.$.post("<%= resource.getPath() %>.queue.json", {
                agentId:"<%= StringEscapeUtils.escapeEcmaScript(agent.getId()) %>",
                action:"retry"
            }, function (data) {
                if (data == "OK") {
                    refresh();
                } else {
                    _g.$("#<%=pageId%> .error").text(data);
                }
            });
        });

        _g.$("#<%=pageId%> .toolbar .clear").click(function (e) {
            _g.$("#<%=pageId%>-clearconfirm").confirm("option", "onconfirm", function () {
                _g.$.post("<%= resource.getPath() %>.queue.json", {
                    agentId:"<%= StringEscapeUtils.escapeEcmaScript(agent.getId()) %>",
                    action:"clear"
                }, function (data) {
                    if (data == "OK") {
                        refresh();
                    } else {
                        _g.$("#<%=pageId%> .error").text(data);
                    }
                });
            });
            _g.$("#<%=pageId%>-clearconfirm").confirm("open");

        });

        _g.$("#<%=pageId%> .toolbar .pause").click(function (e) {
            _g.$.post("<%= resource.getPath() %>.queue.json", {
                agentId:"<%= StringEscapeUtils.escapeEcmaScript(agent.getId()) %>",
                action:"pause"
            }, function (data) {
                if (data == "OK") {
                    refresh();
                } else {
                    _g.$("#<%=pageId%> .error").text(data);
                }
            });
        });

        _g.$("#<%=pageId%> .queue [data-role='button']").live("click", function (e) {
            _g.$("#<%=pageId%>-removeconfirm").confirm("option", "onconfirm", function () {
                var id = _g.$(this).data("id");
                _g.$.post("<%= resource.getPath() %>.queue.json", {
                    agentId:"<%= StringEscapeUtils.escapeEcmaScript(agent.getId()) %>",
                    action:"clear",
                    id:id
                }, function (data) {
                    if (data == "OK") {
                        refresh();
                    } else {
                        _g.$("#<%=pageId%> .error").text(data);
                    }
                });
            });
            _g.$("#<%=pageId%>-removeconfirm").confirm("open");
        });
        <% } %>

        var store = new _g.replication.JSONStore({
            id:"<%=pageId%>",
            url:"<%= resource.getPath() %>.queue.json",
            params:{
                id:'<%= StringEscapeUtils.escapeEcmaScript(agent == null ? "" : agent.getId()) %>'
            }
        });

        _g.$(store).bind("storeloaded", function (event, data) {
            if (data && data.rows) {
                var listEl = _g.$("#<%=pageId%> tbody");
                listEl.setTemplateElement("<%=pageId%>-queue-tpl", null, {filter_data:false});
                listEl.processTemplate(data);

                listEl.find("[data-role='button']").buttonMarkup();
            }
        });

        store.load();
    })();
</script>

</div>
<%!
    private static String encode(String text) {
        try {
            return URLEncoder.encode(text, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
%>