/*
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */

(function( $, undefined ) {

$.extend($.mobile.checkboxradio.prototype, {

    content: function( value, data, path ) {
        this._setContent( value, data, path );
        //todo: no params: get content
    },

    _setContent: function( value, data, path ) {
        var $el = this.element;
        if ( this.inputtype == "radio" ) {
            if ( $el.val() == value ) {
                $el.prop( "checked", true );
                this.refresh();
            }
        } else {
            // checkbox
            var deleteName = $el.attr( "name" ) + "@Delete";
            if ( $( "input[name='" + deleteName + "']").length == 0 ) {
                // first checkbox of this name: add @Delete parameter
                $el.after( "<input type='hidden' name='" + deleteName + "'/>");
            }
            var v = $el.val();
            if ( v == value || $.inArray( v, value ) != -1 ) {
                $el.prop( "checked", true );
            }
            this.refresh();
        }
    }
});

})( jQuery );
