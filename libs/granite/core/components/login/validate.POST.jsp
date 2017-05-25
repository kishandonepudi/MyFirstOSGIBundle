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
  --%><%@page session="false"
              contentType="application/json"
              pageEncoding="utf-8" %><%

    // Handle POST requests for CORS request to retrieve the login token.
    // todo: make list of allowed hosts and methods configurable
    response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
    response.setHeader("Access-Control-Request-Method", "GET,POST");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.getWriter().write("{\"success\":true}");
%>