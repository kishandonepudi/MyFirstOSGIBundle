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
%><%@include file="/libs/granite/ui/global.jsp"%><%
%><%@page import="java.util.Map,
                  java.util.HashMap,
                  java.util.Iterator,
                  java.util.Enumeration,
                  javax.jcr.Session,
                  javax.jcr.RepositoryException,
                  java.security.AccessControlException,
                  org.apache.sling.api.resource.ValueMap,
                  com.adobe.granite.ui.components.AttrBuilder" %><%

// Doc: https://zerowing.corp.adobe.com/display/granite/Button
// Please keep in sync whenever possible

ValueMap vm = resource.adaptTo(ValueMap.class);
boolean isDisabled = vm.get("disabled", false);

AttrBuilder attrs = new AttrBuilder(request, xssAPI);

attrs.add("id", vm.get("id", String.class));
attrs.addRel(vm.get("rel", String.class));
attrs.addClass(vm.get("class", String.class));
attrs.add("title", i18n.getVar(vm.get("title", String.class)));
attrs.add("type", "button");
attrs.addDisabled(isDisabled);
attrs.addClass(vm.get("icon", String.class));
attrs.add("autocomplete", "off"); // to prevent annoying FF disabling the button whenever it wishes to

String href = vm.get("href", String.class);

// populate and check permissions
Resource perms = resource.getChild("permissions");
if ((perms != null) && (!isDisabled)) {
    HashMap variables = new HashMap ();
    variables.put ("requestSuffix", slingRequest.getRequestPathInfo().getSuffix());
    variables.put ("requestPath", slingRequest.getRequestPathInfo().getResourcePath());
    variables.put ("nodePath", resource.getPath());

    //there may be a name collision, but for the admin apps this is quite unlikely as we use well defined vocabulary
    for (Enumeration e = slingRequest.getParameterNames();e.hasMoreElements();) {
        String k = (String)e.nextElement();
        variables.put (k, slingRequest.getParameter(k));
    }

    String path = slingRequest.getRequestPathInfo().getSuffix();
    boolean allowed = checkPermissions(variables, perms);
    if (!allowed) {
        attrs.addDisabled(true);
    }
}

if (href != null && href.trim().length() > 0 && vm.get("appendSuffix", false)) {
    String suffix = slingRequest.getRequestPathInfo().getSuffix();
    if (suffix != null) {
        href += suffix;
    }
}

attrs.addHref("data-href", href);

attrs.addOthers(vm, "id", "rel", "class", "title", "type", "disabled", "icon", "href", "text", "autoComplete", "hideText", "appendSuffix");

if (!vm.get("hideText", false)) {
    attrs.addClass("withLabel");
}

%><button <%= attrs.build() %>><%= outVar(xssAPI, i18n, vm.get("text", "")) %></button><%!

/**
 * expand variables
 */

String expandVal(Map variables, String val) {
    if (val == null) return null;
    if (variables == null) return val;
    
    for (Iterator<String> keys = variables.keySet().iterator(); keys.hasNext();) {
        String k = keys.next();
        String v = (String)variables.get(k);

        if (v != null && v.length () > 0) {
            val = val.replace ("${"+k+"}",v);
        }
    }

    return val;
}

/**
 * check permissions
 */

boolean checkPermissions(Map variables, Resource perms) {
    Session ses = perms.getResourceResolver().adaptTo(Session.class);
    try {
        for (Iterator<Resource> it = perms.listChildren(); it.hasNext();) {
            Resource perm = it.next();
            ValueMap permVm = perm.adaptTo(ValueMap.class);
            String path = expandVal(variables, permVm.get("path", String.class));
            String act  = permVm.get("action", String.class);
            
            if (path != null && act != null) {
                ses.checkPermission (path, act);
            }
        }
    } catch (AccessControlException exa) {
        return false;
    } catch (RepositoryException exr) {
        //we better bugger off as well
        return false;
    }
     
    return true;
}

%>
