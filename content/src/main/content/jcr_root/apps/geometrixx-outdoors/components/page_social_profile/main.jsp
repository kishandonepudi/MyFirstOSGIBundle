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
%><%@ page contentType="text/html; charset=utf-8" 
           import="com.adobe.granite.security.user.UserPropertiesManager,
                   com.adobe.granite.security.user.UserPropertiesService,
                   com.adobe.granite.security.user.UserProperties,
                   com.day.cq.wcm.foundation.forms.FormsHelper,
                   java.util.List,
                   org.apache.sling.api.resource.Resource"%><%
      
    final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class);
    final UserPropertiesManager upm = userPropertiesService.createUserPropertiesManager(resourceResolver);
    List<Resource> resources = FormsHelper.getFormEditResources(slingRequest);
    String userDisplayName = "Username";
    if (resources != null && resources.size() > 0) {
       //1 - we are in formchooser-mode, get the requested resource
        Resource userResource = resources.get(0);
    
        if( userResource != null) {
        
            //1 - get connected user activities
            UserProperties props =  upm.getUserProperties(userResource.adaptTo(Node.class));
            String firstName = props.getProperty(UserProperties.GIVEN_NAME);
            String lastName = props.getProperty(UserProperties.FAMILY_NAME);
            userDisplayName = firstName + " " + lastName;
        }
    }
    

%>      
<div class="page-header-content">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content <%= currentPage.getName() %>">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/>

    <section class="content-left community-profile-top">
        <div class="topic-top title section no-margin">
            <h1><%= xssAPI.encodeForHTMLAttr(userDisplayName) %></h1>
            <div style="clear:both;"></div>
        </div>
        <cq:include path="par" resourceType="foundation/components/parsys"/>
    </section>
    <aside class="content-right">
        <div class="topic-top title section no-margin">
            <h2>Recent Activities</h2>
            <%-- TODO: enabled the follow button once this issues is fixed: CQ5-26352--%>
            <a href="#" class="orange_button" style="display:none">Follow</a>
            <div style="clear:both;"></div>
        </div>
        <cq:include path="sidebar" resourceType="foundation/components/parsys"/>
    </aside>
    <div style="clear:both;"></div>
</div>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>