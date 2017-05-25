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
  --%><%@page session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp"%><%
%><%@page import="java.util.Iterator,
                org.apache.jackrabbit.JcrConstants,
                com.adobe.granite.ui.components.Config"%><%

    /*
        The default foundation content system controller. This component manages the inclusion
        of all components referenced as children of the requesting content node.
        The children have to be located at the node "items" of the resource. If the children are located in a different
        node provide the name in the property "itemsName".
     */

    Config cfg = new Config(resource, null, null);
    ValueMap defaults = cfg.getDefaultProperties();
    Iterator<Resource> items = cfg.getItems(cfg.get("itemsName"));

    while (items.hasNext()) {
        Resource res = items.next();
        if (JcrConstants.JCR_CONTENT.equals(res.getName())) continue;

        // the resourceType is the component which is responsible for the rendering
        Config itemCfg = new Config(res, defaults, null);
        String resourceType = itemCfg.getInheritedDefault("sling:resourceType", String.class);

        // resourceType is empty -> look for contentPath
        if (resourceType == null) {
            String contentPath = itemCfg.getInheritedDefault("contentPath", String.class);
            if (contentPath != null) {
                res = resourceResolver.getResource(contentPath);
            }
        }

        if (res == null || resourceType == null) {
            // TODO need to say something in the error.log; otherwise no body knows that the rendering is not complete
            continue;
        }

        %><sling:include path="<%= res.getPath() %>" resourceType="<%= resourceType %>" /><%
    }
%>