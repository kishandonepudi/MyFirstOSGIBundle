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
%><%@ page contentType="text/html; charset=utf-8" import="info.geometrixx.commons.util.GeoHelper"%><%

    final int startLevel = currentStyle.get("absParent", 2);
    final int endLevel = currentPage.getDepth() - currentStyle.get("relParent", 1);
    final int minItems = currentStyle.get("minItems", 1);

    if (startLevel <= endLevel - minItems) {
        %><ul><%
        for (int level = startLevel; level < endLevel; ++level) {
            Page itemPage = currentPage.getAbsoluteParent(level);

            if (itemPage == null || !itemPage.isValid() || itemPage.isHideInNav()) {
                break;
            }

            final String pagePath = itemPage.getPath() + ".html";
            final String pageTitle = GeoHelper.getNavTitle(itemPage);

            String className = "breadcrumb-item-"+level;
            if (level == startLevel) className += " breadcrumb-first";
            if (level == endLevel-1) className += " breadcrumb-last";
            pageContext.setAttribute("className", className);

            %><li class="<%= className %>"><a href="<%= xssAPI.getValidHref(pagePath) %>"><%= xssAPI.encodeForHTML(pageTitle) %></a></li><%
        }
        %></ul><%
    }

%>