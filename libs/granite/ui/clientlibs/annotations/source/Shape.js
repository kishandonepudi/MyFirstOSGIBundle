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

// ensure granite namespace is setup
Granite = window.Granite || {};
Granite.UI = Granite.UI || {};

// shape to draw on canvas using SVG paths to serialize data
// http://www.w3.org/TR/SVG/paths.html
Granite.UI.Annotation.Shape = function() {

    // supported:
    // M: moveTo x,y
    // Z: closePath
    // L: lineTo x,y
    // C: bezierCurveTo x1 y1 x2 y2 x y
    // Q: quadraticCurveTo x1 y1  x y

    function cmdClosePath(ctx) {
        ctx.closePath();
    }
    function cmdMoveTo(ctx, x, y) {
        ctx.moveTo(x, y);
    }
    function cmdLineTo(ctx, x, y) {
        ctx.lineTo(x, y);
    }
    function cmdBezierTo(ctx, x0, y0, x1, y1, x, y) {
        ctx.bezierCurveTo(x0, y0, x1, y1, x, y);
    }
    function cmdQuadTo(ctx, x0, y0, x, y) {
        ctx.quadraticCurveTo(x0, y0, x, y);
    }

    function getArgs(/*Array*/ points, /*int*/ idx, /*int*/ len) {
        var ret = [null];
        for (var i=0; i<len; i++) {
            ret[i+1] = Math.round(+points[idx+i]);
        }
        return ret;
    }

    return {
        lineWidth: 1,
        strokeStyle: null,
        fillStyle: null,
        type: "",
        domainBox: null,
        box: null,
        chrs: [],
        cmds: [],
        args: [],

        constructor: function(svgPath, bb, type) {
            if (svgPath) {
                this.addPath(svgPath);
            }
            this.box = bb || {x0:0, y0:0, x1:0, y1:0};
            if (type) {
                this.type = type;
            }
            return this;
        },

        stroke: function(/*CanvasContext*/ ctx) {
            ctx.beginPath();
            this.drawPath(ctx);
            ctx.stroke();
        },

        fill: function(/*CanvasContext*/ ctx) {
            ctx.beginPath();
            this.drawPath(ctx);
            ctx.fill();
        },

        draw: function(/*CanvasContext*/ ctx) {
            ctx.save();
            ctx.translate(this.box.x0, this.box.y0);
            if (this.fillStyle) {
                ctx.fillStyle = this.fillStyle;
                this.fill(ctx);
            }
            if (this.strokeStyle) {
                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.strokeStyle;
                this.stroke(ctx);
            }
            ctx.restore();
        },

        drawPath: function(/*CanvasContext*/ ctx) {
            for (var i=0; i<this.cmds.length;i++) {
                var args = this.args[i];
                // little hack to pass the args. actually it would be easier to call the CTX directly, but we
                // can't resolve to the canvas context without an object.
                args[0] = ctx;
                this.cmds[i].apply(this, args);
                args[0] = null;
            }
        },

        toObject: function() {
            var obj = {
                path: this.toSVGPath(),
                box: this.box
            };
            if (this.strokeStyle) {
                obj.strokeStyle = this.strokeStyle;
                obj.lineWidth = this.lineWidth;
            }
            if (this.fillStyle) {
                obj.fillStyle = this.fillStyle;
            }
            if (this.domainBox) {
                obj.domainBox = this.domainBox;
            }
            if (this.type) {
                obj.type = this.type;
            }
            return obj;
        },

        clear: function() {
            this.cmds = [];
            this.args = [];
            this.chrs = [];
            this.box = {x0:0, y0:0, x1:0, y1:0};
            this.lineStyle = null;
            this.fillStyle = null;
        },

        toSVGPath: function() {
            // todo: calculate when adding commands
            var ret = "";
            for (var i=0; i<this.cmds.length; i++) {
                if (i > 0) {
                    ret += " ";
                }
                ret += this.chrs[i];
                var args = this.args[i];
                for (var j=1; j<args.length; j++) {
                    ret += " " + args[j];
                }
            }
            return ret;
        },

        addCommand: function(/*String*/ cmd, points, idx) {
            switch (cmd) {
                case "Z":
                    this.cmds.push(cmdClosePath);
                    this.args.push([null]);
                    this.chrs.push(cmd);
                    return 0;
                case "M":
                    this.cmds.push(cmdMoveTo);
                    this.args.push(getArgs(points, idx, 2));
                    this.chrs.push(cmd);
                    return 2;
                case "L":
                    this.cmds.push(cmdLineTo);
                    this.args.push(getArgs(points, idx, 2));
                    this.chrs.push(cmd);
                    return 2;
                case "C":
                    this.cmds.push(cmdBezierTo);
                    this.args.push(getArgs(points, idx, 6));
                    this.chrs.push(cmd);
                    return 6;
                case "Q":
                    this.cmds.push(cmdQuadTo);
                    this.args.push(getArgs(points, idx, 4));
                    this.chrs.push(cmd);
                    return 4;
                default:
                    console.log("unknown command", c);
                    return 0;
            }
        },

        addPath: function(/*String*/ svgPath) {
            var cs = svgPath.split(/\s+/);
            for (var i=0; i<cs.length; i++) {
                i+= this.addCommand(cs[i], cs, i+1);
            }
        }
    }.constructor(arguments[0], arguments[1], arguments[2]);
};

Granite.UI.Annotation.Shape.fromObject = function(obj, d2vMapping, scope) {
    var shp;
    if (obj.domainBox && d2vMapping) {
        // remap box to viewport
        var dBox = obj.domainBox;
        var p0 = d2vMapping.call(scope, {x: dBox.x0, y: dBox.y0});
        var p1 = d2vMapping.call(scope, {x: dBox.x1, y: dBox.y1});
        var box = {x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y};
        // create a special annotation shape
        if (obj.type == "arrow") {
            var p2 = d2vMapping.call(scope, {x: dBox.ctlx, y: dBox.ctly});
            box.ctlx = p2.x;
            box.ctly = p2.y;
            shp = Granite.UI.Annotation.Shape.createArrow(box);
        } else if (obj.type == "ellipse") {
            shp = Granite.UI.Annotation.Shape.createEllipse(box);
        }
    }
    // otherwise just create a new shape
    if (!shp) {
        shp = new Granite.UI.Annotation.Shape(obj.path, obj.box, obj.type);
    }
    if (obj.fillStyle) {
        shp.fillStyle = obj.fillStyle;
    }
    if (obj.strokeStyle) {
        shp.strokeStyle = obj.strokeStyle;
        shp.lineWidth = obj.lineWidth || 1;
    }
    if (obj.domainBox) {
        shp.domainBox = obj.domainBox;
    }
    return shp;
};

Granite.UI.Annotation.Shape.createArrow = function(bb, v2dMapping) {
    function rotate(px, py, idx, len, a) {
        var sina = Math.sin(a);
        var cosa = Math.cos(a);
        while (len-- > 0) {
            var xx = cosa * px[idx] - sina * py[idx];
            var yy = sina * px[idx] + cosa * py[idx];
            px[idx] = xx;
            py[idx++] = yy;
        }
    }

    function translate(px, py, idx, len, dx, dy) {
        while (len-- > 0) {
            px[idx] += dx;
            py[idx++] += dy;
        }
    }

    //
    //       2
    //       |\
    // 0-----1 \
    // |        3
    // 6-----5 /
    //       |/
    //       4
    if (!bb.l) {
        var pw = bb.x0 - bb.x1;
        var ph = bb.y0 - bb.y1;
        bb.l = Math.sqrt(pw*pw + ph*ph);
    }
    var scale = Math.min(1.0, bb.l / 100.0);
    var aih = 5 * scale;   // arrow inner height (p5-p1)
    var ah = 15 * scale;   // arrow height (p4-p2)
    var aw = 20 * scale;   // arrow width (p3-p1)
    var sh = 2 * scale;    // arrow base height (p6-p0)
    var acw = 3;           // arrow curve width
    var rot = Math.atan2(bb.y1-bb.y0, bb.x1-bb.x0);
    var cx,cy,ctlx,ctly,cax,cay;
    if (bb.ctlx) {
        // rotate the control points back
        cax = [ctlx = bb.ctlx];
        cay = [ctly = bb.ctly];
        rotate(cax, cay, 0, 1, -rot);
        cx = cax[0];
        cy = cay[0];
    } else {
        cx = bb.l/2;       // cubic curve control point x
        cy = bb.maxD * 2;  // cubic curve control point y
        // calculate the control point coordinates for reverse mapping
        cax = [cx];
        cay = [cy];
        rotate(cax, cay, 0, 1, rot);
        ctlx = cax[0];
        ctly = cay[0];
    }

    // tangent angle of curve into arrow
    var a = Math.atan2(-cy, bb.l-cx);

    // define the points (note p2 - p5 are still based at 0/0)
    //           p0     cp0    p1   p2  p3  p4   p5     pc1  p6
    var ax = [    0,     cx,    0,   0, aw,  0,   0,     cx, 0];
    var ay = [  -sh, cy-acw, -aih, -ah,  0, ah, aih, cy+acw, sh];

    // rotate arrow points p1-p5, centered at 0 / 0
    rotate(ax, ay, 2, 5, a);
    // and move them to the end of the line
    translate(ax, ay, 2, 5, bb.l, 0);

    // transform entire arrow along the drawing line
    rotate(ax, ay, 0, ax.length, rot);

    // translate all points to beginning of line
    //translate(ax, ay, 0, ax.length, bb.px0, bb.py0);

    // create SVG path
    var svgPath = "";
    for (var i=0; i<ax.length; i++) {
        if (i==0) {
            svgPath += "M " + ax[i] + " " + ay[i] + " ";
        } else if (i == 1 || i == 7) {
            svgPath += "Q " + ax[i] + " " + ay[i] + " " + ax[i+1] + " " + ay[i+1] + " ";
            i++;
        } else {
            svgPath += "L " + ax[i] + " " + ay[i] + " ";
        }
    }
    svgPath += "Z";
    return new Granite.UI.Annotation.Shape(svgPath, {
        x0: bb.x0,
        y0: bb.y0,
        x1: bb.x1,
        y1: bb.y1,
        ctlx: ctlx,
        ctly: ctly
    }, "arrow");
};

Granite.UI.Annotation.Shape.createEllipse = function(bb, v2dMapping) {
    var w = bb.x1-bb.x0;
    var h = bb.y1-bb.y0;
    var kappa = .5522848;
    var ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xm = w / 2,       // x-middle
            ym = h / 2;       // y-middle

    var shape = new Granite.UI.Annotation.Shape(null, bb, "ellipse");
    shape.addCommand("M", [0, ym], 0);
    shape.addCommand("C", [0, ym - oy, xm - ox, 0, xm, 0], 0);
    shape.addCommand("C", [xm + ox, 0, w, ym - oy, w, ym], 0);
    shape.addCommand("C", [w, ym + oy, xm + ox, h, xm, h], 0);
    shape.addCommand("C", [xm - ox, h, 0, ym + oy, 0, ym], 0);
    shape.addCommand("Z");
    return shape;
};