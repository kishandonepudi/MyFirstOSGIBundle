/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * @class CQ.dam.themes.AssetEditor
 * The theme-specific constants for {@link CQ.dam.AssetEditor}.
 * @static
 * @singleton
 */
CQ.dam.themes.AssetEditor = function() {

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
        EAST_PANEL_WIDTH: 245,

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
