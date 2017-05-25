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
--%><%
%>
<%@page session="false"
        import="com.day.cq.replication.ContentBuilder,
                org.apache.commons.lang3.StringEscapeUtils,
                org.apache.sling.api.resource.Resource,
                org.apache.sling.api.resource.ValueMap,
                java.io.UnsupportedEncodingException,
                java.net.URLEncoder,
                java.util.Comparator,
                java.util.Map,
                java.util.TreeMap" %>
<%
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %>
<%
%><sling:defineObjects/><%

    String path = request.getParameter("path");
    String agentName = path.substring(path.lastIndexOf("/") + 1);

    Resource r = resourceResolver.getResource(path + "/jcr:content");

    if (r == null) {
        response.sendError(404);
        return;
    }

    ValueMap value = r.adaptTo(ValueMap.class);

    boolean defaultAgent = false;
    boolean reverseAgent = false;
    boolean staticAgent = false;

    String agentType = value.get("agentType", String.class);
// CQ contents
// FIXME: is this the proper way? CQ doesn't have agentType property
    if (agentType == null) {
        if (path.equals("/etc/replication/agents.author/publish") || path.equals("/etc/replication/agents.author/flush")
                || path.equals("/etc/replication/agents.publish/flush") || path.equals("/etc/replication/agents.publish/outbox")) {
            defaultAgent = true;
        } else if (path.equals("/etc/replication/agents.author/publish_reverse")) {
            reverseAgent = true;
        } else if (path.equals("/etc/replication/agents.author/static")) {
            staticAgent = true;
        }
    } else {
        defaultAgent = agentType.equals("default");
        reverseAgent = agentType.equals("reverse");
        staticAgent = agentType.equals("static");
    }

    TreeMap<String, String> builderOptions = new TreeMap<String, String>(new Comparator<String>() {
        /**
         * Special comparator that ensures, that "durbo" comes before "flush" comes before
         * all other keys.
         */
        public int compare(String o1, String o2) {
            if (o1.equals("durbo")) o1 = "!";
            if (o2.equals("durbo")) o2 = "!";
            if (o1.equals("flush")) o1 = "!!";
            if (o2.equals("flush")) o2 = "!!";
            return o1.compareTo(o2);
        }
    });

    Object[] builders = sling.getServices(ContentBuilder.class, null);

    if (builders != null) {
        for (Object o : builders) {
            ContentBuilder b = (ContentBuilder) o;
            String name = b.getName();
            String title = b.getTitle();
            if (name.equals("flush")) {
                title = "Dispatcher Flush";
            } else if (name.equals("durbo")) {
                title = "Default";
            }
            builderOptions.put(name, title);
        }
    }

    String pageId = "g-agent-edit-" + agentName;
    String name = (String) value.get("jcr:title");
    if ("".equals(name)) name = agentName;
    String escapedName = StringEscapeUtils.escapeHtml4(name);
%>
<div id="<%=pageId%>" data-role="page"
     data-title="CRX Replication | Editing <%=escapedName%>">

<div data-role="header">
    <h1><%=escapedName%>
    </h1>
</div>

<div data-role="content">
<%
    String error = request.getParameter("error");
    if (error != null && error.trim().length() > 0) { %>
<p class="error"><%=StringEscapeUtils.escapeHtml4(request.getParameter("error"))%>
</p>
<% } %>

<form method="post">
<input type="hidden" name="_charset_" value="utf-8"/>
<input type="hidden" name="path"
       value="<%=StringEscapeUtils.escapeHtml4(path)%>"/>

<%-- ------------------------------------------------ --%>
<%-- SETTINGS                                         --%>
<%-- ------------------------------------------------ --%>
<div data-role="fieldcontain">
    <label class="ui-input-text"></label>

    <h2>General Settings</h2>
</div>

<div data-role="fieldcontain">
    <label for="title">Title</label>
    <input id="title" type="text" name="jcr:title"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("jcr:title", ""))%>'/>

    <p class="ui-input-desc">Informative title of this agent</p>
</div>
<div data-role="fieldcontain">
    <label for="description">Description</label>
    <textarea id="description"
              name="jcr:description"><%=StringEscapeUtils.escapeHtml4(value.get("jcr:description", ""))%>
    </textarea>
</div>
<div data-role="fieldcontain">
    <label for="active"></label>
    <select id="active" name="enabled" data-role="slider">
        <% boolean enabled = value.get("enabled", false); %>
        <option value="false" <%=enabled ? "" : "selected='selected'"%>>
            Disabled
        </option>
        <option value="true" <%=enabled ? "selected='selected'" : ""%>>Enabled
        </option>
    </select>
</div>
<% if (defaultAgent) { %>
<div data-role="fieldcontain">
    <label for="serializationType">Serialization Type</label>
    <select id="serializationType" name="serializationType">
        <% String serializationType = value.get("serializationType", "");
            for (Map.Entry<String, String> e : builderOptions.entrySet()) { %>
        <option value="<%=e.getKey()%>" <%=serializationType.equals(e.getKey()) ? "selected='selected'" : ""%>><%=e.getValue()%>
        </option>
        <% } %>
    </select>
</div>
<% } %>
<div data-role="fieldcontain">
    <label for="retryDelay">Retry Delay</label>
    <input id="retryDelay" type="number" name="retryDelay"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("retryDelay", ""))%>'/>

    <p class="ui-input-desc">Time in milliseconds</p>
</div>
<div data-role="fieldcontain">
    <label for="userId">Agent User Id</label>
    <input id="userId" type="text" name="userId"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("userId", ""))%>'/>

    <p class="ui-input-desc">Leave empty to use system user</p>
</div>
<div data-role="fieldcontain">
    <label for="logLevel">Log Level</label>
    <select id="logLevel" name="logLevel">
        <% String logLevel = value.get("logLevel", "error"); %>
        <option value="error" <%=logLevel.equals("error") ? "selected='selected'" : ""%>>
            Error
        </option>
        <option value="warn" <%=logLevel.equals("warn") ? "selected='selected'" : ""%>>
            Warn
        </option>
        <option value="info" <%=logLevel.equals("info") ? "selected='selected'" : ""%>>
            Info
        </option>
        <option value="debug" <%=logLevel.equals("debug") ? "selected='selected'" : ""%>>
            Debug
        </option>
    </select>
</div>
<% if (defaultAgent) { %>
<div data-role="fieldcontain">
    <fieldset data-role="controlgroup">
        <legend>Options</legend>
        <label for="noStatusUpdate">No Status Update</label>
        <input id="noStatusUpdate" type="checkbox"
               name="noStatusUpdate" <%=value.get("noStatusUpdate", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="noStatusUpdate">If checked, agent
            will not force a replication status update</p>

        <label for="triggerSpecific">Ignore default</label>
        <input id="triggerSpecific" type="checkbox"
               name="triggerSpecific" <%=value.get("triggerSpecific", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="triggerSpecific">If checked, agent is
            excluded from normal replication,
            i.e. will not be used if a content author issues a replication
            action</p>

        <label for="aliasUpdate">Alias update</label>
        <input id="aliasUpdate" type="checkbox"
               name="aliasUpdate" <%=value.get("aliasUpdate", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="aliasUpdate">If checked, agent will
            replicate also aliased paths e.g. like vanity URLs
        </p>
    </fieldset>
</div>
<% } %>
<input type="hidden" name="reverseReplication" value="true"/>

<% if (staticAgent) { %>
<%-- ------------------------------------------------ --%>
<%-- RULE                                             --%>
<%-- ------------------------------------------------ --%>
<br>

<div data-role="fieldcontain">
    <label class="ui-input-text"></label>

    <h2>Rule Settings</h2>
</div>
<div data-role="fieldcontain">
    <label for="directory">Directory</label>
    <input id="directory" type="text" name="directory"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("directory", ""))%>'/>

    <p class="ui-input-desc">Target directory on server, e.g. /tmp</p>
</div>
<div data-role="fieldcontain">
    <label for="definition">Definition</label>
    <textarea id="definition"
              name="definition"><%=StringEscapeUtils.escapeHtml4(value.get("definition", ""))%>
    </textarea>
</div>
<% } %>

<% if (defaultAgent || reverseAgent) { %>
<%-- ------------------------------------------------ --%>
<%-- TRANSPORT                                        --%>
<%-- ------------------------------------------------ --%>
<br>

<div data-role="fieldcontain">
    <label class="ui-input-text"></label>

    <h2>Transport Settings</h2>
</div>
<div data-role="fieldcontain">
    <label for="transportUri">URI</label>
    <input id="transportUri" type="text" name="transportUri"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("transportUri", ""))%>'/>

    <p class="ui-input-desc">Target URI, e.g.
        http://localhost:4503/bin/receive</p>
</div>
<div data-role="fieldcontain">
    <label for="transportUser">User</label>
    <input id="transportUser" type="text" name="transportUser"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("transportUser", ""))%>'/>

    <p class="ui-input-desc">User name for the transport credentials</p>
</div>
<div data-role="fieldcontain">
    <label for="transportPassword">Password</label>
    <input id="transportPassword" type="password" name="transportPassword"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("transportPassword", ""))%>'/>

    <p class="ui-input-desc">Password for the transport credentials</p>
</div>
<div data-role="fieldcontain">
    <label for="transportNTLMDomain">NTLM Domain</label>
    <input id="transportNTLMDomain" type="text" name="transportNTLMDomain"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("transportNTLMDomain", ""))%>'/>

    <p class="ui-input-desc">Domain for NTLM authentication, e.g. WORKGROUP</p>
</div>
<div data-role="fieldcontain">
    <label for="transportNTLMHost">NTLM Host</label>
    <input id="transportNTLMHost" type="text" name="transportNTLMHost"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("transportNTLMHost", ""))%>'/>

    <p class="ui-input-desc">(this) Host for NTLM authentication e.g.
        server01</p>
</div>
<div data-role="fieldcontain">
    <fieldset data-role="controlgroup">
        <legend>SSL Options</legend>
        <label for="protocolHTTPSRelaxed">Enable relaxed SSL</label>
        <input id="protocolHTTPSRelaxed" type="checkbox"
               name="protocolHTTPSRelaxed" <%=value.get("protocolHTTPSRelaxed", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="protocolHTTPSRelaxed">Enable to
            accept self-certified SSL certificates</p>

        <label for="protocolHTTPExpired">Allow expired certs</label>
        <input id="protocolHTTPExpired" type="checkbox"
               name="protocolHTTPExpired" <%=value.get("protocolHTTPExpired", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="protocolHTTPExpired">Enable to accept
            expired SSL certificates</p>
    </fieldset>
</div>

<%-- ------------------------------------------------ --%>
<%-- PROXY                                            --%>
<%-- ------------------------------------------------ --%>
<br>

<div data-role="fieldcontain">
    <label class="ui-input-text"></label>

    <h2>Proxy Settings</h2>
</div>
<div data-role="fieldcontain">
    <label for="proxyHost">Proxy Host</label>
    <input id="proxyHost" type="text" name="proxyHost"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("proxyHost", ""))%>'/>

    <p class="ui-input-desc">Hostname of the (transport) proxy</p>
</div>
<div data-role="fieldcontain">
    <label for="proxyPort">Proxy Port</label>
    <input id="proxyPort" type="number" name="proxyPort"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("proxyPort", ""))%>'/>

    <p class="ui-input-desc">Port of the (transport) proxy</p>
</div>
<div data-role="fieldcontain">
    <label for="proxyUser">Proxy User</label>
    <input id="proxyUser" type="text" name="proxyUser"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("proxyUser", ""))%>'/>

    <p class="ui-input-desc">User name for the proxy credentials</p>
</div>
<div data-role="fieldcontain">
    <label for="proxyPassword">Proxy Password</label>
    <input id="proxyPassword" type="password" name="proxyPassword"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("proxyPassword", ""))%>'/>

    <p class="ui-input-desc">Password for the proxy credentials</p>
</div>
<div data-role="fieldcontain">
    <label for="proxyNTLMDomain">Proxy NTLM Domain</label>
    <input id="proxyNTLMDomain" type="text" name="proxyNTLMDomain"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("proxyNTLMDomain", ""))%>'/>

    <p class="ui-input-desc">Domain for proxy NTLM authentication. e.g.
        WORKGROUP</p>
</div>
<div data-role="fieldcontain">
    <label for="proxyNTLMHost">Proxy NTLM Host</label>
    <input id="proxyNTLMHost" type="text" name="proxyNTLMHost"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("proxyNTLMHost", ""))%>'/>

    <p class="ui-input-desc">(this) Host for proxy NTLM authentication, e.g.
        server01</p>
</div>

<%-- ------------------------------------------------ --%>
<%-- EXTENDED                                         --%>
<%-- ------------------------------------------------ --%>
<br>

<div data-role="fieldcontain">
    <label class="ui-input-text"></label>

    <h2>Extended Transport Settings</h2>
</div>
<div data-role="fieldcontain">
    <label for="protocolInterface">Interface</label>
    <input id="protocolInterface" type="text" name="protocolInterface"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("protocolInterface", ""))%>'/>

    <p class="ui-input-desc">Socket interface to bind to</p>
</div>
<div data-role="fieldcontain">
    <label for="protocolHTTPMethod">HTTP Method</label>
    <input id="protocolHTTPMethod" type="text" name="protocolHTTPMethod"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("protocolHTTPMethod", ""))%>'/>

    <p class="ui-input-desc">HTTP method to use</p>
</div>
<div data-role="fieldcontain">
    <label for="protocolHTTPHeaders">HTTP Headers</label>
    <textarea id="protocolHTTPHeaders"
              name="protocolHTTPHeaders"><%=StringEscapeUtils.escapeHtml4(value.get("protocolHTTPHeaders", ""))%>
    </textarea>

    <p class="ui-input-desc">Additional HTTP headers. Put each header in
        separate lines</p>
</div>
<div data-role="fieldcontain">
    <fieldset data-role="controlgroup">
        <legend>&nbsp;</legend>
        <label for="protocolHTTPConnectionClose">Close Connection</label>
        <input id="protocolHTTPConnectionClose" type="checkbox"
               name="protocolHTTPConnectionClose" <%=value.get("protocolHTTPConnectionClose", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="protocolHTTPConnectionClose">Enable
            to close connection after each request</p>
    </fieldset>
</div>
<div data-role="fieldcontain">
    <label for="protocolConnectTimeout">Connect Timeout</label>
    <input id="protocolConnectTimeout" type="number"
           name="protocolConnectTimeout"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("protocolConnectTimeout", ""))%>'/>

    <p class="ui-input-desc">Connect timeout in milliseconds</p>
</div>
<div data-role="fieldcontain">
    <label for="protocolSocketTimeout">Socket Timeout</label>
    <input id="protocolSocketTimeout" type="number" name="protocolSocketTimeout"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("protocolSocketTimeout", ""))%>'/>

    <p class="ui-input-desc">Socket timeout in milliseconds</p>
</div>
<div data-role="fieldcontain">
    <label for="protocolVersion">Protocol Version</label>
    <input id="protocolVersion" type="text" name="protocolVersion"
           value='<%=StringEscapeUtils.escapeHtml4(value.get("protocolVersion", ""))%>'/>

    <p class="ui-input-desc">Version of protocol, e.g. '1.0' (for HTTP/1.0)</p>
</div>
<% } %>

<% if (defaultAgent) { %>
<%-- ------------------------------------------------ --%>
<%-- CQ Specific                                      --%>
<%-- ------------------------------------------------ --%>
<br>

<div data-role="fieldcontain">
    <label class="ui-input-text"></label>

    <h2>CQ Specific Settings</h2>
</div>
<div data-role="fieldcontain">
    <fieldset data-role="controlgroup">
        <legend>Triggers</legend>

        <label for="triggerReceive">On Receive</label>
        <input id="triggerReceive" type="checkbox"
               name="triggerReceive" <%=value.get("triggerReceive", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="triggerReceive">If checked, agent
            will chain-replicate</p>

        <label for="triggerModified">On Modification (CQ only)</label>
        <input id="triggerModified" type="checkbox"
               name="triggerModified" <%=value.get("triggerModified", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="triggerModified">If checked, agent
            will auto-replicate if content is modified</p>

        <label for="triggerDistribute">On Distribute (CQ only)</label>
        <input id="triggerDistribute" type="checkbox"
               name="triggerDistribute" <%=value.get("triggerDistribute", "false").equals("true") ? "checked='checked'" : "" %> />

        <p class="ui-input-desc" data-for="triggerDistribute">If checked, the
            agent will auto-replicate when content marked for distribution is
            modified</p>

        <legend>&nbsp;</legend>
        <label for="noVersioning">No Versioning (CQ only)</label>
        <input id="noVersioning" type="checkbox" name="noVersioning"
               value='<%=StringEscapeUtils.escapeHtml4(value.get("noVersioning", ""))%>'/>

        <p class="ui-input-desc" data-for="noVersioning">If checked, agent will
            not force versioning of activated pages</p>
    </fieldset>
</div>
<% } %>
</form>
</div>

<div data-role="footer">
    <div class="g-buttonbar">
        <a class="ui-btn-right" href="agent.html?path=<%=encode(path)%>"
           data-icon="back" data-iconpos="notext" data-direction="reverse">Cancel</a>
        <a class="done ui-btn-right" href="#" data-icon="save"
           data-iconpos="notext">Save</a>
    </div>
</div>

<script type="text/javascript">
    _g.$('#<%=pageId%> .done').click(function () {
        _g.$('#<%=pageId%> form').submit();
    });
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