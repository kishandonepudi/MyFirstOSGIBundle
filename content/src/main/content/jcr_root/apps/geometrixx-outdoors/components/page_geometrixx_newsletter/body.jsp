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

<body style="background-color:#292826; margin:0; paddindg:0;">

    
    
  <table cellpadding="0" cellspacing="0" border="0" id="backgroundTable" style="font-family: Arial, Helvetica, sans-serif; background-color: #292826; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0; padding:0;">
    <tr><td height="30"><cq:include script="actionstoolbar.jsp"/></td></tr>
    <tr style="background-color:#3D3D3D;">
        <td height="30" style="background-color:#3D3D3D; font-size:11px; color: #B3B3B3;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" width="680">
                <tr>
                    <td width="15" style="background-color:#3D3D3D;"></td>
                    <td style="background-color:#3D3D3D;">
                        <span style="font-family: Arial, Helvetica, sans-serif; font-size:11px; color: #B3B3B3;">Gear up with the Geometrixx winter sale.</span>
                        <a href="#" title="View in a browser" style="text-decoration: none; font-family: Arial, Helvetica, sans-serif; font-size:11px; color: #EE5A29; padding:0; margin:0;">View in a browser &rsaquo;</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td valign="top">
            <table cellpadding="0" cellspacing="0" border="0" align="center" width="700" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                <tr>
                    <td height="50" width="204" valign="bottom">
                        <a href="#" target="_blank" title="geometrix outdoors">
                            <img class="image_fix" src="/etc/designs/geometrixx-outdoors/images/newsletter/geometrix-logo.jpg" title="geometrix" width="204" height="39" border="0" />
                        </a>
                    </td>
                    <td height="50" width="272" valign="bottom"></td>
                    <td height="50" width="204" valign="bottom" style="color: #E6E6E6; font-size: 12px;">
                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="204" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                            <tr>
                                <td colspan="7" height="10"></td>
                            </tr>
                            <tr>
                                <td width="17"></td>
                                <td width="52">
                                    <span style="color: #E6E6E6; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">SHARE:</span>
                                </td>
                                <td width="24">
                                    <a href="#" target="_blank" title="facebook">
                                        <img class="image_fix" src="/etc/designs/geometrixx-outdoors/images/newsletter/facebook-icon.jpg" title="facebook" width="16" height="15" border="0" />
                                    </a>
                                </td>
                                <td width="24">
                                    <a href="#" target="_blank" title="twitter">
                                        <img class="image_fix" src="/etc/designs/geometrixx-outdoors/images/newsletter/twitter-icon.jpg" title="twitter" width="16" height="15" border="0" />
                                    </a>
                                </td>
                                <td width="24">
                                    <a href="#" target="_blank" title="linked in">
                                        <img class="image_fix" src="/etc/designs/geometrixx-outdoors/images/newsletter/linkedin-icon.jpg" title="linked in" width="16" height="15" border="0" />
                                    </a>
                                </td>
                                <td width="24">
                                    <a href="#" target="_blank" title="email">
                                        <img class="image_fix" src="/etc/designs/geometrixx-outdoors/images/newsletter/email-icon.jpg" title="email" width="16" height="15" border="0" />
                                    </a>
                                </td>
                                <td width="40"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr height="10">
                </tr>
                        
                <tr>
                    <td valign="top" colspan="3" style="background-color: #F2F2F2">
                        <cq:include path="par" resourceType="/libs/foundation/components/parsys" />
                    </td>
                </tr>

                        
                <tr>
                    <td width="680" colspan="3">
                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="680" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                            <tr>
                                <td width="15"></td>
                                <td>
                                    <p style="font-size: 11px; font-family: Arial, Helvetica, sans-serif; line-height: 24px; color:#666666; padding:3px 0 0 0; margin:3px 0 0 0;">
                                        &copy; 2011 Geometrix Outdoors.  All rights reserved.<br />
                                        You received this newsletter because you are a newsletter subscriber of Geometrixx Outdoors.<br />
                                        <a href="#" target="_blank" title="Click here to unsubscribe" style="text-decoration: none; color: #EE5A29; padding:0; margin:0;">Click here to unsubscribe &rsaquo;</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr height="50">
                    <td colspan="3"></td>
                </tr>
            </table>
        </td>
    </tr>
</table>
<cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>