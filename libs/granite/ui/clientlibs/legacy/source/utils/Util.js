/*
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */


/**
 * A helper class providing a set of utilities.
 * @static
 * @singleton
 * @class _g.ui.Util
 */

_g.ui.Util = new function() {

    return {

        post: function( form, success ) {
            //_g.$.mobile.showPageLoadingMsg();
            _g.$.ajax({
                url: _g.HTTP.externalize( form.getAttribute("href") ),
                type: "post",
                data: _g.$(form).serialize(),
                success: success,
                error: function(html) {
                    //_g.$.mobile.showPageLoadingMsg();
                    _g.$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>"+ _g.$.mobile.pageLoadErrorMessage +"</h1></div>")
                        .css({ "display": "block", "opacity": 0.96, "top": _g.$(window).scrollTop() + 100 })
                        .appendTo( _g.$.mobile.pageContainer )
                        .delay( 1000 )
                        .fadeOut( 1500, function(){
                            _g.$(this).remove();
                        });
                }
            });
            return false;
        },

        /**
         * Encodes the specified string and returns a legal HTML id. Invalid
         * characters and the colon (which is used as escape character) will be
         * replaced by "colon + charCode".
         * @static
         * @param str {String} The string to encode
         * @return {String} The encoded string
         */

        encodeId: function(str) {
            // disabled some characters for jplayground and changed escape character from ":" to "."
            if (!str) return "";
            var encStr = "";
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                if (
                    c == 45 || // hyphen ("-")
                    //c == 46 || // period (".")
                    c == 95 || // underscore ("_")
                    c >= 97 && c <= 122 || // a-z
                    c >= 65 && c <= 90 || // A-Z
                    c >= 48 && c <= 57) { // 0-9

                    encStr += str.charAt(i);
                    }
                else {
                    // encode invalid characters and the escape character ("-")
                    encStr += "-" + str.charCodeAt(i);
                }
            }
            return encStr;
        },


        jsonToString: function(obj) {
            var ret = [];

            if( _g.$.isArray(obj)) {
                var first = true;
                ret.push("[");
                for(var i = 0; i < obj.length; i++) {
                    if( !first ) {
                        ret.push(",");
                    }
                    ret.push(_g.ui.Util.jsonToString(obj[i]));
                    first = false;
                }
                ret.push("]");
            } else {
                var value = function(v) {
                    return ["\"",v,"\""].join("");
                };
                var key = function(k) {
                    return [value(k),":"].join("");
                };

                var first = true;
                ret.push("{");
                for(var p in obj) {
                    if( !first ) {
                        ret.push(",");
                    }
                    if( typeof(obj[p]) == "object") {
                        //obj
                        ret.push(key(p));
                        ret.push(_g.ui.Util.jsonToString(obj[p]));
                    } else {
                        //string
                        ret.push(key(p));
                        ret.push(value(obj[p]));
                    }
                    first = false;
                }
                ret.push("}");
            }

            return ret.join("");
        }
    };

};
