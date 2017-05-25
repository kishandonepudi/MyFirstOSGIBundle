/*
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */

_g.$(document).bind("mobileinit", function() {
	_g.$.mobile.pushStateEnabled = false;
	
    _g.$.mobile.page.prototype.options.backBtnText		= "Back";
    _g.$.mobile.page.prototype.options.addBackBtn		= false;
    _g.$.mobile.page.prototype.options.backBtnTheme	= null;
    _g.$.mobile.page.prototype.options.headerTheme		= "d";
    _g.$.mobile.page.prototype.options.footerTheme		= "a";
    _g.$.mobile.page.prototype.options.contentTheme	= "d";
    _g.$.mobile.page.prototype.options.theme	        = "d";

    //$.loadingMessage = "Loading...";
    //$.pageLoadErrorMessage = "Error Loading Page"
});



