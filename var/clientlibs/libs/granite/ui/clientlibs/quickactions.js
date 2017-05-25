/*
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
/*
 * Requires: jQuery, any touch library (e.g. toe.js) for touch events (= tap, taphold)
 */
(function ($, window, Granite, undefined) {
    "use strict";

    var isTouch = !!('ontouchstart' in window);
    var menu = [];
    var mask;

    function eventName(eventConfig, namespace) {
        return (isTouch ? eventConfig.touch : eventConfig.pointer) + '.' + namespace;
    }

    function getPos(x, y, radius, angle, distance, no) {
        return {
            top: Math.round(y - radius - (Math.cos(no * angle) * distance)),
            left: Math.round(x - radius - (Math.sin(no * angle) * -distance))
        };
    }

    function adjustCenter(center, cfg) {
        var tolerance = 5;
        var r = cfg.layout.details.distance + cfg.layout.details.radius + tolerance;
        var container = $(cfg.container);

        var adjust = function(number, r, maxNumber) {
            if (number - r < 0) {
                return r;
            } else {
                return window.Math.min(number, maxNumber - r);
            }
        };

        return {
            x: adjust(center.x, r, container.innerWidth()),
            y: adjust(center.y, r, container.innerHeight())
        };
    }

    function resolveAnchor(anchor) {
        if (!anchor) return undefined;

        if ($.isFunction(anchor)) {
            return anchor(event);
        }

        if (typeof anchor === "string") {
            return $(event.target).closest(anchor);
        }

        return $(anchor);
    }

    function getCenter(event, cfg) {
        var anchor = resolveAnchor(cfg.anchor);

        if (anchor) {
            var pos = anchor.position();

            return adjustCenter({
                x: pos.left + Math.round(anchor.width() / 2),
                y: pos.top + Math.round(anchor.height() / 2)
            }, cfg);
        } else {
            var ev = event.originalEvent;
            var abs;
            var p = $(cfg.container).offset();

            if (ev.touches && ev.touches.length > 0) {
                abs = $.extend(true, {}, ev.touches)[0];
            } else if (ev.changedTouches && ev.changedTouches.length > 0) {
                abs = $.extend(true, {}, ev.changedTouches)[0];
            } else {
                abs = {
                    pageX: ev.pageX,
                    pageY: ev.pageY
                };
            }

            return adjustCenter({
                x: abs.pageX - p.left,
                y: abs.pageY - p.top
            }, cfg);
        }
    }

    function getStartPosition (actions, cfg, event) {
        if (typeof cfg.startPos == "number") return cfg.startPos;
        
        // Assume the value is "auto". i.e. unknown value is defaulted to "auto"
        return -1 * ((actions ? actions.length - 1 : 0) / 2);
    }

    $.quickaction = function (event, actions, options) {
        var cfg = $.extend(true, $.quickaction.settings, options);

        if (actions === undefined) {
            $.quickaction.settings.layout.destroy(cfg);
        } else {
            $.quickaction.settings.layout.render(actions, cfg, event);
        }
    };

    $.quickaction.LAYOUT_CIRCLE = {
        tag: '<div/>',
        cssClass: 'quickaction-circle',
        closeButton: "<button class='icon-close'>" + Granite.I18n.get("Close") + "</a>",
        effect: {
            duration: 150,
            easing: 'easeInQuad'
        },
        details: {
            /* mask z-index */
            zIndex: 9999,

            /* distance from the center */
            distance: 100,

            /* the angle effects the maximum amount of circles around the touch point */
            angle: 2 * Math.PI / 11,

            /* radius of a circle in px */
            radius: 21,

            /* position of the first circle: 0 - start at 12 o'clock, 'auto' - fan out above the anchor, center-aligned at 12 o'clock */
            startPos: 'auto'
        },

        render: function(actions, cfg, event) {
            var closeMenuEvent = eventName(cfg.event.closeMenu, cfg.event.namespace);

            /* close old quickactions */
            $.quickaction.settings.layout.destroy(cfg);

            /* create overlay mask - due to iPad z-index issue, the mask always covers the actions, so put the mask at the same level as the actions */
            mask = $("<div class='quickaction-mask'>")
                .css("z-index", this.details.zIndex)
                .appendTo(isTouch ? cfg.container : "body");

            /* render actions */
            this.renderActions(actions, cfg, event);

            /* trigger open menu event */
            $(cfg.container).trigger($.quickaction.events.openMenu, { cfg: cfg, target: event.target });
        },

        destroy: function(cfg) {
            var closed = false;

            /* remove action buttons */
            while (menu.length > 0) {
                closed = true;
                menu.pop().remove();
            }

            /* trigger close menu event if actions were removed in fact */
            if (closed) {
                $(cfg.container).trigger($.quickaction.events.closeMenu, { cfg: cfg });
            }

            /* remove overlay mask */
            if (mask) {
                /* Need to delay mask removal so that subsequent annoying click event on iPad is still fall on the mask
                   Remember that on iPad click event will be trigger after tap event after 300ms */
                window.setTimeout(function() {
                    if (mask) {
                        mask.remove();
                        mask = undefined;
                    }
                }, 400);
            }
        },

        renderActions: function(actions, cfg, event) {
            var container = $(cfg.container);
            var t = $(event.target);
            var center = getCenter(event, cfg);
            var details = cfg.layout.details;
            var aperture = details.radius * 2;

            /* initially put actions one level below mask z-index, so buttons are not accessible during animation */
            var css = {
                top: center.y - details.radius,
                left: center.x - details.radius,
                height: aperture,
                width: aperture,
                borderRadius: aperture,
                position: 'absolute',
                'z-index': details.zIndex - 1
            };

            var executeHandlerEvent = eventName(cfg.event.executeHandler, cfg.event.namespace);
            var index = getStartPosition(actions, cfg, event);

            if (cfg.displayCloseButton) {
                var closeButton = {
                    display: $.quickaction.settings.layout.closeButton,
                    touchpoint: true,
                    handler: function(e) {
                        $.quickaction.settings.layout.destroy(cfg);
                    }
                };

                actions.push(closeButton);
            }

            $.each(actions, function () {
                var e = this;

                /* execute condition if the menu item should be shown */
                if ($.isFunction(e.condition) && !e.condition(t)) {
                    return true;
                }

                /* create new circle dom element and insert it into document and add to current menu */
                var $c = $(cfg.layout.tag).addClass(cfg.layout.cssClass);
                container.append($c);
                menu.push($c);

                /* set circle to click point */
                $c.css(css);

                /* attach display item */
                $c.append(e.display);

                /* attach handler to circle */
                if (e.customEvent) {
                    $.each(e.customEvent, function (ev, func) {
                        $c.on(ev, function (event) {
                            event.target = t;
                            func(event);
                        });
                    });
                }

                if (e.handler) {
                    $c.on(executeHandlerEvent, function (event) {
                        event.target = t;
                        if (!e.handler(event)) {
                            // allow handler to return 'true' to keep menu open.
                            $.quickaction.settings.layout.destroy(cfg);
                        }
                    });
                }

                if (cfg.autoClose) {
                    $c.on(executeHandlerEvent, function () {
                        // We have to let listeners of the circle to be executed first before closing/destroying the menu
                        window.setTimeout(function() {
                            $.quickaction.settings.layout.destroy(cfg);
                        }, 0);
                    });
                }

                if (!e.touchpoint) {
                    var details = cfg.layout.details;
                    var pos = getPos(center.x, center.y, details.radius, details.angle, details.distance, index);
                    index++;

                    $c.delay(10).animate({
                        top: pos.top,
                        left: pos.left
                    }, {
                        duration: cfg.layout.effect.duration,
                        easing: cfg.layout.effect.easing,
                        complete: function () {
                            /* move the button above the mask once animation is complete */
                            $(this).css('z-index', details.zIndex + 1);
                        }
                    });
                } else {
                    /* buttons which are not animated also needs to be moved above the mask to make them accessible */
                    $c.css('z-index', cfg.layout.details.zIndex + 1);
                }
            });
        }
    };

    $.quickaction.LAYOUT_BAR = {
        tag: '<ul/>',
        cssClass: 'quickaction-bar',
        details: {
            /* bar z-index */
            zIndex: 9999,

            /* bar height */
            size: 30
        },

        render: function(actions, cfg, event) {
            /* don't recreate a quickactions if they are shown already */
            if (cfg.container.find('.' + this.cssClass).length) {
                return;
            }

            this.destroy(cfg);
            this.renderActions(actions, cfg, event);
            $(cfg.container).trigger($.quickaction.events.openMenu, { cfg: cfg, target: event.target });
        },

        destroy: function(cfg) {
            var closed = false;

            /* remove action buttons */
            while (menu.length > 0) {
                closed = true;
                menu.pop().remove();
            }

            /* trigger close menu event if actions were removed in fact */
            if (closed) {
                $(cfg.container).trigger($.quickaction.events.closeMenu, { cfg: cfg });
            }
        },

        getQuickactionsBar: function() {
            return (menu && menu.length) ? menu[0] : undefined;
        },

        renderActions: function(actions, cfg, event) {
            var container = $(cfg.container);
            var t = $(event.target);
            var item = resolveAnchor(cfg.anchor);
            var details = this.details;

            /* create quickactions bar */
            var $bar = $(cfg.layout.tag).addClass(cfg.layout.cssClass);

            /* TODO: check why height/outerHeight does not include margin from css :before */
            var marginTop = parseInt(item.css("margin-top").replace('px', ''));

            container.append($bar);

            $bar.css('position','absolute');
            $bar.css('top',item.position().top + marginTop + item.height() - details.size - 2); /* -2 because we don't want to overlay item's shadow */
            $bar.css('left',item.position().left - 1); /* FIX: CoralUI sets non-integer values for elements and jquery always rounds it to integer causing 1px difference */
            $bar.css('width',item.width());
            $bar.css('height',details.size);
            $bar.css('z-index',details.zIndex);

            /* add quickactions bar itself to the menu[] */
            menu.push($bar);
            var executeHandlerEvent = eventName(cfg.event.executeHandler, cfg.event.namespace);

            $.each(actions, function () {
                var e = this;

                /* execute condition if the menu item should be shown */
                if ($.isFunction(e.condition) && !e.condition(t)) {
                    return true;
                }

                /* create action button, add it to menu[] and quickactions bar */
                var $c = $('<li/>').css({
                    width: details.size,
                    height: details.size
                });

                $bar.append($c);
                menu.push($c);
                $c.append(e.display);

                /* attach handler to button */
                if (e.customEvent) {
                    $.each(e.customEvent, function (ev, func) {
                        $c.on(ev, function (event) {
                            event.target = t;
                            func(event);
                        });
                    });
                }

                if (e.handler) {
                    $c.on(executeHandlerEvent, function (event) {
                        event.target = t;
                        if (!e.handler(event)) {
                            /* allow handler to return 'true' to keep menu open */
                            $.quickaction.settings.layout.destroy(cfg);
                        }
                    });
                }
            });
        }
    };
    
    $.quickaction.settings = {
        event: {
            namespace: 'quickaction',
            openMenu: {
                touch: 'taphold',
                pointer: 'mouseover'
            },
            closeMenu: {
                touch: 'tap',
                pointer: 'mouseleave'
            },
            executeHandler: {
                touch: 'tap',
                pointer: 'click'
            }
        },

        /* default container for the quickactions */
        container: 'body',

        /* quickactions layout */
        layout: $.quickaction.LAYOUT_CIRCLE,
        autoClose: false
    };

    /* list of events used by quickactions */
    $.quickaction.events = {
        openMenu: 'quickactionopenmenu',
        closeMenu: 'quickactionclosemenu'
    };

    $.fn.extend({
        quickaction: function (actions, options) {
            var cfg = $.extend(true, $.quickaction.settings, options);
            var openMenuEvent = eventName(cfg.event.openMenu, cfg.event.namespace);

            var open = function(event) {
                $.quickaction.settings.layout.render(actions, cfg, event);
            };

            return this.each(function () {
                $(this).on(openMenuEvent, open);
            });
        }
    });

}(jQuery, this, Granite));
