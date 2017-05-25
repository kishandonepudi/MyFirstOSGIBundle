<%@include file="/libs/foundation/global.jsp" %><%
%><%
    final StringBuffer cls = new StringBuffer();
    for (String c : componentContext.getCssClassNames()) {
        cls.append(c).append(" ");
    }
%>
<body>
    <cq:include path="contextcloud" resourceType="cq/personalization/components/contextcloud"/>
<div id="wrapper" class="<%= cls %>">
    <cq:include path="logo" resourceType="foundation/components/mobilelogo"/>
    <cq:include path="par" resourceType="foundation/components/parsys"/>
    <cq:include path="footer" resourceType="foundation/components/mobilefooter"/>
</div>
    <cq:include path="timing" resourceType="foundation/components/timing"/>
    <cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>
