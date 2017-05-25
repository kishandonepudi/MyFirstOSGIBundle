<%@ page session="false"
         import="com.day.cq.wcm.mobile.api.device.Device" %><%
%><%@include file="/libs/foundation/global.jsp" %><%
    // detect device
    Device device = slingRequest.adaptTo(Device.class);
    if (device == null) {
        %><cq:include script="/libs/foundation/components/page/page.jsp"/><%
    } else {
        %><cq:include script="page_html5.jsp"/><%
    }
%>