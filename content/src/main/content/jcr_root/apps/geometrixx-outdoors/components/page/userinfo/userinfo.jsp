<%--

  ADOBE CONFIDENTIAL
  __________________

   Copyright 2011 Adobe Systems Incorporated
   All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@page import="java.util.Arrays,
                  java.util.LinkedList,
                  java.util.List,
                  org.apache.commons.lang.StringUtils,
                  com.adobe.cq.commerce.api.CommerceConstants,
                  com.adobe.cq.commerce.api.CommerceService,
                  com.adobe.cq.commerce.api.CommerceSession,
                  com.adobe.cq.commerce.common.CommerceHelper,
                  com.adobe.cq.social.commons.CollabUtil,
                  com.day.cq.i18n.I18n,
                  com.day.cq.personalization.UserPropertiesUtil,
                  com.day.cq.wcm.api.WCMMode,
                  com.day.cq.wcm.mobile.api.device.DeviceGroup,
                  com.day.cq.wcm.mobile.api.device.DeviceGroupList" %><%
%><%@taglib prefix="personalization" uri="http://www.day.com/taglibs/cq/personalization/1.0" %><%

    final I18n i18n = new I18n(slingRequest);
    boolean isDisabled = WCMMode.fromRequest(request).equals(WCMMode.DISABLED);

    CommerceService commerceService = resource.adaptTo(CommerceService.class);
    CommerceSession commerceSession = commerceService.login(slingRequest, slingResponse);

    //
    // Determine a list of selectors which should be added to profile url:
    //
    DeviceGroupList deviceGroups = currentPage.adaptTo(DeviceGroupList.class);
    String deviceSelectors = "";
    if (deviceGroups != null) {
        List<String> selectors = Arrays.asList(slingRequest.getRequestPathInfo().getSelectors());
        List<String> deviceGroupList = new LinkedList<String>();

        if (selectors.size() > 0) {
            for (final DeviceGroup group : deviceGroups) {
                String groupName = group.getName();

                if ((groupName != null) && selectors.contains(groupName)) {
                    deviceGroupList.add(group.getName());
                }
            }
        }

        if (deviceGroupList.size() > 0) {
            deviceSelectors = "." + StringUtils.join(deviceGroupList, ".");
        }
    }

    final boolean isAnonymous = UserPropertiesUtil.isAnonymous(slingRequest);

    final String cartPagePath = CommerceHelper.mapPathToCurrentLanguage(currentPage, currentStyle.get("cartPage", ""));
    final String productNotFoundPagePath = CommerceHelper.mapPathToCurrentLanguage(currentPage, currentStyle.get("productNotFoundPage", ""));
    final String profilePagePath = CommerceHelper.mapPathToCurrentLanguage(currentPage, currentStyle.get("profilePage", ""));
    final String loginPagePath = CommerceHelper.mapPathToCurrentLanguage(currentPage, currentStyle.get("loginPage", ""));
    final String signupPagePath = CommerceHelper.mapPathToCurrentLanguage(currentPage, currentStyle.get("signupPage", ""));
    final String socialProfilePagePath = CommerceHelper.mapPathToCurrentLanguage(currentPage, currentStyle.get("socialProfilePage", ""));
    final String logoutPath = "/system/sling/logout";
    final String myProfileLink = "${profile.path}.form" + deviceSelectors + ".html" + profilePagePath;

    request.setAttribute(CommerceConstants.REQ_ATTR_CARTPAGE, cartPagePath);
    request.setAttribute(CommerceConstants.REQ_ATTR_PRODNOTFOUNDPAGE, productNotFoundPagePath);
    request.setAttribute(CommerceConstants.REQ_ATTR_CARTOBJECT, cartPagePath + "/jcr:content/par/shoppingcart");
    request.setAttribute(CollabUtil.REQ_ATTR_SOCIAL_PROFILE_PAGE, socialProfilePagePath);
%>
<nav><ul>
    <% if (!isAnonymous || !isDisabled) { %>
    <li class="user"><personalization:contextProfileProperty propertyName="formattedName" prefix="(" suffix=")"/></li>
    <% } %>
    <li class="cartpage"><a href="<%= cartPagePath %>.html"><%= i18n.get("My Cart") %> (<%= commerceSession.getCartEntryCount() %>)</a></li>
    <% if (!isAnonymous) { %>
    <li class="profilepage"><personalization:contextProfileLink displayValue="<%= i18n.get("My Profile") %>" href="<%= myProfileLink %>" id="myprofile-link"/></li>
    <li class="signout">
        <script type="text/javascript">function logout() {
            if (_g && _g.shared && _g.shared.ClientSidePersistence) {
                _g.shared.ClientSidePersistence.clearAllMaps();
            }

        <%      if( !isDisabled ) { %>
            if( CQ_Analytics && CQ_Analytics.CCM) {
                CQ_Analytics.ProfileDataMgr.loadProfile("anonymous");
                CQ.shared.Util.reload();
            }
        <%      } else { %>
            if( CQ_Analytics && CQ_Analytics.CCM) {
                CQ_Analytics.ProfileDataMgr.clear();
                CQ_Analytics.CCM.reset();
            }
            CQ.shared.HTTP.clearCookie("<%= CommerceConstants.COMMERCE_COOKIE_NAME %>", "/");
            CQ.shared.Util.load("<%= resourceResolver.map(request, logoutPath) %>.html");
        <%      } %>
        }</script>
        <a href="javascript:logout();"><%= i18n.get("Sign Out") %></a>
    </li>
    <% } else { %>
    <!--li class="login"><a href="<%= loginPagePath %>.html"><%= i18n.get("Sign In") %></a></li-->
    <!--li class="signup"><a href="<%= signupPagePath %>.html"><%= i18n.get("Sign Up") %></a></li-->
    <li class="login"><cq:include path="sociallogin" resourceType="geometrixx-outdoors/components/sociallogin"/></li>
    <% }%>
</ul></nav>
