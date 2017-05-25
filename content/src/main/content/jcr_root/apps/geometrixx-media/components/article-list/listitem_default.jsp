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

  ==============================================================================

  List component sub-script

  Draws a list item as a default link.

  request attributes:
  - {com.day.cq.wcm.foundation.List} list The list
  - {com.day.cq.wcm.api.Page} listitem The list item as a page

--%><%
%><%@include file="/apps/geometrixx-media/global.jsp" %><%
%><%@ page session="false"
           contentType="text/html; charset=utf-8"
           import="info.geometrixx.commons.util.GeoHelper" %>
<%
    Page listItem = (Page) request.getAttribute("listitem");
    String description = xssAPI.encodeForHTMLAttr(listItem.getProperties().get("jcr:description", ""));
    String pagePath = request.getContextPath() + listItem.getPath();
%>

<li>
    <div class="category-item">
        <div class="image-box">
            <a class="article-list-image-link" href="<%= pagePath + ".html" %>" title="<%= description %>">
                <div data-picture data-alt='<%= description %>'>
                    <div data-src='<%= pagePath + ".image.127.127.low.jpg" %>'></div>
                    <div data-src='<%= pagePath + ".image.127.127.medium.jpg" %>' data-media="(min-width: 320px)"></div>
                    <div data-src='<%= pagePath + ".image.256.192.high.jpg" %>' data-media="(min-width: 980px)"></div>
                    <noscript>
                        <img src='<%= pagePath + ".image.127.127.low.jpg" %>' alt='<%= description %>'>
                    </noscript>
                </div>
            </a>
        </div>

        <div class="article-description-box">
            <div class="article-title">
                <h2><%= xssAPI.encodeForHTML(GeoHelper.getTitle(listItem)) %></h2>
            </div>

            <div class="article-description">
                <span><%= description %></span>
            </div>

            <div class="bottom">
                <div class="left">
                    <a class="read-more" href="<%= pagePath + ".html" %>"
                       title="<%= description %>"><%= i18n.get("read more") + " &gt;" %>
                    </a>
                </div>

                <div class="right">
                    <img src="/etc/designs/geometrixx-media/clientlibs/img/comment.png"/><span
                        class="hits"> <%= GeoHelper.getPageCommentCount(listItem, resourceResolver) %></span>
                </div>
            </div>
        </div>

    </div>
</li>
