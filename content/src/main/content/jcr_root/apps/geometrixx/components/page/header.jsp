<%--
  Copyright 1997-2011 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Header script.

  Draws the top header and shows an example of how to include a cacheable
  navigation by using a script include. see page/topnav.jsp for more details.
  Note that the topnav script is included as .html so that it is flushed on the
  dispatcher on invalidation requests.

  ==============================================================================

--%><%@ page import="com.day.cq.commons.Doctype, com.day.cq.i18n.I18n, com.day.text.Text" %><%
%><%@include file="/libs/foundation/global.jsp" %><%
    I18n i18n = new I18n(slingRequest);

    int absLevel = 2;
    Page homePage = currentPage.getAbsoluteParent(absLevel);
    String home = homePage != null ? homePage.getPath() : Text.getAbsoluteParent(currentPage.getPath(), absLevel);
    String xs = Doctype.isXHTML(request) ? "/" : "";
    long hierMod = sling.getService(com.day.cq.wcm.foundation.HierarchyModificationListener.class).getLastModified(home);

%><div class="header">
    <div class="container_16">
        <div class="grid_8">
            <cq:include path="logo" resourceType="foundation/components/logo"/>
        </div>
        <div class="grid_8">
            <div class="search_area">
                <cq:include path="userinfo" resourceType="foundation/components/userinfo"/>
                <cq:include path="toptoolbar" resourceType="foundation/components/toolbar"/>
                <div class="clear"></div>
                <form action="<%= home %>/toolbar/search.html" method="get">
                    <fieldset>
                        <div class="input_box">
                            <label for="h-search-field" style="display: none;"><%= i18n.get("Enter your search query") %></label>
                            <input class="cq-auto-clear" type="text" value="<%= i18n.get("Enter Query") %>" name="q" <%= xs %> id="h-search-field">
                        </div>
                        <input type="button" onclick="this.form.submit();" class="btn" <%= xs %>>
                    </fieldset>
                </form>
            </div>
        </div>
        <script type="text/javascript" src="<%= home %>.topnav.<%= hierMod %>.html"></script>
        <%--<cq:include path="topnav" resourceType="geometrixx/components/topnav"/>--%>
    </div>
</div>
