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
--%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
%><%@ page contentType="text/html; charset=utf-8" import="
    com.day.cq.commons.Externalizer,
    com.day.cq.wcm.mobile.api.device.DeviceGroup,
    info.geometrixx.commons.util.GeoHelper"
        %><%

    final Externalizer externalizer = resourceResolver.adaptTo(Externalizer.class);

    final String title         = GeoHelper.getTitle(currentPage);
    final String canonicalURL  = externalizer.absoluteLink(slingRequest, "http", currentPage.getPath()) + ".html";
    final String favicon       = currentDesign.getPath() + "/favicon.ico";
    final boolean hasFavIcon   = (resourceResolver.getResource(favicon) != null);
    final String touchicon     = currentDesign.getPath() + "/touchicon.png";
    final boolean hasTouchicon = (resourceResolver.getResource(touchicon) != null);
    final String keywords      = WCMUtils.getKeywords(currentPage);
    final String description   = currentPage.getDescription();

%><head>
    <meta charset="utf-8" />
    <title><%= xssAPI.encodeForHTML(title) %></title>
    <link rel="canonical" href="<%= xssAPI.getValidHref(canonicalURL) %>" />
    <% if (hasFavIcon) { %><link rel="shortcut icon" href="<%= xssAPI.getValidHref(favicon) %>" /><% } %>
    <% if (hasTouchicon) { %><link rel="apple-touch-icon" href="<%= xssAPI.getValidHref(touchicon) %>" /><% } %>
    <% if (GeoHelper.notEmpty(keywords)) { %><meta name="keywords" content="<%= xssAPI.encodeForHTMLAttr(keywords) %>" /><% } %>
    <% if (GeoHelper.notEmpty(description)) { %><meta name="description" content="<%= xssAPI.encodeForHTMLAttr(description) %>" /><% } %>
    <meta name="viewport" content="width=device-width" />
    <script>
        <%-- Adds a js class to the <html> element to create custom CSS rules if JS is enabled/disabled --%>
        document.documentElement.className+=' js';
    </script>
    <cq:includeClientLib categories="apps.geometrixx-outdoors.mobile.all"/>
    <% currentDesign.writeCssIncludes(pageContext); %>
    <cq:include script="/libs/wcm/core/components/init/init.jsp"/>
    <cq:include script="/libs/foundation/components/page/stats.jsp"/>
    <cq:include script="init.jsp"/>
    <cq:include script="/libs/cq/cloudserviceconfigs/components/servicelibs/servicelibs.jsp"/>
    <cq:include script="/apps/geometrixx-outdoors/components/phonegap/publish_uri.jsp"/>
    <%
        /*
        Retrieve the current mobile device group from the request in the following order:
        1) group defined by <path>.<groupname-selector>.html
        2) if not found and in author mode, get default device group as defined in the page properties
           (the first of the mapped groups in the mobile tab)

        If a device group is found, use the group's drawHead method to include the device group's associated
        emulator init component (only in author mode) and the device group's rendering CSS.
        */
        final DeviceGroup deviceGroup = slingRequest.adaptTo(DeviceGroup.class);
        if (null != deviceGroup) {
            deviceGroup.drawHead(pageContext);
        }
    %>
</head>
