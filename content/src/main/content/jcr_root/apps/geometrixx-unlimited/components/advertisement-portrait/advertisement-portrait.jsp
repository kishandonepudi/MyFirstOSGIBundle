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
<%@ page session="false"
         import="com.day.cq.commons.Doctype,
    com.day.cq.wcm.api.components.DropTarget, com.day.cq.wcm.api.WCMMode,
    com.day.cq.wcm.foundation.Image" %><%
%><%@include file="/libs/foundation/global.jsp"%><%
    Image image = new Image(resource);

    //drop target css class = dd prefix + name of the drop target in the edit config
    image.addCssClass(DropTarget.CSS_CLASS_PREFIX + "image");
    image.addCssClass("ad-ipad-portrait");
    WCMMode currentMode = WCMMode.fromRequest(request);
    if(currentMode != WCMMode.EDIT && currentMode != WCMMode.DESIGN){
        image.addCssClass("portrait-only");
    }
    image.loadStyleData(currentStyle);
    image.setSelector(".img"); // use image script
    image.setDoctype(Doctype.fromRequest(request));
    // add design information if not default (i.e. for reference paras)
    if (!currentDesign.equals(resourceDesign)) {
        image.setSuffix(currentDesign.getId());
    }
    String divId = "cq-image-jsp-" + resource.getPath();
    %><div id="<%= divId %>"><% image.draw(out); %></div><%
    %><cq:text property="jcr:description" placeholder="" tagName="small" escapeXml="true"/>
    
    <%@include file="/libs/foundation/components/image/tracking-js.jsp"%>