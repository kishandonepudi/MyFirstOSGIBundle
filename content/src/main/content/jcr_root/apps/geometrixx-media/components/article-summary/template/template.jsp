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
%><%@ include file="/apps/geometrixx-media/global.jsp" %>
<%@ page session="false"
         contentType="text/html; charset=utf-8"
         import="info.geometrixx.commons.util.GeoHelper"%>
<%
    Page referencedPage = (Page)request.getAttribute("referenced.page");
%>
<c:set var="pathToPageImage" scope="page" value='<%= xssAPI.encodeForHTMLAttr( GeoHelper.getPageImagePath(referencedPage, "large-image") ) %>'/>
        <article class="large-image">
            <c:if test="${!empty pathToPageImage}">
                <span class="floating-tag"><span><%= xssAPI.encodeForHTML( referencedPage.getProperties().get("subtitle", "") ) %></span></span>
                <div class="article-summary-image">
                    <a href="<%= referencedPage.getPath() + ".html" %>"><img src='${pathToPageImage}' /></a>
                </div>
            </c:if>

            <div class="row-fluid">
                <div class="span11">
                    <h4><%= xssAPI.encodeForHTML( GeoHelper.getTitle(referencedPage) ) %></h4>
                </div>
                <div class="span1 social">
                    <img src="/etc/designs/geometrixx-media/clientlibs/img/comment.png" /> 3
                </div>
            </div>
        </article>
