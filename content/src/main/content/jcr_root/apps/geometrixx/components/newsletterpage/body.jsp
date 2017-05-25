<%--
  Copyright 1997-2010 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Newsletter body script.

  ==============================================================================
--%>
<%@page import="com.day.cq.widget.HtmlLibraryManager" %>
<%@include file="/libs/foundation/global.jsp" %>

<body bgcolor="#444F55" marginwidth="0" marginheight="0" topmargin="0" leftmargin="0">
    <div id="wrapper">
        <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#444F55" border="0"><tbody>
            <tr><td height="30"><cq:include script="actionstoolbar.jsp"/></td></tr>
            <tr>
                <td valign="top">
                    <table cellpadding="0" cellspacing="0" width="560" bgcolor="#FFFFFF" border="0"
                            style="margin: 0 auto;"><tbody><tr>
                        <td>
                            <table cellpadding="0" cellspacing="0" width="530" border="0" style="margin: 0 auto;">
                                <tbody>
                                <tr><td height="15"></td></tr>
                                <tr><td>
                                        <cq:include path="header" resourceType="mcm/components/newsletter/header"/>
                                </td></tr>
                                <tr><td height="22"></td></tr>
                                <tr><td style="
                                        font-family:Tahoma,Geneva,sans-serif;
                                        font-size: 12px;
                                        color:#222222;
                                    "><cq:include path="par" resourceType="mcm/components/newsletter/parsys"/>
                                </td></tr>
                                <tr><td height="10"></td></tr>
                                <tr><td align="center" style="
                                    font-family:Arial,sans-serif;
                                    font-size:10px;
                                    color:#222222;
                                    text-align:center;
                                ">
                                        <cq:include path="copyright" resourceType="mcm/components/newsletter/copyright"/>
                                </td></tr>
                                <tr><td height="5"></td></tr>
                            </tbody></table>
                        </td>
                    </tr></tbody></table>
                </td>
            </tr>
            <tr><td height="20"></td></tr>
            <tr><td align="center" style="
                font-family:Arial,sans-serif;
                font-size:10px;
                color:#ffffff;
                text-align:center;
            ">
                    <cq:include path="footer" resourceType="mcm/components/newsletter/footer"/>
            </td></tr>
            <tr><td height="10"></td></tr>
        </tbody></table>
    </div>
<cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>    
</body>