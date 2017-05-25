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
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.Value,
                  org.apache.sling.api.resource.ResourceUtil,
                  org.apache.jackrabbit.JcrConstants" %><%
%><ui:includeClientLib categories="granite.ui.foundation" /><%

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    String name = cfg.get("name", String.class);
    String value = val.get(name);

    Resource targetRes = resourceResolver.getResource(value);
    String readOnlyValue = value;
    if (targetRes != null) {
        Resource targetContent = targetRes.getChild(JcrConstants.JCR_CONTENT);
        if (targetContent != null) {
            ValueMap contentVm = ResourceUtil.getValueMap(targetContent);
            String targetTitle = contentVm.get("jcr:title", String.class);
            if (targetTitle != null) {
                readOnlyValue = targetTitle;
            }
        }
    }

    String fieldLabel = cfg.get("fieldLabel", String.class);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass("pathbrowser");
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("name", name);
    attrs.add("data-placeholder", i18n.getVar(cfg.get("emptyText", String.class)));
    attrs.addDisabled(cfg.get("disabled", false));

    attrs.add("data-root-path", cfg.get("rootPath", String.class));
    attrs.add("data-option-loader", cfg.get("optionLoader", String.class));
    attrs.add("data-option-loader-root", cfg.get("optionLoaderRoot", String.class));
    attrs.add("data-option-value-reader", cfg.get("optionValueReader", String.class));
    attrs.add("data-option-title-reader", cfg.get("optionTitleReader", String.class));

    attrs.add("value", value);

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "value", "emptyText", "disabled", "rootPath", "optionLoader", "optionLoaderRoot", "optionValueReader", "optionTitleReader", "renderReadOnly", "fieldLabel");

    attrs.add("data-init", "pathbrowser");

    attrs.add("autocomplete", "off");

    String rootClass = Field.getRootClass(cfg, value);

    if (fieldLabel != null) {
        %><label class="<%= rootClass %>"><span><%= outVar(xssAPI, i18n, fieldLabel) %></span><%
        rootClass = "";
    }

    if (cfg.get("renderReadOnly", false)) {
        attrs.addClass("foundation-field-edit");
        %><span class="foundation-field-editable <%= rootClass %>"><span class="foundation-field-readonly"><%= outVar(xssAPI, i18n, readOnlyValue) %></span><input type="text" <%= attrs.build() %> /></span><%
    } else {
        %><input type="text" <%= attrs.build() %> /><%
    }

    if (fieldLabel != null) {
        %></label><%
    }

%>