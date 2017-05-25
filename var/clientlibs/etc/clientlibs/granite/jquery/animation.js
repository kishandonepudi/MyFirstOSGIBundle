/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */

(function ($, window, undefined) {

    var http;

    // namespacing
    window.Granite = window.Granite || {};
    window.Granite.$ = $;

    // for deprecated "shared" support (GRANITE-1602)
    window._g = window._g || {};
    window._g.$ = $;

    //grab Granite.HTTP
    http = Granite.HTTP;

    $.ajaxSetup({ // necessary global modifications for ajax calls 
        externalize: true,
        encodePath: true,
        hook: true,
        beforeSend: function (jqXHR, s) { // s: settings provided by the ajax call or default values
            if (typeof G_IS_HOOKED == "undefined" || !G_IS_HOOKED(s.url)) {
                if (s.externalize) { // add context to calls
                    s.url = http.externalize(s.url);
                }
                if (s.encodePath) {
                    s.url = http.encodePathOfURI(s.url);
                }
            }
            if (s.hook) { // portlet XHR hook
                var hook = http.getXhrHook(s.url, s.type, s.data);
                if (hook) {
                    s.url = hook.url;
                    if (hook.params) {
                        if (s.type.toUpperCase() == 'GET') {
                            s.url += '?' + $.param(hook.params);
                        } else {
                            s.data = $.param(hook.params);
                        }
                    }
                }
            }
        },
        statusCode: {
            403: function(jqXHR) {
                if (jqXHR.getResponseHeader("X-Reason") === "Authentication Failed") {
                    // login session expired: redirect to login page
                    http.handleLoginRedirect();
                }
            }
        }
    });

    $.ajaxSettings.traditional = true;
    
}(jQuery, this));
(function($, window, undefined) {
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel

    var lastTime = 0,
        running,
        animate = function (elem) {
            if (running) {
                window.requestAnimationFrame(animate, elem);
                $.fx.tick();
            }
        },
        vendors = ['ms', 'moz', 'webkit', 'o'];

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(fn, element) {
            var currTime = new Date().getTime(),
                delta = currTime - lastTime,
                timeToCall = Math.max(0, 13 - delta);

            var id = window.setTimeout(function() {
                    fn(currTime + timeToCall);
                },
                timeToCall
            );

            lastTime = currTime + timeToCall;

            return id;
        };

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    $.fx.timer = function (timer) {
        if (timer() && $.timers.push(timer) && !running) {
            running = true;
            animate(timer.elem);
        }
    };

    $.fx.stop = function() {
        running = false;
    };

}(jQuery, this));
(function($) {
    var baseEasings = {};

    $.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
        baseEasings[ name ] = function( p ) {
            return Math.pow( p, i + 2 );
        };
    });

    $.extend( baseEasings, {
        Sine: function ( p ) {
            return 1 - Math.cos( p * Math.PI / 2 );
        },
        Circ: function ( p ) {
            return 1 - Math.sqrt( 1 - p * p );
        },
        Elastic: function( p ) {
            return p === 0 || p === 1 ? p :
                -Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
        },
        Back: function( p ) {
            return p * p * ( 3 * p - 2 );
        },
        Bounce: function ( p ) {
            var pow2,
                bounce = 4;

            while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
            return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
        }
    });

    $.each( baseEasings, function( name, easeIn ) {
        $.easing[ "easeIn" + name ] = easeIn;
        $.easing[ "easeOut" + name ] = function( p ) {
            return 1 - easeIn( 1 - p );
        };
        $.easing[ "easeInOut" + name ] = function( p ) {
            return p < .5 ?
                easeIn( p * 2 ) / 2 :
                easeIn( p * -2 + 2 ) / -2 + 1;
        };
    });

}(jQuery));
