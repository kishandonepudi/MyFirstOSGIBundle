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

--%><%@ page import="com.adobe.granite.activitystreams.Activity,
                    com.adobe.granite.activitystreams.ActivityObject,
                    com.adobe.granite.activitystreams.ActivityManager,
                    org.apache.sling.api.request.RequestDispatcherOptions,
                    org.apache.sling.api.resource.ResourceResolver,
                    org.apache.sling.api.resource.ResourceUtil,
                    org.apache.sling.api.SlingHttpServletRequest,
                    com.day.cq.wcm.api.components.Component,
                    org.apache.sling.api.resource.ValueMap,
                    com.day.cq.i18n.I18n,
                    java.util.Collection" %><%!
%><%@include file="/libs/foundation/global.jsp"%><%

    //TODO: using activity manager service, should be able to use adaptTo, but it currently isn't implemented
    //resource.adaptTo(Activity.class);
    ActivityManager activityManager = sling.getService(ActivityManager.class);
    Activity activity = activityManager.getActivity(resourceResolver, resource.getPath());
    String renderType = getRendererType(activity);

    if( renderType == null) {
        renderType = "geometrixx-outdoors/components/activitystreams/activity/renderers/default";
    }
    %>

    <cq:include path="<%= resource.getPath() %>" resourceType="<%= renderType %>" />
    <%!
    /***
     * Determine if a Renderer component defined, if not use default
     *
     *
     * @param activity The Activity to be rendered
     * @return A String containing the resourceType renderer or null if no appropriate type could be found.
     ***/
    public String getRendererType(Activity activity) {

        if(activity != null && activity.getObject() != null){
           String renderObjectType = "";
           String localRenderType = "";
           String renderType = "";
           ValueMap values = activity.getObject().getProperties();
           //find renderType
           if (values != null) {
               renderObjectType = values.get("subType", String.class);
           }
            //Render component will live under the renderers directory and follow the sling resource type structure
            if (renderObjectType != null) {
               //test if the first character is / or it contains "." these are an invalid characters/positions for the subType, if the subType contains this return null
               if ((renderObjectType.charAt(0) == '/') || renderObjectType.contains(".")){
                   return null;
               }
               localRenderType = "renderers/" + renderObjectType;
               renderType = "geometrixx-outdoors/components/activitystreams/activity/" + localRenderType;
           } else {
             renderType = null;
           }
            return renderType;
        }
        return null;
    }
%>
