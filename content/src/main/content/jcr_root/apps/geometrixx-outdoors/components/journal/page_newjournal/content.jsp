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
%><%@ page import="java.security.AccessControlException,
                    org.apache.sling.api.SlingHttpServletRequest,
                    com.day.text.Text,
                    com.adobe.cq.social.journal.Journal,
                     com.adobe.cq.social.journal.JournalManager" %><%
%><%@include file="/libs/social/commons/commons.jsp" %><%

    /*String journalPath = currentPage.getParent().getPath();
    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    Journal journal = journalMgr.getJournal(slingRequest, journalPath);
    if (journal != null) {
        slingRequest.setAttribute(JournalManager.ATTR_JOURNAL, journal);
    }*/ // TODO do we need this?

    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    // force login if user has no create permission on Journal page
    try {
        Session session = slingRequest.getResourceResolver().adaptTo(Session.class);

        session.checkPermission(currentPage.getPath() + "/_check" +
                System.currentTimeMillis(), "add_node");

        // draw entry form
        %>
        <%
    } catch (AccessControlException ace) {

        %>
          <h3 style="margin-left:40px"><%= i18n.get("New Journal Form: access denied. Please ") %>
          <%
          if(isAnonymous){
          %><a style="text-decoration:underline; color:#06c;" onclick="$CQ.SocialAuth.sociallogin.showDialog('sociallogin-content-geometrixx-outdoors-en-support-jcr-content-userinfo-sociallogin');return false;"><%= i18n.get("Log In") %></a><%
          }else{
          %><a style="text-decoration:underline; color:#06c;" href="/content/geometrixx-outdoors/en/group/signup.html"><%= i18n.get("Sign Up for Journal ") %></a><%
          }
          %></h3><p/><%
    }
%>