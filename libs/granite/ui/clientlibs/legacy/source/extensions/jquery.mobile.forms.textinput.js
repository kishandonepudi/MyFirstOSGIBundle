/*
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */

(function( $, undefined ) {

$.extend($.mobile.textinput.prototype, {

    content: function( value, data, path ) {
        this._setContent( value, data, path );
        //todo: no params: get content
    },

    _setContent: function( value, data, path ) {
        this.element.val( value );
    }
});

})( jQuery );
