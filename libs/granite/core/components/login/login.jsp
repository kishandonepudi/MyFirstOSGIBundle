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
  --%>
  <%@page session="false"
          contentType="text/html"
          pageEncoding="utf-8"
          import="java.util.HashMap,
                  java.util.Map,
                  java.util.Iterator,
                  org.apache.commons.io.IOUtils,
                  org.apache.commons.lang3.StringUtils,
                  org.apache.sling.api.resource.Resource,
                  org.apache.sling.api.resource.ResourceUtil,
                  org.apache.sling.api.resource.ValueMap,
                  com.adobe.granite.xss.XSSAPI,
                  com.day.cq.i18n.I18n,
                  com.day.cq.widget.HtmlLibrary,
                  com.day.cq.widget.HtmlLibraryManager,
                  com.day.cq.widget.LibraryType,
                  org.apache.sling.auth.core.AuthUtil"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%><%
%><%@ taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0" %><%!

	static final String PARAM_NAME_REASON = "j_reason";
	
	static final String REASON_KEY_INVALID_LOGIN = "invalid_login";

    I18n i18n;
    XSSAPI xssAPI;
    ValueMap cfg;

    String printProperty(String name, String defaultText) {
        String text = cfg.get(name, String.class);
        return xssAPI.encodeForHTML( text != null ? i18n.getVar(text) : defaultText );
    }

    /**
     * Select the configuration root resource among those stored under <code>configs</code> node.
     * The configuration with the highest order property is selected.
     * @param current the
     * @return the selected configuration root resource or <code>null</code> if no configuration root could be found.
     */
    Resource getConfigRoot(Resource current) {
        Resource configs = current.getChild("configs");
        Resource configRoot = null;
        if (configs != null) {
            long maxOrder = Long.MIN_VALUE;
            for (Iterator<Resource> cfgs = configs.listChildren() ; cfgs.hasNext() ; ) {
                Resource cfg = cfgs.next();
                ValueMap props = ResourceUtil.getValueMap(cfg);
                Long order = props.get("order", Long.class);
                if (order != null) {
                    if (order > maxOrder) {
                        configRoot = cfg;
                        maxOrder = order;
                    }
                }
            }
        }
        return configRoot;
    }

%><sling:defineObjects /><%

    final Resource configs = getConfigRoot(resource);

    this.i18n = new I18n(slingRequest);
    this.xssAPI = sling.getService(XSSAPI.class).getRequestSpecificAPI(slingRequest);
    this.cfg = ResourceUtil.getValueMap(configs);

    final String authType = request.getAuthType();
    final String user = request.getRemoteUser();
    final String contextPath = slingRequest.getContextPath();

    // used to map reason codes to valid reason messages to avoid phishing attacks through j_reason param
	Map<String,String> validReasons = new HashMap<String, String>();
    // just one reason at the moment, but others could easily be added here (key => label)
	validReasons.put(REASON_KEY_INVALID_LOGIN, printProperty("box/invalidLoginText", i18n.get("User name and password no not match")));

    String reason = request.getParameter(PARAM_NAME_REASON) != null
            ? request.getParameter(PARAM_NAME_REASON)
            : "";
            
	if (!StringUtils.isEmpty(reason)) {
		if (validReasons.containsKey(reason)) {
			reason = validReasons.get(reason);
		} else {
			// a reason key not matching a key in the VALID_REASONS map is considered bogus
			log.warn("{} param value '{}' cannot be mapped to a valid reason message: ignoring", PARAM_NAME_REASON, reason);
			reason = "";
		}
	}
	
%><!DOCTYPE html>
<!--[if lt IE 7 ]> <html class="ie6 oldie"> <![endif]-->
<!--[if IE 7 ]> <html class="ie7 oldie"> <![endif]-->
<!--[if IE 8 ]> <html class="ie8 oldie"> <![endif]-->
<!--[if !(lt IE 9)|!(IE)]><!--> <html> <!--<![endif]-->
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="chrome=1" />
    <title><%= printProperty("title", i18n.get("Adobe Marketing Cloud")) %></title>
    <style type="text/css">
        <%
        HtmlLibraryManager htmlMgr = sling.getService(HtmlLibraryManager.class);
        HtmlLibrary lib = htmlMgr.getLibrary(LibraryType.CSS, "/libs/granite/core/content/login/clientlib");
        IOUtils.copy(lib.getInputStream(true), out, "utf-8");
        %>
    </style>
    <ui:includeClientLib css="coralui" />
    <%
    String favicon = xssAPI.getValidHref(cfg.get("favicon", "login/adobe-logo.png"));
    favicon = xssAPI.getValidHref(favicon);
    %>
    <link rel="shortcut icon" href="<%= favicon %>" type="image/png">
    <link rel="icon" href="<%= favicon %>" type="image/png">
    <%-- Load the clientlib(s). Extension libraries should use the  'granite.core.login.extension' category. --%>
    <ui:includeClientLib js="jquery,granite.core.login,granite.core.login.extension"/>
</head>
<body>
    <div id="backgrounds">
        <%-- this holds all the background divs that are dynamically loaded --%>
        <div id="bg_default" class="background"></div>
    </div>
    <div id="tag"></div>

    <%
        // make sure the redirect path is valid and prefixed with the context path
        String redirect = request.getParameter("resource");
        if (redirect == null || !AuthUtil.isRedirectValid(request, redirect)) {
            redirect = "/";
        }
        if (!redirect.startsWith(contextPath)) {
            redirect = contextPath + redirect;
        }
        String urlLogin = request.getContextPath() + resource.getPath() + ".html/j_security_check";

        if (authType == null || user == null || user.equals("anonymous")) {

%>
    <div id="login-box">
        <h1><%= printProperty("box/title", i18n.get("Welcome to the Adobe® Marketing Cloud")) %></h1>
        <div id="leftbox">
            <p>
                <%= printProperty("box/text", i18n.get("All the tools you need to solve these complex digital business challenges.")) %><br/>
                <a id="learnmore" href="<%= xssAPI.getValidHref(cfg.get("box/learnMore/href", "#")) %>" >
                <%= printProperty("box/learnMore/text", i18n.get("Learn More")) %></a>
            </p>
        </div>
        <div id="rightbox">
            <% String autocomplete = cfg.get("box/autocomplete", false) ? "on" : "off" ; %>
            <form name="login" method="POST" id="login" action="<%= xssAPI.getValidHref(urlLogin) %>" novalidate="novalidate">
                <input type="hidden" name="_charset_" value="UTF-8"/>
                <input type="hidden" name="errorMessage" value="<%= validReasons.get(REASON_KEY_INVALID_LOGIN) %>"/>
                <input type="hidden" name="resource" value="<%= xssAPI.encodeForHTMLAttr(redirect) %>"/>
                <p class="sign-in-title"><%= printProperty("box/formTitle", i18n.get("Sign in")) %></p>
                <%
                String userPlaceholder = printProperty("box/userPlaceholder", i18n.get("User name"));
                String passwordPlaceholder = printProperty("box/passwordPlaceholder", i18n.get("Password"));
                %>
                <label for="username"><span><%= userPlaceholder %></span></label>
                <input id="username" name="j_username" type="email" autofocus="autofocus" pattern=".*" placeholder="<%= userPlaceholder %>" spellcheck="false" autocomplete="<%= autocomplete %>"/><br/>
                <label for="password"><span><%= passwordPlaceholder %></span></label>
                <input id="password" name="j_password" type="password"  placeholder="<%= passwordPlaceholder %>" spellcheck="false" autocomplete="<%= autocomplete %>"/><br/>
                <div id="error" class="alert error <%= reason.length() > 0 ? "" : "hidden" %>">
                    <%= reason %>
                </div>
                <button type="submit" class="primary"><%= printProperty("box/submitText", i18n.get("Sign In")) %></button>
            </form>
        </div>
    </div>
    <ul id="usage-box">
        <%

        // Footer: dynamic items (config/footer/items)

        if (configs.getChild("footer/items") != null) {
            Iterator<Resource> footerItems = configs.getChild("footer/items").listChildren();
            while (footerItems.hasNext()) {
                %><li><%
                String itemName = footerItems.next().getName();
                String href = cfg.get("footer/items/" + itemName + "/href", String.class);
                if (href != null) {
                    %><a href="<%= xssAPI.getValidHref(href) %>"><%
                }
                %><%= printProperty("footer/items/" + itemName + "/text", "") %><%
                if (href != null) {
                    %></a><%
                }
                %></li><%
            }
        }

        // Footer: default copyright (removable)

        if (cfg.containsKey("footer/copy/text")) {
            %><li><%= printProperty("footer/copy/text", "") %></li><%
        }
        %>
    </ul>
    <script type="text/javascript">
        // try to append the current hash/fragment to the redirect resource
        if (window.location.hash) {
            var resource = document.getElementById("resource");
            if (resource) {
                resource.value += window.location.hash;
            }
        }
    </script>
    <% } else { %>
    <script type="text/javascript">
        var redirect = '<%= xssAPI.encodeForJSString(xssAPI.getValidHref(redirect)) %>';
        if (window.location.hash) {
            redirect += window.location.hash;
        }
        document.location = redirect;
    </script>
    <% } %>
    <!-- QUICKSTART_HOMEPAGE - (string used for readyness detection, do not remove) -->
</body>
</html>