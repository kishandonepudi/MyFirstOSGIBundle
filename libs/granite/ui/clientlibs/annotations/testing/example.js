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
jQuery(function($){

    // container around annotation target
    var $content = $("#content");

    // current annotation target. can be any element, but if it's an image, the
    // annotation plugin will listen for a load event and resize its canvas.
    var $target = $("#image");

    // setup button handlers. this is a bit verbose, but makes it clearer to
    // demonstrate the different functions
    var $menu = $("#menu");

    // open
    $menu.on("click", "button[data-toggle='open']", function() {
        // this doesn't do much than initialize the annotation. if the
        // annotation is already bound to the given element, the same instance is returned.
        var annotation = $target.annotation({
            resizeWatch: true
        });
        // if we are in chart mode, also add d2v mappings
        if ($target[0].id == "chart") {
            annotation.setV2DMapping(function(p){
                return Granite.UI.Annotation.DV_V2DMapping(p, chart);
            });
            annotation.setD2VMapping(function(p){
                return Granite.UI.Annotation.DV_D2VMapping(p, chart);
            });
        }
        annotation.open();
    });

    // close
    $menu.on("click", "button[data-toggle='close']", function() {
        // closes the annotation and removes the canvas element
        $target.annotation("close");
    });

    // save
    $menu.on("click", "button[data-toggle='save']", function() {
        var a = $target.annotation();
        if (a) {
            var str = a.toJson();
            var $li = $("<li>" + (new Date().toISOString()) + "</li>");
            $li.attr("data-annotation", str);
            $("#list").append($li);
        }
    });
    // load
    $("#list").on("click", "li", function() {
        var a = $target.annotation();
        if (a) {
            a.fromJson($(this).attr("data-annotation"));
            a.show();
        }
    });

    // show
    $menu.on("click", "button[data-toggle='show']", function() {
        // shows the canvas
        $target.annotation("show");
    });

    // hide
    $menu.on("click", "button[data-toggle='hide']", function() {
        // shows the canvas
        $target.annotation("hide");
    });

    // start
    $menu.on("click", "button[data-toggle='start']", function() {
        // starts drawing
        $target.annotation("start");
    });

    // clear
    $menu.on("click", "button[data-toggle='clear']", function() {
        // clears all shapes
        $target.annotation("clear");
    });

    // image
    $menu.on("click", "button[data-toggle='image']", function() {
        if ($target[0].id == "image") {
            return;
        }
        $target.annotation("close");
        $target.hide();
        chart = null;
        $target = $("#image");
        $target.show();
    });

    // chart
    $menu.on("click", "button[data-toggle='chart']", function() {
        if ($target[0].id == "chart") {
            return;
        }
        $target.annotation("close");
        $target.hide();
        $target = $("#chart");
        $target.show();
        renderChart();
    });

    // bind a resize event on the chart
    $("#chart").on("resize", function() {
        if (chart) {
            chart = renderChart();
        }
    });

    var chart;
    function renderChart() {
        var data = {
            x: [new Date(2012, 3, 1), new Date(2012, 3, 1), new Date(2012, 3, 1), new Date(2012, 3, 1), new Date(2012, 3, 1), new Date(2012, 3, 2), new Date(2012, 3, 2), new Date(2012, 3, 2), new Date(2012, 3, 2), new Date(2012, 3, 2), new Date(2012, 3, 3), new Date(2012, 3, 3), new Date(2012, 3, 3), new Date(2012, 3, 3), new Date(2012, 3, 3), new Date(2012, 3, 4), new Date(2012, 3, 4), new Date(2012, 3, 4), new Date(2012, 3, 4), new Date(2012, 3, 4), new Date(2012, 3, 5), new Date(2012, 3, 5), new Date(2012, 3, 5), new Date(2012, 3, 5), new Date(2012, 3, 5)],
            y: [10, 12, 15, 3, 8, 13, 7, 16, 15, 12, 13, 20, 15, 12, 7, 10, 32, 27, 12, 20, 21, 22, 23, 24, 25],
            campaign: ["s1", "s2", "s3", "s4", "s5", "s1", "s2", "s3", "s4", "s5", "s1", "s2", "s3", "s4", "s5", "s1", "s2", "s3", "s4", "s5", "s1", "s2", "s3", "s4", "s5"]
        };

        return chart = dv.chart()
                .layers([
            dv.geom.line()
        ])
                .behaviors([
            dv.behavior.inspector().size(320).thickness(1)
        ])
                .duration(0)
                .data(data)
                .map('x', 'x', dv.scale.time())
                .map('y', 'y', dv.scale.linear().lowerLimit(0))
                .map('stroke', 'campaign')
                .map('linetype', 'campaign')
                .guide("x", dv.guide.axis().tickFormat(d3.time.format("%B %e")).tickPadding(12).orientation("top").title("Date").titleOrientation("bottom"))
                .guide("y", dv.guide.axis().tickPadding(12).title("Page Views").titleOrientation("right"))
                .guide(["stroke", "linetype"], dv.guide.legend().orientation("left"))
                .set('alpha', 0.6)
                .padding({"left": 30, "top": 30, "right": 50, "bottom": 50})
                .parent('#chart')
                .render();
    }

    function updateOutput(a) {
        $("#output").html(a.toJson("  "));
    }

    // bind the annotation events

    $content.on("annotateOpen", ".target", function(e, annotation){
        // 'open' is sent after the annotation canvas is opened
        console.log("received annotateOpen event", arguments);
        $("button[data-toggle='start']").removeClass("disabled");
        $("button[data-toggle='clear']").removeClass("disabled");
        updateOutput(annotation);
    });

    $content.on("annotateClose", ".target", function(e, annotation){
        // 'close' is sent after the annotation canvas is closed
        console.log("received annotateClose event", annotation);
        $("button[data-toggle='start']").addClass("disabled");
        $("button[data-toggle='clear']").removeClass("disabled");
        // in case close is called not view the button
        $("button[data-toggle='close']").addClass("active");
        $("button[data-toggle='open']").removeClass("active");
    });

    $content.on("annotateStart", ".target", function(e, annotation){
        // 'start' is sent when the annotation-mode is started
        console.log("received annotateStart event", annotation);
        $("#message").html("<h3>Annotation-mode enabled. Draw on Canvas!</h3>").show();

    });

    $content.on("annotateBegin", ".target", function(e, annotation){
        // 'begin' is sent when a user starts drawing
        console.log("received annotateBegin event", annotation);
    });

    $content.on("annotateEnd", ".target", function(e, annotation, shape){
        // 'begin' is sent when a user ended drawing.
        console.log("received annotateEnd event", annotation, shape);
        $("#message").html("").hide();
        updateOutput(annotation);
    });
});
