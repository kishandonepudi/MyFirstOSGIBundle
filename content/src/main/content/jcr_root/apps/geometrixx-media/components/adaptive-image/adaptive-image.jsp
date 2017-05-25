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
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@page session="false"
          import="com.day.cq.wcm.api.WCMMode"%><%
%><%
    if (properties.get("fileReference", "").length() != 0 || resource.getChild("file") != null) {
        String path = request.getContextPath() + resource.getPath();
        String alt = xssAPI.encodeForHTMLAttr( properties.get("alt", ""));
%>
<div data-picture data-alt='<%= alt %>'>
    <div data-src='<%= path + ".adapt.320.low.jpg" %>'></div>                                        <%-- Small mobile --%>
    <div data-src='<%= path + ".adapt.320.medium.jpg" %>'    data-media="(min-width: 320px)"></div>  <%-- Portrait mobile --%>
    <div data-src='<%= path + ".adapt.480.medium.jpg" %>'    data-media="(min-width: 321px)"></div>  <%-- Landscape mobile --%>
    <div data-src='<%= path + ".adapt.476.high.jpg" %>'     data-media="(min-width: 481px)"></div>   <%-- Portrait iPad --%>
    <div data-src='<%= path + ".adapt.620.high.jpg" %>'     data-media="(min-width: 769px)"></div>  <%-- Landscape iPad --%>
    <div data-src='<%= path + ".adapt.full.high.jpg" %>'     data-media="(min-width: 1025px)"></div> <%-- Desktop --%>

    <%-- Fallback content for non-JS browsers. Same img src as the initial, unqualified source element. --%>
    <noscript>
        <img src='<%= path + ".adapt.320.low.jpg" %>' alt='<%= alt %>'>
    </noscript>
</div>
<%
    } else if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        out.write("<img class='cq-dd-image cq-image-placeholder' src='/etc/designs/default/0.gif'>");
    }
%>