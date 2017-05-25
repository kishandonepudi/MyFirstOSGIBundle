<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%@page session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page import="org.apache.sling.api.resource.ResourceUtil,
                  org.apache.sling.api.resource.NonExistingResource,
                  java.util.Calendar" %><%
%><%
    Calendar cal = Calendar.getInstance();
    String currentYear = String.valueOf(cal.get(Calendar.YEAR));

    // in case we have a footer node in the given configuration resource...
    Resource footerRes = resource.getChild("footer");
    if ((footerRes == null) || (footerRes instanceof NonExistingResource)) { // .. otherwise use the global one
        footerRes = resourceResolver.getResource("granite/ui/content/common/footer");
    }

    ValueMap fvm = ResourceUtil.getValueMap(footerRes);
    String copyright = fvm.get("copyright", "").replace("{year}", currentYear); // the copyright statement should be provided through a property

    // the css expects <a> and <span> rendering for child nodes
    %><footer>
        <sling:include path="<%= footerRes.getPath() %>" resourceType="granite/ui/components/foundation/contsys" />
        <%
        if (copyright.length() > 0) {
            %><span class="right"><%= outVar(xssAPI, i18n, copyright) %></span><%
        }
    %></footer><%
%>