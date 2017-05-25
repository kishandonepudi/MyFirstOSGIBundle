<%--
  Copyright 1997-2010 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Top Navigation component JS include.

  Draws the java script version of the top navigation by including the
  "real" topnav component but storing the output in a own writer and then
  rendering the content via "document.write".

--%><%@page session="false"
            contentType="text/html"
            pageEncoding="utf-8"
            import="java.io.StringWriter" %><%
%><%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><cq:defineObjects /><%

    // create own writer and push it to the context
    StringWriter w = new StringWriter();
    pageContext.pushBody(w);
    %><cq:include path="topnav" resourceType="geometrixx/components/topnav"/><%
    pageContext.popBody();
    String text = w.toString();

    // escape some of the special characters. we can't use
    // StringEscapeUtils.escapeJavaScript, since it also escaped double quotes,
    // which will cause problems with the linkchecker.
    text = text.replace("\r", "");
    text = text.replace("\n", "");
    text = text.replace("'", "\\'");

    // we get the last modification date of the page to help browser caching
    response.setDateHeader("Last-Modified", currentPage.getLastModified().getTimeInMillis());

    // write the included content
    out.write("document.write('");
    out.write(text);
    out.write("');");
%>