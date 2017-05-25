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
--%><%@include file="/apps/geometrixx-media/global.jsp"%><%
%><%@page session="false"
          import="com.day.cq.wcm.foundation.Search,
                  com.day.text.Text" %><%

    Search search = new Search(slingRequest);
    int absLevel = 2;
    Page homePage = currentPage.getAbsoluteParent(absLevel);
    String home = homePage != null ? homePage.getPath() : Text.getAbsoluteParent(currentPage.getPath(), absLevel);

%><div id="globalsearch">
    <form class="form-search" action="<%= home %>/toolbar/search.html" method="get">
        <div class="sp-magnify"></div>
        <div id="sp-label">
            <input class="cq-auto-clear" type="text" name="q" value="<%= search.getQuery() %>" id="sp-searchtext">
        </div>
    </form>
</div>

