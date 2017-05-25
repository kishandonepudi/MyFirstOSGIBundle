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


// virtual canvas where an annotation is drawn
Granite.UI.Annotation.Canvas = function() {

    return {
        ctx:null,
        px: [],
        py: [],
        bb: {
            x0:0, y0:0, // origin corner of bounding box
            x1:0, y1:0, // end corner of bounding box
            px0:0, py0:0, // start of drawing
            px1:0, py1:0, // end of drawing
            w:0, h:0,   // width and height of bounding box
            cx:0, cy:0, // center of bounding box
            l:0,        // length of diagonal
            avgD: 0,    // avg line distance,
            maxD: 0,    // max line distance,
            type: ''    // detected annotation type. 'a' == arrow, 'e' == ellipse
        },
        color: "#ffcc00",

        constructor: function(ctx) {
            this.ctx = ctx;
            return this;
        },

        addPoint: function(x, y) {
            var len = this.px.length;
            this.px[len] = x;
            this.py[len++] = y;
        },

        clear: function() {
            this.px = [];
            this.py = [];
            this.bb.w = 0;
        },

        calc: function() {
            var px = this.px;
            var py = this.py;
            var bb = this.bb;
            var len = px.length;
            if (len > 1) {
                // calculate bounding box.
                bb.x0 = bb.x1 = px[0];
                bb.y0 = bb.y1 = py[0];
                for (var i=1; i<len; i++) {
                    var x = px[i];
                    var y = py[i];
                    if (x < bb.x0) { bb.x0 = x;}
                    if (x > bb.x1) { bb.x1 = x;}
                    if (y < bb.y0) { bb.y0 = y;}
                    if (y > bb.y1) { bb.y1 = y;}
                }
                bb.w = bb.x1 - bb.x0;
                bb.h = bb.y1 - bb.y0;

                // calculate center
                var cx = bb.cx = bb.x0 + bb.w / 2;
                var cy = bb.cy = bb.y0 + bb.h / 2;

                // start and end points
                bb.px0 = px[0];
                bb.py0 = py[0];
                bb.px1 = px[len-1];
                bb.py1 = py[len-1];
                var pw = bb.px0 - bb.px1;
                var ph = bb.py0 - bb.py1;
                bb.l = Math.sqrt(pw*pw + ph*ph);
                // adjust corners, we want p0 to be the point the drawing started.
                if (bb.px0 > bb.px1) {
                    var t = bb.x0;
                    bb.x0 = bb.x1;
                    bb.x1 = t;
                }
                if (bb.py0 > bb.py1) {
                    t = bb.y0;
                    bb.y0 = bb.y1;
                    bb.y1 = t;
                }

                // calculate avg distances from points to the line from start to end point
                //var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
                var a = bb.py0 - bb.py1;
                var b = bb.px1 - bb.px0;
                var c = bb.px0 * bb.py1 - bb.py0 * bb.px1;
                var d = Math.sqrt(a * a + b * b);
                var dist = 0;
                var maxD = 0;
                var maxS = 1;
                for (i=0; i<len; i++) {
                    // distance to line
                    x = px[i];
                    y = py[i];
                    var dss = a * x + b * y + c;
                    var ds = Math.abs(dss) / d;
                    if (ds > maxD) {
                        maxD = ds;
                        maxS = dss > 0 ? 1 : -1;
                    }
                    dist+= ds;
                }
                bb.avgD = dist/len;
                bb.maxD = maxS * maxD;
                bb.type = bb.avgD / bb.l < 0.2 ? 'a' : 'e';
            }
        },

        getShape: function() {
            var bb = this.bb;
            var shp = null;
            if (bb.w > 0) {
                if (bb.type=='a') {
                    // draw arrow
                    shp = Granite.UI.Annotation.Shape.createArrow({
                        x0: bb.px0,
                        y0: bb.py0,
                        x1: bb.px1,
                        y1: bb.py1,
                        l: bb.l,
                        maxD: bb.maxD
                    });
                    shp.strokeStyle = this.color;
                    shp.lineWidth = 1;
                    shp.fillStyle = this.color;
                } else {
                    // draw bounding ellipse
                    var x0 = Math.min(bb.x0, bb.x1);
                    var y0 = Math.min(bb.y0, bb.y1);
                    var normBB = {
                        x0: x0,
                        y0: y0,
                        x1: x0 + bb.w,
                        y1: y0 + bb.h
                    };
                    shp = Granite.UI.Annotation.Shape.createEllipse(normBB);
                    shp.strokeStyle = this.color;
                    shp.lineWidth = 5;
                    shp.fillStyle = null;
                }
            }
            return shp;
        },

        draw: function(showWires) {
            var px = this.px;
            var py = this.py;
            var bb = this.bb;
            var ctx = this.ctx;
            if (px.length == 0 && bb.w == 0) {
                return;
            }
            if (showWires && px.length > 0) {
                // draw bounding box
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(0,255,0,0.9)';
                ctx.beginPath();
                ctx.moveTo(bb.x0, bb.y0);
                ctx.lineTo(bb.x1, bb.y0);
                ctx.lineTo(bb.x1, bb.y1);
                ctx.lineTo(bb.x0, bb.y1);
                ctx.closePath();
                ctx.stroke();
            }
            var shp = this.getShape();
            if (shp) {
                shp.draw(ctx);
            }
            if (px.length > 0) {
                // draw user input
                ctx.strokeStyle = 'rgba(128,128,128,0.8)';
                ctx.lineWidth = 5;
                ctx.lineCap = "round";
                ctx.beginPath();
                for (var i=0; i<px.length; i++) {
                    if (i==0) {
                        ctx.moveTo(px[0], py[0]);
                    } else {
                        ctx.lineTo(px[i], py[i]);
                    }
                }
                if (px.length == 1) {
                    ctx.lineTo(px[0]+1, py[0]+1);
                }
                ctx.stroke();
            }
        }

    }.constructor(arguments[0]);
};
