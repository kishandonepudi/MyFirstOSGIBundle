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

  Draws the form to submit a new forum topic

--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@ page import="com.adobe.cq.social.forum.api.Forum,
                   com.adobe.cq.social.forum.api.ForumUtil,
                   com.adobe.cq.social.forum.api.Post,
                     com.day.cq.i18n.I18n,
                     org.apache.sling.api.request.RequestParameter,
                     java.util.Locale,
                     com.day.cq.commons.date.RelativeTimeFormat,
                     java.util.ResourceBundle,
                     org.apache.commons.lang.StringUtils" %>
                     <cq:includeClientLib categories="cq.social.qna.askquestionbox"/><%

        final Locale pageLocale = currentPage.getLanguage(true);
        final ResourceBundle resourceBundle = slingRequest.getResourceBundle(pageLocale);
        final I18n i18n = new I18n(resourceBundle);
        final Forum forum = resource.adaptTo(Forum.class);
        final String emptyText = properties.get("emptyText", i18n.get("What are you looking for?"));
        final String formAction = properties.get("composerpage", resource.getPath() + ".createqnapost") + "/jcr:content/par.html";
        final RelativeTimeFormat fmt = new RelativeTimeFormat("r", resourceBundle);
        Post question=null;
        try{
            question = forum.getPostFromRequest(slingRequest);
             if (null == question) {
                 if (!ForumUtil.mayPost(resourceResolver, forum)) {
                     %><div class="login"><%= xssAPI.encodeForHTML(StringUtils.defaultIfEmpty(forum.getNoPermissionText(), i18n.get("Sign in in order to get help."))) %></div><%
                 }
                 else{
                     %>
                     <div class="forum-top clearfix">
                         <h1>Question?</h1>
                     </div>
                     <div class="question-box">
                           <form action="<%= xssAPI.encodeForHTMLAttr(formAction) %>"
                             method="GET"
                             class="lightbox"
                             data-title="New Question"
                           >
                           <div class="ui-widget">
                               <label title="<%= xssAPI.encodeForHTMLAttr(emptyText) %>">
                                   <input type="text"
                                          class="form_field form_field_text askQuestionField"
                                          name="<%= Post.PN_SUBJECT %>"
                                          onfocus="CQ.soco.commons.handleOnFocus(event.target, '<%=xssAPI.encodeForJSString(emptyText)%>')"
                                          onblur="CQ.soco.commons.handleOnBlur(event.target, '<%=xssAPI.encodeForJSString(emptyText)%>')"
                                          value="<%= xssAPI.encodeForHTMLAttr(emptyText) %>"
                                           />
                               </label>
                               <input class="btn action" name="submit" type="submit" value="<%=i18n.get("Ask New Question")%>" style="border-radius: 2px;"/>
                               <a class="clear-form" href="#"><%=i18n.get("clear")%></a>
                           </div>
                           <input type="hidden" name="_charset_" value="UTF-8"/>
                    </form>
                     </div>
                     <%
                 }
            }
        } catch(Exception e) {}
%>
