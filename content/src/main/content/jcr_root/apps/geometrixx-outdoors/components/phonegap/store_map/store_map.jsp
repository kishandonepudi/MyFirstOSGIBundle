<%--
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
--%>

<%@include file="/libs/foundation/global.jsp"%><%
%><%@ page contentType="text/html; charset=utf-8" import="
    com.day.cq.wcm.api.WCMMode"
%>
<c:set var="nodeId" value='${fn:replace(currentNode.identifier, "-", "")}'/>

<!-- Google maps API JS -->
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?sensor=true"></script>

<!-- Include the store map client library -->
<cq:includeClientLib categories="cq.storemap" />

<script type="text/javascript">

    // Initialize the map component once device is ready
    document.addEventListener("deviceready", function() {

        // Initialize component with unique container element
        var options ={
            rootElementId: "map${nodeId}"
        };

        var destination = '<%= xssAPI.encodeForJSString( properties.get("./storeAddress", "") ) %>';
        if (destination.length > 0) {
            // If a destination has been set in the dialog, use it.
            options.destinationAddress = destination;
        }

        var storeMap = new CQStoreMap(options);
        storeMap.initializeStoreMapComponent();

    }, false);

</script>

<div id="map${nodeId}">
    <div class="mapCanvas" style="height:200px;">
        <% if (WCMMode.fromRequest(request) != WCMMode.DISABLED) { %>
                <img src="<%= currentDesign.getPath() %>/images/phonegap/store_map/placeholder.png" />
        <% } else { %>
                Initializing map...
        <% } %>
    </div>
</div>