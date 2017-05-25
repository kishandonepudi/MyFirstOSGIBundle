<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%@page session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page import="com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Value,
                  org.apache.sling.api.resource.ResourceUtil" %><%
%><ui:includeClientLib categories="granite.ui.foundation" /><%

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));

    attrs.addClass("fileupload button");
    attrs.addClass(cfg.get("class", String.class));
    attrs.addClass(cfg.get("icon", String.class));

    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("name", cfg.get("name", String.class));
    attrs.add("value", val.get("value", String.class));
    attrs.addBoolean("multiple", cfg.get("multiple", false));

    attrs.add("placeholder", i18n.getVar(cfg.get("emptyText", String.class)));
    attrs.addDisabled(cfg.get("disabled", false));

    String uploadUrl = cfg.get("uploadUrl", "");
    String suffix = slingRequest.getRequestPathInfo().getSuffix();
    if (suffix != null) {
        uploadUrl = uploadUrl.replaceAll("\\$\\{suffix.path\\}", suffix);
    }

    attrs.add("data-upload-url", uploadUrl);
    attrs.add("data-upload-url-builder", cfg.get("uploadUrlBuilder", String.class));
    attrs.add("data-size-limit", cfg.get("sizeLimit", String.class));
    attrs.addBoolean("data-auto-start", cfg.get("autoStart", false));
    attrs.add("data-file-name-parameter", cfg.get("fileNameParameter", String.class));

    // Event handlers
    ValueMap eventVM = ResourceUtil.getValueMap(cfg.getChild("events"));
    for (String eventName : eventVM.keySet()) {
        if (!eventName.startsWith("jcr:")) {
            Object eventHandler = eventVM.get(eventName);
            if (eventHandler instanceof String) {
                attrs.add("data-event-" + eventName, (String) eventHandler);
            }
        }
    }

    attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "icon", "title", "name", "value", "multiple", "emptyText", "disabled", "uploadUrl", "sizeLimit", "autoStart", "fileNameParameter");

    attrs.add("data-init", "fileupload");

%><input type="file" <%= attrs.build() %> />
