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
    Topic Creation Component
--%>
<%@include file="/libs/social/commons/commons.jsp"%><%
%><%@ page import="com.adobe.cq.social.forum.api.Forum,
                    com.adobe.cq.social.forum.api.Post,
                    com.adobe.cq.social.forum.api.ForumUtil"%><%
        final Forum forum = resource.adaptTo(Forum.class);
        final Boolean richTextEditorEnabled = forum.isRTEEnabled();
        final Boolean allowFileUploads = forum.allowFileUploads();
        final String idTextArea = "form_topic_textArea";
        final String emptyText = StringUtils.defaultIfEmpty(forum.getEmptyText(),
                i18n.get("Enter subject to create a new topic..."));


        final String formUrl = StringUtils.removeEnd(forum.getUrl(), ".html") + "/newtopic/jcr:content/par.html";
if (allowFileUploads) { 
%><script type="text/javascript">
function cancelTopicFileUpload() {
    var formID = "#"+ "formFileUploadDiv";
    var div = $CQ(formID).html();
    $CQ(formID).html($CQ(formID).html());
}

</script> 
<% } %>

<a class="orange_button lightbox" data-url="<%= formUrl %>" data-title="New Thread">New Thread</a>
<% // TODO remove old statis form %>
<!--div id="composer" class="composer">
    <div class="left">
        <form action="<%=(isCORS)?externalizer.absoluteLink(slingRequest, slingRequest.getScheme(), resource.getPath() + ".createpost.html" ):resource.getPath() + ".createpost.html"%>"
              method="POST"
              id = "forumTopicComposerForm"
              enctype="multipart/form-data"
            >
            <label title="<%= xssAPI.encodeForHTMLAttr(emptyText) %>">
                <input type="text"
                       class="form_field form_field_text"
                       name="<%= Post.PN_SUBJECT %>"
                       onfocus="CQ.soco.forum.topicCreatorFocus(this, '<%=xssAPI.encodeForJSString(emptyText)%>');"
                       onblur="CQ.soco.forum.topicCreatorBlur(this, '<%=xssAPI.encodeForJSString(emptyText)%>');"
                       value="<%= xssAPI.encodeForHTMLAttr(emptyText) %>"
                        />
            </label><br/>
             <div class="topicDetails" style="display:none">
                <label title="<%=i18n.get("Enter your message...")%>">
                    <textarea name="<%= Post.PN_MESSAGE %>" class="form_field form_field_textarea" rows="3" cols="10" id = "<%= idTextArea %>"></textarea>
                </label>
                <label title="<%=i18n.get("Notify me of changes...")%>">
                    <input type="checkbox" name="<%=Post.PN_NOTIFY%>" value="true" checked="true"/> <%=i18n.get("Notify me of changes")%><br/>
                </label>
                <div id="formFileUploadDiv" >
          <% if (forum.allowFileUploads()) { %>
                        <input type="hidden" name="_charset_" value="<%= response.getCharacterEncoding() %>"/>
                        <input class="submit" type="file" name="file" value="<%= i18n.get("Upload", "Upload a file") %>"/>
                <%}%>
              </div>
                <input name="submit" type="submit" value="<%=i18n.get("Submit")%>"/><% if (forum.allowFileUploads()) { %><input type="button"  class="submit" onclick="cancelTopicFileUpload()" value="<%= i18n.get("Cancel Upload", "Cancel Upload") %>"/><%}%>
            </div>
        <input type="hidden" name="_charset_" value="UTF-8"/>
    </form>
</div>
</div-->