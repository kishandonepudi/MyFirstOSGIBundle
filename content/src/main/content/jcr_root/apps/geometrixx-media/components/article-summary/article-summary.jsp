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
         import="info.geometrixx.commons.util.GeoHelper,
                 com.day.cq.wcm.api.WCMMode" %>
<%
    Page referencedPage = pageManager.getPage(properties.get("pagePath", ""));
    if (referencedPage != null) {
        String alt = xssAPI.encodeForHTMLAttr(referencedPage.getProperties().get("jcr:description", ""));
        String pagePath = request.getContextPath() + referencedPage.getPath();
%>
<div class="article-summary clearfix">
    <article>
        <div class="article-summary-image">
            <a href="<%= pagePath + ".html" %>">
                <div data-picture data-alt='<%= alt %>'>
                    <div data-src='<%= pagePath + ".image.320.150.medium.jpg" %>' data-media="(min-width: 1px)"></div>
                    <div data-src='<%= pagePath + ".image.480.225.medium.jpg" %>' data-media="(min-width: 321px)"></div> <%-- Mobile --%>
                    <div data-src='<%= pagePath + ".image.620.290.high.jpg" %>' data-media="(min-width: 481px)"></div>   <%-- Tablet --%>
                    <div data-src='<%= pagePath + ".image.770.360.high.jpg" %>' data-media="(min-width: 1025px)"></div>  <%-- Tablet --%>
                    <%-- Fallback content for non-JS browsers. Same img src as the initial, unqualified source element. --%>
                    <noscript>
                        <img src='<%= pagePath + ".image.320.150.low.jpg" %>' alt='<%= alt %>'>
                    </noscript>
                </div>
            </a>
        </div>
        <div class="social-header">
            <span class="floating-tag"><span><%= xssAPI.encodeForHTML(referencedPage.getProperties().get("subtitle", "")) %></span></span>

            <div class="social">
                <img src="/etc/designs/geometrixx-media/clientlibs/img/comment.png"/><span
                    class="hits"> <%= GeoHelper.getPageCommentCount(referencedPage, resourceResolver) %></span>
            </div>
        </div>
        <div class="article-summary-description">
            <h4><%= xssAPI.encodeForHTML(GeoHelper.getTitle(referencedPage)) %></h4>
        </div>
    </article>
</div>

<%
    } else if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        out.println("<img alt='Placeholder' src='/libs/cq/ui/widgets/themes/default/placeholders/list.png' />");
    }
%>