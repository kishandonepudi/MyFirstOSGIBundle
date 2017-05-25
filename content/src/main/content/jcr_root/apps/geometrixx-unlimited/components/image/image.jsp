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
    com.day.cq.wcm.api.components.DropTarget,
    com.day.cq.wcm.foundation.Image,
    com.day.cq.i18n.I18n" %><%
%><%@include file="/libs/foundation/global.jsp"%>
<%
    final I18n i18n = new I18n(request);
    
    Image image = new Image(resource);

    //drop target css class = dd prefix + name of the drop target in the edit config
    image.addCssClass(DropTarget.CSS_CLASS_PREFIX + "image");
    image.loadStyleData(currentStyle);
    image.setSelector(".img"); // use image script
    image.setDoctype(Doctype.fromRequest(request));
    // add design information if not default (i.e. for reference paras)
    if (!currentDesign.equals(resourceDesign)) {
        image.setSuffix(currentDesign.getId());
    }
    String suffix = resource.getPath().replaceAll("/","-").replaceAll(":","-");
    String divId = "cq-image-jsp-" + suffix;
    String captionId = "unlimited-image-caption-"  + suffix;
    String btnOpenId  = "unlimited-image-caption-button-open-" + suffix;
    String btnCloseId  = "unlimited-image-caption-button-close-" + suffix;
    String captionLabel = i18n.get("Caption");

    ValueMap vm = resource.adaptTo(ValueMap.class);
    
    boolean hasDescription = vm!=null && vm.get("jcr:description","").trim().length()>0;

    %>
    <div class="image-base" id="<%= divId %>"><% image.draw(out); 
        %><%
        if(hasDescription){
            %>
            <div class="image-caption image-caption-hidden" id="<%= captionId %>">
                <div class="image-caption-aspect-enforcer"></div>
                <div class="image-caption-box">
                    <a href="javascript:void(0);"><div class="image-caption-close-button" id="<%= btnCloseId %>"></div></a>
                    <div class="image-caption-title">
                        <cq:text property="jcr:title" placeholder="" tagName="small" escapeXml="true"/>
                    </div>
                    <div class="image-caption-content">
                        <cq:text property="jcr:description" placeholder="" tagName="small" escapeXml="true"/>
                    </div>
                </div>
            </div>
            <a href="javascript:void(0);"><div class="image-caption-open-button" id="<%= btnOpenId %>"></div></a>
            <%
        }
        %>
    </div>

<script type="text/javascript">
    (function(captionId, buttonOpenId, buttonCloseId){
        
        var caption = $("#"+captionId);
        var buttonOpen = $("#"+buttonOpenId);
        $(document).on("click","#"+buttonOpenId+", #"+buttonCloseId,function(){
            caption.toggleClass("image-caption-hidden");
            buttonOpen.toggleClass("image-caption-open-button-hidden");
        });
    })("<%= captionId %>","<%= btnOpenId %>","<%= btnCloseId %>");
</script>
    
    <%@include file="/libs/foundation/components/image/tracking-js.jsp"%>
