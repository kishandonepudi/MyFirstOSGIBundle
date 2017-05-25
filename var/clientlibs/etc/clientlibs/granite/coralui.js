/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function (window, $, undefined) {

    // ========================= smartresize ===============================

    /*
     * smartresize: debounced resize event for jQuery
     *
     * latest version and complete README available on Github:
     * https://github.com/louisremi/jquery.smartresize.js
     *
     * Copyright 2011 @louis_remi
     * Licensed under the MIT license.
     */

    var $event = $.event,
            resizeTimeout;

    $event.special.smartresize = {
        setup:function () {
            $(this).bind("resize", $event.special.smartresize.handler);
        },
        teardown:function () {
            $(this).unbind("resize", $event.special.smartresize.handler);
        },
        handler:function (event, execAsap) {
            // Save the context
            var context = this,
                    args = arguments;

            // set correct event type
            event.type = "smartresize";

            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(function () {
                jQuery.event.handle.apply(context, args);
            }, execAsap === "execAsap" ? 0 : 10);
        }
    };

    $.fn.smartresize = function (fn) {
        return fn ? this.bind("smartresize", fn) : this.trigger("smartresize", ["execAsap"]);
    };

    // constructor
    $.CUIGridLayout = function (options, element, callback) {
        this.element = $(element);
        this._create(options);
        this._init(callback);
    };

    var $window = $(window);

    $.CUIGridLayout.settings = {
        colWidth: 240,
        gutterX: 15,
        gutterY: 15,
        marginLeft:0,
        marginRight:0,
        selector:"article"
//        itemClass:"macboard-card"
    };

    // TODO layout only takes image sizes into account; may fail when cards have differing "legends"

    $.CUIGridLayout.prototype = {

        option:function(options) {
            this.options = $.extend({}, $.CUIGridLayout.settings, options);
        },

        // sets up widget
        _create:function (options) {
            
            this.options = $.extend({}, $.CUIGridLayout.settings, options);

            this.items = [];

            this.itemsByPath = {};

            this.numCols = -1;

            this.pendingImages = 0;

            this.update();

            
            // bind resize method
            var self = this;
            $window.bind('smartresize.cui.gridlayout', function () {
                self.updateDimensions();
                self.layout();
            });

        },

        _init:function (callback) {
            this.updateDimensions();
            this.layout(callback);

            // Give browser a chance to lay out elements and calculate layout a second time after
            // all CSS is applied correctly by the browser. Without this second, timed calculation is sometimes wrong due
            // to race conditions with the rendering engine of the browser.
            setTimeout(function() {
                this.numCols = -1;
                this.updateDimensions();
                this.layout(callback);

                this.element.trigger($.Event("cui-gridlayout-initialized", {
                    "widget": this
                }));
            }.bind(this), 1); 
        },

        update:function () {
            var self = this;
            this.items = [];
            this.itemsByPath = {};
            this.element.find(self.options.selector).each(function (i) {
                var $card = $(this);
                var $img = $("img", $card);
                if ($img.length == 0) {
                    $img = null;
                }
                var item = {
                    path: $card.data().path,
                    i:i,
                    $el:$card,
                    $img:$img
                };
                self.items.push(item);
                self.itemsByPath[item.path] = item;
            });
        },

        _imageLoaded: function() {

            if (--this.pendingImages == 0) {
//                console.log("all images loaded");
                // force relayout
                this.numCols = -1;
                this.layout();
            }

        },
        updateDimensions: function() {
            var self = this;
            this.items.every(function (i) {
                var $el = i.$el;

                i.w = $el.width();
                i.h = $el.height();

                // check if card has an image and if it's loaded
                if (i.$img) {
                    // Hack: Recalculate element size if browser has wrong values. This sometimes occurs with loaded
                    // images when the elements are not yet displayed on screen.
                    if (i.$img.width() > i.w) {
                        i.h = (i.h - i.$img.height()) + (i.$img.height() / i.$img.width() * i.w);
                    }

                    if (i.$img.height() == 0) {
                        // just assume 1:1 for now
                        i.h += i.w;
                        self.pendingImages++;
                        i.$img.on("load.cui.gridlayout", function() {
                            i.$img = null;
                            i.w = $el.width(); // Set width AND height to ensure proper ratio
                            i.h = $el.height();
                            
//                            console.log("image loaded.", i);
                            self._imageLoaded();
                        })
                    } else {
                        // we don't need to know this info anymore
                        i.$img = null;
                    }
                }

                // debug
//                $("h4", i.$el).html("Card Nr " + i.i + " (" + i.w + "x" + i.h + ")");

                return true;
            });

        },

        layout:function () {
            var self = this;
            var $this = this.element;
            var colWidth = this.options.colWidth;
            var marginLeft = this.options.marginLeft;
            var marginRight = this.options.marginRight;
            var gx = this.options.gutterX;

            // calculate # columns:
            // containerWidth = marginLeft + (colWidth + gx) * n - gx + marginRight;
            // use: "round" for avg width, "floor" for minimal width, "ceil" for maximal width
            var n = Math.floor(($this.width() - marginLeft - marginRight + gx) / (colWidth + gx));

            if (n < 1) n = 1; // Minimum 1 column!

            if (n == this.numCols) {
                // nothing to do. CSS takes care of the scaling
                return;
            }
            
            this.numCols = n;

            // calculate actual column width:
            // containerWidth = marginLeft + (cw + gx) * n - gx + marginRight;
            var cw =  (($this.width() - marginLeft - marginRight + gx) / n) - gx;

            // initialize columns
            var cols = [];
            var colHeights = [];
            while (cols.length < n) {
                cols.push([]);
                colHeights.push(0);
            }

            this.items.every(function (i) {
                // determine height of card, based on the ratio
                var height = (i.h / i.w) * cw;
                
                // find lowest column
                var min = colHeights[0];
                var best = 0;
                for (var c = 0; c < colHeights.length; c++) {
                    var h = colHeights[c];
                    if (h < min) {
                        min = h;
                        best = c;
                    }
                }

                // update columns and heights array
                cols[best].push(i);
                colHeights[best] += height + self.options.gutterY;
                return true;
            });

            // detach all the cards first
            $this.detach(this.options.selector);

            // remember old columns. because otherwise the
            // event handlers bound on the cards would be removed
            var $cols = $this.contents();

            // now fill up all the columns
            for (var c=0; c<cols.length; c++) {
                var $col = $('<div class="grid-'+n+'"></div>').appendTo($this);
                for (var j=0; j<cols[c].length; j++) {
                    $col.append(cols[c][j].$el);
                }
            }

            // remove old columns
            $cols.remove();
        },

        destroy: function() {
            $window.unbind("smartresize.cui.gridlayout");
            this.element.removeData("cuigridlayout");
        }
    };

    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    // plugin bridge
    $.fn.cuigridlayout = function (options, callback) {
        if (typeof options === 'string') {
            // call method
            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {
                var instance = $.data(this, 'cuigridlayout');
                if (!instance) {
                    logError("cannot call methods on cuigridlayout prior to initialization; " +
                            "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for cuigridlayout instance");
                    return;
                }
                // apply method
                instance[ options ].apply(instance, args);
            });
        } else {
            this.each(function () {
                var instance = $.data(this, 'cuigridlayout');
                if (instance) {
                    // apply options & init
                    instance.option(options);
                    instance._init(callback);
                } else {
                    // initialize new instance
                    $.data(this, 'cuigridlayout', new $.CUIGridLayout(options, this, callback));
                }
            });
        }
        // return jQuery object
        // so plugin methods do not have to
        return this;
    };
})(window, jQuery);
/*
 * Fingerpointer jQuery plugin
 * version 1.1
 * author: Damien Antipa
 * http://github.com/dantipa/jquery.fingerpointer
 */
(function ($, window, undefined) {
    var isTouch = 'ontouchstart' in window;

    $.fn.finger = function () {
        if (isTouch) {
            this.on.apply(this, arguments);
        }
        return this;
    };

    $.fn.pointer = function () {
        if (!isTouch) {
            this.on.apply(this, arguments);
        }
        return this;
    };

    $.fn.fipo = function () {
        var args = Array.prototype.slice.call(arguments, 1, arguments.length);

        this.pointer.apply(this, args);

        args[0] = arguments[0];
        this.finger.apply(this, args);

        return this;
    };
}(jQuery, this));
/*!
 * jQuery :scrollable selector filter
 * https://github.com/litera/jquery-scrollintoview/blob/master/jquery.scrollintoview.js#L172
 *
 * Version 1.8 (14 Jul 2011)
 * Requires jQuery 1.4 or newer
 *
 * Copyright (c) 2011 Robert Koritnik
 * Licensed under the terms of the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(document, $) {
    "use strict";

    var converter = {
        vertical: { x: false, y: true },
        horizontal: { x: true, y: false },
        both: { x: true, y: true },
        x: { x: true, y: false },
        y: { x: false, y: true }
    };

    var rootrx = /^(?:html)$/i;

    var scrollValue = {
        auto: true,
        scroll: true,
        visible: false,
        hidden: false
    };

    $.extend($.expr[":"], {
        scrollable: function (element, index, meta, stack) {
            var direction = converter[typeof (meta[3]) === "string" && meta[3].toLowerCase()] || converter.both;
            var styles = (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(element, null) : element.currentStyle);
            var overflow = {
                x: scrollValue[styles.overflowX.toLowerCase()] || false,
                y: scrollValue[styles.overflowY.toLowerCase()] || false,
                isRoot: rootrx.test(element.nodeName)
            };

            // check if completely unscrollable (exclude HTML element because it's special)
            if (!overflow.x && !overflow.y && !overflow.isRoot)
            {
                return false;
            }

            var size = {
                height: {
                    scroll: element.scrollHeight,
                    client: element.clientHeight
                },
                width: {
                    scroll: element.scrollWidth,
                    client: element.clientWidth
                },
                // check overflow.x/y because iPad (and possibly other tablets) don't dislay scrollbars
                scrollableX: function () {
                    return (overflow.x || overflow.isRoot) && this.width.scroll > this.width.client;
                },
                scrollableY: function () {
                    return (overflow.y || overflow.isRoot) && this.height.scroll > this.height.client;
                }
            };
            return direction.y && size.scrollableY() || direction.x && size.scrollableX();
        }
    });
})(document, jQuery);
/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

(function($, window, undefined) {

    var defaults = {
        "threshold": 200, // How often the resize and reflow events should be considered
        "applyClassToElement": undefined
    };

    // Utility functions to help calculating sizes
    var size = {
        "rem": function () {
            // This caches the rem value to calculate it only once, but might lead to wrong results if the font size gets changed
            if (size._rem === undefined) {
                size._rem = parseInt($("body").css("font-size"));
            }
            return size._rem;
        },
        "em": function (elem) {
            return parseFloat(elem.css("font-size"));
        }
    };

    // Adds and removes classes to the given element depending on the result of the associated functions.
    // Can be called with or without parameters:
    // When a breakpoints object is provided, the reflow listener gets setup to the given element.
    // The options parameter is optional, it allows to change the default settings.
    // When no parameters are provided it triggers a reflow event on the provided object.
    $.fn.reflow = function reflow(breakpoints, options) {
        return this.each(function reflowEach() {
            var elem = $(this),
                didApplyClassNames = false,
                scheduledReflowCheck = false,
                settings;

            if (breakpoints) {
                settings = $.extend({}, defaults, options);
                settings.applyClassToElement = settings.applyClassToElement || elem;

                function reflowEventHandler() {
                    if (elem.is(":visible")) {
                        if (!scheduledReflowCheck) {
                            applyClassNames();
                            scheduledReflowCheck = setTimeout(function reflowCheck() {
                                scheduledReflowCheck = false;
                                if (!didApplyClassNames) {
                                    applyClassNames();
                                }
                            }, settings.threshold);
                        } else {
                            didApplyClassNames = false;
                        }
                    }
                }

                function applyClassNames() {
                    didApplyClassNames = true;
                    for (var className in breakpoints) {
                        settings.applyClassToElement.toggleClass(className, breakpoints[className](elem, size));
                    }
                }

                elem.on("reflow", reflowEventHandler);
                $(window).on("resize.reflow", reflowEventHandler);
            }

            elem.trigger("reflow");

        });
    }

}(jQuery, this));
(function($, window, undefined) {
/**
 * Utility
 * @type {Object}
 */
var util = {};

/**
 * tries to get the touches from a jQuery(!) touch event
 * @param event
 * @return {TouchEvent[]}
 */
util.getTouches = function (event) {
    return event.originalEvent.touches.length > 0 ?
        $.extend(true, {}, event.originalEvent.touches) :
        (event.originalEvent.changedTouches.length > 0 ?
            $.extend(true, {}, event.originalEvent.changedTouches) :
            []
            );
};

/**
 *
 * @param $target
 * @param {String} event event name which should be tested against $target
 * @return {Boolean}
 */
util.hasEvent = function ($target, event) {
   return $target.data('events') ? $target.data('events')[event] : 0;
};
var calc = {};

/**
 * angle to direction define, getDirectionFromAngle
 * @param  float    angle
 * @return string   direction
 */
calc.getDirection = function (angle)
{
   if (angle < -45 && angle > -135) {
       return 'top';
   } else if (angle >= -45 && angle <= 45) {
       return 'right';
   } else if (angle >= 45 && angle < 135) {
       return 'down';
   } else if (angle >= 135 || angle <= -135) {
       return 'left';
   }
};

/**
 * @param {Object} pos1
 * @param {Number} pos1.pageX
 * @param {Number} pos1.pageY
 * @param {Object} pos2
 * @param {Number} pos2.pageX
 * @param {Number} pos2.pageY
 * @return {Number} angle between pos1 and pos2
 */
calc.getAngle = function (pos1, pos2)
{
    return Math.atan2(pos2.pageY - pos1.pageY, pos2.pageX - pos1.pageX) * 180 / Math.PI;
};

/**
 * @param {Object[]} start must contain the position of two fingers
 * @param {Number} start[].pageX
 * @param {Number} start[].pageY
 * @param {Object[]} move must contain the position of two fingers
 * @param {Number} move[].pageX
 * @param {Number} move[].pageY
 * @return {Number} scale size between two fingers
 */
calc.getScale = function (start, move)
{
    if(start.length === 2 && move.length === 2) { // needs to have the position of two fingers
        return (Math.sqrt(Math.pow(move[0].pageX - move[1].pageX, 2) + Math.pow(move[0].pageY - move[1].pageY, 2)) / Math.sqrt(Math.pow(start[0].pageX - start[1].pageX, 2) + Math.pow(start[0].pageY - start[1].pageY, 2)));
    }

    return 0;
};

/**
 * @param {Object[]} start must contain the position of two fingers
 * @param {Number} start[].pageX
 * @param {Number} start[].pageY
 * @param {Object[]} move must contain the position of two fingers
 * @param {Number} move[].pageX
 * @param {Number} move[].pageY
 * @return {Number} rotation degrees between two fingers
 */
calc.getRotation = function (start, move)
{
    if(start.length === 2 && move.length === 2) {
        return ((Math.atan2(move[0].pageY - move[1].pageY, move[0].pageX - move[1].pageX) * 180 / Math.PI) - (Math.atan2(start[0].pageY - start[1].pageY, start[0].pageX - start[1].pageX) * 180 / Math.PI));
    }

    return 0;
};

/**
 * @param {TouchEvent} startTouch
 * @param {TouchEvent} moveTouch
 * @return {Number} maximum distance the finger moved
 */
calc.getDistance = function (startTouch, moveTouch)
{
    return Math.sqrt(Math.pow(moveTouch.pageX - startTouch.pageX, 2) + Math.pow(moveTouch.pageY - startTouch.pageY, 2));
};
/**
 * current state of the runnign gesture
 *
 * @type {Object}
 * @type {Object} touches touches contains the TouchList objects of touchstart, touchmove and touchend
 * @type {TouchList[]} touches.start
 * @type {TouchList[]} touches.move
 * @type {TouchList[]} touches.end
 * @type {Object} events contains the TouchEvents of the current gestures
 * @type {TouchEvent} events.start
 * @type {TouchEvent} events.move
 * @type {TouchEvent} events.end
 * @type {Number} timestamp the time when the gesture started (ontouchstart)
 * @type {Object} offset the document offset of the current event target
 * @type {Number} offset.top
 * @type {Number} offset.left
 */
var state = {
    touches: {},
    events: {},
    timestamp: undefined,

    prevGesture: null,

    offset: {}
};

/**
 * resets the gesture the inital values
 */
state.clearState = function () {
    state.touches = {};
    state.events = {};
    state.timestamp = undefined;
};
/**
 * Contains all registered gestures
 * @type {Object}
 * @type {Object[]) start
 * @type {Object[]) move
 * @type {Object[]) end
 */
var gestures = {
	start:[],
	move:[],
	end:[],
	none:[]
};

/**
 * Add new gesture
 *
 * @param {String} timing can be either 'start', 'move' or 'end' of the touch behavior
 * @param {String} gesture name of the gesture
 * @param {Function} func to be called at the given timing
 * @param {Number} priority if necessary for calling order or undefined
 */
gestures.add = function (timing, gesture, func, priority) {
	var i,
		tmp,
		inserted = false;

	if (priority) {
		for (i = 0; i < gestures[timing].length; i++) {
			tmp = gestures[timing][i];

			if (tmp.priority && tmp.priority < priority) {
				continue;
			}

			gestures[timing].splice(i, 0, {
				gesture:gesture,
				func:func,
				priority:undefined
			});
			inserted = true;
		}
	}

	if (!priority || !inserted) {
		gestures[timing].push({
			gesture:gesture,
			func:func,
			priority:undefined
		});
	}

	registerSpecialEvent(gesture);
};

/**
 * @private
 * @param timing
 * @param event
 */
gestures.exec = function (timing, event) {
	var i;

	for (i = 0; i < gestures[timing].length; i++) {
		gestures[timing][i].func(event);
	}
};
/*!
 * toe.js
 * version 1.2.1
 * author: Damien Antipa
 * https://github.com/dantipa/toe.js
 */
var isTouch = 'ontouchstart' in window,
    $proxyStart, $proxyMove, $proxyEnd;

/**
 *
 * @param {jQuery.Event} event
 */
function touchstart(event) {
    var $target = $(event.target);

    state.clearState();

    state.touches.start = util.getTouches(event);
    state.events.start = event;
    state.timestamp = new Date().getTime();

    state.events.start = event;

    state.offset = $target.offset();

    gestures.exec('start', event);
}

/**
 *
 * @param {jQuery.Event} event
 */
function touchmove(event) {
    if(!state.timestamp) {
        return;
    }

    state.touches.move = util.getTouches(event);
    state.events.move = event;

    gestures.exec('move', event);
}

/**
 *
 * @param {jQuery.Event} event
 */
function touchend(event) {
    if(!state.timestamp) {
        return;
    }

    state.touches.end = util.getTouches(event);
    state.events.end = event;

    gestures.exec('end', event);

    state.prevGesture = state.gesture;
    state.clearState();
}

$proxyStart = $.proxy(touchstart, this);
$proxyMove = $.proxy(touchmove, this);
$proxyEnd = $.proxy(touchend, this);

function eventSetup(data, namespaces, eventHandler) {
    var $this = $(this),
        toe = $this.data('toe') || 0;

    if (toe === 0) {
        $this.on('touchstart', $proxyStart);
        $this.on('touchmove', $proxyMove);
        $this.on('touchend touchcancel', $proxyEnd);
    }

    $this.data('toe', ++toe);
}

function eventTeardown(namespace) {
    var $this = $(this),
        toe = $this.data('toe') || 0;

    $this.data('toe', --toe);

    if (toe === 0) {
        $this.off('touchstart', $proxyStart);
        $this.off('touchmove', $proxyMove);
        $this.off('touchend touchcancel', $proxyEnd);
    }
}

function registerSpecialEvent(eventName) {
	if (isTouch) { // event binding will just work on touch devices
		$.event.special[eventName] = {
			setup: eventSetup,
			teardown: eventTeardown
		};
	}
}
(function (gestures, state, calc) {

    var config = {
            swipe_time: 300,
            swipe_min_distance: 30
        };

    /**
     *
     * @param {jQuery.Event} event
        */
    function swipe(event)
    {
        var duration = new Date().getTime() - state.timestamp,
            angle,
            direction,
            distance;

        if(!state.touches.move) {
            return;
        }

        distance = calc.getDistance(state.touches.start[0], state.touches.move[0]);
        if((config.swipe_time > duration) && (distance > config.swipe_min_distance)) {

            angle = calc.getAngle(state.touches.start[0], state.touches.move[0]);
            direction = calc.getDirection(angle);

            state.gesture = 'swipe';
            $(event.target).trigger($.Event('swipe', {
                originalEvent   : event.originalEvent,
                direction       : direction,
                touches         : $.extend(true, {}, state.touches)
            }));
        }
    }

    gestures.add('end', 'swipe', swipe);

}(gestures, state, calc));
(function (gestures, state, calc, util) {

    var config = {
            tap_double_max_interval: 300,
            tap_max_distance: 10,
            tap_distance: 20,

            hold_timeout: 500
        },
        distance,
        prevTapPos,
        prevTapEndTime,
        holdTimer;

    /**
     *
     * @param {jQuery.Event} event
     */
    function tap(event)
    {
        var timestamp = new Date().getTime(),
            duration = timestamp - state.timestamp,
            $target = $(event.target);

        if (config.hold_timeout < duration) { // if the hold was already fired do not fire a tap
            return;
        }

        event = state.events.start.originalEvent;

        if (!doubletap(event)) {
            distance = state.touches.move ? calc.getDistance(state.touches.start[0], state.touches.move[0]) : 0;

            if (distance < config.tap_max_distance) {
                state.gesture = 'tap';

                prevTapEndTime = timestamp;
                prevTapPos = state.touches.start;

                if (util.hasEvent($target, 'doubletap')) { // doubletap event is bound to the target
                    setTimeout(function() { // the tap event will be delayed because there might be a double tap
                        if(prevTapPos && state.prevGesture !== 'doubletap' && ((new Date().getTime() - prevTapEndTime) > config.tap_double_max_interval)) {
                            $target.trigger($.Event('tap', {
                                originalEvent: event
                            }));
                        }
                    }, config.tap_double_max_interval);
                } else {
                    $target.trigger($.Event('tap', {
                        originalEvent: event
                    }));
                }
            }
        }
    }

    /**
     *
     * @param {jQuery.Event} event
     * @return {Boolean} true if doubletap was recognized
     */
    function doubletap(event) {
        if (prevTapPos && state.prevGesture === 'tap' && (state.timestamp - prevTapEndTime) < config.tap_double_max_interval)
        {
            if (prevTapPos && state.touches.start && (calc.getDistance(prevTapPos[0], state.touches.start[0]) < config.tap_distance)) {

                state.gesture = 'doubletap';
                prevTapEndTime = null;

                $(event.target).trigger($.Event('doubletap', {
                    originalEvent: event
                }));

                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {jQuery.Event} event
     */
    function taphold(event)
    {
        state.gesture = 'taphold';
        clearTimeout(holdTimer);

        holdTimer = setTimeout(function() {
            if (state.touches.start && !state.touches.end) { // touch event already completed
                distance = state.touches.move ? calc.getDistance(state.touches.start[0], state.touches.move[0]) : 0;

                if (distance < config.tap_max_distance && state.gesture === 'taphold') {
                    $(event.target).trigger($.Event('taphold', {
                        originalEvent: state.events.start ? state.events.start.originalEvent : event.originalEvent
                    }));
                }
            }
        }, config.hold_timeout);

    }

    gestures.add('end', 'tap', tap);
	gestures.add('none', 'doubletap', $.noop);
    gestures.add('start', 'taphold', taphold);

}(gestures, state, calc, util));
(function (gestures, state, calc) {

    var config = {
            scale_treshold     : 0.1,
            rotation_treshold  : 15 // °
        },
        started = false,
        center;

    /**
     *
     * @param {jQuery.Event} event
     */
    function transform(event)
    {
        var rotation,
            scale,
            $target = $(event.target);

        if(state.touches.move.length !== 2) {
            return;
        }

        rotation = calc.getRotation(state.touches.start, state.touches.move);
        scale = calc.getScale(state.touches.start, state.touches.move);

        if(state.gesture === 'transform' || Math.abs(1-scale) > config.scale_treshold || Math.abs(rotation) > config.rotation_treshold) {
            state.gesture = 'transform';

            center = {  pageX: ((state.touches.move[0].pageX + state.touches.move[1].pageX) / 2) - state.offset.left,
                pageY: ((state.touches.move[0].pageY + state.touches.move[1].pageY) / 2) - state.offset.top };

            if(!started) {
                $target.trigger($.Event('transformstart', {
                    originalEvent: event.originalEvent,
                    center: center,
                    scale: scale,
                    rotation: rotation
                }));
                started = true;
            }

            $target.trigger($.Event('transform', {
                originalEvent: event.originalEvent,
                center: center,
                scale: scale,
                rotation: rotation
            }));
        }
    }

    /**
     *
     * @param {jQuery.Event} event
     */
    function transformend(event)
    {
        var rotation,
            scale,
            $target = $(event.target);

        if(state.gesture === 'transform') {
            rotation = calc.getRotation(state.touches.start, state.touches.move);
            scale = calc.getScale(state.touches.start, state.touches.move);

            $target.trigger($.Event('transformend', {
                originalEvent: event.originalEvent,
                center: center,
                scale: scale,
                rotation: rotation
            }));

            started = false;
        }
    }

    gestures.add('move', 'transform', transform);
    gestures.add('end', 'transformend', transformend);

}(gestures, state, calc));
}(jQuery, window));
// moment.js
// version : 1.7.2
// author : Tim Wood
// license : MIT
// momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "1.7.2",
        round = Math.round, i,
        // internal storage for language config files
        languages = {},
        currentLanguage = 'en',

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // Parameters to check for on the lang config.  This list of properties
        // will be inherited from English if not provided in a language
        // definition.  monthsParse is also a lang config property, but it
        // cannot be inherited and as such cannot be enumerated here.
        langConfigProperties = 'months|monthsShort|weekdays|weekdaysShort|weekdaysMin|longDateFormat|calendar|relativeTime|ordinal|meridiem'.split('|'),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?)/g,

        // parsing tokens
        parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenWord = /[0-9a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/i, // any word characters or numbers
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO seperator)

        // preliminary iso regex
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
        isoRegex = /^\s*\d{4}-\d\d-\d\d(T(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.S', /T\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /T\d\d:\d\d:\d\d/],
            ['HH:mm', /T\d\d:\d\d/],
            ['HH', /T\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w M D d'.split(' '),
        paddedTokens = 'M D H h m s w'.split(' '),

        /*
         * moment.fn.format uses new Function() to create an inlined formatting function.
         * Results are a 3x speed boost
         * http://jsperf.com/momentjs-cached-format-functions
         *
         * These strings are appended into a function using replaceFormatTokens and makeFormatFunction
         */
        formatTokenFunctions = {
            // a = placeholder
            // b = placeholder
            // t = the current moment being formatted
            // v = getValueAtKey function
            // o = language.ordinal function
            // p = leftZeroFill function
            // m = language.meridiem value or function
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return getValueFromArray("monthsShort", this.month(), this, format);
            },
            MMMM : function (format) {
                return getValueFromArray("months", this.month(), this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                var a = new Date(this.year(), this.month(), this.date()),
                    b = new Date(this.year(), 0, 1);
                return ~~(((a - b) / 864e5) + 1.5);
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return getValueFromArray("weekdaysMin", this.day(), this, format);
            },
            ddd  : function (format) {
                return getValueFromArray("weekdaysShort", this.day(), this, format);
            },
            dddd : function (format) {
                return getValueFromArray("weekdays", this.day(), this, format);
            },
            w    : function () {
                var a = new Date(this.year(), this.month(), this.date() - this.day() + 5),
                    b = new Date(a.getFullYear(), 0, 4);
                return ~~((a - b) / 864e5 / 7 + 1.5);
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return ~~(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(~~(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(10 * a / 6), 4);
            }
        };

    function getValueFromArray(key, index, m, format) {
        var lang = m.lang();
        return lang[key].call ? lang[key](m, format) : lang[key][index];
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func) {
        return function (a) {
            var b = func.call(this, a);
            return b + this.lang().ordinal(b);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i]);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/


    // Moment prototype object
    function Moment(date, isUTC, lang) {
        this._d = date;
        this._isUTC = !!isUTC;
        this._a = date._a || null;
        this._lang = lang || false;
    }

    // Duration Constructor
    function Duration(duration) {
        var data = this._data = {},
            years = duration.years || duration.y || 0,
            months = duration.months || duration.M || 0,
            weeks = duration.weeks || duration.w || 0,
            days = duration.days || duration.d || 0,
            hours = duration.hours || duration.h || 0,
            minutes = duration.minutes || duration.m || 0,
            seconds = duration.seconds || duration.s || 0,
            milliseconds = duration.milliseconds || duration.ms || 0;

        // representation for dateAddRemove
        this._milliseconds = milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months +
            years * 12;

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;
        seconds += absRound(milliseconds / 1000);

        data.seconds = seconds % 60;
        minutes += absRound(seconds / 60);

        data.minutes = minutes % 60;
        hours += absRound(minutes / 60);

        data.hours = hours % 24;
        days += absRound(hours / 24);

        days += weeks * 7;
        data.days = days % 30;

        months += absRound(days / 30);

        data.months = months % 12;
        years += absRound(months / 12);

        data.years = years;

        this._lang = false;
    }


    /************************************
        Helpers
    ************************************/


    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding) {
        var ms = duration._milliseconds,
            d = duration._days,
            M = duration._months,
            currentDate;

        if (ms) {
            mom._d.setTime(+mom + ms * isAdding);
        }
        if (d) {
            mom.date(mom.date() + d * isAdding);
        }
        if (M) {
            currentDate = mom.date();
            mom.date(1)
                .month(mom.month() + M * isAdding)
                .date(Math.min(currentDate, mom.daysInMonth()));
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(input, asUTC, hoursOffset, minutesOffset) {
        var i, date, forValid = [];
        for (i = 0; i < 7; i++) {
            forValid[i] = input[i] = (input[i] == null) ? (i === 2 ? 1 : 0) : input[i];
        }
        // we store whether we used utc or not in the input array
        input[7] = forValid[7] = asUTC;
        // if the parser flagged the input as invalid, we pass the value along
        if (input[8] != null) {
            forValid[8] = input[8];
        }
        // add the offsets to the time to be parsed so that we can have a clean array
        // for checking isValid
        input[3] += hoursOffset || 0;
        input[4] += minutesOffset || 0;
        date = new Date(0);
        if (asUTC) {
            date.setUTCFullYear(input[0], input[1], input[2]);
            date.setUTCHours(input[3], input[4], input[5], input[6]);
        } else {
            date.setFullYear(input[0], input[1], input[2]);
            date.setHours(input[3], input[4], input[5], input[6]);
        }
        date._a = forValid;
        return date;
    }

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        var i, m,
            parse = [];

        if (!values && hasModule) {
            values = require('./lang/' + key);
        }

        for (i = 0; i < langConfigProperties.length; i++) {
            // If a language definition does not provide a value, inherit
            // from English
            values[langConfigProperties[i]] = values[langConfigProperties[i]] ||
              languages.en[langConfigProperties[i]];
        }

        for (i = 0; i < 12; i++) {
            m = moment([2000, i]);
            parse[i] = new RegExp('^' + (values.months[i] || values.months(m, '')) +
                '|^' + (values.monthsShort[i] || values.monthsShort(m, '')).replace('.', ''), 'i');
        }
        values.monthsParse = values.monthsParse || parse;

        languages[key] = values;

        return values;
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.  If you pass in a moment or duration instance, it
    // will decide the language based on that, or default to the global
    // language.
    function getLangDefinition(m) {
        var langKey = (typeof m === 'string') && m ||
                      m && m._lang ||
                      null;

        return langKey ? (languages[langKey] || loadLang(langKey)) : moment;
    }


    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[.*\]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += typeof array[i].call === 'function' ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return m.lang().longDateFormat[input] || input;
        }

        while (i-- && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        }

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token) {
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
            return parseTokenFourDigits;
        case 'S':
        case 'SS':
        case 'SSS':
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
        case 'a':
        case 'A':
            return parseTokenWord;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
            return parseTokenOneOrTwoDigits;
        default :
            return new RegExp(token.replace('\\', ''));
        }
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, datePartArray, config) {
        var a, b;

        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            for (a = 0; a < 12; a++) {
                if (getLangDefinition().monthsParse[a].test(input)) {
                    datePartArray[1] = a;
                    b = true;
                    break;
                }
            }
            // if we didn't find a month name, mark the date as invalid.
            if (!b) {
                datePartArray[8] = false;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DDDD
        case 'DD' : // fall through to DDDD
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                datePartArray[2] = ~~input;
            }
            break;
        // YEAR
        case 'YY' :
            datePartArray[0] = ~~input + (~~input > 70 ? 1900 : 2000);
            break;
        case 'YYYY' :
            datePartArray[0] = ~~Math.abs(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config.isPm = ((input + '').toLowerCase() === 'pm');
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[3] = ~~input;
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[4] = ~~input;
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[5] = ~~input;
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
            datePartArray[6] = ~~ (('0.' + input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config.isUTC = true;
            a = (input + '').match(parseTimezoneChunker);
            if (a && a[1]) {
                config.tzh = ~~a[1];
            }
            if (a && a[2]) {
                config.tzm = ~~a[2];
            }
            // reverse offsets
            if (a && a[0] === '+') {
                config.tzh = -config.tzh;
                config.tzm = -config.tzm;
            }
            break;
        }

        // if the input is null, the date is not valid
        if (input == null) {
            datePartArray[8] = false;
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(string, format) {
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        // We store some additional data on the array for validation
        // datePartArray[7] is true if the Date was created with `Date.UTC` and false if created with `new Date`
        // datePartArray[8] is false if the Date is invalid, and undefined if the validity is unknown.
        var datePartArray = [0, 0, 1, 0, 0, 0, 0],
            config = {
                tzh : 0, // timezone hour offset
                tzm : 0  // timezone minute offset
            },
            tokens = format.match(formattingTokens),
            i, parsedInput;

        for (i = 0; i < tokens.length; i++) {
            parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];
            if (parsedInput) {
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            }
            // don't parse if its not a known token
            if (formatTokenFunctions[tokens[i]]) {
                addTimeToArrayFromToken(tokens[i], parsedInput, datePartArray, config);
            }
        }
        // handle am pm
        if (config.isPm && datePartArray[3] < 12) {
            datePartArray[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (config.isPm === false && datePartArray[3] === 12) {
            datePartArray[3] = 0;
        }
        // return
        return dateFromArray(datePartArray, config.isUTC, config.tzh, config.tzm);
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(string, formats) {
        var output,
            inputParts = string.match(parseMultipleFormatChunker) || [],
            formattedInputParts,
            scoreToBeat = 99,
            i,
            currentDate,
            currentScore;
        for (i = 0; i < formats.length; i++) {
            currentDate = makeDateFromStringAndFormat(string, formats[i]);
            formattedInputParts = formatMoment(new Moment(currentDate), formats[i]).match(parseMultipleFormatChunker) || [];
            currentScore = compareArrays(inputParts, formattedInputParts);
            if (currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                output = currentDate;
            }
        }
        return output;
    }

    // date from iso format
    function makeDateFromString(string) {
        var format = 'YYYY-MM-DDT',
            i;
        if (isoRegex.exec(string)) {
            for (i = 0; i < 4; i++) {
                if (isoTimes[i][1].exec(string)) {
                    format += isoTimes[i][0];
                    break;
                }
            }
            return parseTokenTimezone.exec(string) ?
                makeDateFromStringAndFormat(string, format + ' Z') :
                makeDateFromStringAndFormat(string, format);
        }
        return new Date(string);
    }


    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        var rt = lang.relativeTime[string];
        return (typeof rt === 'function') ?
            rt(number || 1, !!withoutSuffix, string, isFuture) :
            rt.replace(/%d/i, number || 1);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Top Level Functions
    ************************************/


    moment = function (input, format) {
        if (input === null || input === '') {
            return null;
        }
        var date,
            matched;
        // parse Moment object
        if (moment.isMoment(input)) {
            return new Moment(new Date(+input._d), input._isUTC, input._lang);
        // parse string and format
        } else if (format) {
            if (isArray(format)) {
                date = makeDateFromStringAndArray(input, format);
            } else {
                date = makeDateFromStringAndFormat(input, format);
            }
        // evaluate it as a JSON-encoded date
        } else {
            matched = aspNetJsonRegex.exec(input);
            date = input === undefined ? new Date() :
                matched ? new Date(+matched[1]) :
                input instanceof Date ? input :
                isArray(input) ? dateFromArray(input) :
                typeof input === 'string' ? makeDateFromString(input) :
                new Date(input);
        }

        return new Moment(date);
    };

    // creating with utc
    moment.utc = function (input, format) {
        if (isArray(input)) {
            return new Moment(dateFromArray(input, true), true);
        }
        // if we don't have a timezone, we need to add one to trigger parsing into utc
        if (typeof input === 'string' && !parseTokenTimezone.exec(input)) {
            input += ' +0000';
            if (format) {
                format += ' Z';
            }
        }
        return moment(input, format).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var isDuration = moment.isDuration(input),
            isNumber = (typeof input === 'number'),
            duration = (isDuration ? input._data : (isNumber ? {} : input)),
            ret;

        if (isNumber) {
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        }

        ret = new Duration(duration);

        if (isDuration) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // humanizeDuration
    // This method is deprecated in favor of the new Duration object.  Please
    // see the moment.duration method.
    moment.humanizeDuration = function (num, type, withSuffix) {
        return moment.duration(num, type === true ? null : type).humanize(type === true ? true : withSuffix);
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var i;

        if (!key) {
            return currentLanguage;
        }
        if (values || !languages[key]) {
            loadLang(key, values);
        }
        if (languages[key]) {
            // deprecated, to get the language definition variables, use the
            // moment.fn.lang method or the getLangDefinition function.
            for (i = 0; i < langConfigProperties.length; i++) {
                moment[langConfigProperties[i]] = languages[key][langConfigProperties[i]];
            }
            moment.monthsParse = languages[key].monthsParse;
            currentLanguage = key;
        }
    };

    // returns language data
    moment.langData = getLangDefinition;

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment;
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        ordinal : function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        }
    });


    /************************************
        Moment Prototype
    ************************************/


    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d;
        },

        unix : function () {
            return Math.floor(+this._d / 1000);
        },

        toString : function () {
            return this._d.toString();
        },

        toDate : function () {
            return this._d;
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds(),
                !!this._isUTC
            ];
        },

        isValid : function () {
            if (this._a) {
                // if the parser finds that the input is invalid, it sets
                // the eighth item in the input array to false.
                if (this._a[8] != null) {
                    return !!this._a[8];
                }
                return !compareArrays(this._a, (this._a[7] ? moment.utc(this._a) : moment(this._a)).toArray());
            }
            return !isNaN(this._d.getTime());
        },

        utc : function () {
            this._isUTC = true;
            return this;
        },

        local : function () {
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            return formatMoment(this, inputString ? inputString : moment.defaultFormat);
        },

        add : function (input, val) {
            var dur = val ? moment.duration(+val, input) : moment.duration(input);
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur = val ? moment.duration(+val, input) : moment.duration(input);
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, val, asFloat) {
            var inputMoment = this._isUTC ? moment(input).utc() : moment(input).local(),
                zoneDiff = (this.zone() - inputMoment.zone()) * 6e4,
                diff = this._d - inputMoment._d - zoneDiff,
                year = this.year() - inputMoment.year(),
                month = this.month() - inputMoment.month(),
                date = this.date() - inputMoment.date(),
                output;
            if (val === 'months') {
                output = year * 12 + month + date / 30;
            } else if (val === 'years') {
                output = year + (month + date / 30) / 12;
            } else {
                output = val === 'seconds' ? diff / 1e3 : // 1000
                    val === 'minutes' ? diff / 6e4 : // 1000 * 60
                    val === 'hours' ? diff / 36e5 : // 1000 * 60 * 60
                    val === 'days' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                    val === 'weeks' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                    diff;
            }
            return asFloat ? output : round(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this._lang).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().sod(), 'days', true),
                calendar = this.lang().calendar,
                allElse = calendar.sameElse,
                format = diff < -6 ? allElse :
                diff < -1 ? calendar.lastWeek :
                diff < 0 ? calendar.lastDay :
                diff < 1 ? calendar.sameDay :
                diff < 2 ? calendar.nextDay :
                diff < 7 ? calendar.nextWeek : allElse;
            return this.format(typeof format === 'function' ? format.apply(this) : format);
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < moment([this.year()]).zone() ||
                this.zone() < moment([this.year(), 5]).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return input == null ? day :
                this.add({ d : input - day });
        },

        startOf: function (val) {
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (val.replace(/s$/, '')) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }
            return this;
        },

        endOf: function (val) {
            return this.startOf(val).add(val.replace(/s?$/, 's'), 1).subtract('ms', 1);
        },

        sod: function () {
            return this.clone().startOf('day');
        },

        eod: function () {
            // end of day = start of day plus 1 day, minus 1 millisecond
            return this.clone().endOf('day');
        },

        zone : function () {
            return this._isUTC ? 0 : this._d.getTimezoneOffset();
        },

        daysInMonth : function () {
            return moment.utc([this.year(), this.month() + 1, 0]).date();
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (lang) {
            if (lang === undefined) {
                return getLangDefinition(this);
            } else {
                this._lang = lang;
                return this;
            }
        }
    };

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase(), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');


    /************************************
        Duration Prototype
    ************************************/


    moment.duration.fn = Duration.prototype = {
        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              this._months * 2592e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                rel = this.lang().relativeTime,
                output = relativeTime(difference, !withSuffix, this.lang()),
                fromNow = difference <= 0 ? rel.past : rel.future;

            if (withSuffix) {
                if (typeof fromNow === 'function') {
                    output = fromNow(output);
                } else {
                    output = fromNow.replace(/%s/i, output);
                }
            }

            return output;
        },

        lang : moment.fn.lang
    };

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);


    /************************************
        Exposing Moment
    ************************************/


    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    }
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['moment'] = moment;
    }
    /*global define:false */
    if (typeof define === "function" && define.amd) {
        define("moment", [], function () {
            return moment;
        });
    }
}).call(this);
/**
  Crockford's new_constructor pattern, modified to allow walking the prototype chain, automatic constructor/destructor chaining, easy toString methods, and syntactic sugar for calling superclass methods

  @see Base

  @function

  @param {Object} descriptor                        Descriptor object
  @param {String or Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
  @param {Object} descriptor.extend                 The class to extend
  @param {Function} descriptor.construct            The constructor (setup) method for the new class
  @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
  @param {Mixed} descriptor.*                       Other methods and properties for the new class

  @returns {Base} The created class.
*/
var Class;
var Exception;

(function() {
  /**
    @name Base

    @classdesc The abstract class which contains methods that all classes will inherit.
    Base cannot be extended or instantiated and does not exist in the global namespace.
    If you create a class using <code class="prettyprint">new Class()</code> or <code class="prettyprint">MyClass.extend()</code>, it will come with Base' methods.

    @desc Base is an abstract class and cannot be instantiated directly. Constructors are chained automatically, so you never need to call the constructor of an inherited class directly
    @constructs

    @param {Object} options  Instance options. Guaranteed to be defined as at least an empty Object
   */

  /**
    Binds a method of this instance to the execution scope of this instance.

    @name bind
    @memberOf Base.prototype
    @function

    @param {Function} func The this.method you want to bind
   */
  var bindFunc = function(func) {
    // Bind the function to always execute in scope
    var boundFunc = func.bind(this);

    // Store the method name
    boundFunc._methodName = func._methodName;

    // Store the bound function back to the class
    this[boundFunc._methodName] = boundFunc;

    // Return the bound function
    return boundFunc;
  };

  /**
    Extends this class using the passed descriptor. 
    Called on the Class itself (not an instance), this is an alternative to using <code class="prettyprint">new Class()</code>.
    Any class created using Class will have this static method on the class itself.

    @name extend
    @memberOf Base
    @function
    @static

    @param {Object} descriptor                        Descriptor object
    @param {String or Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
    @param {Object} descriptor.extend                 The class to extend
    @param {Function} descriptor.construct            The constructor (setup) method for the new class
    @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
    @param {Anything} descriptor.*                    Other methods and properties for the new class
   */
  var extendClass = function(descriptor) {
    descriptor.extend = this;
    return new Class(descriptor);
  };

  Class = function(descriptor) {
    descriptor = descriptor || {};

    if (descriptor.hasOwnProperty('extend') && !descriptor.extend) {
      throw new Class.NonTruthyExtendError(descriptor.toString === 'function' ? descriptor.toString() : descriptor.toString);
    }

    // Extend Object by default
    var extend = descriptor.extend || Object;

    // Construct and destruct are not required
    var construct = descriptor.construct;
    var destruct = descriptor.destruct;

    // Remove special methods and keywords from descriptor
    delete descriptor.bind;
    delete descriptor.extend;
    delete descriptor.destruct;
    delete descriptor.construct;

    // Add toString method, if necessary
    if (descriptor.hasOwnProperty('toString') && typeof descriptor.toString !== 'function') {
      // Return the string provided
      var classString = descriptor.toString;
      descriptor.toString = function() {
        return classString.toString();
      };
    }
    else if (!descriptor.hasOwnProperty('toString') && extend.prototype.hasOwnProperty('toString')) {
      // Use parent's toString
      descriptor.toString = extend.prototype.toString;
    }

    // The remaining properties in descriptor are our methods
    var methodsAndProps = descriptor;

    // Create an object with the prototype of the class we're extending
    var prototype = Object.create(extend && extend.prototype);

    // Store super class as a property of the new class' prototype
    prototype.superClass = extend.prototype;

    // Copy new methods into prototype
    if (methodsAndProps) {  
      for (var key in methodsAndProps) {
        if (methodsAndProps.hasOwnProperty(key)) {
          prototype[key] = methodsAndProps[key];

          // Store the method name so calls to inherited() work
          if (typeof methodsAndProps[key] === 'function') {
            prototype[key]._methodName = key;
            prototype[key]._parentProto = prototype;
          }
        }
      }
    }

    /**
      Call the superclass method with the same name as the currently executing method

      @name inherited
      @memberOf Base.prototype
      @function

      @param {Arguments} args  Unadulterated arguments array from calling function
     */
    prototype.inherited = function(args) {
      // Get the function that call us from the passed arguments objected
      var caller = args.callee;

      // Get the name of the method that called us from a property of the method
      var methodName = caller._methodName;

      if (!methodName) {
        throw new Class.MissingCalleeError(this.toString());
      }

      // Start iterating at the prototype that this function is defined in
      var curProto = caller._parentProto;
      var inheritedFunc = null;

      // Iterate up the prototype chain until we find the inherited function
      while (curProto.superClass) {
        curProto = curProto.superClass;
        inheritedFunc = curProto[methodName];
        if (typeof inheritedFunc === 'function')
          break;
      }

      if (typeof inheritedFunc === 'function') {
        // Store our inherited function
        var oldInherited = this.inherited;

        // Overwrite our inherited function with that of the prototype so the called function can call its parent
        this.inherited = curProto.inherited;

        // Call the inherited function our scope, apply the passed args array
        var retVal = inheritedFunc.apply(this, args);

        // Revert our inherited function to the old function
        this.inherited = oldInherited;

        // Return the value called by the inherited function
        return retVal;
      }
      else {
        throw new Class.InheritedMethodNotFoundError(this.toString(), methodName);
      }
    };

    // Add bind to the prototype of the class
    prototype.bind = bindFunc;

    /**
      Destroys this instance and frees associated memory. Destructors are chained automatically, so the <code class="prettyprint">destruct()</code> method of all inherited classes will be called for you

      @name destruct
      @memberOf Base.prototype
      @function
     */
    prototype.destruct = function() {
      // Call our destruct method first
      if (typeof destruct === 'function') {
        destruct.apply(this);
      }

      // Call superclass destruct method after this class' method
      if (extend && extend.prototype && typeof extend.prototype.destruct === 'function') {
        extend.prototype.destruct.apply(this);      
      }
    };

    // Create a chained construct function which calls the superclass' construct function
    prototype.construct = function() {
      // Add a blank object as the first arg to the constructor, if none provided
      var args = arguments; // get around JSHint complaining about modifying arguments
      if (args[0] === undefined) {
        args.length = 1;
        args[0] = {};
      }

      // call superclass constructor
      if (extend && extend.prototype && typeof extend.prototype.construct === 'function') {
        extend.prototype.construct.apply(this, arguments);      
      }

      // call constructor
      if (typeof construct === 'function') {
        construct.apply(this, arguments);
      }
    };

    // Create a function that generates instances of our class and calls our construct functions
    /** @ignore */
    var instanceGenerator = function() {
      // Create a new object with the prototype we built
      var instance = Object.create(prototype);

      // Call all inherited construct functions
      prototype.construct.apply(instance, arguments);

      return instance;
    };

    instanceGenerator.toString = prototype.toString;

    // Set the prototype of our instance generator to the prototype of our new class so things like MyClass.prototype.method.apply(this) work
    instanceGenerator.prototype = prototype;

    // Add extend to the instance generator for the class
    instanceGenerator.extend = extendClass;

    // The constructor, as far as JS is concerned, is actually our instance generator
    prototype.constructor = instanceGenerator;

    return instanceGenerator;
  };

  if (!Object.create) {
    /**
      Polyfill for Object.create. Creates a new object with the specified prototype.

      @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create/">Mozilla MDN</a>

      @param {Object} prototype  The prototype to create a new object with
     */
    Object.create = function (prototype) {
      if (arguments.length > 1) {
        throw new Error('Object.create implementation only accepts the first parameter.');
      }
      function Func() {}
      Func.prototype = prototype;
      return new Func();
    };
  }

  if (!Function.prototype.bind) {
    /**
      Polyfill for Function.bind. Binds a function to always execute in a specific scope.

      @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind">Mozilla MDN</a>

      @param {Object} scope  The scope to bind the function to
     */
    Function.prototype.bind = function (scope) {
      if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      var aArgs = Array.prototype.slice.call(arguments, 1);
      var fToBind = this;
      /** @ignore */
      var NoOp = function() {};
      /** @ignore */
      var fBound = function() {
        return fToBind.apply(this instanceof NoOp ? this : scope, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      NoOp.prototype = this.prototype;
      fBound.prototype = new NoOp();

      return fBound;
    };
  }
  
  Exception = new Class({
    extend: Error,
    construct: function() {
      this.name = 'Error';
      this.message = 'General exception';
    },

    toString: function() {
      return this.name+': '+this.message;
    }
  });
  
  var ClassException = Exception.extend({
    name: 'Class Exception'
  });
  
  // Exceptions
  Class.NonTruthyExtendError = ClassException.extend({
    construct: function(className) {
      this.message = className+' attempted to extend a non-truthy object';
    }
  });
  
  Class.InheritedMethodNotFoundError = ClassException.extend({
    construct: function(className, methodName) {
      this.message = className+" can't call method '"+methodName+"', no method defined in parent classes";
    }
  });
  
  Class.MissingCalleeError = ClassException.extend({
    construct: function(className) {
      this.message = className+" can't call inherited method: calling method did not have _methodName";
    }
  });
}());
/**
  @classdesc The main CUI namespace.
  @namespace

  @property {Object} options            Main options for CloudUI components.
  @property {Boolean} options.debug     If true, show debug messages for all components.
  @property {Boolean} options.dataAPI   If true, add listeners for widget data APIs.
  @property {Object} Templates          Contains templates used by CUI widgets

  @example
<caption>Change CUI options</caption>
<description>You can change CUI options by defining <code>CUI.options</code> before you load CUI.js</description>
&lt;script type=&quot;text/javascript&quot;&gt;
  var CUI = {
    options: {
      debug: false,
      dataAPI: true
    }
  };
&lt;/script&gt;
&lt;script src=&quot;js/CUI.js&quot;&gt;&lt;/script&gt;

*/
var CUI = CUI || {};

CUI.options = $.extend({
  debug: false,
  dataAPI: true
}, CUI.options);

(function() {
  // Register partials for all templates
  // Note: this requires the templates to be included BEFORE CUI.js
  for (var template in CUI.Templates) {
    Handlebars.registerPartial(template, CUI.Templates[template]);
  }

  $(function() {

    /**
      <h1>cui-contentloaded Event</h1>
      <p><code>cui-contentloaded</code> event is an event that is triggered when a new content is injected to the DOM.
This event is very similar to <a href="https://developer.mozilla.org/en-US/docs/DOM/DOM_event_reference/DOMContentLoaded">DOMContentLoaded</a> event.

This event is normally used so that a JavaScript code can be notified when new content needs to be enhanced (applying event handler, layout, etc).

The element where the new content is injected is available at event.target, like so:

<pre class="prettyprint linenums jsDocExample">
$(document).on("foundation-contentloaded", function(e) {
    var container = e.target;
    // the container is the element where new content is injected.
});
</pre>

This way the listener can limit the scope of the selector accordingly.

It will be triggered at DOMContentLoaded event as well, so component can just listen to this event instead of DOMContentLoaded for enhancement purpose. In that case, the value of event.target is <code>document</code>.
</p>
      @namespace cui-contentloaded
    */
    $(document).trigger("cui-contentloaded");
  });
}());
/**
  Utility functions used by CoralUI widgets

  @namespace
*/
CUI.util = {};

/**
  Get the target element of a data API action using the data attributes of an element.

  @param {jQuery} $element    The jQuery object representing the element to get the target from

  @returns {jQuery}           The jQuery object representing the target element
*/
CUI.util.getDataTarget = function($element) {
  var href = $element.attr('href');
  var $target = $($element.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // Strip for ie7
  return $target;
};

/**
  Decapitalize a string by converting the first letter to lowercase.

  @param {String} str     The string to de-capitalize

  @returns {String}       The de-capitalized string
*/
CUI.util.decapitalize = function(str) {
  return str.slice(0,1).toLowerCase()+str.slice(1);
};

/**
  Capitalize a string by converting the first letter to uppercase.

  @param {String} str     The string to capitalize

  @returns {String}       The capitalized string
*/
CUI.util.capitalize = function(str) {
  return str.slice(0,1).toUpperCase()+str.slice(1);
};

(function($) {
  /**
    Create a jQuery plugin from a class

    @param {Class} PluginClass                              The class to create to create the plugin for
    @param {String} [pluginName=PluginClass.toString()]     The name of the plugin to create. The de-capitalized return value of PluginClass.toString() is used if left undefined
    @param {Function} [callback]                              A function to execute in the scope of the jQuery object when the plugin is activated. Used for tacking on additional initialization procedures or behaviors for other plugin functionality.
  */
  CUI.util.plugClass = function(PluginClass, pluginName, callback) {
    pluginName = pluginName || CUI.util.decapitalize(PluginClass.toString());

    $.fn[pluginName] = function(optionsIn) {
      return this.each(function() {
        var $element = $(this);

        // Combine defaults, data, options, and element config
        var options = $.extend({}, $element.data(), typeof optionsIn === 'object' && optionsIn, { element: this });

        // Get instance, if present already
        var instance = $element.data(pluginName) || new PluginClass(options);

        if (typeof optionsIn === 'string') // Call method, pass args
          instance[optionsIn].apply(instance, Array.prototype.slice.call(arguments, 1));
        else if ($.isPlainObject(optionsIn)) // Apply options
          instance.set(optionsIn);

        if (typeof callback === 'function')
          callback.call(this, instance);
      });
    };

    $.fn[pluginName].Constructor = PluginClass;
  };

    /**
     Register a callback from a string

     @param {String} callbackAsString The string containing the callback function to register
     @param {Object} [params]         Parameters to provide when executing callback
     @return {Function} The callback function generated from the provided string
     */
    CUI.util.buildFunction = function(callbackAsString, params) {
        params = params || [];
        if (typeof params === "string") {
            params = [params];
        }

        if (callbackAsString) {
            try {
                var Fn = Function;
                return new Fn(params, "return " + callbackAsString + "(" + params.join(", ") + ");");
            } catch (e) {
                return null;
            }
        }
    };

    /**
     * Selects text in the provided field
     * @param {Number} start (optional) The index where the selection should start (defaults to 0)
     * @param {Number} end (optional) The index where the selection should end (defaults to the text length)
     */
    CUI.util.selectText = function(field, start, end) {
        var value = field.val();
        if (value.length > 0) {
            start = start || 0;
            end = end || value.length;
            var domEl = $(field)[0];
            if (domEl.setSelectionRange) {
                // Mostly all browsers
                domEl.blur();
                domEl.setSelectionRange(start, end);
                domEl.focus();
            } else if (domEl.createTextRange) {
                // IE
                var range = domEl.createTextRange();
                range.collapse(true);
                range.moveEnd("character", end - value.length);
                range.moveStart("character", start);
                range.select();
            }
        }
    };

  /**    
    Load remote content in an element with a CUI spinner
    NOTE: This function should be moved to another file as it is not part of the CUI.util namespace. Maybe CUI.jQuery.js? Ignored from docs for now.

    @param {String} remote                                  The remote URL to pass to $.load
    @param {Boolean} [force]                                Set force to true to force the load to happen with every call, even if it has succeeded already. Otherwise, subsequent calls will simply return.
    @param {Function} [callback]                            A function to execute in the scope of the jQuery $.load call when the load finishes (whether success or failure). The arguments to the callback are the load results: response, status, xhr.
    
    @ignore
  */
  $.fn.loadWithSpinner = function(remote, force, callback) {
    var $target = $(this);

    // load remote link, if necessary
    if (remote && (force || $target.data('loaded-remote') !== remote)) {
      // only show the spinner if the request takes an appreciable amount of time, otherwise
      // the flash of the spinner is a little ugly
      var timer = setTimeout(function() {
        $target.html('<div class="spinner large"></div>');
      }, 50);

      $target.load(remote, function(response, status, xhr) {
        clearTimeout(timer); // no need for the spinner anymore!

        if (status === 'error') {
          $target.html('<div class="alert error"><strong>ERROR</strong> Failed to load content: '+xhr.statusText+' ('+xhr.status+')</div>');
          $target.data('loaded-remote', '');
        }

        if (typeof callback === 'function') {
          callback.call(this, response, status, xhr);
        }
      });

      $target.data('loaded-remote', remote);
    }
  };

  /*
   * Find first absolute/relative positioned parent
   */
  $.fn.positionedParent = function() {
    var parent;

    $(this).parents().each(function() {
      var $this = $(this), position = $this.css('position');

      if (position === 'absolute' || position === 'relative') {
        parent = $this;
        return false;
      }
    });

    return parent || $('body');
  };
  
  $.extend({
      /**
        Utility function to get the value of a nested key within an object
        NOTE: This function should be moved to CUI.util namespace as it is not jQuery specific. Ignored from docs for now.
      
        @param {Object} object    The object to retrieve the value from
        @param {String} nestedKey The nested key. For instance "foo.bar.baz"
        @return {Object} The object value for the nested key
        
        @ignore
      */
      getNested: function(object, nestedKey) {
          if (!nestedKey) {
              return object;
          }

          // Split key into a table
          var keys = typeof nestedKey === "string" ? nestedKey.split(".") : nestedKey;

          // Browse object
          var result = object;
          while (result && keys.length > 0) {
              result = result[keys.shift()];
          }

          return result;
      }
  });
}(window.jQuery));
(function ($, window, undefined) {
    var storageKey = 'cui-state',
        storageLoadEvent = 'cui-state-restore',
        store = {},
        loaded = false,
        $doc = $(document);

    /**
     * state object to enable UI page refresh stable states
     * TODO:
     *  - all states are global, lack of an auto restore mode which is aware of the URL
     *  - client side only (localStorage)
     *  - lack of an abstraction layer for the client side storage
     * @type {Object}
     */
    CUI.util.state = {

        /*saveForm: function (form, elem) {

        },*/

        config: {
            serverpersistence: true
        },

        /**
         * Persist attributes of a DOM node
         *
         * @param {String} selector
         * @param {String|Array} [attribute] single attribute or list of attributes to be saved. If null then all attributes will be saved
         * @param {Boolean} [autorestore]
         * @param {String} [customEvent] custom event name
         */
        save: function (selector, attribute, autorestore, customEvent) {
            var elem = $(selector),
                saveLoop = function (i, attr) {
                    store.global[selector] = store.global[selector] || {};
                    store.global[selector][attr] = store.global[selector][attr] || {};
                    store.global[selector][attr].val = elem.attr(attr);
                    store.global[selector][attr].autorestore = autorestore || false;
                    store.global[selector][attr].customEvent = customEvent || null;
                };

            
            if (attribute) { // save single or multiple attributes
                if ($.isArray(attribute)) { // multiple values to save
                    $.each(attribute, saveLoop);
                } else { // save all attributes
                    saveLoop(0, attribute);
                }
            } else { // save all attributes
                // TODO
                // not supported yet because the browser implementation of Node.attributes is a mess
                // https://developer.mozilla.org/en-US/docs/DOM/Node.attributes
            }

            localStorage.setItem(storageKey, JSON.stringify(store));
            
            if (CUI.util.state.config.serverpersistence) {
                $.cookie(storageKey, JSON.stringify(store), {
                    expires: 7,
                    path: '/'
                });
            }
        },

        /**
         *
         * @param {String} [selector]
         * @param {Function} [filter] filter function for the attributes of the given selector
         */
        restore: function (selector, filter) {
            var check = filter || function () {
                    return true;
                },
                sel,
                elem,
                selectorLoop = function (item, noop) {
                    sel = item;
                    elem = $(sel);

                    if (store.global[sel]) {
                        $.each(store.global[sel], restoreLoop);
                    }
                },
                restoreLoop = function (attr, obj) {
                    if (check(sel, attr, obj)) {
                        elem.attr(attr, obj.val);

                        if (obj.customEvent) {
                            $doc.trigger(obj.customEvent, [elem, obj]);
                        }

                        $doc.trigger(storageLoadEvent, [elem, obj]);
                    }
                };

            if (!loaded) {
                loaded = CUI.util.state.load();
            }

            
            if (selector) { // restore single selector
                selectorLoop(selector);
            } else { // restore everything
                $.each(store.global, selectorLoop);
            }
        },

        load: function () {
            var val = localStorage.getItem(storageKey);

            store = val ? JSON.parse(val) : {
                global: {}
            };

            return true;
        },

        // support for "temporary" storage that will be automatically cleared if
        // the browser session ends; currently uses a set/get pattern rather than
        // loading the entire thing on document ready. Also note that the data is currently
        // not sent to the server.

        setSessionItem: function(name, value, ns) {
            var key = name;
            if (ns) {
                key = name + ":" + ns;
            }
            sessionStorage.setItem(key, JSON.stringify(value));
        },

        getSessionItem: function(name, ns) {
            var key = name;
            if (ns) {
                key = name + ":" + ns;
            }
            var value = sessionStorage.getItem(key);
            if (value) {
                value = JSON.parse(value);
            }
            return value;
        },

        removeSessionItem: function(name, ns) {
            var key = name;
            if (ns) {
                key = name + ":" + ns;
            }
            sessionStorage.removeItem(key);
        },

        clearSessionItems: function(ns) {
            if (ns) {
                ns = ":" + ns;
                var keyCnt = sessionStorage.length;
                var toRemove = [ ];
                for (var k = 0; k < keyCnt; k++) {
                    var keyToCheck = sessionStorage.key(k);
                    var keyLen = keyToCheck.length;
                    if (keyLen > ns.length) {
                        if (keyToCheck.substring(keyLen - ns.length) === ns) {
                            toRemove.push(keyToCheck);
                        }
                    }
                }
                var removeCnt = toRemove.length;
                for (var r = 0; r < removeCnt; r++) {
                    sessionStorage.removeItem(toRemove[r]);
                }
            }
        }

    };

    $doc.ready(function () {
        CUI.util.state.restore(null, function (selector, attr, val) {
            if (val.autorestore) {
                return true;
            }

            return false;
        });
    });
}(jQuery, this));
/**
 HTTP Utility functions used by CoralUI widgets

 @namespace
 */
CUI.util.HTTP = {
    /**
     * Checks whether the specified status code is OK.
     * @static
     * @param {Number} status The status code
     * @return {Boolean} True if the status is OK, else false
     */
    isOkStatus: function(status) {
        try {
            return (String(status).indexOf("2") === 0);
        } catch (e) {
            return false;
        }
    },

    /**
     * Returns <code>true</code> if HTML5 Upload is supported
     * @return {Boolean} HTML5 Upload support status
     */
    html5UploadSupported: function() {
        var xhr = new XMLHttpRequest();
        return !! (
            xhr && ('upload' in xhr) && ('onprogress' in xhr.upload)
        );
    }

};
this["CUI"] = this["CUI"] || {};
this["CUI"]["Templates"] = this["CUI"]["Templates"] || {};

this["CUI"]["Templates"]["alert"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, foundHelper, functionType="function";


  buffer += "<button class=\"close\" data-dismiss=\"alert\">&times;</button>\n<strong>";
  foundHelper = helpers.heading;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.heading; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</strong><div>";
  foundHelper = helpers.content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>";
  return buffer;});

this["CUI"]["Templates"]["badge"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return " empty";}

  buffer += "<div class=\"badge";
  stack1 = depth0.value;
  stack2 = {};
  stack1 = helpers.unless.call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  foundHelper = helpers.value;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</div>";
  return buffer;});

this["CUI"]["Templates"]["header"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "<div class=\"logo\">";
  foundHelper = helpers.logo;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.logo; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>";
  return buffer;}

function program3(depth0,data) {
  
  var stack1;
  stack1 = depth0;
  stack1 = self.invokePartial(partials.header_navItem, 'header_navItem', stack1, helpers, partials, data);
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }}

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<div class=\"drawer\">";
  stack1 = depth0.drawer;
  stack1 = self.invokePartial(partials.header_drawer, 'header_drawer', stack1, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>";
  return buffer;}

  stack1 = depth0.logo;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<nav role=\"tablist\">";
  stack1 = depth0.navItems;
  stack2 = {};
  stack1 = helpers.each.call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</nav>\n";
  stack1 = depth0.drawer;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});

this["CUI"]["Templates"]["header_drawer"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials; data = data || {};
  var stack1, stack2, self=this;

function program1(depth0,data) {
  
  var stack1;
  stack1 = depth0.badge;
  stack1 = self.invokePartial(partials.badge, 'badge', stack1, helpers, partials, data);
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }}

  stack1 = depth0.badge;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }});

this["CUI"]["Templates"]["header_navItem"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += " id=\"";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\"";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += " aria-owns=\"";
  foundHelper = helpers.owns;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.owns; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\"";
  return buffer;}

function program5(depth0,data) {
  
  
  return "aria-selected=\"true\" class=\"selected\"";}

function program7(depth0,data) {
  
  
  return "aria-selected=\"false\"";}

  buffer += "<a href=\"";
  foundHelper = helpers.url;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\" role=\"tab\"";
  stack1 = depth0.id;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = depth0.owns;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = depth0.selected;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.program(7, program7, data),fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</a>";
  return buffer;});

this["CUI"]["Templates"]["modal"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, foundHelper, functionType="function";


  buffer += "<div class=\"modal-header\">\n  <h2>";
  foundHelper = helpers.heading;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.heading; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h2>\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button>\n</div>\n<div class=\"modal-body\">";
  foundHelper = helpers.content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n<div class=\"modal-footer\">";
  foundHelper = helpers.buttons;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.buttons; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>";
  return buffer;});

this["CUI"]["Templates"]["rail"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"rail\">\n	<div class=\"pull-to-refresh\">\n        <div class=\"icon\"></div>\n        <div class=\"message\">\n          <i class=\"arrow\"></i>\n          <i class=\"spinner large\"></i>\n          <span class=\"pull\">";
  foundHelper = helpers.message_ptr_pull;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.message_ptr_pull; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n          <span class=\"release\">";
  foundHelper = helpers.message_ptr_release;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.message_ptr_release; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n          <span class=\"loading\">";
  foundHelper = helpers.message_ptr_loading;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.message_ptr_loading; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n        </div>\n      </div>\n      <div class=\"wrap\">\n      	";
  foundHelper = helpers.content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n</div>";
  return buffer;});

this["CUI"]["Templates"]["tabs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials; data = data || {};
  var buffer = "", stack1, stack2, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.tabs_tab, 'tabs_tab', stack1, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.tabs_panel, 'tabs_panel', stack1, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;}

  buffer += "<nav role=\"tablist\">\n  ";
  stack1 = depth0.tabs;
  stack2 = {};
  stack1 = helpers.each.call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</nav>\n";
  stack1 = depth0.tabs;
  stack2 = {};
  stack1 = helpers.each.call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});

this["CUI"]["Templates"]["tabs_panel"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "id=\"";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\" aria-labelledby=\"";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\"";
  return buffer;}

function program3(depth0,data) {
  
  
  return "class=\"active\"";}

function program5(depth0,data) {
  
  
  return "aria-disabled=\"true\"";}

  buffer += "<section ";
  stack1 = depth0.id;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " role=\"tabpanel\" ";
  stack1 = depth0.active;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = depth0.disabled;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  foundHelper = helpers.content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</section>";
  return buffer;});

this["CUI"]["Templates"]["tabs_tab"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var stack1, foundHelper;
  foundHelper = helpers.remote;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.remote; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  return escapeExpression(stack1);}

function program3(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "#";
  stack1 = depth0.id;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;}
function program4(depth0,data) {
  
  var stack1, foundHelper;
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  return escapeExpression(stack1);}

function program6(depth0,data) {
  
  var stack1, stack2;
  stack1 = depth0.remote;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }}
function program7(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "data-target=\"#";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\"";
  return buffer;}

function program9(depth0,data) {
  
  
  return "class=\"active\" aria-selected=\"true\"";}

function program11(depth0,data) {
  
  
  return "aria-selected=\"false\"";}

function program13(depth0,data) {
  
  
  return "class=\"disabled\" aria-disabled=\"true\"";}

  buffer += "<a href=\"";
  stack1 = depth0.remote;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = depth0.id;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " data-toggle=\"tab\" role=\"tab\" ";
  stack1 = depth0.active;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.program(11, program11, data),fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = depth0.disabled;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(13, program13, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</a>";
  return buffer;});

this["CUI"]["Templates"]["toolbar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<nav class=\"toolbar\">\n  <div class=\"left\">\n    <a href=\"#\" class=\"icon-";
  foundHelper = helpers.actionName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + ">";
  foundHelper = helpers.actionTitle;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n    <span class=\"divider\"></span>\n    <a href=\"#\" class=\"icon-";
  foundHelper = helpers.actionName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + ">";
  foundHelper = helpers.actionTitle;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n  </div>\n  <div class=\"center\">\n    <h1>";
  foundHelper = helpers.heading;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.heading; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h1>\n  </div>\n  <div class=\"right\">\n    <a href=\"#\" class=\"icon-";
  foundHelper = helpers.actionName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + ">";
  foundHelper = helpers.actionTitle;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n    <a href=\"#\" class=\"icon-";
  foundHelper = helpers.actionName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + ">";
  foundHelper = helpers.actionTitle;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n  </div>\n</nav>";
  return buffer;});
CUI.Widget = new Class(/** @lends CUI.Widget# */{
  toString: 'Widget',

  /**
    @classdesc The base class for all widgets

    @desc Creates a new widget
    @constructs

    @param {Object} options                     Widget options
    @param {Boolean} [options.visible=false]    If True, show the widget immediately
   */
  construct: function(options) {
    // Store options
    this.options = $.extend({}, typeof this.defaults === 'object' && this.defaults, options);

    // Store jQuery object
    this.$element = $(options.element);

    // Add instance to element's data
    this.$element.data(CUI.util.decapitalize(this.toString()), this);

    // Bind functions commonly called by listeners
    this.bind(this.hide);
    this.bind(this.show);
    this.bind(this.toggleVisibility);

    // Show/hide when this.options.visible changes
    this.on('change:visible', function(evt) {
      this[evt.value ? '_show' : '_hide']();
    }.bind(this));

    // TBD: break out into applyOptions? Could cause problems if not called
    if (this.options.visible) {
      // Show immediately
      this.options.visible = false;
      this.show();
    }
  },

  /**
    Set a number of options using an object
    @name set
    @memberOf CUI.Widget#
    @function

    @param {Object} optionHash     An object with keys are option names and values as option values.

    @returns {CUI.Widget} this, chainable
  */
  /**
    Set an option by name
    @name set
    @memberOf CUI.Widget#
    @function

    @param {String} option     The option to set, or an object 
    @param {String} value      The value to set the option to

    @returns {CUI.Widget} this, chainable
  */
  set: function(optionOrObj, value) {
    if ($.isPlainObject(optionOrObj)) {
      // Set multiple options
      for (var option in optionOrObj) {
        this._set(option, optionOrObj[option]);
      }
    }
    else {
      // Set single option
      this._set(optionOrObj, value);
    }

    return this;
  },
  /** @ignore */
  _set: function(option, value) {
    /*
    // Don't set if values are identical
    // This is problematic when options are set from markup
    // Leave this out for now
    if (this.options[option] === value)
      return this;
    */

    // Trigger a change event
    var e = $.Event('beforeChange:'+option, {
      widget: this, // We want to know who fired this event (used by CUI.Filters, CUI.DropdownList)
      option: option,
      currentValue: this.options[option],
      value: value
    });
    this.$element.trigger(e);

    // Don't set if prevented
    if (e.isDefaultPrevented()) return this;

    // Set value
    this.options[option] = value;

    e = $.Event('change:'+option, {
      widget: this,
      option: option,
      value: value
    });
    this.$element.trigger(e);
  },

  /**
    Get the value of an option

    @param {String} option    The name of the option to fetch the value of

    @returns {Mixed} Option value
  */
  get: function(option) {
    return this.options[option];
  },

  /**
   Add an event listener

   @param {String} evtName    The event name to listen for
   @param {Function} func     The function that will be called when the event is triggered

   @returns {CUI.Widget} this, chainable
  */
  on: function(evtName, func) {
    this.$element.on.apply(this.$element, arguments);
    return this;
  },

  /**
    Remove an event listener

    @param {String} evtName    The event name to stop listening for
    @param {Function} func     The function that was passed to on()

    @returns {CUI.Widget} this, chainable
  */
  off: function(evtName, func) {
    this.$element.off.apply(this.$element, arguments);
    return this;
  },

  /**
    Show the widget

    @returns {CUI.Widget} this, chainable
  */
  show: function(evt) {
    evt = evt || {};

    if (this.options.visible)
      return this;

    if (!evt.silent) {
      // Trigger event
      var e = $.Event('show');
      this.$element.trigger(e);

      // Do nothing if event is prevented or we're already visible
      if (e.isDefaultPrevented()) return this;
    }

    this.options.visible = true;

    this._show(evt);

    return this;
  },
  /** @ignore */
  _show: function(evt) {
    this.$element.show();
  },

  /**
    Hide the widget

    @returns {CUI.Widget} this, chainable
  */
  hide: function(evt) {
    evt = evt || {};

    if (!this.options.visible)
      return this;

    if (!evt.silent) {
      // Trigger event
      var e = $.Event('hide');
      this.$element.trigger(e);

      if (e.isDefaultPrevented()) return this;
    }

    this.options.visible = false;

    this._hide(evt);

    return this;
  },
  /** @ignore */
  _hide: function(evt) {
    this.$element.hide();
  },

  /**
    Toggle the visibility of the widget

    @returns {CUI.Widget} this, chainable
  */
  toggleVisibility: function() {
    return this[!this.options.visible ? 'show' : 'hide']();
  },
 
  /**
    Set a custom name for this widget.

    @param {String} customName	Component name

    @returns {CUI.Widget}	this, chainable
  */
  setName: function(customName) {
    /** @ignore */
    this.toString = function() {
      return customName;
    };

    return this;
  }

  /**
    Triggered when the widget is shown

    @name CUI.Widget#show
    @event
  */

  /**
    Triggered when the widget is hidden

    @name CUI.Widget#hide
    @event
  */

  /**
    Triggered when before an option is changed

    @name CUI.Widget#beforeChange:*
    @event

    @param {Object} evt                    Event object
    @param {Mixed} evt.option              The option that changed
    @param {Mixed} evt.currentValue        The current value
    @param {Mixed} evt.value               The value this option will be changed to
    @param {Function} evt.preventDefault   Call to prevent the option from changing
  */

  /**
    Triggered when an option is changed

    @name CUI.Widget#change:*
    @event

    @param {Object} evt          Event object
    @param {Mixed} evt.option    The option that changed
    @param {Mixed} evt.value     The new value
  */
});
(function($) {
  CUI.Modal = new Class(/** @lends CUI.Modal# */{
    toString: 'Modal',

    extend: CUI.Widget,
    /**
      @extends CUI.Widget
      @classdesc A dialog that prevents interaction with page elements while displayed. Modal will use existing markup if it is present, or create markup if <code>options.element</code> has no children.

      <h2 class="line">Example</h2>
      <a href="#myModal" class="button" data-toggle="modal">Show Modal</a>
      <div id="myModal" class="modal">
        <div class="modal-header">
          <h2>A Sample Modal</h2>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Some sample content.</p>
        </div>
        <div class="modal-footer">
          <button data-dismiss="modal">Ok</button>
        </div>
      </div>

      @example
<caption>Instantiate with Class</caption>
var modal = new CUI.Modal({
  element: '#myModal',
  heading: 'My Modal',
  content: '&lt;p&gt;Content here.&lt;/p&gt;',
  buttons: [
    {
      label: 'Save',
      className: 'primary',
      click: function(evt) {
        console.log('Modal: This would usually trigger a save...');
        this.hide(); // could also use evt.dialog.hide();
      }
    }
  ]
});

// Hide the modal, change the heading, then show it again
modal.hide().set({ heading: 'My Modal Again'}).show();

// jQuery style works as well
$('#myModal').modal('hide');

      @example
<caption>Instantiate with jQuery</caption>
$('#myModal').modal({
  heading: 'My Modal',
  content: '&lt;p&gt;Content here.&lt;/p&gt;',
  buttons: [
    {
      label: 'Close',
      click: 'hide', // Specifying 'hide' causes the dialog to close when clicked
    }
  ]
});

// Hide the modal, change the heading, then show it again
$('#myModal').modal('hide').modal({ heading: 'My Modal Again'}).modal('show');

// A reference to the element's modal instance is stored as data-modal
var modal = $('#myModal').data('modal');
modal.hide();


      @example 
<caption>Data API: Instantiate and show modal</caption>
<description>When using a <code class="prettify">&lt;button&gt;</code>, specify the jQuery selector for the element using <code>data-target</code>. Markup should exist already if no options are specified.</description>
&lt;button data-target=&quot;#myModal&quot; data-toggle=&quot;modal&quot;&gt;Show Modal&lt;/button&gt;

      @example
<caption>Data API: Instantiate, set options, and show</caption>
<description>When using an <code class="prettify">&lt;a&gt;</code>, specify the jQuery selector for the element using <code>href</code>. Markup is optional since options are specified as data attributes.</description>
&lt;a 
  href=&quot;#modal&quot;
  data-toggle=&quot;modal&quot;
  data-heading=&quot;Test Modal&quot;
  data-content=&quot;&amp;lt;p&amp;gt;Test content&amp;lt;/p&amp;gt;&quot;
  data-buttons=&#x27;[{ &quot;label&quot;: &quot;Close&quot;, &quot;click&quot;: &quot;close&quot; }]&#x27;
&gt;Show Modal&lt;/a&gt;

      @example
<caption>Data API: Instantiate, load content asynchronously, and show</caption>
<description>When loading content asynchronously, regardless of what tag is used, specify the jQuery selector for the element using <code>data-target</code> and the URL of the content to load with <code>href</code>.</description>
&lt;button
  data-target="#myModal"
  data-toggle=&quot;modal&quot;
  href=&quot;content.html&quot;
&gt;Show Modal&lt;/button&gt;

      @example
<caption>Markup</caption>
&lt;div id=&quot;myModal&quot; class=&quot;modal&quot;&gt;
  &lt;div class=&quot;modal-header&quot;&gt;
    &lt;h2&gt;Heading&lt;/h2&gt;
    &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;modal&quot;&gt;&amp;times;&lt;/button&gt;
  &lt;/div&gt;
  &lt;div class=&quot;modal-body&quot;&gt;
    Content
  &lt;/div&gt;
  &lt;div class=&quot;modal-footer&quot;&gt;
    &lt;button data-dismiss=&quot;modal&quot;&gt;Close&lt;/button&gt;
  &lt;/div&gt;
&lt;/div&gt;

      @example
<caption>Markup with &lt;form&gt; tag</caption>
<description>Modals can be created from the <code class="prettify">&lt;form&gt;</code> tag as well. Make sure to set <code class="prettify">type="button"</code> on buttons that should not perform a submit.</description>
&lt;form id=&quot;myModal&quot; class=&quot;modal&quot; action="/users" method="post"&gt;
  &lt;div class=&quot;modal-header&quot;&gt;
    &lt;h2&gt;Create User&lt;/h2&gt;
    &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;modal&quot;&gt;&amp;times;&lt;/button&gt;
  &lt;/div&gt;
  &lt;div class=&quot;modal-body&quot;&gt;
    &lt;label for=&quot;name&quot;&gt;Name&lt;/label&gt;&lt;input id=&quot;name&quot; name=&quot;name&quot; type=&quot;text&quot;&gt;
  &lt;/div&gt;
  &lt;div class=&quot;modal-footer&quot;&gt;
    &lt;button type="button" data-dismiss=&quot;modal&quot;&gt;Cancel&lt;/button&gt;
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
  &lt;/div&gt;
&lt;/form&gt;


      @desc Creates a new modal dialog     
      @constructs

      @param {Object} options                     Component options
      @param {Mixed} options.element              jQuery selector or DOM element to use for dialog
      @param {String} options.heading             Title of the modal dialog (HTML)
      @param {String} options.content             Content of the dialog (HTML)
      @param {String} [options.type=default]      Type of dialog to display. One of default, error, notice, success, help, or info
      @param {Array} [options.buttons]            Array of button descriptors
      @param {String} [options.buttons.label]     Button label (HTML)
      @param {String} [options.buttons.className] CSS class name to apply to the button
      @param {Mixed} [options.buttons.click]      Click handler function or string 'hide' to hide the dialog
      @param {String} [options.remote]            URL to asynchronously load content from the first time the modal is shown
      @param {Boolean} [options.keyboard=true]    True to hide modal when escape key is pressed
      @param {Mixed} [options.backdrop=static]    False to not display transparent underlay, True to display and close when clicked, 'static' to display and not close when clicked
      @param {Mixed} [options.visible=true]       True to display immediately, False to defer display until show() called
     */
    construct: function(options) {
      // Catch clicks to dismiss modal
      this.$element.delegate('[data-dismiss="modal"]', 'click.dismiss.modal', this.hide);

      // Fetch content asynchronously, if remote is defined
      this.$element.find('.modal-body').loadWithSpinner(this.options.remote);

      // Add modal class to give styling
      this.$element.addClass('modal');

      // Make focusable
      this.$element.attr('tabIndex', -1);

      // Accessibility
      this.$element.attr('role', 'dialog'); // needed?
      this.$element.attr('aria-hidden', true);

      // Listen to changes to configuration
      this.$element.on('change:buttons', this._setButtons.bind(this));
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:fullscreen', this._setFullscreen.bind(this));

      // Render template, if necessary
      if (this.$element.children().length === 0) {
        this.$element.html(CUI.Templates['modal']($.extend({}, this.options, { buttons: '' })));
        this.applyOptions(true);
      }
      else {
        this.applyOptions();
      }
    },

    // Todo: fetch content method?

    defaults: {
      backdrop: 'static',
      keyboard: true,
      visible: true,
      type: 'default',
      fullscreen: false
    },

    _types: [
      'default',
      'error',
      'notice',
      'success',
      'help',
      'info'
    ],

    applyOptions: function(partial) {
      // Set all options
      if (!partial) {
        this._setContent();
        this._setHeading();
      }
      this._setButtons();
      this._setType();
      this._setFullscreen();
    },

    /** @ignore */
    _setType: function() {
      if (typeof this.options.type !== 'string' || this._types.indexOf(this.options.type) === -1) return;

      // Remove old type
      this.$element.removeClass(this._types.join(' '));

      // Add new type
      this.$element.addClass(this.options.type);

      // Re-center when heading, adds some left padding
      this.center();
    },

    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;

      this.$element.find('.modal-body').html(this.options.content);

      // Re-center when content changes
      this.center();
    },

    /** @ignore */
    _setHeading: function() {
      if (typeof this.options.heading !== 'string') return;

      this.$element.find('.modal-header h2').html(this.options.heading);

      // Re-center when content changes
      this.center();
    },

    /** @ignore */
    _setFullscreen: function() {
      if (this.options.fullscreen)
        this.$element.addClass('fullscreen');
      else
        this.$element.removeClass('fullscreen');
    },

    /** @ignore */
    _show: function() {
      $('body').addClass('modal-open');

      this.$element.trigger($.Event("beforeshow"));

      this._toggleBackdrop(true);
      this._setEscapeHandler(true);

      // Move to the bottom of body so we're outside of any relative/absolute context
      // This allows us to know we'll always float above the backdrop
      if (this.options.element.parentNode !== document.body) {
        this.$element.appendTo(document.body);
      }
      
      if (this.options.fullscreen) {
        var $body = this.$element.find('.modal-body');
        var $footer = this.$element.find('.modal-footer');
        $body.css({
          bottom: $footer.outerHeight()
        });
      }
      else {
        // Get width/height right
        this.$element.css('visibility', 'hidden').css('left', '0').show();
        this.center();
        this.$element.css('visibility', 'visible').css('left', '50%').hide();
      }

      var self = this;
      this.$element.addClass('in').attr('aria-hidden', false).fadeIn().focus();

      // IE9 fix for modals that suddenly expand
      if (!this.options.fullscreen)
        this.$element.css('width', this.$element.innerWidth());
    },

    /** @ignore */
    _hide: function() {
      $('body').removeClass('modal-open');

      this.$element.removeClass('in').attr('aria-hidden', true);

      this.$element.fadeOut().trigger('hidden');

      this._toggleBackdrop(false);
      this._setEscapeHandler(false);

      return this;
    },

    /** @ignore */
    _setEscapeHandler: function(show) {
      if (show && this.options.keyboard) {
        $('body').pointer('keyup', function (e) {
          if (e.which === 27)
            this.hide();
        }.bind(this));
      }
      else if (!show) {
        this.$element.off('keyup');
      }
    },

    /** @ignore */
    _removeBackdrop: function() {
        if (this.$backdrop && !this.get('visible')) {
          // Remove from the DOM
          this.$backdrop.remove();
          this.$backdrop = null;
        }
    },

    /** @ignore */
    _toggleBackdrop: function(show) {
      if (show && this.options.backdrop) {
        if (this.$backdrop)
          this.$backdrop.fadeIn();
        else {
          this.$backdrop = $('<div class="modal-backdrop" style="display: none;" />').appendTo(document.body).fadeIn();

          // Note: If this option is changed before the fade completes, it won't apply
          if (this.options.backdrop !== 'static') {
            this.$backdrop.click(this.hide);
          }
        }
      }
      else if (!show && this.$backdrop) {
        this.$backdrop.fadeOut(function() {
          this._removeBackdrop();
        }.bind(this));
      }
    },

    /**
      Center the modal in the screen

      @returns {CUI.Modal} this, chainable
     */
    center: function() {
      if (this.options.fullscreen)
        return this;

      var width = this.$element.outerWidth();
      var height = this.$element.outerHeight();

      this.$element.css('marginLeft', -width/2);
      this.$element.css('marginTop', -height/2);

      return this;
    },

    /** @ignore */
    _setButtons: function() {
      if (!$.isArray(this.options.buttons))  return;

      var $footer = this.$element.find('.modal-footer');

      // Remove existing children
      $footer.children().remove();

      $.each(this.options.buttons, function(index, button) {
        // Create an anchor if href is provided
        var el = $(button.href ? '<a class="button" />' : '<button type="button" />');

        // Add label
        el.html(button.label);

        if (button.click) {
          if (button.click === 'hide')
            el.attr('data-dismiss', 'modal');
          else if (typeof button.click === 'function')
            el.fipo('tap', 'click', button.click.bind(this, { dialog: this }));
        }

        if (button.href)
          el.attr('href', button.href);

        if (button.className)
          el.addClass(button.className);

        $footer.append(el);
      }.bind(this));
    }
  });

  CUI.util.plugClass(CUI.Modal);

  // Data API
  if (CUI.options.dataAPI) {
    $(function() {
      $('body').fipo('tap.modal.data-api', 'click.modal.data-api', '[data-toggle="modal"]', function (e) {
        var $trigger = $(this);

        // Get the target from data attributes
        var $target = CUI.util.getDataTarget($trigger);

        // Pass configuration based on data attributes in the triggering link
        var href = $trigger.attr('href');
        var options = $.extend({ remote: !/#/.test(href) && href }, $target.data(), $trigger.data());

        // Parse buttons
        if (typeof options.buttons === 'string') {
          options.buttons = JSON.parse(options.buttons);
        }

        // If a modal already exists, show it
        var instance = $target.data('modal');
        var show = true;
        if (instance && instance.get('visible'))
          show = false;

        // Apply the options from the data attributes of the trigger
        // When the dialog is closed, focus on the button that triggered its display
        $target.modal(options).one('hide', function() {
            $trigger.focus();
        });

        // Perform visibility toggle if we're not creating a new instance
        if (instance)
          $target.data('modal').set({ visible: show });

        // Stop links from navigating
        e.preventDefault();
      });
    });
  }
}(window.jQuery));
(function($) {
  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    toString: 'Tabs',

    extend: CUI.Widget,
    /**
      @extends CUI.Widget
      @classdesc A tabbed panel with several variants. A tabs instance ($.tabs or new CUI.Tabs) is not needed for basic functionality, only if programmatic access is necessary.

      <h2 class="line">Examples</h2>

      <h3>Default</h3>
      <div class="tabs">
        <nav>
          <a href="#" data-toggle="tab" class="active">Tab 1</a>
          <a href="#" data-toggle="tab">Tab 2</a>
          <a href="/remote.html" data-target="#" data-toggle="tab">Tab 3</a>
          <a href="#" data-toggle="tab" class="disabled">Disabled Tab</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This will be replaced :)</section>
        <section>This section will never be shown :(</section>
      </div>

      <h3>White</h3>
      <div class="tabs white">
        <nav>
          <a href="#" data-toggle="tab" class="active">Tab 1</a>
          <a href="#" data-toggle="tab">Tab 2</a>
          <a href="#" data-toggle="tab" class="disabled">Disabled Tab</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This section will never be shown :(</section>
      </div>

      <h3>Stacked</h3>
      <div class="tabs stacked">
        <nav>
          <a href="#" data-toggle="tab" class="active">Stacked Tab 1</a>
          <a href="#" data-toggle="tab">Stacked Tab 2</a>
          <a href="#" data-toggle="tab" class="disabled">Stacked Disabled Tab</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This section will never be shown :(</section>
      </div>

      <h3>Nav</h3>
      <div class="tabs nav">
        <nav>
          <a href="#" data-toggle="tab" class="active">Menu Item One</a>
          <a href="#" data-toggle="tab">Menu Item Two</a>
          <a href="#" data-toggle="tab" class="disabled">Disabled Menu Item</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This section will never be shown :(</section>
      </div>

      @example
<caption>Instantiate with Class</caption>
var tabs = new CUI.Tabs({
  element: '#myTabs',
  tabs: [
    {
      id: 'first-tab'
      label: 'First Tab',
      content: 'First tab content here!',
      active: true
    },
    {
      id: 'second-tab',
      remote: 'foobar.html',
      label: 'Remote tab'
    }
  ]
});

// Hide the tabs, set the active tab, and show it again
tabs.hide().set({active: 'second-tab'}).show();

// jQuery style works as well
$('#myTabs').tabs('show');

      @example
<caption>Instantiate with jQuery</caption>
$('#myTabs').tabs({
  type: 'stacked'
  tabs: [
    {
      id: 'first-tab'
      label: 'First Tab',
      content: 'First tab content here!',
      disabled: true
    },
    {
      label: 'Second tab'
      content: 'Without an ID, this tab can be addressed by its index (1).',
      active: true
    }
  ]
});

// A reference to the element's tabs instance is stored as data-tabs
var tabs = $('#myTabs').data('tabs');
tabs.hide();

      @example
<caption>Data API: Instantiate, set options, and show</caption>
<description>ou do not need to explicitly instantiate a tabs instance to use the tabs functionality. The data API will handle switching between tabs as long as you have created a <code class="prettify">&lt;div&gt;</code> with the <code class="prettify">tabs</code> class. When using markup to instantiate tabs, the overall container is <code class="prettify">div class=&quot;tabs&quot</code>. The tabs themselves are specified within the <code>nav</code> block as simple <code class="prettify">a</code> elements. The <code class="prettify">data-toggle=&quot;tab&quot;</code> attribute on <code>a</code> nav links is essential for the data API; do not omit. The <code>href</code> can either be an id of a following <code>section</code>, a simple anchor: <code>#</code>, or a remote link (see next example).</description>
&lt;div class=&quot;tabs&quot;&gt;
  &lt;nav&gt;
    &lt;a href=&quot;#&quot; data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Tab 1&lt;/a&gt;
    &lt;a href=&quot;#second_tab&quot; data-toggle=&quot;tab&quot;&gt;Tab 2&lt;/a&gt;
  &lt;/nav&gt;
  &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
  &lt;section id=&quot;second_tab&quot;&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. &lt;/section&gt;
&lt;/div&gt;

      @example
<caption>Data API: Instantiate, load content asynchronously, and show</caption>
<description>When loading content asynchronously, specify the jQuery selector for the element using <code>data-target</code> and the URL of the content to load with <code>href</code>.</description>
&lt;div class=&quot;tabs&quot;&gt;
  &lt;nav&gt;
    &lt;a href=&quot;remote.html&quot; data-target=&quot;#tab1&quot; data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Remote Tab 1&lt;/a&gt;
    &lt;a href=&quot;remote_dos.html&quot; data-target=&quot;#tab2&quot; data-toggle=&quot;tab&quot;&gt;Remote Tab 2&lt;/a&gt;
  &lt;/nav&gt;
  &lt;section id=&quot;tab1&quot; class=&quot;active&quot;&gt;&lt;/section&gt;
  &lt;section id=&quot;tab2&quot;&gt;&lt;/section&gt;
&lt;/div&gt;

      @example
<caption>Variants</caption>
<description>The possible variants, <code class="prettify">white</code>, <code class="prettify">stacked</code>, and <code class="prettify">nav</code>, are specified either via the <code>type</code> argument to the constructor, or via manually specifying the class alongside <code>tabs</code>.</description>
&lt;div class=&quot;tabs nav&quot;&gt;
  &lt;nav&gt;
    &lt;a href=&quot;#&quot; data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Menu Item One&lt;/a&gt;
    &lt;a href=&quot;#&quot; data-toggle=&quot;tab&quot;&gt;Menu Item Two&lt;/a&gt;
    &lt;a href=&quot;#&quot; data-toggle=&quot;tab&quot; class=&quot;disabled&quot;&gt;Disabled Menu Item&lt;/a&gt;
  &lt;/nav&gt;
  &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
  &lt;section&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. &lt;/section&gt;
  &lt;section&gt;This section will never be shown :(&lt;/section&gt;
&lt;/div&gt;


      @desc Creates a new tab panel    
      @constructs

      @param {Object} options                       Component options
      @param {Mixed} options.element                jQuery selector or DOM element to use for panel
      @param {String} [options.type=""]             Type of the tabs. Can be blank, or one of white, stacked, or nav
      @param {Mixed} [options.active=0]             ID string or numeric index of the active tab. This can also be specified in the tabs array.
      @param {Array} options.tabs                   Array of tab descriptors.
      @param {String} options.tabs.label            Label of the tab
      @param {String} options.tabs.content          Content of the tab
      @param {String} [options.tabs.id]             ID of the tab
      @param {Boolean} [options.tabs.disabled]      Whether the tab should be displayed grey and inactive
      @param {Boolean} [options.tabs.active]        Whether the tab should be the active tab. Only one tab can be active at a time
     */
    construct: function(options) {
      var that = this;

      // Add tabs class to give styling
      this.$element.addClass('tabs');

      // sane defaults for the options
      this.options = $.extend({}, this.defaults, this.options);

      // ensure the type is set correctly
      this._setType();

      // ensure at least one tab is active to start
      // either from the tab.active being set,
      // or options.active being set to the index/ID of the element
      if (this.options.tabs.length > 0 && (this.options.active === undefined || this.options.active === null)) {
        this.options.tabs.forEach(function(t, idx) {
          if (t.active) {
            that.options.active = idx;
            return false;
          }
        });

        if (typeof this.options.active !== 'number') {
          this.options.active = 0;
          this.options.tabs[0].active = true;
        }
      }

      // render template if tabs are passed in
      if (this.options.tabs.length > 0) {
        this._render();
      }
      
      // Accessibility
      _makeAccessible(this.$element);

      // we need to do one final setActive after the UI has rendered
      // this is in case the content is remote, or options.active was specified
      // but the tab itself was not specified as active
      setTimeout(this._setActive.bind(this), 0);

      // set up listeners for change events
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:tabs', this._render.bind(this));
      this.$element.on('change:active', this._setActive.bind(this));
    },

    defaults: {
      tabs: []
    },

    _types: [
      'white',
      'nav',
      'stacked'
    ],

    /** @ignore */
    _setType: function() {
      if (typeof this.options.type !== 'string' || this._types.indexOf(this.options.type) === -1) return;

      // Remove old type
      this.$element.removeClass(this._types.join(' '));

      // Add new type
      this.$element.addClass(this.options.type);
    },

    /** @ignore */
    _render: function() {
      if (!$.isArray(this.options.tabs)) return;

      // render the tabs
      this.$element.html(CUI.Templates['tabs'](this.options));
    },

    /** @ignore */
    _setActive: function() {
      var $tab, active = this.options.active;

      if (typeof active === 'number' && active < this.options.tabs.length && active >= 0) {
        $tab = this.$element.find('nav > a[data-toggle="tab"]:eq('+active+')');
      } else if (typeof active === 'string' && active.length > 0) {
        $tab = this.$element.find('nav > a[data-toggle="tab"]').filter('[data-target="#'+active+'"], [href="#'+active+'"]');
      }

      if ($tab)
        _activateTab($tab, true); // Activate the tab, but don't focus
    }
  });

  // Utility function used to make tabs accessible
  var _makeAccessible = function($element) {
    $element
      // Nav tab list
      .children('nav')
      .attr('role', 'tablist')
      
      // All tabs
      .children('a[data-toggle="tab"]')
      .attr('role', 'tab')
      
      // Disabled tabs
      .filter('.disabled')
      .attr('aria-disabled', true);
      
    $element
      // Tab panels
      .children('section')
      .attr('role', 'tabpanel');
  };
  
  // utility function used both in the event handler and the class proper
  // this is to avoid instantiating new classes for every tab instance
  var _activateTab = function($tab, noFocus) {
    var $target = CUI.util.getDataTarget($tab);

    // oops!
    if (!$tab || !$target) return;
    
    // ignore already selected tabs
    if ($tab.hasClass('active')) {
      return false;
    }
    
    // don't select and blur disabled tabs
    if ($tab.hasClass('disabled')) {
      $tab.blur(); // ensure disabled tabs do not receive focus
      return false;
    }

    // allow for non-id'd section switching
    if ($target.selector === '#') {
      $target = $tab.parents('.tabs').first().children('section:eq('+$tab.index()+')');
    }

    // test for remote load
    var href = $tab.attr('href');
    var remote = !/#/.test(href) && href;

    // load remote, if defined
    $target.loadWithSpinner(remote);

    // Active tab
    $tab
      .addClass('active')
      .attr('aria-selected', true)
      .attr('tabIndex', 0); // only the active tab should be in the tab order
    
    // Inactive tabs
    $tab.siblings('a[data-toggle="tab"]')
      // Set as inactive
      .removeClass('active')
      .attr('aria-selected', false)
      .attr('tabIndex', -1); // remove siblings from tab order
    
    // Active tab panel
    $target
      .addClass('active')
      .attr('hidden', false);
    
    // Inactive tab panels
    $target.siblings('section')
      .removeClass('active')
      .attr('hidden', true);

    // Focus on the active tab
    if (!noFocus)
      $tab.focus();
  };

  // utility function for setting up tabs already on the page
  var _onLoad = function() {
    // onload handle activating tabs, so remote content is loaded if set to active initially
    // this also handles tab setups that do not have the correct aria fields, etc.
    $('.tabs').each(function() {
      var $element = $(this), $tab;

      // find the first active tab (to trigger a load),
      // or set the first tab to be active
      if (($tab = $element.find('nav > a.active').first()).length === 0)
        $tab = $element.find('nav > a').first();

      // Set ARIA attributes
      _makeAccessible($element);

      // Activate the tab, but don't focus
      _activateTab($tab, true);
    });
  };

  // jQuery plugin
  CUI.util.plugClass(CUI.Tabs);

  if (CUI.options.dataAPI) {
    $(function() {
      // set up on onload handler
      // and the trigger based onload handler
      _onLoad();
      $('body').on('cui-onload.data-api', _onLoad);

      // Data API
      $('body').fipo('tap.tabs.data-api', 'click.tabs.data-api', '.tabs > nav > a[data-toggle="tab"]', function (e) {
        var $tab = $(this);

        // and show/hide the relevant tabs
        _activateTab($tab);

        if (e.type === 'click') {
          // Stop links from navigating
          e.preventDefault();

          // return false for good measure
          return false;
        }
      });
      
      /*
        Keyboard interaction
        Based on guidelines from http://www.w3.org/TR/2010/WD-wai-aria-practices-20100916/#tabpanel
        Some inspiration taken from http://codetalks.org/source/widgets/tabpanel/tabpanel1.html
      */
      $('body').pointer('keydown.tabs.data-api', '.tabs > nav > a[data-toggle="tab"]', function (e) {
        var $tab = $(this), key = e.which;
        
        if (key === 37 || key === 38) {
          /*
          Left Arrow - with focus on a tab, pressing the left arrow will move focus to the previous tab in the tab list and activate that tab. Pressing the left arrow when the focus is on the first tab in the tab list will move focus and activate the last tab in the list.
          Down arrow - behaves the same as right arrow in order to support vertical tabs
          */
          var prev = $tab.prevAll().not('.disabled').first();

          if (prev.length > 0) {
            _activateTab(prev);
          } else {
            _activateTab($tab.siblings().not('.disabled').last());
          }
          
          // Stop scroll action
          e.preventDefault();
        } else if (key === 39 || key === 40) {
          /*
          Right Arrow - with focus on a tab, pressing the right arrow will move focus to the next tab in the tab list and activate that tab. Pressing the right arrow when the focus is on the last tab in the tab list will move focus to and activate the first tab in the list.
          Up arrow - behaves the same as left arrow in order to support vertical tabs
          */
          var next = $tab.nextAll().not('.disabled').first();

          if (next.length > 0) {
            _activateTab(next);
          } else {
            _activateTab($tab.siblings().not('.disabled').first());
          }
          
          // Stop scroll action
          e.preventDefault();
        }
      });
    });
  }
}(window.jQuery));
(function($) {
  CUI.Alert = new Class(/** @lends CUI.Alert# */{
    toString: 'Alert',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc An optionally closable alert message.

      <div class="alert error">
        <button class="close" data-dismiss="alert">&times;</button>
        <strong>ERROR</strong><div>Uh oh, something went wrong with the whozit!</div>
      </div>

      @example
<caption>Instantiate with Class</caption>
var alert = new CUI.Alert({
  element: '#myAlert',
  heading: 'ERROR',
  content: 'An error has occurred.',
  closable: true
});

// Hide the alert, change the content, then show it again
alert.hide().set({ content: 'Another error has occurred.'}).show();

// jQuery style works as well
$('#myAlert').alert('hide');

      @example
<caption>Instantiate with jQuery</caption>
$('#myAlert').alert({
  heading: 'ERROR',
  content: 'An error has occurred.',
  closable: true
});

// Hide the alert, change the content, then show it again
$('#myAlert').alert('hide').alert({ heading: 'Another error has occurred.'}).alert('show');

// A reference to the element's alert instance is stored as data-alert
var alert = $('#myAlert').data('alert');
alert.hide();

      @example
<caption>Data API: Hide alert</caption>
<description>When an element within the alert has <code><span class="atn">data-dismiss</span>=<span class="atv">"alert"</span></code>, it will hide the alert.</description>
&lt;a data-dismiss=&quot;alert&quot;&gt;Dismiss&lt;/a&gt;

      @example
<caption>Markup</caption>
&lt;div class=&quot;alert error&quot;&gt;
  &lt;button class=&quot;close&quot; data-dismiss=&quot;alert&quot;&gt;&amp;times;&lt;/button&gt;
  &lt;strong&gt;ERROR&lt;/strong&gt;&lt;div&gt;Uh oh, something went wrong with the whozit!&lt;/div&gt;
&lt;/div&gt;

      @desc Creates a new alert
      @constructs

      @param {Object} options                               Component options
      @param {String} [options.heading=Type, capitalized]   Title of the alert (HTML)
      @param {String} options.content                       Content of the alert (HTML)
      @param {Boolean} options.closable                     Array of button descriptors
      @param {String} [options.size=small]                  Size of the alert. Either large or small.
      @param {String} [options.type=error]                  Type of alert to display. One of error, notice, success, help, or info
    */
    construct: function(options) {
      // Catch clicks to dismiss alert
      this.$element.delegate('[data-dismiss="alert"]', 'click.dismiss.alert', this.hide);

      // Add alert class to give styling
      this.$element.addClass('alert');

      // Listen to changes to configuration
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:closable', this._setClosable.bind(this));
      this.$element.on('change:size', this._setSize.bind(this));

      // Read in options "set" by markup so we don't override the values they set
      $.each(this._types, function(index, type) {
        if (this.$element.hasClass(type)) {
          this.options.type = type;
          return false;
        }
      }.bind(this));

      $.each(this._sizes, function(index, size) {
        if (this.$element.hasClass(size)) {
          this.options.size = size;
          return false;
        }
      }.bind(this));

      // Render template, if necessary
      if (this.$element.children().length === 0) {
        // Set default heading
        this.options.heading = this.options.heading === undefined ? this.options.type.toUpperCase() : this.options.heading;

        this.$element.html(CUI.Templates['alert'](this.options));

        this.applyOptions();
      }
      else {
        this.applyOptions(true);
      }
    },

    defaults: {
      type: 'error',
      size: 'small',
      heading: undefined,
      visible: true,
      closable: true
    },

    _types: [
      'error',
      'notice',
      'success',
      'help',
      'info'
    ],

    _sizes: [
      'small',
      'large'
    ],

    applyOptions: function(partial) {
      if (!partial) {
        this._setHeading();
        this._setContent();
      }
      this._setClosable();
      this._setType();
      this._setSize();
    },

    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;

      this.$element.find('div').html(this.options.content);
    },

    /** @ignore */
    _setHeading: function() {
      if (typeof this.options.content !== 'string') return;

      this.$element.find('strong').html(this.options.heading);
    },

    /** @ignore */
    _setType: function() {
      if (typeof this.options.type !== 'string' || this._types.indexOf(this.options.type) === -1) return;

      // Remove old type
      this.$element.removeClass(this._types.join(' '));

      // Add new type
      this.$element.addClass(this.options.type);
    },

    /** @ignore */
    _setSize: function() {
      if (typeof this.options.size !== 'string' || this._sizes.indexOf(this.options.size) === -1) return;

      if (this.options.size === 'small')
        this.$element.removeClass('large');
      else
        this.$element.addClass('large');
    },

    /** @ignore */
    _setClosable: function() {
      var el = this.$element.find('.close');
      if (!el.length) {
        // Add the close element if it's not present
        this.$element.prepend('<button class="close" data-dismiss="alert">&times;</button>');
      }
      else {
        el[this.options.closable ? 'show' : 'hide']();
      }
    }
  });

  CUI.util.plugClass(CUI.Alert);

  // Data API
  if (CUI.options.dataAPI) {
    $(function() {
      $('body').fipo('tap.alert.data-api', 'click.alert.data-api', '[data-dismiss="alert"]', function(evt) {
        $(evt.target).parent().hide();
      });
    });
  }
}(window.jQuery));
(function ($) {
  CUI.Rail = new Class(/** @lends CUI.Rail# */{
    toString: 'Rail',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc this widget extends the rail to the following features
        - enables foldable sections
        - optionally pull-to-refresh functionality for the rail

      <div id="myRail" class="rail">
        <div class="pull-to-refresh">
          <div class="icon"></div>
          <div class="message">
            <i class="arrow"></i>
            <i class="spinner large"></i>
            <span class="pull">Pull to refresh</span>
            <span class="release">Release to refresh</span>
            <span class="loading">Loading</span>
          </div>
        </div>
        <div class="wrap">
          Place your content here.
        </div>
      </div>
      @example
<caption>Instantiate with Class</caption>
var alert = new CUI.Rail({
  element: '#myRail',
  refreshCallback: function () { // if the callback is set then the pull-to-refresh feature is getting enabled
    var def = $.Deferred(); 
    setTimeout(function() {
      def.resolve();      
    }, 3000); 

    return def.promise(); // it is expected that the callback returns a promise
  }
});
// Within the callback function execute your ajax call to get the necessary data
// reminder jQuery.ajax returns a promise by default

      @example
<caption>Instantiate with jQuery</caption>
$('#myRail').rail({
  refreshCallback: function () {
    var def = $.Deferred();
    setTimeout(function() {
      def.resolve();      
    }, 3000); 

    return def.promise();
  }
});

      @example
<caption>Markup</caption>
&lt;div class=&quot;rail right&quot; role=&quot;complementary&quot;&gt;
  &lt;div class=&quot;pull-to-refresh&quot;&gt;
    &lt;div class=&quot;message&quot;;&gt;
      &lt;i class=&quot;arrow&quot;;&gt;&lt;/i;&gt;
      &lt;i class=&quot;spinner large&quot;;&gt;&lt;/i;&gt;
      &lt;span class=&quot;pull&quot;;&gt;Pull to refresh&lt;/span;&gt;
      &lt;span class=&quot;release&quot;;&gt;Release to refresh&lt;/span;&gt;
      &lt;span class=&quot;loading&quot;;&gt;Loading&lt;/span;&gt;
    &lt;/div;&gt;
  &lt;/div&gt;
  &lt;div class=&quot;wrap&quot;&gt;
    &lt;section&gt;
        &lt;h4&gt;Update Feed&lt;/h4&gt;
    &lt;/section&gt;
    &lt;section class=&quot;foldable&quot;&gt;
        &lt;h4 class=&quot;heading&quot;&gt;Revised asset ready for review&lt;/h4&gt;
        &lt;div class=&quot;fold smallText greyText lightText&quot;&gt;Modified yesterday by Rob Cobourn&lt;/div&gt;
        &lt;p class=&quot;small&quot;&gt;I created a new segment thing for the...&lt;/p&gt;
    &lt;/section&gt;
  &lt;/div&gt;
&lt;/div&gt;
&lt;div class=&quot;content&quot;&gt;
  &lt;p&gt;Content.&lt;/p&gt;
&lt;/div&gt;

      @desc extends the functionality of a rail
      @constructs

      @param {Object} options                               Component options
      @param {Function} options.refreshCallback             Callback to be called after a refresh is triggered
    */
    construct: function(options) {
      var e = this.$element,
          opt = $.extend(true, {}, this.defaults, options),
          html = '<div class="pull-to-refresh">' +
                  '<div class="icon"></div>' +
                  '<div class="message">' +
                    '<i class="arrow"></i>' +
                    '<i class="spinner large"></i>' +
                    '<span class="pull">' + opt.message.pull + '</span>' +
                    '<span class="release">' + opt.message.release + '</span>' +
                    '<span class="loading">' + opt.message.loading + '</span>' +
                  '</div>' +
                '</div>',
            _ = { // fill all locals
            rail: e,
              content: e.find('.wrap'),
              ptr: e.find('.pull-to-refresh') 
            },
            foldable = _.content.find('section.foldable'),
            switcher = _.content.find('.rail-switch');

      // Accessibility
      _makeAccessible(e);

      // enable foldable section
      foldable.each(function (i, e) {
        var f = $(e),
            trigger = f.find('.heading');

        trigger.fipo('tap', 'click', function (ev) {
          f.toggleClass('open');
        });
      });

      //enable swiping
      $(document).finger('swipe', function (e) {
        var openTriggerArea = 30,
            w = _.rail.width(),
            x = e.touches.start[0].pageX,
            dir = e.direction;

        
          if (dir === 'left') { // close
            if (x < w) {
              _.rail.addClass('closed');
            }
          } else if (dir === 'right') { // open
            if (x < openTriggerArea) {
              _.rail.removeClass('closed');
            }
          }
      });

      // rail switcher
      if (switcher.length > 0) {
        this._initRailSwitcher(_.content, switcher);
      }

      // accordion
      if (_.content.hasClass('accordion')) {
        this._initAccordion(_.content);
      }


      // pull-to-refresh    
      if (options.refreshCallback) { // the refreshable option will be activated of the refreshCallback is set
        if (!_.ptr.get(0)) { // add markup if there is non
          _.rail.prepend(html);  
          _.ptr = e.find('.pull-to-refresh');
        }

        _ = $.extend(_, {
          arrow: _.ptr.find('.arrow'),
          spinner: _.ptr.find('.spinner'),
          pull: _.ptr.find('.pull'),
          release: _.ptr.find('.release'),
          loading: _.ptr.find('.loading'),
          h: _.ptr.height(),
          active: false,
          waiting: false
        });

        // add locals to the object
        this._ = _;
        // add callback
        this.callback = options.refreshCallback;

        // add pullable class to apply styling
        _.rail.addClass('pullable');

        // enable scrolling to top from point 0
        _.content.finger('touchstart', $.proxy(this._handleTouchstart, this))
                .finger('touchmove', $.proxy(this._handleTouchmove, this))
                .finger('touchend', $.proxy(this._handleTouchend, this));    
      }
    },

    defaults: {
      message: {
        pull: 'Pull to refresh',
        release: 'Release to refresh',
        loading: 'Loading'
      }
    },

    _handleTouchstart: function (ev) {
      var _ = this._;

      if (_.waiting) {
        return true;
      }

      if (_.rail.scrollTop() === 0) {
        _.rail.scrollTop(1);
      } 
    },

    _handleTouchmove: function (ev) {
      var _ = this._,
          delay = _.h / 3 * 2, // spacing where the arrow is not moved
          top = _.rail.scrollTop(), // current scrollTop
          deg = 180 - (top < -_.h ? 180 : // degrees to move for the arrow (starts at 180° and decreases)
                      (top < -delay ? Math.round(180 / (_.h - delay) * (-top - delay)) 
                      : 0));

      if (_.waiting) {
        return true;
      }

      // handle arrow UI
      _.arrow.show();
      _.arrow.css('transform', 'rotate('+ deg + 'deg)');

      // hide spinner while showing the arrow
      _.spinner.hide();


      if (-top > _.h) { // release state
        _.pull.css('opacity', 0);
        _.loading.css('opacity', 0);
        _.release.css('opacity', 1);

        _.active = true;
      } else if (top > -_.h) { // pull state
        _.release.css('opacity', 0);
        _.loading.css('opacity', 0);
        _.pull.css('opacity', 1);

        _.active = false;
      } 
    },

    _handleTouchend: function (ev) {
      var _ = this._,
          top = _.rail.scrollTop();

      if (_.active) { // loading state
        ev.preventDefault();

        _.waiting = true;

        _.release.css('opacity', 0);
        _.pull.css('opacity', 0);
        _.loading.css('opacity', 1);

        // show spinner
        _.arrow.hide();
        _.spinner.show();

        // fix bar
        _.rail.scrollTop(top - _.h);
        _.ptr.css('position', 'static');
        _.active = false;

        // execute callback
        this.callback().done(function() {
          _.ptr.animate({
            height: 0
          }, 'fast', 'linear', function () {
            _.ptr.css('position', 'absolute');
            _.ptr.height(_.h);
            _.waiting = false;
          });  
        });
      }
    },

    _initAccordion: function (con) {
      var activeAccordion = 'active-accordion',
          accordions = con.find('section'),
          closedHeight = accordions.outerHeight(true); // height of one closed accordion


      accordions.each(function (i, e) {
        var f = $(e),
            containerHeight = con.outerHeight(),
            contentHeight = containerHeight - (accordions.length * closedHeight), // height of the content for one open accordion
            trigger = f.find('.heading'),
            fold = f.find('.fold');

        trigger.fipo('tap', 'click', function (ev) {
          var curHeight = fold.height(),
              targetHeight,
              cur = con.data(activeAccordion);

          if (cur) {
            cur.removeClass('open').find('.fold').height(0);
          }
          
          fold.height(contentHeight);
          con.data(activeAccordion, f.addClass('open'));

        });
      });  
    },

    _initRailSwitcher: function (con, switcher) {
      var trigger = switcher.find('nav a'),
          views = con.find('.rail-view'),
          active = con.find('.rail-view.active'),
          search = switcher.find('input'),
          cl = 'active';

      // init switcher
      trigger.each(function (i, e) {
        var t = $(e),
            viewName = t.data('view'),
            view = con.find('.rail-view[data-view="'+ viewName +'"]');

        t.fipo('tap', 'click', function (ev) {
          ev.preventDefault();

          views.removeClass(cl);
          trigger.removeClass(cl);

          $(this).addClass(cl);
          view.toggleClass('active'); 
        });
      });
    }
    
  });

  var _makeAccessible = function($element) {
    // The rail is complementary content
    // See: http://www.w3.org/TR/wai-aria/roles#complementary
    $element.attr('role', 'complementary');
  };
  
  CUI.util.plugClass(CUI.Rail);

}(window.jQuery));
(function($) {
  var uuid = 0;

  CUI.Popover = new Class(/** @lends CUI.Popover# */{
    toString: 'Popover',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc A box which points at an element

      @desc Creates a new popover
      @constructs

      @param {Object} options                               Component options
      @param {String} options.content                       Content of the popover (HTML)
    */
    construct: function(options) {
      // Add CSS class to give styling
      this.$element.addClass('popover');

      // Listen to changes to configuration
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:pointAt', this._setPointAt.bind(this));
      this.$element.on('change:pointFrom', this._setPointFrom.bind(this));

      // Render template, if necessary
      if (this.$element.html() === '') {
        this.applyOptions();
      }
      else {
        this.applyOptions(true);
      }

      this.hide();
      this.uuid = (uuid += 1);
      this.cachedPointFrom = this.options.pointFrom;
    },

    defaults: {
      pointFrom: 'bottom',
      alignFrom: 'left',
      pointAt: $('body'),
      arrowPos: '',
      visible: true
    },

    _directions: [
      'top',
      'bottom',
      'right',
      'left'
    ],

    applyOptions: function(partial) {
      if (!partial) {
        this._setContent();
      }
      this._setPointAt();
      this._setPointFrom();
    },

    setPosition: function(position) {
      // Reset point from
      this._doSetPointFrom(this.options.pointFrom);

      // move element to under body for absolute positioning
      if (this.$element.parent().get(0) !== $('body').get(0)) {
        this.$element.detach().appendTo($('body'));
      }
      
      var screenWidth = $(window).width();
      var screenHeight = $(window).height();

      var pointFrom = this.options.pointFrom;
      var top = position[1];
      var left = position[0];

      var width = this.$element.outerWidth();
      var height = this.$element.outerHeight();

      var arrowHeight = Math.round((this.$element.outerWidth() - this.$element.width())/1.5);
      
      // Switch direction if we fall off screen
      if (pointFrom === 'top' && top - height - arrowHeight < 0) {
        pointFrom = 'bottom';
        this._doSetPointFrom('bottom');
      }
      if (pointFrom === 'bottom' && top + height + arrowHeight > screenHeight) {
          pointFrom = 'top';
          this._doSetPointFrom('top');
      }

      // Base on pointFrom
      if (pointFrom === 'bottom' || pointFrom === 'top') {
        left -= width/2;
      }

      if (pointFrom === 'bottom') {
        top += arrowHeight; // TBD find out the size of 1rem
      } else if (pointFrom === 'top') {
        top -= height + arrowHeight; // TBD find out the size of 1rem
      }
      
      // Offset if we collide with the right side of the window
      var offset = 0;
      var leftOffset = screenWidth - (left + width);
      if (leftOffset < 0)
        offset = leftOffset;
      
      // Offset if we collide with the left side of the window
      if (left < 0)
        offset = -left;

      // Apple offset
      left += offset;
      
      // Position arrow
      if (offset < 0) {
        this.$element.addClass('arrow-pos-right');
      }
      else if (offset > 0) {
        this.$element.addClass('arrow-pos-left');
      }
      else {
        this.$element.removeClass('arrow-pos-left arrow-pos-right');
      }
      
      // Position body
      this.$element.css({
        top: top,
        left: left
      });
    },

    /** @ignore */
    _show: function() {
      this.$element.show();

      $('body').fipo('tap.popover-hide-'+this.uuid, 'click.popover-hide-'+this.uuid, function(e) {
        var el = this.$element.get(0);

        if (e.target !== el && !$.contains(el, e.target)) {
          this.hide();
          $('body').off('.popover-hide-'+this.uuid);
        }
      }.bind(this));
    },

    /** @ignore */
    _hide: function() {
      this.$element.hide();
      $('body').off('.popover-hide-'+this.uuid);
    },

    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;

      this.$element.html(this.options.content);
    },


    /** @ignore */
    _setPointAt: function() {
      var $el = $(this.options.pointAt);
      
      if ($el.length !== 1) return;

      // ensure we have the same parent so relative positioning works like a charm.
      // a sad, sad charm.
      if (this.$element.parent().get(0) !== $el.parent().get(0)) {
        this.$element.detach().after($el);
      }

      // we could probably use more variables here
      // - said no one ever
      var relativePosition = $el.position(),
          absolutePosition = $el.offset(),
          pointAtHeight = $el.outerHeight(),
          pointAtWidth = $el.outerWidth(),
          screenWidth = $(window).width(),
          screenHeight = $(window).height(),
          pointFrom = this.options.pointFrom,
          left = relativePosition.left,
          top = relativePosition.top,
          absTopDiff = absolutePosition.top - top,
          absLeftDiff = absolutePosition.left - left,
          width = this.$element.outerWidth(),
          height = this.$element.outerHeight(),
          parentWidth = this.$element.positionedParent().width(),
          parentPadding = parseFloat(this.$element.parent().css('padding-right')),
          arrowHeight = Math.round((this.$element.outerWidth() - this.$element.width())/1.5),
          right, offset = 0;

      // Switch directions if we fall off screen
      if (pointFrom === 'top' && absolutePosition.top - height - pointAtHeight - arrowHeight < 0) {
        pointFrom = 'bottom';
      }

      if (pointFrom === 'bottom' && absolutePosition.top + height + arrowHeight + pointAtHeight > screenHeight) {
        pointFrom = 'top';
      }

      // set our point direction
      this._doSetPointFrom(pointFrom);

      if (pointFrom === 'bottom' || pointFrom === 'top') {
        left -= (width/2 - pointAtWidth/2); // account for the width of the popover, as well as the width of the pointed-at element

        if (pointFrom === 'bottom') {
          top += (pointAtHeight + arrowHeight);
        } else if (pointFrom === 'top') {
          top -= (height + pointAtHeight - arrowHeight);
        }
      }

      if (pointFrom === 'left' || pointFrom === 'right') {
        top -= (height/2 - pointAtHeight/2);

        if (pointFrom === 'left') {
          left -= (width + arrowHeight);
        } else if (pointFrom === 'right') {
          left += (pointAtWidth + arrowHeight);
        }
      }

      // for right-aligned popovers, we need to take into account the positioned parent width, as well as the padding
      right = parentWidth - left - width + parentPadding*2;

      if (absLeftDiff + left < 0) {
        offset = -(absLeftDiff + left);
      } else if (absLeftDiff + left + width > screenWidth) {
        offset = screenWidth - (absLeftDiff + left + width);
      }

      // adjust if we would be offscreen
      left += offset;
      right -= offset;

      if (this.options.alignFrom === 'right') {
        this.$element.css({
          top: top,
          left: 'auto',
          right: right
        });
      } else {
        this.$element.css({
          top: top,
          left: left,
          right: 'auto'
        });
      }

      var set_arrows = false;
      
      // Position arrow
      if (pointFrom === 'top' || pointFrom === 'bottom') {
        if (offset < 0 || this.options.arrowPos === 'right') {
          this.$element.addClass('arrow-pos-right');
          set_arrows = true;
        } else if (offset > 0 || this.options.arrowPos === 'left') {
          this.$element.addClass('arrow-pos-left');
          set_arrows = true;
        }
      }

      if (!set_arrows) {
        this.$element.removeClass('arrow-pos-left arrow-pos-right');
      }
    },

    _doSetPointFrom: function(pointFrom) {
      // Remove old direction
      this.$element.removeClass('arrow-top arrow-bottom arrow-right arrow-left');

      if (pointFrom === 'bottom')
        this.$element.addClass('arrow-top');
      else if (pointFrom === 'top')
        this.$element.addClass('arrow-bottom');
      else if (pointFrom === 'left')
        this.$element.addClass('arrow-right');
      else if (pointFrom === 'right')
        this.$element.addClass('arrow-left');
    },

    /** @ignore */
    _setPointFrom: function() {
      var pointFrom = this.options.pointFrom;
      if (this._directions.indexOf(pointFrom) === -1)
        return;

      if (this.cachedPointFrom !== pointFrom) {
        this._doSetPointFrom(pointFrom);
        this.cachedPointFrom = pointFrom;
      }
      
    }
  });

  CUI.util.plugClass(CUI.Popover);

  $(function() {
    $('body').fipo('tap.popover.data-api', 'click.popover.data-api', '[data-toggle="popover"]', function (e) {
      var $trigger = $(this),
          $target = CUI.util.getDataTarget($trigger);

      var popover = $target.popover($.extend({pointAt: $trigger}, $target.data(), $trigger.data())).data('popover');

      popover.toggleVisibility();
    }).on('click.popover.data-api', '[data-toggle="popover"]', false);
  });
}(window.jQuery));
(function($) {
  CUI.DropdownList = new Class(/** @lends CUI.DropdownList# */{
    toString: 'DropdownList',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A dropdown list widget
      
      <p>
        Dropdown lists are meant to be used by other widgets like Filters and Dropdowns.
        Dropdown lists are invisible by default and can only be made visible by explicitly calling the methods
        "show" (resp. "hide") on the widget.
      </p>
      
      @desc Creates a dropdown list appended to any DOM element
      @constructs
      
      @param {Object}          options                               Component options
      @param {Array}           [options.options]                Array of options in the list
      @param {Function}        [options.optionRenderer=null]                Callback function to render one option
      @param {jQuery Object}   [options.positioningElement=null]     If this optional element is given, the dropdown list
                                                                     will be placed beyond it instead of the standard element
      @param {String}   [options.cssClass=null]     An optional CSS class string that will be added to the list.

      @param {int}      [options.scrollBuffer]      Distance from bottom of list (px) before scrolled bottom event is fired. Use with infinite loading.
      @param {String}   [options.loadingIndicator]  HTML markup to show when loading in new content.
      @param {String}   [options.noMoreOptions]     Text to show when there are no more options to load.
    */
    construct: function(options) {

        var container = $("<div class=\"dropdown-container\">");
         
        var el = (this.options.positioningElement) ? this.options.positioningElement : this.$element;
        el.after(container);
        el.detach();
        container.append(el);
        this.containerElement = container;

        this.$element.on('change:options change:optionRenderer', function (event) {
            if (event.widget !== this) return; // Only listen to own events
            this.update();
        }.bind(this));
     

        // Listen to events 
        this.$element.on("keydown", "", this._keyPressed.bind(this));

        this.$element.on("blur", "", function() {
           // Did anyone want us to prevent hiding?
           if (this.preventHiding) {
             this.preventHiding = false;
             return;
           }
           this.hide();
        }.bind(this));
       
    },
    
    defaults: {
        positioningElement: null,
        optionRenderer: null,
        options: ["Apples", "Pears", "Bananas", "Strawberries"],
        cssClass: null,
        visible: false,
        scrollBuffer: 10,
        loadingIndicator: "<div class='spinner'></div>"
    },

    listElement: null,
    containerElement: null,
    currentIndex: -1,
    preventHiding: false,
    
    /**
     * Show this list
     */
    show: function() {
        // Hide old list (if any!)
        this._unrender();
        this.currentIndex = -1;
        this.$element.focus();
        this._render();
    },
    
    /**
     * Hide this list with an optional delay in millis
     * @param int delay Delay before hiding element in milliseconds
     * @return void or timeout object if a delay was given
     */
    hide: function(delay) {
        if (delay > 0) {
            return setTimeout(this._unrender.bind(this), delay);
        } else {
            this._unrender();
        }
        return null;
    },
    
    /**
     * @return boolean true, if this list is currently visible
     */
    isVisible: function() {
        return this.options.visible;
    },
    
    /**
     * Updates the rendering of this widget.
     */
    update: function() {
        if (this.listElement) {
            this._unrender();
            this._render();
        }
    },

    /**
    * Append items to the end of the list.
    */
    addItems: function(items) {
        var offset = this.listElement.find('li').not('.loading-indicator').length;
        if(this.listElement) {
            var list = this.listElement.find('ul');
            $.each(items, function(index, value) {
                var el = (this.options.optionRenderer) ? this.options.optionRenderer(index, value) : $("<span>" + value.toString() + "</span>");
                var li = $("<li data-id=\"" + (offset+index) + "\">");
                if (index === this.currentIndex) li.addClass("selected");
                li.append(el);
                list.append(li);
                this.options.options.push(value);
            }.bind(this));
        }
    },
    
    getNumberOfItems: function() {
        var offset = this.listElement.find('li').not('.loading-indicator').length;
        return offset;
    },

    /**
    * Appends a loading indicator to the end of the list. Useful for loading in extra content
    */
    addLoadingIndicator: function() {
        if(this.listElement) {
            this.listElement.find("ul").append($("<li>" + this.options.loadingIndicator + "</li>").addClass("loading-indicator"));
        }
    },

    /**
    * Removes loading indicator from the list.
    */
    removeLoadingIndicator: function() {
      if (this.listElement) {
        this.listElement.find(".loading-indicator").remove();
      }
    },
    
    /** @ignore */    
    _keyPressed: function(event) {        
        var key = event.keyCode;
        
        // Only listen to keys if there is an autocomplete box right now
        if (!this.listElement) {
            return;
        }

        var currentIndex = this.currentIndex;
        
        if (key === 38) { // up
            event.preventDefault();
            if (currentIndex > 0) currentIndex--;
        }
        
        if (key === 40) { // down
            event.preventDefault();
            if (currentIndex < (this.listElement.find("li").length - 1)) currentIndex++;
        }
        
        if (key === 27) { // escape
            event.preventDefault();
            this.hide();
            return;
        }
        
        if (key === 13 || key === 20) { // return or space
           event.preventDefault();
           if (currentIndex >= 0) {
                this._triggerSelect(currentIndex);
                return;
           }
        }
        
        this.currentIndex = currentIndex;

        // Set new css classes
        var listItems = this.listElement.find("li");
        listItems.removeClass("selected");
        if (currentIndex >= 0) {
            var el = $(listItems[currentIndex]);
            el.addClass("selected");

            // Scroll to position if necessary
            var t = el.position().top;
            this.listElement.animate({scrollTop: t}, 50);
        }
    },
    /** @ignore */    
    _unrender: function() {       
        if (this.listElement) {
            this.listElement.remove();
            this.listElement = null;  
        }

        this.containerElement.removeClass("dropdown-visible");

        this.options.visible = false;
    },

    /** @ignore */    
    _render: function() {
        var options = this.options.options;
        if (options.length === 0) return;
               
        var list = $("<ul></ul>");
        if (this.options.cssClass) list.addClass(this.options.cssClass);

        $.each(options, function(index, value) {
            var el = (this.options.optionRenderer) ? this.options.optionRenderer(index, value) : $("<span>" + value.toString() + "</span>");
            var li = $("<li data-id=\"" + index + "\">");
            if (index === this.currentIndex) li.addClass("selected");
            li.append(el);
            list.append(li);
        }.bind(this));
        
        list.on("click", "li:not(.loading-indicator)", function(event) {
            event.preventDefault();
            this._triggerSelect($(event.target).closest("li").attr("data-id"));
        }.bind(this));
        
        // Calculate correct position and size on screen
        var el = (this.options.positioningElement) ? this.options.positioningElement : this.$element;
        var left = el.position().left + parseFloat(el.css("margin-left"));
        var top = el.position().top + el.outerHeight(true) - parseFloat(el.css("margin-bottom"));

        var width = el.outerWidth(false);
        var container = $("<div class=\"dropdown-list\">");
        container.append(list);
        list = container;

        list.css({position: "absolute",
                  "z-index": "2000",
                  left: left + "px", 
                  top: top + "px", 
                  width: width + "px"});
        this.containerElement.addClass("dropdown-visible");

        list.on("scroll", "", function(event) {
            // Trigger scroll event
            this._listScrolled();
        }.bind(this));

        list.on("mousedown", "", function() {
            // Next blur event should NOT hide the list. (Clicked scroll bar)
            this.preventHiding = true;
        }.bind(this));

        el.after(list);
        this.listElement = list;

        this.options.visible = true;

    },

    /** @ignore **/
    _listScrolled: function() {
      if(this._reachedListBottom()) {
          this._triggerScrolledBottom();
      }
    },

    /** @ignore **/
    _reachedListBottom: function() {
      var listWrapper = this.listElement;
      var list = this.listElement.find('ul');
      return (list.height() - listWrapper.height() <= listWrapper.scrollTop() + this.options.scrollBuffer);
    },
    
    /** @ignore */    
    _triggerSelect: function(index) {
        // Trigger a change event
        this.$element.focus();
        var e = $.Event('dropdown-list:select', {
          selectedIndex: index,
          selectedValue: this.options.options[index]
        });
        this.$element.trigger(e);    
    },

    /** @ignore */
    _triggerScrolledBottom: function(index) {
        // Trigger a scrolled bottom event
        var e = $.Event('dropdown-list:scrolled-bottom');
        this.$element.trigger(e);
    }
    
  });

  CUI.util.plugClass(CUI.DropdownList);
}(window.jQuery));
(function($) {
  CUI.Dropdown = new Class(/** @lends CUI.Dropdown# */{
    toString: 'Dropdown',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A dropdown widget
      
        <p>
            <select name="foo" data-init="dropdown" multiple data-placeholder="Please Select items">
                <option>One</option>
                <option>Two</option>
                <option>Three</option>
            </select>
        </p>
        <p>
        Currently this widget does only support creation from an existing &lt;select&gt;&lt;/select&gt; field.
        </p>
    @example
    <caption>Instantiate by data API</caption>
    &lt;select name="foo" data-init="dropdown" multiple data-placeholder="Please Select items"&gt;
        &lt;option&gt;One&lt;/option&gt;
        &lt;option&gt;Two&lt;/option&gt;
        &lt;option&gt;Three&lt;/option&gt;
    &lt;/select&gt;

    @example
    <caption>Instantiate with Class</caption>
    var dropdown = new CUI.Dropdown({
      element: '#myOrdinarySelectBox'
    });

    // Changes the select box into a beautiful widget.

    @example
    <caption>Instantiate by jQuery plugin</caption>
    $("select").dropdown();

    // Changes all select boxes into beautiful widgets.
       
       
      @desc Creates a dropdown from any select element
      @constructs
      
      @param {Object}   options                               Component options
      @param {Array} [options.options=empty array]      Selectable options
      @param {boolean} [options.multiple=false]      Is this a multiselect widget?
      @param {boolean} [options.editable=false]      May the user edit the option text?
      @param {String} [options.placeholder="Select"]      Placeholder string to display in empty widget
      @param {boolean} [options.disabled=false]      Is this widget disabled?
      @param {boolean} [options.hasError=false]      Does this widget contain an error?
      
    */
    construct: function(options) {

        this._render();

        // isMobile should be replace with a CUI.Util method
        // Editable dropdown can't be natively rendered.
        if (this._isMobile() && !this.options.editable) {
            this._initForMobile();
        } else {
            this._initForDesktop();
        }
        
        var $button = this.$element.find('>div>button');
        if ($button.length > 0 && $button.attr('type') === undefined) {
            $button[0].setAttribute('type', 'button');
        }

    },
    
    defaults: {
        options: [],
        multiple: false,
        placeholder: "Select",
        disabled: false,
        editable: false,
        hasError: false
    },
    
    dropdownList: null,
    autocompleteList: null,
    syncSelectElement: null,
    buttonElement: null,
    positioningElement: null,
    inputElement: null,
    hasFocus: false,

    _initForMobile: function() {
        this.$element.addClass('mobile');

        this.buttonElement.on("click", function() {
            this._openSelectInput();
        }.bind(this));

        this.$element.find('select').on("change", function() {
            this._update(true);
        }.bind(this));

        // place the hidden select input at the right position for ipad and iphone
        this._placeSelect();
    },

    _initForDesktop: function() {
        this.dropdownList = new CUI.DropdownList({
            element: this.buttonElement,
            positioningElement: this.positioningElement,
            options: this.options.options,
            optionRenderer: this._optionRenderer.bind(this)
        });

        if (this.options.editable) {
            this.autocompleteList = new CUI.DropdownList({
                element: this.inputElement,
                positioningElement: this.positioningElement,
                options: this.options.options,
                optionRenderer: this._optionRendererAutocomplete.bind(this),
                cssClass: "autocomplete-results"
            });
        }
        
        this.buttonElement.on("dropdown-list:select", "", this._processSelect.bind(this));
        
        this.buttonElement.on("click", "", function(event) {
            event.preventDefault();
            this.dropdownList.show();
        }.bind(this));
        
        // Auto completion
        this.inputElement.on("click", "", function() {
           if (this.autocompleteList !== null) this._adjustAutocompleter();
        }.bind(this));
        this.inputElement.on("input", "", function() {
           if (this.autocompleteList !== null) this._adjustAutocompleter();
        }.bind(this));
        this.inputElement.on("dropdown-list:select", "", function(event) {
            this.inputElement.val(event.selectedValue);
            this.autocompleteList.hide();
        }.bind(this));
        
        // Correct focus
        this.$element.children().on("focus", "", function() {
            this.hasFocus = true;
            this._update();
        }.bind(this));
        this.$element.children().on("blur", "", function() {
            this.hasFocus = false;
            this._update();
        }.bind(this));
    },

    _placeSelect: function() {
        var $select = this.$element.find('select').first();

        $select.css({
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: 'auto',
            height: 'auto'
        });
    },

    _openSelectInput: function() {
        var selectElement = this.$element.find('select')[0];

        if (document.createEvent) {
            var e = document.createEvent("MouseEvents");
            e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            selectElement.dispatchEvent(e);
        } else if (selectElement.fireEvent) {
            selectElement.fireEvent("onmousedown");
        }
    },

    /** @ignore */
    _adjustAutocompleter: function() {
        var searchFor = this.inputElement.val();
        var result = [];
        $.each(this.options.options, function(index, value) {
             if (value.toLowerCase().indexOf(searchFor.toLowerCase(), 0) >= 0 ) result.push(value);
        });
        this.autocompleteList.set({
            options: result
        });
        this.autocompleteList.show();
    },

    /** @ignore */
    _optionRenderer: function(index, option) {
        var el = $("<span>" + option + "</span>");
        if (this.options.multiple) {
            var checkbox = $("<div class=\"checkbox\">");
            if (this.syncSelectElement && $(this.syncSelectElement.find("option").get(index)).attr("selected")) {
                checkbox.addClass("checked");
            }
            el.prepend(checkbox);
        }
        return el;
    },

    /** @ignore */
    _optionRendererAutocomplete: function(index, value) {
        var searchFor = this.inputElement.val();
        var i = value.toLowerCase().indexOf(searchFor.toLowerCase());
        if (i >= 0) {
            value = value.substr(0, i) + "<em>" + value.substr(i, searchFor.length) + "</em>" + value.substr(i + searchFor.length);
        }
        
        return $("<span>" + value + "</span>");
    },
    
    /** @ignore */
    _processSelect: function(event) {
        if (this.syncSelectElement) {
            var current = $(this.syncSelectElement.find("option").get(event.selectedIndex));
            var value = current.attr("value");
            if (this.options.multiple) {
                var v = this.syncSelectElement.val();
                if (v === null) v = [];
                if (v.indexOf(value) >= 0) {
                    v.splice(v.indexOf(value), 1);
                } else {
                    v.push(value);
                }
                this.syncSelectElement.val(v);
                this.dropdownList.update();
            } else {
                this.syncSelectElement.val(value);
                this.dropdownList.hide();
            }
            this.syncSelectElement.change();
        }
        this._update(true);
    },
    
    /** @ignore */
    _render: function() {
        this._readDataFromMarkup();
        
        if (this.$element.get(0).tagName !== "DIV") {
            var div = $("<div></div>");
            this.$element.after(div);
            this.$element.detach();
            div.append(this.$element);
            this.$element = div;
        }

        this._createMissingElements();
        this.buttonElement = this.$element.find("button");
        this.syncSelectElement = this.$element.find("select");
        this.inputElement = this.$element.find("input");
        this.positioningElement = (this.options.editable) ? this.$element : this.buttonElement;
        
        if (!this.inputElement.attr("name")) this.inputElement.attr("name", this.syncSelectElement.attr("name") + ".edit");
        if (this.syncSelectElement.attr("multiple")) this.options.multiple = true;
        
        this.$element.addClass("dropdown");
        if (this.options.editable) this.$element.addClass("dropdown-editable");
        

        if (this.$element.find("select option").length > 0 && this.options.options.length === 0) {
            this.options.options = [];
            this.$element.find("select option").each(function(i, e) {
                this.options.options.push($(e).html());
            }.bind(this));
        }
        
        // Set several options
        if (this.options.multiple) {
            this.syncSelectElement.attr("multiple", "multiple");
        } else {
            this.syncSelectElement.removeAttr("multiple", "multiple");
        }
        if (this.options.placeholder) {
            this.buttonElement.text(this.options.placeholder);
            this.inputElement.attr("placeholder", this.options.placeholder);
        }

        this._update(true);
    },
    
    /** @ignore */
    _readDataFromMarkup: function() {
        if (this.$element.attr("disabled")) this.options.disabled = true;
        if (this.$element.attr("data-disabled")) this.options.disabled = true;
        if (this.$element.attr("multiple")) this.options.multiple = true;
        if (this.$element.attr("data-multiple")) this.options.multiple = true;
        if (this.$element.attr("placeholder")) this.options.placeholder = this.$element.attr("placeholder");
        if (this.$element.attr("data-placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
        if (this.$element.attr("data-editable")) this.options.editable = true;
        if (this.$element.attr("data-error")) this.options.hasError = true;
        if (this.$element.hasClass("error")) this.options.hasError = true;
    },
    
    /** @ignore */
    _createMissingElements: function() {
        if (this.$element.find("button").length === 0) {
            var button = $("<button>" + this.options.placeholder + "</button>");
            button.addClass("dropdown");
            this.$element.append(button);
        }
        if (this.options.editable && this.$element.find("input").length === 0) {
            var input = $("<input type=\"text\">");
            this.$element.prepend(input);
        }
        if (this.$element.find("select").length === 0) {
            var select = $("<select>");
            this.$element.append(select);
        }
    },
    
    /** @ignore */
    _update: function(updateContent) {
        if (updateContent) {
            if (this.syncSelectElement && !this.options.multiple) {
                var selectedIndex = this.syncSelectElement.find("option:selected").index();
                var html = this.options.options[selectedIndex];
                if (!html) html = this.options.placeholder;
                var text = $("<span>" + html + "</span>").text();
                if (selectedIndex >=0) {
                    if (this.inputElement.length > 0) {
                        this.inputElement.val(text).trigger('change');
                    } else {
                        this.buttonElement.html(html);
                    }
                }
            }
        }
        if (this.options.disabled) {
            this.buttonElement.attr("disabled", "disabled");
            this.inputElement.attr("disabled", "disabled");
        } else {
            this.buttonElement.removeAttr("disabled");
            this.inputElement.removeAttr("disabled");
        }
        if (this.hasFocus) {
            this.$element.addClass("focus");
        } else {
            this.$element.removeClass("focus");
        }
        if (this.options.hasError) {
            this.$element.addClass("error");
        } else {
            this.$element.removeClass("error");
        }
    },
    
    /** @ignore */
    _isMobile: function() {
        return typeof window.ontouchstart === 'object';
    }
    
  });

  CUI.util.plugClass(CUI.Dropdown);
  
  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $("[data-init=dropdown]", e.target).dropdown();
    });
  }
}(window.jQuery));
(function($) {
  CUI.Filters = new Class(/** @lends CUI.Filters# */{
    toString: 'Filters', // Plural here as jQuery already has a method "filter"
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc An autocompletable filters&tags widget
      
      <p>
      <select data-init="filters" data-placeholder="Add filter" multiple data-stacking="true">
            <option>red</option>
            <option>green</option>
            <option>blue</option>
            <option>yellow</option>
            <option>orange</option>
      </select>
      </p>

        <h2>Hints &amp; Tricks</h2>
      <p>
       <ul>
            <li>
               If you change the <code>options</code> with the <code>set</code>-Method after initialising the element,
                don't forgt to also set the <code>optionDisplayStrings</code>.
            </li>
        </ul>
      
    </p>
      
    @example
    <caption>Instantiate with Data API</caption>
&lt;select data-init="filters" data-placeholder="Add filter" multiple data-stacking="true"&gt;
      &lt;option&gt;red&lt;/option&gt;
      &lt;option&gt;green&lt;/option&gt;
      &lt;option&gt;blue&lt;/option&gt;
      &lt;option&gt;yellow&lt;/option&gt;
      &lt;option&gt;orange&lt;/option&gt;
&lt;/select&gt;

Currently there are the following data options:
  data-init="filters"         Inits the filter widget after page load
  data-placeholder            Same as option "placeholder"
  data-multiple               Sets field to "multiple" if given (with any non-empty value)
  data-stacking               Sets field to "stacking" if given (with any non-empty value)
  data-disabled               Sets field to "disabled" if given (with any non-empty value)
  data-allow="create"         If given the user is allowed to add new entries to the option list
  data-option-renderer        Either "default" for default behavior or "cqTag" for correct display of CQ5 Tags.

  "data-multiple", "data-disabled" and "data-placeholder" can be replaced by the native HTML attributes "multiple", "disabled" and
  "placeholder" if the current element allows them.
      
      @example
<caption>Instantiate with Class</caption>
var filters = new CUI.Filters({
  element: '#myFilter',
  options: ["Apples", "Pears", "Oranges"]
});

// Set the currently selected option
filters.setSelectedIndex(1);
        
      @example
<caption>Instantiate with jQuery</caption>
$('#myFilters').alert({
  options: ["Apples", "Pears", "Oranges"]
});

// A reference to the element's filters instance is stored as data-filters
var filters = $('#myFilters').data('filters');
var index = filters.getSelectedIndex();
            

      @desc Creates a filters field
      
            <h4>Callbacks</h4>
            <p>
      There are two callbacks you can use to customize your filters widget and that can be configured within the options array.
      </p><p>
      With the <code>autocompleteCallback(Function handler, String searchFor, int offset, int length)</code> you can customize the results that are displayed in the autocomplete dropdown list. The handler function to be called after your autocomplete function has finished accepts an array of result objects. These objects can hold any data as long as they define a convenient <code>toString()</code> method that returns the right option value.
            </p>
            <p>The additional parameters <code>offset</code> and <code>length</code> are only important when infinite list loading is activated: They define the part of the list to be loaded</p>
            <p>
            The <code>optionRenderer(int index, Object option, boolean highlight, boolean showIcon)</code> callback can be used to customize the HTML markup of the items in the dropdown. <code>index</code> is the position in the current list, <code>option</code> is the current option to display (your custom Object if you defined an autocompleteCallback, a string otherwise), <code>highlight</code> defines wether you should highlight the search term and <code>showIcon</code> defines wether you should add an icon to your markup. You have to return a valid jQuery element.
            </p>
      
      @constructs
      
      @param {Object}   options                                    Component options
      @param {Array}    [options.options=empty array]              Array of available options (will be read from &lt;select&gt; by default)
      @param {Array}    [options.optionDisplayStrings=empty array] Array of alternate strings for display (will be read from &lt;select&gt; by default)
      @param {boolean}  [options.multiple=false]                   Can the user select more than one option?
      @param {boolean}  [options.stacking=false]                   Uses a slightly different style, implies multiple
      @param {boolean}  [options.allowCreate=false]                Allow the creation of new tags.
      @param {boolean}  [options.placeholder=null]                 Define a placeholder for the input field
      @param {int}      [options.delay=200]                        Delay before starting autocomplete when typing
      @param {int}      [options.disabled=false]                   Is this component disabled?
      @param {boolean}  [options.highlight=true]                   Highlight search string in results
      @param {String}   [options.name=null]                        (Optional) name for an underlying form field.
      @param {Object}   [options.icons=empty object]               Icons to display. Option key paired with either Coral icon css class or image url.
      @param {String}   [options.iconSize=small]                   Icon size from: xsmall (12x12), small (16x16), medium (24x24), large (32x32).
      @param {Function} [options.autocompleteCallback=use options] Callback for autocompletion
      @param {Function} [options.optionRenderer=default renderer]  (Optional) Renderer for the autocompleter and the tag badges
      @param {boolean}  [options.infiniteLoad=false]               Should extra content be loaded dynamically when the list is scrolled to bottom?
      @param {boolean}  [options.maxLoadingItems=20]               Maximum number of items to load per request on infinite list loading.
          */
    construct: function(options) {
        this.selectedIndices = []; // Initialise fresh array
        this.createdIndices = []; // Initialise fresh array
        
        // Set callbacks to default if there are none
        if (!this.options.autocompleteCallback) {
            this.options.autocompleteCallback = this._defaultAutocompleteCallback.bind(this);
        } else {
            this.usingExternalData = true;
        }
        if (!this.options.optionRenderer) this.options.optionRenderer = CUI.Filters.defaultOptionRenderer;
        
        // Read options from markup
        this._readDataFromMarkup();
        
        // Stacking forces multiple
        if (this.options.stacking) this.options.multiple = true;
        
        // Adjust DOM to our needs
        this._render();
        
        // Populate alternative display strings if necessary
        if (this.options.optionDisplayStrings.length > this.options.options.length) {
            this.options.optionDisplayStrings = this.options.optionDisplayStrings.slice(0, this.options.options.length);
        }
        while (this.options.optionDisplayStrings.length < this.options.options.length) {
            this.options.optionDisplayStrings.push(this.options.options[this.options.optionDisplayStrings.length]);
        }
        
        // Generate Dropdown List widget
        this.dropdownList = new CUI.DropdownList({
            element: this.inputElement,
            positioningElement: (this.options.stacking) ? this.$element : this.inputElement,
            cssClass: "autocomplete-results"
        });
        
        this._addEventListeners();
       
    },
    
    defaults: {
        autocompleteCallback: null,
        optionRenderer: null,
        options: [],
        optionDisplayStrings: [],
        multiple: false,
        delay: 200,
        highlight: true,
        stacking: false,
        placeholder: null,
        allowCreate: false,
        icons: null,
        iconSize: "small",
        infiniteLoad: false,
        maxLoadingItems: 20
    },

    dropdownList: null, // Reference to instance of CUI.DropdownList
    syncSelectElement: null,
    inputElement: null,
    typeTimeout: null,
    
    selectedIndex: -1,         // For single term only
    selectedIndices: null,     // For multiple terms
    createdIndices: null,      // Newly created indices
    triggeredBackspace: false,
    usingExternalData: false,  // Using autocomplete callback for loading external data?
    selectedValue: null,       // Used to store returned value when data is loaded externally

    // Infinite loading
    isLoadingExternal: false,  // Has an external call for data been started?
    loadedEverything: false,   // Have we loaded all the items that we can?

    // TODO switch selectedIndex/selectedIndices to store keys rather than indexes so that they
    // can be used with external data. Remove selectedValue variable on completion.

    /**
     * @param {int} index     Sets the currently selected option by its index or, if options.multiple ist set,
     *                          adds it to the list of selected indices. -1 is valid for single term use and removes any
     *                          selected index.
     */
    setSelectedIndex: function(index) {
        if (index < -1 || index >= this.options.options.length) return;
        this.inputElement.attr("value", "");
        this.selectedIndex = index;
        if (this.options.multiple && index >=0 && this.selectedIndices.indexOf(index * 1) < 0) {
            this.selectedIndices.push(index * 1); // force numeric
        }
        if (!this.options.multiple) {
            this.selectedIndices = (index >= 0) ? [index] : [];
        }
        this._update();
    },
    
    
    /**
     *  Removes the given index from the list of selected indices. Only applies to multi term use.
     **/
    removeSelectedIndex: function(index) {
        var i = this.selectedIndices.indexOf(index * 1);
        if (i < 0) return;
        this.selectedIndices.splice(i, 1);
        this._update();
    },
    
    /**
     * @return {int} The currently selected options by index or -1 if none is selected
     */
    getSelectedIndex: function() {
        return this.selectedIndex;
    },
    

    /**
     * @param {array} Replace the list of currently selected indices. Only applies to multi term use.
     */
    setSelectedIndices: function(indices) {
        this.selectedIndices = indices.slice(0); // Make copy of parameter!
        this._update();
    },
    
    /**
     * @return {array} The currently selected options by index or an empty array if none is selected
     */
    getSelectedIndices: function() {
        return this.selectedIndices.slice(0); // Make copy before returning!
    },
    
    /** @ignore */
    _addEventListeners: function() {
        // Listen to property changes
        this.$element.on('change:disabled', this._update.bind(this));
        this.$element.on('change:placeholder', this._update.bind(this));
        
        this.$element.on('change:options', this._changeOptions.bind(this));
        
        // Listen to events
        this.$element.on("input", "input", function() {
            if (this.options.disabled) return;
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = setTimeout(this._inputChanged.bind(this), this.options.delay);
        }.bind(this));
        
        this.$element.on("click touchend", "input", function() {
            if (this.options.disabled) return;
            this.inputElement.focus();
            this._inputChanged();
        }.bind(this));
                
        this.$element.on("blur", "input", function() {
            if (this.options.disabled) return;
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = null;
            // Set to existing selection for single term use
            if (!this.options.multiple && this.selectedIndex >=0) {
                if (this.inputElement.attr("value") === "") {
                    this.setSelectedIndex(-1);
                } else {
                    this._update();
                }
            }
            var hasError = (!this.options.multiple && this.inputElement.val().length > 0 && this.selectedIndex < 0);
            this.$element.toggleClass("error", hasError);
        }.bind(this));
       
        this.$element.on("keydown", "input", this._keyPressed.bind(this));
        this.$element.on("keyup", "input", this._keyUp.bind(this));
        
        this.dropdownList.on("dropdown-list:select", "", function(event) {

            if(this.options.infiniteLoad) {
                this.loadedEverything = false;
            }

            this.dropdownList.hide(200);

            if(this.usingExternalData) {
                this._createNewOption(event.selectedValue.toString(), event.selectedValue.toString(), true);
                this._update();
            }
            
            var pos = $.inArray(event.selectedValue.toString(), this.options.options);
            this.setSelectedIndex(pos * 1);
        }.bind(this));

        if(this.options.infiniteLoad) {
            this.dropdownList.on("dropdown-list:scrolled-bottom", "", function(event) {
                if(!this.isLoadingExternal && !this.loadedEverything) {
                    this.isLoadingExternal = true;
                    
                    this.dropdownList.addLoadingIndicator();
                    var offset = this.dropdownList.getNumberOfItems();
                    var searchFor = this.inputElement.attr("value");
                    this.options.autocompleteCallback($.proxy(this._appendLoadedData, this), searchFor, offset, this.options.maxLoadingItems);
                }
            }.bind(this));
        }

        this.$element.on("click", "[data-dismiss=filter]", function(event) {
            if (this.options.disabled) return;
            var e = $(event.target).closest("[data-id]");
            this.removeSelectedIndex(e.attr("data-id"));
            return false;
        }.bind(this));
        
        // .. and some more event handlers to style our widget
        this.$element.on("input", "input", function() {
            if (this.options.disabled) return;
            this._correctInputFieldWidth();
        }.bind(this));
        
        this.$element.on("focus", "input", function() {
            if (this.options.disabled) return;
            this.$element.addClass("focus");
        }.bind(this));
        
        this.$element.on("blur", "input", function() {
            if (this.options.disabled) return;
            this.$element.removeClass("focus");
        }.bind(this));
    },
        
    /** @ignore */
    _changeOptions: function(event) {
        if (event.widget !== this) return;
        this.selectedIndex = -1;
        this.selectedIndices = [];
        this.createdIndices = [];
        this._update();
    },

    /** @ignore */
    _render: function() {
        var div;
        // if current element is select field -> turn into input field, but hold reference to select to update it on change
        if (this.$element.get(0).tagName === "SELECT") {        
            div = $("<div></div>");
            this.$element.after(div);
            this.$element.detach();
            div.append(this.$element);
            this.$element = div;
        }
        
        // if current element is input field -> wrap it into DIV
        if (this.$element.get(0).tagName === "INPUT") {
            div = $("<div></div>");
            this.$element.after(div);
            this.$element.detach();
            div.prepend(this.$element);
            this.$element = div;
        }

        // If there was an select in markup: use it for generating options
        if (this.$element.find("select option").length > 0 && this.options.options.length === 0) {
            this.options.options = [];
            this.options.optionDisplayStrings = [];
            this.$element.find("select option").each(function(i, e) {
            this.options.options.push($(e).val());
            this.options.optionDisplayStrings.push($.trim($(e).text()));
            
            // Save selected state
            if ($(e).attr("selected")) {
	            this.selectedIndices.push(i);		
	            this.selectedIndex = i;		
            }

            }.bind(this));
        }

        this._createMissingElements();
        
        this.syncSelectElement = this.$element.find("select");
        this.inputElement = this.$element.find("input");
        
        this.$element.addClass("filters");
        this.$element.removeClass("focus");

        if (!this.options.placeholder) this.options.placeholder = this.inputElement.attr("placeholder");
        if (this.options.name) this.syncSelectElement.attr("name", this.options.name);
        if (this.options.stacking) this.$element.addClass("stacking"); else this.$element.removeClass("stacking");

       
        this._update();
    },
    
    _createMissingElements: function() {
        if (this.$element.find("select").length === 0) {
            this.$element.append($("<select " + (this.options.multiple ? "multiple" : "") + "></select>"));
        }
        if (this.$element.find("input").length === 0) {
            this.$element.prepend($("<input type=\"text\">"));
        }
        
        // Create all options where neccessary
        if (this.$element.find("select option").length < this.options.options.length) {
            for(var i = this.$element.find("select option").length; i < this.options.options.length; i++) {
                var value = this.options.options[i];
                var name = this.options.optionDisplayStrings[i] || this.options.options[i];
                var opt = $("<option></option>");
                opt.text(name);
                opt.attr("value", value);
                this.$element.find("select").append(opt);
            }
        }
        
    },

    /** @ignore */
    _readDataFromMarkup: function() {
            if (this.$element.attr("multiple")) this.options.multiple = true;
            if (this.$element.attr("data-multiple")) this.options.multiple = true;
            if (this.$element.attr("data-stacking")) this.options.stacking = true;
            if (this.$element.attr("placeholder")) this.options.placeholder = this.$element.attr("placeholder");
            if (this.$element.attr("data-placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
            if (this.$element.attr("disabled")) this.options.disabled = true;
            if (this.$element.attr("data-disabled")) this.options.disabled = true;
            if (this.$element.attr("data-allow") === "create") this.options.allowCreate = true;
            if (this.$element.attr("data-option-renderer")) {
                // Allow to choose from default option Renderers
                this.options.optionRenderer = CUI.Filters[this.$element.attr("data-option-renderer") + "OptionRenderer"];
                if (!this.options.optionRenderer) this.options.optionRenderer = CUI.Filters.defaultOptionRenderer;
            }
   },
   
    /** @ignore */
    _update: function() {
        
        if (this.options.placeholder) this.inputElement.attr("placeholder", this.options.placeholder);
        
        if (this.options.disabled) {
            this.$element.addClass("disabled");
            this.inputElement.attr("disabled", "disabled");
        } else {
           this.$element.removeClass("disabled");
           this.inputElement.removeAttr("disabled");
        }
        
        // Update single term fields
        if (!this.options.multiple) {
            if (this.syncSelectElement) this.syncSelectElement.find("option:selected").removeAttr("selected");

            if (this.selectedIndex >= 0) {
                if (this.syncSelectElement) $(this.syncSelectElement.find("option").get(this.selectedIndex)).attr("selected", "selected");
                var option = this.options.options[this.selectedIndex];
                if (this.options.optionDisplayStrings[this.selectedIndex]) { // Use alternative display strings
                    option = this.options.optionDisplayStrings[this.selectedIndex];
                }
                this.inputElement.attr("value", option);
            } else {
                this.inputElement.attr("value", "");
            }
            this.$element.find('select').change();
            return;
        }

        // Update multiple term fields
        if (this.syncSelectElement) {
            this.syncSelectElement.find("option:selected").removeAttr("selected");
            
            for(var i = 0; i < this.selectedIndices.length; i++) {
                var index = this.selectedIndices[i];
                $(this.syncSelectElement.find("option").get(index)).attr("selected", "selected");
                
            }
        }
        
        // Create selected tag list
        var ul = $("<ul class=\"tags\"></ul>");
        
        $.each(this.selectedIndices, function(iterator, index) {
            var option = this.options.options[index];
            var el = (this.options.optionRenderer.bind(this))(index, option, false, false);
            var li = $("<li data-id=\"" + index + "\"><button data-dismiss=\"filter\">&times;</button></li>");
            ul.append(li);
            li.append(el);
            
        }.bind(this));
        
        // Add new list to widget
        this.$element.find("ul").remove();
        if (ul.children().length > 0) {
            if (this.options.stacking) {
                this.$element.prepend(ul);        
            } else {
                this.$element.append(ul);
            }
        }
        
        // Correct input field length of stacking fields
        this._correctInputFieldWidth();
        this.$element.find('select').change();
    },

    /** @ignore */
    _keyUp: function(event) {
        var key = event.keyCode;
        if (key === 8) {  
            this.triggeredBackspace = false; // Release the key event
        }
    },
    
    /** @ignore */
    _keyPressed: function(event) {        
        var key = event.keyCode;
        if (key === 8) { 
            if (this.triggeredBackspace === false && this.inputElement.attr("value").length === 0) {
                if (this.options.multiple && this.selectedIndices.length > 0) {
                    event.preventDefault();
                    this.removeSelectedIndex(this.selectedIndices[this.selectedIndices.length - 1]);
                    this._inputChanged();
                }
            }
           
            this.triggeredBackspace = true; // Remember this key down event
        }
        
        if (!this.dropdownList.isVisible()) {
            if (key === 40) {
                this._inputChanged(); // Show box now!
                event.preventDefault();
            }
            if (key === 13) { // Create new item
                var val = this.inputElement.val();
                if (val.length > 0) {
                    this._createNewOption(val, val, false);
                    event.preventDefault();
                }
            }
        } else {
            if (key === 13 && this.dropdownList.currentIndex < 0) {
                // Close dropdownlist, even if nothing is selected
                this.dropdownList.hide();
                event.preventDefault();
            }
        }
    },
    
    _createNewOption: function(name, displayName, fromInternal) {
        
        var existingIndex = -1;
        
        // First check if there really is no option with this name
        $.each(this.options.options, function(index, optionName) {
           if (this.options.optionDisplayStrings[index] === name) existingIndex = index;
           if (optionName === name) existingIndex = index;           
        }.bind(this));
        
        if (existingIndex >=0) {
            this.setSelectedIndex(existingIndex);
            return;
        }
        
        // Is it allowed to add new options?
        if (!this.options.allowCreate && !fromInternal) return;
        
        var index = this.options.options.length;

        this.options.options.push(name);
        this.options.optionDisplayStrings.push(displayName);
        if (this.syncSelectElement) {
            var el = $("<option></option>");
            el.text(displayName);
            el.attr("value", name);
            if (!fromInternal) el.attr("data-new", "true");
            this.syncSelectElement.append(el);
            //console.log("Compare indices", el.index(), index);
        }
        if (!fromInternal) this.createdIndices.push(index);
        this.setSelectedIndex(index);
    },
    
    /** @ignore */
    _correctInputFieldWidth: function() {
        if (!this.options.stacking) return;
        
        var i = this.inputElement;
        var text = i.attr("value");
        if (text.length === 0) text = i.attr("placeholder");
        var styles = ["font-family", "font-weight", "font-style", "font-size", "letter-spacing", "line-height", "text-transform"];
        var div = $("<div style=\"position: absolute; display: none;\"></div>");
        $.each(styles, function(x, style) {
            div.css(style, i.css(style));
        });
        div.text(text);
        $("body").append(div);
        var w = div.width() + 25;
        div.remove();
        var border = parseFloat(i.css("margin-left")) + parseFloat(i.css("margin-right"));        
        var isEmpty = (this.selectedIndices.length === 0);
        if (isEmpty || w > (this.$element.width() - border)) {
            w = (this.$element.width() - border);
        }
        i.width(w);
    },
    
    /** @ignore */
    _inputChanged: function() {

        if(this.options.infiniteLoad) {
            this.loadedEverything = false;
        }

        var searchFor = this.inputElement.attr("value");
        this.options.autocompleteCallback($.proxy(this._showAutocompleter, this), searchFor, 0, (this.options.infiniteLoad) ? this.options.maxLoadingItems : 500); // Do not load more than 500 items without infinite loading
    },

    /** @ignore */
    _appendLoadedData: function(results) {

        this.dropdownList.removeLoadingIndicator();

        // No results back, must be no more data to load
        if(results.length === 0) {
            this.loadedEverything = true;
            this.isLoadingExternal = false;
            return;
        }

        // Append the fetched items to the end of the currently open list
        this.dropdownList.addItems(results);

        // We're ready to load content again
        this.isLoadingExternal = false;
    },
    
    /** @ignore */
    _showAutocompleter: function(results) {
        this.dropdownList.hide();
        
        if (this.options.multiple) {
            // Do not show already selected indices
            var l = [];
            $.each(results, function(iterator, key) {
                // TODO: can't call this.options.options when we are using external data source
                var pos = $.inArray(key, this.options.options);
                if (this.selectedIndices.indexOf(pos) >= 0) return;
                l.push(key);
            }.bind(this));
            results = l;
        }        
        if (results.length === 0) return;

        var optionRenderer = function(index, key) {
            return (this.options.optionRenderer.bind(this))(index, key, this.options.highlight, !$.isEmptyObject(this.options.icons));
        };

        this.dropdownList.set("optionRenderer", optionRenderer.bind(this));
        this.dropdownList.set("options", results);
        
        this.dropdownList.show();
        
    },
    
    /** @ignore */
    _defaultAutocompleteCallback: function(handler, searchFor) {
        var result = [];

        $.each(this.options.options, function(index, key) {
            var name = key;
            
            if (this.options.optionDisplayStrings[index]) { // Use alternate display names for autocomplete (if possible)
                name = this.options.optionDisplayStrings[index];
            }
            if (name.toLowerCase().indexOf(searchFor.toLowerCase(), 0) >= 0 ) result.push(key);

        }.bind(this));

        handler(result, searchFor);
    },

    /** @ignore */
    _buildIcon: function(type, attr, size) {
        if(type === "url") {
            return '<i class="' + size + ' icon-inline-bg-image" style="background-image: url(' + attr + ')">' + 'icon' + '</i>';
        } else if(type === "cuiIcon") {
            return '<i class="' + attr + ' ' + size + '">' + attr.split('icon-')[1] + '</i>';
        }
    }
  });

  CUI.util.plugClass(CUI.Filters);
  
  // Data API
  $(document).on("cui-contentloaded.data-api", function(e) {
    $("[data-init=filters]", e.target).filters();
  });
}(window.jQuery));


CUI.Filters.defaultOptionRenderer = function(index, key, highlight, icon) {

    var pos = $.inArray(key, this.options.options);
    var value = key;

    if (this.options.optionDisplayStrings[pos]) { // Use alternate display strings if possible
        value = this.options.optionDisplayStrings[pos];
    }

    var searchFor = this.inputElement.val();

    if (highlight) {
        var i = value.toLowerCase().indexOf(searchFor.toLowerCase());
        if (i >= 0) {
            value = value.substr(0, i) + "<em>" + value.substr(i, searchFor.length) + "</em>" + value.substr(i + searchFor.length);
        }
    }
    
    // Check if this tag is new
    if (this.createdIndices.indexOf(pos) >= 0) {
        value = value + "&nbsp;*";
    }

    // If we allow icons here, build icon if provided for option depending on type (image url or cui icon class)
    if(icon) {
        var attr;
        if(typeof(attr = this.options.icons[key]) !== "undefined") {
            var type = (/^icon-/i.test(attr)) ? "cuiIcon" : "url";
            value = this._buildIcon(type,attr,this.options.iconSize) + value;
        }
    }

    return $("<span>" + value + "</span>");
};

CUI.Filters.cqTagOptionRenderer = function(iterator, key, highlight) {
    var index = $.inArray(key, this.options.options);
    var value = key;
    
    if (this.options.optionDisplayStrings[index]) { // Use alternate display strings if possible
        value = this.options.optionDisplayStrings[index];
    }
    var searchFor = this.inputElement.val();
    
    var namespaced = value.split(":");
    if (namespaced.length < 2) namespaced[1] = "";
    
    var namespace = namespaced[0];
    var restPath = namespaced[1];
    
    var pathParts = restPath.split("/");

    
    // html encode fn
    function e(text) {
        return $("<div>").text(text).html();
    }
    
    value = namespace + ": ";
    for(var q = 0; q < pathParts.length; q++) {
        var part = pathParts[q];

        if (highlight) {
            var i = part.toLowerCase().indexOf(searchFor.toLowerCase());
            if (i >= 0) {
                part = e(part.substr(0, i)) + "<em>" + e(part.substr(i, searchFor.length)) + "</em>" + e(part.substr(i + searchFor.length));
            } else {
                part = e(part);
            }
        } else {
            part = e(part);
        }
        
        if (q > 0) value += " / ";
        if (q === pathParts.length - 1) part = "<b>" + part + "</b>";
        value = value + part;
    }
        
    // Check if this tag is new
    if (this.createdIndices.indexOf(index) >= 0) {
        value = value + "&nbsp;*";
    }

    
    return $("<span>" + value + "</span>");
};
(function($) {
  CUI.Slider = new Class(/** @lends CUI.Slider# */{
    toString: 'Slider',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc A slider widget
      
        <p>
            <div class="slider ticked filled tooltips" data-init="slider">
              <input type="range" value="14" min="10" max="20" step="2">
            </div>
        </p>

        <p>
        Currently you have to supply the full markup to this widget. It does not render missing
        elements itself.
        </p>
    @example
    <caption>Simple horizontal slider</caption>
    &lt;div class="slider" data-init="slider"&gt;
        &lt;input type="range" value="14" min="10" max="20" step="2"&gt;
    &lt;/div&gt;

    @example
    <caption>Full-featured slider with two handles, tooltips, ticks and a filled bar</caption>
    &lt;div class="slider tooltips ticked filled" data-init="slider"&gt;
        &lt;input type="range" value="4" min="10" max="20" step="2"&gt;
        &lt;input type="range" value="14" min="10" max="20" step="2"&gt;
    &lt;/div&gt;

    @example
    <caption>Instantiate by jQuery plugin</caption>
    $("select").dropdown();

      @desc Creates a slider from a div
      @constructs
      
      @param {Object}   options                               Component options
      @param {number} [options.step=1]  The steps to snap in
      @param {number} [options.min=1]   Minimum value
      @param {number} [options.max=100] Maximum value
      @param {number} [options.value=1] Starting value
      @param {number} [options.tooltips=false] Show tooltips?
      @param {String} [options.orientation=horizontal]  Either 'horizontal' or 'vertical'
      @param {boolean} [options.slide=false]    True for smooth sliding animations 
      @param {boolean} [options.disabled=false] True for a disabled element* 
	  @param {boolean} [options.bound=false] For multi-input sliders, indicates that the min value is bounded by the max value and the max value is bounded by the min      
    */
    construct: function(options) {
        var that = this;

        // sane defaults for the options
        that.options = $.extend({}, that.defaults, options);

        // setting default dom attributes if needed
        if (that.$element.hasClass('vertical')) {
            that.options.orientation = 'vertical';
            that.isVertical = true;
        }

        if(that.$element.hasClass('tooltips')) {
            that.options.tooltips = true;
        }

        if(that.$element.hasClass('ticked')) {
            that.options.ticks = true;
        }

        if(that.$element.hasClass('filled')) {
            that.options.filled = true;
        }
		
		if(that.$element.hasClass('slide')) {
            that.options.slide = true;
        }
		
		if(that.$element.hasClass('bound')) {
            that.options.bound = true;
        }
		
		var elementId = that.$element.attr('id');
		// if the element doesn't have an id, build a unique id using the $.expando property
		if(!elementId) {
            that.$element.data("_tmp",0).attr("id","slider-"+$.expando+"-"+that.$element.get(0)[$.expando]).removeData("_tmp");
			elementId = that.$element.attr('id');
        }
		        
        that._renderMissingElements();
		
		// sliders with two inputs should be contained within a fieldset to provide a label for the grouping
		var $fieldset = that.$element.find("fieldset");
		var $legend;
		if ($fieldset.length)
		{
			// move all fieldset children but than the legend to be children of the element.
			that.$element.append($fieldset.contents(":not(legend)"));
			// add a class definition so the fieldset appears inline
			var $newFieldset = $('<div role="fieldset" class="sliderfieldset" />');
			// insert the fieldset before the element and append the element to the fieldset
			that.$element.wrap($newFieldset);
			
			// get a the first legend. there should only be one
			$legend = $fieldset.find("legend").first();
			if ($legend.length)
			{	
				var $newLegend = $('<label role="legend"/>').append($legend.contents());		
				
				// if there is a legend replace it with a label with the same content and attributes
				$.each($legend.prop("attributes"), function() {
					$newLegend.attr(this.name, this.value);
				});
				
				$fieldset.replaceWith($newLegend);
				$legend = $newLegend;
				$legend.insertBefore(that.$element);
				
				// if the new label/legend has no id, assign one.
				if (!$legend.attr("id")) {
					$legend.attr("id",elementId+"-legend");
				}
				
				$newFieldset.attr("aria-labelledby", $legend.attr("id"));
			}
			
		}

        that.$inputs = that.$element.find('input');

        var values = [];

        that.$inputs.each(function(index) {
            var $this = $(this);
			var thisId = $this.attr("id");
			// if the input doesn't have an id make one
			if (!thisId) {
				$this.attr("id",elementId+"-input"+index);
				thisId = $this.attr("id");
			}
			
			if (!$this.attr("aria-labelledby")) {
				$this.attr("aria-labelledby","");
			} 
			
			// existing labels that use the for element
			var $label = that.$element.find("label[for='"+thisId+"']");
			if ($legend) {
				if($this.attr("aria-labelledby").indexOf($legend.attr("id"))===-1) {
					$this.attr("aria-labelledby", $legend.attr("id")+($this.attr("aria-labelledby").length ? " ":"")+$this.attr("aria-labelledby"));
				}
				
				if (index===0)
					$legend.attr("for",thisId);
			}
			
			if ($label.length)
			{
				$label.not($this.parent()).insertBefore(that.$element);
				$label.each(function(index) {
					if (!$(this).attr("id")) {
						$(this).attr("id",thisId+"-label"+index);
					}
					if($this.attr("aria-labelledby").indexOf(thisId+"-label"+index)===-1) {
						$this.attr("aria-labelledby", ($this.attr("aria-labelledby").length ? " ":"")+thisId+"-label"+index);
					}
				});
			}
			
			if ($this.parent().is("label")) {
				$label = $this.parent();
				
				if (!$label.attr("id")) {
					$label.attr("id",thisId+"-label");
				}
				
				if (!$label.attr("for")) {
					$label.attr("for",thisId);
				}
				
				$this.insertAfter($label);
				
				if ($legend) {
					$label.addClass("hidden-accessible");
				}
				$label.insertBefore(that.$element);
			}
			
			if ($label && $this.attr("aria-labelledby").indexOf($label.attr("id"))===-1)
			{
				$this.attr("aria-labelledby", $this.attr("aria-labelledby")+($this.attr("aria-labelledby").length ? " ":"")+$label.attr("id"));
			}
			
            // setting default step
            if (!$this.is("[step]")) $this.attr('step', that.options.step);

            // setting default min
            if (!$this.is("[min]"))
			{
				$this.attr({'min':that.options.min});
			}

            // setting default max
            if (!$this.is("[max]"))
			{
				$this.attr({'max':that.options.max});
            }

            // setting default value
            if (!$this.is("[value]")) {
                $this.attr({'value':that.options.value});
                values.push(that.options.value);
            } else {
                values.push($this.attr('value'));
            }

            if(index === 0) {
                if($this.is(":disabled")) {
                    that.options.disabled = true;
                    that.$element.addClass("disabled");
                } else {
                    if(that.options.disabled) {
                        $this.attr({"disabled":"disabled"});
                        that.$element.addClass("disabled");
                    }
                }
            }
			
			$this.on("change", function(event) {
				if (that.options.disabled) return;
				that.setValue($this.val(), index);
			}.bind(this));
			
			if (that._isMobile())
			{
				$this.on("focus", function(event) {
					that._focus(event);
				}.bind(this));
				
				$this.on("blur", function(event) {	
					that._blur(event);
				}.bind(this));			
			} else {
				$this.attr({"aria-hidden":true,"tabindex":-1,"hidden":"hidden"});
			}
        });

        that.values = values;
        if (this.options.orientation === 'vertical') this.isVertical = true;
        
        this.$element.on("click", function(event) {
            this._handleClick(event);
        }.bind(this));
        
        // Set up event handling
        this.$element.on("mousedown touchstart", ".handle", function(event) {
            this._mouseDown(event);
        }.bind(this));

        // Listen to changes to configuration
        this.$element.on('change:value', this._processValueChanged.bind(this));
        this.$element.on('change:disabled', this._processDisabledChanged.bind(this));      
        this.$element.on('change:min', this._processMinMaxStepChanged.bind(this));      
        this.$element.on('change:max', this._processMinMaxStepChanged.bind(this));      
        this.$element.on('change:step', this._processMinMaxStepChanged.bind(this));      
                              
        // Adjust dom to our needs
        this._render();
    },
    
    defaults: {
      step: '1',
      min: '1',
      max: '100',
      value: '1',
      orientation: 'horizontal',
      slide: false,
      disabled: false,
      tooltips: false,
      tooltipFormatter: function(value) { return value.toString(); },
	  bound: false
    },

    values: [],
    $inputs: null,
    $ticks: null,
    $fill: null,
    $handles: null,
    $tooltips: null,
    isVertical: false,
    draggingPosition: -1,
    
    /**
     * Set the current value of the slider
     * @param {int}   value   The new value for the slider
     * @param {int}   handleNumber   If the slider has 2 handles, you can specify which one to change, either 0 or 1
     */
    setValue: function(value, handleNumber) {
        handleNumber = handleNumber || 0;
        
        this._updateValue(handleNumber, value, true); // Do not trigger change event on programmatic value update!
        this._moveHandles();
        if(this.options.filled) {
            this._updateFill();
        }        
    },
    
    _renderMissingElements: function() {
        if (!this.$element.find("input").length) {
            var el = $("<input>");
            el.attr({
                "type": "range",
                "min": this.options.min,
                "max": this.options.max,
                "step": this.options.step,
                "value": this.options.value               
            });
            this.$element.append(el);
        }
        
        if (!this.$element.find("div.clickarea").length) {
            var el2 = $("<div class=\"clickarea\">");
            this.$element.prepend(el2); // Prepend: Must be first element to not hide handles!
        }
        
        this.$element.toggleClass("slider", true);
        this.$element.toggleClass("vertical", this.options.orientation === 'vertical' );
        this.$element.toggleClass("tooltips", this.options.tooltips);
        this.$element.toggleClass("ticked", this.options.ticks);
        this.$element.toggleClass("filled", this.options.filled);
    },
    
    _processValueChanged: function() {
        this._updateValue(0, this.options.value, true); // Do not trigger change event on programmatic value update!
        this._moveHandles();
        if(this.options.filled) {
            this._updateFill();
        }   
    },

    _processMinMaxStepChanged: function() {
        this.$element.find("input").attr("min", this.options.min);
        this.$element.find("input").attr("max", this.options.max);
        this.$element.find("input").attr("step", this.options.step);
        
        for(var i = 0; i < this.values.length; i++) {
            this._updateValue(i, this.values[i], true); // Ensure current values are between min and max
        }
        
        if(this.options.ticks) {
            this.$element.find(".ticks").remove();
            this._buildTicks();
        }
        
        if(this.options.filled) {
            this.$element.find(".fill").remove();
            this._buildFill();
        }
        
        this._moveHandles();
        if(this.options.filled) {
            this._updateFill();
        }   
    },
        
    _processDisabledChanged: function() {
		if (this.options.disabled)
		{ 
			this.$inputs.attr("disabled","disabled");
			if (this._isMobile()) 
				this.$handles.attr({"aria-disabled":true}).removeAttr("tabindex");
		} else {
			this.$inputs.removeAttr("disabled");
			if (this._isMobile())
				this.$handles.removeAttr("aria-disabled").attr("tabindex",0);
		}
        this.$element.toggleClass("disabled", this.options.disabled);                 
    },    
    _render: function() {
        var that = this;

        // get maximum max value
        var maximums = that.$inputs.map(function() {return $(this).attr('max');});
        that.options.max = Math.max.apply(null, maximums.toArray());

        // get minimum min value
        var minimums = that.$inputs.map(function() {return $(this).attr('min');});
        that.options.min = Math.min.apply(null, minimums.toArray());

        // get minimum step value
        var steps = that.$inputs.map(function() {return $(this).attr('step');});
        that.options.step = Math.min.apply(null, steps.toArray());

        // Todo: do not add already existing elements or remove them before adding new elements
        // build ticks if needed
        if(that.options.ticks) {
            that._buildTicks();
        }

        // build fill if needed
        if(that.options.filled) {
            that._buildFill();
        }

        that._buildHandles();
    },

    _buildTicks: function() {
        var that = this;

        // The ticks holder
        var $ticks = $("<div></div>").addClass('ticks');
        this.$element.prepend($ticks);

        var numberOfTicks = Math.round((that.options.max - that.options.min) / that.options.step) - 1;

        for (var i = 0; i < numberOfTicks; i++) {
			var trackDimensions = that.isVertical ? that.$element.height() : that.$element.width();
            var position = (i+1) * (trackDimensions / (numberOfTicks+1));
			var percent = (position / trackDimensions) * 100;
            var tick = $("<div></div>").addClass('tick').css((that.isVertical ? 'bottom' : 'left'), percent + "%");
            $ticks.append(tick);
        }
        that.$ticks = $ticks.find('.tick');
        if(that.options.filled) {
            that._coverTicks();
        }
    },

    _buildFill: function() {
        var that = this;

        this.$fill = $("<div></div>").addClass('fill');

        if(that.values.length !== 0) {
			var percent, fillPercent;
            if(that.values.length < 2) {
                percent = (that.values[0] - that.options.min) / (that.options.max - that.options.min) * 100;
                this.$fill.css((that.isVertical ? 'height' : 'width'), percent + "%");
            } else {
                percent = (this._getLowestValue() - that.options.min) / (that.options.max - that.options.min) * 100;
				fillPercent = (this._getHighestValue() - this._getLowestValue()) / (that.options.max - that.options.min) * 100;
                this.$fill.css((that.isVertical ? 'height' : 'width'), fillPercent + "%")
                    .css((that.isVertical ? 'bottom' : 'left'), percent + "%");
            }
        }
        this.$element.prepend(this.$fill);
        that.options.filled = true;
    },

    _buildHandles: function() {
        var that = this;

        // Wrap each input field and add handles and tooltips (if required)
        that.$inputs.each(function(index) {

            var wrap = $(this).wrap("<div></div>").parent().addClass("value");

            // Add handle for input field
            var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;
            var handle = $('<div></div>').addClass('handle').css((that.isVertical ? 'bottom' : 'left'), percent + "%");
			handle.attr({
						"role":"slider",
						"id":$(this).attr("id")+"-handle",
						"aria-valuemin":that.options.min,
						"aria-valuemax":that.options.max,
						"aria-valuenow":that.values[index],
						"aria-valuetext":that.values[index]
						});
			
			$(this).css((that.isVertical ? 'bottom' : 'left'), percent + "%");
			$(wrap).append(handle);

            // Add tooltip to handle if required
            if(that.options.tooltips) {
                var tooltip = $("<output>" + $(this).attr('value') + "</output>")
				.addClass('tooltip')
				.addClass(that.isVertical ? 'arrow-left' : 'arrow-bottom')
				.attr({'id':$(this).attr("id")+"-tooltip",'for':$(this).attr("id")});
                handle.append(tooltip);
            }
			
			if ($(this).attr("aria-labelledby"))
			{
				handle.attr("aria-labelledby",$(this).attr("aria-labelledby")); 
			}
			
			if (that.$inputs.length>1 && $(this).attr("aria-labelledby"))
			{
				var inputlabelids = $(this).attr("aria-labelledby").split(" ");
				var label;
				for(var i =0; i<inputlabelids.length; i++)
				{
					label = $("#"+inputlabelids[i]);
					if (i>0)
					{
						/* label.attr("aria-hidden","true"); */
						label.removeAttr("for");
						handle.prepend(label);
					}
				}
			}
			if (that._isMobile()) {
				handle.attr({"aria-hidden":true});
				$(this).attr({"tabindex":0}).removeAttr("aria-hidden").removeAttr("hidden");
			} else {
				handle.on("focus", function(event) {
					that._focus(event);
				}.bind(this));
				
				handle.on("blur", function(event) {	
					that._blur(event);
				}.bind(this));
				
				handle.on("keydown", function(event) {
					that._keyDown(event);
				}.bind(this));
				
				handle.attr("tabindex",0);
				$(this).attr({"aria-hidden":true,"tabindex":-1,"hidden":"hidden"});
			}
			
			if (that.options.disabled)
			{ 
				handle.attr("aria-disabled",true).removeAttr("tabindex");
			}
        });

        that.$handles = that.$element.find('.handle');
        that.$tooltips = that.$element.find('.tooltip');
    },
	
	_findNearestHandle: function(event) {
		var that = this;

        // Mouse page position
        var mouseX = event.pageX;
        var mouseY = event.pageY;

        var closestDistance = 999999; // Incredible large start value


        // Find the nearest handle
        var pos = 0;
        that.$handles.each(function(index) {

            // Handle position
            var handleX = $(this).offset().left;
            var handleY = $(this).offset().top;

            // Handle Dimensions
            var handleWidth = $(this).width();
            var handleHeight = $(this).height();

            // Distance to handle
            var distance = Math.abs(mouseX - (handleX+(handleWidth/2)));
            if(that.options.orientation === "vertical") {
                distance = Math.abs(mouseY - (handleY+(handleHeight/2)));
            }

            if(distance < closestDistance) {
                closestDistance = distance;
                pos = index;
            }
        });
		
		return pos;
	},
	
	_focus: function(event) {
		if (this.options.disabled) return false;
		var that = this;
		var $this = $(event.target);
		that.$element.addClass("focus");
		$this.closest(".value").addClass("focus").find(".handle").addClass("focus");
	},
	
	_blur: function(event) {
		if (this.options.disabled) return false;
		var that = this;
		var $this = $(event.target);
		that.$element.removeClass("focus");
		$this.closest(".value").removeClass("focus").find(".handle").removeClass("focus");
	},
	
	_keyDown: function(event) {
		if (this.options.disabled) return;
		var that = this;
		var $this = $(event.target);
		var $input = $this.closest(".value").find("input");
		var index = that.$inputs.index($input);
		var val = Number($input.val());
		var step = Number(that.options.step);
		var minimum = Number(that.options.min);
		var maximum = Number(that.options.max);
		var page = Math.max(step,Math.round((maximum-minimum)/10));
		switch(event.keyCode) {
			case 40:
			case 37:
				// down
				val-=step;
				event.preventDefault();
				break;
			case 38:
			case 39:
				// up
				val+=step;
				event.preventDefault();
				break; 
			case 33:
				// page up
				val+=(page-(val%page));
				event.preventDefault();
				break;
			case 34:
				// page down
				val-=(page- (val%page===0 ? 0 : page-val%page));
				event.preventDefault();
				break;
			case 35:
				// end
				val = maximum;
				event.preventDefault();
				break;
			case 36:
				// home
				val = minimum;
				event.preventDefault();
				break;
		}
		if (val !== Number($input.val())) {
			that.setValue(val, index);
			$input.change();
		}
		
	},
    
    _handleClick: function(event) {
		
        if(this.options.disabled) return false;
        var that = this;
		
        // Mouse page position
        var mouseX = event.pageX;
        var mouseY = event.pageY;
		
        // Find the nearest handle
        var pos = that._findNearestHandle(event);
				
		var val = that._getValueFromCoord(mouseX, mouseY, true);
				
		if (!isNaN(val))
		{
			that._updateValue(pos, val);
			that._moveHandles();
			if(that.options.filled) {
				that._updateFill();
			}
		}
		
		if (that._isMobile())
		{
			that.$inputs.eq(pos).focus();
		} else {
			that.$handles.eq(pos).focus();
		}
    },

    _mouseDown: function(event) {
        if(this.options.disabled) return false;
		
		var that = this;

        that.draggingPosition = that._findNearestHandle(event);
        
		that.$handles.each(function(index, handle) {
            if (handle === event.target) that.draggingPosition = index;
        }.bind(this));
		
		that.$tooltips.each(function(index, tooltip) {
            if (tooltip === event.target) that.draggingPosition = index;
        }.bind(this));	
		
		if (that._isMobile())
		{
			that.$inputs.eq(this.draggingPosition).focus();
		} else {
			that.$handles.eq(this.draggingPosition).focus();
		}       
        that.$handles.eq(this.draggingPosition).addClass("dragging");
        that.$element.closest("body").addClass("slider-dragging-cursorhack");
        
        $(window).bind("mousemove.slider touchmove.slider", that._handleDragging.bind(this));
        $(window).bind("mouseup.slider touchend.slider", that._mouseUp.bind(this));

        event.preventDefault();
        //update();
    },
    
    _handleDragging: function(event) {
        var mouseX = event.pageX;
        var mouseY = event.pageY;
        
        // Handle touch events
        if (event.originalEvent.targetTouches) {
            var touch = event.originalEvent.targetTouches.item(0);
            mouseX = touch.pageX;
            mouseY = touch.pageY;
        }
		
		/*console.log('_handleDragging : '+this.$inputs.eq(this.draggingPosition).attr("id"));*/
		
		this._updateValue(this.draggingPosition, this._getValueFromCoord(mouseX, mouseY));      
		this._moveHandles();
		if(this.options.filled) {
			this._updateFill();
		}
        event.preventDefault();
    },

    _mouseUp: function(event) {		
		if (this._isMobile())
		{
			this.$inputs.eq(this.draggingPosition).focus();
		} else {
			this.$handles.eq(this.draggingPosition).focus();
		} 
        this.$handles.eq(this.draggingPosition).removeClass("dragging");
		this.$element.closest("body").removeClass("slider-dragging-cursorhack");
        
        this.draggingPosition = -1;
        $(window).unbind("mousemove.slider touchmove.slider");
        $(window).unbind("mouseup.slider touchend.slider");
    },

    _updateValue: function(pos, value, doNotTriggerChange) {
        var that = this;
        if ((that.$inputs.eq(pos).attr("value") !== value.toString()) || (that.values[pos] !== value.toString())) {
            if (value > this.options.max) value = this.options.max;
            if (value < this.options.min) value = this.options.min;
			
            if(pos === 0 || pos === 1) {
				if (that.$inputs.length===2 && this.options.bound)
				{ 
					if (pos===0) {
						value = Math.min(value, Number(that.$inputs.eq(1).val()));
						that.$inputs.eq(1).attr({"min":value});
						that.$inputs.eq(pos).attr({"max":that.$inputs.eq(1).val()/*,"aria-valuemax":that.$inputs.eq(1).val()*/});
						that.$handles.eq(1).attr({"aria-valuemin":value});
						that.$handles.eq(pos).attr({"aria-valuemax":that.$inputs.eq(1).val()});
					} else {
						value = Math.max(value, Number(that.$inputs.eq(0).val()));
						that.$inputs.eq(0).attr({"max":value});
						that.$inputs.eq(pos).attr({"min":that.$inputs.eq(0).val()});
						that.$handles.eq(0).attr({"aria-valuemax":value});
						that.$handles.eq(pos).attr({"aria-valuemin":that.$inputs.eq(0).val()});
					}
				}
                that.values[pos] = value.toString();
                that.$inputs.eq(pos).attr({"value":value});
				that.$handles.eq(pos).attr({"aria-valuenow":value,"aria-valuetext":value});
                if (!doNotTriggerChange) that.$inputs.eq(pos).change(); // Keep input element value updated too and fire change event for any listeners
            }
        }
    },

    _moveHandles: function() {
        var that = this;

        // Set the handle position as a percentage based on the stored values
        this.$handles.each(function(index) {
            var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;
			var $input = that.$inputs.eq(index);

            if(that.options.orientation === "vertical") {
                if(that.options.slide) {
                    $(this).stop().animate({bottom: percent + "%"}, "fast");
					$input.stop().animate({bottom: percent + "%"}, "fast");
                } else {
                    $(this).css("bottom", percent + "%");
					$input.css("bottom", percent + "%");
                }
            } else { // Horizontal
                if(that.options.slide) {
                    $(this).stop().animate({left: percent + "%"}, "fast");
					$input.stop().animate({left: percent + "%"}, "fast");
                } else {
                    $(this).css("left", percent + "%");
					$input.css("left", percent + "%");
                }
            }

            // Update tooltip value (if required)
            if(that.options.tooltips) {
                that.$tooltips.eq(index).html(that.options.tooltipFormatter(that.values[index]));
            }
        });
    },

    _updateFill: function() {
        var that = this;
        var percent;

        if(that.values.length !== 0) {
            if(that.values.length === 2) { // Double value/handle
                percent = ((that._getLowestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
                var secondPercent = ((that._getHighestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
                var percentDiff = secondPercent - percent;
                if(that.options.orientation === "vertical") {
                    if(that.options.slide) {
                        that.$fill.stop().animate({bottom: percent + "%", height: percentDiff + "%"}, "fast");
                    } else {
                        that.$fill.css("bottom", percent + "%").css("height", percentDiff + "%");
                    }
                } else { // Horizontal
                    if(that.options.slide) {
                        that.$fill.stop().animate({left: percent + "%", width: percentDiff + "%"}, "fast");
                    } else {
                        that.$fill.css("left", percent + "%").css("width", percentDiff + "%");
                    }
                }
            } else { // Single value/handle
                percent = ((that.values[0] - that.options.min) / (that.options.max - that.options.min)) * 100;
                if(that.options.orientation === "vertical") {
                    if(that.options.slide) {
                        that.$fill.stop().animate({height: percent + "%"}, "fast");
                    } else {
                        that.$fill.css("height", percent + "%");
                    }
                } else {
                    if(that.options.slide) {
                        that.$fill.stop().animate({width: percent + "%"}, "fast");
                    } else {
                        that.$fill.css("width", percent + "%");
                    }
                }
            }
        }
        if(that.options.ticks) {
            that._coverTicks();
        }
    },

    _coverTicks: function() {
        var that = this;

        // Ticks covered by the fill are given 'covered' class
        that.$ticks.each(function(index) {
            var value = that._getValueFromCoord($(this).offset().left, $(this).offset().top);
            if(that.values.length === 2) { // TODO add a parameter to indicate multi values/handles
                if((value > that._getLowestValue()) && (value < that._getHighestValue())) {
                    if(!$(this).hasClass('covered')) $(this).addClass('covered');
                } else {
                    $(this).removeClass('covered');
                }
            } else {
                if(value < that._getHighestValue()) {
                    if(!$(this).hasClass('covered')) $(this).addClass('covered');
                } else {
                    $(this).removeClass('covered');
                }
            }
        });
    },

    _getValueFromCoord: function(posX, posY, restrictBounds) {
        var that = this;
        var percent, snappedValue, remainder;
        var elementOffset = that.$element.offset();

        if(that.options.orientation === "vertical") {
            var elementHeight = that.$element.height();
            percent = ((elementOffset.top + elementHeight) - posY) / elementHeight;
        } else {
            var elementWidth = that.$element.width();
            percent = ((posX - elementOffset.left) / elementWidth);
        }
		
		// if the bounds are retricted, as with _handleClick, we souldn't change the value.
		if (restrictBounds && (percent<0 || percent>1)) return NaN;
		
        var rawValue = that.options.min * 1 + ((that.options.max - that.options.min) * percent);

        if(rawValue >= that.options.max) return that.options.max;
        if(rawValue <= that.options.min) return that.options.min;


        // Snap value to nearest step
        remainder = ((rawValue - that.options.min) % that.options.step);
        if(Math.abs(remainder) * 2 >= that.options.step) {
            snappedValue = (rawValue - remainder) + (that.options.step * 1); // *1 for IE bugfix: Interpretes expr. as string!
        } else {
            snappedValue = rawValue - remainder;
        }
        
        return snappedValue;
    },

    _getHighestValue: function() {
      return Math.max.apply(null, this.values);
    },

    _getLowestValue: function() {
      return Math.min.apply(null, this.values);
    },
	
    /** @ignore */
    _isMobile: function() {
        return typeof window.ontouchstart === 'object';
    }

    /*update: function() {
        // TODO: Single update method
    }*/
  });



  CUI.util.plugClass(CUI.Slider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $(".slider[data-init='slider']", e.target).slider();
    });
  }
}(window.jQuery));


/*


 <!--section id="Slider">
 <h2 class="line">Slider</h2>
 <p>Different types of sliders.</p>

 <div class="componentSample">
 <div class="example">
 <div class="filterSample">
 <div class="sampleTitle left">Standard</div>
 <div class="slider horizontal">
 <div class="range" style="width: 20%"></div>
 <span class="tick" style="left: 20%"></span>
 <div class="handle" style="left: 45%"></div>
 <div class="tooltip info arrow-left">
 <span>45%</span>
 </div>
 </div>

 </div>
 </div>

 </section-->

    */
(function($) {
  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A datepicker widget
         
        <p>
            <div class="datepicker" data-init="datepicker">
                <input type="datetime" value="1987-04-06T20:35Z">
                <button><span class="icon-calendar small">Datetime picker</span></button>
            </div>
        </p>

        @example
        <caption>Instantiate by data API</caption>
        &lt;div class=&quot;datepicker&quot; data-init=&quot;datepicker&quot;&gt;
            &lt;input type=&quot;datetime&quot; value=&quot;1987-04-06T20:35Z&quot;&gt;
            &lt;button&gt;&lt;span class=&quot;icon-calendar small&quot;&gt;Datetime picker&lt;/span&gt;&lt;/button&gt;
        &lt;/div&gt;
        
Currently there are the following data options:
  data-init="datepicker"         Inits the datepicker widget after page load
  data-disabled                  Sets field to "disabled" if given (with any non-empty value)
  data-required                  Sets field to "required" if given (with any non-empty value)
  data-stored-format             Sets the format of the date for transferring it to the server
  data-displayed-format          Sets the format of the date for displaying it to the user
  data-force-html-mode           Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
  data-day-names                 JSON-array-data with the short names of all week days, starting with Sunday
  data-month-names               JSON-array-data with the names of all months, starting with January

Additionally the type (date, time, datetime) is read from the &lt;input&gt; field.

        @example
        <caption>Instantiate with Class</caption>
        var datepicker = new CUI.Datepicker({
          element: '#myOrdinarySelectBox'
        });

        @example
        <caption>Instantiate by jQuery plugin</caption>
        $("div.datepicker").datepicker();
           
       
      @desc Creates a datepicker from a div element
      @constructs

      @param {Object}   options                               Component options
      @param {Array} [options.monthNames=english names]       Array of strings with the name for each month with January at index 0 and December at index 11
      @param {Array} [options.dayNames=english names]         Array of strings with the name for each weekday with Sun at index 0 and Sat at index 6
      @param {String} [options.type="date"]                   Type of picker, supports date, datetime, datetime-local and time
      @param {integer} [options.startDay=0]                   Defines the start day for the week, 0 = Sunday, 1 = Monday etc.
      @param {boolean} [options.disabled=false]               Is this widget disabled?
      @param {String} [options.displayedFormat="YYYY-MM-DD[T]HH:mm[Z]"]           Displayed date (userfriendly), default is 2012-10-20 20:35
      @param {String} [options.storedFormat="YYYY-MM-DD[T]HH:mmZ"]    Storage Date format, is never shown to the user, but transferred to the server 
      @param {String} [options.required=false]                 Is a value required?
    */
    
    defaults: {
        monthNames: null,
        dayNames: null,
        format: null,
        type: "date",
        selectedDateTime: null,
        startDay: 0,
        disabled: false,
        displayedFormat: null,
        storedFormat: null,
        forceHTMLMode: false,
        required: false
    },
    
    displayDateTime: null,
    pickerShown: false,
    useNativeControls: false,
    internFormat: 'YYYY-MM-DD[T]HH:mmZ',
    officialDateFormat: 'YYYY-MM-DD',
    officialTimeFormat: 'HH:mm',
    officialDatetimeFormat: 'YYYY-MM-DD[T]HH:mmZ',

    construct: function(options) {

        var $button = this.$element.find('>button');
        if ($button.attr('type') === undefined) {
            $button[0].setAttribute('type', 'button');
        }

        this.options.monthNames = this.options.monthNames || CUI.Datepicker.monthNames;
        this.options.dayNames = this.options.dayNames || CUI.Datepicker.dayNames;


        this._readDataFromMarkup();
        
        // Set standard formats
        this.options.storedFormat = this.options.storedFormat || (this.options.type === "time" ? 'HH:mm' : 'YYYY-MM-DD[T]HH:mmZ');
        this.options.displayedFormat = this.options.displayedFormat || (this.options.type === "time" ? 'HH:mm' : 'YYYY-MM-DD HH:mm');
        
        if(this._isSupportedMobileDevice() && this._supportsInputType(this.options.type)) {
            this.useNativeControls = true;
        }

        this._adjustMarkup();
        this._updateState();

        this.$openButton = this.$element.find('button');

        this.$input = this.$element.find('input').not("[type=hidden]");
        this.$hiddenInput = this.$element.find('input[type=hidden]');

        
        // Enable time buttons in popover
        if(this._isTimeEnabled()) {
            this._renderTime();
        }

        // If HTML5 input is used, then force to use the official format.
        if (this.useNativeControls) {
            if (this.options.type === 'date') {
                this.options.displayedFormat = this.officialDateFormat;
            } else if (this.options.type === 'time') {
                this.options.displayedFormat = this.officialTimeFormat;
            } else {
                this.options.displayedFormat = this.officialDatetimeFormat;
            }
        }
        
        if(!this.useNativeControls) {
            this._switchInputTypeToText(this.$input);
        }

        var timeout = null;
        var $input = this.$input;
        var $btn = this.$openButton;
        var $popover = this.$element.find('.popover').first();

        if (!this.options.disabled) {
            $('body').on('click', function(){
                if (this.keepShown === false) {
                    this._hidePicker();
                }
            }.bind(this));

            this.$element.on('click', function(event){
                if (!this.pickerShown) this._openPicker();

                // let the event time to propagate.
                this.keepShown = true;
                setTimeout(function() {
                    this.keepShown = false;
                }.bind(this), 200);

            }.bind(this));
        }

        // Listen on change and additional on blur, as iPad does not fire change events for date fields.
        $input.on("change blur", function() {
            if (this.options.disabled) return;
            var newDate = moment(this.$input.val(), this.options.displayedFormat);
            this._setDateTime(newDate);
        }.bind(this));

        function normalizeDate(date) {
            if (!date) return null;
            return moment([date.year(), date.month(), date.date()]);
        }

        // Move around
        this.$element.find(".calendar").on("swipe", function(event) {
            var d = event.direction;
            if (d === "left") {
                this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]));
                this._renderCalendar("left");                
            } else if (d === "right") {
                this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() - 1, 1]));
                this._renderCalendar("right");                
            }         
        }.bind(this));

        this.$element.on("mousedown", ".next-month", function(event) {
            event.preventDefault();
            if (!this.displayDateTime) return;
            this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]));
            this._renderCalendar("left");
        }.bind(this));

        this.$element.on("mousedown", ".prev-month", function(event) {
            event.preventDefault();
            if (!this.displayDateTime) return;
            this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() - 1, 1]));
            this._renderCalendar("right");
        }.bind(this));

        if(this._isTimeEnabled()) {
            var dropdownChanged = function () {
                var h = this._getHoursFromDropdown();
                var m = this._getMinutesFromDropdown();
                if (!this.options.selectedDateTime) this.options.selectedDateTime = moment();
                var date = this.options.selectedDateTime.hours(h).minutes(m);

               this._setDateTime(date);
            };

            // for Desktop
            this.$element.on("dropdown-list:select", ".hour,.minute", dropdownChanged.bind(this));
            // for Mobile
            this.$element.on("change", ".hour,.minute", dropdownChanged.bind(this));
        }


        if (this.useNativeControls) {
            this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
        }
        
        // Reading input value for the first time -> there may be a storage format
        if (!this.options.selectedDateTime) this._readInputVal([this.options.storedFormat, this.options.displayedFormat]);
        this._setDateTime(this.options.selectedDateTime);
    },
    
    _readDataFromMarkup: function() {
        if (this.$element.data("disabled")) {
            this.options.disabled = true;
        }
        
        if (this.$element.data('required')) {
            this.options.required = true;
        }

        var $input = $(this.$element.find("input").filter("[type^=date],[type=time]"));
        if ($input.length !== 0) {
            this.options.type = $input.attr("type");
        }

        var el = this.$element;
        if (el.data('displayed-format') !== undefined) {
            this.options.displayedFormat = el.data('displayed-format');
        }

        if (el.data('stored-format') !== undefined) {
            this.options.storedFormat = el.data('stored-format');
        }

        if (el.data('force-html-mode') !== undefined) {
            this.options.forceHTMLMode = el.data('force-html-mode');
        }
        
        if (el.data('day-names') !== undefined) {
            this.options.dayNames = el.data('day-names') || this.options.dayNames;
        }
        
        if (el.data('month-names') !== undefined) {
            this.options.monthNames = el.data('month-names') || this.options.monthNames;
        }                
    },

    _readInputVal: function(format) {
        if (!format) format = this.options.displayedFormat;
        var value = this.$input.eq(0).val();
        var date = moment(value, format);
        if (!date || !date.isValid()) date = moment(value); // Fallback: Try automatic guess if none of our formats match
        this.displayDateTime = this.options.selectedDateTime = date;
    },
    
    _updateState: function() {
        if (this.options.disabled) {
            this.$element.find("input,button").attr("disabled", "disabled");
            this._hidePicker();
        } else {
            this.$element.find("input,button").removeAttr("disabled");
        }

        if ((!this.options.selectedDateTime && this.options.required) || (this.options.selectedDateTime && !this.options.selectedDateTime.isValid())) {
            this.$element.addClass("error");
        } else {
            this.$element.removeClass("error");
        }
    },

    _switchInputTypeToText: function($input) {
        var convertedInput = $input.detach().attr('type', 'text');
        // readonly to hide the keyboard
        // convertedInput.attr('readonly', 'true'); // Removed, we want to edit dates manually!
        this.$element.prepend(convertedInput);
    },

    _openNativeInput: function() {
        this.$input.trigger("tap");
    },
    
    _keyPress: function() {
        if (!this.pickerShown) return;
        
        // TODO: Keyboard actions
    },

    _openPicker: function() {
        this.$element.addClass("focus");

        if(!this.useNativeControls) {
            this._readInputVal();
            this._showPicker();
        } else {
            this._openNativeInput();
        }
    },
    
    _showPicker: function() {
        if(this._isDateEnabled()) this._renderCalendar();
        
        var left = this.$openButton.position().left + this.$openButton.width() / 2 - (this.$element.find(".popover").width() / 2);
        var top = this.$openButton.position().top + this.$openButton.outerHeight() + 16;
        //if (left < 0) left = 0;
        this.$element.find(".popover").css(
                {"position": "absolute",
                 "left": left + "px",
                 "top": top + "px"}).show();
        
        this.pickerShown = true;
    },
    
    _hidePicker: function() {
        this.$element.removeClass("focus");
        this.$element.find(".popover").hide();
        this.pickerShown = false;
    },
    
    _adjustMarkup: function() {
        if (!this.useNativeControls) {
            if (this.$element.find(".popover").length === 0) {
                this.$element.append('<div class="popover arrow-top" style="display:none"><div class="inner"></div></div>');
                if(this._isDateEnabled()) this.$element.find(".inner").append('<div class="calendar"><div class="calendar-header"></div><div class="calendar-body"></div></div>');
            }
            if (this.$element.find("input").not("[type=hidden]").length === 0) {
                this.$element.append("<input type=\"text\">");
            }

        } else {
            // Show native control
        }

        // Always include hidden field
        if (this.$element.find("input[type=hidden]").length === 0) {
            this.$element.append("<input type=\"hidden\">");
        }
        
        if (!this.$element.find("input[type=hidden]").attr("name")) {
            var name = this.$element.find("input").not("[type=hidden]").attr("name");
            this.$element.find("input[type=hidden]").attr("name",name);
            this.$element.find("input").not("[type=hidden]").removeAttr("name");
        }
                    
    },
    
    _renderCalendar: function(slide) {
        if (!this.displayDateTime || !this.displayDateTime.isValid()) this.displayDateTime = moment();
        var displayDateTime = this.displayDateTime;
    
        var displayYear = displayDateTime.format('YYYY');
        var displayMonth = displayDateTime.format('M') ;

        var table = this._renderOneCalendar(displayMonth, displayYear);
        
        var $calendar = this.$element.find(".calendar");

        table.on("mousedown", "a", function(event) {
            event.preventDefault();

            var date = moment($(event.target).data("date"), this.internFormat);

            if(this._isTimeEnabled()) {
                var h = this._getHoursFromDropdown();
                var m = this._getMinutesFromDropdown();
                date.hours(h).minutes(m);
            }

            this._setDateTime(date);
            this._hidePicker();
        }.bind(this));

        if ($calendar.find("table").length > 0 && slide) {
            this._slideCalendar(table, (slide === "left"));
        } else {
            $calendar.find("table").remove();
            $calendar.find(".sliding-container").remove();
            $calendar.find(".calendar-body").append(table);
        }

        this._updateState();
    },

    _getHoursFromDropdown: function() {
        return parseInt(this.$element.find('.time .hour select').val(), 10);
    },

    _getMinutesFromDropdown: function() {
        return parseInt(this.$element.find('.time .minute select').val(), 10);
    },

    _renderOneCalendar: function(month, year) {

        var monthName = this.options.monthNames[month - 1];

        var title = $('<div class="calendar-header"><h2>' + monthName + " " + year + '</h2></div>');

        // Month selection
        var nextMonthElement = $("<button class=\"next-month\">›</button>");
        var prevMonthElement = $("<button class=\"prev-month\">‹</button>");

        title.append(nextMonthElement).append(prevMonthElement);

        var $calendar = this.$element.find(".calendar");
        if ($calendar.find(".calendar-header").length > 0) {
            $calendar.find(".calendar-header").replaceWith(title);
        } else {
            $calendar.prepend(title);
        }

        var day = null;

        var table = $("<table>");
        table.data("date", year + "/" + month);

        var html = "<tr>";
        for(var i = 0; i < 7; i++) {
            day = (i + this.options.startDay) % 7;
            var dayName = this.options.dayNames[day];
            html += "<th><span>" + dayName + "</span></th>";
        }
        html += "</tr>";
        table.append("<thead>" + html + "</thead>");

        var firstDate = moment([year, month - 1, 1]);
        var monthStartsAt = (firstDate.day() - this.options.startDay) % 7;
        if (monthStartsAt < 0) monthStartsAt += 7;

        html = "";
        var today = moment();
        
        function isSameDay(d1, d2) {
            if (!d1) return;
            if (!d2) return;
            return d1.year() === d2.year() && d1.month() === d2.month() && d1.date() === d2.date(); 
        }
        
        for(var w = 0; w < 6; w++) {
            html +="<tr>";
            for(var d = 0; d < 7; d++) {
                day = (w * 7 + d) - monthStartsAt + 1;
                var displayDateTime = moment([year, month - 1, day]);
                var isCurrentMonth = (displayDateTime.month() + 1) === parseFloat(month);
                var cssClass = "";

                if (isSameDay(displayDateTime, today)) cssClass += " today";
                if (isSameDay(displayDateTime, this.options.selectedDateTime)) cssClass += " selected";

                if (isCurrentMonth) {
                    html += "<td class=\"" + cssClass + "\"><a href=\"#\" data-date=\"" + displayDateTime.format(this.internFormat) + "\">" + displayDateTime.date() + "</a></td>";
                } else {
                    html += "<td class=\"" + cssClass + "\"><span>" + displayDateTime.date() + "</span></td>";
                }
            }
            html +="</tr>";
        }
        table.append("<tbody>" + html + "</tbody>");

        return table;
    },
      
    _slideCalendar: function(newtable, isLeft) {

        this.$element.find(".sliding-container table").stop(true, true);
        this.$element.find(".sliding-container").remove();

        var oldtable = this.$element.find("table");
        var width = oldtable.width();
        var height = oldtable.height();
        
        var container = $("<div class=\"sliding-container\">");

        container.css({"display" : "block",
                       "position": "relative",
                       "width": width + "px",
                       "height": height + "px",
                       "overflow": "hidden"});
                   
        this.$element.find(".calendar-body").append(container);
        container.append(oldtable).append(newtable);
        oldtable.css({"position": "absolute", "left": 0, "top": 0});
        oldtable.after(newtable);
        newtable.css({"position": "absolute", "left": (isLeft) ? width : -width, "top": 0});

        var speed = 400;
        
        oldtable.animate({"left": (isLeft) ? -width : width}, speed, function() {
            oldtable.remove();
        });

        newtable.animate({"left": 0}, speed, function() {
            if (container.parents().length === 0) return; // We already were detached!
            newtable.css({"position": "relative", "left": 0, "top": 0});
            newtable.detach();
            this.$element.find(".calendar-body").append(newtable);
            container.remove();
        }.bind(this));        
    },
    
    /**
    * Sets a new datetime object for this picker
    */
    _setDateTime: function(date) {
        this.options.selectedDateTime = this.displayDateTime = date;
        
        if (!date) {
            this.$input.val(""); // Clear for null values
        } else if (date.isValid()) {
            this.$input.val(date.format(this.options.displayedFormat)); // Set only valid dates
        }
        
        var storage = (date && date.isValid()) ? date.format(this.options.storedFormat) : "";     
        this.$hiddenInput.val(storage);
            
        this._updateState();
        
        if(this.options.type !== "time") {
            this._renderCalendar();
        }
        
        if(this._isTimeEnabled()) this._renderTime();
    },

    _getTimeFromInput: function() {
        if(this._isTimeEnabled()) {
            var h = parseInt(this.$element.find('.time .hour button').text(), 10);
            var m = parseInt(this.$element.find('.time .minute button').text(), 10);
            var time = [h,m];
            return time;
        }
    },

    _getTimeString: function(hour, minute) {
        return this._pad(hour) + ":" + this._pad(minute) + ":" + this._pad(this.options.selectedDateTime.seconds());
    },

    _combineDateTimeStrings: function(dateString, timeString) {
        return dateString + " " + timeString;
    },

    _renderTime: function() {
        var html = $("<div class='time'><i class='icon-clock small'></i></div>");

        // Hours
        var hourSelect = $('<select></select>');
        for(var h = 0; h < 24; h++) {
            var hourOption = $('<option>' + this._pad(h) + '</option>');
            if(this.options.selectedDateTime && h === this.options.selectedDateTime.hours()) { hourOption.attr('selected','selected'); }
            hourSelect.append(hourOption);
        }
        var hourDropdown = $('<div class="dropdown hour"><button></button></input>').append(hourSelect);

        // Minutes
        var minuteSelect = $('<select></select>');
        for(var m = 0; m < 60; m++) {
            var minuteOption = $('<option>' + this._pad(m) + '</option>');
            if(this.options.selectedDateTime && m === this.options.selectedDateTime.minutes()) { minuteOption.attr('selected', 'selected'); }
            minuteSelect.append(minuteOption);
        }
        var minuteDropdown = $('<div class="dropdown minute"><button>Single Select</button></div>').append(minuteSelect);

        // Style for mobile, select can't be hidden
        $(hourDropdown).css({
            'position': 'relative'
        });

        $(minuteDropdown).css({
            'position': 'relative'
        });

        $(hourDropdown).find('select').css({
            'position': 'absolute',
            'left': '1.5rem',
            'top': '1rem'
        });

        $(minuteDropdown).find('select').css({
            'position': 'absolute',
            'left': '1.5rem',
            'top': '1rem'
        });

        html.append(hourDropdown, $("<span>:</span>"), minuteDropdown);

        if (this.$element.find(".time").length === 0) {
            this.$element.find(".inner").append(html);
        } else {
            this.$element.find(".time").empty().append(html.children());
        }
        
        // Set up dropdowns
        $(hourDropdown).dropdown();
        $(minuteDropdown).dropdown();
    },

    _isSupportedMobileDevice: function() {
      if( (navigator.userAgent.match(/Android/i) ||
          navigator.userAgent.match(/iPhone|iPad|iPod/i)) &&
          !this.options.forceHTMLMode) {
          return true;
      }
      return false;
    },

    _supportsInputType: function(type) {
      var i = document.createElement("input");
      i.setAttribute("type", type);
      return i.type !== "text";
    },

    _isDateEnabled: function() {
      return (this.options.type === "date") || (this.options.type === "datetime") || (this.options.type === "datetime-local");
    },

    _isTimeEnabled: function() {
      return (this.options.type === "time") || (this.options.type === "datetime") || (this.options.type === "datetime-local");
    },
    
    _pad: function(s) {
        if (s < 10) return "0" + s;
        return s;
    }
    
  });
  
  CUI.Datepicker.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  CUI.Datepicker.dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  CUI.util.plugClass(CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $("[data-init=datepicker]", e.target).datepicker();
    });
  }

}(window.jQuery));
(function($) {
  CUI.Pulldown = new Class(/** @lends CUI.Pulldown# */{
    toString: 'Pulldown',
    extend: CUI.Widget,
    
    defaults: {
    },
    
    timeout: null,
    popoverShown: false,
    
    /**
      @extends CUI.Widget
      @classdesc A pulldown widget
        
      @param {Object}   options                               Component options
      
    */
    construct: function(options) {
        var $link = this.$element.find('a').first();
        var $popover = this.$element.find('.popover').first();

        $link.on("click", function(event) {
            event.preventDefault();
            this.togglePopover();
            this._keepFocus();
        }.bind(this));

        $popover.on("click", function() {
            this._keepFocus();
        }.bind(this));

        $link.on("blur", function() {
            this.timeout = setTimeout(function() {
                this.timeout = null;
                this.hidePopover();
            }.bind(this), 200);
        }.bind(this));
    },

    _keepFocus: function() {
        var $link = this.$element.find('a').first();

        clearTimeout(this.timeout);
        this.timeout = null;
        $link.focus();
    },

    togglePopover: function() {
        if (this.popoverShown) {
            this.hidePopover();
        } else {
            this.showPopover();
        }
    },

    showPopover: function() {
        this._placePopover();
        this.$element.find('.popover').show();
        this.popoverShown = true;
    },

    hidePopover: function() {
        this.$element.find('.popover').hide();
        this.popoverShown = false;
    },

    _placePopover: function() {
        var $link = this.$element.find('a').first(),
            $popover = this.$element.find('.popover'),
            position = $link.position(),
            top,
            left,
            marginLeft;

        //default width either to:
        //first link width + 22 (22 is alignment on icon) if link is larger that popover
        //or popover width if larger

        var w = Math.max($link.width() + 22, $popover.width());

        var size = {
            width: w,
            height: $link.height()
        };

        // alignment
        if ($popover.hasClass('alignleft')) {
            top = position.top + size.height;
            left = - 30;
            marginLeft = 30 - w;
        } else { // align right
            top = position.top + size.height + 15;
            left = position.left + $link.width() - size.width + 5;
            marginLeft = size.width - 30;
        }

        $popover.css({
            top: top,
            left: left,
            width: size.width
        });

        /*$('.popover.arrow-top:before').css({
            marginLeft: marginLeft
        });*/
    }
    
  });

  CUI.util.plugClass(CUI.Pulldown);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $("[data-init=pulldown]", e.target).pulldown();
    });
  }

}(window.jQuery));
(function($) {
  CUI.Wizard = new Class(/** @lends CUI.Wizard# */{
    toString: 'Wizard',

    extend: CUI.Widget,
    /**
     * @extends CUI.Widget
     * @classdesc A wizard widget to navigate throught a form.
     *    
     *  <div class="wizard" data-init="wizard">
     *      <nav>
     *          <button class="back">Back</button>
     *          <ol>
     *              <li>First step</li>
     *              <li>Second step</li>
     *              <li>Third step</li>
     *              <li>Last step</li>
     *          </ol>
     *          <button class="next" disabled>Next</button>
     *      </nav>
     *      <section data-next-disabled="false" data-back-label="Cancel">
     *          The first step is optional.
     *      </section>
     *      <section data-next-disabled="false">
     *          The second step is optional.
     *      </section>
     *      <section data-next-disabled="false">
     *          The third step is optional.
     *      </section>
     *      <section data-next-label="Create">
     *          Name is required.
     *      </section>
     *  </div>
     *     
     *  <h2>Data Attributes</h2>
     *  <h4>Currently there are the following data options:</h4>
     *  <pre>
     *    data-hide-steps               If true, step will be hidden (useful for one step wizard).
     *    data-init="wizard"
     *  </pre>
     *
     *  <h4>Currently there are the following data options on section pages:</h4>
     *  <pre>
     *    data-wizard-page-callback     Callback identifier if the pageChanged options contains several callbacks
     *    data-next-label               Specify the label of the `next button`
     *    data-back-label               Specify the label of the `back button`
     *    data-next-disabled            Speficy if the `next button` should be disabled
     *    data-back-disabled            Speficy if the `back button` should be disabled
     *  </pre>
     *
     *  @example
     *  <caption>Instantiate by data API</caption>
     *  &lt;div class=&quot;wizard&quot; data-init=&quot;wizard&quot;&gt;
     *      &lt;input type=&quot;datetime&quot; value=&quot;2012-10-20 11:10&quot;&gt;
     *      &lt;button&gt;&lt;span class=&quot;icon-calendar small&quot;&gt;Datetime picker&lt;/span&gt;&lt;/button&gt;
     *  &lt;/div&gt;
     *     
     *  @example
     *  <caption>Instantiate with Class</caption>
     *  var wizard = new CUI.Wizard({
     *    element: '#myOrdinarySelectBox'
     *  });
     *     
     *  @example
     *  <caption>Instantiate by jQuery plugin</caption>
     *  $("div.wizard").wizard();
     *
     * @desc Creates a new wizard widget 
     * @constructs
     *
     * @param {Object} options Component options
     * @param {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param {Function|Object} options.onPageChanged Callback called each time the page change (with arguments: `page`). An Collection of functions can be given. When a page is displayed if his data-wizard-page-callback attribute can be found in the collection, then the corresponding callback will be executed (examples is given in guide/wizard.html).
     * @param {Function} options.onFinish Callback called when the user is on the last page and clicks on the `next button` (without arguments)
     * @param {Function} options.onLeaving Callback called when the user is on the first page and clicks on the `back button` (without arguments)
     * @param {Function} options.onNextButtonClick Callback called after a click the on `next button` before the page change (without arguments) The page won't change if the callback return false.
     * @param {Function} options.onBackButtonClick Callback called after a click the on `back button` before the page change (without arguments) The page won't change if the callback return false.
     */
    construct: function(options) {
      this.$nav = this.$element.find('nav').first();
      this.$back = this.$nav.find('button').first();
      this.$next = this.$nav.find('button').last();
      this.$pageOverview = this.$nav.find('ol').last();

      if (this.$element.data("hide-steps") === true) {
        this.$pageOverview.addClass("hidden");
      }

      if (this.$back.attr('type') === undefined) {
          this.$back[0].setAttribute('type', 'button');
      }

      if (this.$next.attr('type') === undefined) {
          this.$next[0].setAttribute('type', 'button');
      }

      // Set toolbar classes
      this.$nav.addClass('toolbar');
      this.$back.addClass('left');
      this.$next.addClass('right');
      this.$pageOverview.addClass('center');

      // Add div to render leading fill for first list item
      this.$nav.find('li').first().append('<div class="lead-fill"></div>');

      this.$next.click(this._onNextClick.bind(this));
      this.$back.click(this._onBackClick.bind(this));

      this._updateDefault();

      // Start with first page
      // Asynchronous to make the wizard object available in the option callback (onPageChanged)
      setTimeout(function() { 
        this.changePage(1);
      }.bind(this), 1);
      
    },

    defaults: {
      nextDisabled: false,
      backDisabled: false,
      nextLabel: 'next',
      backLabel: 'back',
      onPageChanged: null,
      onFinish: null,
      onLeaving: null,
      onNextButtonClick: null,
      onBackButtonClick: null
    },

    /**
     * Change the page.
     *
     * Page number start with 1 and not 0.
     * Page number should be between 1 and number of sections.
     *
     * @param {Integer} pageNumber The page number
     */
    changePage: function(pageNumber) {
      if (pageNumber < 1 || pageNumber > this.$nav.find('li').length) return ;

      this.pageNumber = pageNumber;
      var page = this.pageNumber - 1;
      var $newPage = this.getCurrentPage();

      this.$nav.find('li').removeClass('stepped');
      this.$nav.find('li:lt(' + page + ')').addClass('stepped');

      this.$nav.find('li.active').removeClass('active');
      this.$nav.find('li:eq(' + page + ')').addClass('active');

      this.$element.find('>section.active').removeClass('active');
      this.$element.find('>section:eq(' + page + ')').addClass('active');

      this._updateButtons();

      // Accept a callback or a collection of callbacks
      this._fireCallback('onPageChanged');
      if (typeof this.options.onPageChanged === 'object' &&
              this._dataExists($newPage, 'wizardPageCallback') &&
              typeof this.options.onPageChanged[$newPage.data('wizardPageCallback')] === 'function') {
        this.options.onPageChanged[$newPage.data('wizardPageCallback')]($newPage);
      }
    },

    /**
     * Return the number of the current page
     *
     * Page number start with 1 and not 0.
     *
     * @return {Integer} The page number
     */
    getCurrentPageNumber: function() {
      return this.pageNumber;
    },

    /**
     * Return the current page
     *
     * Page number start with 1 and not 0.
     *
     * @return {Integer} The page number
     */
    getCurrentPage: function() {
      return this.getPage(this.pageNumber);
    },

    /**
     * Returns the page specifed by page number
     *
     * @return {Object} The page
     */
    getPage: function(pageNumber) {
      return this.$element.find('>section:eq('+ (parseFloat(pageNumber)-1) +')');
    },

    /**
     * Returns the page specifed by page number
     *
     * @return {Object} The page
     */
    getPageNav: function(pageNumber) {
      return this.$element.find('>nav li:eq('+ (parseFloat(pageNumber)-1) +')');
    },

    /**
     * Set the label of the `next` button 
     *
     * @return {String} The label
     */
    setNextButtonLabel: function(label) {
      this.$next.text(label);
    },

    /**
     * Set the label of the `back` button
     *
     * @return {String} The label
     */
    setBackButtonLabel: function(label) {
      this.$back.text(label);
    },

    /**
     * Set or remove the disabled attribe of the next button
     *
     * @param {Boolean} If true the button will be disabled, if not it will be enabled
     */
    setNextButtonDisabled: function(disabled) {
      this.$next.attr('disabled', disabled);
    },

    /**
     * Set or remove the disabled attribe of the back button
     *
     * @param {Boolean} If true the button will be disabled, if not it will be enabled
     */
    setBackButtonDisabled: function(disabled) {
      this.$back.attr('disabled', disabled);
    },

    activatePage: function(pageNumber) {
      this.getPage(pageNumber).removeClass('wizard-hidden-step');
      this.getPageNav(pageNumber).removeClass('wizard-hidden-step');
    },

    deactivatePage: function(pageNumber) {
      this.getPage(pageNumber).addClass('wizard-hidden-step');
      this.getPageNav(pageNumber).addClass('wizard-hidden-step');
    },

    /** @ignore */
    _onNextClick: function(e) {
      var callbackResult = this._fireCallback('onNextButtonClick');
      
      if (callbackResult === false) {
        return ;
      }
      
      var pageNumber = this._getNextPageNumber();

      if (pageNumber != null) {
        this.changePage(pageNumber);
      } else {
        this._fireCallback('onFinish');
      }
    },

    /** @ignore */
    _onBackClick: function(e) {
      var callbackResult = this._fireCallback('onBackButtonClick');
      
      if (callbackResult === false) {
        return ;
      }

      var pageNumber = this._getPreviousPageNumber();

      if (pageNumber != null) {
        this.changePage(pageNumber);
      } else {
        this._fireCallback('onLeaving');
      }
    },

    /**
     * returns the next page to display.
     * retruns null if the current page is the last one.
     *
     * @return {Integer} the page number
     *
     * @ignore
     */
    _getNextPageNumber: function() {
      var pageNumber = this.getCurrentPageNumber();
      return this._getRelativeNextPageNumber(pageNumber);
    },

    /**
     * return the next page to display from a page number
     * retruns null if the current page is the last one.
     *
     * @param {Integer} pageNumber page number
     * @return {Integer} the page number
     *
     * @ignore
     */
    _getRelativeNextPageNumber: function(pageNumber) {
      if (pageNumber < this.$nav.find('li').length) {
        var newPageNumber = pageNumber + 1;
        var page = this.getPage(newPageNumber);

        if ($(page).hasClass('wizard-hidden-step')) {
          return this._getRelativeNextPageNumber(newPageNumber);
        } else {
          return newPageNumber;
        }

      } else {
        return null;
      }
    },

    /**
     * return the previous page to display
     * retruns null if the current page is the first one.
     *
     * @return {Integer} the page number
     *
     * @ignore
     */
    _getPreviousPageNumber: function() {
      var pageNumber = this.getCurrentPageNumber();
      return this._getRelativePreviousPageNumber(pageNumber);
    },

    /**
     * return the previous page to display from a page number
     * retruns null if the current page is the first one.
     *
     * @param {Integer} pageNumber page number
     * @return {Integer} the page number
     *
     * @ignore
     */
    _getRelativePreviousPageNumber: function(pageNumber) {
      if (pageNumber > 1) {
        var newPageNumber = pageNumber - 1;
        var page = this.getPage(newPageNumber);

        if ($(page).hasClass('wizard-hidden-step')) {
          return this._getRelativePreviousPageNumber(newPageNumber);
        } else {
          return newPageNumber;
        }

        return pageNumber-1;
      } else {
        return null;
      }
    },

    /** @ignore */
    _updateButtons: function() {
      var page = this.getCurrentPage();

      this.setNextButtonLabel((this._dataExists(page, 'nextLabel')) ? page.data('nextLabel') 
        : this.options.nextLabel);
      this.setBackButtonLabel((this._dataExists(page, 'backLabel')) ? page.data('backLabel') 
        : this.options.backLabel);
      this.setNextButtonDisabled((this._dataExists(page, 'nextDisabled')) ? page.data('nextDisabled') 
        : this.options.nextDisabled);
      this.setBackButtonDisabled((this._dataExists(page, 'backDisabled')) ? page.data('backDisabled') 
        : this.options.backDisabled);
    },

    /** @ignore */
    _fireCallback: function(callback) {
        if (typeof this.options[callback] === 'function') {
          return this.options[callback]();
        }
        return undefined;
    },

    /** @ignore */
    /* jQuery doesn't have any method to check if a data exists */
    _dataExists: function($element, index) {
      return $element.data(index) !== undefined;
    },

    /** @ignore */
    _updateDefault: function() {
        this.options.nextDisabled = this.$next.is('[disabled]');
        this.options.backDisabled = this.$back.is('[disabled]');
        this.options.nextLabel = this.$next.text();
        this.options.backLabel = this.$back.text();
    }
  });

  CUI.util.plugClass(CUI.Wizard);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
      $("[data-init=wizard]", e.target).wizard();
    });
  }
}(window.jQuery));
(function($) {
  CUI.Sticky = new Class(/** @lends CUI.Sticky# */{
    toString: 'Sticky',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc A sticky widget - can make every element sticky to screen
      @deprecated
        
      @desc Makes element sticky, i.e. the element does not scroll out of screen.
    */
    construct: function(options) {
        this.$element.addClass("sticky");
        this.wrapper = $("<div>").addClass("sticky-wrapper");
        this.$element.wrapAll(this.wrapper);
       
        this.wrapper = this.$element.parent();
        this.wrapper.height(this.$element.outerHeight(true));
        
        
        this.scrollingElement = this.$element.parents(".sticky-container");
        if (this.scrollingElement.length === 0) {
            this.scrollingElement = $(document);
            this.pageScroll = true;
        }
        
        this.scrollingElement.on("scroll", this._fixElementPosition.bind(this));
        $(window).on("resize", this._fixElementPosition.bind(this));
    },

    _fixElementPosition: function() {
         
         var pos = this.wrapper.offset().top;
         var scroll = (this.pageScroll) ? this.scrollingElement.scrollTop() : this.scrollingElement.offset().top;
         var startAt = this._getStickPosition();

         var left = this.wrapper.position().left;
                   
         var w = this.wrapper.width();
         if ((pos - startAt) < scroll) {
            if (!this.pageScroll) {
                var containerPosition = this.scrollingElement.position();
                startAt += containerPosition.top;
                left += containerPosition.left;
                this.$element.detach();
                this.scrollingElement.after(this.$element);
            }
            this.$element.css({
                "position": (this.pageScroll) ? "fixed" : "absolute",
                "top": startAt+"px",
                "left": left,
                "width": w+"px"
            });
         } else {
            if (!this.pageScroll) {
                this.$element.detach();
                this.wrapper.append(this.$element);
            }
            this.$element.css({
                "position": "",
                "top": "",
                "left": "",
                "width": w+"px"
            });
         }

    },

    _getStickPosition: function() {
        var etop = this.wrapper.offset().top;
        var startAt = 0;
        this.scrollingElement.find(".sticky-wrapper").each(function(index, element) {
            if ($(element).offset().top < etop) startAt += $(element).outerHeight(true);
        }.bind(this));
        return startAt;
    },
    
    scrollingElement: null,
    pageScroll: false,
    wrapper: null
  });

  CUI.util.plugClass(CUI.Sticky);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
      $(".sticky,[data-init=sticky]", e.target).sticky();
    });
  }
}(window.jQuery));
/*
 * TODO - provide a "sync" method that syncs view and model
 * TODO - remove list items
 * TODO - auto scrolling
 * TODO - reordering animation in list view
 */

(function($) {

    var DISPLAY_GRID = "grid";

    var DISPLAY_LIST = "list";

    var SELECTION_MODE_COUNT_SINGLE = "single";

    var SELECTION_MODE_COUNT_MULTI = "multiple";

    var DEFAULT_SELECTOR_CONFIG = {

        "itemSelector": "article",                      // selector for getting items
        "headerSelector": "header",                     // selector for headers
        "dataContainer": "grid-0",                      // class name of the data container
        "enableImageMultiply": true,                    // flag if images should be multiplied
        "view": {
            "selectedItem": {                           // defines what classes (cls) on what elements (selector; optional) are used to mark a selection
                "list": {
                    "cls": "selected"
                },
                "grid": {
                    "cls": "selected"
                }
            },
            "selectedItems": {                          // defines the selector that is used for determining the current selection; a resolver function may be specified that adjusts the selection (for exmaple by determining a suitable parent element)
                "list": {
                    "selector": "article.selected"
                },
                "grid": {
                    "selector": "article.selected"
                }
            }
        },
        "controller": {
            "selectElement": {                          // defines the selector that is used for installing the tap/click handlers
                "list": "article > i.select",
                /* "listNavElement": "article", */      // may be used to determine the element that is responsible for navigating in list view (required only if different from the Grid's select item)
                "grid": "article"
            },
            "moveHandleElement": {                      // defines the selector that is used to determine the object that is responsible for moving an item in list view
                "list": "article > i.move"
            },
            "targetToItem": {                           // defines methods that are used to resolve the event target of a tap/click event to a card view item
                "list": function($target) {
                    return $target.closest("article");
                },
                "grid": function($target) {
                    return $target.closest("article");
                },
                "header": function($target) {
                    return $target.closest("header");
                }
            },
            "gridSelect": {                             // defines the class that is used to trigger the grid selection mode
                "cls": "selection-mode"
            },
            "selectAll": {                              // defines the "select all" config (list view only)
                "selector": "header > i.select",
                "cls": "selected"
            }
        }

    };

    var ensureItem = function(item) {
        if (item.jquery) {
            return item.data("cardView-item");
        }
        return item;
    };

    var Utils = {

        equals: function($1, $2) {
            return ($1.length === $2.length) && ($1.length === $1.filter($2).length);
        },

        getWidget: function($el) {
            var widget;
            if ($el.length > 0) {
                widget = $($el[0]).data("cardView");
            }
            return widget;
        },

        resolve: function($el, fn) {
            var resolved = [ ];
            $el.each(function() {
                resolved.push.apply(resolved, fn($(this)).toArray());
            });
            return $(resolved);
        },

        /**
         * Multiplies the image with the provided color, this will insert a canvas element before the img element.
         * image: image element to multiply with the color
         * color: RGB array of values between 0 and 1
         */
        multiplyImages: function($images, color) {
            // Filter out images where the multiply effect has already been inserted to the DOM, or images that aren't visible
            $images = $images.filter(function () {
                var $image = $(this);
                return !$image.is(".multiplied") && !$image.prev().is(".multiplied") && $image.is(":visible");
            });

            var imageMaxCounter = $images.length;
            var imageIteratorCounter = 0;
            
            function multiplyNextImage() {
                if (imageIteratorCounter < imageMaxCounter) {
                    // Not adding the timeout for the first image will make it feel more reactive.
                    multiplyOneImage($images[imageIteratorCounter]);

                    imageIteratorCounter++;

                    // But adding a timeout for the other images will make it non-blocking.
                    setTimeout(multiplyNextImage, 0);
                }
            }

            function multiplyOneImage(image) {
                var width  = image.naturalWidth,
                    height = image.naturalHeight;

                // defer if image is not yet available
                if ((width === 0) && (height === 0)) {
                    window.setTimeout(function() {
                        multiplyOneImage(image);
                    }, 200);
                    return;
                }

                var canvas = $("<canvas width='" + width + "' height='" + height+"'></canvas>")[0];

                var context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, width, height);

                var imageData = context.getImageData(0, 0, width, height);
                var data = imageData.data;

                for (var i = 0, l = data.length; i < l; i += 4) {
                    data[i]   *= color[0];
                    data[i+1] *= color[1];
                    data[i+2] *= color[2];
                }

                context.putImageData(imageData, 0, 0);

                // re-sizing of canvases are handled different in IE and Opera, thus we have to use an image
                $("<img class='" + image.className + " multiplied' " +
                    "width='" + width + "' height='" + height + "' " +
                    "src='" + canvas.toDataURL("image/png") + "'/>").insertBefore(image);
            }

            multiplyNextImage();
        }
    };

    var ListItemAutoScroller = new Class({

        $el: null,

        $containerEl: null,

        stepSize: 0,

        iid: undefined,

        autoMoveOffset: 0,

        scrollMax: 0,


        construct: function($el, stepSize, autoMoveFn, limitBottom) {
            this.$el = $el;
            this.stepSize = stepSize;
            this.$containerEl = this._getScrollingContainer($el);
            var cont = this.$containerEl[0];
            this.maxScrollTop = Math.max(cont.scrollHeight - cont.clientHeight, 0);
            this.autoMoveFn = autoMoveFn;
        },

        _getScrollingContainer: function($el) {
            while (($el.length > 0) && !$el.is("body")) {
                var ovflY =  $el.css("overflowY");
                var pos = $el.css("position");
                if (((ovflY === "auto") || (ovflY === "visible")) && (pos === "absolute")) {
                    return $el;
                }
                $el = $el.parent();
            }
            return $(window);
        },

        _execute: function() {
            var cont = this.$containerEl[0];
            var clientHeight = cont.clientHeight;
            var scrollTop = cont.scrollTop;
            var itemTop = this.$el.offset().top - this.$containerEl.offset().top;
            var itemBottom = itemTop + this.$el.height();
            var isAutoScroll = false;
            if (itemTop <= 0) {
                // auto scroll upwards
                if (scrollTop > 0) {
                    scrollTop -= this.stepSize;
                    this.autoMoveOffset = -this.stepSize;
                    if (scrollTop < 0) {
                        scrollTop = 0;
                    }
                    cont.scrollTop = scrollTop;
                    isAutoScroll = true;
                }
            } else if (itemBottom >= clientHeight) {
                // auto scroll downwards
                if (scrollTop < this.maxScrollTop) {
                    scrollTop += this.stepSize;
                    this.autoMoveOffset = this.stepSize;
                    if (scrollTop > this.maxScrollTop) {
                        scrollTop = this.maxScrollTop;
                    }
                    cont.scrollTop = scrollTop;
                    isAutoScroll = true;
                }
            }
            return isAutoScroll;
        },

        _autoMove: function() {
            if (this.autoMoveOffset && this.autoMoveFn) {
                var itemOffs = this.$el.offset();
                var itemTop = itemOffs.top + this.autoMoveOffset;
                this.autoMoveFn(itemOffs.left, itemTop);
            }
        },

        check: function(limitBottom) {
            var self = this;
            this.stop();
            var isAutoScroll = this._execute(limitBottom);
            if (isAutoScroll) {
                this.iid = window.setTimeout(function() {
                    self.iid = undefined;
                    self._autoMove();
                }, 50);
            }
        },

        stop: function() {
            if (this.iid !== undefined) {
                window.clearTimeout(this.iid);
                this.autoMoveOffset = 0;
                this.iid = undefined;
            }
        }

    });

    var ListItemMoveHandler = new Class({

        $listEl: null,

        $itemEl: null,

        $items: null,

        $doc: null,

        $oldBefore: null,

        dragCls: null,

        fixHorizontalPosition: false,

        autoScroller: null,

        construct: function(config) {
            var self = this;
            this.$listEl = config.$listEl;
            this.$itemEl = config.$itemEl;
            this.$items = config.$items;
            this.dragCls = config.dragCls;
            this.fixHorizontalPosition = (config.fixHorizontalPosition !== false);
            this.autoScroller = (config.autoScrolling ?
                    new ListItemAutoScroller(this.$itemEl, 8, function(x, y) {
                        self._autoMove(x, y);
                    }) : undefined);
        },

        _getEventCoords: function(e) {
            if (!e.originalEvent.touches) {
                return {
                    x: e.pageX,
                    y: e.pageY
                };
            }
            return (e.originalEvent.touches.length > 0 ? {
                x: e.originalEvent.touches[0].pageX,
                y: e.originalEvent.touches[0].pageY
            } : e.originalEvent.changedTouches.length > 0 ? {
                x: e.originalEvent.changedTouches[0].pageX,
                y: e.originalEvent.changedTouches[0].pageY
            } : {
                x: e.pageX,
                y: e.pageY
            });
        },

        _limit: function(top, left) {
            if (left < this.listOffset.left) {
                left = this.listOffset.left;
            }
            if (top < this.listOffset.top) {
                top = this.listOffset.top;
            }
            var right = left + this.size.width;
            var bottom = top + this.size.height;
            var limitRight = this.listOffset.left + this.listSize.width;
            var limitBottom = this.listOffset - top + this.listSize.height;
            if (right > limitRight) {
                left = limitRight - this.size.width;
            }
            if (bottom > limitBottom) {
                top = limitBottom - this.size.height;
            }
            if (this.fixHorizontalPosition) {
                left = this.listOffset.left;
            }
            return {
                "top": top,
                "left": left
            };
        },

        _getEventPos: function(e) {
            var evtPos = this._getEventCoords(e);
            return {
                x: evtPos.x - this.delta.left,
                y: evtPos.y - this.delta.top
            };
        },

        _adjustPosition: function(x, y) {
            this.$itemEl.offset(this._limit(y, x));
            if (this.autoScroller) {
                this.autoScroller.check();
            }
        },

        _changeOrderIfRequired: function() {
            var itemPos = this.$itemEl.offset();
            var hotX = itemPos.left + (this.size.width / 2);
            var hotY = itemPos.top + (this.size.height / 2);
            var $newTarget = null;
            // check if we are overlapping another item at least 50% -> then we will take
            // its position
            var isInsertBefore = false;
            for (var i = 0; i < this.$items.length; i++) {
                var $item = $(this.$items[i]);
                if (!Utils.equals($item, this.$itemEl)) {
                    var offs = $item.offset();
                    var width = $item.width();
                    var height = $item.height();
                    var bottom = offs.top + height;
                    if ((hotX >= offs.left) && (hotX < offs.left + width) &&
                            (hotY >= offs.top) && (hotY < bottom)) {
                        isInsertBefore = ((hotY - offs.top) > (bottom - hotY));
                        $newTarget = $item;
                        break;
                    }
                }
            }
            if ($newTarget) {
                var _offs = this.$itemEl.offset();
                if (isInsertBefore) {
                    $newTarget.before(this.$itemEl);
                } else {
                    $newTarget.after(this.$itemEl);
                }
                this.$itemEl.offset(_offs);
            }
        },

        start: function(e) {
            this.$oldBefore = this.$itemEl.prev();
            var evtPos = this._getEventCoords(e);
            if (this.dragCls) {
                this.$itemEl.addClass(this.dragCls);
            }
            var self = this;
            this.$doc = $(document);
            this.$doc.fipo("touchmove.listview.drag", "mousemove.listview.drag",
                function(e) {
                    self.move(e);
                });
            this.$doc.fipo("touchend.listview.drag", "mouseup.listview.drag",
                function(e) {
                    self.end(e);
                });
            this.offset = this.$itemEl.offset();
            this.delta = {
                "left": evtPos.x - this.offset.left,
                "top": evtPos.y - this.offset.top
            };
            this.size = {
                "width": this.$itemEl.width(),
                "height": this.$itemEl.height()
            };
            this.listOffset = this.$listEl.offset();
            this.listSize = {
                "width": this.$listEl.width(),
                "height": this.$listEl.height()
            };
            e.stopPropagation();
            e.preventDefault();
            /*
            console.log("offset", this.offset, "delta", this.delta, "size", this.size,
                "listoffs", this.listOffset, "listsize", this.listSize);
            */
        },

        move: function(e) {
            // console.log("move", e);
            var pos = this._getEventPos(e);
            this._adjustPosition(pos.x, pos.y);
            this._changeOrderIfRequired();
            e.stopPropagation();
            e.preventDefault();
        },

        _autoMove: function(x, y) {
            this._adjustPosition(x, y);
            this._changeOrderIfRequired();
        },

        end: function(e) {
            var pos = this._getEventPos(e);
            this._adjustPosition(pos.x, pos.y);
            // console.log("end", e);
            if (this.dragCls) {
                this.$itemEl.removeClass(this.dragCls);
            }
            if (this.autoScroller) {
                this.autoScroller.stop();
            }
            this.$itemEl.css("position", "");
            this.$itemEl.css("top", "");
            this.$itemEl.css("left", "");
            this.$doc.off("touchmove.listview.drag");
            this.$doc.off("mousemove.listview.drag");
            this.$doc.off("touchend.listview.drag");
            this.$doc.off("mouseup.listview.drag");
            var $newBefore = this.$itemEl.prev();
            this.$itemEl.trigger($.Event("drop", {
                newBefore: $newBefore,
                oldBefore: this.$oldBefore,
                hasMoved: !Utils.equals($newBefore, this.$oldBefore)
            }));
            e.stopPropagation();
            e.preventDefault();
        }

    });

    /*
     * This class represents a single item in the list model.
     */
    var Item = new Class({

        $itemEl: null,

        construct: function($itemEl) {
            this.$itemEl = $itemEl;
            this.reference();
        },

        getItemEl: function() {
            return this.$itemEl;
        },

        reference: function() {
            var self = this;
            this.$itemEl.data("cardView-item", this);
        }

    });

    var Header = new Class({

        $headerEl: null,

        itemRef: null,

        construct: function($headerEl, itemRef) {
            this.$headerEl = $headerEl;
            this.itemRef = itemRef;
        },

        getHeaderEl: function() {
            return this.$headerEl;
        },

        getItemRef: function() {
            return this.itemRef;
        },

        setItemRef: function(itemRef) {
            this.itemRef = itemRef;
        }

    });

    /*
     * This class represents a data model that is created via a selector from an existing
     * DOM.
     */
    var DirectMarkupModel = new Class({

        $el: null,

        items: null,

        headers: null,

        selectors: null,

        construct: function($el, selectors) {
            this.$el = $el;
            this.items = [ ];
            this.selectors = selectors;
            var $items = this.$el.find(selectors.itemSelector);
            var itemCnt = $items.length;
            for (var i = 0; i < itemCnt; i++) {
                this.items.push(new Item($($items[i])));
            }
            this.headers = [ ];
            var $headers = this.$el.find(selectors.headerSelector);
            var headerCnt = $headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var $header = $($headers[h]);
                var $itemRef = $header.nextAll(selectors.itemSelector);
                var itemRef = ($itemRef.length > 0 ?
                        this.getItemForEl($($itemRef[0])) : undefined);
                this.headers.push(new Header($header, itemRef));
            }
        },

        initialize: function() {
            var self = this;
            this.$el.on("drop", this.selectors.itemSelector, function(e) {
                if (e.hasMoved) {
                    self._reorder(e);
                }
            });
        },

        _reorder: function(e) {
            var itemToMove = this.getItemForEl($(e.target));
            var newBefore = this.getItemForEl(e.newBefore);
            var isHeaderInsert = false;
            var header;
            if (!newBefore) {
                header = this.getHeaderForEl(e.newBefore);
                if (header) {
                    isHeaderInsert = true;
                    var refPos = this.getItemIndex(header.getItemRef());
                    if (refPos > 0) {
                        newBefore = this.getItemAt(refPos - 1);
                    }
                }
            }
            var oldPos = this.getItemIndex(itemToMove);
            this.items.splice(oldPos, 1);
            // if the item to move is directly following a header, the header's item ref
            // has to be updated
            var headerRef = this._getHeaderByItemRef(itemToMove);
            if (headerRef) {
                headerRef.setItemRef(this.getItemAt(oldPos));
            }
            var insertPos = (newBefore ? this.getItemIndex(newBefore) + 1 : 0);
            this.items.splice(insertPos, 0, itemToMove);
            if (isHeaderInsert) {
                header.setItemRef(itemToMove);
            }
            // console.log(itemToMove, newBefore, isHeaderInsert);
        },

        getItemCount: function() {
            return this.items.length;
        },

        getItemAt: function(pos) {
            return this.items[pos];
        },

        getItemIndex: function(item) {
            for (var i = 0; i < this.items.length; i++) {
                if (item === this.items[i]) {
                    return i;
                }
            }
            return -1;
        },

        getItemForEl: function($el) {
            var itemCnt = this.items.length;
            for (var i = 0; i < itemCnt; i++) {
                var item = this.items[i];
                if (Utils.equals(item.getItemEl(), $el)) {
                    return item;
                }
            }
            return undefined;
        },

        insertItemAt: function($items, pos, beforeHeader) {
            if (!$.isArray($items)) {
                $items = $items.toArray();
            }
            for (var i = $items.length - 1; i >= 0; i--) {

                var $item = $items[i];
                if (!$item.jquery) {
                    $item = $($item);
                }

                // adjust model
                var followupItem;
                var item = new Item($item);
                if ((pos === undefined) || (pos === null)) {
                    this.items.push(item);
                    pos = this.items.length - 1;
                } else {
                    followupItem = this.items[pos];
                    this.items.splice(pos, 0, item);
                }
                var insert = {
                    "item": followupItem,
                    "mode": "item"
                };

                // adjust header references if item is inserted directly behind a header
                var headerCnt = this.headers.length;
                for (var h = 0; h < headerCnt; h++) {
                    var header = this.headers[h];
                    if (header.getItemRef() === followupItem) {
                        if (beforeHeader) {
                            insert = {
                                "item": header,
                                "mode": "header"
                            };
                            break;
                        } else {
                            header.setItemRef(item);
                        }
                    }
                }

                // trigger event
                this.$el.trigger($.Event("change:insertitem", {
                    "insertPoint": insert,
                    "followupItem": followupItem,
                    "item": item,
                    "pos": pos,
                    "widget": Utils.getWidget(this.$el),
                    "moreItems": (i > 0)
                }));
            }
        },

        getHeaderCount: function() {
            return this.headers.length;
        },

        getHeaderAt: function(pos) {
            return this.headers[pos];
        },

        getHeaders: function() {
            var headers = [ ];
            headers.push.apply(headers, this.headers);
            return headers;
        },

        getHeaderForEl: function($el) {
            var headerCnt = this.headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var header = this.headers[h];
                if (Utils.equals(header.getHeaderEl(), $el)) {
                    return header;
                }
            }
            return undefined;
        },

        _getHeaderByItemRef: function(itemRef) {
            for (var h = 0; h < this.headers.length; h++) {
                if (this.headers[h].getItemRef() === itemRef) {
                    return this.headers[h];
                }
            }
            return undefined;
        },

        getItemsForHeader: function(header) {
            // TODO does not handle empty headers yet
            var itemRef = header.getItemRef();
            var headerCnt = this.headers.length;
            var itemCnt = this.items.length;
            var itemsForHeader = [ ];
            var isInRange = false;
            for (var i = 0; i < itemCnt; i++) {
                var item = this.items[i];
                if (isInRange) {
                    for (var h = 0; h < headerCnt; h++) {
                        if (this.headers[h].getItemRef() === item) {
                            isInRange = false;
                            break;
                        }
                    }
                    if (isInRange) {
                        itemsForHeader.push(item);
                    } else {
                        break;
                    }
                } else {
                    if (item === itemRef) {
                        isInRange = true;
                        itemsForHeader.push(itemRef);
                    }
                }
            }
            return itemsForHeader;
        },

        fromItemElements: function($elements) {
            var items = [ ];
            $elements.each(function() {
                var item = $(this).data("cardView-item");
                if (item) {
                    items.push(item);
                }
            });
            return items;
        },

        reference: function() {
            var itemCnt = this.items.length;
            for (var i = 0; i < itemCnt; i++) {
                this.items[i].reference();
            }
        },

        removeAllItemsSilently: function() {
            this.items.length = 0;
            for (var h = 0; h < this.headers.length; h++) {
                this.headers[h].setItemRef(undefined);
            }
        }

    });

    /*
     * This class represents a view for data represented by DirectMarkupModel.
     */
    var DirectMarkupView = new Class({

        $el: null,

        selectors: null,

        construct: function($el, selectors) {
            this.$el = $el;
            this.selectors = selectors;
        },

        initialize: function() {
            var self = this;
            this.$el.on("change:displayMode", function(e) {
                var oldMode = e.oldValue;
                var newMode = e.value;
                self.cleanupAfterLayoutMode(oldMode);
                self.prepareLayoutMode(newMode);
            });
            this.$el.on("change:insertitem", function(e) {
                self._onItemInserted(e);
            });
            this.$el.reflow({
                "small": function ($el, size) {
                    return $el.width() > 40*size.rem() && $el.width() < 50*size.rem();
                },
                "xsmall": function ($el, size) {
                    return $el.width() > 30*size.rem() && $el.width() < 40*size.rem();
                },
                "xxsmall": function ($el, size) {
                    return $el.width() < 30*size.rem();
                }
            });
        },

        _onItemInserted: function(e) {
            var $dataRoot = this.$el;
            if (this.selectors.dataContainer) {
                $dataRoot = $dataRoot.find("." + this.selectors.dataContainer);
            }
            var $item = e.item.getItemEl();
            var followupItem = e.followupItem;
            switch (this.getDisplayMode()) {
                case DISPLAY_LIST:
                    if (!followupItem) {
                        $dataRoot.append($item);
                    } else {
                        var insert = e.insertPoint;
                        var item = insert.item;
                        var $ref = (insert.mode === "item" ?
                            item.getItemEl() : item.getHeaderEl());
                        $ref.before($item);
                    }
                    break;
                case DISPLAY_GRID:
                    if (!e.moreItems) {
                        var widget = Utils.getWidget(this.$el);
                        widget._restore();
                        widget.layout();
                    }
                    break;
            }
        },

        getDisplayMode: function() {
            return Utils.getWidget(this.$el).getDisplayMode();
        },

        setSelectionState: function(item, selectionState) {
            var displayMode = this.getDisplayMode();
            var selectorDef = this.selectors.view.selectedItem[displayMode];
            var $itemEl = item.getItemEl();
            if (selectorDef.selector) {
                $itemEl = $itemEl.find(selectorDef.selector);
            }
            if (selectionState === "selected") {
                $itemEl.addClass(selectorDef.cls);
                if (displayMode === DISPLAY_GRID) {
                    this._drawSelectedGrid(item);
                }
            } else if (selectionState === "unselected") {
                $itemEl.removeClass(selectorDef.cls);
            }
        },

        getSelectionState: function(item) {
            var selectorDef = this.selectors.view.selectedItem[this.getDisplayMode()];
            var $itemEl = item.getItemEl();
            if (selectorDef.selector) {
                $itemEl = $itemEl.find(selectorDef.selector);
            }
            var cls = selectorDef.cls.split(" ");
            for (var c = 0; c < cls.length; c++) {
                if (!$itemEl.hasClass(cls[c])) {
                    return "unselected";
                }
            }
            return "selected";
        },

        getSelectedItems: function() {
            var selectorDef = this.selectors.view.selectedItems[this.getDisplayMode()];
            var $selectedItems = this.$el.find(selectorDef.selector);
            if (selectorDef.resolver) {
                $selectedItems = selectorDef.resolver($selectedItems);
            }
            return $selectedItems;
        },

        restore: function(model, restoreHeaders) {
            var $container = $("<div class='" + this.selectors.dataContainer + "'>");
            this.$el.empty();
            this.$el.append($container);
            var itemCnt = model.getItemCount();
            for (var i = 0; i < itemCnt; i++) {
                $container.append(model.getItemAt(i).getItemEl());
            }
            if (restoreHeaders) {
                var headerCnt = model.getHeaderCount();
                for (var h = 0; h < headerCnt; h++) {
                    var header = model.getHeaderAt(h);
                    var $headerEl = header.getHeaderEl();
                    var itemRef = header.getItemRef();
                    if (itemRef) {
                        itemRef.getItemEl().before($headerEl);
                    } else {
                        $container.append($headerEl);
                    }
                }
            }
        },

        prepareLayoutMode: function(layoutMode) {
            if (layoutMode === DISPLAY_GRID) {
                this._drawAllSelectedGrid();
            }
        },

        cleanupAfterLayoutMode: function(layoutMode) {
        },

        _drawImage: function($image) {
            if ($image.length === 0) {
                return;
            }

            if (this._colorFloat === undefined) {
                var color256     = $image.closest("a").css("background-color");     // Let's grab the color form the card background
                this._colorFloat = $.map(color256.match(/(\d+)/g), function (val) { // RGB values between 0 and 1
                    return val/255;
                });
            }

            Utils.multiplyImages($image, this._colorFloat);
        },

        _drawAllSelectedGrid: function() {
            if (!this.selectors.enableImageMultiply) {
                return;
            }
            var self = this;
            var selector = this.selectors.view.selectedItems.grid.selector + " img";
            var $selector = $(selector);

            this._drawImage($selector);
            $selector.load(function() {
                self._drawImage($(this));
            });
        },

        _drawSelectedGrid: function(item) {
            if (!this.selectors.enableImageMultiply) {
                return;
            }
            var self = this;
            var $img = item.getItemEl().find("img");

            this._drawImage($img);
            $img.load(function() {
                self._drawImage($(this));
            });
        },

        removeAllItemsSilently: function() {
            this.$el.find(this.selectors.itemSelector).remove();
        }

    });

    /*
     * This class implements the controller for data represented by DirectMarkupModel and
     * displayed by DirectMarkupController
     */
    var DirectMarkupController = new Class({

        $el: null,

        selectors: null,

        selectionModeCount: null,

        _listSelect: false,

        construct: function($el, selectors) {
            this.$el = $el;
            this.selectors = selectors;
            this.selectionModeCount = SELECTION_MODE_COUNT_MULTI;
        },

        initialize: function() {
            this.setDisplayMode(this.$el.hasClass("list") ? DISPLAY_LIST : DISPLAY_GRID);
            var self = this;
            // Selection
            this.$el.fipo("tap.cardview.select", "click.cardview.select",
                this.selectors.controller.selectElement.list, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    if (widget.getDisplayMode() === DISPLAY_LIST) {
                        var item = ensureItem(self.getItemElFromEvent(e));
                        if (widget.toggleSelection(item)) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                        if (e.type === "tap") {
                            self._listSelect = true;
                        }
                    }
                });
            this.$el.fipo("tap.cardview.select", "click.cardview.select",
                this.selectors.controller.selectElement.grid, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    if ((widget.getDisplayMode() === DISPLAY_GRID) &&
                            widget.isGridSelectionMode()) {
                        var item = ensureItem(self.getItemElFromEvent(e));
                        if (widget.toggleSelection(item)) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                });
            // list header
            this.$el.fipo("tap.cardview.selectall", "click.cardview.selectall",
                this.selectors.controller.selectAll.selector, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    if (widget.getDisplayMode() === DISPLAY_LIST) {
                        var cls = self.selectors.controller.selectAll.cls;
                        var $header = self.selectors.controller.targetToItem.header(
                                $(e.target));
                        var header = widget.getModel().getHeaderForEl($header);
                        if ($header.hasClass(cls)) {
                            widget.deselectAll(header);
                        } else {
                            widget.selectAll(header);
                        }
                    }
                });
            // block click event for cards on touch devices
            this.$el.finger("click.cardview.select",
                this.selectors.controller.selectElement.grid, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    var dispMode = widget.getDisplayMode();
                    if ((dispMode === DISPLAY_GRID) && widget.isGridSelectionMode()) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                });
            // block click event for list items on touch devices if the click actually
            // represents a change in selection rather than navigating
            var listNavElement = this.selectors.controller.selectElement.listNavElement ||
                    this.selectors.controller.selectElement.grid;
            this.$el.finger("click.cardview.select",
                listNavElement, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    var dispMode = widget.getDisplayMode();
                    if ((dispMode === DISPLAY_LIST) && self._listSelect) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    self._listSelect = false;
                });
            // reordering
            this.$el.fipo("touchstart.cardview.reorder", "mousedown.cardview.reorder",
                this.selectors.controller.moveHandleElement.list, function(e) {
                    var $itemEl = self.getItemElFromEvent(e);
                    var handler = new ListItemMoveHandler({
                        $listEl: self.$el,
                        $itemEl: $itemEl,
                        $items: $(self.selectors.itemSelector),
                        dragCls: "dragging",
                        autoScrolling: true
                    });
                    handler.start(e);
                });
            // handle select all state
            this.$el.on("change:selection", function(e) {
                if (e.moreSelectionChanges) {
                    return;
                }
                self._adjustSelectAllState(e.widget);
            });
            this.$el.on("change:insertitem", function(e) {
                if (e.moreItems) {
                    return;
                }
                self._adjustSelectAllState(e.widget);
            });
        },

        _adjustSelectAllState: function(widget) {
            var cls = this.selectors.controller.selectAll.cls;
            var selectionState = widget.getHeaderSelectionState();
            var headers = selectionState.headers;
            var headerCnt = headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var header = headers[h];
                var $header = header.header.getHeaderEl();
                if (header.hasUnselected) {
                    $header.removeClass(cls);
                } else {
                    $header.addClass(cls);
                }
            }
        },

        getItemElFromEvent: function(e) {
            var $target = $(e.target);
            var resolver = this.selectors.controller.targetToItem[this.getDisplayMode()];
            if ($.isFunction(resolver)) {
                return resolver($target);
            }
            return $target.find(resolver);
        },

        isGridSelect: function() {
            var selectorDef = this.selectors.controller.gridSelect;
            var $el = this.$el;
            if (selectorDef.selector) {
                $el = $el.find(selectorDef.selector);
            }
            return $el.hasClass(selectorDef.cls);
        },

        setGridSelect: function(isGridSelect) {
            if (this.isGridSelect() !== isGridSelect) {
                var selectorDef = this.selectors.controller.gridSelect;
                var $el = this.$el;
                if (selectorDef.selector) {
                    $el = $el.find(selectorDef.selector);
                }
                if (isGridSelect) {
                    $el.addClass(selectorDef.cls);
                } else {
                    $el.removeClass(selectorDef.cls);
                    Utils.getWidget($el).clearSelection();
                }
                this.$el.trigger($.Event("change:gridSelect", {
                    "widget": this.$el.data("cardView"),
                    "oldValue": !isGridSelect,
                    "value": isGridSelect
                }));
            }
        },

        getDisplayMode: function() {
            if (this.$el.hasClass("list")) {
                return DISPLAY_LIST;
            }
            if (this.$el.hasClass("grid")) {
                return DISPLAY_GRID;
            }
            return null;
        },

        setDisplayMode: function(displayMode) {
            var oldValue = this.getDisplayMode();
            if (oldValue !== displayMode) {
                var widget = Utils.getWidget(this.$el);
                widget._restore(displayMode === DISPLAY_LIST);
                switch (displayMode) {
                    case DISPLAY_GRID:
                        this.$el.removeClass("list");
                        this.$el.addClass("grid");
                        if (oldValue !== null) {
                            var selection = widget.getSelection();
                            this.setGridSelect(selection.length > 0);
                            widget.layout();
                        }
                        break;
                    case DISPLAY_LIST:
                        this.$el.cuigridlayout("destroy");
                        this.$el.removeClass("grid");
                        this.$el.addClass("list");
                        break;
                }
                this.$el.trigger($.Event("change:displayMode", {
                    "widget": this.$el.data("cardView"),
                    "oldValue": oldValue,
                    "value": displayMode
                }));
            }
        },

        getSelectionModeCount: function() {
            return this.selectionModeCount;
        },

        setSelectionModeCount: function(modeCount) {
            this.selectionModeCount = modeCount;
        }
    });

    var DirectMarkupAdapter = new Class({

        $el: null,

        selectors: null,

        model: null,

        view: null,

        controller: null,

        construct: function(selectors) {
            this.selectors = selectors;
        },

        initialize: function($el) {
            this.$el = $el;
            this.setModel(new DirectMarkupModel($el, this.selectors));
            this.setView(new DirectMarkupView($el, this.selectors));
            this.setController(new DirectMarkupController($el, this.selectors));
            this.model.initialize();
            this.view.initialize();
            this.controller.initialize();
        },

        setModel: function(model) {
            this.model = model;
        },

        getModel: function() {
            return this.model;
        },

        setView: function(view) {
            this.view = view;
        },

        getView: function() {
            return this.view;
        },

        setController: function(controller) {
            this.controller = controller;
        },

        getController: function() {
            return this.controller;
        },

        isSelected: function(item) {
            var selectionState = this.view.getSelectionState(item);
            return (selectionState === "selected");
        },

        setSelected: function(item, isSelected) {
            var selectionState = (isSelected ? "selected" : "unselected");
            this.view.setSelectionState(item, selectionState);
        },

        getSelection: function(useModel) {
            var selection = this.view.getSelectedItems();
            if (useModel === true) {
                selection = this.model.fromItemElements(selection);
            }
            return selection;
        },

        getDisplayMode: function() {
            return this.controller.getDisplayMode();
        },

        setDisplayMode: function(selectionMode) {
            this.controller.setDisplayMode(selectionMode);
        },

        isGridSelectionMode: function() {
            return this.controller.isGridSelect();
        },

        setGridSelectionMode: function(isSelectionMode) {
            this.controller.setGridSelect(isSelectionMode);
        },

        getSelectionModeCount: function() {
            return this.controller.getSelectionModeCount();
        },

        setSelectionModeCount: function(modeCount) {
            this.controller.setSelectionModeCount(modeCount);
        },

        _restore: function(restoreHeaders) {
            this.view.restore(this.model, restoreHeaders);
            this.model.reference();
        },

        removeAllItems: function() {
            var widget = Utils.getWidget(this.$el);
            widget.clearSelection();
            this.model.removeAllItemsSilently();
            this.view.removeAllItemsSilently();
        }

    });

    CUI.CardView = new Class(/** @lends CUI.CardView# */{

        toString: 'CardView',

        extend: CUI.Widget,

        adapter: null,


        /**
         @extends CUI.Widget
         @classdesc
         <p>A display of cards that can either be viewed as a grid or a list.</p>
         <p>The display mode - grid or list view - can be changed programmatically whenever
         required.</p>
         <p>Grid view has two modes: navigation and selection, which can also be switched
         programmatically. In navigation mode, the user can use cards to navigate
         hierarchical structures ("to another stack of cards"). In selection mode, the
         cards get selected on user interaction instead. List view combines both selection
         and navigation modes.</p>
         <p>The card view uses a data model internally that abstracts the cards. This
         data model is currently not opened as API. Therefore you will often encounter
         unspecified objects that represent cards in the data model. You can use them
         interchangibly (for example, if one method returns a card data object, you can
         pass it to another method that takes a card data object as a parameter), but
         you shouldn't assume anything about their internals. You may use
         {@link CUI.CardView#prepend}, {@link CUI.CardView#append} and
         {@link CUI.CardView#removeAllItems} to manipulate the data model.</p>
         <p>Please note that the current implementation has some limitiations which are
         documented if known. Subsequent releases of CoralUI will remove those limitations
         bit by bit.</p>
         <p>The following example shows two cards in grid view:</p>

        <div class="grid" data-toggle="cardview">
            <div class="grid-0">
                <article class="card-default">
                    <i class="select"></i>
                    <i class="move"></i>
                    <a href="#">
                        <span class="image">
                            <img class="show-grid" src="images/preview.png" alt="">
                            <img class="show-list" src="images/preview-small.png" alt="">
                        </span>
                        <div class="label">
                            <h4>A card</h4>
                            <p>Description</p>
                        </div>
                    </a>
                </article>
                <article class="card-default">
                    <i class="select"></i>
                    <i class="move"></i>
                    <a href="#">
                        <span class="image">
                            <img class="show-grid" src="images/preview.png" alt="">
                            <img class="show-list" src="images/preview-small.png" alt="">
                        </span>
                        <div class="label">
                            <h4>Another card</h4>
                            <p>See shell example page for more info.</p>
                        </div>
                    </a>
                </article>
            </div>
         </div>

         @example
<caption>Instantiate with Class</caption>
// Currently unsupported.

         @example
<caption>Instantiate with jQuery</caption>
// Currently unsupported.

         @example
<caption>Markup</caption>
&lt;div class="grid" data-toggle="cardview"&gt;
    &lt;div class="grid-0"&gt;
        &lt;article class="card-default"&gt;
            &lt;i class="select"&gt;&lt;/i&gt;
            &lt;i class="move"&gt;&lt;/i&gt;
            &lt;a href="#"&gt;
                &lt;span class="image"&gt;
                    &lt;img class="show-grid" src="images/preview.png" alt=""&gt;
                    &lt;img class="show-list" src="images/preview-small.png" alt=""&gt;
                &lt;/span&gt;
                &lt;div class="label"&gt;
                    &lt;h4&gt;A card&lt;/h4&gt;
                    &lt;p&gt;Description&lt;/p&gt;
                &lt;/div&gt;
            &lt;/a&gt;
        &lt;/article&gt;
    &lt;/div&gt;
&lt;/div&gt;

         @example
<caption>Switching to grid selection mode using API</caption>
$cardView.cardView("toggleGridSelectionMode");

         @example
<caption>Switching to grid selection mode using CSS contract</caption>
$cardView.toggleClass("selection-mode");
$cardView.find("article").removeClass("selected");

         @desc Creates a new card view.
         @constructs

         @param {Object} [options] Component options
         @param {Object} [options.selectorConfig]
                The selector configuration; note that you currently have to specify always
                an object that carries the entire configuration; a configration object
                that only provides the options that override their respective default values
                will not suffice
         @param {String} options.selectorConfig.itemSelector
                The selector that is used to retrieve the cards from the DOM
         @param {String} options.selectorConfig.headerSelector
                The selector that is used to retrieve the header(s) in list view from the
                DOM
         @param {String} options.selectorConfig.dataContainer
                The class of the div that is used internally for laying out the cards
         @param {Boolean} options.selectorConfig.enableImageMultiply
                Flag that determines if the images of cards should use the "multiply effect"
                for display in selected state
         @param {Object} options.selectorConfig.view
                Configures the view of the CardView
         @param {Object} options.selectorConfig.view.selectedItem
                Defines what classes on what elements are used to select a card
         @param {Object} options.selectorConfig.view.selectedItem.list
                Defines the selection-related config in list view
         @param {String} options.selectorConfig.view.selectedItem.list.cls
                Defines the CSS class that is used to select a card in list view
         @param {String} [options.selectorConfig.view.selectedItem.list.selector]
                An additioonal selector if the selection class has to be set on a child
                element rather than the card's parent element
         @param {Object} options.selectorConfig.view.selectedItem.grid
                Defines the selection-related config in grid view
         @param {String} options.selectorConfig.view.selectedItem.grid.cls
                Defines the CSS class that is used to select a card in grid view
         @param {String} [options.selectorConfig.view.selectedItem.grid.selector]
                An additioonal selector if the selection class has to be set on a child
                element rather than the card's parent element
         @param {Object} options.selectorConfig.view.selectedItems
                Defines how to determine the currently selected cards
         @param {Object} options.selectorConfig.view.selectedItems.list
                Defines how to determine the currently selected cards in list view
         @param {String} options.selectorConfig.view.selectedItems.list.selector
                The selector that determines the DOM elements that represent all currently
                selected cards
         @param {Function} [options.selectorConfig.view.selectedItems.list.resolver]
                A function that is used to calculate a card's parent element from the
                elements that are returned from the selector that is used for determining
                selected cards
         @param {Object} options.selectorConfig.view.selectedItems.grid
                 Defines how to determine the currently selected cards in grid view
         @param {String} options.selectorConfig.view.selectedItems.grid.selector
                The selector that determines the DOM elements that represent all currently
                selected cards
         @param {Function} [options.selectorConfig.view.selectedItems.grid.resolver]
                A function that is used to calculate a card's parent element from the
                elements that are returned from the selector that is used for determining
                selected cards
         @param {Object} options.selectorConfig.controller
                Configures the controller of the CardView
         @param {Object} options.selectorConfig.controller.selectElement
                The selector that defines the DOM element that is used for selecting
                a card (= targets for the respective click/tap handlers)
         @param {String} options.selectorConfig.controller.selectElement.list
                The selector that defines the event targets for selecting a card in list
                view
         @param {String} [options.selectorConfig.controller.selectElement.listNavElement]
                An additional selector that may be used to determine the element that is
                used for navigating in list view if it is different from the event target
                defined by options.selectorConfig.controller.selectElement.grid
         @param {String} options.selectorConfig.controller.selectElement.grid
                The selector that defines the event targets for selecting a card in grid
                view
         @param {Object} options.selectorConfig.controller.moveHandleElement
                The selector that defines the DOM elements that are used for moving
                cards in list view (= targets for the respective mouse/touch handlers)
         @param {String} options.selectorConfig.controller.moveHandleElement.list
                The selector that defines the event targets for the handles that are used
                to move a card in list view
         @param {Object} options.selectorConfig.controller.targetToItems
                Defines the mapping from event targets to cards
         @param {Function|String} options.selectorConfig.controller.targetToItems.list
                A function that takes a jQuery object that represents the event target for
                selecting a card in list view and that has to return the jQuery object that
                represents the entire card; can optionally be a selector as well
         @param {Function|String} options.selectorConfig.controller.targetToItems.grid
                A function that takes a jQuery object that represents the event target for
                selecting a card in grid view and that has to return the jQuery object that
                represents the entire card; can optionally be a selector as well
         @param {Function|String} options.selectorConfig.controller.targetToItems.header
                A function that takes a jQuery object that represents the event target for
                the "select all" button of a header in list view and that has to return the
                jQuery object that represents the respective header; can optionally be a
                selector as well
         @param {Object} options.selectorConfig.controller.gridSelect
                Defines the selection mode in grid view
         @param {Object} options.selectorConfig.controller.gridSelect.cls
                Defines the class that is used to switch to selection mode in grid view
         @param {Object} options.selectorConfig.controller.gridSelect.selector
                An additional selector that is used to define the child element where the
                selection mode class should be applied to/read from
         @param {Object} options.selectorConfig.controller.selectAll
                Defines how to select all cards in list view
         @param {Object} options.selectorConfig.controller.selectAll.selector
                The selector that is used to determine all "select all" buttons in a
                CardView
         @param {Object} options.selectorConfig.controller.selectAll.cls
                The class that has to be applied to each card if "select all" is invoked
        */
        construct: function(options) {
            var selectorConfig = options.selectorConfig || DEFAULT_SELECTOR_CONFIG;
            this.adapter = new DirectMarkupAdapter(selectorConfig);
            this.adapter.initialize(this.$element);
            this.layout();
        },

        /**
         * Get the underlying data model.
         * @return {*} The underlying data model
         * @private
         */
        getModel: function() {
            return this.adapter.getModel();
        },

        /**
         * Set the underlying data model.
         * @param {*} model The underlying data model
         * @private
         */
        setModel: function(model) {
            this.adapter.setModel(model);
        },

        /**
         * Check if the specified item (part of the data model) is currently selected.
         * @param {*} item The item (data mode) to check
         * @return {Boolean} True if the specified item is selected
         * @private
         */
        isSelected: function(item) {
            return this.adapter.isSelected(item);
        },

        /**
         * Get the current display mode (grid or list view).
         * @return {String} The display mode; either {@link CUI.CardView.DISPLAY_GRID} or
         *         {@link CUI.CardView.DISPLAY_LIST}
         */
        getDisplayMode: function() {
            return this.adapter.getDisplayMode();
        },

        /**
         * Set the display mode (grid or list view).
         * @param {String} displayMode The display mode; either
         *        {@link CUI.CardView.DISPLAY_GRID} or {@link CUI.CardView.DISPLAY_LIST}
         */
        setDisplayMode: function(displayMode) {
            this.adapter.setDisplayMode(displayMode);
        },

        /**
         * Checks if selection mode is currently active in grid view.
         * @return {Boolean} True if selection mode is active
         */
        isGridSelectionMode: function() {
            return this.adapter.isGridSelectionMode();
        },

        /**
         * Set the selection mode in grid view.
         * @param {Boolean} isSelection True to switch grid selection mode on
         */
        setGridSelectionMode: function(isSelection) {
            this.adapter.setGridSelectionMode(isSelection);
        },

        /**
         * Toggle selection mode in grid view.
         */
        toggleGridSelectionMode: function() {
            this.setGridSelectionMode(!this.isGridSelectionMode());
        },

        getSelectionModeCount: function() {
            return this.adapter.getSelectionModeCount();
        },

        setSelectionModeCount: function(modeCount) {
            this.adapter.setSelectionModeCount(modeCount);
        },

        /**
         * <p>Select the specified item.</p>
         * <p>The second parameter should be used if multiple cards are selected/deselected
         * at once. It prevents some time consuming stuff from being executed more than
         * once.</p>
         * @param {jQuery|*} item The item to select; may either be from data model or a
         *        jQuery object
         * @param {Boolean} moreSelectionChanges True if there are more selection changes
         *        following directly
         */
        select: function(item, moreSelectionChanges) {
            // TODO implement beforeselect event
            item = ensureItem(item);
            var isSelected = this.adapter.isSelected(item);
            if (!isSelected) {
                if (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE &&
                    this.getSelection().length > 0) {
                    this.clearSelection();
                }

                this.adapter.setSelected(item, true);
                this.$element.trigger($.Event("change:selection", {
                    "widget": this,
                    "item": item,
                    "isSelected": true,
                    "moreSelectionChanges": (moreSelectionChanges === true)
                }));
            }
        },

        /**
         * <p>Deselect the specified card.</p>
         * <p>The second parameter should be used if multiple cards are selected/deselected
         * at once. It prevents some time consuming stuff from being executed more than
         * once.</p>
         * @param {jQuery|*} item The item to deselect; may either be from data model or a
         *        jQuery object
         * @param {Boolean} moreSelectionChanges True if there are more selection changes
         *        following directly
         */
        deselect: function(item, moreSelectionChanges) {
            // TODO implement beforeselect event
            item = ensureItem(item);
            var isSelected = this.adapter.isSelected(item);
            if (isSelected) {
                this.adapter.setSelected(item, false);
                this.$element.trigger($.Event("change:selection", {
                    "widget": this,
                    "item": item,
                    "isSelected": false,
                    "moreSelectionChanges": moreSelectionChanges
                }));
            }
        },

        /**
         * <p>Toggle the selection state of the specified item.</p>
         * <p>The second parameter should be used if multiple cards are selected/deselected
         * at once. It prevents some time consuming stuff from being executed more than
         * once.</p>
         * @param {jQuery|*} item The item; may be either from data model or a jQuery object
         * @param {Boolean} moreSelectionChanges True if there are more selection changes
         *        following directly
         * @return {Boolean} True if the toggle requires the originating event (if any)
         *         to be stopped and to prevent browser's default behavior
         */
        toggleSelection: function(item, moreSelectionChanges) {
            item = ensureItem(item);

            // allow to cancel & stop the event
            var beforeEvent = $.Event("beforeselect", {

                selectionCancelled: false,

                stopEvent: false,

                item: item,

                cancelSelection: function(stopEvent) {
                    this.selectionCancelled = true;
                    this.stopEvent = (stopEvent === true);
                }
            });
            this.$element.trigger(beforeEvent);
            if (beforeEvent.selectionCancelled) {
                return beforeEvent.stopEvent;
            }

            var isSelected = this.isSelected(item);
            if (!isSelected &&
                    (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE) &&
                    (this.getSelection().length > 0)) {
                this.clearSelection();
            }

            this.adapter.setSelected(item, !isSelected);
            this.$element.trigger($.Event("change:selection", {
                "widget": this,
                "item": item,
                "isSelected": !isSelected,
                "moreSelectionChanges": moreSelectionChanges
            }));
            return true;
        },

        /**
         * Gets the currently selected cards.
         * @param {Boolean} useModel True if items from the data model should be retured;
         *        false, if a jQuery object should be returned instead
         * @return {*[]|jQuery} The selected items
         */
        getSelection: function(useModel) {
            return this.adapter.getSelection(useModel === true);
        },

        /**
         * Clears the current selection state by deselecting all selected cards.
         */
        clearSelection: function() {
            var selection = this.getSelection(true);
            var itemCnt = selection.length;
            var finalItem = (itemCnt - 1);
            for (var i = 0; i < itemCnt; i++) {
                this.deselect(selection[i], (i < finalItem));
            }
        },

        /**
         * @private
         */
        _headerSel: function(headers, selectFn, lastValidItemFn) {
            var model = this.adapter.getModel();
            if (headers == null) {
                headers = model.getHeaders();
            }
            if (!$.isArray(headers)) {
                headers = [ headers ];
            }
            var headerCnt = headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var header = headers[h];
                if (header.jquery) {
                    header = model.getHeaderForEl(header);
                }
                var itemsToSelect = model.getItemsForHeader(header);
                var itemCnt = itemsToSelect.length;
                for (var i = 0; i < itemCnt; i++) {
                    selectFn.call(this,
                            itemsToSelect[i], !lastValidItemFn(i, itemsToSelect));
                }
            }
        },

        /**
         * <p>Selects all cards.</p>
         * <p>If the headers parameter is specified, all items that are part of one
         * of the specified headers get selected. Items that are not assigned to one of the
         * specified headers are not changed.</p>
         * @param {*[]} [headers] Header filter
         */
        selectAll: function(headers) {
            if (this.getSelectionModeCount() !== SELECTION_MODE_COUNT_MULTI) return;

            var self = this;
            this._headerSel(headers, this.select, function(i, items) {
                for (++i; i < items.length; i++) {
                    if (!self.isSelected(items[i])) {
                        return false;
                    }
                }
                return true;
            });
        },

        /**
         * <p>Deselect all cards.</p>
         * <p>If the headers parameter is specified, all items that are part of one
         * of the specified headers get deselected. Items that are not assigned to one of
         * the specified headers are not changed.</p>
         * @param {*[]} [headers] Header filter
         */
        deselectAll: function(headers) {
            var self = this;
            this._headerSel(headers, this.deselect, function(i, items) {
                for (++i; i < items.length; i++) {
                    if (self.isSelected(items[i])) {
                        return false;
                    }
                }
                return true;
            });
        },

        /**
         * @private
         */
        getHeaderSelectionState: function() {
            var model = this.getModel();
            var curHeader = null;
            var state = {
                "selected": [ ],
                "hasUnselected": false,
                "headers": [ ]
            };
            var headerCnt = model.getHeaderCount();
            var itemCnt = model.getItemCount();
            for (var i = 0; i < itemCnt; i++) {
                var item = model.getItemAt(i);
                for (var h = 0; h < headerCnt; h++) {
                    var header = model.getHeaderAt(h);
                    if (header.getItemRef() === item) {
                        curHeader = {
                            "header": header,
                            "selected": [ ],
                            "hasUnselected": false
                        };
                        state.headers.push(curHeader);
                        break;
                    }
                }
                if (this.isSelected(item)) {
                    if (curHeader !== null) {
                        curHeader.selected.push(item);
                    } else {
                        state.selected.push(item);
                    }
                } else {
                    if (curHeader !== null) {
                        curHeader.hasUnselected = true;
                    } else {
                        state.hasUnselected = true;
                    }
                }
            }
            return state;
        },

        /**
         * Create and execute a layout of the cards if in grid view.
         */
        layout: function() {
            if (this.getDisplayMode() !== DISPLAY_GRID) {
                return;
            }
            if (this.$element.data('cuigridlayout')) {
                this.$element.cuigridlayout("destroy");
            }
            this.$element.cuigridlayout();
        },

        /**
         * Exexute a relayout of the cards if in grid view.
         */
        relayout: function() {
            if (this.getDisplayMode() !== DISPLAY_GRID) {
                return;
            }
            this.$element.cuigridlayout("layout");
        },

        /**
         * @private
         */
        _restore: function(restoreHeaders) {
            this.adapter._restore(restoreHeaders);
        },

        /**
         * Append the specified jQuery items as cards.
         * @param {jQuery} $items The jQuery item(s) to append
         */
        append: function($items) {
            this.adapter.getModel().insertItemAt($items, null, false);
        },

        /**
         * Prepend the specified jQuery items as cards.
         * @param {jQuery} $items The jQuery item(s) to prepend
         */
        prepend: function($items) {
            this.adapter.getModel().insertItemAt($items, 0, false);
        },

        /**
         * Remove all cards from the view.
         */
        removeAllItems: function() {
            this.adapter.removeAllItems();
            if (this.getDisplayMode() === DISPLAY_GRID) {
                this.relayout();
            }
            this.$element.trigger($.Event("change:removeAll", {
                widget: this
            }));
        }

    });

    /**
     * Display mode: grid view; value: "grid"
     * @type {String}
     */
    CUI.CardView.DISPLAY_GRID = DISPLAY_GRID;

    /**
     * Display mode: list view; value: "list"
     * @type {String}
     */
    CUI.CardView.DISPLAY_LIST = DISPLAY_LIST;

    /**
     * Single selection mode; value: "single"
     * @type {String}
     */
    CUI.CardView.SELECTION_MODE_COUNT_SINGLE = "single";

    /**
     * Multi selection mode; value: "multiple"
     * @type {String}
     */
    CUI.CardView.SELECTION_MODE_COUNT_MULTI = "multiple";

    /**
     * Utility method to get a {@link CUI.CardView} for the specified jQuery element.
     * @param {jQuery} $el The jQuery element to get the widget for
     * @return {CUI.CardView} The widget
     */
    CUI.CardView.get = function($el) {
        var cardView = Utils.getWidget($el);
        if (!cardView) {
            cardView = Utils.getWidget($el.cardView());
        }
        return cardView;
    };

    CUI.util.plugClass(CUI.CardView);

    // Data API
    if (CUI.options.dataAPI) {
        $(function() {
            var cardViews = $('body').find('[data-toggle="cardview"]');
            for (var gl = 0; gl < cardViews.length; gl++) {
                var $cardView = $(cardViews[gl]);
                if (!$cardView.data("cardview")) {
                    $cardView.cardView();
                }
            }
        });
    }

    // additional JSdoc

    /**
     * Triggered when a new card has been inserted succesfully.
     * @name CUI.CardView#change:insertitem
     * @event
     * @param {Object} evt The event
     * @param {CUI.CardView} evt.widget The widget
     * @param {*} evt.item The inserted item (data model)
     */

    /**
     * Triggered when the grid selection mode changes.
     * @name CUI.CardView#change:gridSelect
     * @event
     * @param {Object} evt The event
     * @param {CUI.CardView} evt.widget The widget
     * @param {Boolean} evt.oldValue True if grid select mode was previously active
     * @param {Boolean} evt.value True if grid select mode is now active
     */

    /**
     * Triggered when the display mode (list/grid view) changes. Display modes are
     * defined by their respective String constants, see for example
     * {@link CUI.CardView.DISPLAY_GRID}.
     * @name CUI.CardView#change:displayMode
     * @event
     * @param {Object} evt The event
     * @param {CUI.CardView} evt.widget The widget
     * @param {String} evt.oldValue The old display mode
     * @param {String} evt.value The new display mode
     */

    /**
     * Triggered when the selection changes.
     * @name CUI.CardView#change:selection
     * @event
     * @param {Object} evt The event
     * @param {CUI.CardView} evt.widget The widget
     * @param {*} evt.item The card that is (de)selected (data model)
     * @param {Boolean} evt.isSelected True if the item is now selected
     * @param {Boolean} evt.moreSelectionChanges True if there are more selection changes
     *        following (multiple single selection changes can be treated as one big
     *        selection change)
     */

    /**
     * Triggered right before the selection changes if (and only if) the selection is
     * changed using {@link CUI.CardView#toggleSelection}. The selection change can be
     * vetoed by calling cancelSelection on the Event object.
     * @name CUI.CardView#beforeselect
     * @event
     * @param {Object} evt The event
     * @param {*} evt.item The card that is will get (de)selected (data model)
     * @param {Function} evt.changeSelection This function may be called to cancel the
     *        selection; if true is passed as an argument, the originating event (if
     *        applicable; for example if the selection change is triggered by a user
     *        interaction) is cancelled as well (no event propagation; no default browser
     *        behavior)
     */

    /**
     * Triggered when all cards are removed.
     * @name CUI.CardView#change:removeAll
     * @event
     * @param {Object} evt The event
     * @param {CUI.CardView} evt.widget The widget
     */

}(window.jQuery));
(function($) {
    CUI.PathBrowser = new Class(/** @lends CUI.PathBrowser# */{
        toString: 'PathBrowser',
        extend: CUI.Widget,

        /**
         @extends CUI.Widget
         @classdesc An autocompletable path browser widget

         <p>
            <select data-init="pathbrowser" data-placeholder="Select path">
                <option>/apps</option>
                <option>/content</option>
                <option>/etc</option>
                <option>/libs</option>
                <option>/tmp</option>
                <option>/var</option>
            </select>
         </p>

         @desc Creates a path browser field
         @constructs

         @param {Object}   options                                    Component options
         @param {Array}    [options.options=empty array]              Array of available options (will be read from &lt;select&gt; by default)
         @param {Array}    [options.optionDisplayStrings=empty array] Array of alternate strings for display (will be read from &lt;select&gt; by default)
         @param {Function} [options.optionLoader=use options]         (Optional) Callback to reload options list. Can be synch or asynch. In case of asynch handling, use second parameter as callback function: optionLoader(string currentPath, function callback) with callback(array resultArray)
         @param {String}   [options.optionLoaderRoot=use options]     (Optional) Nested key to use as root to retrieve options from the option loader result
         @param {Function} [options.optionValueReader=use options]    (Optional) Custom function to call to retrieve the value from the option loader result
         @param {Function} [options.optionTitleReader=use options]    (Optional) Custom function to call to retrieve the title from the option loader result
         @param {boolean}  [options.showTitles=true]                  Should option titles be shown?
         @param {String}   [options.rootPath='/content']              The root path where completion and browsing starts.
                                                                      Use the empty string for the repository root (defaults to '/content').
         @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
         @param {int}      [options.delay=200]                        Delay before starting autocomplete when typing
         @param {int}      [options.disabled=false]                   Is this component disabled?
         @param {String}   [options.name=null]                        (Optional) name for an underlying form field.
         @param {Function} [options.autocompleteCallback=use options] Callback for autocompletion
         @param {Function} [options.optionRenderer=default renderer]  (Optional) Renderer for the autocompleter and the tag badges
         */
        construct: function(options) {
            // Set callback to default if there is none
            if (!this.options.autocompleteCallback) {
                this.options.autocompleteCallback = this._defaultAutocompleteCallback.bind(this);
            }
            if (!this.options.optionRenderer) {
                this.options.optionRenderer = CUI.PathBrowser.defaultOptionRenderer;
            }

            // Adjust DOM to our needs
            this._render();

            // Populate alternative display strings if necessary
            while (this.options.optionDisplayStrings.length < this.options.options.length) {
                this.options.optionDisplayStrings.push(this.options.options[this.options.optionDisplayStrings.length]);
            }

            // Generate Dropdown List widget
            this.dropdownList = new CUI.DropdownList({
                element: this.inputElement,
                positioningElement: this.inputElement,
                cssClass: "autocomplete-results"
            });

            // Listen to property changes
            this.$element.on('change:disabled', this._update.bind(this));
            this.$element.on('change:placeholder', this._update.bind(this));
            this.$element.on('change:options', this._changeOptions.bind(this));

            // Listen to events
            this.$element.on("input", "input", function() {
                if (this.options.disabled) {
                    return;
                }
                if (this.typeTimeout) {
                    clearTimeout(this.typeTimeout);
                }
                this.typeTimeout = setTimeout(this._inputChanged.bind(this), this.options.delay);
            }.bind(this));

            this.$element.on("blur", "input", function() {
                if (this.options.disabled) {
                    return;
                }
                if (this.typeTimeout) {
                    clearTimeout(this.typeTimeout);
                }
                this.typeTimeout = null;
                // Set to existing selection for single term use
                if (this.selectedIndex >= 0) {
                    if (this.inputElement.attr("value") === "") {
                        this.setSelectedIndex(-1);
                    } else {
                        this._update();
                    }
                }
            }.bind(this));

            this.$element.on("keydown", "input", this._keyPressed.bind(this));
            this.$element.on("keyup", "input", this._keyUp.bind(this));

            this.dropdownList.on("dropdown-list:select", "", function(event) {
                this.dropdownList.hide(200);
                this.setSelectedIndex(event.selectedValue * 1);
            }.bind(this));

            this.$element.on("focus", "input", function(event) {
                if (this.options.disabled) {
                    return;
                }
                this.$element.addClass("focus");
            }.bind(this));

            this.$element.on("blur", "input", function() {
                if (this.options.disabled) {
                    return;
                }
                this.$element.removeClass("focus");
            }.bind(this));

            this.$element.on("click touchend", "input", function(event) {
                if (this.options.disabled) {
                    return;
                }
                
                this.inputElement.focus();
                this._inputChanged();
            }.bind(this));

        },

        defaults: {
            autocompleteCallback: null,
            options: [],
            optionDisplayStrings: [],
            optionLoader: null,
            optionLoaderRoot: null,
            optionValueReader: null,
            optionTitleReader: null,
            showTitles: true,
            rootPath: "/content",
            delay: 200,
            placeholder: null,
            optionRenderer: null
        },

        dropdownList: null, // Reference to instance of CUI.DropdownList
        syncSelectElement: null,
        inputElement: null,
        typeTimeout: null,
        selectedIndex: -1,
        triggeredBackspace: false,

        /**
         * @param {int} index Sets the currently selected option by its index.
         *                    -1 removes any selected index.
         */
        setSelectedIndex: function(index) {
            if (index < -1 || index >= this.options.options.length) {
                return;
            }
            this.selectedIndex = index;
            this._update();
        },

        /**
         * @return {int} The currently selected options by index or -1 if none is selected
         */
        getSelectedIndex: function() {
            return this.selectedIndex;
        },

        /** @ignore */
        _changeOptions: function(event) {
            if (event.widget !== this) {
                return;
            }
            this.selectedIndex = -1;
            this._update();
        },

        /** @ignore */
        _render: function() {
            this._readDataFromMarkup();

            var div;
            // if current element is select field -> turn into input field, but hold reference to select to update it on change
            if (this.$element.get(0).tagName === "SELECT") {
                div = $("<div></div>");
                this.$element.after(div);
                this.$element.detach();
                div.append(this.$element);
                this.$element = div;
            }

            // if current element is input field -> wrap it into DIV
            if (this.$element.get(0).tagName === "INPUT") {
                div = $("<div></div>");
                this.$element.after(div);
                this.$element.detach();
                div.prepend(this.$element);
                this.$element = div;
            }

            // If there was an select in markup: use it for generating options
            if (this.$element.find("select option").length > 0 && this.options.options.length === 0) {
                this.options.options = [];
                this.options.optionDisplayStrings = [];
                this.$element.find("select option").each(function(i, e) {
                    this.options.options.push($(e).val());
                    this.options.optionDisplayStrings.push($.trim($(e).text()));

                    // Save selected state
                    if ($(e).attr("selected")) {
                        this.selectedIndex = i;
                    }

                }.bind(this));
            }

            this._createMissingElements();

            this.syncSelectElement = this.$element.find("select");
            this.inputElement = this.$element.find("input");

            this.$element.addClass("pathbrowser");
            this.$element.removeClass("focus");

            if (!this.options.placeholder) {
                this.options.placeholder = this.inputElement.attr("placeholder");
            }
            if (this.options.name) {
                this.syncSelectElement.attr("name", this.options.name);
            }

            this._update();
        },

        _createMissingElements: function() {
            if (this.$element.find("select").length === 0) {
                this.$element.append($("<select></select>"));
            }
            if (this.$element.find("input").length === 0) {
                this.$element
                    .prepend($("<input/>", {
                        type: "text"
                    })
                );
            }
        },

        /** @ignore */
        _readDataFromMarkup: function() {
            if (this.$element.attr("placeholder")) {
                this.options.placeholder = this.$element.attr("placeholder");
            }
            if (this.$element.attr("data-placeholder")) {
                this.options.placeholder = this.$element.attr("data-placeholder");
            }
            if (this.$element.attr("disabled") || this.$element.attr("data-disabled")) {
                this.options.disabled = true;
            }
            if (this.$element.attr("data-option-renderer")) {
                // Allow to choose from default option renderers
                this.options.optionRenderer = CUI.PathBrowser[this.$element.attr("data-option-renderer") + "OptionRenderer"];
            }

            if (this.$element.attr("data-root-path")) {
                this.options.rootPath = this.$element.attr("data-root-path");
            }

            // Register a callback function for option loader if defined
            var optionLoader = CUI.util.buildFunction(this.$element.attr("data-option-loader"), ["path", "callback"]);
            if (optionLoader) {
                this.options.optionLoader = optionLoader.bind(this);
            }
            // Root to use from the result object
            if (this.$element.attr("data-option-loader-root")) {
                this.options.optionLoaderRoot = this.$element.attr("data-option-loader-root");
            }
            // Custom value and title readers
            var optionValueReader = CUI.util.buildFunction(this.$element.attr("data-option-value-reader"), ["object"]);
            if (optionValueReader) {
                this.options.optionValueReader = optionValueReader.bind(this);
            }
            var optionTitleReader = CUI.util.buildFunction(this.$element.attr("data-option-title-reader"), ["object"]);
            if (optionTitleReader) {
                this.options.optionTitleReader = optionTitleReader.bind(this);
            }
        },

        /** @ignore */
        _update: function() {
            if (this.options.placeholder) {
                this.inputElement.attr("placeholder", this.options.placeholder);
            }

            if (this.options.disabled) {
                this.$element.addClass("disabled");
                this.inputElement.attr("disabled", "disabled");
            } else {
                this.$element.removeClass("disabled");
                this.inputElement.removeAttr("disabled");
            }

            if (this.syncSelectElement) {
                this.syncSelectElement.find("option:selected").removeAttr("selected");
            }
            if (this.selectedIndex >= 0) {
                if (this.syncSelectElement) {
                    $(this.syncSelectElement.find("option").get(this.selectedIndex)).attr("selected", "selected");
                }
                // Value to set is what is currently in the input field until the last slash + the option value
                var option = this.options.options[this.selectedIndex];
                if (option && option.indexOf("/") !== 0) {
                    // Option contains a relative path
                    var parentPath = "";
                    var iLastSlash = this.inputElement.attr("value").lastIndexOf("/");
                    if (iLastSlash >= 0) {
                        parentPath = this.inputElement.attr("value").substring(0, iLastSlash + 1);
                    }
                    option = parentPath + option;
                }
                this._setInputValue(option, true);
            } else {
                this._setInputValue("");
            }
        },

        /** @ignore */
        _setInputValue: function(newValue, moveCursor) {
            // Using select text util to select starting from last character to last character
            // This way, the cursor is placed at the end of the input text element
            if (newValue) {
                this.inputElement.attr("value", newValue);
                if (moveCursor) {
                    CUI.util.selectText(this.inputElement, newValue.length);
                }
            }
        },

        /** @ignore */
        _keyUp: function(event) {
            var key = event.keyCode;
            if (key === 8) {
                this.triggeredBackspace = false; // Release the key event
            }
        },

        /** @ignore */
        _keyPressed: function(event) {
            var key = event.keyCode;
            if (!this.dropdownList.isVisible()) {
                if (key === 40) {
                    this._inputChanged(); // Show box now!
                    event.preventDefault();
                }
            }
        },

        /** @ignore */
        _inputChanged: function() {
            var self = this;

            var searchFor = this.inputElement.attr("value");
            if (searchFor.length > 0) {
                this.options.autocompleteCallback(searchFor)
                    .done(
                        function(results) {
                            self._showAutocompleter(results);
                        }
                    )
                    .fail(
                        function() {
                            // TODO: implement
                            console.log("Failed to read options");
                        }
                    )
                ;
            } else {
                this.dropdownList.hide();
            }
        },

        /** @ignore */
        _showAutocompleter: function(results) {
            this.dropdownList.hide();

            if (results.length === 0) {
                return;
            }

            var optionRenderer = function(iterator, value) {
                return (this.options.optionRenderer.bind(this))(iterator, value);
            };

            this.dropdownList.set("optionRenderer", optionRenderer.bind(this));
            this.dropdownList.set("options", results);

            this.dropdownList.show();
        },

        /** @ignore */
        _defaultAutocompleteCallback: function(path) {
            var self = this;
            var def = $.Deferred();

            // Check if the input value starts and ends with a slash
            // If so, the options loader will be called if it exists, in order
            // to refresh the available options list.
            // Otherwise, it will just filter the options to only show the
            // matching ones in the auto completer div.
            if (/^\//.test(path) && /\/$/.test(path) && self.options.optionLoader) {
                var isCustomRoot = false;
                if (path === "/") {
                    // Use configured root path
                    if (self.options.rootPath) {
                        path = self.options.rootPath.replace(/\/$/, "");
                        if (path !== "") {
                            isCustomRoot = true;
                        } else {
                            path = "/";
                        }
                    }
                } else {
                    // Remove final slash
                    path = path.replace(/\/$/, "");
                }

                // Replace field value if the entered path was a custom root path
                if (isCustomRoot) {
                    self._setInputValue(path + "/");
                }

                // Make the option loader a promise to guarantee that the callback is
                // executed at the right rime
                var loader = {
                    loadOptions: self.options.optionLoader
                };
                var loaderDef = $.Deferred();
                loaderDef.promise(loader);
                loader.done(
                    function(object) {
                        if ($.isFunction(object.promise)) {
                            // Original function was already returning a promise
                            // Bind the rebuild options on that object's 'done' method
                            object.done(
                                function(object) {
                                    self._rebuildOptions(def, path, object);
                                }
                            );
                        } else {
                            // Original function was not returning a promise
                            self._rebuildOptions(def, path, object);
                        }
                    }
                );
                
                // Asynch optionLoader
                var results = loader.loadOptions(path, function(data) {
                    loaderDef.resolve(data);
                });
                
                //  Synch optionLoader
                if (results) loaderDef.resolve(results);

            } else {
                def.resolve(self._filterOptions(path));
            }

            return def.promise();
        },

        _rebuildOptions: function(def, path, object) {
            var self = this;

            var root = $.getNested(object, self.options.optionLoaderRoot);
            if (root) {
                var newOptions = [];
                var newOptionDisplayStrings = [];
                $.each(root, function(i, v) {
                    // Read the title and the value either from provided custom reader
                    // or using default expected object structure
                    var value;
                    if (self.options.optionValueReader) {
                        value = self.options.optionValueReader(v);
                    } else {
                        value = typeof v === "object" ? v.path : v;
                    }
                    newOptions.push(value);

                    var title = "";
                    if (self.options.optionTitleReader) {
                        title = self.options.optionTitleReader(v);
                    } else if (typeof v === "object") {
                        title = v.title;
                    }
                    newOptionDisplayStrings.push(title);
                }.bind(self));

                self.options.options = newOptions;
                self.options.optionDisplayStrings = newOptionDisplayStrings;

                var filtered = self._filterOptions(path);
                def.resolve(filtered);
            } else {
                def.reject();
            }
        },

        _filterOptions: function(searchFor) {
            var result = [];

            $.each(this.options.options, function(key, value) {
//                if (value.toLowerCase().indexOf(searchFor.toLowerCase(), 0) >= 0) {
                    result.push(key);
//                }
            }.bind(this));

            return result;
        }

    });

    CUI.util.plugClass(CUI.PathBrowser);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on("cui-contentloaded.data-api", function(e) {
            $("[data-init='pathbrowser']", e.target).pathBrowser();
        });
    }

}(window.jQuery));


CUI.PathBrowser.defaultOptionRenderer = function(iterator, index) {
    var value = this.options.options[index];
    if (value.indexOf("/") === 0) {
        // Option contains an absolute path
        var iLastSlash = value.lastIndexOf("/");
        value = value.substring(iLastSlash + 1);
    }

    // Use alternate display strings if possible
    var valueCls = "pathbrowser-autocomplete-item-value";
    var titleMarkup = "";
    if (this.options.showTitles && this.options.optionDisplayStrings[index] && this.options.optionDisplayStrings[index].length > 0) {
        valueCls += " pathbrowser-autocomplete-item-value-with-title";
        titleMarkup += "<div class=\"pathbrowser-autocomplete-item-title\">" + this.options.optionDisplayStrings[index] + "</div>";
    }

    return $("<div class=\"" + valueCls + "\">" + value + "</div>" + titleMarkup);
};
(function($) {
    CUI.FileUpload = new Class(/** @lends CUI.FileUpload# */{
        toString: 'FileUpload',
        extend: CUI.Widget,

        /**
         @extends CUI.Widget
         @classdesc A file upload widget

         <p>
         <input data-init="fileupload" data-placeholder="Select file(s)">
         <option>/apps</option>
         <option>/content</option>
         <option>/etc</option>
         <option>/libs</option>
         <option>/tmp</option>
         <option>/var</option>
         </select>
         </p>

         @desc Creates a file upload field
         @constructs

         @param {Object}   options                                    Component options
         @param {String}   [options.name="file"]                      (Optional) name for an underlying form field.
         @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
         @param {String}   [options.uploadUrl=null]                   URL where to upload the file
         @param {String}   [options.uploadUrlBuilder=null]            Upload URL builder
         @param {boolean}  [options.disabled=false]                   Is this component disabled?
         @param {boolean}  [options.multiple=false]                   Can the user upload more than one file?
         @param {Object}   [options.mimeTypes=null]                   Restrict upload to mime types
         @param {int}      [options.sizeLimit=null]                   File size limit
         @param {boolean}  [options.autoStart=false]                  Should upload start automatically once the file is selected?
         @param {String}   [options.fileNameParameter=null]           Name of File name's parameter
         @param {boolean}  [options.useHTML5=true]                    (Optional) Prefer HTML5 to upload files (if browser allows it)
         @param {boolean}  [options.dropZone=null]                    (Optional) Drop zone to upload files from file system directly (if browser allows it)
         @param {Object}   [options.events={}]                        (Optional) Event handlers
         */
        construct: function(options) {
            // Adjust DOM to our needs
            this._render();

            this.inputElement.on("change", function(event) {
                if (this.options.disabled) {
                    return;
                }
                this._onFileSelectionChange(event);
            }.bind(this));
        },

        defaults: {
            name: "file",
            placeholder: null,
            uploadUrl: null,
            uploadUrlBuilder: null,
            disabled: false,
            multiple: false,
            mimeTypes: null,
            sizeLimit: null,
            autoStart: false,
            fileNameParameter: null,
            useHTML5: true,
            dropZone: null,
            events: {}
        },

        inputElement: null,
        $spanElement: null,
        fileNameElement: null,
        uploadQueue: [],

        /** @ignore */
        _render: function() {
            var self = this;

            this._readDataFromMarkup();

            if (!CUI.util.HTTP.html5UploadSupported()) {
                this.options.useHTML5 = false;
            }

            // If current element is input field -> wrap it into SPAN
            if (this.$element.get(0).tagName === "INPUT") {
                var clazz = this.$element.attr("class");

                var span = $("<span/>", {
                    "class": clazz
                });
                this.$element.after(span);
                this.$element.detach();
                span.prepend(this.$element);
                this.$element = span;
            }

            // Get the span element
            this.$spanElement = this.$element.is("span") ? this.$element : this.$element.find("span");

            // Get the input element
            this.inputElement = this.$element.find("input[type='file']");
            this.inputElement.removeAttr("class");

            this._createMissingElements();

            this.$element.addClass("fileupload");
            this.$element.removeClass("focus");

            if (this.inputElement.attr("title")) {
                this.$element.prepend($("<label/>", {
                    "for": self.options.name
                }).html(this.inputElement.attr("title")));
            }

            // Register event handlers
            if (this.options.events) {
                if (typeof this.options.events === "object") {
                    for (var name in this.options.events) {
                        this._registerEventHandler(name, this.options.events[name]);
                    }
                }
            }

            // Register drop zone
            if (this.options.useHTML5) {
                this.options.dropZone = this._registerDropZone();
            } else {
                this.options.dropZone = null;
            }

            if (!this.options.placeholder) {
                this.options.placeholder = this.inputElement.attr("placeholder");
            }

            if (this.options.autoStart) {
                this._registerEventHandler("fileselected", function(event) {
                    event.fileUpload.uploadFile(event.item);
                });
            }

            // URL built via JavaScript function
            if (this.options.uploadUrlBuilder) {
                this.options.uploadUrl = this.options.uploadUrlBuilder(this);
            }

            if (!this.options.uploadUrl || /\$\{.+\}/.test(this.options.uploadUrl)) {
                this.options.disabled = true;
            }

            this._update();
        },

        _registerDropZone: function() {
            var self = this;
            if (self.options.dropZone) {
                // TODO: provide an additional way to get the drop zone via a function

                // Try to get the drop zone via a jQuery selector
                try {
                    self.options.dropZone = $(self.options.dropZone);
                } catch (e) {
                    delete self.options.dropZone;
                }

                if (self.options.dropZone) {
                    self.options.dropZone
                        .on("dragover", function(e) {
                            if (self._isActive()) {
                                self.isDragOver = true;

                                if (e.stopPropagation) {
                                    e.stopPropagation();
                                }
                                if (e.preventDefault) {
                                    e.preventDefault();
                                }

                                self.$element.trigger({
                                    type: "dropzonedragover",
                                    originalEvent: e,
                                    fileUpload: self
                                });
                            }

                            return false;
                        })
                        .on("dragleave", function(e) {
                            if (self._isActive()) {
                                if (e.stopPropagation) {
                                    e.stopPropagation();
                                }
                                if (e.preventDefault) {
                                    e.preventDefault();
                                }

                                self.isDragOver = false;
                                window.setTimeout(function() {
                                    if (!self.isDragOver) {
                                        self.$element.trigger({
                                            type: "dropzonedragleave",
                                            originalEvent: e,
                                            fileUpload: self
                                        });
                                    }
                                }, 1);
                            }

                            return false;
                        })
                        .on("drop", function(e) {
                            if (self._isActive()) {
                                if (e.stopPropagation) {
                                    e.stopPropagation();
                                }
                                if (e.preventDefault) {
                                    e.preventDefault();
                                }

                                var files = e.originalEvent.dataTransfer.files;

                                self.$element.trigger({
                                    type: "dropzonedrop",
                                    originalEvent: e,
                                    files: files,
                                    fileUpload: self
                                });

                                self._onFileSelectionChange(e, files);
                            }

                            return false;
                        })
                    ;
                }
            }
        },

        _registerEventHandler: function(name, handler) {
            this.$element.on(name, handler);
        },

        _createMissingElements: function() {
            var self = this;

            var multiple = self.options.useHTML5 && self.options.multiple;
            if (self.inputElement.length === 0) {
                self.inputElement = $("<input/>", {
                    type: "file",
                    name: self.options.name,
                    multiple: multiple
                });
                self.$element.prepend(self.inputElement);
            } else {
                self.inputElement.attr("multiple", multiple);
            }
        },

        /** @ignore */
        _readDataFromMarkup: function() {
            var self = this;
            if (this.$element.attr("name")) {
                this.options.name = this.$element.attr("name");
            }
            if (this.$element.attr("placeholder")) {
                this.options.placeholder = this.$element.attr("placeholder");
            }
            if (this.$element.attr("data-placeholder")) {
                this.options.placeholder = this.$element.attr("data-placeholder");
            }
            if (this.$element.attr("disabled") || this.$element.attr("data-disabled")) {
                this.options.disabled = true;
            }
            if (this.$element.attr("multiple") || this.$element.attr("data-multiple")) {
                this.options.multiple = true;
            }
            if (this.$element.attr("data-upload-url")) {
                this.options.uploadUrl = this.$element.attr("data-upload-url");
            }
            if (this.$element.attr("data-upload-url-builder")) {
                this.options.uploadUrlBuilder = CUI.util.buildFunction(this.$element.attr("data-upload-url-builder"), ["fileUpload"]);
            }
            if (this.$element.attr("data-size-limit")) {
                this.options.sizeLimit = this.$element.attr("data-size-limit");
            }
            if (this.$element.attr("data-auto-start")) {
                this.options.autoStart = true;
            }
            if (this.$element.attr("data-usehtml5")) {
                this.options.useHTML5 = this.$element.attr("data-usehtml5") === "true";
            }
            if (this.$element.attr("data-dropzone")) {
                this.options.dropZone = this.$element.attr("data-dropzone");
            }
            if (this.$element.attr("data-file-name-parameter")) {
                this.options.fileNameParameter = this.$element.attr("data-file-name-parameter");
            }
            $.each(this.$element.get(0).attributes, function(i, attribute) {
                var match = /^data-event-(.*)$/.exec(attribute.name);
                if (match && match.length > 1) {
                    var eventHandler = CUI.util.buildFunction(attribute.value, ["event"]);
                    if (eventHandler) {
                        self.options.events[match[1]] = eventHandler.bind(self);
                    }
                }
            });
        },

        /** @ignore */
        _update: function() {
            if (this.options.placeholder) {
                this.inputElement.attr("placeholder", this.options.placeholder);
            }

            if (this.options.disabled) {
                this.$element.addClass("disabled");
                this.inputElement.attr("disabled", "disabled");
            } else {
                this.$element.removeClass("disabled");
                this.inputElement.removeAttr("disabled");
            }
        },

        /** @ignore */
        _onFileSelectionChange: function(event, files) {
            var addedCount = 0, rejectedCount = 0;
            if (this.options.useHTML5) {
                files = files || event.target.files;
                for (var i = 0; i < files.length; i++) {
                    if (this._addFile(files[i])) {
                        addedCount++;
                    } else {
                        rejectedCount++;
                    }
                }
            } else {
                if (this._addFile(event.target)) {
                    addedCount++;
                } else {
                    rejectedCount++;
                }
            }

            this.$element.trigger({
                type: "filelistprocessed",
                addedCount: addedCount,
                rejectedCount: rejectedCount,
                fileUpload: this
            });
        },

        /** @ignore */
        _addFile: function(file) {
            var self = this;

            var fileName;
            if (this.options.useHTML5) {
                fileName = file.name;
            } else {
                fileName = $(file).attr("value");
            }
            if (fileName.lastIndexOf("\\") !== -1) {
                fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
            }

            if (!self._getQueueItemByFileName(fileName)) {
                var item = {
                    fileName: fileName
                };
                if (this.options.useHTML5) {
                    item.file = file;
                    item.fileSize = file.size;

                    // Check file size
                    if (self.options.sizeLimit && file.size > self.options.sizeLimit) {
                        self.$element.trigger({
                            type: "filerejected",
                            item: item,
                            message: "File is too big",
                            fileUpload: self
                        });
                        return false;
                    }
                }

                // Add item to queue
                self.uploadQueue.push(item);
                self.$element.trigger({
                    type: "queuechanged",
                    item: item,
                    operation: "ADD",
                    queueLength: self.uploadQueue.length,
                    fileUpload: self
                });

                self.$element.trigger({
                    type: "fileselected",
                    item: item,
                    fileUpload: self
                });

                return true;
            }

            return false;
        },

        /** @ignore */
        _getQueueIndex: function(fileName) {
            var index = -1;
            $.each(this.uploadQueue, function(i, item) {
                if (item.fileName === fileName) {
                    index = i;
                    return false;
                }
            });
            return index;
        },

        /** @ignore */
        _getQueueItem: function(index) {
            return index > -1 ? this.uploadQueue[index] : null;
        },

        /** @ignore */
        _getQueueItemByFileName: function(fileName) {
            return this._getQueueItem(this._getQueueIndex(fileName));
        },

        // TODO: document
        uploadFile: function(item) {
            var self = this;

            if (self.options.useHTML5) {
                item.xhr = new XMLHttpRequest();
                item.xhr.addEventListener("loadstart", function(e) { self._onUploadStart(e, item); }, false);
                item.xhr.addEventListener("load", function(e) { self._onUploadLoad(e, item); }, false);
                item.xhr.addEventListener("error", function(e) { self._onUploadError(e, item); }, false);
                item.xhr.addEventListener("abort", function(e) { self._onUploadCanceled(e, item); }, false);

                var upload = item.xhr.upload;
                upload.addEventListener("progress", function(e) { self._onUploadProgress(e, item); }, false);

                // TODO: encoding of special characters in file names
                var file = item.file;
                var fileName = item.fileName;
                if (window.FormData) {
                    var f = new FormData();
                    if (self.options.fileNameParameter) {
                        // Custom file and file name parameter
                        f.append(self.inputElement.attr("name"), file);
                        f.append(self.options.fileNameParameter || "fileName", fileName);
                    } else {
                        f.append(fileName, file);
                    }
                    f.append("_charset_", "utf-8");

                    item.xhr.open("POST", self.options.uploadUrl + "?:ck=" + new Date().getTime(), true);
                    item.xhr.send(f);
                } else {
                    item.xhr.open("PUT", self.options.uploadUrl + "/" + fileName, true);
                    item.xhr.send(file);
                }

            } else {
                var $body = $(document.body);

                // Build an iframe
                var iframeName = "upload-" + new Date().getTime();
                var $iframe = $("<iframe/>", {
                    name: iframeName
                });
                $iframe.addClass("fileupload").appendTo($body);

                // Build a form
                var $form = $("<form/>", {
                    method: "post",
                    enctype: "multipart/form-data",
                    action: self.options.uploadUrl,
                    target: iframeName
                });
                $form.addClass("fileupload").appendTo($body);

                var $charset = $("<input/>", {
                    type: "hidden",
                    name: "_charset_",
                    value: "utf-8"
                });
                $form.prepend($charset);

                // Define value of the file name element
                if (this.options.fileNameParameter) {
                    this.fileNameElement = $("<input/>", {
                        type: "hidden",
                        name: this.options.fileNameParameter,
                        value: item.fileName
                    });
                    $form.prepend(this.fileNameElement);
                }

                $iframe.one("load", function() {
                    var content = this.contentWindow.document.body.innerHTML;
                    self.inputElement.prependTo(self.$spanElement);
                    $form.remove();
                    $iframe.remove();

                    self.$element.trigger({
                        type: "fileuploadload",
                        item: item,
                        content: content,
                        fileUpload: self
                    });
                });

                self.inputElement.prependTo($form);
                $form.submit();
            }
        },

        // TODO: document
        cancelUpload: function(item) {
            item.xhr.abort();
        },

        /** @ignore */
        _onUploadStart: function(e, item) {
            this.$element.trigger({
                type: "fileuploadstart",
                item: item,
                originalEvent: e,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadProgress: function(e, item) {
            // Update progress bar
            this.$element.trigger({
                type: "fileuploadprogress",
                item: item,
                originalEvent: e,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadLoad: function(e, item) {
            var request = e.target;
            if (request.readyState === 4) {
                this._internalOnUploadLoad(e, item, request.status, request.responseText);
            }
        },

        /** @ignore */
        _internalOnUploadLoad: function(e, item, requestStatus, responseText) {
            if (CUI.util.HTTP.isOkStatus(requestStatus)) {
                this.$element.trigger({
                    type: "fileuploadsuccess",
                    item: item,
                    originalEvent: e,
                    fileUpload: this
                });
            } else {
                this.$element.trigger({
                    type: "fileuploaderror",
                    item: item,
                    originalEvent: e,
                    message: responseText,
                    fileUpload: this
                });
            }

            // Remove file name element if needed
            if (this.fileNameElement) {
                this.fileNameElement.remove();
            }

            // Remove queue item
            this.uploadQueue.splice(this._getQueueIndex(item.fileName), 1);
            this.$element.trigger({
                type: "queuechanged",
                item: item,
                operation: "REMOVE",
                queueLength: this.uploadQueue.length,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadError: function(e, item) {
            this.$element.trigger({
                type: "fileuploaderror",
                item: item,
                originalEvent: e,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadCanceled: function(e, item) {
            this.$element.trigger({
                type: "fileuploadcanceled",
                item: item,
                originalEvent: e,
                fileUpload: this
            });
        },

        /** @ignore */
        _isActive: function() {
            return !this.inputElement.is(':disabled');
        }

    });

    CUI.util.plugClass(CUI.FileUpload);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on("cui-contentloaded.data-api", function(e) {
            $("[data-init='fileupload']", e.target).fileUpload();
        });
    }

}(window.jQuery));
(function($) {
  CUI.Toolbar = new Class(/** @lends CUI.Toolbar# */{
    toString: 'Toolbar',

    extend: CUI.Widget,
    /**
     * @extends CUI.Widget
     * @classdesc 
     *    
     *  
     *     
     *  <h2>Data Attributes</h2>
     *  <h4>Currently there are the following data options:</h4>
     *  <pre>
     *    data-init="toolbar"
     *  </pre>
     */
    construct: function(options) {
      var $toolbar  = this.$element,
          $header   = $toolbar.closest(".content-header"),
          $icons    = $toolbar.find(".left"),
          hasCenter = $toolbar.find(".center").length !== 0,
          iconWidth = $icons.width();

      $toolbar.reflow({
        "break-lines": function ($toolbar, size) {
          return hasCenter && $toolbar.width()-2*iconWidth < 16*size.rem();
        },
        "long-title":  function ($toolbar, size) {
          return hasCenter && $toolbar.width()-2*iconWidth > 40*size.rem();
        }
      }, {
        "applyClassToElement": $header
      });
    }
  });

  CUI.util.plugClass(CUI.Toolbar);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
      $("[data-init=toolbar]", e.target).toolbar();
    });
  }
}(window.jQuery));
