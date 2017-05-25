<%--
  Copyright 1997-2011 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Journal: Head libs script (included by head.jsp)

  ==============================================================================

--%><%@ page import="com.day.text.Text,
                     com.day.cq.wcm.api.WCMMode" %><%
%><%@include file="/libs/foundation/global.jsp" %><%
    // Include journal design client lib
    // This client library has to be defined under '/etc' repository path
    // and his category must be named "cq.social.journal.<design nome name>".
    // The 'embed' property will contain all client libraries that a journal
    // page using that design may need to run correctly on a publish instance.
    if (currentDesign != null) {
        String libCategory = "cq.social.journal." + Text.getName(currentDesign.getPath());
        if (WCMMode.fromRequest(request) == WCMMode.DISABLED) {
            // just include the themes and css
            %><cq:includeClientLib css="<%= xssAPI.encodeForHTMLAttr(libCategory) %>"/><%
            %><cq:includeClientLib theme="<%= xssAPI.encodeForHTMLAttr(libCategory) %>"/><%
        } else {
            %><cq:includeClientLib categories="<%= xssAPI.encodeForHTMLAttr(libCategory) %>"/><%
        }
    }
%>