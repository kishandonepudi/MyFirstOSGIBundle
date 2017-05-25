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
%><%@include file="/libs/granite/ui/global.jsp"%><%
%><%@page import="java.util.Iterator,
                  javax.jcr.Node,
                  javax.jcr.RepositoryException,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  org.apache.jackrabbit.JcrConstants,
                  org.apache.sling.api.resource.ResourceUtil" %><%

    Config cfg = new Config(resource);
    AttrBuilder attrs = new AttrBuilder(request, xssAPI);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.addClass(cfg.get("class", "pulldown"));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    attrs.add("data-init", "pulldown");
    attrs.addDisabled(cfg.get("disabled", false));
    attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "title", "type", "disabled", "icon", "href", "text", "autoComplete", "hideText");

    if (!cfg.get("hideText", false)) {
        attrs.addClass("withLabel");
    }

    AttrBuilder triggerAttrs = new AttrBuilder(request, xssAPI);
    triggerAttrs.addClass(cfg.get("icon", String.class));

    AttrBuilder popoverAttrs = new AttrBuilder(request, xssAPI);
    popoverAttrs.addClass("popover");
    popoverAttrs.addClass("arrow-top");
    popoverAttrs.addClass("align" + cfg.get("align", "left"));

%><nav <%= attrs.build() %>>
    <a href="#" <%= triggerAttrs.build() %>><%= outVar(xssAPI, i18n, cfg.get("text", "")) %></a>
    <div <%= popoverAttrs.build() %>>
        <ul>
            <%
                for (Iterator<Resource> items = cfg.getItems(); items.hasNext();) {

                    Resource item = items.next();
                    if (JcrConstants.JCR_CONTENT.equals(item.getName())) continue;

                    boolean hidden = false;
                    ValueMap ivm = ResourceUtil.getValueMap(item);
                    if (ivm.get("appendSuffix", false)) {
                        Resource suffixRes = slingRequest.getResourceResolver().getResource(slingRequest.getRequestPathInfo().getSuffix());
                        if (suffixRes == null) {
                            // Check if empty suffix are allowed
                            if (!ivm.get("allowEmptySuffix", true)) {
                                hidden = true;
                            }
                        } else {
                            // Check if suffix respects the minimal depth
                            Long suffixMinLevel = ivm.get("suffixMinLevel", Long.class);
                            try {
                                if (suffixMinLevel != null && suffixRes.adaptTo(Node.class).getDepth() < suffixMinLevel.intValue()) {
                                    hidden = true;
                                }
                            } catch (RepositoryException e) {
                                log.warn("Unable to check if suffix respects the minimal depth ({}) for item: {}", suffixMinLevel, item.getPath());
                            }
                        }
                    }

                    if (hidden) {
                        request.setAttribute("pulldown_disabled", Boolean.TRUE);
                    }
            %>
            <li><sling:include path="<%=item.getPath()%>" resourceType="<%=item.getResourceType()%>"/></li>
            <%
                    request.setAttribute("pulldown_disabled", null);
                }
            %>
        </ul>
    </div>
</nav>