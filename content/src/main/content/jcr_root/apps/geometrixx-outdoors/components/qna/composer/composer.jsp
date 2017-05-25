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

  Q&A composer component

  Provides form input to post a new question from a Q&A page.

--%><%@ page import="com.adobe.cq.social.commons.CollabUtil,
                     com.adobe.cq.social.forum.api.Forum,
                     com.adobe.cq.social.forum.api.Post,
                     com.day.cq.security.profile.Profile" %><%
%><%@ taglib prefix="personalization" uri="http://www.day.com/taglibs/cq/personalization/1.0" %><%
%><%@include file="/libs/social/commons/commons.jsp" %><%

    final Post post = resource.adaptTo(Post.class);
    final Profile profile = slingRequest.adaptTo(Profile.class);
    final String avatarPath = CollabUtil.getAvatar(profile);
    final String formAction = resource.getPath() + ".social.createqnapost.html";
    final String emptyText = i18n.get("");
    final Forum forum = post.getForum();
    final Boolean allowFileUploads = resourceResolver.getResource(forum.getPath()).adaptTo(ValueMap.class).get("allowFileUploads", false);
    final String authorizableId = loggedInUserID;
%>
<script type="text/javascript">
    function recordPostCommentEvent(name, user, component, category) {
        CQ_Analytics.record({event: 'postComment',
                                values: {commenterName: user,
                                         topic: name,
                                         category: category
                                        },
                                componentPath: component
                              });
    }
</script>
    <a name="composer"></a>
    <div id="composer-id" class="geometrixx-composer clearfix">
<%
    if (null != post) { %>
          <div class="composer-title italic">
              <h1><%=i18n.get("Post an Answer")%></h1>
          </div>
    	  <form id="submitForm" action="<%= xssAPI.getValidHref(formAction) %>"
    		      onsubmit="return (CQ.soco.commons.validateFieldNotEmptyOrDefaultMessage(this['<%= Post.PN_MESSAGE %>'], '<%=emptyText%>'));"
    		      method="POST"
    		      enctype="multipart/form-data"
    		    >

    		    <label title="<%=emptyText%>"></label>
                <div class="composer-row clearfix">
                    <div class="composer-left-col">
                        <label><%=i18n.get("Comment:")%></label>
                    </div>
                    <div class="composer-right-col">
                        <textarea name="<%= Post.PN_MESSAGE %>"
                                  onfocus="CQ.soco.commons.handleOnFocus(this,'<%=emptyText%>');"
                                  onblur="CQ.soco.commons.handleOnBlur(this,'<%=emptyText%>');"
                                  rows="8"
                                  class="form_field form_field_textarea"
                                  cols="10"><%=emptyText%></textarea>
                    </div>
                </div>
                <div class="composer-row clearfix">
                    <div class="composer-left-col">
                        <label><%=i18n.get("Add Attachment:")%></label>
                    </div>
                    <div class="composer-right-col">
                        <div id="formFileUploadDiv" >
                            <% if (allowFileUploads) { %>
                                <input type="hidden" name="_charset_" value="<%= response.getCharacterEncoding() %>"/>
                                <input class="submit" type="file" name="file" value="<%= i18n.get("Upload", "Upload a file") %>"/>
                            <%}%>
                        </div>
                        <input name="submit" type="submit" class="btn action" value="<%=i18n.get("Post Answer")%>"
                                    onclick="recordPostCommentEvent('<%= resource.getPath() %>','<%= authorizableId %>','social/commons/components/composer' , 'qna')"/>
                    </div>
                </div>
    		    <input type="hidden" name="_charset_" value="UTF-8"/>
    		</form><%
    }
%>
    </div>
