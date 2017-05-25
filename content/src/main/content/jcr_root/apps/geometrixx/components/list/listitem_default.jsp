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
%><%@ page session="false" import="com.day.cq.wcm.api.Page" %><%
%><%@ taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%

    Page listItem = (Page) request.getAttribute("listitem");
%><li>
    <a href="<%= listItem.getPath() %>.html">
        <cq:text value="<%= listItem.getTitle() %>" tagName="h4" placeholder="" escapeXml="true" />
        <cq:text value="<%= listItem.getDescription() %>" tagName="p" placeholder="" escapeXml="true" />
    </a>
</li>