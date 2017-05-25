<%--
  Copyright 1997-2008 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  DAM Asset Editor page component.

  Is used as base for all "page" components. It basically includes the "head"
  and the "body" scripts.

  ==============================================================================

--%><%@page session="false"
            contentType="text/html; charset=utf-8"
            import="com.day.cq.commons.Doctype,
                    com.day.cq.wcm.api.WCMMode,
                    com.day.cq.wcm.foundation.ELEvaluator,
                    com.day.cq.wcm.foundation.forms.ValidationInfo,
                    com.day.cq.wcm.foundation.forms.FormResourceEdit" %><%
%><%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><cq:defineObjects/><%

    // read the redirect target from the 'page properties' and perform the
    // redirect if WCM is disabled.
    String location = properties.get("redirectTarget", "");
    // resolve variables in path
    location = ELEvaluator.evaluate(location, slingRequest, pageContext);
    if (WCMMode.fromRequest(request) != WCMMode.EDIT && location.length() > 0) {
        // check for recursion
        if (!location.equals(currentPage.getPath())) {
            final String redirectTo = slingRequest.getResourceResolver().map(request, location) + ".html";
            response.sendRedirect(redirectTo);
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        return;
    }
    // set doctype
    currentDesign.getDoctype(currentStyle).toRequest(request);

%><%= Doctype.fromRequest(request).getDeclaration() %><%
    if (request.getParameter(FormResourceEdit.REOPEN_PARAM) != null && ValidationInfo.getValidationInfo(request) == null) {
        // redirect after writing multiple resoures;
        // since the resources are lost try to reopen the earlier opened assets from Asset Share
        // or close this window if the Asset Share is no longer available fails (e.g. has been closed)
        %><html><head><script type="text/javascript">
            try {
                window.opener.CQ.dam.Util.reopenAssets();
            }
            catch (e) {
                window.close();
            }
        </script></head></html><%
        return;
    }
%>
<html>
<cq:include script="head.jsp"/>
<cq:include script="body.jsp"/>
</html>
