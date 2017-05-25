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
<div class="row-fluid mutli-col-article-summary"><%
    String[] articlePathProperties = {"article1Path", "article2Path"};

    int count = 0;
    for (String pathProperty : articlePathProperties) {
        Page referencedPage = pageManager.getPage(properties.get(pathProperty, ""));

        if (referencedPage != null) {
            String alt = xssAPI.encodeForHTMLAttr(referencedPage.getProperties().get("jcr:description", ""));
            String pagePath = request.getContextPath() + referencedPage.getPath();%>

    <div class="span6">
        <article>
            <div class="article-summary-image">
                <a href="<%= pagePath + ".html" %>">
                    <div data-picture data-alt='<%= alt %>'>
                        <div data-src='<%= pagePath + ".image.127.127.medium.jpg" %>' data-media="(min-width: 1px)"></div>
                        <div data-src='<%= pagePath + ".image.127.127.medium.jpg" %>' data-media="(min-width: 320px)"></div> <%-- Mobile --%>
                        <div data-src='<%= pagePath + ".image.620.290.high.jpg" %>' data-media="(min-width: 481px)"></div>   <%-- Tablet --%>
                        <div data-src='<%= pagePath + ".image.770.360.high.jpg" %>' data-media="(min-width: 1025px)"></div>  <%-- Tablet --%>
                        <%-- Fallback content for non-JS browsers. Same img src as the initial, unqualified source element. --%>
                        <noscript>
                            <img src='<%= pagePath + ".image.127.127.low.jpg" %>' alt='<%= alt %>'>
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
                count++;
            }
        }

        if (count == 0 && WCMMode.fromRequest(request) != WCMMode.DISABLED) {
            out.println("<img alt='Placeholder' src='/libs/cq/ui/widgets/themes/default/placeholders/list.png' />");
        }
    %>
</div>