<%@include file="/libs/foundation/global.jsp" %><%
%><link rel="stylesheet" href="/etc/designs/geometrixx_mobile/trader/static.css"/><%
    final StringBuffer cls = new StringBuffer();
    for (String c : componentContext.getCssClassNames()) {
        cls.append(c).append(" ");
    }
%>
<body style="background-color: #dddddd">
    <div id="wrapper" style="background-color: #dddddd" class="<%= cls %>">
        <cq:include path="par" resourceType="geometrixx/components/mobiletrader/parsys"/>
    </div>
</body>
