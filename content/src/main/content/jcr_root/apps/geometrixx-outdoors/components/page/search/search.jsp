<%--

  ADOBE CONFIDENTIAL
  __________________

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
--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@page import="com.day.cq.wcm.foundation.Search,
                  com.adobe.cq.commerce.api.CommerceQuery,
                  com.day.cq.i18n.I18n,
                  com.day.text.Text" %><%

    Search search = new Search(slingRequest);
    I18n i18n = new I18n(slingRequest);
    int absLevel = 2;
    Page homePage = currentPage.getAbsoluteParent(absLevel);
    String home = homePage != null ? homePage.getPath() : Text.getAbsoluteParent(currentPage.getPath(), absLevel);

%><cq:includeClientLib categories="cq.commerce"/>
<form class="search-form" action="<%= home %>/toolbar/search.html" method="get">
    <p class="search-field">
        <input id="search-field" type="text" name="<%= CommerceQuery.PARAM_QUERYTEXT %>" placeholder="<%= i18n.get("Search") %>" value="<%= xssAPI.encodeForHTMLAttr(search.getQuery()) %>" />
    </p>
    <p class="search-submit">
        <input type="submit" />
    </p>
</form>