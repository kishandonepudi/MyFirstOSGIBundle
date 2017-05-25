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
--%><%
%><%@ include file="/libs/social/commons/commons.jsp" %><%
%><%@ page import="com.adobe.cq.social.qna.api.QnaPost,
                    com.adobe.cq.social.forum.api.Post,
                    com.day.cq.wcm.foundation.forms.FormsHelper,
                    java.util.List,
                    com.adobe.cq.social.forum.api.Forum,
                    com.adobe.cq.social.forum.api.ForumUtil,
                    org.apache.sling.api.resource.ResourceUtil" %><%
%><%@ page contentType="text/html; charset=utf-8" %>
<div class="page-header-content page-header">
    <cq:include script="header.jsp"/>
</div>
<div class="page-content">
    <cq:include path="breadcrumb" resourceType="geometrixx-outdoors/components/page/breadcrumb"/><%

    final List<Resource> editResources = FormsHelper.getFormEditResources(slingRequest);
    final Resource editAnswer = (null != editResources && editResources.size() > 0) ? editResources.get(0) : null;
    Post post = (editAnswer!= null)?editAnswer.adaptTo(Post.class):null;    
    String topicUrl = "";
    Boolean isPost = false;
    String subject = (post!=null)?post.getSubject():"";
    if(loggedInUserID!=null && post!=null && loggedInUserID.equals(post.getCreatedBy().getUserID())){
        if(editAnswer!=null){
            if(ResourceUtil.isA(editAnswer, "social/qna/components/post")){
                if(post!=null && post.getTopic()!=null){
                    //on submit, redirect to the topic page
                    topicUrl = post.getTopic().getUrl();
                }else{
                    //if topic not found, redirect to the questions page
                    topicUrl = currentPage.getParent().getPath();
                }
            }else if(ResourceUtil.isA(editAnswer, "social/qna/components/topic")){
                if(post!=null){
                    //on submit, redirect to the topic page
                    topicUrl = post.getUrl();
                }else{
                    //if topic not found, redirect to the questions page
                    topicUrl = currentPage.getParent().getPath();
                }
            
            }else{
                log.error("failed to retrieve post for " + resource.getPath());
                return;
            }
        }
    }
    final Forum forum = resource.adaptTo(Forum.class);
    if (ForumUtil.mayPost(resourceResolver, forum)) {        
    
%>   


    <div class="subjectHeader">
        <span class="subject"><%=xssAPI.filterHTML(StringEscapeUtils.escapeHtml4(subject))%></span>
    </div>    
    <section class="page-par-left">
        <cq:include path="par" resourceType="foundation/components/parsys"/>
    </section>
</div>
<%
    }else {
%><div class="login"><%= xssAPI.encodeForHTML(i18n.get("Edit Q&A Form: access denied.")) %> <a onclick="$CQ.SocialAuth.sociallogin.showDialog('sociallogin-content-geometrixx-outdoors-en-support-jcr-content-userinfo-sociallogin');return false;"><%= xssAPI.encodeForHTML(i18n.get("Please Log in")) %></a></div><%
    }
%>
<div class="page-footer">
    <cq:include script="footer.jsp"/>
</div>


        
        