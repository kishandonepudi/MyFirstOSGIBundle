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

  Title component.

  Draws a title either store on the resource or from the page

--%><%@include file="/libs/foundation/global.jsp"%><%
%><%

    // first calculate the correct title - look for our sources if not set in paragraph
    String title = properties.get(NameConstants.PN_TITLE, String.class);
    if (title == null || title.equals("")) {
        // might be propagate from a head component
        title = (String) request.getAttribute("com.day.apps.geometrixx.title.pagetitle");

    }
    if (title == null || title.equals("")) {
        title = resourcePage.getPageTitle();
    }
    if (title == null || title.equals("")) {
        title = resourcePage.getTitle();
    }
    if (title == null || title.equals("")) {
        title = resourcePage.getName();
    }
    String defType = currentStyle.get("defaultType", "large");
    String type = properties.get("type", defType);
    String link = properties.get("href", "");
    if (link.length() > 0) {
        %><a href="<%= xssAPI.getValidHref(link) %>"><%
    }
    if (type.equals("small")) {
        %><cq:text property="jcr:title" value="<%= title %>" tagName="h3" escapeXml="true"/><%
    } else if (type.equals("link")) {
        %><cq:text property="jcr:title" value="<%= "\u00bb " + title %>" tagName="p" tagClass="link" escapeXml="true"/><%
    } else if (type.equals("extralarge")) {
        %><cq:text property="jcr:title" value="<%= title %>" tagName="h1" escapeXml="true"/><%
    } else {
        %><cq:text property="jcr:title" value="<%= title %>" tagName="h2" escapeXml="true"/><%
    }
    if (link.length() > 0) {
        %></a><%
    }
    %>
