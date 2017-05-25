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

--%>
<%--

  UGC Pagination component.
  
--%><%
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@ page import="com.adobe.cq.social.forum.api.Forum,
                    com.adobe.cq.social.forum.api.Post,
                    com.day.cq.i18n.I18n,
                    org.apache.commons.lang.math.NumberUtils,
                    java.util.List,
                    java.util.Locale,
                    java.util.ResourceBundle,
                    org.apache.sling.api.request.RequestParameter,
org.apache.sling.api.SlingHttpServletRequest" %>
<%
    final Forum forum = (Forum) resource.adaptTo(Forum.class);
    final Post topic = (Post) resource.adaptTo(Post.class);
    final Locale pageLocale = currentPage.getLanguage(true);
    final ResourceBundle resourceBundle = slingRequest.getResourceBundle(pageLocale);
    final I18n i18n = new I18n(resourceBundle);

    int totalPosts = 0;
    int limit = 0;

    final RequestParameter fromParam = slingRequest.getRequestParameter("from");
    final RequestParameter countParam = slingRequest.getRequestParameter("count");
    String baseURL = currentPage.getPath();
    if (null != topic) {
        totalPosts = topic.getRepliesCount();
        limit = (null != countParam)?Integer.parseInt(countParam.getString()):topic.getLimit();
        baseURL = topic.getUrl();
    } else if (null != forum) {
        totalPosts = forum.getTopicCount();
        limit = (null != countParam)?Integer.parseInt(countParam.getString()):forum.getLimit();
        baseURL = forum.getUrl();        
    }

    final int numPages = (int)Math.ceil((double)totalPosts / (double)limit);
    final int fromIndex = (null != fromParam)?Integer.parseInt(fromParam.getString()):0;
    final int currentPageNum = ((int)Math.floor((double)fromIndex / (double)limit)) + 1;
    final String prevPage = baseURL + "?from=" + Integer.toString(fromIndex - limit);
    final String nextPage = baseURL + "?from=" + Integer.toString(fromIndex + limit);
    final String prevPageClass = ((currentPageNum > 1) && (numPages > 1))?"":"display:none";
    final String nextPageClass = ((currentPageNum < numPages) &&(numPages > 1))?"":"display:none";
    final String onePageClass = (numPages > 1)?"":"hidden";

%>
<div class="pagination-wrapper clearfix"><%
        %>
    <ul class="<%=onePageClass%>">
        <li><p><%=i18n.get("Page:")%></p></li>
        <li><a class="prev ir" href="<%=prevPage%>" style="<%=prevPageClass%>"><%=i18n.get("Previous")%></a></li>
        <% for (int i = 0; i < numPages; i++) { 
            int itemPageNum = i+1;
            String itemUrl = baseURL + "?from=" + Integer.toString((itemPageNum - 1) * limit);
            %>
        <li><%
            if(itemPageNum != currentPageNum) {%>
                <a href="<%=itemUrl%>"><%=itemPageNum%></a><%
            } else {%>
                <span class="active"><%=itemPageNum%><span><%
            }

            if(itemPageNum != numPages) {%>
                <span class="divider">|</span><%
            }%>
        </li>
        <%}%>
        <li><a class="next ir" href="<%= nextPage%>" style="<%=nextPageClass%>"><%=i18n.get("Next")%></a></li>
    </ul>
</div>
<script>
    $CQ(function(){
    	CQ.soco.commons.configurePagination($CQ("#pagination"), <%=currentPageNum%>,<%=limit%>, <%=numPages%>);
    });
</script>