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

<%@ page import="com.adobe.granite.activitystreams.*,
                         com.adobe.granite.security.user.UserPropertiesManager,
                         com.adobe.granite.security.user.UserPropertiesService,
                         com.day.cq.wcm.api.components.IncludeOptions,
                         com.day.cq.wcm.foundation.forms.FormsHelper,
                         java.text.DateFormat,
                         java.util.Iterator,
                         java.util.List" %>
<%@include file="/libs/social/commons/commons.jsp"%>
<cq:includeClientLib categories="social.activitystreams.publish"/>
<%
    ActivityManager activityManager = sling.getService(ActivityManager.class);

    Resource userResource = null;
    ActivityCollection coll = null;
    String userId = null;
    String userDisplaySelection = properties.get("userdisplayselection", String.class);
    Integer maxNbActivities = properties.get("maxNbActivities", Integer.class);
    //max cannot be greater than 100
    if( maxNbActivities == null || maxNbActivities > 100) maxNbActivities =  100;
    //may turn this into a config parameter
    int nextGroupActivities = 20;
    String streamPath = properties.get("streamPath", String.class);
    String absStreamPath = properties.get("absStreamRef", String.class);

    boolean showOnlyCurrentUserActivity = false;


    final UserPropertiesService userPropertiesService  = sling.getService(UserPropertiesService.class);
    final UserPropertiesManager upm = userPropertiesService.createUserPropertiesManager(resourceResolver);

    //Decide on which user to display if current user we check to see if we are in form chooser mode
    if (userDisplaySelection != null && userDisplaySelection.equals("CURRENTUSER")){

        showOnlyCurrentUserActivity = true;
        List<Resource> resources = FormsHelper.getFormEditResources(slingRequest);
        if (resources != null && resources.size() > 0) {
           //1 - we are in formchooser-mode, get the requested resource
            userResource = resources.get(0);
        }
        if( userResource != null) {

            //1 - get connected user activities
            userId = upm.getUserProperties(userResource.adaptTo(Node.class)).getAuthorizableID();
        }
        //if still null, fall back to slingRequest
        if (userId == null) {
            userId = loggedInUserID;
        }

    }
    //not form chooser, get from sling request, this will give us the right user loggedInUserID is from commons.jsp
    if (userId == null) {
        userId = loggedInUserID;
    }

    // if it is currently null we use the resourceResolver userId
    if (userId == null) {
        final org.apache.jackrabbit.api.security.user.Authorizable myAuthorizable = resourceResolver.adaptTo(org.apache.jackrabbit.api.security.user.Authorizable.class);
        userId = myAuthorizable.getID();
    }


    //if stream path is set we retrieve based on that streamPath
    if (streamPath != null) {
        Resource streamResource = resourceResolver.resolve(request, streamPath);
        ActivityStream stream = null;
        //if stream path is absolute, will have path to the root

        if (absStreamPath != null && Boolean.valueOf(absStreamPath)) {
           stream = activityManager.getStream(streamResource);
        } else {
           //else, we are selecting a stream under a user
           try {
               final org.apache.jackrabbit.api.security.user.Authorizable authorizable = resourceResolver.adaptTo(org.apache.jackrabbit.api.security.user.Authorizable.class);
               userId = authorizable.getID();
               stream = activityManager.getStream(resourceResolver, authorizable,streamPath, false);
           } catch (Exception e) {
             //ignoring exception here, bad input data, coll will just be null and handled below
           }
        }
        if (stream != null) {
            coll = stream;
        }
    } else {
        if (showOnlyCurrentUserActivity){
            coll = activityManager.getActivities(resourceResolver, userId, AggregateOptions.DIRECT);
        }  else {
            coll = activityManager.getActivities(resourceResolver, userId);
        }


    }
    //test to see if collection is empty
    //see if we have more activities then we can display
    final int fromValue = (null != fromParam)? Integer.parseInt(fromParam.getString()):0;
    final int toValue = ((null != fromParam) && (null != countParam))?Integer.parseInt(countParam.getString()):maxNbActivities;

    boolean hasParams = false;
    //if we have params, we are calling this from a script so do not display all content
    if (fromParam != null){
        hasParams = true;
    }

    //offset by group of activities just loaded
    int scriptFrom = fromValue+toValue+1;
    //count + another 20 (config parameter?)
    int scriptTo = scriptFrom+20;

    boolean notEmpty = false;
    boolean hasMoreThanMax = false;
    Iterator iter;

    if (coll != null) {
        iter = coll.getActivities(0, maxNbActivities).iterator();
        notEmpty = iter.hasNext();
    }
    if (!hasParams) {
        if (notEmpty){
            //we will only get up to a max of 100 activities, see if we have more than maxNbActivities, if so we need to show link to load more
            Iterator overMaxIter = coll.getActivities(0, maxNbActivities+1).iterator();
            int overMaxInt = 0;
           while (overMaxIter.hasNext()){
               overMaxIter.next();
               overMaxInt++;
           }
           //if true, we have more activities than we can display, need to paginate
            if (overMaxInt > maxNbActivities) {
                hasMoreThanMax = true;
            }
        }
    }

    //Component design consumption
    String shellBackground="",shellText="",height="",width="";
    shellText = "#"+currentStyle.get("shellText", "ffffff");
    shellBackground = "#"+currentStyle.get("shellBackground", "8ec1da");
    height = currentStyle.get("height", "375");
    Integer heightInt = Integer.parseInt(height);
    width = currentStyle.get("width", "300");

    if (!hasParams) {

%>


    
    <div class="topic-top title section no-margin clearfix">
        <%
        String title = properties.get("title", String.class);
        if(title != null) {
        %>
        <h2><%=title%></h2>
        <% } %>
    </div>

    <section class="activity listing">

    <% } %>
        <%
        if(!notEmpty) {
            %><div class="no-activity">
                <span><%= i18n.get("No Activity")%></span>
              </div>
        <%
        } else {
            for (Activity activity : coll.getActivities(fromValue, toValue)) {
                String date = DateFormat.getDateTimeInstance(DateFormat.LONG,
                    DateFormat.SHORT).format(activity.getPublished());
                %>
                <div class="row clearfix">
                    <%
                        try {
                            IncludeOptions.getOptions(request, true).forceSameContext(true);
                            %>
                            <cq:include path="<%= activity.getPath()%>" resourceType="geometrixx-outdoors/components/activitystreams/activity"/>
                        <%
                        } catch (Exception e){
                            log.error("Error while rendering activity {}",activity.getTitle(),e);
                        }
                    %>
                </div>
                <%
            }
        }
        %>
     <% if (!hasParams)   { %>
     </section>
 <% } %>

<% if (!hasParams && hasMoreThanMax) {  %>
   <a class="activity-load-more" href="#"><%= i18n.get("Load More Activities") %></a>


<script>
    $CQ(function(){

        var from = <%=scriptFrom%>;
        var to = <%=scriptTo%>;
        var nextValue = <%=nextGroupActivities%>;

        $CQ(".activity-load-more").click(function(event) {
            event.preventDefault();
            $CQ.ajax("<%= resource.getPath() %>" + ".html?from="+from + "&count=" + to, {
                success: function(data, status, jqxhr) { $CQ(".activities").append(data);
                    from = to;
                    to = from + nextValue;
                },
                type: "GET",
                headers: {
                    "Accept": "text/html"
                }
            });

        });

    });
</script>

<% } %>


