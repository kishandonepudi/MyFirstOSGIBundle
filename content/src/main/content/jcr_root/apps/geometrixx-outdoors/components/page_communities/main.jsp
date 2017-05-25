<%--
  Copyright 1997-2009 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Draws the form to submit a new forum topic

--%><%@include file="/libs/social/commons/commons.jsp"%><%
%>
<div class="page-header-content page-header">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/>
    <section>
        <cq:include path="campaign-banner" resourceType="foundation/components/parsys"/>
    </section>
    <aside class="page-aside">
        <cq:include path="sidebar" resourceType="foundation/components/iparsys"/>
    </aside>
    <section class="page-par-right">
        <cq:include path="par" resourceType="foundation/components/parsys"/>
    </section>
</div>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>
