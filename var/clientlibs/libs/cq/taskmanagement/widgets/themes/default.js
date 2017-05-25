/*************************************************************************
 ADOBE CONFIDENTIAL
 __________________

 Copyright $today.year Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 **************************************************************************/

/**
 * @class CQ.taskmanagement.themes.AssetEditor
 * The theme-specific constants for {@link CQ.taskmanagement.TaskEditor}.
 * @static
 * @singleton
 */
CQ.taskmanagement.themes.TaskEditor = function() {

    return {

        /**
         * The total width of the west panel's padding including the width of
         * a possible scrollbar. The panel's width will be the thumbnail width
         * plus this value. Defaults to 40.
         * @static
         * @final
         * @type Number
         */
        WEST_PANEL_PADDING_WIDTH: 40,

        /**
         * The minimum width of the west panel. Defaults to 240.
         * @static
         * @final
         * @type Number
         */
        WEST_PANEL_MIN_WIDTH: 240,

        /**
         * The width of the east panel (defaults to 245).
         * @static
         * @final
         * @type Number
         */
        EAST_PANEL_WIDTH: 400,

        /**
         * The minimum button width in pixels (defaults to 50).
         * @static
         * @final
         * @type Number
         */
        MIN_BUTTON_WIDTH: 50,

        /**
         * The width of the field labels in pixels (defaults to 150).
         * @static
         * @final
         * @type Number
         */
        LABEL_WIDTH: 130

    };

}();
