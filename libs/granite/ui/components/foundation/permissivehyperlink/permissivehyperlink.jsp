<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%@page session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page import="java.util.Map,
                  java.util.HashMap,
                  java.util.Map.Entry,
                  java.util.Iterator,
                  java.util.Enumeration,
                  javax.jcr.Session,
                  java.security.AccessControlException,
                  javax.jcr.RepositoryException,
                  org.apache.sling.api.SlingHttpServletRequest,
                  org.apache.sling.api.resource.ResourceUtil,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config" %><%

// Doc: https://zerowing.corp.adobe.com/display/granite/Hyperlink
// Please keep in sync whenever possible

// TODO: most of this code is similar to hyperlink.jsp: component should extend this base file

Config cfg = new Config(resource);

AttrBuilder attrs = new AttrBuilder(request, xssAPI);

attrs.add("id", cfg.get("id", String.class));
attrs.addRel(cfg.get("rel", String.class));
attrs.addClass(cfg.get("class", String.class));
attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
attrs.addClass(cfg.get("icon", String.class));
attrs.add("target", cfg.get("target", String.class));

if (hasPermission(resource, slingRequest) && !Boolean.TRUE.equals(request.getAttribute("pulldown_disabled"))) {
    String href = cfg.get("href", String.class);

    if (href != null && href.trim().length() > 0 && cfg.get("appendSuffix", false)) {
        String suffix = slingRequest.getRequestPathInfo().getSuffix();
        if (suffix != null) {
            href += suffix;
        }
    }

    attrs.addHref("href", href);
} else {
    attrs.addClass("disabled");
}

attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "href", "title", "text", "icon", "target", "hideText", "allowEmptySuffix", "appendSuffix", "suffixMinLevel");

if (!cfg.get("hideText", false)) {
    attrs.addClass("withLabel");
}

%><a <%= attrs.build() %>><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></a><%!

// TODO all this code is identical with the one in permissivebutton

String expand(Map<String, String> variables, String value) {
    if (value == null) return null;
    if (variables == null) return value;
    
    for (Entry<String, String> e : variables.entrySet()) {
        String v = e.getValue();

        if (v != null && v.length() > 0) {
            value = value.replace("${" + e.getKey() + "}", v);
        }
    }

    return value;
}

boolean checkPermissions(Resource permissions, Map<String, String> variables, Session session) {
    try {
        for (Iterator<Resource> it = permissions.listChildren(); it.hasNext();) {
            Resource permission = it.next();
            ValueMap vm = ResourceUtil.getValueMap(permission);
            
            String path = expand(variables, vm.get("path", String.class));
            String action = vm.get("action", String.class);
            
            if (path != null && action != null) {
                session.checkPermission(path, action);
            }
        }
        
        return true;
    } catch (AccessControlException e) {
        return false;
    } catch (RepositoryException e) {
        // we better bugger off as well
        return false;
    }
}

boolean hasPermission(Resource resource, SlingHttpServletRequest slingRequest) {
    Config cfg = new Config(resource);
    Resource permissions = cfg.getChild("permissions");
    
    if (permissions == null) return true;
    
    String suffix = slingRequest.getRequestPathInfo().getSuffix();
    
    Map<String, String> variables = new HashMap<String, String>();
    variables.put("requestSuffix", suffix);
    variables.put("requestPath", slingRequest.getRequestPathInfo().getResourcePath());
    variables.put("nodePath", resource.getPath());
    
    // there may be a name collision, but for the admin apps this is quite unlikely as we use well defined vocabulary
    for (Enumeration e = slingRequest.getParameterNames();e.hasMoreElements();) {
        String k = (String)e.nextElement();
        variables.put (k, slingRequest.getParameter(k));
    }
    
    return checkPermissions(permissions, variables, slingRequest.getResourceResolver().adaptTo(Session.class));
}
%>
