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
%><%@ include file="/libs/social/commons/commons.jsp" %><%
%><%@ page import="java.security.AccessControlException,
                    org.apache.sling.api.resource.ValueMap,
                    org.apache.sling.api.SlingHttpServletRequest,
                    com.adobe.granite.security.user.UserPropertiesService,
                    org.apache.sling.api.resource.ValueMap,
                    com.day.cq.wcm.foundation.forms.FormsHelper,
                    java.util.List,
                    com.day.text.Text,
                    com.adobe.cq.social.group.api.GroupConstants,
                    com.adobe.cq.social.group.api.GroupUtil" %><%
%><%@ page contentType="text/html; charset=utf-8" %>
<div class="page-header-content page-header">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/>
    <section class="page-par-left">
<%
    final List<Resource> editResources = FormsHelper.getFormEditResources(slingRequest);
    final Resource editGroup = (null != editResources && editResources.size() > 0) ? editResources.get(0) : null;
    Page groupPage = null;
    String membergroupPath="";
    String memberGID="";
    String action = "";
    if(editGroup != null){
        groupPage = editGroup.adaptTo(Page.class);
        if(groupPage!=null){
            final ValueMap groupProperties = groupPage.getProperties();
            membergroupPath = groupProperties.get(GroupConstants.GROUP_MEMBERGROUP, GroupConstants.GROUP_GROUPROOT + groupPage.getName()+ GroupConstants.GROUP_MEMBERGROUP_SUFFIX);
            memberGID = membergroupPath.substring(membergroupPath.lastIndexOf("/")+1);
            action = groupPage.getPath() + ".invite.html";
        }
    }
    
    final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class) ;
    if((isAdmin && (groupPage==null)) || (!isAnonymous && (groupPage != null) && GroupUtil.isMember(userPropertiesService, resourceResolver, loggedInUserID , memberGID))){
        // draw entry form
        %>        
        <cq:include path="par" resourceType="foundation/components/parsys"/>
        <form method="POST" action="<%= action %>" id="_invite_community" name="_invite_community" enctype="multipart/form-data">
            <input type="hidden" name="groupid" value="<%= memberGID %>"/>
            <div><label><%= i18n.get("Friend IDs (separated by whitespace)") %></label></div>
            <div><textarea class="form_field form_field_textarea" id="_invite_community_uid" name="uid" rows="10" cols="35" style="width:600px;" onkeydown=""></textarea></div>
            <p/>
            <div class="submit-block">
                <input class="form_button_submit" type="submit" name=":ignore" value="<%= i18n.get("Submit")%>" >&nbsp;&nbsp;&nbsp;
                <input class="form_button_reset" type="reset" value="<%= i18n.get("Reset")%>">&nbsp;&nbsp;&nbsp;
                <input class="form_button_cancel" type="button" onclick="history.go(-1)" value="<%= i18n.get("Cancel")%>">
            </div>
        </form>
        
    <%}else {%>

          <h3 style="margin-left:40px"><%= i18n.get("Invite Form: access denied. Please ") %>
              <a style="text-decoration:underline; color:#06c;" onclick="$CQ.SocialAuth.sociallogin.showDialog('sociallogin-content-geometrixx-outdoors-en-support-jcr-content-userinfo-sociallogin');return false;"><%= i18n.get("Log In") %></a>
          </h3><p/>
    <%} %>
    </section>
    <aside class="page-aside-right">
        <cq:include path="sidebar" resourceType="foundation/components/iparsys"/>
    </aside>
</div>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>
