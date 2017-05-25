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

    Community List

--%><%@include file="/libs/social/commons/commons.jsp"%><%
%><%@ page import="org.apache.commons.collections.IteratorUtils,
                     org.apache.sling.api.resource.ResourceUtil,
                     org.apache.sling.api.resource.ResourceResolver,
                     java.util.Collection,
                     java.util.Iterator,
                     java.util.List,
                     com.adobe.cq.social.group.api.GroupConstants,
                     com.day.cq.commons.jcr.JcrConstants,
                     com.day.cq.commons.TidyJSONWriter,
                     com.day.cq.wcm.api.Page,
                     com.day.cq.wcm.api.PageManager" %>
<cq:includeClientLib categories="cq.social.group"/>
<%
        
    String togglePath= currentPage.getPath() + "/jcr:content/toggle";

    ResourceResolver resolver = slingRequest.getResourceResolver();
    final String srcRoot = properties.get("blueprint", "/content/geometrixx-outdoors/en/socialgroup");
    final PageManager pageMgr = resolver.adaptTo(PageManager.class);
    Resource src = resolver.getResource(srcRoot);

    String newCommunityLink = currentPage.getPath() + "/newcommunity/jcr:content/par.html";

    try {
        Iterator<Page> children = currentPage.listChildren();
        List<Page> temp = IteratorUtils.toList(children);
        int childnum = (children != null)?  temp.size()-3 : 0;
		if(childnum<0)    childnum = 0;
        children = IteratorUtils.getIterator(temp);
        
        if(!isAnonymous){
        
%>
<div class="section gray-button">
    <a data-title="<%= i18n.get("Create a new community") %>" class="lightbox" data-callback="CQ.soco.community.callback" href="<%= newCommunityLink %>">
        <span class="create-community"><%= i18n.get("Create a new community") %></span>
    </a>
</div>
<%
        }
%>
<div class="title section">
    <h2><%= i18n.get("Communities") %></h2>
</div>
<ul>
<%
        while (children.hasNext())  {
            Page livecopy = children.next();
            if(livecopy != null){
                String livecopyName = livecopy.getName();  
                //skip the signup page
                if("newcommunity".equals(livecopyName)||"editcommunity".equals(livecopyName)||"invite".equals(livecopyName))    continue;
                String livecopyTitle = xssAPI.encodeForHTML(livecopy.getTitle()); 
                String livecopyPath = livecopy.getPath();
                String livecopyDescription = xssAPI.encodeForHTML(livecopy.getDescription());
                String usergroupPath = livecopy.getProperties().get(GroupConstants.GROUP_MEMBERGROUP, GroupConstants.GROUP_GROUPROOT + livecopyName + GroupConstants.GROUP_MEMBERGROUP_SUFFIX);
                request.setAttribute(GroupConstants.GROUP_MEMBERGROUP, usergroupPath);   
                childnum++;    
                String imageSrc = slingRequest.getContextPath() + livecopyPath + "/photos/image.thumb.222.302." + System.currentTimeMillis() + ".jpg";
%>    
    <li class="recommend_article">
        <a class="article" href="<%= xssAPI.getValidHref(livecopyPath) %>.html">
            <img src='<%= xssAPI.getValidHref(imageSrc) %>' alt="<%= livecopyTitle %>" title="<%= livecopyTitle %>" />
            <div class="text">
                <h3><%= livecopyTitle %></h3>
                <p class="description"><%= livecopyDescription %></p>
                <span class="bg"></span>
            </div>
        </a>
    </li>
<%
            }
        }
    } catch(Exception e) {
         log.error("unknown while computing relationship.");
    }
%>  
</ul>
