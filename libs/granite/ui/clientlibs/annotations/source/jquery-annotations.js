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

/**
 * jquery annotation plugin.
 *
 * Implementation note regarding domain/view mapping:
 * ==================================================
 *
 * When drawing a shape on an image or chart, the shape position and size
 * (i.e. bounding box) in domain coordinates and the dimensions of the current
 * viewport needs to be stored. When the shape needs to be rendered again
 * for a different domain scaling, eg. when the chart is resized, moved, scaled,
 * or if the image is resized, the bounding box and mapping information needs to
 * be reversed.
 * In order to simplify the chart and image use case, we assume that
 * the image has virtual domain dimensions of 1000x1000, so we don't need to know
 * the real image dimensions, and we can store the bounding box of the shape only
 * in domain coordinates.
 *
 * Example:
 * Viewport while creating: 600x400 (Wv x Hv)
 * Real image dimensions:  1200x800 (Wr x Hr)
 * Virtual dimensions 1000x1000 (Wi x Hi)
 *
 * Drawn shape in vp at (100,100):
 *   Xv = 100, Xi = Xv * (Wi / Wv) = 100 * (1000/600) = 166.6
 *   Yv = 100, Yi = Yv * (Hi / Hv) = 100 * (1000/400) = 250
 *
 * Resized Viewport while drawing: 1200x800
 *   Xi = 166.6, Xv = Xi * (Wv / Wi) = 166.6 * (1200 / 1000) = 200
 *   Yi = 250  , Yv = Yi * (Hv / Hi) = 250 * (800 / 1000) = 200
 */

(function (window, $, undefined) {

    /**
     * Creates a new annotation instance.
     * @param options annotation options.
     * @param element HTML element to bind the annotation to
     * @constructor
     */
    $.Annotation = function(options, element) {
        this.$el = $(element);
        this._init(options);
    };

    var $window = $(window);

    $.Annotation.prototype = {
        options: {

            /**
             * Name of the CSS class to add to the canvas element. If empty, default style properties are set.
             */
            canvasClass: null,

            /**
             * Name of the CSS class to add when drawing is active. If empty, default style properties are set.
             */
            activeClass: null,

            /**
             * Enables resize watch. only use if you expect the target element to change often.
             */
            resizeWatch: false
        },
        ctx: null,                 // the canvas context
        dimension: {w: 0, h: 0},   // dimension of image this annotation is made for
        shapes: [], // shapes of this annotation
        texts:   [], // texts of this annotation
        imageData: null, // temporary image data (see canvas.toDataUrl()) not included in toJson serialization!
        damCanvas: null,  // temporary dam canvas while adding
        isDrawing: false, // flag indicating if drawing during mouse down
        $canvas: null,  // our canvas
        d2vMapping: null, // domain-to-view mapping
        v2dMapping: null, // view-to-domain mapping

        _init: function(options) {
            this.options = options || {};
            this.d2vMapping = this._defaultD2VMapping;
            this.v2dMapping = this._defaultV2DMapping;
        },

        _defaultD2VMapping: function(p) {
            if (this.dimension.w) {
                p.x = p.x / 1000 * this.dimension.w;
                p.y = p.y / 1000 * this.dimension.h;
            }
            return p;
        },
        _defaultV2DMapping: function(p) {
            if (this.dimension.w) {
                p.x = p.x / this.dimension.w * 1000;
                p.y = p.y / this.dimension.h * 1000;
            }
            return p;
        },
        _bindEvents: function() {
            var $canvas = this.$canvas;
            if ($canvas) {
                // bind mouse events
                $canvas.on({
                    "mousedown touchstart": this._beginDraw,
                    "mouseup touchend": this._endDraw,
                    "mousemove touchmove": this._userDraw
                }, {self:this});

                // also enable drawing CSS
                if (this.options.activeClass) {
                    $canvas.addClass(this.options.activeClass);
                } else {
                    $canvas.css({
                        cursor: "crosshair"
                    });
                }
                this.$el.trigger("annotateStart", this);
            }
        },

        _unbindEvents: function() {
            var $canvas = this.$canvas;
            if ($canvas) {
                $canvas.off({
                    "mousedown touchstart": this._beginDraw,
                    "mouseup touchend": this._endDraw,
                    "movemove touchmove": this._userDraw
                });
                // also disable drawing CSS
                if (this.options.activeClass) {
                    $canvas.removeClass(this.options.activeClass);
                } else {
                    $canvas.css("cursor", "");
                }
            }
        },

        _draw: function() {
            var ctx = this.ctx;
            if (ctx) {
                var cw = ctx.canvas.width;
                var ch = ctx.canvas.height;
                ctx.clearRect(0, 0, cw, ch);

                if (this.damCanvas) {
                    this.damCanvas.draw(false);
                }

                for (var i=0; i<this.shapes.length; i++) {
                    this.shapes[i].draw(ctx);
                }
            }
        },

        _userDraw: function(e) {
            var self = e.data.self;
            if (self.isDrawing && self.damCanvas){
                var touch = e;
                var touches = e.originalEvent.targetTouches;
                if (touches) {
                    touch = touches[0];
                }
                var o = self.$canvas.offset();
                var x = touch.pageX-o.left;
                var y = touch.pageY - o.top;
                self.damCanvas.addPoint(x, y);
                self.damCanvas.calc();
                self._draw();
            }
            return false;
        },

        _beginDraw: function(e) {
            var self = e.data.self;
            if (self.damCanvas) {
                self.annotation = null;
                self.isDrawing=true;
                self.$el.trigger("annotateBegin", self);
            }
            return false;
        },

        _endDraw: function(e) {
            var self = e.data.self;
            if (self.damCanvas) {
                self.isDrawing=false;
                var shp = self.damCanvas.getShape();
                self.damCanvas = null;
                if (shp) {
                    if (self.v2dMapping) {
                        var p0 = {
                            x:shp.box.x0,
                            y:shp.box.y0
                        };
                        var p1 = {
                            x:shp.box.x1,
                            y:shp.box.y1
                        };
                        self.v2dMapping(p0);
                        self.v2dMapping(p1);
                        shp.domainBox = {
                            x0: p0.x,
                            y0: p0.y,
                            x1: p1.x,
                            y1: p1.y
                        };
                        if (shp.box.ctlx) {
                            p1 = {x:shp.box.ctlx, y:shp.box.ctly};
                            self.v2dMapping(p1);
                            shp.domainBox.ctlx = p1.x;
                            shp.domainBox.ctly = p1.y;
                        }
                    }
                    self.addShape(shp);
                }
                self._draw();
                if (shp) {
                    self.setImageData(self.ctx.canvas.toDataURL("image/png", 1.0));
                    self.$el.trigger("annotateEnd", [self, shp]);
                }
                self._unbindEvents();
            }
            return false;
        },

        /**
         * Opens a new annotation and adds the canvas element.
         * @return {*}
         */
        open: function() {
            if (!this.ctx) {
                var $el = this.$el;
                var $canvas = this.$canvas = $("<canvas></canvas>");
                if (this.options.canvasClass) {
                    $canvas.addClass(this.options.canvasClass);
                } else {
                    $canvas.css({
                        position: "absolute",
                        display: "block",
                        "z-index": 100
                    });
                }
                $canvas.insertBefore($el);
                this.ctx = $canvas.get(0).getContext('2d');
                var w = $el.width();
                var h = $el.height();
                this.dimension = { w: w, h: h };
                $canvas.attr("width", w);
                $canvas.attr("height", h);

                // detect image load
                $el.on("load", this.onResize, {self: this});
                if (this.options.resizeWatch) {
                    $el.on("resize", this.onResize);
                }
                this.$el.trigger("annotateOpen", this);
            }
            return this;
        },

        /**
         * Closes the annotation and removes the canvas element.
         */
        close: function() {
            if (this.$canvas) {
                this._unbindEvents();
                this.$el.off("load resize");
                this.$canvas.remove();
                this.ctx = null;
                this.$canvas = null;
                this.$el.trigger("annotateClose", this);
                this.shapes = [];
                this.texts = [];
            }
        },

        onResize: function() {
            var self = this;
            var instance = $.data(this, 'annotation');
            if (instance) {
                self = instance;
            }
            var $canvas = self.$canvas;
            if ($canvas) {
                var w = self.$el.width();
                var h = self.$el.height();
                self.dimension = { w: w, h: h };

                $canvas.attr("width", w);
                $canvas.attr("height", h);

                // rebuild shapes
                for (var i=0; i<self.shapes.length; i++) {
                    self.shapes[i] = Granite.UI.Annotation.Shape.fromObject(self.shapes[i], self.d2vMapping, self);
                }

                self._draw();
            }
        },

        show: function() {
            if (this.$canvas) {
                this._draw();
                this.$canvas.show();
            } else {
                logError("Annotation canvas needs to be open before it can be shown.");
            }
        },

        hide: function() {
            if (this.$canvas) {
                this.$canvas.hide();
            }
        },

        start: function() {
            if (!this.ctx) {
                logError("Annotation canvas needs to be open before you can draw.");
                return;
            }
            if (!this.damCanvas) {
                this.damCanvas = new Granite.UI.Annotation.Canvas(this.ctx);
                this.show();
                this._bindEvents();
            }
            return this;
        },

        addShape: function(shape) {
            this.shapes.push(shape);
            return this;
        },

        addText: function(text) {
            this.texts.push(text);
            return this;
        },

        clear: function() {
            this.shapes = [];
            this.texts = [];
            this._draw();
        },

        setV2DMapping: function(mapping) {
            this.v2dMapping = mapping;
        },

        setD2VMapping: function(mapping) {
            this.d2vMapping = mapping;
        },

        toJson: function(indentation) {
            var shapes = [];
            for (var i=0; i<this.shapes.length; i++) {
                shapes.push(this.shapes[i].toObject());
            }
            return JSON.stringify({
                        dimension: this.dimension,
                        shapes: shapes,
                        texts: this.texts}, null, indentation
            );
        },

        fromJson: function(jsonString) {
            var data = JSON.parse(jsonString);
            if (!data || !data.shapes) {
                return false;
            }
            this.shapes = [];
            for (var i=0; i<data.shapes.length; i++) {
                var shp = Granite.UI.Annotation.Shape.fromObject(data.shapes[i], this.d2vMapping, this);
                this.shapes.push(shp);
            }
            this.text = data.text;
            this.dimension = data.dimension;
            return true;
        },

        setImageData: function(data) {
            this.imageData = data;
        },

        getImageData: function() {
            return this.imageData;
        }
    };

    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    // plugin bridge
    $.fn.annotation = function(options) {
        var ret = this, instance;
        if (options === undefined) {
            instance = $.data(this[0], 'annotation');
            if (!instance) {
                logError("Annotation instance not initialized. Call $.annotation({}) first.");
                return;
            }
            return instance;
        } else if (typeof options === 'string') {
            // call method
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function () {
                var instance = $.data(this, 'annotation');
                if (!instance) {
                    logError("Annotation instance not initialized. Call $.annotation({}) first.");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for annotation instance");
                    return;
                }
                // apply method
                var tmpRet = instance[options].apply(instance, args);
                if (tmpRet !== undefined) {
                    ret = tmpRet;
                }
            });
            return ret;
        } else {
            instance = $.data(this[0], 'annotation');
            if (instance) {
                // apply options & init
                //instance.option(options);
                instance._init(options);
            } else {
                // initialize new instance
                instance = new $.Annotation(options, this[0]);
                $.data(this[0], 'annotation', instance);
            }
            return instance;
        }
    };

})(window, jQuery);
