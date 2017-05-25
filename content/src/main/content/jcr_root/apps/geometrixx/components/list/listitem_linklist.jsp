<%--
  Copyright 1997-2008 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  List component sub-script

  Draws a list item as a default link.

  request attributes:
  - {com.day.cq.wcm.foundation.List} list The list
  - {com.day.cq.wcm.api.Page} listitem The list item as a page

--%><%
%><%@ page session="false" import="com.day.cq.wcm.api.Page, org.apache.commons.lang3.StringEscapeUtils" %><%

    Page listItem = (Page)request.getAttribute("listitem");
    String title = StringEscapeUtils.escapeHtml4(listItem.getTitle());
%><li><a href="<%= listItem.getPath() %>.html" title="<%= title %>"><%= title %></a></li>