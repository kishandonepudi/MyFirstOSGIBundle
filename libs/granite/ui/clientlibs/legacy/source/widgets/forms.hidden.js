/*
* "textinput" plugin for text inputs, textareas
*/

(function( $, undefined ) {

$.widget( "mobile.hidden", $.mobile.widget, {
	options: {
		theme: null,
		initSelector: "input[type='hidden']"
	},

    content: function( value, data, path ) {
        this._setContent( value, data, path );
        //todo: no params: get content
    },

    _setContent: function( value, data, path ) {
        this.element.val( value );
    }

});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$.mobile.hidden.prototype.enhanceWithin( e.target );
});

})( jQuery );
