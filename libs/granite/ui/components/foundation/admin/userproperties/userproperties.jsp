<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%@page session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page import="javax.jcr.Value,
                  org.apache.jackrabbit.api.security.user.Authorizable,
                  com.adobe.granite.security.user.UserProperties,
                  com.adobe.granite.security.user.UserPropertiesManager,
                  com.adobe.granite.security.user.UserPropertiesService,
                  org.apache.sling.api.resource.ResourceResolver,
                  javax.jcr.Session,
                  com.adobe.granite.ui.components.AttrBuilder" %><%
%><%

    final String ctx = request.getContextPath();

    Authorizable auth = resourceResolver.adaptTo(Authorizable.class);


    Session session = resourceResolver.adaptTo(Session.class);
    boolean isImpersonated = (session != null && session.getAttribute(ResourceResolver.USER_IMPERSONATOR) != null);

    UserPropertiesManager userPropertiesManager = resource.adaptTo(UserPropertiesManager.class);
    UserProperties profile = userPropertiesManager.getUserProperties(auth.getID(), UserPropertiesService.PROFILE_PATH);

    String displayName = auth.getPrincipal().getName();
    Value[] emailValues = auth.getProperty(UserProperties.EMAIL);

    String email = "";
    if (emailValues != null && emailValues.length > 0) {
        email = emailValues[0].getString();
    }

    Resource photo = null;
    if (profile != null) {
        photo = profile.getResource(UserProperties.PHOTOS);
        displayName = profile.getDisplayName();
        String profileMail = profile.getProperty(UserProperties.EMAIL, "", String.class);
        if (profileMail != null && profileMail.length() > 0) email = profileMail;
    }

    String userThumb;
    if (photo != null) {
        userThumb = ctx + photo.getPath() + "/primary/image.prof.thumbnail.36.png";
    } else {
        userThumb = ctx + "/libs/granite/security/clientlib/themes/default/resources/sample-user-thumbnail.36.png";
    }
%>
<div id="user_dialog"  class="popover arrow-top arrow-pos-right alignleft">
    <img src="<%= userThumb %>" alt="" class="avatar">
    <h3>
        <%= xssAPI.filterHTML(displayName) %>
    </h3>
    <div class="email">
        <%= (email == null || email.length() == 0) ? "&nbsp;" : xssAPI.filterHTML(email) %>
    </div>
    <div class="impersonate">
    <% if (isImpersonated) { %>
            <form action="<%= ctx %>/libs/granite/ui/content/userproperties.impersonate.html" method="post">
                <sling:include path="<%= resource.getPath() + "/impersonated/form" %>" resourceType="granite/ui/components/foundation/contsys" />    
            </form>
    <% } else { %>
            <form action="<%= ctx %>/libs/granite/ui/content/userproperties.impersonate.html" method="post">
                <sling:include path="<%= resource.getPath() + "/self/form" %>" resourceType="granite/ui/components/foundation/contsys" />
            </form>
    <% } %>
    </div>
    <div class="user_dialog_footer">
        <a href="#user_preferences" class="button" data-toggle="modal"><%= i18n.get("Account") %></a>
        <a href="<%=ctx%>/libs/cq/core/content/login.logout.html" class="button primary"><%= i18n.get("Sign Out") %></a>
    </div>
</div>
<%
AttrBuilder formAttrs = new AttrBuilder(request, xssAPI);

String contentPath = "";

Resource r = profile == null ? null : profile.getResource("../");
if (r != null) {
    contentPath = r.getPath() + "/preferences";
    request.setAttribute(com.adobe.granite.ui.components.Value.CONTENTPATH_ATTRIBUTE, contentPath);
}

String currentPath = slingRequest.getRequestURI();

formAttrs.addHref("action", contentPath);
formAttrs.add("method", "post");
/*formAttrs.addClass("foundation-form");
formAttrs.addOther("foundation-form-ajax", "true");
formAttrs.addOther("foundation-form-output-replace", "html");
formAttrs.addOther("redirect", currentPath);
*/

formAttrs.addClass("foundation-form-reload");


%>
<div id="user_preferences" class="modal">
    <div class="modal-header">
        <h2><%=i18n.get("User Preferences")%></h2>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
    </div>
    <form <%= formAttrs.build() %>>
        <div class="modal-body">
            <sling:include path="<%= resource.getPath() + "/preferences/form" %>" resourceType="granite/ui/components/foundation/contsys" />
        </div>
        <div class="modal-footer">
            <a href="#user_preferences" class="button" data-dismiss="modal"><%= i18n.get("Cancel") %></a>    
            <button type="submit" class="button primary"><%= i18n.get("Accept") %></button>
        </div>
    </form>
</div>
