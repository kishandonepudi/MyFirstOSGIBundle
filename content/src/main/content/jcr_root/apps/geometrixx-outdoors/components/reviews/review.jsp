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
<%@page import="
				com.adobe.granite.security.user.UserPropertiesManager,
				java.util.ArrayList,
                 com.adobe.cq.social.tally.TallyConstants
				"%>
<%@include file="/libs/social/commons/commons.jsp"%>
<%
	final ValueMap valueMap = resource.adaptTo(ValueMap.class);
	final String commentText = xssAPI.encodeForHTML(valueMap.get("comment", ""));
	final String reviewAuthor = valueMap.get(TallyConstants.USER_PROPERTY, "");
    final UserPropertiesManager upm =  resourceResolver.adaptTo(UserPropertiesManager.class);
    
    final UserProperties authorProperties =upm.getUserProperties(reviewAuthor,
		"profile");
	String location = null;
    String authorName = reviewAuthor;
    String city = "";
    String region = "";
    if (authorProperties != null) {
        authorName =  xssAPI.encodeForHTML(authorProperties.getDisplayName()); 
        city = authorProperties.getProperty("city", "", String.class);
        region = authorProperties.getProperty("region", "", String.class);
    }
	
	if (!StringUtils.isEmpty(city) && !StringUtils.isEmpty(region)) {
	    location =  xssAPI.encodeForHTML(city + " ," + region);
	}
	final float ratingToRender = Float.parseFloat(valueMap.get("response", "0"));
    ArrayList<String> starTitles = new ArrayList<String>(5);
    starTitles.add(i18n.get("I hate it", "Rating meaning for 1 star"));
    starTitles.add(i18n.get("I don't like it", "Rating meaning for 2 stars"));
    starTitles.add(i18n.get("It's OK", "Rating meaning for 3 stars"));
    starTitles.add(i18n.get("I like it", "Rating meaning for 4 stars"));
    starTitles.add(i18n.get("I love it", "Rating meaning for 5 stars"));
	%><div class="ratings" style="wdith:100%;">
		<div class="author-info" style="float:left; width:50px;"><cq:include script="authoravatar-template.jsp"/></div>
		<div style="margin-left: 52px;"><%
			String starClass = "full";
			int i = 1;
			while (i <= 5) {
			    float padding = 0.0f;
			    if(i > ratingToRender) {
			        if(ratingToRender > i-1) {
			            starClass = "full";
			            padding = (16-((ratingToRender-(i-1)) * 0.8f * 20));
			        }
			        else {
			            starClass = "empty";
			        }
			    }
			    %><div class="ratings-star <%= starClass %>"title="<%= starTitles.get(i - 1) %>"style="margin-right: <%= padding %>px; width: <%= 16 - padding %>px;"></div><%
			    i++;
			}%>
			<div style="clear:both;"></div><%=i18n.get("by")%> <%= authorName%> <%=(location != null)?(i18n.get("from") + " " + location):""%></div>
		</div>
	<div style="clear:both;"/>
<p><%=commentText%></p>
