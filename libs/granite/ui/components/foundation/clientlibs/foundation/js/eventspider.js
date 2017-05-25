(function ($, window, undefined) {

    $.eventSpider = (function () {
        var self = {},
            addFunc = $.event.add,
            removeFunc = $.event.remove,
            triggerFunc = $.event.trigger,
            dispatchFunc = $.event.dispatch,
            param = decodeURIComponent(window.location.search.slice(1)).split('&')
                .reduce(function _reduce(a, b) {
                    b = b.split('=');
                    a[b[0]] = b[1];
                    return a;
                }, {});

        self.storage = [];

        self.timeline = [];

        self.config = {
            autoflush: false
        };

        function out(msg, obj) {
            console.log(msg, obj);
        }

        function find(elem) {
            var ret = null;

            $.each(self.storage , function (i, e) {
                if (e.elem === elem) {
                    ret = e;

                    return false;
                }
            });

            return ret;
        }

        function add(elem, types, handler, data, selector) {
            var found = find(elem),
                event = {
                    types: types,
                    handler: handler,
                    data: data,
                    selector: selector,
                    created: new Date().getTime()
                };

            if (found) {
                found.events.push(event);
            } else {
                self.storage.push({
                    elem: elem,
                    events: [event]
                });
            }

            addFunc.apply(this, arguments); // jQuery's original

            if (self.config.autoflush) {
                out('listener added', {
                    elem: elem,
                    event: event
                });
            }
        }

        function remove(elem, types, handler, selector, mappedTypes ) {
            var found = find(elem);

            // TODO remove from storage
            if (types && !handler && !selector && !mappedTypes) { // remove all events

            }

            removeFunc.apply(this, arguments); // jQuery's original
        }

        function trigger(event, data, elem, onlyHandlers) {
            var ev = {
                event: event.type,
                originalEvent: event,
                data: data,
                elem: elem,
                onlyHandlers: onlyHandlers,
                fired: new Date().getTime()
            };

            self.timeline.push(ev);

            triggerFunc.apply(this, arguments); // jQuery's original

            if (self.config.autoflush) {
                out('event triggered', ev);
            }
        }

        function dispatch(event) {
            var ev = {
                event: event.type,
                originalEvent: event,
                fired: new Date().getTime()
            };

            self.timeline.push(ev);

            dispatchFunc.apply(this, arguments); // jQuery's original

            if (self.config.autoflush) {
                out('native event triggered', ev);
            }
        }

        self.getHandler = function (elem) {
            return find(elem);
        };

        self.getEvents = function (elem) {
            var found = self.getHandler(elem),
                events = {};

            if (found) {
                $.each(found.events, function (i, e) {
                    $.each(e.types.split(' '), function (j, f) {
                        var p = f.split('.'); //namespace parts

                        if (!events[p[0]]) {
                            events[p[0]] = [];
                        }

                        // add namespaces
                        for (var k=1; k < p.length; k++) {
                            if ($.inArray(p[k], events[p[0]]) === -1) {
                                events[p[0]].push(p[k]);
                            }
                        }
                    });
                });

                return events;
            }

            return found;
        };

        if (param.debugClientLibs) { // hook into jQuery
            if (location.hash == '#flushEvents') {
                self.config.autoflush = true;
            }

            $.event.add = add;
            $.event.remove = remove;
            $.event.trigger = trigger;
            $.event.dispatch = dispatch;
        }

        return self;
    }());

}(jQuery, this));