/*
 ADOBE CONFIDENTIAL
 __________________

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

// Placeholder compatibility
jQuery(function ($) {

/* Will set a special class on document if it is narrower than 280px wide */

var win = $(window),
    main = $("#main"),
    isWCMEdit = false,
    isAuthor  = ("CQ" in window && "WCM" in CQ),
    CQTop     = isAuthor && CQ.WCM.getTopWindow().CQ,
    isNarrow = false;

function verifyPageWidth() {

    //todo: cancelled for demo
    return;

    var isNarrowNew = (main.width() < 280);

    if (isNarrowNew != isNarrow) {
        isNarrow = isNarrowNew;
        if (isNarrow) {
            document.documentElement.className += " narrow";
        } else {
            document.documentElement.className = document.documentElement.className.replace(" narrow", "");
        }
    }
}

verifyPageWidth();
win.resize(verifyPageWidth);
if (isAuthor) {
    CQTop.WCM.on("sidekickready", verifyPageWidth);
}
// TODO: also trigger function on device rotation



/* Will set the footer height, this is done so that the footer can allways be displayed at the bottom of the window, no matter how hight it is */

var footerOuter = $(".page-footer"),
    footerInner = footerOuter.children("footer");

function setFooterHeight() {
    footerOuter.height(footerInner.height());
}

setFooterHeight();
win.resize(setFooterHeight);
if (isAuthor) {
    CQTop.WCM.on("sidekickready", setFooterHeight);
}



/* Will animate the top right buttons to toggle the user nav and search box */

var topNav = $(".topnav ul").data("open", true),
    userNav      = $(".page-header .userinfo"),
    searchNav    = $(".page-header .search"),
    searchField  = searchNav.find(".search-field input"),
    userButton   = $(".nav-buttons a#nav-button-userinfo"),
    searchButton = $(".nav-buttons a#nav-button-search");

function openTopnav() {
    var openNav = $([]);
    if (userNav.data("open")) openNav = openNav.add(userNav);
    if (searchNav.data("open")) openNav = openNav.add(searchNav);

    openNav.data("open", false).slideUp(300, function () {
        topNav.data("open", true).slideDown();
        userButton.add(searchButton).removeClass("open");
    });
}

function openUser() {
    var openNav = $([]);
    if (topNav.data("open")) openNav = openNav.add(topNav);
    if (searchNav.data("open")) openNav = openNav.add(searchNav);

    openNav.data("open", false).slideUp(300, function () {
        userNav.data("open", true).slideDown();
        userButton.addClass("open");
        searchButton.removeClass("open");
    });
}

function openSearch() {
    var openNav = $([]);
    if (topNav.data("open")) openNav = openNav.add(topNav);
    if (userNav.data("open")) openNav = openNav.add(userNav);

    openNav.data("open", false).slideUp(300, function () {
        searchNav.data("open", true).slideDown();
        userButton.removeClass("open");
        searchButton.addClass("open");
        searchField.focus();
    });
}

userButton.click(function () {
    userNav.data("open") ? openTopnav() : openUser();
    return false;
});

searchButton.click(function () {
    searchNav.data("open") ? openTopnav() : openSearch();
    return false;
});

});
