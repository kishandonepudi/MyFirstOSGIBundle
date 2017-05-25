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

  ==============================================================================

  User State Toggle Button Component

--%><%@ page import="java.util.List,
                     org.apache.commons.lang3.StringEscapeUtils,
                     org.apache.sling.api.resource.ResourceUtil,
                     com.adobe.cq.social.commons.ToggleUtil,
                     com.adobe.cq.social.group.api.GroupConstants,
                     com.adobe.cq.social.group.api.GroupUtil,
                     org.apache.sling.api.resource.ResourceResolver,
                     com.day.cq.wcm.api.Page,
                     com.day.cq.commons.Doctype,
                     java.util.ResourceBundle,
                     com.day.cq.wcm.api.WCMMode,
                     com.day.cq.wcm.foundation.forms.FormsHelper" %><%
%><%@include file="/libs/social/commons/commons.jsp"%><%
%><cq:includeClientLib js="cq.social.toggle"/><%

    final String xs = Doctype.isXHTML(request) ? "/" : "";

    final String stateProviderPath = properties.get(ToggleUtil.PN_STATEPROVIDER, "");
    final String needApproval = properties.get(ToggleUtil.PN_NEEDAPPROVAL, "false");

    // we cannot work without a state provider
    if ("".equals(stateProviderPath)) {
    %> But no state provider.<%
        if (WCMMode.EDIT == WCMMode.fromRequest(slingRequest)) {
            %><img src="/libs/cq/ui/resources/0.gif" class="cq-collab-userstatetoggle-placeholder" alt=""<%=xs%>><%
        }
        return;
    }

    // the button shall only be displayed if a non-anonymous user is "logged in" (or a profile is loaded)
    if (isAnonymous) {

        if (WCMMode.EDIT == WCMMode.fromRequest(slingRequest)) {
            %><div class="cq-form-hidden-placeholder" title="<%= i18n.get("Hidden because of a anonymous profile") %>"><%= i18n.get("User Toggle State") %></div><%
        }
        return;
    }

    final List<Resource> editResources = FormsHelper.getFormEditResources(slingRequest);

    Resource actionResource = null;
    String actionResourcePath = null;
    // first priority for form chooser resource
    if (null != editResources && editResources.size() > 0) {

        actionResource = editResources.get(0);

    }

    if(actionResourcePath  == null){
        ResourceResolver resolver = resource.getResourceResolver();
        String communityPage = GroupUtil.getCommunityRootPagePath(resolver, resource.getPath());
        if(communityPage != null) {
            actionResource = resolver.getResource(communityPage).adaptTo(Page.class).getContentResource();
            final ValueMap props = ResourceUtil.getValueMap(actionResource);
            actionResourcePath = props.get(GroupConstants.GROUP_MEMBERGROUP, "");
        }
    }

    final String author = loggedInUserID;

    // include the state provider, which is supposed to set the toggle state as a request attribute
    %><sling:include path="<%=actionResourcePath%>" resourceType="<%=stateProviderPath%>"/><%

    // retrieve the state as set by the above included state provider
    final ToggleUtil.STATE state = ToggleUtil.fromRequest(slingRequest);

    // the state provider can instruct the button to be hidden (e.g. if a "friend" button is
    // displayed on one's own profile)
    if (ToggleUtil.STATE.HIDE == state) {
        if (WCMMode.EDIT == WCMMode.fromRequest(slingRequest)) {
            %><div class="cq-form-hidden-placeholder" title="<%= i18n.get("Hidden because of state provider determination") %>"><%= i18n.get("User Toggle State") %></div><%
        }
        return;
    }

    String label = properties.get(ToggleUtil.PN_UNTOGGLELABEL, i18n.get("Off"));

    if (ToggleUtil.STATE.TRANSITION == state) {
        label = properties.get(ToggleUtil.PN_TRANSITIONLABEL, i18n.get("Pending"));

    } else if (ToggleUtil.STATE.TOGGLED == state) {
        label = properties.get(ToggleUtil.PN_TOGGLELABEL, i18n.get("On"));
    }
%>
<form class="cq-social-user-state-toggle-form"
      action="<%=actionResourcePath%>.<%=ToggleUtil.SELECTOR_USER_STATE_TOGGLE%>.html"
      method="POST">

    <input type="hidden" name="<%=ToggleUtil.PARAM_NAME_CURRENTSTATE%>" value="<%=StringEscapeUtils.escapeHtml4(state.toString())%>"<%=xs%>>
    <input type="hidden" name="<%=ToggleUtil.PARAM_NAME_RESOURCE%>" value="<%=resource.getPath()%>"<%=xs%>>
    <input type="hidden" name="<%=ToggleUtil.PARAM_NAME_STATEPROVIDER%>" value="<%=StringEscapeUtils.escapeHtml4(stateProviderPath)%>"<%=xs%>>
    <input type="hidden" name="<%=ToggleUtil.PARAM_NAME_NEEDAPPROVAL%>" value="<%=xssAPI.encodeForHTMLAttr(needApproval)%>"<%=xs%>>

    <%
        String confirmationMessage = "";

        final String oldStateName = request.getParameter(ToggleUtil.PARAM_NAME_OLDSTATE);
        if (StringUtils.isNotBlank(oldStateName)) {
            try {

                final ToggleUtil.STATE oldState = ToggleUtil.STATE.valueOf(oldStateName);
                confirmationMessage = (ToggleUtil.STATE.TOGGLED == oldState)
                                      ? properties.get(ToggleUtil.PN_CONFIRMATIONUNTOGGLE, i18n.get("State change submitted."))
                                      : properties.get(ToggleUtil.PN_CONFIRMATIONTOGGLE, i18n.get("State change submitted."));

            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
    %>
    <div class="status"><%=StringEscapeUtils.escapeHtml4(confirmationMessage)%></div>
    <input<%=(ToggleUtil.STATE.TRANSITION == state) ? " disabled" : ""%>
            type="submit" value="<%=StringEscapeUtils.escapeHtml4(i18n.getVar(label))%>"
            class="<%=StringEscapeUtils.escapeHtml4(state.toString().toLowerCase())%> btn"<%=xs%>>
</form>
