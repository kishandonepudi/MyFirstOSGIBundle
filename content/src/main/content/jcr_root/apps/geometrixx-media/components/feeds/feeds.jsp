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
%><%@page session="false"
          import="org.apache.sling.api.resource.Resource,
                  java.util.Iterator"%><%
%><%@include file="/apps/geometrixx-media/global.jsp"%>

    <span class="title"><%=i18n.get("FOLLOW US")%></span>

    <%
        String feedsPath = currentStyle.get("feeds", "");
        Resource feeds = slingRequest.getResourceResolver().getResource(feedsPath);

        if (feeds != null) {
            Iterator<Resource> resourceIterator = feeds.listChildren();
            while(resourceIterator.hasNext()) {
                Resource feed = resourceIterator.next();%>
                    <cq:include path="<%=feed.getPath()%>" resourceType="geometrixx-media/components/feeds/feed"/><%
            }
        }
    %>