<%@ page import="com.day.cq.i18n.I18n, java.util.Calendar" %>
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

  Default footer script.

  ==============================================================================

--%><%
%><%@include file="/libs/foundation/global.jsp" %><%
    I18n i18n = new I18n(slingRequest);
    int year = Calendar.getInstance().get(Calendar.YEAR);
%>
<div class="footer container_16">
    <div class="grid_6">
        <h3><%= i18n.get("&copy; {0} Geometrixx Inc.", null, String.valueOf(year)) %></h3>
        <cq:include path="toolbar" resourceType="foundation/components/toolbar"/>
    </div>
    <div class="grid_6">
        <h3><%= i18n.get("Geometrixx Newsletter") %></h3>
        <p><%= i18n.get("We would like to keep in touch with you. Sign up here to receive our monthly newsletter on the latest products and services from Geometrixx.") %></p>
        <div class="form_section">
            <form action="" method="post">
                <fieldset>
                    <div class="input_box1">
                        <label for="f-newsletter-subscription" style="display: none;"><%= i18n.get("Enter your email address") %></label>
                        <input class="cq-auto-clear" type="text" value="<%= i18n.get("Your Email Adress") %>" name="" id="f-newsletter-subscription"/>
                    </div>
                    <input type="button" value="" name="" class="sign_up"/>
                </fieldset>
            </form>
        </div>
    </div>
    <div class="grid_4">
        <h3><%= i18n.get("Follow us") %></h3>
        <ul>
            <li><a href="#"><img class="icon_facebook" src="/etc/designs/default/0.gif" alt=""/> <%= i18n.get("Let&rsquo;s get together on Facebook") %></a></li>
            <li><a href="#"><img class="icon_twitter" src="/etc/designs/default/0.gif" alt=""/> <%= i18n.get("Follow us on Twitter") %></a></li>
            <li><a href="/content/geometrixx_mobile/<%= currentPage.getLanguage(true) %>.html"><img class="icon_mobile" src="/etc/designs/default/0.gif" alt=""/> <%= i18n.get("We&rsquo;re mobile!") %></a></li>
        </ul>
    </div>
    <div class="clear"></div>
</div>
