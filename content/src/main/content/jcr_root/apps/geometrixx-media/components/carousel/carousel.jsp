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
           import="java.util.Iterator,
                   java.util.LinkedHashMap,
                   java.util.Map,
                   com.day.cq.commons.Doctype,
                   com.day.cq.wcm.api.WCMMode,
                   com.day.cq.wcm.api.components.DropTarget,
                   com.day.cq.wcm.foundation.Image,
                   com.day.cq.wcm.foundation.List,
                   com.day.text.Text"
%><%
    if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
        //drop target css class = dd prefix + name of the drop target in the edit config
        String ddClassName = DropTarget.CSS_CLASS_PREFIX + "pages";
        %><div class="<%= ddClassName %>"><%
    }

    // initialize the list
    %><cq:include script="init.jsp"/><%
    List list = (List)request.getAttribute("list");
    if (!list.isEmpty()) {

        // first shove all slides into a map in order to calculate distinct ids
        Map<String, Slide> slides = new LinkedHashMap<String, Slide>();
        Iterator<Page> items = list.getPages();
        String pfx = "cqc-" + Text.getName(resource.getPath()) + "-";
        String contextPath = request.getContextPath();
        while (items.hasNext()) {
            Slide slide = new Slide(items.next(), contextPath);
            String name = pfx + slide.name;
            int idx = 0;
            while (slides.containsKey(name)) {
                name = pfx + slide.name + (idx++);
            }
            slide.name = name;
            slides.put(name, slide);
        }

        %><div class="carousel slide" id="bootstrapCarousel">

            <%-- write the actual slides --%>
            <div class="carousel-inner">
                <c:forEach var="slide" varStatus="loop" items="<%= slides.values() %>">
                    <c:choose>
                    <c:when test="${loop.index == 0}">
                        <div id="${slide.name}" class="active item">
                    </c:when>
                    <c:otherwise>
                        <div id="${slide.name}" class="item">
                    </c:otherwise>
                    </c:choose>
                        <c:if test="${!empty slide.img}">
                            <a href="${slide.path}.html" title="${slide.title}">
                            <div class="article-summary-image">
                                <a href="${slide.path}.html">
                                    <div data-picture data-alt='${slide.title}'>
                                        <div data-src='${slide.path}.image.370.150.medium.jpg' data-media="(min-width: 1px)"></div>
                                        <div data-src='${slide.path}.image.480.190.medium.jpg' data-media="(min-width: 480px)"></div>
                                        <div data-src='${slide.path}.image.770.300.medium.jpg' data-media="(min-width: 768px)"></div>
                                        <div data-src='${slide.path}.image.940.340.high.jpg'   data-media="(min-width: 980px)"></div>
                                        <div data-src='${slide.path}.image.1170.400.high.jpg'  data-media="(min-width: 1199px)"></div>
                                        <noscript>
                                            <img src='${slide.path}.image.370.150.low.jpg' alt='${slide.title}'>
                                        </noscript>
                                    </div>
                                </a>
                            </div>
                            </a>
                        </c:if>
                            <div class="carousel-caption">
                                <h4>${slide.title}</h4>
                            </div>
                </div>
                </c:forEach>
            </div>
                    
            <a class="carousel-control left" href="#bootstrapCarousel" data-slide="prev">&lsaquo;</a>
            <a class="carousel-control right" href="#bootstrapCarousel" data-slide="next">&rsaquo;</a>

        </div><%
    } else {
        if (WCMMode.fromRequest(request) == WCMMode.EDIT){
            %><img src="/libs/cq/ui/resources/0.gif" class="cq-carousel-placeholder" alt=""><%
        }
    }

    if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
        %></div><%
    }

%><%!

    /**
     * Container class for slides
     */
    public static final class Slide {
        private final Page page;
        private String img = "";
        private String title = "";
        private String name = "";
        private String desc = "";
        private String path = "";

        private Slide(Page page, String contextPath) {
            this.page = page;
            title = page.getTitle();
            desc = page.getDescription();
            if (desc == null) {
                desc = "";
            }
            path = contextPath + page.getPath();
            img = path + ".image.1170.400.high.jpg";
            name = page.getName();
        }

        public Page getPage() {
            return page;
        }

        public String getImg() {
            return img;
        }

        public String getTitle() {
            return title;
        }

        public String getName() {
            return name;
        }

        public String getDesc() {
            return desc;
        }

        public String getPath() {
            return path;
        }
    }
%>
