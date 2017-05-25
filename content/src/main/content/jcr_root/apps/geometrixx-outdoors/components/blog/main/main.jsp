<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2011 Adobe Systems Incorporated
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

  Blog: Main component

  Creates a {com.day.cq.wcm.foundation.List} list from the request and sets
  it as a request attribute.

--%><%@ page session="false" import="com.adobe.cq.social.blog.Blog,
                     com.adobe.cq.social.blog.BlogManager,
                     com.day.cq.rewriter.linkchecker.LinkCheckerSettings,
                     com.day.cq.wcm.api.WCMMode" %><%!
%><%@include file="/libs/foundation/global.jsp"%><%

    BlogManager blogMgr = resource.getResourceResolver().adaptTo(BlogManager.class);
    Blog blog = blogMgr.getBlog(slingRequest);

    out.flush();
    LinkCheckerSettings.fromRequest(slingRequest).setIgnoreExternals(true);

    if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        %><cq:includeClientLib categories="cq.social.blog"/><%
    }

    if (blog.isEntry()) {
        %><cq:include path="../navigation" resourceType="social/blog/components/navigation" /><%
        %><cq:include path="../title" resourceType="social/blog/components/entrytitle" /><%
        %><cq:include path="../par" resourceType="foundation/components/parsys" /><%
        %><cq:include path="../metadata" resourceType="social/blog/components/metadata" /><%
        %><cq:include path="../alt" resourceType="foundation/components/parsys" /><%
    } else {
        // handle views
        String view = blogMgr.getView(request);
        if (Blog.VIEW_NEW.equals(view)) {
            %><cq:include path="newentry" resourceType="social/blog/components/entryform" /><%
        } else {
            %><cq:include path="entries" resourceType="social/blog/components/entrylist" /><%
        }
    }

    out.flush();
    LinkCheckerSettings.fromRequest(slingRequest).setIgnoreExternals(false);

%>