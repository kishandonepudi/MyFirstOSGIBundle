<%@ taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %>
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

  ==============================================================================

     Community List

--%>
<%@include file="/libs/foundation/global.jsp" %>
<%
%>
<%@ page import="com.day.cq.i18n.I18n,
                 org.apache.commons.collections.IteratorUtils,
                 org.apache.commons.lang.StringUtils,
                 org.apache.sling.api.request.RequestParameter,
                 org.apache.sling.api.resource.ResourceResolver,
                 org.apache.sling.api.resource.ResourceUtil,
                 javax.jcr.Node,
                 javax.jcr.NodeIterator,
                 java.util.Locale,
                 java.util.ResourceBundle,
                 java.util.Calendar,
                 java.text.SimpleDateFormat,
                 com.day.cq.wcm.api.WCMMode" %>
<cq:includeClientLib categories="cq.social.group"/>
<%

    final Locale pageLocale = currentPage.getLanguage(true);
    final ResourceBundle resourceBundle = slingRequest.getResourceBundle(pageLocale);
    final I18n i18n = new I18n(resourceBundle);

    String[] monthName = {i18n.get("Jan"), i18n.get("Feb"),
            i18n.get("Mar"), i18n.get("Apr"), i18n.get("May"), i18n.get("Jun"), i18n.get("Jul"),
            i18n.get("Aug"), i18n.get("Sep"), i18n.get("Oct"), i18n.get("Nov"),
            i18n.get("Dec")};

    Node node = resource.adaptTo(Node.class);
//String submitEventLink = currentPage.getPath() + "/eventeditor/jcr:content/par.html";
String submitEventLink = "/content/usergenerated" + node.getPath() + "/events/.form.create.html" +  currentPage.getPath() + "/eventeditor";
%>
<aside class="calendar-detail-aside">
    <div class="mini-calendar">
        <div class="mini-calendar-view">
                            <span class="mini-inline-opts">
                                View:
                                <a href="#">Next 7 Days</a>
                                <span class="vert-inline-spacer">|</span>
                                <a href="#">Next 14 Days</a>
                            </span>
        </div>
        <!-- End .mini-calendar-view -->
    </div>
    <!-- End .mini-calendar -->
</aside>
<!-- End .calendar-detail-aside -->
<div class="soco-calendar-detail">
<header class="soco-event-header not-yet-implemented">
    <%if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {%>
    <a href="<%= submitEventLink %>" class="orange_button lightbox" data-title="Submit Event">Submit Event</a>
    <div style="clear:both"></div>
    <%}%>
</header>

<%
    if (node.hasNode("events")) {
        NodeIterator iterator = node.getNode("events").getNodes();
        while (iterator.hasNext()) {
            Node childNode = iterator.nextNode();
            
            // TODO These formats are not localized.
            SimpleDateFormat formatter = new SimpleDateFormat("EEEE, MMM. d, yyyy");
            SimpleDateFormat eventTimeFormatter = new SimpleDateFormat("k:mm a");
            
            String title = childNode.getProperty("jcr:title").getString();
            String description = "";
            String location = "";
            Calendar start = childNode.getProperty("start").getDate();
            Calendar end = childNode.getProperty("end").getDate();
            
            if (childNode.hasProperty("jcr:description")) {
                description = childNode.getProperty("jcr:description").getString();
            }
            
            if (childNode.hasProperty("location")) {
                location = childNode.getProperty("location").getString();
            }
            
            String startDate = formatter.format(start.getTime());
            String endDate = formatter.format(end.getTime());
            
            boolean multiDay = false;
            String dateFull = startDate;
            String eventTime = eventTimeFormatter.format(start.getTime());
            if (!startDate.equals(endDate)) {
                multiDay = true;
                dateFull = startDate + " " + i18n.get("to") + " " + endDate;
                eventTime = i18n.get("Multi Day");
            }
                        
            %>
        <div class="event-wrapper section">
            <div class="event-accordion-block">
                <div class="event-accordion-row">
                    <div class="event-accordion left-col">
                        <div class="event-date">
                            <span><%= monthName[start.get(Calendar.MONTH)] %></span>
        
                            <h2><%= start.get(Calendar.DAY_OF_MONTH) %></h2>
                        </div>
                    </div>
                    <div class="event-accordion right-col">
                        <h1><%= title %></h1>
        
                        <div class="accordion-toggle button"></div>
                        <div style="clear:both"></div>
                        <h2><%= dateFull %></h2>
        
                        <div style="clear:both"></div>
                    </div>
                    <div style="clear:both"></div>
                </div>
                <div class="event-accordion-row">
                    <div class="event-accordion left-col">
                        <div class="event-time">
                            <span class="<%= multiDay ? "multiday" : "normal" %>"><%= eventTime %></span>
                        </div>
                    </div>
                    <div class="event-accordion right-col">
                        <div class="event-gray-bar">
                            <span><strong class="not-yet-implemented">???????, </strong><%= location %></span>
        
                            <div class="event-gray-bar-right not-yet-implemented">
                                <div class="gray-button event">
                                    <a href="#"><%= i18n.get("Unsubscribe") %> (S)</a>
                                </div>
                            </div>
                            <div style="clear:both"></div>
                        </div>
                    </div>
                    <div style="clear:both"></div>
                </div>
                <div class="event-accordion-row">
                    <div class="event-accordion right-col content">
                        <p><%= description %></p>
        
                        <p class="not-yet-implemented event-type"><span>Event Type</span>: Winter Sports (S)</p>
        
                        <div class="event-accordion opts-bar">
                            <span class="option print"><a href="print-modal.html" class="modal"><%= i18n.get("print") %></a></span>
                            <span class="option permalink"><a href="#"><%= i18n.get("permalink") %></a></span>
                            <span class="option iCal"><a href="#"><%= i18n.get("iCal") %></a></span>
                            <div style="clear:both"></div>
                        </div>
                        <div style="clear:both"></div>
                    </div>
                </div>
                <div style="clear:both"></div>
            </div>
        </div>
<%
        }
    } else {
        %><%= i18n.get("Ready to meet some of the people in your community? Whether its a happy hour mixer, a presentation your latest trip, or a clinic on gear maintenance. Create an event and have others join you.")%><%
    }
%>
