<%--
  ************************************************************************
  ADOBE CONFIDENTIAL
  ___________________

  Copyright 2011 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
  ************************************************************************

  This component renders application-specific properties within a catalog
  or section blueprint.

  These are properties within the application's templates which are to be
  replaced during catalog generation.

  In this example, the generated catalog pages will be searched for
  /par/banner/fileReference, and if found, the template value of the
  property will be replaced by the value supplied via the catalog/section
  blueprint dialog.

  Note that fieldset.xml defines the properties via the fields used to
  edit them.

--%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
%><%@ page contentType="text/html; charset=utf-8"
           import="com.day.cq.i18n.I18n,
           java.util.ResourceBundle" %><%

    final ResourceBundle resourceBundle = slingRequest.getResourceBundle(null);
    I18n i18n = new I18n(resourceBundle);
%>
<li><%= i18n.get("Banner:") %>&nbsp;<strong><%= xssAPI.encodeForHTML(properties.get("target/par/banner/fileReference", "")) %></strong></li>
