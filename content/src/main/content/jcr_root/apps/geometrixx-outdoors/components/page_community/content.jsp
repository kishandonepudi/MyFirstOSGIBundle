<%--
  Copyright 1997-2009 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Draws the form to submit a new forum topic

--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@ page import="com.day.cq.i18n.I18n,
                     org.apache.commons.lang.StringUtils,
                     org.apache.sling.api.request.RequestParameter,
                     org.apache.sling.api.resource.ResourceResolver,
                     org.apache.sling.api.resource.ResourceUtil,
                     org.apache.sling.jcr.api.SlingRepository" %>

<% // TODO create component to select component for community landing page  %>
<% if (properties.get("landingPageContent").equals("journal")) { %>
    <cq:include path="../journal/jcr:content/journal/entries" resourceType="geometrixx-outdoors/components/journal/entrylist"/>
<% } %>

<% if (properties.get("landingPageContent").equals("forum")) { %>
    <cq:include path="../forum/jcr:content/par/forum" resourceType="social/forum/components/forum"/>
<% } %>

<% if (properties.get("landingPageContent").equals("calendar")) { %>
    <cq:include path="../calendar/jcr:content/par/calendar" resourceType="geometrixx-outdoors/components/calendar"/>
<% } %>