(function( $, undefined ) {


//todo: from jquery.mobile.listview.js >> how to handle?
//Keeps track of the number of lists per page UID
//This allows support for multiple nested list in the same page
//https://github.com/jquery/jquery-mobile/issues/1617
//var listCountPerPage = {};

$.widget( "mobile.storeview", $.mobile.listview, {
    options: {
        theme: "c",
        countTheme: "c",
        headerTheme: "b",
        dividerTheme: "b",
        splitIcon: "arrow-r",
        splitTheme: "b",
        inset: false,
        initSelector: ":jqmData(role='storeview')"
    }


});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$( $.mobile.storeview.prototype.options.initSelector, e.target ).storeview();
});

})( jQuery );
