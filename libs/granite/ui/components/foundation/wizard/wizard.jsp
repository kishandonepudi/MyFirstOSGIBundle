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
--%><%
%><%@page import="java.util.Iterator,
                  com.day.cq.commons.jcr.JcrConstants,
                  com.adobe.granite.ui.components.Config,
                  org.apache.sling.api.resource.Resource"
          session="false" %><%
%><%@include file="/libs/granite/ui/global.jsp"%><%
%><%@include file="/libs/granite/ui/components/foundation/htmlhelper.jsp" %><%

    //Doc: https://zerowing.corp.adobe.com/display/granite/Tabs
    //Please keep in sync whenever possible
      
    Config cfg = new Config(resource);

    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.addClass(cfg.get("class", String.class));
    attrs.addClass("wizard");

    if (cfg.get("hidesteps", false)) {
        attrs.add("data-hide-steps", "true");
    }

    attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "type", "hidesteps");

%><div <%= attrs.build() %>>
    <nav>
        <button class="back"><%= i18n.get("Back") %></button>
        <ol>
          <%
          for (Iterator<Resource> it = resource.listChildren(); it.hasNext();) {
              Resource item = it.next();
              if (JcrConstants.JCR_CONTENT.equals(item.getName())) continue;
              Config cvm = new Config(item);
              String title = cvm.get("title", "");
              %>
              <li><%= outVar(xssAPI, i18n, title) %></li>
              <%
          }
          %>
        </ol>
        <button class="next" disabled><%= i18n.get("Next") %></button>
    </nav>

    <%
    for (Iterator<Resource> it = resource.listChildren(); it.hasNext();) {
        Resource item = it.next();
        if (JcrConstants.JCR_CONTENT.equals(item.getName())) continue;
        Config cvm = new Config(item);
        
        AttrBuilder sectionAttr = new AttrBuilder(null, null);

        Boolean nextdisabled = cvm.get("nextdisabled", null);
        String nextlabel = cvm.get("nextlabel", null);
        Boolean backdisabled = cvm.get("backdisabled", null);
        String backlabel = cvm.get("backlabel", null);

        String wizardpagecallback = cvm.get("wizardpagecallback", null);
        String sectionClass = cvm.get("class", null);
        String title = cvm.get("title", "");

        %><section <%= (nextdisabled != null && nextdisabled == false) ? " data-next-disabled=\"false\"" : (nextdisabled != null && nextdisabled == true) ? " data-next-disabled=\"true\"" : "" %><%
               %><%= (backdisabled != null && backdisabled == false) ? " data-back-disabled=\"false\"" : (backdisabled != null && backdisabled == true) ? " data-back-disabled=\"true\"" : "" %><%
               %><%= (nextlabel != null) ? " data-next-label=\"" + i18n.getVar(nextlabel) + "\"" : "" %><%
               %><%= (backlabel != null) ? " data-back-label=\"" + i18n.getVar(backlabel) + "\"" : "" %><%
               %><%= (wizardpagecallback != null) ? " data-wizard-page-callback=\"" + wizardpagecallback + "\"" : "" %><%
               %><%= (sectionClass != null) ? " class=\"" + sectionClass + "\"" : "" %>>
            <sling:include path="<%= item.getPath() %>" />
        </section>
        <%
    } %>
</div>