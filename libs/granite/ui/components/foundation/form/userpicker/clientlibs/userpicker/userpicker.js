/*
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
*/
(function(document, $) {
    "use strict";
    
    
    var UserPicker = function (element, currentPath, impersonatesOnly){
        this.currentPath = currentPath;
        this.impersonatesOnly = impersonatesOnly;
        element.filters({
            autocompleteCallback: this.autocompleteCallback.bind(this),
            optionRenderer: this.optionRenderer.bind(this)
        });
    };
    
    UserPicker.prototype.autocompleteCallback = function (handler, searchFor) {            
        this.lastSearch = searchFor;
        
        jQuery.getJSON(this.currentPath, {
            "search": searchFor,
            "impersonatesOnly": (this.impersonatesOnly) ? "1" : "0",
        }, function(data) {            

            // Add toString-method to result
            for(var i = 0; i < data.length; i++) {
                data[i].toString = function() {return this.id;};
            }
            handler(data);
        });
    }
            
    UserPicker.prototype.optionRenderer = function (index, user, highlight, showIcon) {
        if (typeof user == "string") {
            var element = $("<span>");
            element.text(user);
            return element;
        }
        
        var givenName = user.givenName || "";
        var familyName = user.familyName || "";
        var email = user.email || "";
        var name = givenName + ((givenName || familyName) ? " " : "") + familyName;
        
        // Encode to html
        name = ($('<div/>').text(name).html());
        if (email) name += "<br>&lt;" + ($('<div/>').text(email).html()) + "&gt;";
        
        if (!(givenName || familyName || email)) name = ($('<div/>').text(user.id).html()); // Fallback to id

        if (highlight && this.lastSearch) {
            var w = ($('<div/>').text(this.lastSearch).html()).split(" ");
            for(var i = 0; i < w.length; i++) {
                if (!w[i]) continue;
                var p = name.toLowerCase().indexOf(w[i].toLowerCase());
                if (p < 0) continue;
                name = name.substr(0, p) + "<em>" + name.substr(p, w[i].length) + "</em>" + name.substr(p + w[i].length);
            }
        }
        
        
        var avatar = "";
        //if (showIcon) {
            var size = "large";
            avatar = (user.avatarURL) ? ('<i class="' + size + ' icon-inline-bg-image avatar" style="background-image: url(' +
                                             ($('<div/>').text(Granite.HTTP.externalize(user.avatarURL)).html()) + ')"></i>') : '';
        //}
        
        var element = $("<span class=\"user-entry\">" + avatar + name + "</span>");
        
        return element;
    }

    $(document).on("foundation-contentloaded", function(event) {    
        var document = event.target;
        
        $(document).find(".granite-userpicker").each(function() {            
            var currentPath = $(this).data("userpicker-path");
            var i = $(this).data("userpicker-impersonates-only");
            var impersonatesOnly = (i != undefined && i != "false" && i != "0" && i != "");
            new UserPicker($(this), currentPath + ".json", impersonatesOnly);
                
        });
    });
    
})(document, Granite.$ || jQuery); // Fallback to normal jQuery if Granite one is not available