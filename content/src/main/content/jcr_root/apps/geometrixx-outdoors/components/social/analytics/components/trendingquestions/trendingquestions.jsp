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

 Trending Questions Component

--%><%@page import="com.day.cq.commons.jcr.JcrConstants,
                    com.day.cq.wcm.api.WCMMode,
                    com.day.cq.wcm.api.Page,
                    com.day.cq.wcm.api.PageFilter,
                    com.day.cq.i18n.I18n,
                    org.apache.sling.api.resource.Resource,
                    org.apache.sling.api.resource.ResourceResolver,
                    com.day.cq.commons.date.RelativeTimeFormat,
                    org.apache.sling.api.resource.ResourceUtil,
                    org.apache.sling.api.resource.ValueMap,
                    info.geometrixx.commons.util.GeoHelper,
                    info.geometrixx.commons.GeometrixxReportService,
                    org.apache.sling.commons.json.JSONObject,
                    org.apache.sling.commons.json.JSONArray,
                    com.adobe.cq.social.forum.api.Post,
                    com.adobe.cq.social.forum.api.Forum,
                    java.util.Locale,
                    java.util.List,
                    java.util.ArrayList,
                    java.util.ResourceBundle" %><%
%><%@include file="/libs/foundation/global.jsp" %><%

final Locale pageLocale = currentPage.getLanguage(true);
final ResourceBundle resourceBundle = slingRequest.getResourceBundle(pageLocale);
final I18n i18n = new I18n(resourceBundle);
final RelativeTimeFormat fmt = new RelativeTimeFormat("r", resourceBundle);

String divId = "cq-reportlet-" + resource.getName();
String selectId = "dateSelector" + resource.getName();
final String NN_REPORT = "report";
final String NN_REPORTSELECTOR = ".sitecatalystreport.json";
String servletURI = resource.getPath() + "/report/thirtyday" + NN_REPORTSELECTOR;

String reportletTitle = properties.get("title", "");
String questionsPath = currentPage.adaptTo(Node.class).getPath() + ".html";
if(currentPage != null && currentStyle != null && currentPage.getAbsoluteParent(currentStyle.get("absParent", 4)) != null)
  questionsPath = currentPage.getAbsoluteParent(currentStyle.get("absParent", 4)).getPath() + "/questions.html";


final GeometrixxReportService reportService = sling.getService(info.geometrixx.commons.GeometrixxReportService.class);
Resource reportResource = resource.getChild("report/thirtyday");
JSONObject reportDataJSON = reportService.getReportData(reportResource);
List<String> result = new ArrayList<String>();

if(reportDataJSON != null && reportDataJSON.has("eventdata.category")) {
    JSONArray topics =  reportDataJSON == null ? new JSONArray() : reportDataJSON.getJSONArray("eventdata.category");
    for (int i=0;i<topics.length();i++){
        JSONObject category = topics.getJSONObject(i);
        if(!category.getString("name").equals("qna")) continue;
        JSONArray topicArray =  category.getJSONArray("eventdata.topic");
        for (int j=0;j<topicArray.length();j++){
            JSONObject topic = topicArray.getJSONObject(j);
            String topicPath =topic.getString("name");
            if(resourceResolver.getResource(topicPath) == null) continue;
            result.add(topicPath);
        }
    }
} else if (reportDataJSON != null && reportDataJSON.has("eventdata.topic")) {
    JSONArray topics = reportDataJSON == null ? new JSONArray() : reportDataJSON.getJSONArray("eventdata.topic");
    for (int i=0;i<topics.length();i++){
        JSONObject topic = topics.getJSONObject(i);
        String category = topic.getJSONArray("eventdata.category").getJSONObject(0).getString("name");
        if(category == null || !category.equals("qna")) continue;
        String topicPath = topic.getString("name");
        if(resourceResolver.getResource(topicPath) == null) continue;
        result.add(topicPath);
    }
}
%>
<cq:includeClientLib categories="cq.social.analytics" />
<div class="title clearfix">
    <h2><%=xssAPI.encodeForHTML(reportletTitle) %></h2>
    <a href="<%= questionsPath %>"><%= i18n.get("view all +","") %></a>
</div>
<div id="<%= divId %>" class="cq-reportlet">
<% for(String topicPath: result){ 
    final Resource topicResource = resourceResolver.getResource(topicPath);
    final Post topic = topicResource.adaptTo(Post.class);
    if(topic == null) continue;
%>
<div class="slot clearfix">
<a href="#" class="clickable clearfix">
    <div class="text-heading"><span><span class="username"><%=xssAPI.encodeForHTML(topic.getCreatedBy().getFullName())%></span>
        <%=fmt.format(topic.getCreated().getTime(), true)%><h2><%=xssAPI.encodeForHTML(topic.getSubject())%></h2>
    <p><%=xssAPI.encodeForHTML(topic.getMessage())%></p></span>
    </div>
</div>
<%}%>
</div>
