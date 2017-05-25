<%--
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
--%><%@ page session="false"
             import="com.day.cq.wcm.api.WCMMode" %><%!
%><%@include file="/apps/geometrixx-media/global.jsp" %><%
    if (WCMMode.fromRequest(request) == WCMMode.DISABLED) {
        %><cq:includeClientLib categories="personalization.kernel"/><%
    } else {
        //include personalization editing widgets
        %><cq:includeClientLib categories="cq.personalization"/><%
    }

    String segmentsPath = "/etc/segmentation";
    String ccPath = currentStyle.get("path","/etc/clientcontext/geometrixx-media");
    String currentPath = currentPage != null ? currentPage.getPath() : "";

%><script type="text/javascript">
    $CQ(function() {
        CQ_Analytics.SegmentMgr.loadSegments("<%=segmentsPath%>");
        CQ_Analytics.ClientContextUtils.init("<%=ccPath%>","<%=currentPath%>");

        <%
            if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
                %>CQ_Analytics.ClientContextUtils.initUI("<%=ccPath%>","<%=currentPath%>");<%
            }
        %>
    });
</script>