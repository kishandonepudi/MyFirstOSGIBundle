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
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@page import="javax.jcr.Value,
                  org.apache.sling.jcr.api.SlingRepository,
                  org.apache.jackrabbit.api.JackrabbitSession,
                  org.apache.jackrabbit.api.security.user.Authorizable,
                  com.adobe.granite.security.user.UserProperties,
                  com.adobe.granite.security.user.UserPropertiesManager,
                  com.adobe.granite.security.user.UserPropertiesService,
                  org.apache.jackrabbit.api.security.user.UserManager,
                  org.apache.jackrabbit.api.security.user.Authorizable,
                  org.apache.jackrabbit.api.security.user.User,
                  org.apache.jackrabbit.api.security.principal.PrincipalManager,
                  java.util.Set,
                  java.net.URLEncoder,
                  javax.jcr.Session" %><%
%><ui:includeClientLib categories="granite.ui.foundation.user"/><%

final String ctx = request.getContextPath();

      
Session adminSession = null;
    
try {
    SlingRepository repos = sling.getService(SlingRepository.class);

    adminSession = resourceResolver.adaptTo(Session.class);
        
    UserManager um = ((JackrabbitSession) adminSession).getUserManager();
    PrincipalManager pm = ((JackrabbitSession) adminSession).getPrincipalManager();

    String userId = slingRequest.getParameter("userId");
    String action = slingRequest.getParameter("action");
    
    if (!"impersonate".equals(action)) throw new Exception();

    String currentUserID = adminSession.getUserID();

    User currentUser = (User)um.getAuthorizable(currentUserID);
    User impersonateTo = (userId == null) ? null : (User)um.getAuthorizable(userId);

    UserPropertiesService upService = sling.getService(UserPropertiesService.class);
    UserPropertiesManager upm = upService.createUserPropertiesManager(adminSession, resourceResolver);
    
    UserProperties up = upm.getUserProperties(currentUser, "");
    
    String path = up.getResourcePath("", ".impersonate.json", "");
    
    if (impersonateTo != null || "-".equals(userId)) {
        path = ctx + path;
        path += "?impersonate=" + userId;
        path += "&path=" + URLEncoder.encode("/libs/cq/core/content/projects.html"); // TODO: Remove fixed path
    } else {
        path = ctx + "/libs/cq/core/content/projects.html"; // TODO: Remove fixed path
    }
    
    response.sendRedirect(path); 
    
} catch(Exception e) {
    %>Cannot impersonate<%
    throw e;
}
 
%>