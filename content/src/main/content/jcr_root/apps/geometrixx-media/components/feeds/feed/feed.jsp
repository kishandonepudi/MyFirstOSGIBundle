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
%><%@include file="/apps/geometrixx-media/global.jsp"%><%
%><%@page session="false" %><%
    String icon = "";
    String url = "";
    ValueMap vm = resource.adaptTo(ValueMap.class);
    boolean hasUrl = false;
    boolean hasIcon = false;
    
    if (vm != null) {
        icon = vm.get("icon", "");
        url = vm.get("url","");
        hasUrl = url.trim().length()>0;
        hasIcon = icon.trim().length()>0;
    }
    
    if(hasUrl){
        %><a href="<%=xssAPI.getValidHref(url)%>" target="_blank"><%
    }
    if(hasIcon){
        %><img src="<%=xssAPI.getValidHref(icon)%>"/><%
    }
    if(hasUrl){
        %></a><%
    }
%>

