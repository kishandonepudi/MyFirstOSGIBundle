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
%><%@page import="java.util.Iterator,
                  java.util.LinkedHashMap,
                  java.util.HashMap,
                  java.util.List,
                  java.util.Map,
                  org.apache.jackrabbit.JcrConstants,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Value,
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.AttrBuilder" %><%

    Config cfg = new Config(resource);
    Value val = new Value(slingRequest, cfg);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);
    AttrBuilder attrsSelect = new AttrBuilder(request, xssAPI);

    String name = cfg.get("name", String.class);
    boolean multiple = cfg.get("multiple", false);

    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrsSelect.add("name", name);
    //attrs.add("value", val.get(name);
    attrs.add("data-placeholder", cfg.get("emptyText", String.class)); // placeholder is not valid for selects so we use data-placeholder
    attrs.addDisabled(cfg.get("disabled", false));
    attrs.addClass("filters");

    if (multiple) {
        attrs.add("data-multiple", "true");
        attrsSelect.add("multiple", "multiple");
    }

    if (cfg.get("stacking", false)) {
        attrs.add("data-stacking", "true");
    }

    if (cfg.get("allowCreate", false)) {
        attrs.add("data-allow", "create");
    }

    Map<String, Map<String, String>> optionList = new LinkedHashMap();

    String[] options = cfg.get("options", String[].class);
    if (options != null) {
        for(String option : options) {
            Map<String, String> tagValueMap = new HashMap<String, String>();
            tagValueMap.put("title", option);
            tagValueMap.put("titlePath", option);
            optionList.put(option, tagValueMap);
        }
    }

%><%!
    void readTags(Map<String, Map<String, String>> results, String basePath, String baseTitle, Resource currentNode, int depth) {
        Iterator<Resource> children = currentNode.listChildren();
        if (children == null) return;
        while(children.hasNext()) {
            Resource child = children.next();
            if (JcrConstants.JCR_CONTENT.equals(child.getName())) continue;
            
            String name = child.getName();
            
            Config childCfg = new Config(child);
            String title = childCfg.get("jcr:title", String.class);
            
            if (title == null) title = name;
            
            String separator = (depth == 0) ? ":" : "/";
            String suffix = (depth == 0) ? ":" : "";
            
            if (title != null) {
                Map<String, String> tagValueMap = new HashMap<String, String>();
                tagValueMap.put("title", title);
                tagValueMap.put("titlePath", baseTitle + title + suffix);
                results.put(basePath + name + suffix, tagValueMap);
                readTags(results, basePath + name + separator, baseTitle + title + separator, child, depth + 1);
            }
        }
    }
%><%
    String optionPath = cfg.get("optionPath", String.class);
    if (optionPath != null) {
        Resource optionResource = resourceResolver.getResource(optionPath);
        readTags(optionList, "", "", optionResource, 0);
    }

    attrs.addOthers(cfg.getProperties(), "rel", "title", "name", "value", "emptyText", "disabled", "multiple", "stacking", "options");

    attrs.add("data-option-renderer", "cqTag");
    attrs.add("data-init", "filters");

    String contentValue = val.get(name);
    String[] contentValueArray = val.get(name, new String[0]);
    List<String> contentValueList = java.util.Arrays.asList(contentValueArray);

    String fieldLabel = cfg.get("fieldLabel", String.class);

    String rootClass;
    if (multiple) {
        rootClass = Field.getRootClass(cfg, contentValueArray.length == 0);
    } else {
        rootClass = Field.getRootClass(cfg, contentValue);
    }
%>
<%
    if (fieldLabel != null) {
        %><label class="<%= rootClass %>"><span><%= outVar(xssAPI, i18n, fieldLabel) %></span><%
        rootClass = "";
    }
%><%
    if (cfg.get("renderReadOnly", false)) {
        attrs.addClass("foundation-field-edit");
        %><span class="foundation-field-editable <%= rootClass %>"><span class="foundation-field-readonly filters"><ul class="tags"><%
          for(String option : optionList.keySet()) {
              String displayName = optionList.get(option).get("title");
              String displayPath = optionList.get(option).get("titlePath");
              long randomSelector = Math.round(Math.random()*10000000);
              if ((multiple && contentValueList.contains(option)) || (contentValue != null && contentValue.equals(option))) {
                %><li><a href="#<%= randomSelector%>_popover" data-toggle="popover" data-point-from="left" data-align-from="right">
                            <span><%=xssAPI.encodeForHTML(displayName)%></span>
                       </a>
                  <div id="<%= randomSelector%>_popover" class="popover arrow-right">
                      <div><%=xssAPI.encodeForHTML(displayPath)%></div>
                  </div>
                  </li><%
              }
          }
        %></ul></span><%
    }
%>
  <div <%= attrs.build() %> >

      <input type="text" />
      <select <%= attrsSelect.build() %> />
      <%
      boolean selected = false;
      for(String option : optionList.keySet()) {
          String displayName = optionList.get(option).get("titlePath");
          if (multiple) {
              selected = contentValueList.contains(option);
          } else {
              selected = (contentValue != null && contentValue.equals(option));
          }
          %>
          <option value="<%= xssAPI.encodeForHTML(option) %>" <%= (selected) ? "selected" : "" %> ><%= xssAPI.encodeForHTML(displayName) %></option>
          <%
      }
      %>
      </select>
  </div>
<%
    if (cfg.get("renderReadOnly", false)) {
        %></span><%
    }
%>
<%
if (fieldLabel != null) {
    %></label><%
}%>