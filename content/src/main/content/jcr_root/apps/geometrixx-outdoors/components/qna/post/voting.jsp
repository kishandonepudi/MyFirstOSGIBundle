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
<%--

    Voting Component
--%>
<%@ page import="com.adobe.cq.social.tally.Voting, com.adobe.cq.social.tally.Vote, com.adobe.cq.social.tally.Response" %>
<%@include file="/libs/social/commons/commons.jsp"%>
<%
     
    final Voting v = resource.adaptTo(Voting.class);
    if(v !=null) {
        pageContext.setAttribute("vote",v);
        pageContext.setAttribute("isAnonymous", isAnonymous);
        Response<Vote> userVote = v.getUserResponse(loggedInUserID);
        if(userVote != null) {
            pageContext.setAttribute("userResponse",userVote.getResponseValue());
        }

        final String votingFormId = "voting_"+resource.getPath().substring(resource.getPath().lastIndexOf("/")+1,resource.getPath().length());
        final String helpfulAnswerText = i18n.get("This answer is helpful.  Click again to undo.");
        final String notHelpfulAnswerText = i18n.get("This answer is not helpful.  Click again to undo.");
        final String anonymousSignInText = i18n.get("Sign in in order to vote.");     
         
        final Long helpfulCount = v.getPositiveCount();
        final Long notHelpfulCount = v.getNegativeCount();
        
        int vote = 0;
        String upvoteinput = "1";
        String downvoteinput = "-1";
        if (userVote != null) {
            if (userVote.getResponseValue() == Vote.LIKE) {
                vote = 1;
                upvoteinput = "unset";                
            }
            if (userVote.getResponseValue() == Vote.DISLIKE) {
                vote = -1;
                downvoteinput = "unset";
            }
        }
        if (isAnonymous || !v.canUserRespond())
        {
%>
                <span class="voteControl"><span class="up-vote"></span><%=helpfulCount%></span>
                <span class="voteControl"><span class="down-vote"></span><%=notHelpfulCount%></span>
                <%
                	if(isAnonymous) {
                %>
                	<p><%=anonymousSignInText %></p>
                <% } %>
<%
        } else {
%>
        <form id="<%= votingFormId %>" method="POST" action="<%= xssAPI.getValidHref(v.getVoteURL()) %>">
            <input type="hidden" name = "tallyType" value = "Voting" />
            <label class="voteControl"><input id="thumbup" class="up-vote <%if(vote == 1){%>voted<%}%>" type="image" title="<%=helpfulAnswerText%>" name="response" value="<%=upvoteinput%>" alt=""/><%=helpfulCount%></label>
            <label class="voteControl"><input id="thumbdown" class="down-vote <%if(vote == -1){%>voted<%}%>" type="image" title="<%=notHelpfulAnswerText%>" name="response" value="<%=downvoteinput%>" alt=""/><%=notHelpfulCount%></label>
            <input type="hidden" value="UTF-8" name="_charset_"/>            
            <input type="hidden" value="UTF-8" name="_charset_"/>
    </form>
    <script>
        $CQ(function(){
            CQ.soco.voting.handleVoting($CQ("#<%=votingFormId%>"));
        });
    </script>
<%
        }
    } else {
        log.warn("resource couldn't be adapted to vpte at [{}].", resource.getPath());
    }%>