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
%><%@include file="/libs/social/commons/commons.jsp"%><%
%><%@ page import="com.adobe.cq.social.forum.api.Post,
					com.adobe.cq.social.forum.api.Forum,
					com.adobe.cq.social.commons.Comment,
                    com.adobe.cq.social.commons.CollabUser,
                    com.adobe.cq.social.commons.CollabUtil,
                    com.adobe.cq.social.forum.api.ForumUser,
                    com.day.cq.security.Authorizable,
                    static com.day.cq.xss.ProtectionContext.PLAIN_HTML_CONTENT,
                    com.adobe.granite.security.user.UserPropertiesManager,
                    com.adobe.granite.security.user.UserPropertiesService,
                    com.adobe.granite.security.user.UserProperties" %><%
%><%
    final Post post = resource.adaptTo(Post.class);
	final Forum forum = post.getForum();
	final Resource forumResource = resourceResolver.resolve(forum.getPath());
    final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class);
    final UserPropertiesManager upm = userPropertiesService.createUserPropertiesManager(resourceResolver);
	final UserProperties props = upm.getUserProperties(post.getCreatedBy().getUserID(), "profile");
    long numPosts = 0;
    if (props != null) {
 	numPosts = props.getProperty("forum/numberOfPosts", 0L, Long.class);    
    } else { 
        log.debug("could not load user properties for {}", post.getCreatedBy().getUserID()); 
    } 

    // We need to not just look at that "page" the resource is in, but 
    // the page that forum that the resource is in.
    final String badgePath= pageManager.getContainingPage(forumResource).getPath() + "/jcr:content/badge";
    request.setAttribute("userId", post.getCreatedBy().getUserID());

    if (null != post) {
		%><div class="forum_user">
            <div class="avatar">
                <a href="<%=xssAPI.getValidHref(socialProfileUrl)%>"><img src="<%= xssAPI.getValidHref(resourceAuthorAvatar) %>" <%
                        %>alt="<%= xssAPI.encodeForHTMLAttr(resourceAuthorName) %>" <%
                        %>title="<%= xssAPI.encodeForHTMLAttr(resourceAuthorName) %>"/></a>
                <a href="<%=xssAPI.getValidHref(socialProfileUrl)%>">
                    <span class="user"><%= xssAPI.encodeForHTMLAttr(resourceAuthorName) %></span>
                </a>
                <span class="joined not-yet-implemented">Joined: <strong>Jul 2012 (S)</strong></span>
                <span class="location">Location: <strong><%=xssAPI.filterHTML(post.getCreatedBy().getFullLocation())%></strong></span>
                <span class="numberOfPosts"><%=(numPosts == 1)?i18n.get("Post:"):i18n.get("Posts:")%> <strong><%=numPosts %></strong></span>
            </div>
	        <div class="badgedisplay">
	        	<cq:include path="<%=badgePath%>" resourceType="social/scoring/components/badgelist" />
	       	</div>            
        </div><%
    }
%>
