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

  ==============================================================================

    Community Information

--%><%@include file="/libs/social/commons/commons.jsp"%><%
%><%@ page import="org.apache.sling.api.resource.ResourceUtil,
                     org.apache.sling.api.resource.ResourceResolver,
                     org.apache.sling.jcr.api.SlingRepository,
                     org.apache.commons.collections.IteratorUtils,
                     com.adobe.granite.security.user.UserProperties,
                     com.adobe.granite.security.user.UserPropertiesService,
                     java.util.Collection,
                     java.util.Iterator,
                     java.util.Locale,
                     com.adobe.cq.social.commons.CollabUtil,
                     com.adobe.cq.social.group.api.GroupConstants,
                     com.adobe.cq.social.group.api.GroupUtil" %>
<cq:includeClientLib categories="cq.social.group"/><%

    final ResourceResolver resolver = slingRequest.getResourceResolver();
    final SlingRepository repository = sling.getService(SlingRepository.class);
    final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class) ;
    
    Page communityPage = currentPage.getParent();
    ValueMap cproperties = communityPage.getProperties();

    String desc = cproperties.get(GroupConstants.PROPERTY_DESCRIPTION, "");
    String author = loggedInUserID; 

    String admingroupPath = cproperties.get(GroupConstants.GROUP_ADMINGROUP, GroupConstants.GROUP_GROUPROOT + currentPage.getParent().getName()+ GroupConstants.GROUP_ADMINGROUP_SUFFIX);
    String adminGID = admingroupPath.substring(admingroupPath.lastIndexOf("/")+1);
    Iterator<UserProperties> admins = GroupUtil.getMembers(userPropertiesService, resolver, adminGID);
    
    String membergroupPath = cproperties.get(GroupConstants.GROUP_MEMBERGROUP, GroupConstants.GROUP_GROUPROOT + currentPage.getParent().getName()+ GroupConstants.GROUP_MEMBERGROUP_SUFFIX);
    String memberGID = membergroupPath.substring(membergroupPath.lastIndexOf("/")+1);
    Iterator<UserProperties> members = GroupUtil.getMembers(userPropertiesService, resolver, memberGID);
    //TODO: need to fill out members that are group, not just minus 1 for the admin group 
    int memberNum = (members != null)?  IteratorUtils.toList(members).size() : 0;
    
    //pass to user state toggle component
    request.setAttribute(GroupConstants.GROUP_MEMBERGROUP, membergroupPath);

%>

<div class="description"><%= xssAPI.filterHTML(desc) %></div>
<div class="sidebar member-count clearfix">
    <h2><%=i18n.get("Community Members")%></h2>
    <span class="count"><%= memberNum %></span>
</div>

<div class="sidebar title clearfix">
    <h2><%= i18n.get("Community Administrators:") %></h2>
</div>
<ul class="admins">

<%
if(admins!=null){
    while(admins.hasNext()) {
        final UserProperties admin = admins.next();    
        String formattedName = xssAPI.encodeForHTML(admin.getProperty(UserProperties.GIVEN_NAME) + " " + admin.getProperty(UserProperties.FAMILY_NAME));
        String avatarPath = CollabUtil.getAvatar(admin);
        log.info("name:"+formattedName);
        %><li class="admin-listing">
        <div class="avatar">
        <img src="<%= xssAPI.getValidHref(avatarPath) %>"  alt="<%= xssAPI.encodeForHTMLAttr(formattedName) %>" title="<%= xssAPI.encodeForHTMLAttr(formattedName) %>"/><%= formattedName %>
        </div>
        </li><%
    }
}   
%>
</ul>

<%
//show invite to join button for group members
if(author != null && GroupUtil.isMember(userPropertiesService, resolver, author , memberGID)){
%><div>
    <form class="groupForm" action="<%=communityPage.getPath()%>.form.html<%=communityPage.getParent().getPath()%>/invite" method="GET">
        <input type="hidden" name="groupid" value="<%= communityPage.getName() %>">
        <input name="submit" value="INVITE TO JOIN" type="submit" class="invite">
    </form>
</div><%
}

//show edit group button for group admins
if(author != null && GroupUtil.isMember(userPropertiesService, resolver, author , adminGID)){
%><div>
    <form class="groupForm" action="<%=communityPage.getPath()%>.form.html<%=communityPage.getParent().getPath()%>/editcommunity" method="GET">
        <input type="hidden" name="groupid" value="<%= communityPage.getName() %>">
        <input name="submit" value="EDIT COMMUNITY" type="submit" class="editGroup">
    </form>
</div><%
}


%>