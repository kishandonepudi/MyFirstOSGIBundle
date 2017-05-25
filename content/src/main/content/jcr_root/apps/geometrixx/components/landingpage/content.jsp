<%--
  ************************************************************************
  ADOBE CONFIDENTIAL
  ___________________

  Copyright 2011 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
  ************************************************************************
--%><%@ page import="com.day.cq.commons.JSONItem,
                     com.day.cq.tagging.Tag,
                     com.day.cq.wcm.api.WCMMode,
                     com.day.cq.wcm.core.stats.PageViewStatistics,
                     com.day.text.Text,
                     org.apache.sling.commons.json.JSONException,
                     org.apache.sling.commons.json.io.JSONWriter,
                     java.io.StringWriter, java.util.Iterator" %><%
%><%@include file="/libs/foundation/global.jsp" %><cq:includeClientLib categories="personalization.kernel"/><%

    String landingPagesPath = properties.get("landingPagesPath", String.class);
    //String location = "/content/geometrixx/en/landingpages";

    Page landingPageRoot = landingPagesPath != null ? pageManager.getPage(landingPagesPath) : null;

    if( landingPageRoot != null ) {
        final String strategyPath = properties.get("strategyPath", "");

        String strategy = "first";
        if ( strategyPath.length() > 0 ) {
            strategy = Text.getName(strategyPath);
            strategy = strategy.replaceAll(".js","");
        }

        //try to generate a "friendly" id for the div where teaser will be placed
        String targetDivId = "main";
        targetDivId = targetDivId.replace(':','_');

        LandingPage defaultLandingPage = null;

        final PageViewStatistics pwSvc = sling.getService(PageViewStatistics.class);
        String trackingURLStr = null;
        if (pwSvc!=null && pwSvc.getTrackingURI() != null) {
            trackingURLStr = pwSvc.getTrackingURI().toString();
        }

        StringBuffer allLandingPages = new  StringBuffer();
        Iterator<Page> iter = landingPageRoot.listChildren();
        boolean first = true;
        while (iter.hasNext()) {
            Page landingPage = iter.next();
            if(landingPage.isValid()) {
                ValueMap props = landingPage.getProperties();
                LandingPage hp = new LandingPage(
                        landingPage.getPath(),
                        landingPage.getName(),
                        props.get("cq:segments",String[].class),
                        landingPage.getTags(),
                        landingPageRoot.getName());
                StringWriter sw = new StringWriter();
                JSONWriter json = new JSONWriter(sw);
                hp.write(json);
                if ( ! first ) {
                    allLandingPages.append(",");
                }
                allLandingPages.append(sw.toString());
                first = false;

                //last teaser with no segment and no tag is the default teaser.
                if( hp.segments.length == 0 && hp.tags.length == 0) {
                    defaultLandingPage = hp;
                }
            }
        }
        %><script type="text/javascript">{
            initializeLandingPageLoader([<%=allLandingPages%>], "<%=strategy%>", "<%=targetDivId%>", "<%=(WCMMode.fromRequest(request) == WCMMode.EDIT)%>", "<%=trackingURLStr%>");
        }</script><div id="<%=targetDivId%>" class="redirected redirected-<%=landingPageRoot.getName()%>"><%
        %></div><%
    }
%><%!

    class LandingPage implements JSONItem {
        public String path;
        public String name;
        public String[] segments;
        public Tag[] tags;
        public String rootName;

        LandingPage(String path, String name, String[] segments, Tag[] tags, String rootName) {
            this.name = name;
            this.path = path;
            this.segments = segments;
            this.tags = tags;
            this.rootName = rootName;

            if(this.segments == null) {
                this.segments = new String[]{};
            }

            if(this.tags == null) {
                this.tags = new Tag[]{};
            }

        }

        public String getId() {
            return rootName + "_" + name;
        }


        public void write(JSONWriter out) throws JSONException {
            out.object();
            out.key("path").value(path);
            out.key("name").value(name);
            out.key("rootName").value(rootName);
            out.key("id").value(getId());
            out.key("segments");
            out.array();
            for(String s: segments) {
                out.value(s);
            }
            out.endArray();
            out.key("tags");
            out.array();
            for(Tag t: tags) {
                out.object();
                out.key("name").value(t.getName());
                out.key("title").value(t.getTitle());
                out.key("titlePath").value(t.getTitlePath());
                out.key("path").value(t.getPath());
                out.key("tagID").value(t.getTagID());
                out.endObject();
            }
            out.endArray();
            out.endObject();
        }
    }
%>