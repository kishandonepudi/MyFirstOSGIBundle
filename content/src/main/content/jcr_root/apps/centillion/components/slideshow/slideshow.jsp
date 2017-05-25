<%--
  Copyright 1997-2008 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Slideshow component

--%><%@ page import="com.day.cq.commons.jcr.JcrUtil,
                     com.day.cq.wcm.api.components.DropTarget" %><%
%><%@include file="/libs/foundation/global.jsp"%><%

    //drop target css class = dd prefix + name of the drop target in the edit config
    String ddClassName = DropTarget.CSS_CLASS_PREFIX + "slideshow";

    String name = currentNode.getPath();
    String id = JcrUtil.createValidName(name) + "_swf";

    String contextPath = request.getContextPath() != null ? request.getContextPath() : "";
    String slideshowURL = contextPath + "/etc/clientlibs/foundation/shared/endorsed/swf/slideshow.swf";
    String expressInstallURL = contextPath + "/etc/clientlibs/foundation/swfobject/swf/expressInstall.swf";

%><div class="<%= ddClassName %>">
    <div id="<%= id %>">
      <p>Alternative content</p>
    </div>
</div>
<cq:includeClientLib js="cq.swfobject,cq.jquery" />

<script type="text/javascript">
    function redraw(id) {
        document.getElementById(id).redraw();
    }
    function getSlides(url) {
        var noCacheUrl = url + "?cq_ck=" + new Date().valueOf();
        return $CQ.parseJSON($CQ.ajax({
            "url" : noCacheUrl,
            "async" : false,
            "dataType" : "json"
        }).responseText);
    }
</script>

<script type="text/javascript">
    var flashvars = {
        contentPath: "<%=contextPath + currentNode.getPath()%>",
        backgroundColor : "<%= properties.get("backgroundColor", "ffffff") %>",
        webAppContextPath : "<%= contextPath %>"
    };
    var params = {
        menu: "false",
        wmode: "opaque"
    };
    var attributes = {};
    if( window.CQ_swfobject) CQ_swfobject.embedSWF("<%=slideshowURL%>", "<%= id %>", "<%=properties.get("slideshowWidth", String.class) != null ? properties.get("slideshowWidth", String.class) : "100%"%>", "<%=properties.get("slideshowHeight", String.class) != null ? properties.get("slideshowHeight", String.class) : "300"%>", "9.0.0", "<%=expressInstallURL%>", flashvars, params, attributes);
</script>
