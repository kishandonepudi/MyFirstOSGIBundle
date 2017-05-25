 <%--
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
 *
 * Exposes the global javascript variable cq_publish_uri.
 *
--%>

<%@include file="/libs/foundation/global.jsp"%>

<%@ page contentType="text/html; charset=utf-8"
         import="
        com.day.cq.commons.Externalizer,
        org.apache.sling.api.resource.ResourceResolver,
        com.day.cq.wcm.api.WCMMode,
        javax.servlet.ServletRequest"
        %>
<%!
    /**
     * Returns the absolute URI of the current page.
     */
    String getAbsolutePublishLink(Externalizer externalizer, ResourceResolver resourceResolver, Page currentPage, ServletRequest request) {
        // Get publishLink from Externalizer
        String publishURI = externalizer.publishLink(resourceResolver, currentPage.getPath() + ".html");

        // Replace localhost with server name if applicable
        if (publishURI.startsWith( "http://localhost" ) || publishURI.startsWith( "https://localhost" )) {
            String serverName = request.getServerName();
            publishURI = publishURI.replaceFirst("localhost", serverName);
        }

        return publishURI;
    }
%>

<%
    if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        %>
        <script type="text/javascript">
            var cq5_currentPagePublishURI = "<%= getAbsolutePublishLink(sling.getService(Externalizer.class), resource.getResourceResolver(), currentPage, slingRequest ) %>"
        </script>
        <%
    }
%>