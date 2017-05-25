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
                 java.util.ArrayList,
                 java.util.Iterator,
                 java.net.URLDecoder,
                 info.geometrixx.commons.util.GeoHelper,
                 info.geometrixx.commons.util.GeoPageRecommender,
                 com.day.cq.wcm.api.WCMMode"
%><%
    List<String> listOfTagSelectors = new ArrayList<String>();

    final String tagNamespace = "geometrixx-media:";

    // Limit the number of tags we're willing to handle to 2
    final int tagLimit = 2;

    // Properties containing (up to) three default pages to render in the absence of real recommendations
    final String[] defaultPagePathProperties = {"firstDefault", "secondDefault", "thirdDefault"};

    int tagCount = 0;
    for (String currentSelector : slingRequest.getRequestPathInfo().getSelectors()) {
        String decodedTag = URLDecoder.decode(currentSelector);
        if (decodedTag.startsWith(tagNamespace)) {
            listOfTagSelectors.add(decodedTag);
            tagCount++;
            if (tagCount > tagLimit) {
                break;
            }
        }
    }

    String topLevelPagePath = properties.get("topLevelPage", "/content/geometrixx-media/" + currentPage.getLanguage(false));

    List<Page> recommendedPages = GeoPageRecommender.getPageRecommendations(listOfTagSelectors, topLevelPagePath, resourceResolver);
    // If we're short on recommendations, add in the defaults
    int defaultsNeeded = 3 - recommendedPages.size();
    for (int i = 0; i < defaultsNeeded; i++) {
        String currentDefaultPath = properties.get(defaultPagePathProperties[i], "");
        if (currentDefaultPath != null && currentDefaultPath.length() > 0) {
            recommendedPages.add(pageManager.getPage(currentDefaultPath));
        }
    }

    String alt;
    String pagePath;

    Iterator<Page> pageIterator = recommendedPages.iterator();
    if (pageIterator.hasNext()) {
        Page referencedPage = pageIterator.next();
        if (referencedPage != null) {
            alt = xssAPI.encodeForHTMLAttr(referencedPage.getProperties().get("jcr:description", ""));
            pagePath = request.getContextPath() + referencedPage.getPath();
%>
<%-- this should use the article-summary component to render this item --%>
<div class="article-summary">
    <article>
        <div class="article-summary-image">
            <a href="<%= pagePath + ".html" %>">
                <div data-picture data-alt='<%= alt %>'>
                    <div data-src='<%= pagePath + ".image.320.150.medium.jpg" %>' data-media="(min-width: 1px)"></div>
                    <div data-src='<%= pagePath + ".image.480.225.medium.jpg" %>' data-media="(min-width: 320px)"></div> <%-- Mobile --%>
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
        }
        if (pageIterator.hasNext()) {
%>
<div class="row-fluid mutli-col-article-summary"><%
            while (pageIterator.hasNext()) {
                referencedPage = pageIterator.next();
                if (referencedPage != null) {
                    alt = xssAPI.encodeForHTMLAttr(referencedPage.getProperties().get("jcr:description", ""));
                    pagePath = request.getContextPath() + referencedPage.getPath();
%>

    <div class="span6">
        <article>
            <div class="article-summary-image">
                <a href="<%= pagePath + ".html" %>">
                    <div data-picture data-alt='<%= alt %>'>
                        <div data-src='<%= pagePath + ".image.127.127.medium.jpg" %>' data-media="(min-width: 1px)"></div>
                        <div data-src='<%= pagePath + ".image.620.290.high.jpg" %>' data-media="(min-width: 481px)"></div>
                        <div data-src='<%= pagePath + ".image.770.360.high.jpg" %>' data-media="(min-width: 1025px)"></div>
                        <%-- Fallback content for non-JS browsers. Same img src as the initial, unqualified source element. --%>
                        <noscript>
                            <img src='<%= pagePath + ".image.127.127.medium.jpg" %>' alt='<%= alt %>'>
                        </noscript>
                    </div>
                </a>
            </div>
            <div class="social-header">
                <span class="floating-tag"><span><%= xssAPI.encodeForHTML(referencedPage.getProperties().get("subtitle", "")) %></span></span>
            </div>
            <div class="article-summary-description">
                <h4><%= xssAPI.encodeForHTML(GeoHelper.getTitle(referencedPage)) %></h4>
            </div>
            <div class="social">
                <img src="/etc/designs/geometrixx-media/clientlibs/img/comment.png"/><span
                    class="hits"> <%= GeoHelper.getPageCommentCount(referencedPage, resourceResolver) %></span>
            </div>
        </article>
    </div>
    <%
                }
            }
    %>
</div>
<%
        }
    }

    if (recommendedPages.size() == 0 && WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        out.println("<img alt='Placeholder' src='/libs/cq/ui/widgets/themes/default/placeholders/list.png' />");
    }
%>