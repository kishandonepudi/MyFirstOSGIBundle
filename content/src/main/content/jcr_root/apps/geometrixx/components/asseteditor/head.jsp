<%--
  Copyright 1997-2009 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Geometrixx DAM Asset Editor Head Script

  Draws the HTML head with some default content:
  - initialization of the WCM
  - includes the current design CSS
  - sets the HTML title

  ==============================================================================

--%><%@include file="/libs/foundation/global.jsp" %><%
                   // include edit/init.jsp for backward compatibility reasons (5.4)
%><%@include file="/libs/foundation/components/form/actions/edit/init.jsp" %><%
%><%@ page import="java.util.List,
                javax.jcr.lock.LockManager,
                org.apache.commons.lang3.StringEscapeUtils,
                com.day.cq.commons.Doctype,
                com.day.cq.dam.api.Asset,
                com.day.cq.wcm.api.WCMMode" %><%

    String title = null;
    if (resources != null) {
        // an asset is loaded: disable WCM
        WCMMode.DISABLED.toRequest(request);

        if (resources.size() == 1) {
            Resource r = resources.get(0);
            String path = r.getPath();
            Asset asset = r.adaptTo(Asset.class);
            try {
                // it might happen that the adobe xmp lib creates an array
                Object titleObj = asset.getMetadata("dc:title");
                if (titleObj instanceof Object[]) {
                    Object[] titleArray = (Object[]) titleObj;
                    title = (titleArray.length > 0) ? titleArray[0].toString() : "";
                } else {
                    title = titleObj.toString();
                }
            }
            catch (NullPointerException e) {
                title = path.substring(path.lastIndexOf("/") + 1);
            }
            // we propagate the asset title to the title component
            request.setAttribute("com.day.apps.geometrixx.title.pagetitle", title);
        }

        // locked assets
        try {
            Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
            LockManager lockMan = session.getWorkspace().getLockManager();

            for (int i = 0; i < resources.size(); i++) {
                String path = resources.get(i).getPath();
                String lockOwner = null;
                try {
                    lockOwner = lockMan.getLock(path).getLockOwner();
                }
                catch (Exception e) {}

                // locking behaviour 1: read only if asset is not locked or locked by an other user
                if (lockOwner != null && !session.getUserID().equals(lockOwner)) {
                    // one item is locked: read only for entire form because POST would throw an error
                    FormsHelper.setFormReadOnly(slingRequest);
                    slingRequest.setAttribute("cq.form.locked", true);
                    break;
                }

                // locking behaviour 2: check-in / check-out
                // read only if asset is not locked (checked-out) by the current user
//                if (!session.getUserID().equals(lockOwner)) {
//                    // one item is not locked by current user
//                    FormsHelper.setFormReadOnly(slingRequest);
//                    slingRequest.setAttribute("cq.form.locked", true);
//                    break;
//                }

            }
        }
        catch (RepositoryException re) {}
    }

    if (title == null) {
        // no asset or multiple assets
        title = currentPage.getTitle() == null ? currentPage.getName() : currentPage.getTitle();
    }

    String xs = Doctype.isXHTML(request) ? "/" : "";
    String favIcon = currentDesign.getPath() + "/favicon.ico";
%><head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8"<%=xs%>>
    <meta name="keywords" content="<%= StringEscapeUtils.escapeHtml4(WCMUtils.getKeywords(currentPage)) %>"<%=xs%>>
    <meta name="description" content="<%= StringEscapeUtils.escapeHtml4(properties.get("jcr:description", "")) %>"<%=xs%>>
    <cq:include script="headlibs.jsp"/>
    <cq:include script="/libs/wcm/core/components/init/init.jsp"/>
    <cq:include script="stats.jsp"/>
    <link rel="icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>"<%=xs%>>
    <link rel="shortcut icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>"<%=xs%>>
    <title><%= StringEscapeUtils.escapeHtml4(title) %></title>
</head>

