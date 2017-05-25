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

// static helpers
Granite.UI.Annotation = {

    /**
     * Default mapping from viewport to DV chart's coordinate space
     * @param p
     * @param chart the DV chart
     * @return {*}
     */
    DV_V2DMapping: function(p, chart) {
        if (chart) {
            var padding = chart.plotBounds();
            var xScale = chart.getTrainedScale('x');
            var yScale = chart.getTrainedScale('y');
            p.x = xScale.invertValue(p.x - padding.left);
            p.y = yScale.invertValue(p.y - padding.top);
        }
        return p;
    },

    /**
     * Default mapping from DV chart's to viewport coordinate space
     * @param p
     * @param chart the DV chart
     * @return {*}
     */
    DV_D2VMapping: function(p, chart) {
        if (chart) {
            var padding = chart.plotBounds();
            var xScale = chart.getTrainedScale('x');
            var yScale = chart.getTrainedScale('y');
            // hack to detect serialized dates
            if (typeof p.x === "string" && p.x.match(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.*/)) {
                p.x = new Date(p.x);
            }
            p.x = xScale.mapValue(p.x) + padding.left;
            p.y = yScale.mapValue(p.y) + padding.top;
        }
        return p;
    }

};