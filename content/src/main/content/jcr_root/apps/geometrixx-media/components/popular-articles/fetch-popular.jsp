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
%><%@include file="/apps/geometrixx-media/global.jsp" %><%
%><%@ page session="false"
           contentType="text/html; charset=utf-8"
           import="java.util.List,
                 info.geometrixx.commons.popular.CommentRankedPopularPages,
                 info.geometrixx.commons.popular.DefaultPopularPages,
                 info.geometrixx.commons.popular.PageRankingResult,
                 info.geometrixx.commons.popular.PopularPages,
                 info.geometrixx.commons.util.GeoHelper,
                 com.day.cq.wcm.api.WCMMode"
%><%
    PopularPages popularPageRecommender = new CommentRankedPopularPages();

    String topLevelPagePath = properties.get("topLevelPage", "/content/geometrixx-media/" + currentPage.getLanguage(false));
    List<PageRankingResult> popularPages = popularPageRecommender.getPopularPages(topLevelPagePath, resourceResolver);

    if (popularPages.isEmpty()) {
        popularPages = new DefaultPopularPages(resource).getPopularPages(topLevelPagePath, resourceResolver);
    }
    
    for (PageRankingResult popularPageResult : popularPages) {
        Page popularPage = popularPageResult.getPage();
        if (popularPage != null) {
            String pagePath = request.getContextPath() + popularPage.getPath();
            String alt = xssAPI.encodeForHTMLAttr(popularPage.getProperties().get("jcr:description", ""));
%>
<div class="popular-articles clearfix">
    <article>
        <div class="article-summary-image">
            <a href="<%= pagePath + ".html" %>">
                <div data-picture data-alt='<%= alt %>'>
                    <div data-src='<%= pagePath + ".image.127.127.medium.jpg" %>' data-media="(min-width: 1px)"></div>
                    <%-- Mobile --%>
                    <div data-src='<%= pagePath + ".image.620.290.high.jpg" %>' data-media="(min-width: 481px)"></div>
                    <%-- Tablet --%>
                    <div data-src='<%= pagePath + ".image.770.360.high.jpg" %>' data-media="(min-width: 1025px)"></div>
                    <%-- Tablet --%>
                    <%-- Fallback content for non-JS browsers. Same img src as the initial, unqualified source element. --%>
                    <noscript>
                        <img src='<%= pagePath + ".image.127.127.medium.jpg" %>' alt='<%= alt %>'>
                    </noscript>
                </div>
            </a>
        </div>
        <div class="social-header">
            <span class="floating-tag"><span><%= xssAPI.encodeForHTML(popularPage.getProperties().get("subtitle", "")) %></span></span>
        </div>
        <div class="article-summary-description">
            <h4><%= xssAPI.encodeForHTML(GeoHelper.getTitle(popularPage)) %>
            </h4>
        </div>
        <div class="social">
            <img src="/etc/designs/geometrixx-media/clientlibs/img/comment.png"/>
            <span class="hits"> <%= popularPageResult.getCount() %></span>
        </div>
    </article>
</div>
<%
        }
    }

    if (popularPages.size() == 0 && WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        out.println("<img alt='Placeholder' src='/libs/cq/ui/widgets/themes/default/placeholders/list.png' />");
    }
%>