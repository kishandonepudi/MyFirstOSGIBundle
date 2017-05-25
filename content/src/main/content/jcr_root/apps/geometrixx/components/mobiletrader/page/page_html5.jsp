<%@ page session="false"
         import="
            com.day.cq.wcm.api.WCMMode,
            java.util.Iterator,
            com.day.cq.wcm.api.PageFilter,
            com.day.cq.commons.Doctype" %><%
%><%@include file="/libs/foundation/global.jsp" %><%
    WCMMode.DISABLED.toRequest(request);
    Doctype.HTML_5.toRequest(request);
    String favIcon = currentDesign.getPath() + "/favicon.ico";
    if (resourceResolver.getResource(favIcon) == null) {
        favIcon = null;
    }
    String webclipIcon = currentDesign.getPath() + "/webclip.png";
    if (resourceResolver.getResource(webclipIcon) == null) {
        webclipIcon = null;
    }
    String webclipIconPre = currentDesign.getPath() + "/webclip-precomposed.png";
    if (resourceResolver.getResource(webclipIconPre) == null) {
        webclipIconPre = null;
    }
    String mf = "";
    Page rootPage = currentPage.getAbsoluteParent(3);
    if (rootPage != null) {
        mf = "manifest=\"" + rootPage.getPath() + "/_jcr_content.mf/cache.manifest\"";
    }
    
%><!DOCTYPE html>
<html <%= mf %>>
	<head>
	<title><%= currentPage.getTitle() %></title>

    <meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, width=device-width">
    <% if (favIcon != null) { %>
    <link rel="icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>" />
    <link rel="shortcut icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>"/>
    <% } %>
    <% if (webclipIcon != null) { %>
    <link rel="apple-touch-icon" href="<%= webclipIcon %>"/>
    <% } %>
    <% if (webclipIconPre != null) { %>
    <link rel="apple-touch-icon-precomposed" href="<%= webclipIconPre %>"/>
    <% } %>

	<link rel="stylesheet" href="/etc/designs/geometrixx_mobile/trader/jqm/jquery.mobile-1.0b2.css" />
	<script type="text/javascript" src="/etc/designs/geometrixx_mobile/trader/jqm/jquery-1.6.2.js"></script>
	<script type="text/javascript" src="/etc/designs/geometrixx_mobile/trader/jqm/jquery.mobile-1.0b2.js"></script>
    <link rel="stylesheet" href="/etc/designs/geometrixx_mobile/trader/static.css"/>
        <script>
            $('.trader_page').live('pageshow', function(event){
                if (navigator.onLine) {
                    $('.navigator-status').addClass("online");
                } else {
                    $('.navigator-status').removeClass('online');
                }
            });
            $('#main_screen').live('pageshow', function(event){
                var hasHome = 'standalone' in navigator && navigator.standalone;
                if (!hasHome) {
                    $('#add_to_home').css('visibility','visible').hide().fadeIn('slow');
                } else {
                    $.mobile.changePage($('.trader_page:first'));
                }
            });
    </script>
    </head>
<body>

<%
    // we include all pages here for faster performance
if (rootPage != null) {
    Iterator<Page> children = rootPage.listChildren(new PageFilter(request));
    boolean isFirst = true;
    while (children.hasNext()) {
        Page child = children.next();
        if (isFirst) {
            isFirst = false;
            %>
            <div id="main_screen" data-role="page">
                <div class="gx_logo">
                    <a href="#<%= child.getName() %>" data-transition="flip">
                        <img src="/etc/designs/geometrixx_mobile/trader/images/gx_icon.png"/>
                    </a>
                </div>
                <div id="add_to_home" style="position:absolute;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);">
                    Click "Add to Home Screen" to Install App
                    <span class="arrow"></span>
                </div>
            </div>
            <%
        }
        %>
        <div id="<%= child.getName()%>" data-role="page" class="trader_page" data-title="Mobile Trader - <%= child.getTitle() %>">
            <div data-role="header" data-id="foo2" data-position="fixed">
                <div class="topbar" data-role="navbar" >
                    <span class="navigator-status ui-btn-right"></span>
                </div>
            </div>
            <div data-role="content">
                <cq:include path="<%= child.getPath() + "/jcr:content/par" %>" resourceType="foundation/components/parsys"/>
            </div>
            <div data-role="footer" data-id="foo1" data-position="fixed">
                <div data-role="navbar">
                    <ul>
                    <%
                        Iterator<Page> nIter = rootPage.listChildren(new PageFilter(request));
                        String dir="data-direction=\"reverse\"";
                        while (nIter.hasNext()) {
                            Page nChild = nIter.next();
                            String icon="html.png";
                            String cls="";
                            if (child.getPath().equals(nChild.getPath())) {
                                //cls="ui-btn-active ui-state-persist";
                                dir="";
                            }
                            if (nChild.getName().startsWith("assets")) icon="assets.png";
                            if (nChild.getName().startsWith("alerts")) icon="alerts.png";
                            if (nChild.getName().startsWith("advisor")) icon="advisor.png";
                            if (nChild.getName().startsWith("watch")) icon="watch.png";
                            %><li><a class="<%= cls %>" <%= dir %>
                                     href="#<%= nChild.getName()%>"
                                    data-transition="slide"><img src="/etc/designs/geometrixx_mobile/trader/images/<%= icon %>"><br><%= nChild.getTitle() %></a></li><%
                        }
                    %>
                    </ul>
                </div>
            </div>
        </div>
        <%
    }
}
%>
</body>
</html>