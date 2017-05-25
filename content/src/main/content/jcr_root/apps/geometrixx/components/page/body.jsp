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

  Default body script.

  Draws the HTML body with the page content.

  ==============================================================================

--%><%@include file="/libs/foundation/global.jsp" %><%
    StringBuffer cls = new StringBuffer();
    for (String c: componentContext.getCssClassNames()) {
        cls.append(c).append(" ");
    }
    String[] selectors = slingRequest.getRequestPathInfo().getSelectors();
    boolean isNewEdit = false;
    for (String selector : selectors) {
        if (selector.equals("touchedit")) {
            isNewEdit = true;
            break;
        }
    }
%><body class="<%= cls %>">
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
    <div class="bg" id="main_bg">
        <cq:include script="header.jsp"/>
        <cq:include script="content.jsp"/>
        <cq:include script="footer.jsp"/>
    </div>
    <cq:include path="timing" resourceType="foundation/components/timing"/>
    <cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>