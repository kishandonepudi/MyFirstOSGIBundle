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

--%><%@page import="java.io.IOException,
                java.text.SimpleDateFormat,
                javax.jcr.Node,
                javax.jcr.NodeIterator,
                javax.jcr.RepositoryException,
                org.apache.sling.api.SlingHttpServletRequest,
                com.adobe.cq.social.commons.CollabUser,
                com.adobe.cq.social.commons.CollabUtil,
                com.adobe.cq.social.commons.Comment,
                com.adobe.cq.social.commons.CommentSystem,
                com.day.cq.xss.XSSProtectionService,
                com.day.cq.i18n.I18n,
                com.day.text.Text,
                java.util.ResourceBundle,
                java.util.Locale,
                org.slf4j.Logger,
                com.adobe.granite.xss.XSSAPI" %>
<%@include file="/libs/foundation/global.jsp"%>
<%
    Comment comment = resource.adaptTo(Comment.class);
        Node node = resource.adaptTo(Node.class);
    String path = comment.getPath();
    String label = Text.getName(path);
    if (node.hasNode(CommentSystem.NN_COMMENT_ATTACHMENTS)) {
%>
        <%
            dumpAttachments(slingRequest, out, node.getNode(CommentSystem.NN_COMMENT_ATTACHMENTS), xssAPI, log);
        %>
    <%
    }

%><%!

    public static void dumpAttachments(SlingHttpServletRequest req, JspWriter out, Node parent, XSSAPI xssAPI, Logger log)
            throws RepositoryException, IOException {
        NodeIterator iter = parent.getNodes();
        final I18n i18n = new I18n(req);
        while (iter.hasNext()) {
            Node att = iter.nextNode();
            String name = Text.getName(att.getPath());
            name = xssAPI.encodeForHTML(name);
            if (att.isNodeType("nt:unstructured")) {
                dumpAttachments(req, out, att, xssAPI, log);
            } else if (att.isNodeType("nt:file")) {
                out.write("<div class='comment-image'><a href=\"" + req.getContextPath() + att.getPath() + "\"><img src=\"" + req.getContextPath() + att.getPath() + ".thumb.109.136.png" + "\"/></a></div>");
            } else {
                // ignore
            }
        } // while
    }
%>
