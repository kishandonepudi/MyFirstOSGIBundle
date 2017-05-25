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

--%>


<%@ page import="com.adobe.cq.social.commons.CollabUtil,
                 com.adobe.cq.social.forum.api.Post,
                 com.adobe.granite.activitystreams.Activity,
                 com.adobe.granite.activitystreams.ActivityManager,
                 com.adobe.granite.activitystreams.ActivityObject,
                 com.adobe.granite.security.user.UserProperties,
                 com.adobe.granite.security.user.UserPropertiesManager,
                 com.adobe.granite.security.user.UserPropertiesService,
                 com.day.cq.i18n.I18n,
                 com.day.cq.xss.XSSProtectionException,
                 com.day.cq.xss.XSSProtectionService,
                 java.text.DateFormat" %>

<%@include file="/libs/foundation/global.jsp"%>
<%@include file="/libs/social/activitystreams/components/activity/activityutil.jsp"%>

<%


    I18n i18n = new I18n(slingRequest);

    ActivityManager activityManager = sling.getService(ActivityManager.class);
    Activity activity = activityManager.getActivity(resourceResolver, resource.getPath());


    if(activity != null) {

        final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class) ;
        final UserPropertiesManager upm = userPropertiesService.createUserPropertiesManager(resourceResolver);

        UserProperties userProperties = upm.getUserProperties(activity.getActorUserId(), "profile");
        String author = userProperties == null ? "private" : userProperties.getDisplayName();
        String avatar = CollabUtil.getAvatar(userProperties);
        final Boolean isAnonymous = userProperties == null ? true : userProperties.getAuthorizableID().equals("anonymous");
        final String socialProfilePage = (String)request.getAttribute(CollabUtil.REQ_ATTR_SOCIAL_PROFILE_PAGE);
        final String socialProfileUrl = socialProfilePage != null && !isAnonymous ? userProperties.getNode().getPath()  + ".form.html" + socialProfilePage : "##";


        XSSProtectionService xssService = sling.getService(XSSProtectionService.class);

        String title = activity.getTitle();
        if(title == null){
            title = "";
        }
        title = title.replaceAll("\\r", "");
        title = title.replaceAll("\\n", "<br>");

        try {
            title = xssService.protectFromXSS(title);
        } catch (XSSProtectionException xe) {
            log.error("failed to protect title from xss", xe);
        }

        String message = activity.getObject().getContent();
        if(message == null){
            message = "";
        }
        message = message.replaceAll("\\r", "");
        message = message.replaceAll("\\n", "<br>");

        try {
            message = xssService.protectFromXSS(message);
        } catch (XSSProtectionException xe) {
            log.error("failed to protect comment from xss", xe);
        }

        if (longMessage(message)) {
            //truncate message, could do other things with it, but for now we just display first 200 characters
            message = formatLongMessage(message,i18n.get("message truncated"));
        }

        String target = "unknown";
        String qnaSubject = "";

        ActivityObject targetActivityObject = activity.getTarget();
        if(targetActivityObject != null) {
            target = targetActivityObject.getDisplayName();
        }
        String objectPath = "#";
        //get url to object
        ActivityObject activityObject = activity.getObject();
        if(activityObject != null) {
            Resource postResource = resourceResolver.resolve(activityObject.getId());
            Post postObj = postResource.adaptTo(Post.class);
            objectPath  = postObj.getUrl();
            qnaSubject = postObj.getSubject();
        }
        //format subject
        if (qnaSubject == null){
            qnaSubject = "";
        }
        qnaSubject = qnaSubject.replaceAll("\\r", "");
        qnaSubject = qnaSubject.replaceAll("\\n", "<br>");
        try {
            qnaSubject = xssService.protectFromXSS(qnaSubject);
        } catch (XSSProtectionException xe) {
            log.error("failed to protect subject from xss", xe);
        }

        //Component design consumption
        String background="",text="",links="";

        background = "#"+currentStyle.get("background", "ffffff");
        text = "#"+currentStyle.get("text", "444444");

        //TODO implement
        links = "#"+currentStyle.get("links", "1985b5");

%>

        <div class="entries_content">
            <div class="type clearfix">
                <p><%= i18n.get("Forum") %></p>
            </div>
            
            <div class="image">
                <a class="entry_avatar" href="<%=xssAPI.getValidHref(socialProfileUrl)%>">
                    <div class="entry_avatar_container" style="height:32px;width:32px;background: url(<%=xssAPI.getValidHref(avatar)%>);background-repeat: no-repeat;">
                        &nbsp;
                    </div>
                </a>
            </div>
            
            <div class="desc">
                <p class="time border">
                    <span><%=xssAPI.encodeForHTML(author)%> <%=i18n.get("replied to")%> 
                        <a href="<%=xssAPI.getValidHref(objectPath)%>">"<%=xssAPI.filterHTML(qnaSubject)%>"</a>
                    </span>
                    <span><%=DateFormat.getDateInstance(DateFormat.MEDIUM).format(activity.getPublished())%></span>
                </p>
                <p><%=xssAPI.filterHTML(message)%></p>
            </div>

         </div>

<%
    } else {
        out.println("Resource is not an activity");
    }
%>