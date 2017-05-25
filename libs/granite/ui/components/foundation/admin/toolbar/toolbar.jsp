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
%><%@page import="java.util.ArrayList,
                  java.util.Iterator,
                  java.util.List,
                  org.apache.jackrabbit.JcrConstants,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.AttrBuilder"%><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Action+Bar
    //Please keep in sync whenever possible

    Config cfg = new Config(resource);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.addClass("toolbar");
    attrs.addClass(cfg.get("class", String.class));
    attrs.addOther("init", "toolbar");

    attrs.addOthers(cfg.getProperties(), "id", "rel", "class");

    ChildBuilder children = new ChildBuilder(response);

%><nav <%= attrs.build() %>><%
    for (Iterator<Resource> it = cfg.getItems(); it.hasNext();) {
        Resource child = it.next();
        if (JcrConstants.JCR_CONTENT.equals(child.getName())) continue;
        Config childCfg = new Config(child);
        children.add(child, childCfg.get("align", "left"));
    }
    
    if (children.hasLeft()) {
        %><div class="left icongroup"><%

        for (Resource r : children.getLeft()) {
            Config childCfg = new Config(r);
            
            if (childCfg.get("divider", false)) {
                %><span class="divider"></span><%
            } else {
                %><sling:include path="<%= r.getPath() %>" /><%
            }
        }
        %></div><%
    }
    
    if (children.hasRight()) {
        %><div class="right icongroup"><%

        for (Resource r : children.getRight()) {
            Config childCfg = new Config(r);
            
            if (childCfg.get("divider", false)) {
                %><span class="divider"></span><%
            } else {
                %><sling:include path="<%= r.getPath() %>" /><%
            }
        }
        %></div><%
    }

    if (children.hasCenter()) {
        %><div class="center"><%
        %><sling:include path="<%= children.getCenter().getPath() %>" /><%
        %></div><%
    }
%></nav>
<%!
class ChildBuilder {
    private HttpServletResponse res;
    private List<Resource> left = new ArrayList<Resource>();
    private Resource center;
    private List<Resource> right = new ArrayList<Resource>();
    
    ChildBuilder(HttpServletResponse res) {
        this.res = res;
    }
    
    void add(Resource res, String align) {
        if ("left".equals(align)) {
            left.add(res);
        }
        if ("right".equals(align)) {
            right.add(0, res);
        }
        if ("center".equals(align)) {
            center = res;
        }
    }
    
    boolean hasLeft() {
        return !left.isEmpty();
    }
    
    List<Resource> getLeft() {
        return left;
    }
    
    boolean hasCenter() {
        return center != null;
    }
    
    Resource getCenter() {
        return center;
    }
    
    boolean hasRight() {
        return !right.isEmpty();
    }
    
    List<Resource> getRight() {
        return right;
    }
}
%>