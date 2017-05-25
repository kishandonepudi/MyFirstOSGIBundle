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

  Generic <div> container start

--%><%@include file="/libs/foundation/global.jsp"%>
<%
%><%@ page import="org.apache.sling.api.resource.Resource,
                 org.apache.sling.api.resource.ResourceUtil,
                 org.apache.sling.api.resource.ValueMap,
                 org.apache.sling.scripting.jsp.util.JspSlingHttpServletResponseWrapper"%><%
%><cq:setContentBundle/><%
        String cssclass = properties.get("cssclass", String.class);
    %>
    <div class="<% if(cssclass != null) {%>
                <%=cssclass %>
                <%} %>"><%
    componentContext.setDecorate(false);
%>
