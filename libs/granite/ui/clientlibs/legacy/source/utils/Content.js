/*
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */


/**
 * A helper class providing a set of utilities.
 * @static
 * @singleton
 * @class _g.ui.Content
 */

_g.ui.Content = new function() {

    return {
        /**
         *
         * @param el
         * @param index (optional) The index of the contentform if multiple are available
         * @param success (optional) The method to call on success, defaults to _g.ui.Util.loadPage
         * _g.security.Util.authorizablesList
         */
        submit: function( el, index, success ) {
            index = index || 0;
            var page = _g.$( el ).parents( "div[data-role=\'page\']" );
            var form = _g.$( ":jqmData(role=\'contentform\')", page )[index];
            if (form) {
                success = success || function() {
                	location.hash = page.jqmData("path");
                };
                _g.ui.Util.post( form, success );
            }
        },

        getValue: function( data, name ) {
            // get "deep" values, e.g. "./profile/givenName" >> data.profile.givenName
            if (typeof name === "string") {
                name = name.split("/").reverse();
            }
            var n = name.pop();
            if ( n == "." ) {
                // skip "." level e.g. in "./profile/givenName"
                n = name.pop();
            }
            if ( name.length > 0 ) {
                if ( data[n] == undefined ) {
                    return "";
                }
                return _g.ui.Content.getValue(data[n], name);
            } else {
                if ( data[n] == undefined ) {
                    return "";
                } else {
                    return data[n];
                }
            }
        },

        _fieldContent: function( el, data, path ) {
            var $el = _g.$( el );
            try {
                // name taken from data-contentfield attribute
                var name = $el.jqmData( "content-field" );
                if (name == "") {
                    // name taken from name attribute
                    name = $el.attr( "name" );
                }
                var value = _g.ui.Content.getValue( data, name );

                // use data() because jqmData() returns undefined without properties parameter
                var d = _g.$.data(el);
                for (var i in d) {
                    if (_g.$.isFunction( d[i].content )) {
                        $el[i]( "content", value, data, path );
                        break;
                    }
                }
            } catch (e) {
//                console.log( "Error in _g.ui.Content._fieldContent: ", e.message );
            }
        },

        _containerContent: function( el, data, path ) {
            var $el = _g.$( el );
            try {
                var name = $el.jqmData( "content-container" );
                var value = _g.ui.Content.getValue( data, name );

                // use data(); jqmData() returns undefined without properties parameter
                var d = _g.$.data(el);
                // if widget has method "content" execute it ...
                var executed = false;
                for (var i in d) {
                    // check all jqm data if "content" method exists
                    // e.g. $el.textinput.content()
                    if (_g.$.isFunction( d[i].content )) {
                        $el[i]( "content", value, data, path );
                        executed = true;
                        break;
                    }
                }
                if (!executed) {
                    // ... otherwise apply "html"
                    var container = $el.jqmData( "content-selector" );
                    if ( container === undefined ) {
                        // no container specified, use el itself
                        container = $el;
                    }
                    else {
                        container = _g.$( container, $el );
                    }
                    if ($el.jqmData( "content-escape" )) {
                    	container.text( value );
                    } else {
                    	container.html( value );
                    }
                }
                var emptyClass = $el.jqmData( "content-emptyclass" );
                if ( emptyClass != undefined ) {
                    if (value == "" ) {
                        $el.addClass( emptyClass );
                    } else {
                        $el.removeClass( emptyClass );
                    }
                }

            } catch (e) {
//                console.log( "Error in _g.ui.Content._containerContent: ", e.message );
            }
        },

        _templateContent: function( el, data, path ) {
            var $el = _g.$( el );
            try {
                var template = $el.jqmData( "content-template" );
                
                var filterData = $el.jqmData( "content-escape" );
                if (filterData === undefined) {
                	filterData = true;
                }
                
                if ( $el.hasTemplate() > 0 ) {
                    // todo: is this the proper way of clearing existing data?
                	// use $el.empty()?
                    $el.html("");
                }
                $el.setTemplateElement(template, null, {filter_data: filterData});
                $el.processTemplate(data);
            } catch (e) {
//                console.log( "Error in _g.ui.Content._templateContent: ", e.message );
            }
        },

        _titleContent: function( el, data, path ) {
            var $el = _g.$( el );
            var name = $el.jqmData( "content-title" );
            var title = $el.jqmData( "title" );
            document.title = _g.Util.patchText( title, _g.ui.Content.getValue( data, name ) );
        },

        /**
         * // todo: better doc
         * Loads the content at path to the child elements of root. Elements
         * with <code>data-value</code> are considered.
         * <code>data-value</code> empty >> form field >> use name attribute >> use val()
         * otherwise >> content container >> use data-value as name >> use html()
         * @param path
         * @param root
         * @param url The URL to load the content. If undefined path + infinity.json" is used.
         */
        load: function( path, root, url ) {
            url =  _g.HTTP.externalize( url || path );
            if ( url.indexOf( ".json" ) == -1 && url.indexOf( "?") == -1 ) {
                url += ".infinity.json";
            }
            _g.$.ajax({
                url: url,
                success: function(data) {
                    // set path of new page
                    _g.$( root ).jqmData( "path", path );

                    _g.$.each( _g.$( ":jqmData(content-field)", root ), function( index, el) {
                        _g.ui.Content._fieldContent( el, data, path );
                    });
                    _g.$.each( _g.$( ":jqmData(content-container)", root ), function( index, el) {
                        _g.ui.Content._containerContent( el, data, path );
                    });
                    _g.$.each( _g.$( ":jqmData(content-template)", root ), function( index, el) {
                        _g.ui.Content._templateContent( el, data, path );
                    });
                    if (_g.$( root ).jqmData( "content-title" )) {
                        _g.ui.Content._titleContent( root, data, path );
                    }

                    _g.$.each( _g.$( ":jqmData(role='contentform')", root ),
                            function( index, el ) {
                                var $el = _g.$(el);
                                var sel = $el.jqmData( "post-selectors" );
                                if (sel) sel = "." + sel;
                                else sel = "";
                                var ext = $el.jqmData( "post-extension" );
                                ext = ext || "html";
                                _g.$(el).attr( "href", path + sel + "." + ext );
                            }
                    );
                    _g.$( root ).triggerHandler( "contentload", [ data, path ]);
                },
                error: function(data, textStatus, errorThrown) {
                    _g.$( root ).triggerHandler( "contentloadfailed", [ data, path, textStatus, errorThrown ]);
                }
            });

        }
    }
};
