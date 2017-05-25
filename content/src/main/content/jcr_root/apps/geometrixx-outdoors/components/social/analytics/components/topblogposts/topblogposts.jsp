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

 Top Blog Component

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
                    com.adobe.cq.social.blog.BlogEntry,
                    com.adobe.cq.social.blog.Blog,
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

final GeometrixxReportService reportService = sling.getService(info.geometrixx.commons.GeometrixxReportService.class);
Resource reportResource = resource.getChild("report/thirtyday");
JSONObject reportDataJSON = reportResource == null ? null : reportService.getReportData(reportResource);

JSONArray topics = reportDataJSON == null ? new JSONArray() : reportDataJSON.getJSONArray("eventdata.blogEntryPath");
List<String> result = new ArrayList<String>();
for (int i=0;i<topics.length();i++){
    JSONObject topic = topics.getJSONObject(i);
    String path = topic.getString("name");
    path = path.replace("metadata" , "");
    if(resourceResolver.getResource(path) == null) continue;
    result.add(path);
}
%>
<cq:includeClientLib categories="cq.social.analytics" />
<div class="title clearfix">
    <h2><%=xssAPI.encodeForHTML(reportletTitle) %></h2>
</div>
<div id="<%= divId %>" class="cq-reportlet">
<% for(String blogPath: result){ 
    final Resource blogResource = resourceResolver.getResource(blogPath);
    if (blogResource == null){
        log.debug("top blog resource missing:"+blogPath);
        continue;
    }
    
    BlogEntry entry = blogResource.adaptTo(BlogEntry.class);
    if (entry == null){
        log.debug("top blog is not a BlogEntry:"+blogPath);
        continue;
    }
%>
<div class="slot clearfix">
    <div class="text-heading"><span><span class="username"><%= xssAPI.encodeForHTML(entry.getAuthor()) %></span>
        <%=fmt.format(entry.getDate().getTime(), true)%><h2><%= xssAPI.encodeForHTML(entry.getTitle()) %></h2>
    </span>
    </div>
</div>
<%}%>
</div>
