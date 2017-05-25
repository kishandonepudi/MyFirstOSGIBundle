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

 ============================================================================
 
 Top Users Component

--%><%@page import="com.day.cq.commons.jcr.JcrConstants,
                    com.day.cq.wcm.api.WCMMode,
                    com.day.cq.wcm.api.Page,
                    com.day.cq.wcm.api.PageFilter,
                    com.day.cq.commons.Externalizer,
                    com.day.cq.i18n.I18n,
                    com.adobe.cq.social.commons.CollabUtil,
                    com.adobe.granite.security.user.UserProperties,
                    com.adobe.granite.security.user.UserPropertiesManager,
                    com.adobe.granite.security.user.UserPropertiesService,
                    org.apache.sling.api.resource.Resource,
                    org.apache.sling.api.resource.ResourceResolver,
                    org.apache.sling.api.resource.ResourceUtil,
                    org.apache.sling.api.resource.ValueMap,
                    org.apache.sling.commons.json.JSONObject,
                    org.apache.sling.commons.json.JSONArray,
                    info.geometrixx.commons.util.GeoHelper,
                    info.geometrixx.commons.GeometrixxReportService,
                    com.adobe.cq.social.commons.CollabUtil,
                    org.apache.commons.lang3.StringUtils,
                    java.util.Locale,
                    java.util.ResourceBundle" %><%
%><%@include file="/libs/foundation/global.jsp" %><%

final Locale pageLocale = currentPage.getLanguage(true);
final ResourceBundle resourceBundle = slingRequest.getResourceBundle(pageLocale);
final I18n i18n = new I18n(resourceBundle);

final GeometrixxReportService reportService = sling.getService(info.geometrixx.commons.GeometrixxReportService.class);
final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class) ;
final UserPropertiesManager upm = userPropertiesService.createUserPropertiesManager(resourceResolver);
final Externalizer externalizer = sling.getService(Externalizer.class);

String divId = "cq-reportlet-" + resource.getName();
String selectId = "dateSelector" + resource.getName();
final String NN_REPORT = "report";
final String NN_REPORTSELECTOR = ".sitecatalystreport.json";
String servletURI = resource.getPath() + "/report/thirtyday" + NN_REPORTSELECTOR;

String reportletTitle = properties.get("title", "");
final String absoluteDefaultAvatar = externalizer.absoluteLink(slingRequest, slingRequest.getScheme(), CollabUtil.DEFAULT_AVATAR);
String membersPath = currentPage.adaptTo(Node.class).getPath() + ".html";
if(currentPage != null && currentStyle != null && currentPage.getAbsoluteParent(currentStyle.get("absParent", 4)) != null)
  membersPath = currentPage.getAbsoluteParent(currentStyle.get("absParent", 4)).getPath() + "/members.html";
Resource reportResource = resource.getChild("report/thirtyday");
JSONObject reportDataJSON = reportResource == null ? null : reportService.getReportData(reportResource);

//iterate and add avatar url
JSONArray users = reportDataJSON == null ? new JSONArray() : reportDataJSON.getJSONArray("eventdata.commenterName");
for (int i=0;i<users.length();i++){
    JSONObject user = users.getJSONObject(i);
    String resourceAuthorID = user.getString("name");
    final UserProperties userProperties = CollabUtil.getUserProperties(resourceResolver,
        resourceAuthorID);
    if(userProperties == null) continue;
    
    String resourceAuthorName = userProperties.getDisplayName();
    if(StringUtils.isBlank(resourceAuthorName)){
        resourceAuthorName = userProperties.getProperty(UserProperties.GIVEN_NAME);
    }

    //TODO: resourceAuthorID may NOT be the email address!
    String resourceAuthorAvatar = CollabUtil.getAvatar(userProperties, resourceAuthorID, absoluteDefaultAvatar);
    user.put("displayName", resourceAuthorName);
    user.put("avatarurl", resourceAuthorAvatar);
}

%>

<cq:includeClientLib categories="cq.social.analytics" />
<div class="title clearfix">
    <h2><%=xssAPI.encodeForHTML(reportletTitle) %></h2>
    <a href="<%= membersPath %>"><%= i18n.get("view all +") %></a>
</div>
<div id="<%= divId %>" class="cq-reportlet">
    <%for (int i=0;i<users.length();i++){
        JSONObject user = users.getJSONObject(i);
        if(user.optString("displayName", null) == null) {
            log.debug("top user not found:{}", user.getString("name"));
            continue;
        }
        request.setAttribute("userId", user.getString("name"));
    %>
    <div class="slot gray clearfix ">
        <a href="#" class="clickable gray first clearfix ">
            <div class="sidebar-avatar">
                <img src="<%=user.getString("avatarurl")%>" style="width:45px;height:45px;display:block;">
            </div>
        </a>
        <div class="sidebar-member-info">
            <a href="#" class="clickable gray clearfix ">
                <div class="top-member"><%=user.getString("displayName")%></div>
            </a>
            <div class="badges clickable gray clearfix">
                <cq:include path="/content/geometrixx-outdoors/en/support/jcr:content/badge" resourceType="social/scoring/components/badgelist" />
            </div>

        </div>


    </div>

    <%}%>
</div>

