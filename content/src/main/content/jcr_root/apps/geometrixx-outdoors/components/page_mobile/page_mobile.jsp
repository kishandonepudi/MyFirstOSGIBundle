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
    com.day.cq.commons.Doctype,
    com.day.cq.wcm.api.WCMMode"
%><%
    
    // Read the redirect target from the 'page properties' and perform the redirect if WCM is disabled.
    final String location = properties.get("redirectTarget", String.class);
    if (location != null && WCMMode.fromRequest(request) == WCMMode.DISABLED) {
        // Check for obvious recursions
        if (!location.equals(currentPage.getPath())) {
            response.sendRedirect(request.getContextPath() + location + ".html");
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        return;
    }
    
    // Set the Doctype
    currentDesign.getDoctype(currentStyle).toRequest(request);
    
%><%= Doctype.fromRequest(request).getDeclaration() %>
<html>
    <cq:include script="head.jsp"/>
    <cq:include script="body.jsp"/>
</html>
