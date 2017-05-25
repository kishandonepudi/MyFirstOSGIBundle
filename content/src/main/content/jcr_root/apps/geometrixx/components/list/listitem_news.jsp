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

  Draws a list item as a news headline.
                                               r
  request attributes:
  - {com.day.cq.wcm.foundation.List} list The list
  - {com.day.cq.wcm.api.Page} listitem The list item as a page

--%><%
%><%@ page session="false"
           import="java.text.SimpleDateFormat,
                   java.util.Date,
                   com.day.cq.wcm.api.Page,
                   org.apache.commons.lang3.StringEscapeUtils"%><%!

    private static SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd");
   %><%

    Page listItem = (Page)request.getAttribute("listitem");
    String title = listItem.getTitle() != null ? listItem.getTitle() : listItem.getName();
    String description = listItem.getDescription() != null ? listItem.getDescription() : "";
    Date date = listItem.getProperties().get("date", Date.class);
    String dateStr = "";
    if (date != null) {
        dateStr = fmt.format(date);
    } else {
        dateStr = listItem.getProperties().get("subtitle", String.class);
        if (dateStr == null) {
            dateStr = fmt.format(new Date());
        }
    }

    %><li><a href="<%= listItem.getPath() %>.html" title="<%= StringEscapeUtils.escapeHtml4(title) %>">
        <p class="date"><%= StringEscapeUtils.escapeHtml4(dateStr) %></p>
        <p><%= StringEscapeUtils.escapeHtml4(title) %></p>
      </a></li>
