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

  Journal: Body script (included by page.jsp)

  ==============================================================================

--%><%@include file="/libs/foundation/global.jsp" %><%

%><body>
<cq:include path="clientcontext" resourceType="cq/personalization/components/clientcontext"/>
<div id="page">
    <cq:include path="header" resourceType="social/journal/components/header" />
    <cq:include script="content.jsp"/>
    <cq:include path="footer" resourceType="social/journal/components/footer" />
</div> 
<cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>
