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

<%--
  Social Connect Component - uses cloud service configs as 'providers'.
--%>

<%@include file="/libs/foundation/global.jsp" %>
<%@page contentType="text/html; charset=utf-8" import="com.day.cq.i18n.I18n,
                                                         com.day.cq.security.Authorizable,
                                                         com.day.cq.personalization.ProfileUtil,
                                                         com.day.cq.security.profile.Profile,
                                                         com.day.cq.wcm.api.WCMMode,                                                         
                                                         com.day.cq.wcm.webservicesupport.ConfigurationManager,
                                                         org.apache.sling.api.resource.Resource,
                                                         com.adobe.granite.auth.oauth.ProviderConfigProperties,
                                                         org.osgi.service.cm.ConfigurationAdmin,
                                                         org.osgi.service.cm.Configuration"%>

<cq:includeClientLib categories="cq.social.connect"/>
<script type="text/javascript">
    $CQ(document).ready(function() {
        $CQ.SocialAuth.socialconnect.initSliders();
    });
</script>  
                               
<%  
    final ConfigurationManager cfgMgr = sling.getService(ConfigurationManager.class);

    com.day.cq.wcm.webservicesupport.Configuration facebookConfiguration = null;
    com.day.cq.wcm.webservicesupport.Configuration twitterConfiguration = null;

    final String[] services = pageProperties.getInherited("cq:cloudserviceconfigs", new String[]{});
    if(cfgMgr != null) {
        facebookConfiguration = cfgMgr.getConfiguration("facebookconnect", services);
        twitterConfiguration = cfgMgr.getConfiguration("twitterconnect", services);                
    }
    final I18n i18n = new I18n(slingRequest);
    final String uniqSuffix = resource.getPath().replaceAll("/","-").replaceAll(":","-");
    final String divID = "socialconnect" + uniqSuffix;
    
    final Profile currentProfile = slingRequest.adaptTo(Profile.class);
    final boolean isAnonymous = ProfileUtil.isAnonymous(currentProfile);
    final boolean isDisabled = WCMMode.DISABLED.equals(WCMMode.fromRequest(request));
    final String loginSuffix = isDisabled && isAnonymous ? "/j_security_check" : "/connect";
%>
<script type="text/javascript">

    $CQ(document).ready(function () {
        //listening for this global event - triggered from SocialAuth.js - $CQ.SocialAuth.oauthCallbackComplete
        //any element can subscribe to this event to perform custom functionality post-oauth-callback completion
        //the social login component will listen for it here to perform the appropriate redirect as configured
        $CQ('#<%=divID%>').bind('oauthCallbackComplete', function(ev,userId) {  
            //oauthCallbackComplete happened 
            CQ_Analytics.ProfileDataMgr.loadProfile(userId);
            CQ.shared.Util.reload();
            $CQ.SocialAuth.socialconnect.completeConnect();
       }); 
    });
      
</script>

<% if (!isAnonymous) { %>
        <div id="<%=divID%>">
        <%
        final Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
        if(facebookConfiguration != null || twitterConfiguration != null){
            ConfigurationAdmin ca = sling.getService(org.osgi.service.cm.ConfigurationAdmin.class);
            Configuration[] matchingConfigs;
        %>
            <div class="sidebar title clearfix"><%
                final String title = properties.get("title", String.class) != null 
                                     ? properties.get("title", String.class)
                                     : i18n.get("Social Connection Status");
                %>                         
                <h2><%=xssAPI.encodeForHTML(title)%></h2>
            </div>
            <div class="sidebar-content"><%
                final String description = properties.get("description", String.class);
                if(description != null) {
                    %><p><%=xssAPI.encodeForHTML(description)%></p><%
                }
                %>
                <%
                if(facebookConfiguration != null){
                    final Resource configResource = facebookConfiguration.getResource();
                    final Page configPage = configResource.adaptTo(Page.class);
                    final String configid = configPage.getProperties().get("oauth.config.id",String.class);
                    matchingConfigs = ca.listConfigurations("(&(oauth.config.id="+configid+")(service.factoryPid="+ProviderConfigProperties.FACTORY_PID+"))");
                    final String clientid =  getClientId(matchingConfigs);

                    // Checking if already connected to facebook
                    final String FACEBOOK = "/facebook";
                    final String facebookProfilePath = currentProfile.getPath() + FACEBOOK;
                    String isFacebookConnected = i18n.get("OFF");
                    String isFacebookConnectedClassName = "off";
                    String facebookUserName= "";
                    String facebookUserURL= "";
                    if(session.itemExists(facebookProfilePath)) {
                        try {
                            Node n = session.getNode(facebookProfilePath);
                            String id = n.getProperty("id").getString();
                            if (n.hasProperty("username")){
                                facebookUserName = n.getProperty("username").getString();
                            } else if (n.hasProperty("first_name") && n.hasProperty("last_name")){
                                facebookUserName = n.getProperty("first_name").getString() + " " + 
                                    n.getProperty("last_name").getString();
                            } else {
                                //just in case they are nameless
                                facebookUserName = id;
                            }
                            facebookUserURL= "http://facebook.com/"+id;
                            
                            isFacebookConnected = i18n.get("ON");
                            isFacebookConnectedClassName = "on";
                         } catch (PathNotFoundException pnfe) {
                             log.warn("Social connect - facebook path not found: " + facebookProfilePath, pnfe);
                         }
                    }
                    %>
                    <div class="social-toggle clearfix">
                        <div class="channeldetails">
                            <div class="channellinklabel"><%= i18n.get("Facebook") %>:</div>
                            <div class="channelconnectbutton">
                                <div class="connect-slider-frame">
                                    <span data-resourcepath="<%=resource.getPath()%>" data-divid="<%=divID%>" data-clientid="<%=xssAPI.encodeForHTMLAttr(clientid)%>" data-configpagepath="<%=xssAPI.encodeForHTMLAttr(configPage.getPath())%>" data-configid="<%=xssAPI.encodeForHTMLAttr(configid)%>" data-socialprofilepath="<%=xssAPI.encodeForHTMLAttr(facebookProfilePath)%>"  data-loginSuffix="<%=loginSuffix%>" class="slider-button <%=isFacebookConnectedClassName%>"><%=isFacebookConnected%></span>
                                </div>
                            </div>
                            <%if(isFacebookConnected.equals("ON")){%>
                                <a class="connectnamelink" target="_blank" href="<%=xssAPI.getValidHref(facebookUserURL)%>" ><%=xssAPI.encodeForHTML(facebookUserName)%></a>
                                <div class="connectchangelink" onclick="$CQ.Event(event).preventDefault();$CQ.SocialAuth.socialconnect.doChange('<%=xssAPI.getValidHref(facebookProfilePath)%>','<%=xssAPI.getValidHref(configPage.getPath())%>','<%=xssAPI.encodeForJSString(configid)%>','<%=loginSuffix%>','<%=xssAPI.encodeForJSString(clientid)%>');"><%= i18n.get("change") %></div>
                            <%}%>
                            
                        </div>
                           
                    </div>            
                    <%
                }    
                if(twitterConfiguration != null){
                    final Resource configResource = twitterConfiguration.getResource();
                    final Page configPage = configResource.adaptTo(Page.class);

                    final String configid = configPage.getProperties().get("oauth.config.id",String.class);
                    matchingConfigs = ca.listConfigurations("(&(oauth.config.id="+configid+")(service.factoryPid="+ProviderConfigProperties.FACTORY_PID+"))");
                    final String clientid =  getClientId(matchingConfigs);

                    // Checking if already connected to twitter
                    final String TWITTER = "/twitter";
                    final String twitterProfilePath = currentProfile.getPath() + TWITTER;
                    String isTwitterConnected = i18n.get("OFF");
                    String isTwitterConnectedClassName = "off";
                    String twitterScreenName= "";
                    String twitterUserURL= "";
                    if(session.itemExists(twitterProfilePath)) {
                        try {
                            Node n = session.getNode(twitterProfilePath);
                            twitterScreenName = n.getProperty("screen_name").getString();
                            twitterUserURL= "http://twitter.com/"+twitterScreenName;
                            isTwitterConnected = i18n.get("ON");
                            isTwitterConnectedClassName="on";
                         } catch (PathNotFoundException pnfe) {
                             log.warn("Social connect - twitter path not found: " + twitterProfilePath, pnfe);
                         }
                    }
                    %>
                    <div class="social-toggle clearfix">
                        <div class="channeldetails">
                            <div class="channellinklabel"><%= i18n.get("Twitter") %>:</div>
                            <div class="channelconnectbutton">
                                <div class="connect-slider-frame">
                                    <span data-divid="<%=divID%>" data-configpagepath="<%=configPage.getPath()%>" data-configid="<%=xssAPI.encodeForHTMLAttr(configid)%>" data-clientid="<%=xssAPI.encodeForHTMLAttr(clientid)%>" data-socialprofilepath="<%=xssAPI.encodeForHTMLAttr(twitterProfilePath)%>" data-loginSuffix="<%=loginSuffix%>" class="slider-button <%=isTwitterConnectedClassName%>"><%=isTwitterConnected%></span>
                                </div>
                            </div>
                             <%if(isTwitterConnected.equals("ON")){%>
                                <a class="connectnamelink" target="_blank" href="<%=xssAPI.getValidHref(twitterUserURL)%>" >@<%=xssAPI.encodeForHTML(twitterScreenName)%></a>
                                <div class="connectchangelink" onclick="$CQ.Event(event).preventDefault();$CQ.SocialAuth.socialconnect.doChange('<%=xssAPI.getValidHref(twitterProfilePath)%>','<%=xssAPI.getValidHref(configPage.getPath())%>','<%=xssAPI.encodeForJSString(configid)%>','<%=loginSuffix%>','<%=xssAPI.encodeForJSString(clientid)%>');"><%= i18n.get("change") %></div>
                            <%}%>
                        </div>
                    </div>     
                    <%
                }
                %>
            </div>
        <% } else if(WCMMode.fromRequest(request) == WCMMode.EDIT){%>
            <h3 class="cq-texthint-placeholder"><%= i18n.get("No cloud service is configured on this page for social connect.") %></h3>
        <% } %> 
        </div>
  <% } else if(WCMMode.fromRequest(request) == WCMMode.EDIT) {%>
      <h3 class="cq-texthint-placeholder"><%= i18n.get("Social Connect features are only available to logged in users.") %></h3>
  <% } %>
  
  <%!
    String getClientId(Configuration[] matchingConfigs){
        Configuration providerConfig;
        String clientId ="";
        if(matchingConfigs != null && matchingConfigs.length == 1){
            providerConfig = matchingConfigs[0];
            clientId = (String)providerConfig.getProperties().get("oauth.client.id");
        }
        return clientId;
    }
  %>