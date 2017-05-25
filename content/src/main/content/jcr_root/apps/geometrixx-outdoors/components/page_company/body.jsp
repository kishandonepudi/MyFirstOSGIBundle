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
%><%@ include file="/libs/foundation/global.jsp" %><%
%><%@ page contentType="text/html; charset=utf-8" %><%

    final String currentPageName = currentPage.getName();
    final String className = component.getProperties().get("className", "") + " " + currentPageName;
    String[] selectors = slingRequest.getRequestPathInfo().getSelectors();
    boolean isNewEdit = false;
    for (String selector : selectors) {
        if (selector.equals("touchedit")) {
            isNewEdit = true;
            break;
        }
    }
%>
<body class="<%= xssAPI.encodeForHTMLAttr(className) %>">
    <cq:include path="clientcontext" resourceType="cq/personalization/components/clientcontext"/>
<%
    if (isNewEdit) {
%>
    <div class="mc_rail_hdr"><div class="mc_rail_btn_close"></div></div>
    <div class="mc_rail"></div>
    <div class="mc-topnav_frame">
        <div class="mc-topnav">
            <a href="#"><span class="app_logo"></span></a>
            <ul class="default toolbar">
                <li class="more first">K. Lynch</li>
                <li><a href="#" class="func" func="edit">Edit</a></li>
                <li><a href="#" class="func" func="cut">Cut</a></li>
                <li><a href="#" class="func" func="copy">Copy</a></li>
                <li><a href="#" class="func" func="paste">Paste</a></li>
                <li><a href="#" class="func" func="delete">Delete</a></li>

            </ul>
            <ul class="rte-controls">
                <li class="more first">K. Lynch</li>
                <li><a class="func" href="#" func="bold" style="font-weight: bold;">B</a></li>
                <li><a class="func" href="#" func="italic" style="font-style: italic;">I</a></li>
                <li><a class="func" href="#" func="underline" style="text-decoration: underline;">U</a></li>
                <li><a class="func f-justifyleft" href="#" func="justifyleft">&nbsp;</a></li>
                <li><a class="func f-justifycenter" href="#" func="justifycenter">&nbsp;</a></li>
                <li><a class="func f-justifyright" href="#" func="justifyright">&nbsp;</a></li>
                <li><a class="func f-ul" href="#" func="insertUnorderedList">&nbsp;</a></li>
                <li><a class="func f-ol" href="#" func="insertOrderedList">&nbsp;</a></li>
                <li><a class="func f-indent" href="#" func="indent">&nbsp;</a></li>
                <li><a class="func f-outdent" href="#" func="outdent">&nbsp;</a></li>
                <li>
                    <ol>
                        <li class="current">Header 1</li>
                        <li>Header 2</li>
                        <li>Paragraph</li>
                        <li>Title</li>
                        <li>Quote</li>
                    </ol>
                </li>
                <li><a href="#" id="rte-cancel">Cancel</a></li>
                <li><a href="#" id="rte-save">Save</a></li>
            </ul>
            <div class="mc_rail_btn_open"></div>
        </div>
    </div>
<%
    }
%>
    <div id="main" class="page-main">
        <cq:include script="main.jsp"/>
    </div>
    <cq:include path="timing" resourceType="foundation/components/timing"/>
    <cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>