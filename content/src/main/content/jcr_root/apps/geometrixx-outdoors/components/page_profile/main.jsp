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
                   com.adobe.cq.social.commons.CollabUtil,
                   com.day.cq.wcm.foundation.forms.FormsHelper,
                   com.day.cq.i18n.I18n,
                   java.util.List,
                   org.apache.sling.api.resource.Resource"%><%
      
    I18n i18n = new I18n(slingRequest);
      
    final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class);
    final UserPropertiesManager upm = userPropertiesService.createUserPropertiesManager(resourceResolver);
    List<Resource> resources = FormsHelper.getFormEditResources(slingRequest);
    String userDisplayName = "Username";
    String socialProfileUrl = "##";
    if (resources != null && resources.size() > 0) {
       //1 - we are in formchooser-mode, get the requested resource
        Resource userResource = resources.get(0);
    
        if( userResource != null) {
        
            //1 - get connected user activities
            UserProperties props =  upm.getUserProperties(userResource.adaptTo(Node.class));
            String firstName = props.getProperty(UserProperties.GIVEN_NAME);
            String lastName = props.getProperty(UserProperties.FAMILY_NAME);
            userDisplayName = firstName + " " + lastName;    
            socialProfileUrl = props.getNode().getPath() + ".form.html/content/geometrixx-outdoors/en/user/social-profile";
        }
    }    

%>  

<div class="page-header-content">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content <%= currentPage.getName() %> clearfix">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/>
    <div class="title top section clearfix">
        <h1><%=i18n.get("Edit Profile")%></h1>
        <div class="btn action">
            <a href="<%=xssAPI.getValidHref(socialProfileUrl)%>"><%=i18n.get("My Public Profile")%></a>
        </div>
    </div>
    <section>
        <cq:include path="par" resourceType="foundation/components/parsys"/>
    </section>
</div>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>
</div>