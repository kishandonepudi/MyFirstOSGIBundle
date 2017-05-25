<%@ page session="false"
         import="com.day.cq.commons.jcr.JcrUtil,
         com.day.cq.wcm.api.WCMMode,
         java.util.Iterator" %><%--
--%><%@include file="/libs/foundation/global.jsp"%><%

    String xiUrl = "/etc/clientlibs/foundation/swfobject/swf/expressInstall.swf";

    // find swf
    Resource swfDir = resourceResolver.getResource("/etc/designs/geometrixx/clientlibs/flash");
    Iterator<Resource> rIter = swfDir.listChildren();
    String flashUrl = null;
    while (rIter.hasNext()) {
        Resource r = rIter.next();
        if (r.getName().startsWith("cq-flashapp-geo-mobile-")) {
            flashUrl = r.getPath();
            break;
        }
    }
    String id = JcrUtil.createValidName(resource.getPath()) + "_swf";
    id = id.replaceAll("[\\.\\-\\+]", "");

    Page rootPage = currentPage.getAbsoluteParent(3);
    String appPath = rootPage == null ? currentPage.getPath() : rootPage.getPath();
    %>
<link rel="stylesheet" type="text/css" href="/etc/clientlibs/foundation/swfhistory/history.css" />
<script src="/etc/clientlibs/foundation/swfhistory/history.js" language="javascript"></script>
<!-- surround with black div to avoid "weird" bottom border of object -->
<div style="background-color: #000000">
    <div style="background-color: #dddddd" id="<%= id %>">&nbsp;</div>
</div>
<cq:includeClientLib js="cq.swfobject" />
    <script type="text/javascript">
        // create "flash component"
        var comp = CQ.wcm.FlashComponent.register({id:"<%= id %>"});

        // draw flash movie
        var flashVars = {
            currentPagePath: "<%= appPath %>",
            resourcePath: "<%= resource.getPath() %>",
            flashId: comp.flashId,
            wcmMode: "<%= WCMMode.fromRequest(request).name() %>"
        };
        var swfConfig = {
            swfUrlStr: "<%= request.getContextPath() + flashUrl %>",
            replaceElemIdStr: "<%= id %>",
            widthStr: "400",
            heightStr: "600",
            swfVersionStr: "10.2.0",
            xiSwfUrlStr: "<%= request.getContextPath() + xiUrl %>",
            flashvarsObj: flashVars,
            parObj: {
                menu: true,
                wmode: "opaque",
                bgcolor: "#dddddd"
            },
            attObj: {

            }
        };

        // detect emulator start to get the dimensions
        var emgr = CQ.WCM.getEmulatorManager();
        emgr.on("start", function(emulator) {
            // console.log("start", emulator);
            adjustDimensions();

            // disable browser border UIs
            var e = CQ.Ext.get("cq-emulator-browserui-header");
            if (e) {
                e.setDisplayed(false);
            }
            e = CQ.Ext.get("cq-emulator-browserui-footer");
            if (e) {
                e.setDisplayed(false);
            }
            // disable scroll in content element
            e = emulator.getContentElement();
            if (e) {
                e.setStyle("overflow", "visible");
            }
            // register rotation event
            emulator.addListener(CQ.wcm.emulator.plugins.RotationPlugin.EVENT_ROTATED, adjustDimensions);
        });
        emgr.on("stop", function(emulator) {
            // console.log("stop", emulator);
            // un-register rotation event
            emulator.removeListener(CQ.wcm.emulator.plugins.RotationPlugin.EVENT_ROTATED, adjustDimensions);
        });

        function adjustDimensions() {
            var emgr = CQ.WCM.getEmulatorManager();
            var emulator = emgr.getCurrentEmulator();
            var elem = emulator.getContentElement();
            // console.log("adjustDimensions", elem);
            var size = elem.getSize(false);
            if (size.width == 0 && size.height == 0) {
                window.setTimeout(adjustDimensions, 100);
            } else {
                swfConfig.widthStr=size.width;
                swfConfig.heightStr=size.height;

                var c = comp.getFlashMovie();
                if (!c) {
                    CQ_swfobject.embedSWF(
                        swfConfig.swfUrlStr,
                        swfConfig.replaceElemIdStr,
                        swfConfig.widthStr,
                        swfConfig.heightStr,
                        swfConfig.swfVersionStr,
                        swfConfig.xiSwfUrlStr,
                        swfConfig.flashvarsObj,
                        swfConfig.parObj,
                        swfConfig.attObj
                    );
                } else {
                    //console.log("adjustDimensions", size);
                    c.setAttribute("width", swfConfig.widthStr);
                    c.setAttribute("height", swfConfig.heightStr);
                }
            }
        }
    </script>
