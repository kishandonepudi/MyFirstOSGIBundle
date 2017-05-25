<%--
  Copyright 1997-2010 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Default head script of newsletter pages.

  Draws the HTML head with some default content:
  - initialization of the WCM
  - sets the HTML title

  ==============================================================================

--%><%@include file="/libs/foundation/global.jsp" %><%
%><%@ page import="com.day.cq.commons.Doctype,
                   com.day.cq.wcm.api.WCMMode,org.apache.commons.lang3.StringEscapeUtils" %><%
    String xs = Doctype.isXHTML(request) ? "/" : "";
%><head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8"<%=xs%>>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="keywords" content="<%= WCMUtils.getKeywords(currentPage) %>"<%=xs%>>
    <title><%= currentPage.getTitle() == null ? StringEscapeUtils.escapeHtml4(currentPage.getName()) : StringEscapeUtils.escapeHtml4(currentPage.getTitle()) %></title>
    <%
    if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
        %>
        <cq:include script="/libs/wcm/core/components/init/init.jsp"/>
        <cq:includeClientLib categories="cq.mcm,cq.mcm.newsletter.emulator"/>
        <sling:include path="<%= resource.getPath() %>" replaceSelectors="init" resourceType="mcm/components/newsletter/emailclient/base"/>
        <%
    }
%><cq:include path="clickstreamcloud" resourceType="cq/personalization/components/clientcontext"/>

    <style type="text/css">
		/* Based on The MailChimp Reset INLINE: Yes. */
		/* Client-specific Styles */
		#outlook a {padding:0;} /* Force Outlook to provide a "view in browser" menu link. */
		body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}
		/* Prevent Webkit and Windows Mobile platforms from changing default font sizes.*/
		.ExternalClass {width:100%;} /* Force Hotmail to display emails at full width */
		.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
		/* Forces Hotmail to display normal line spacing.  More on that: http://www.emailonacid.com/forum/viewthread/43/ */
		#backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important; background-color: #292826;}
		/* End reset */

		/* Some sensible defaults for images
		Bring inline: Yes. */
		img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}
		a img {border:none;}
		.image_fix {display:block;}

		/* Yahoo paragraph fix
		Bring inline: Yes. */
		p {margin: 1em 0;}

		/* Hotmail header color reset
		Bring inline: Yes. */
		h1, h2, h3, h4, h5, h6 {color: black !important;}

		h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: blue !important;}

		h1 a:active, h2 a:active,  h3 a:active, h4 a:active, h5 a:active, h6 a:active {
		color: red !important; /* Preferably not the same color as the normal header link color.  There is limited support for psuedo classes in email clients, this was added just for good measure. */
		}

		h1 a:visited, h2 a:visited,  h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {
		color: purple !important; /* Preferably not the same color as the normal header link color. There is limited support for psuedo classes in email clients, this was added just for good measure. */
		}

		/* Outlook 07, 10 Padding issue fix
		Bring inline: No.*/
		table td {border-collapse: collapse;}

    /* Remove spacing around Outlook 07, 10 tables
    Bring inline: Yes */
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }

		/* Styling your links has become much simpler with the new Yahoo.  In fact, it falls in line with the main credo of styling in email and make sure to bring your styles inline.  Your link colors will be uniform across clients when brought inline.
		Bring inline: Yes. */
		a {color: #EE5A29;}


		/***************************************************
		****************************************************
		MOBILE TARGETING
		****************************************************
		***************************************************/
		@media only screen and (max-device-width: 480px) {
			/* Part one of controlling phone number linking for mobile. */
			a[href^="tel"], a[href^="sms"] {
						text-decoration: none;
						color: blue; /* or whatever your want */
						pointer-events: none;
						cursor: default;
					}

			.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
						text-decoration: default;
						color: orange !important;
						pointer-events: auto;
						cursor: default;
					}

		}

		/* More Specific Targeting */

		@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
		/* You guessed it, ipad (tablets, smaller screens, etc) */
			/* repeating for the ipad */
			a[href^="tel"], a[href^="sms"] {
						text-decoration: none;
						color: blue; /* or whatever your want */
						pointer-events: none;
						cursor: default;
					}

			.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
						text-decoration: default;
						color: orange !important;
						pointer-events: auto;
						cursor: default;
					}
		}

		@media only screen and (-webkit-min-device-pixel-ratio: 2) {
		/* Put your iPhone 4g styles in here */
		}

		/* Android targeting */
		@media only screen and (-webkit-device-pixel-ratio:.75){
		/* Put CSS for low density (ldpi) Android layouts in here */
		}
		@media only screen and (-webkit-device-pixel-ratio:1){
		/* Put CSS for medium density (mdpi) Android layouts in here */
		}
		@media only screen and (-webkit-device-pixel-ratio:1.5){
		/* Put CSS for high density (hdpi) Android layouts in here */
		}
		/* end Android targeting */





    /** col ctrl */


.bg {
    width: 1000px;
    margin-left: auto;
    margin-right: auto;
    background: white;
}

.container_16 {
    margin-left: auto;
    margin-right: auto;
    width: 960px;
}

.header {
    background: url(images/body_bg.gif) repeat-x 0 0 black;
    width: 960px;
    height: 149px;
    padding: 0 20px 0 20px;
}

.footer {
    width: 960px;
    margin-top: 20px;
    padding: 0 20px 20px 20px;
    clear: both;
    background: #f9f9f9 url(images/footer_bg.gif) repeat-x 0 0;
}


.alpha {
    margin-left: 0 !important;
}

.omega {
    margin-right: 0 !important;
}

.alpha_omega {
    margin-left: 0 !important;
    margin-right: 0 !important;
}

.grid_1, .grid_2, .grid_3, .grid_4, .grid_5, .grid_6, .grid_7, .grid_8, .grid_9, .grid_10, .grid_11, .grid_12, .grid_13, .grid_14, .grid_15, .grid_16 {
    display:inline;
    float: left;
    position: relative;
    margin-left: 10.0px;
    margin-right: 10.0px;
}

.container_16 .grid_1 { width: 40px; }
.container_16 .grid_2 { width: 100px; }
.container_16 .grid_3 { width: 160px; }
.container_16 .grid_4 { width: 220px; }
.container_16 .grid_5 { width: 280px; }
.container_16 .grid_6 { width: 340px; }
.container_16 .grid_7 { width: 400px; }
.container_16 .grid_8 { width: 460px; }
.container_16 .grid_9 { width: 520px; }
.container_16 .grid_10 { width: 580px; }
.container_16 .grid_11 { width: 640px; }
.container_16 .grid_12 { width: 700px; }
.container_16 .grid_13 { width: 760px; }
.container_16 .grid_14 { width: 820px; }
.container_16 .grid_15 { width: 880px; }
.container_16 .grid_16 { width: 940px; }
.container_16 .prefix_1 { padding-left: 60px; }
.container_16 .prefix_2 { padding-left: 120px; }
.container_16 .prefix_3 { padding-left: 180px; }
.container_16 .prefix_4 { padding-left: 240px; }
.container_16 .prefix_5 { padding-left: 300px; }
.container_16 .prefix_6 { padding-left: 360px; }
.container_16 .prefix_7 { padding-left: 420px; }
.container_16 .prefix_8 { padding-left: 480px; }
.container_16 .prefix_9 { padding-left: 540px; }
.container_16 .prefix_10 { padding-left: 600px; }
.container_16 .prefix_11 { padding-left: 660px; }
.container_16 .prefix_12 { padding-left: 720px; }
.container_16 .prefix_13 { padding-left: 780px; }
.container_16 .prefix_14 { padding-left: 840px; }
.container_16 .prefix_15 { padding-left: 900px; }
.container_16 .prefix_16 { padding-left: 960px; }
.container_16 .suffix_1 { padding-right: 60px; }
.container_16 .suffix_2 { padding-right: 120px; }
.container_16 .suffix_3 { padding-right: 180px; }
.container_16 .suffix_4 { padding-right: 240px; }
.container_16 .suffix_5 { padding-right: 300px; }
.container_16 .suffix_6 { padding-right: 360px; }
.container_16 .suffix_7 { padding-right: 420px; }
.container_16 .suffix_8 { padding-right: 480px; }
.container_16 .suffix_9 { padding-right: 540px; }
.container_16 .suffix_10 { padding-right: 600px; }
.container_16 .suffix_11 { padding-right: 660px; }
.container_16 .suffix_12 { padding-right: 720px; }
.container_16 .suffix_13 { padding-right: 780px; }
.container_16 .suffix_14 { padding-right: 840px; }
.container_16 .suffix_15 { padding-right: 900px; }
.container_16 .suffix_16 { padding-right: 960px; }
.container_16 .push_1 { left: 60px; }
.container_16 .push_2 { left: 120px; }
.container_16 .push_3 { left: 180px; }
.container_16 .push_4 { left: 240px; }
.container_16 .push_5 { left: 300px; }
.container_16 .push_6 { left: 360px; }
.container_16 .push_7 { left: 420px; }
.container_16 .push_8 { left: 480px; }
.container_16 .push_9 { left: 540px; }
.container_16 .push_10 { left: 600px; }
.container_16 .push_11 { left: 660px; }
.container_16 .push_12 { left: 720px; }
.container_16 .push_13 { left: 780px; }
.container_16 .push_14 { left: 840px; }
.container_16 .push_15 { left: 900px; }
.container_16 .push_16 { left: 960px; }
.container_16 .pull_1 { right: 60px; }
.container_16 .pull_2 { right: 120px; }
.container_16 .pull_3 { right: 180px; }
.container_16 .pull_4 { right: 240px; }
.container_16 .pull_5 { right: 300px; }
.container_16 .pull_6 { right: 360px; }
.container_16 .pull_7 { right: 420px; }
.container_16 .pull_8 { right: 480px; }
.container_16 .pull_9 { right: 540px; }
.container_16 .pull_10 { right: 600px; }
.container_16 .pull_11 { right: 660px; }
.container_16 .pull_12 { right: 720px; }
.container_16 .pull_13 { right: 780px; }
.container_16 .pull_14 { right: 840px; }
.container_16 .pull_15 { right: 900px; }
.container_16 .pull_16 { right: 960px; }



    /* spacers */
div.section.spacer_before {
    padding-top: 8px;
    margin-top: 12px;
}
div.section.spacer_after {
    margin-bottom: 20px;
}
div.section.spacer_both {
    padding-top: 8px;
    margin-bottom: 20px;
    margin-top: 12px;
}

p {
    display: block;
    font-size: 13px;
    line-height: 16px;
    color: #666;
}

p.cq-redirect-notice {
    margin: 20px 0 20px 0;
    border: 1px solid #dddddd;
    text-align: center;
    padding: 40px;
}

    /* text component */
div.text p {
    padding-bottom: 10px;
}
div.text {
    color: #666;
}

p.link {
    color: #006699 !important;
}

p.link a {
    text-decoration: none;
    color: #006699 !important;
}

p.link a:hover {
    text-decoration: underline;
}

div.text.text_large p {
    font-size: 15px;
    line-height: 19px;
    font-family: "Lucida Grande","Lucida Sans Unicode", Arial, Helvetica, sans-serif;
}

div.text.text_quote p {
    font-style: italic;
}
div.text.text_quote {
    background-color: #e9ecec;
}


    /* homepage rightpar */
.homepage .rightpar {
    margin-top: 9px;
}



    /* teaser component */
img.teaser {
    float:left;
    padding:1px;
    border:1px solid white;
    margin:5px 7px 0 0
}

    /* parsys component */
div.par, div.rightpar {
    clear: both;
}
div.parsys_column {
    height: 100%;
    width: 100%;
    float: left;
    border: 0;
    vertical-align:top;
    padding: 0;
    margin: 0;
}

div.section {
    /* Property added to avoid IE hasLayout issue on paragraphs
       see #20817 - IE6: div around Drag Components image not big enough
    */
    zoom: 1;
}

div.parsys_column .section {
    overflow:hidden;
    width: 100%;
}

    /* column control layouts */
div.cq-colctrl-cols {width: 100%; float: left; }

div.cq-colctrl-default { width: 100%;}

    /* layout 0 : 50% 50% ( grid6 + grid6 ) */
div.cq-colctrl-lt0 { }
div.cq-colctrl-lt0-c0 { width: 330px; margin-right:10px}
div.cq-colctrl-lt0-c1 { width: 330px; margin-left: 10px}

    /* layout 1 : 33% 33% 33%( grid4 + grid4 + grid4 ) */
div.cq-colctrl-lt1 { }
div.cq-colctrl-lt1-c0 { width: 220px; margin-right: 10px;}
div.cq-colctrl-lt1-c1 { width: 220px; margin-left: 10px; margin-right: 10px;}
div.cq-colctrl-lt1-c2 { width: 220px; margin-left: 10px; }

    /* layout 2: 16% 16% 16% 33% ( grid2.6 + grid2.6 + grid2.6 + grid4 ) */
div.cq-colctrl-lt2 { }
div.cq-colctrl-lt2-c0 { width: 140px; margin-right: 10px;}
div.cq-colctrl-lt2-c1 { width: 140px; margin-left: 10px; margin-right: 10px}
div.cq-colctrl-lt2-c2 { width: 140px; margin-left: 10px; margin-right: 10px}
div.cq-colctrl-lt2-c3 { width: 220px; margin-left: 10px }

    /* layout 3: 4 x 25% ( grid3 + grid3 + grid3 + grid3 ) */
div.cq-colctrl-lt3 { }
div.cq-colctrl-lt3-c0 { width: 160px; margin-right: 10px;}
div.cq-colctrl-lt3-c1 { width: 160px; margin-left: 10px; margin-right: 10px;}
div.cq-colctrl-lt3-c2 { width: 160px; margin-left: 10px; margin-right: 10px;}
div.cq-colctrl-lt3-c3 { width: 160px; margin-left: 10px; }

    /* layout 4: 5 x 20% ( grid2.5 + grid2.5 + grid2.5 + grid2.5 + grid2.5 ) */
div.cq-colctrl-lt4 { }
div.cq-colctrl-lt4-c0 { width: 124px; margin-right: 10px;}
div.cq-colctrl-lt4-c1 { width: 124px; margin-left: 10px; margin-right: 10px;}
div.cq-colctrl-lt4-c2 { width: 124px; margin-left: 10px; margin-right: 10px;}
div.cq-colctrl-lt4-c3 { width: 124px; margin-left: 10px; margin-right: 10px;}
div.cq-colctrl-lt4-c4 { width: 124px; margin-left: 10px; }

    /* widepage layouts */

    /* layout 5 : 50% 50% ( grid8 + grid8 ) */
div.cq-colctrl-lt5 { }
div.cq-colctrl-lt5-c0 { width: 460px; margin-right:10px}
div.cq-colctrl-lt5-c1 { width: 460px; margin-left: 10px}

    /* layout 6 : 25% 25% ( grid4 + grid4 + grid4 + grid4) */
div.cq-colctrl-lt6 { }
div.cq-colctrl-lt6-c0 { width: 220px; margin-right:10px}
div.cq-colctrl-lt6-c1 { width: 220px; margin-left: 10px; margin-right:10px}
div.cq-colctrl-lt6-c2 { width: 220px; margin-left: 10px; margin-right:10px}
div.cq-colctrl-lt6-c3 { width: 220px; margin-left: 10px}


    /* text component */
div.text ul li {
    background:url("images/gl.gif") repeat-x scroll center bottom transparent;
    list-style-image:url("images/bullet.gif");
    list-style-position:outside;
    margin-left:28px;
    margin-top:2px;
    padding-bottom:4px;
}

div.text ol li {
    background:url("images/gl.gif") repeat-x scroll center bottom transparent;
    list-style-position:outside;
    margin-left:28px;
    margin-top:2px;
    padding-bottom:4px;
}

div.text li a {
}



    /** End of Col Ctrl***/

	</style>


</head>
