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
--%><%
%><%@ include file="/libs/social/commons/commons.jsp" %><%
%><%@ page import="org.apache.sling.api.SlingHttpServletRequest,
                    com.day.text.Text,
                    com.adobe.cq.social.group.api.GroupConstants" %><%
%><%@ page contentType="text/html; charset=utf-8" %>
<div class="page-header-content page-header">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/>
    <section class="page-par-left">
<%

    // force login 
    if(!isAnonymous){
        // draw entry form
        %>        
        <cq:include path="par" resourceType="foundation/components/parsys"/>

    <%}else {%>

          <h3 style="margin-left:40px"><%= i18n.get("Sign Up Form: access denied. Please ") %>
              <a style="text-decoration:underline; color:#06c;" onclick="$CQ.SocialAuth.sociallogin.showDialog('sociallogin-content-geometrixx-outdoors-en-support-jcr-content-userinfo-sociallogin');return false;"><%= i18n.get("Log In") %></a>
          </h3><p/>
    <%} %>
    </section>
    <aside class="page-aside-right">
        <cq:include path="sidebar" resourceType="foundation/components/iparsys"/>
    </aside>
</div>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>

<script type="text/javascript">
    $CQ(document).ready(function() {     
        var namefield = $CQ('input[name$="liveCopyTitle"]');
        if(namefield.length > 0){
            namefield.parent().append('<button type="button" style="margin:0px 10px 0px 10px;" name="validate-name">Validate Name</button>');
            namefield.parent().append('<span class="hidden validate-result" name="validate-result" id="validate-result"></span>');
        }

        var rootfield = $CQ('input[name$="liveCopyPath"]');
         
        function validateGroupName(){
            return (function(){
                var resultfield = $CQ('[name="validate-result"]');
                
                $CQ.ajax({
                    dataType: "json",
                    url: "/services/validategroupname",
                    data: "<%=GroupConstants.PROPERTY_LIVECOPY_TITLE%>="+namefield.val()+"&<%=GroupConstants.GROUP_GROUPROOT_PROPERTY%>="+rootfield.val(),
                    success: function(msg) {
                        if(msg.value=="true"){
                            resultfield.text('<%= i18n.get("name is valid.")%>');
                            resultfield.removeClass("invalid hidden").addClass("valid");
                        }else{
                            resultfield.text('<%= i18n.get("name is invalid!")%>');
                            resultfield.removeClass("valid hidden").addClass("invalid");
                        }
    
                    },
                    error: function(req, status, error) {
                        resultfield.text(msg.value);
                        resultfield.removeClass("valid hidden").addClass("invalid");
                    }
                });  
            });
        }
        
        namefield.blur(validateGroupName()); 
        
        $CQ('[name="validate-name"]').click(validateGroupName());
        
    }); 
</script> 