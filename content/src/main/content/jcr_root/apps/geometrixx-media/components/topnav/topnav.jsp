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
<%@include file="/apps/geometrixx-media/global.jsp"%><%
%><%@ page session="false"
           import="java.util.Iterator,
                   com.day.cq.wcm.api.PageFilter" %><%

    // get starting point of navigation
    long absParent = currentStyle.get("absParent", 2L);
    Page rootPage = currentPage.getAbsoluteParent((int) absParent);

    Iterator<Page> childPages = null;
    if (rootPage != null) {
        childPages = rootPage.listChildren(new PageFilter(request));
    }
%>

<div class="visible-phone">
    <a class="btn btn-inverse menu-dropdown">Menu <i class="icon-chevron-down icon-white"></i></a>
    <a class="btn btn-inverse authenticate"><i class="icon-cog icon-white"></i></a>
</div>

<nav>
    <ul>
        <%
            if (childPages != null) {
                while (childPages.hasNext()) {
                    String cssStyle = "";
                    Page childPage = childPages.next();
                    if (isCurrentPage(currentPage, childPage)) {
                        cssStyle = "class='current-page'";
                    }
                    String title = getTitle(xssAPI, childPage);
                    %><li <%=cssStyle%>><a href="<%= childPage.getPath() %>.html"><%= title %></a></li>
        <%
                }
            }
        %>
    </ul>
    <cq:include path="search" resourceType="geometrixx-media/components/page/search"/>
</nav>


<%!
    boolean isCurrentPage(Page currentPage, Page page) {
        return currentPage.equals(page);
    }

    String getTitle(XSSAPI xssAPI, Page page) {
        String navTitle = page.getNavigationTitle();

        if(navTitle == null) {
            navTitle = page.getTitle();
        }
        if(navTitle == null) {
            navTitle = page.getName();
        }

        return xssAPI.encodeForHTML(navTitle);
    }
%>
