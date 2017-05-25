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

--%>

<%@include file="/libs/social/commons/commons.jsp"%>
<%@ page
    import="com.adobe.cq.social.tally.RatingComponent, com.adobe.cq.social.tally.Rating, com.adobe.cq.social.tally.Response, java.util.ArrayList, java.util.Iterator"%>
<%
    
    Resource productResource = resourceResolver.getResource((String)request.getAttribute("cq.commerce.productTrackingPath"));

    RatingComponent r;
    if (productResource != null) {
        r = resourceResolver.resolve(productResource.getPath() + "/jcr:content/rating").adaptTo(RatingComponent.class);
    } else {
        r = resource.adaptTo(RatingComponent.class);
    }
    if(r !=null) {
        ValueMap userResponseVM = null;
        pageContext.setAttribute("rating",r);
        pageContext.setAttribute("isAnonymous", isAnonymous);
        Response<Rating> userRating = r.getUserResponse(loggedInUserID);
        if(userRating != null) {
            pageContext.setAttribute("userResponse",userRating.getResponseValue());
            userResponseVM = userRating.getResource().adaptTo(ValueMap.class);
        }

        final String starDivId = "reviews_stars_"+resource.getPath().substring(resource.getPath().lastIndexOf("/")+1,resource.getPath().length());
        final String ratingFormId = xssAPI.encodeForHTMLAttr("reviews_"+resource.getPath().substring(resource.getPath().lastIndexOf("/")+1,resource.getPath().length()));
        final String anonymousSignInText = i18n.get("Sign in in order to rate.");
        final float ratingToShow = userRating == null ? r.getAverageRating() : userRating.getResponseValue().getRating();

        ArrayList<String> starTitles = new ArrayList<String>(5);
        starTitles.add(i18n.get("I hate it", "Rating meaning for 1 star"));
        starTitles.add(i18n.get("I don't like it", "Rating meaning for 2 stars"));
        starTitles.add(i18n.get("It's OK", "Rating meaning for 3 stars"));
        starTitles.add(i18n.get("I like it", "Rating meaning for 4 stars"));
        starTitles.add(i18n.get("I love it", "Rating meaning for 5 stars"));
        
%>

<cq:includeClientLib categories="cq.social.reviews" />
<div class="reviewList">
    <%final Iterator<Response<Rating>> respIterator = r.getResponses(0L,100);
    Response<Rating> resp;
    if(r.getTotalNumberOfResponses() == 0) {
        %><%=i18n.get("No other reviews yet.")%><% 
    } else{
        while(respIterator.hasNext()) {
            resp = respIterator.next();
            if (!StringUtils.equals(resp.getUserId(), loggedInUserID)) {
                %><sling:include resource="<%=resp.getResource()%>" resourceType="<%=resource.getResourceType()%>" replaceSelectors="review"/><%
            }
        }
    }%>
</div>
<div class="ratings">
    <c:choose>
        <c:when test="${isAnonymous}">
            <div class="ratings-stars">
                <div class="ratings-bar empty"
                    title="<%= i18n.get("{0} of 5", "Rating value (of 5)", (r.getAverageRating())) %>">
                    <div class="ratings-bar full"
                        style="width:<%= (r.getAverageRating() * 20 * 0.8) %>px"></div>
                </div>
            </div>
            <span class="ratings-text">Average of <c:out
                    value="${rating.totalNumberOfResponses}" /> <%= properties.get("countTextPlural", i18n.get("ratings")) %>:
                <c:out value="${rating.averageRating}" /> <%= i18n.get("stars") %></span>
            <br />
            <%=anonymousSignInText %>
        </c:when>
        <c:otherwise>
            <form id="<%= ratingFormId %>" method="POST"
                action="<%= xssAPI.encodeForHTMLAttr(r.getRateURL()) %>">
                <span class="comment-text-label"><%= properties.get("title", i18n.get("Rating")) %></span>
                <%

    %><div class="ratings-stars">
                    <div class="ratings-bar empty"
                        title="<%= i18n.get("{0} of 5", "Rating value (of 5)", (r.getAverageRating())) %>">
                        <%
        int i = 1;
        final String fullStarClass = userRating == null ? "full" : "selected";
        while (i <= 5) {
            String starClass = fullStarClass;
            float padding = 0.0f;
            if(i > ratingToShow) {
                if(ratingToShow > i-1) {
                    starClass = fullStarClass;
                    padding = (16-((ratingToShow-(i-1)) * 0.8f * 20));
                }
                else {
                    starClass = "empty";
                }
            }
            %>
                        <div class="ratings-star <%= starClass %>"
                            title="<%= starTitles.get(i - 1) %>"
                            id="<%= ratingFormId %>-star-<%= i %>"
                            style="margin-right: <%= padding %>px; width: <%= 16 - padding %>px;">
                        </div>
                        <%
            i++;
        }
%>
                    </div>
                </div>
                <span class="ratings-text">Average of <c:out
                    value="${rating.totalNumberOfResponses}" /> <%= properties.get("countTextPlural", i18n.get("ratings")) %>:
                <c:out value="${rating.averageRating}" /> <%= i18n.get("stars") %></span>
                <textarea rows="5" style="width: 100%" name="comment"><%=(userResponseVM!=null)?userResponseVM.get("comment", ""):""%></textarea>                
                <input type="hidden" name="response" value="<%=(userRating == null)?"":userRating.getResponseValue().getRating()%>"/>                
                <input type="hidden" value="Rating" name="tallyType" />
                <input type="hidden" value="UTF-8" name="_charset_" />
                <input type="submit"/>                    
            </form>
                <script>
            $CQ(function(){
                var reviews = new Geometrixx.Reviews($CQ("#<%=ratingFormId%>"),<%= ratingToShow %>,<%= userRating == null ? "false" : "true" %>);
                     });
                </script>
        </c:otherwise>
    </c:choose>
</div>

<% } %>
