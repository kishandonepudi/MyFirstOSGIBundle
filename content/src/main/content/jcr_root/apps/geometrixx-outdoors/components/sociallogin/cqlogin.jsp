<%--
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
--%>

<%@ page import="com.day.cq.i18n.I18n,
                 com.day.cq.wcm.api.WCMMode,
                 com.day.text.Text,
                 com.day.cq.wcm.foundation.forms.FormsHelper" %>

<%@include file="/libs/foundation/global.jsp" %>

<cq:includeClientLib categories="cq.social.connect"/>

<%
    final String id = Text.getName(resource.getPath());
    I18n i18n = new I18n(slingRequest);
    final String action = currentPage.getPath() + "/j_security_check";
    final String validationFunctionName = "cq5forms_validate_" + id;
    final String signupPagePath = "/content/geometrixx-outdoors/en/user/register"; // TODO
    String defaultRedirect = currentPage.getPath();
    if (!defaultRedirect.endsWith(".html")) {
        defaultRedirect += ".html";
    }
    boolean isDisabled = WCMMode.fromRequest(request).equals(WCMMode.DISABLED);
%>

<script type="text/javascript">
    function <%=validationFunctionName%>() {
        if (CQ_Analytics) {
            var u = document.forms['<%=id%>']['j_username'].value;
            if (CQ_Analytics.Sitecatalyst) {
                CQ_Analytics.record({ event:"loginAttempt", values:{
                    username:u,
                    loginPage:"${currentPage.path}.html",
                    destinationPage:"<%= xssAPI.encodeForJSString(defaultRedirect) %>"
                }, componentPath:'<%=resource.getResourceType()%>'});
                if (CQ_Analytics.ClickstreamcloudUI && CQ_Analytics.ClickstreamcloudUI.isVisible()) {
                    return false;
                }
            }
        <% if ( !isDisabled ) {
           final String contextPath = slingRequest.getContextPath();
           final String authorRedirect = contextPath + defaultRedirect; %>
            if (CQ_Analytics.ProfileDataMgr) {
                if (u) {
                    /*
                     * AdobePatentID="B1393"
                     */
                    var loaded = CQ_Analytics.ProfileDataMgr.loadProfile(u);
                    if (loaded) {
                        var url = CQ.shared.HTTP.noCaching("<%= xssAPI.encodeForJSString(authorRedirect) %>");
                        CQ.shared.Util.load(url);
                    } else {
                        alert("<%=i18n.get("The user could not be found.")%>");
                    }
                    return false;
                }
            }
            return true;
        <% } else { %>
            if (CQ_Analytics.ProfileDataMgr) {
                CQ_Analytics.ProfileDataMgr.clear();
            }
            return true;
        <% } %>
        }
    }
</script>

<%
    final String jReason = request.getParameter("j_reason");
    if (null != jReason) {
%>
<div class="loginerror"><%=xssAPI.encodeForHTML(i18n.getVar(jReason))%>
</div>
<%
    }
%>

<div class="parsys_column colctrl-2c">
    <div class="parsys_column colctrl-2c-c0">
        <div class="title section">
            <h2><%=i18n.get("Member sign in")%>
            </h2>
        </div>
        <div class="parbase login section">
            <script type="text/javascript">
                function cq5forms_validate_login() {
                    console.log("some validation will happen here.");
                }
            </script>
            <div class="text section">If you already have an account you can sign in below.</div>

            <form method="POST"
                  action="<%= xssAPI.getValidHref(action) %>"
                  id="<%= xssAPI.encodeForHTMLAttr(id) %>"
                  name="<%= xssAPI.encodeForHTMLAttr(id) %>"
                  enctype="multipart/form-data"
                  onsubmit="return <%=validationFunctionName%>();">

                <input type="hidden" name="resource" value="<%= xssAPI.encodeForHTMLAttr(defaultRedirect) %>">
                <input type="hidden" name="_charset_" value="UTF-8"/>

                <p class="login_username_group">
                    <label for="<%= xssAPI.encodeForHTMLAttr(id + "_username")%>"><%= xssAPI.encodeForHTML("Username") %>
                    </label>
                    <input id="<%= xssAPI.encodeForHTMLAttr(id + "_username")%>"
                           class="cqusername form_field form_field_text login_username" type="text" name="j_username"
                           tabindex="9990"/>
                </p>

                <p class="login_password_group">
                    <label for="<%= xssAPI.encodeForHTMLAttr(id + "_password")%>"><%= xssAPI.encodeForHTML("Password") %>
                    </label>
                    <input id="<%= xssAPI.encodeForHTMLAttr(id + "_password")%>"
                           class="form_field form_field_text login_password cqpassword" type="password" autocomplete="off"
                           name="j_password" tabindex="9991"/>
                </p>

                <p class="login_submit_group">
                    <label for="login_submit"><input id="login_submit" class="form_button_submit" type="submit"
                                                     value="<%=i18n.get("Sign in")%>"
                                                     onclick="$CQ('#<%= xssAPI.encodeForHTMLAttr(id) %>').submit()"
                                                     tabindex="9992"/></label>
                </p>
            </form>
        </div>
    </div>
    <div class="parsys_column colctrl-2c-c1">
        <div class="title section">
            <h2>Create account</h2>
        </div>
        <div class="text parbase section">
            <ul>
                <li>Get free shipping on all orders of $100 or more</li>
                <li>Free returns, always</li>
                <li>Express checkout</li>
                <li>Save and share your favorite products with your friends</li>
            </ul>
        </div>
        <div class="submit section">
            <div class="form_row">
                <div class="form_leftcol">
                    <div class="form_leftcollabel"><span>&nbsp;</span></div>
                    <div class="form_leftcolmark">&nbsp;</div>
                </div>
                <div class="form_rightcol">
                    <form action="<%= signupPagePath %>.html">
                        <input type="submit" class="form_button_submit" name="create"
                               value="<%= i18n.get("Create Account") %>"/>
                    </form>
                </div>
            </div>
            <div class="form_row_description"></div>
        </div>
    </div>
</div>