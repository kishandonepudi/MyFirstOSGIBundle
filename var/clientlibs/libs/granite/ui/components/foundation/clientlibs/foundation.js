(function ($, window, undefined) {

    $.eventSpider = (function () {
        var self = {},
            addFunc = $.event.add,
            removeFunc = $.event.remove,
            triggerFunc = $.event.trigger,
            dispatchFunc = $.event.dispatch,
            param = decodeURIComponent(window.location.search.slice(1)).split('&')
                .reduce(function _reduce(a, b) {
                    b = b.split('=');
                    a[b[0]] = b[1];
                    return a;
                }, {});

        self.storage = [];

        self.timeline = [];

        self.config = {
            autoflush: false
        };

        function out(msg, obj) {
            console.log(msg, obj);
        }

        function find(elem) {
            var ret = null;

            $.each(self.storage , function (i, e) {
                if (e.elem === elem) {
                    ret = e;

                    return false;
                }
            });

            return ret;
        }

        function add(elem, types, handler, data, selector) {
            var found = find(elem),
                event = {
                    types: types,
                    handler: handler,
                    data: data,
                    selector: selector,
                    created: new Date().getTime()
                };

            if (found) {
                found.events.push(event);
            } else {
                self.storage.push({
                    elem: elem,
                    events: [event]
                });
            }

            addFunc.apply(this, arguments); // jQuery's original

            if (self.config.autoflush) {
                out('listener added', {
                    elem: elem,
                    event: event
                });
            }
        }

        function remove(elem, types, handler, selector, mappedTypes ) {
            var found = find(elem);

            // TODO remove from storage
            if (types && !handler && !selector && !mappedTypes) { // remove all events

            }

            removeFunc.apply(this, arguments); // jQuery's original
        }

        function trigger(event, data, elem, onlyHandlers) {
            var ev = {
                event: event.type,
                originalEvent: event,
                data: data,
                elem: elem,
                onlyHandlers: onlyHandlers,
                fired: new Date().getTime()
            };

            self.timeline.push(ev);

            triggerFunc.apply(this, arguments); // jQuery's original

            if (self.config.autoflush) {
                out('event triggered', ev);
            }
        }

        function dispatch(event) {
            var ev = {
                event: event.type,
                originalEvent: event,
                fired: new Date().getTime()
            };

            self.timeline.push(ev);

            dispatchFunc.apply(this, arguments); // jQuery's original

            if (self.config.autoflush) {
                out('native event triggered', ev);
            }
        }

        self.getHandler = function (elem) {
            return find(elem);
        };

        self.getEvents = function (elem) {
            var found = self.getHandler(elem),
                events = {};

            if (found) {
                $.each(found.events, function (i, e) {
                    $.each(e.types.split(' '), function (j, f) {
                        var p = f.split('.'); //namespace parts

                        if (!events[p[0]]) {
                            events[p[0]] = [];
                        }

                        // add namespaces
                        for (var k=1; k < p.length; k++) {
                            if ($.inArray(p[k], events[p[0]]) === -1) {
                                events[p[0]].push(p[k]);
                            }
                        }
                    });
                });

                return events;
            }

            return found;
        };

        if (param.debugClientLibs) { // hook into jQuery
            if (location.hash == '#flushEvents') {
                self.config.autoflush = true;
            }

            $.event.add = add;
            $.event.remove = remove;
            $.event.trigger = trigger;
            $.event.dispatch = dispatch;
        }

        return self;
    }());

}(jQuery, this));
/**
 * History.js Core
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function(window,undefined){
	"use strict";

	// ========================================================================
	// Initialise

	// Localise Globals
	var
		console = window.console||undefined, // Prevent a JSLint complain
		document = window.document, // Make sure we are using the correct document
		navigator = window.navigator, // Make sure we are using the correct navigator
		sessionStorage = window.sessionStorage||false, // sessionStorage
		setTimeout = window.setTimeout,
		clearTimeout = window.clearTimeout,
		setInterval = window.setInterval,
		clearInterval = window.clearInterval,
		JSON = window.JSON,
		alert = window.alert,
		History = window.History = window.History||{}, // Public History Object
		history = window.history; // Old History Object

	// MooTools Compatibility
	JSON.stringify = JSON.stringify||JSON.encode;
	JSON.parse = JSON.parse||JSON.decode;

	// Check Existence
	if ( typeof History.init !== 'undefined' ) {
		throw new Error('History.js Core has already been loaded...');
	}

	// Initialise History
	History.init = function(){
		// Check Load Status of Adapter
		if ( typeof History.Adapter === 'undefined' ) {
			return false;
		}

		// Check Load Status of Core
		if ( typeof History.initCore !== 'undefined' ) {
			History.initCore();
		}

		// Check Load Status of HTML4 Support
		if ( typeof History.initHtml4 !== 'undefined' ) {
			History.initHtml4();
		}

		// Return true
		return true;
	};


	// ========================================================================
	// Initialise Core

	// Initialise Core
	History.initCore = function(){
		// Initialise
		if ( typeof History.initCore.initialized !== 'undefined' ) {
			// Already Loaded
			return false;
		}
		else {
			History.initCore.initialized = true;
		}


		// ====================================================================
		// Options

		/**
		 * History.options
		 * Configurable options
		 */
		History.options = History.options||{};

		/**
		 * History.options.hashChangeInterval
		 * How long should the interval be before hashchange checks
		 */
		History.options.hashChangeInterval = History.options.hashChangeInterval || 100;

		/**
		 * History.options.safariPollInterval
		 * How long should the interval be before safari poll checks
		 */
		History.options.safariPollInterval = History.options.safariPollInterval || 500;

		/**
		 * History.options.doubleCheckInterval
		 * How long should the interval be before we perform a double check
		 */
		History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;

		/**
		 * History.options.storeInterval
		 * How long should we wait between store calls
		 */
		History.options.storeInterval = History.options.storeInterval || 1000;

		/**
		 * History.options.busyDelay
		 * How long should we wait between busy events
		 */
		History.options.busyDelay = History.options.busyDelay || 250;

		/**
		 * History.options.debug
		 * If true will enable debug messages to be logged
		 */
		History.options.debug = History.options.debug || false;

		/**
		 * History.options.initialTitle
		 * What is the title of the initial state
		 */
		History.options.initialTitle = History.options.initialTitle || document.title;


		// ====================================================================
		// Interval record

		/**
		 * History.intervalList
		 * List of intervals set, to be cleared when document is unloaded.
		 */
		History.intervalList = [];

		/**
		 * History.clearAllIntervals
		 * Clears all setInterval instances.
		 */
		History.clearAllIntervals = function(){
			var i, il = History.intervalList;
			if (typeof il !== "undefined" && il !== null) {
				for (i = 0; i < il.length; i++) {
					clearInterval(il[i]);
				}
				History.intervalList = null;
			}
		};


		// ====================================================================
		// Debug

		/**
		 * History.debug(message,...)
		 * Logs the passed arguments if debug enabled
		 */
		History.debug = function(){
			if ( (History.options.debug||false) ) {
				History.log.apply(History,arguments);
			}
		};

		/**
		 * History.log(message,...)
		 * Logs the passed arguments
		 */
		History.log = function(){
			// Prepare
			var
				consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
				textarea = document.getElementById('log'),
				message,
				i,n,
				args,arg
				;

			// Write to Console
			if ( consoleExists ) {
				args = Array.prototype.slice.call(arguments);
				message = args.shift();
				if ( typeof console.debug !== 'undefined' ) {
					console.debug.apply(console,[message,args]);
				}
				else {
					console.log.apply(console,[message,args]);
				}
			}
			else {
				message = ("\n"+arguments[0]+"\n");
			}

			// Write to log
			for ( i=1,n=arguments.length; i<n; ++i ) {
				arg = arguments[i];
				if ( typeof arg === 'object' && typeof JSON !== 'undefined' ) {
					try {
						arg = JSON.stringify(arg);
					}
					catch ( Exception ) {
						// Recursive Object
					}
				}
				message += "\n"+arg+"\n";
			}

			// Textarea
			if ( textarea ) {
				textarea.value += message+"\n-----\n";
				textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
			}
			// No Textarea, No Console
			else if ( !consoleExists ) {
				alert(message);
			}

			// Return true
			return true;
		};


		// ====================================================================
		// Emulated Status

		/**
		 * History.getInternetExplorerMajorVersion()
		 * Get's the major version of Internet Explorer
		 * @return {integer}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 * @author James Padolsey <https://gist.github.com/527683>
		 */
		History.getInternetExplorerMajorVersion = function(){
			var result = History.getInternetExplorerMajorVersion.cached =
					(typeof History.getInternetExplorerMajorVersion.cached !== 'undefined')
				?	History.getInternetExplorerMajorVersion.cached
				:	(function(){
						var v = 3,
								div = document.createElement('div'),
								all = div.getElementsByTagName('i');
						while ( (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0] ) {}
						return (v > 4) ? v : false;
					})()
				;
			return result;
		};

		/**
		 * History.isInternetExplorer()
		 * Are we using Internet Explorer?
		 * @return {boolean}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 */
		History.isInternetExplorer = function(){
			var result =
				History.isInternetExplorer.cached =
				(typeof History.isInternetExplorer.cached !== 'undefined')
					?	History.isInternetExplorer.cached
					:	Boolean(History.getInternetExplorerMajorVersion())
				;
			return result;
		};

		/**
		 * History.emulated
		 * Which features require emulating?
		 */
		History.emulated = {
			pushState: !Boolean(
				window.history && window.history.pushState && window.history.replaceState
				&& !(
					(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
					|| (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
				)
			),
			hashChange: Boolean(
				!(('onhashchange' in window) || ('onhashchange' in document))
				||
				(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8)
			)
		};

		/**
		 * History.enabled
		 * Is History enabled?
		 */
		History.enabled = !History.emulated.pushState;

		/**
		 * History.bugs
		 * Which bugs are present
		 */
		History.bugs = {
			/**
			 * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
			 * https://bugs.webkit.org/show_bug.cgi?id=56249
			 */
			setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
			 * https://bugs.webkit.org/show_bug.cgi?id=42940
			 */
			safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
			 */
			ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),

			/**
			 * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
			 */
			hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)
		};

		/**
		 * History.isEmptyObject(obj)
		 * Checks to see if the Object is Empty
		 * @param {Object} obj
		 * @return {boolean}
		 */
		History.isEmptyObject = function(obj) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		};

		/**
		 * History.cloneObject(obj)
		 * Clones a object and eliminate all references to the original contexts
		 * @param {Object} obj
		 * @return {Object}
		 */
		History.cloneObject = function(obj) {
			var hash,newObj;
			if ( obj ) {
				hash = JSON.stringify(obj);
				newObj = JSON.parse(hash);
			}
			else {
				newObj = {};
			}
			return newObj;
		};


		// ====================================================================
		// URL Helpers

		/**
		 * History.getRootUrl()
		 * Turns "http://mysite.com/dir/page.html?asd" into "http://mysite.com"
		 * @return {String} rootUrl
		 */
		History.getRootUrl = function(){
			// Create
			var rootUrl = document.location.protocol+'//'+(document.location.hostname||document.location.host);
			if ( document.location.port||false ) {
				rootUrl += ':'+document.location.port;
			}
			rootUrl += '/';

			// Return
			return rootUrl;
		};

		/**
		 * History.getBaseHref()
		 * Fetches the `href` attribute of the `<base href="...">` element if it exists
		 * @return {String} baseHref
		 */
		History.getBaseHref = function(){
			// Create
			var
				baseElements = document.getElementsByTagName('base'),
				baseElement = null,
				baseHref = '';

			// Test for Base Element
			if ( baseElements.length === 1 ) {
				// Prepare for Base Element
				baseElement = baseElements[0];
				baseHref = baseElement.href.replace(/[^\/]+$/,'');
			}

			// Adjust trailing slash
			baseHref = baseHref.replace(/\/+$/,'');
			if ( baseHref ) baseHref += '/';

			// Return
			return baseHref;
		};

		/**
		 * History.getBaseUrl()
		 * Fetches the baseHref or basePageUrl or rootUrl (whichever one exists first)
		 * @return {String} baseUrl
		 */
		History.getBaseUrl = function(){
			// Create
			var baseUrl = History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();

			// Return
			return baseUrl;
		};

		/**
		 * History.getPageUrl()
		 * Fetches the URL of the current page
		 * @return {String} pageUrl
		 */
		History.getPageUrl = function(){
			// Fetch
			var
				State = History.getState(false,false),
				stateUrl = (State||{}).url||document.location.href,
				pageUrl;

			// Create
			pageUrl = stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/\./).test(part) ? part : part+'/';
			});

			// Return
			return pageUrl;
		};

		/**
		 * History.getBasePageUrl()
		 * Fetches the Url of the directory of the current page
		 * @return {String} basePageUrl
		 */
		History.getBasePageUrl = function(){
			// Create
			var basePageUrl = document.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/[^\/]$/).test(part) ? '' : part;
			}).replace(/\/+$/,'')+'/';

			// Return
			return basePageUrl;
		};

		/**
		 * History.getFullUrl(url)
		 * Ensures that we have an absolute URL and not a relative URL
		 * @param {string} url
		 * @param {Boolean} allowBaseHref
		 * @return {string} fullUrl
		 */
		History.getFullUrl = function(url,allowBaseHref){
			// Prepare
			var fullUrl = url, firstChar = url.substring(0,1);
			allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;

			// Check
			if ( /[a-z]+\:\/\//.test(url) ) {
				// Full URL
			}
			else if ( firstChar === '/' ) {
				// Root URL
				fullUrl = History.getRootUrl()+url.replace(/^\/+/,'');
			}
			else if ( firstChar === '#' ) {
				// Anchor URL
				fullUrl = History.getPageUrl().replace(/#.*/,'')+url;
			}
			else if ( firstChar === '?' ) {
				// Query URL
				fullUrl = History.getPageUrl().replace(/[\?#].*/,'')+url;
			}
			else {
				// Relative URL
				if ( allowBaseHref ) {
					fullUrl = History.getBaseUrl()+url.replace(/^(\.\/)+/,'');
				} else {
					fullUrl = History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');
				}
				// We have an if condition above as we do not want hashes
				// which are relative to the baseHref in our URLs
				// as if the baseHref changes, then all our bookmarks
				// would now point to different locations
				// whereas the basePageUrl will always stay the same
			}

			// Return
			return fullUrl.replace(/\#$/,'');
		};

		/**
		 * History.getShortUrl(url)
		 * Ensures that we have a relative URL and not a absolute URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getShortUrl = function(url){
			// Prepare
			var shortUrl = url, baseUrl = History.getBaseUrl(), rootUrl = History.getRootUrl();

			// Trim baseUrl
			if ( History.emulated.pushState ) {
				// We are in a if statement as when pushState is not emulated
				// The actual url these short urls are relative to can change
				// So within the same session, we the url may end up somewhere different
				shortUrl = shortUrl.replace(baseUrl,'');
			}

			// Trim rootUrl
			shortUrl = shortUrl.replace(rootUrl,'/');

			// Ensure we can still detect it as a state
			if ( History.isTraditionalAnchor(shortUrl) ) {
				shortUrl = './'+shortUrl;
			}

			// Clean It
			shortUrl = shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');

			// Return
			return shortUrl;
		};


		// ====================================================================
		// State Storage

		/**
		 * History.store
		 * The store for all session specific data
		 */
		History.store = {};

		/**
		 * History.idToState
		 * 1-1: State ID to State Object
		 */
		History.idToState = History.idToState||{};

		/**
		 * History.stateToId
		 * 1-1: State String to State ID
		 */
		History.stateToId = History.stateToId||{};

		/**
		 * History.urlToId
		 * 1-1: State URL to State ID
		 */
		History.urlToId = History.urlToId||{};

		/**
		 * History.storedStates
		 * Store the states in an array
		 */
		History.storedStates = History.storedStates||[];

		/**
		 * History.savedStates
		 * Saved the states in an array
		 */
		History.savedStates = History.savedStates||[];

		/**
		 * History.noramlizeStore()
		 * Noramlize the store by adding necessary values
		 */
		History.normalizeStore = function(){
			History.store.idToState = History.store.idToState||{};
			History.store.urlToId = History.store.urlToId||{};
			History.store.stateToId = History.store.stateToId||{};
		};

		/**
		 * History.getState()
		 * Get an object containing the data, title and url of the current state
		 * @param {Boolean} friendly
		 * @param {Boolean} create
		 * @return {Object} State
		 */
		History.getState = function(friendly,create){
			// Prepare
			if ( typeof friendly === 'undefined' ) { friendly = true; }
			if ( typeof create === 'undefined' ) { create = true; }

			// Fetch
			var State = History.getLastSavedState();

			// Create
			if ( !State && create ) {
				State = History.createStateObject();
			}

			// Adjust
			if ( friendly ) {
				State = History.cloneObject(State);
				State.url = State.cleanUrl||State.url;
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByState(State)
		 * Gets a ID for a State
		 * @param {State} newState
		 * @return {String} id
		 */
		History.getIdByState = function(newState){

			// Fetch ID
			var id = History.extractId(newState.url),
				str;
			
			if ( !id ) {
				// Find ID via State String
				str = History.getStateString(newState);
				if ( typeof History.stateToId[str] !== 'undefined' ) {
					id = History.stateToId[str];
				}
				else if ( typeof History.store.stateToId[str] !== 'undefined' ) {
					id = History.store.stateToId[str];
				}
				else {
					// Generate a new ID
					while ( true ) {
						id = (new Date()).getTime() + String(Math.random()).replace(/\D/g,'');
						if ( typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined' ) {
							break;
						}
					}

					// Apply the new State to the ID
					History.stateToId[str] = id;
					History.idToState[id] = newState;
				}
			}

			// Return ID
			return id;
		};

		/**
		 * History.normalizeState(State)
		 * Expands a State Object
		 * @param {object} State
		 * @return {object}
		 */
		History.normalizeState = function(oldState){
			// Variables
			var newState, dataNotEmpty;

			// Prepare
			if ( !oldState || (typeof oldState !== 'object') ) {
				oldState = {};
			}

			// Check
			if ( typeof oldState.normalized !== 'undefined' ) {
				return oldState;
			}

			// Adjust
			if ( !oldState.data || (typeof oldState.data !== 'object') ) {
				oldState.data = {};
			}

			// ----------------------------------------------------------------

			// Create
			newState = {};
			newState.normalized = true;
			newState.title = oldState.title||'';
			newState.url = History.getFullUrl(History.unescapeString(oldState.url||document.location.href));
			newState.hash = History.getShortUrl(newState.url);
			newState.data = History.cloneObject(oldState.data);

			// Fetch ID
			newState.id = History.getIdByState(newState);

			// ----------------------------------------------------------------

			// Clean the URL
			newState.cleanUrl = newState.url.replace(/\??\&_suid.*/,'');
			newState.url = newState.cleanUrl;

			// Check to see if we have more than just a url
			dataNotEmpty = !History.isEmptyObject(newState.data);

			// Apply
			if ( newState.title || dataNotEmpty ) {
				// Add ID to Hash
				newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');
				if ( !/\?/.test(newState.hash) ) {
					newState.hash += '?';
				}
				newState.hash += '&_suid='+newState.id;
			}

			// Create the Hashed URL
			newState.hashedUrl = History.getFullUrl(newState.hash);

			// ----------------------------------------------------------------

			// Update the URL if we have a duplicate
			if ( (History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState) ) {
				newState.url = newState.hashedUrl;
			}

			// ----------------------------------------------------------------

			// Return
			return newState;
		};

		/**
		 * History.createStateObject(data,title,url)
		 * Creates a object based on the data, title and url state params
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {object}
		 */
		History.createStateObject = function(data,title,url){
			// Hashify
			var State = {
				'data': data,
				'title': title,
				'url': url
			};

			// Expand the State
			State = History.normalizeState(State);

			// Return object
			return State;
		};

		/**
		 * History.getStateById(id)
		 * Get a state by it's UID
		 * @param {String} id
		 */
		History.getStateById = function(id){
			// Prepare
			id = String(id);

			// Retrieve
			var State = History.idToState[id] || History.store.idToState[id] || undefined;

			// Return State
			return State;
		};

		/**
		 * Get a State's String
		 * @param {State} passedState
		 */
		History.getStateString = function(passedState){
			// Prepare
			var State, cleanedState, str;

			// Fetch
			State = History.normalizeState(passedState);

			// Clean
			cleanedState = {
				data: State.data,
				title: passedState.title,
				url: passedState.url
			};

			// Fetch
			str = JSON.stringify(cleanedState);

			// Return
			return str;
		};

		/**
		 * Get a State's ID
		 * @param {State} passedState
		 * @return {String} id
		 */
		History.getStateId = function(passedState){
			// Prepare
			var State, id;
			
			// Fetch
			State = History.normalizeState(passedState);

			// Fetch
			id = State.id;

			// Return
			return id;
		};

		/**
		 * History.getHashByState(State)
		 * Creates a Hash for the State Object
		 * @param {State} passedState
		 * @return {String} hash
		 */
		History.getHashByState = function(passedState){
			// Prepare
			var State, hash;
			
			// Fetch
			State = History.normalizeState(passedState);

			// Hash
			hash = State.hash;

			// Return
			return hash;
		};

		/**
		 * History.extractId(url_or_hash)
		 * Get a State ID by it's URL or Hash
		 * @param {string} url_or_hash
		 * @return {string} id
		 */
		History.extractId = function ( url_or_hash ) {
			// Prepare
			var id,parts,url;

			// Extract
			parts = /(.*)\&_suid=([0-9]+)$/.exec(url_or_hash);
			url = parts ? (parts[1]||url_or_hash) : url_or_hash;
			id = parts ? String(parts[2]||'') : '';

			// Return
			return id||false;
		};

		/**
		 * History.isTraditionalAnchor
		 * Checks to see if the url is a traditional anchor or not
		 * @param {String} url_or_hash
		 * @return {Boolean}
		 */
		History.isTraditionalAnchor = function(url_or_hash){
			// Check
			var isTraditional = !(/[\/\?\.]/.test(url_or_hash));

			// Return
			return isTraditional;
		};

		/**
		 * History.extractState
		 * Get a State by it's URL or Hash
		 * @param {String} url_or_hash
		 * @return {State|null}
		 */
		History.extractState = function(url_or_hash,create){
			// Prepare
			var State = null, id, url;
			create = create||false;

			// Fetch SUID
			id = History.extractId(url_or_hash);
			if ( id ) {
				State = History.getStateById(id);
			}

			// Fetch SUID returned no State
			if ( !State ) {
				// Fetch URL
				url = History.getFullUrl(url_or_hash);

				// Check URL
				id = History.getIdByUrl(url)||false;
				if ( id ) {
					State = History.getStateById(id);
				}

				// Create State
				if ( !State && create && !History.isTraditionalAnchor(url_or_hash) ) {
					State = History.createStateObject(null,null,url);
				}
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByUrl()
		 * Get a State ID by a State URL
		 */
		History.getIdByUrl = function(url){
			// Fetch
			var id = History.urlToId[url] || History.store.urlToId[url] || undefined;

			// Return
			return id;
		};

		/**
		 * History.getLastSavedState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastSavedState = function(){
			return History.savedStates[History.savedStates.length-1]||undefined;
		};

		/**
		 * History.getLastStoredState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastStoredState = function(){
			return History.storedStates[History.storedStates.length-1]||undefined;
		};

		/**
		 * History.hasUrlDuplicate
		 * Checks if a Url will have a url conflict
		 * @param {Object} newState
		 * @return {Boolean} hasDuplicate
		 */
		History.hasUrlDuplicate = function(newState) {
			// Prepare
			var hasDuplicate = false,
				oldState;

			// Fetch
			oldState = History.extractState(newState.url);

			// Check
			hasDuplicate = oldState && oldState.id !== newState.id;

			// Return
			return hasDuplicate;
		};

		/**
		 * History.storeState
		 * Store a State
		 * @param {Object} newState
		 * @return {Object} newState
		 */
		History.storeState = function(newState){
			// Store the State
			History.urlToId[newState.url] = newState.id;

			// Push the State
			History.storedStates.push(History.cloneObject(newState));

			// Return newState
			return newState;
		};

		/**
		 * History.isLastSavedState(newState)
		 * Tests to see if the state is the last state
		 * @param {Object} newState
		 * @return {boolean} isLast
		 */
		History.isLastSavedState = function(newState){
			// Prepare
			var isLast = false,
				newId, oldState, oldId;

			// Check
			if ( History.savedStates.length ) {
				newId = newState.id;
				oldState = History.getLastSavedState();
				oldId = oldState.id;

				// Check
				isLast = (newId === oldId);
			}

			// Return
			return isLast;
		};

		/**
		 * History.saveState
		 * Push a State
		 * @param {Object} newState
		 * @return {boolean} changed
		 */
		History.saveState = function(newState){
			// Check Hash
			if ( History.isLastSavedState(newState) ) {
				return false;
			}

			// Push the State
			History.savedStates.push(History.cloneObject(newState));

			// Return true
			return true;
		};

		/**
		 * History.getStateByIndex()
		 * Gets a state by the index
		 * @param {integer} index
		 * @return {Object}
		 */
		History.getStateByIndex = function(index){
			// Prepare
			var State = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				State = History.savedStates[History.savedStates.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				State = History.savedStates[History.savedStates.length+index];
			}
			else {
				// Get from the beginning
				State = History.savedStates[index];
			}

			// Return State
			return State;
		};


		// ====================================================================
		// Hash Helpers

		/**
		 * History.getHash()
		 * Gets the current document hash
		 * @return {string}
		 */
		History.getHash = function(){
			var hash = History.unescapeHash(document.location.hash);
			return hash;
		};

		/**
		 * History.unescapeString()
		 * Unescape a string
		 * @param {String} str
		 * @return {string}
		 */
		History.unescapeString = function(str){
			// Prepare
			var result = str,
				tmp;

			// Unescape hash
			while ( true ) {
				tmp = window.unescape(encodeURIComponent(result));
				if ( tmp === result ) {
					break;
				}
				result = tmp;
			}

			// Return result
			return result;
		};

		/**
		 * History.unescapeHash()
		 * normalize and Unescape a Hash
		 * @param {String} hash
		 * @return {string}
		 */
		History.unescapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Unescape hash
			result = History.unescapeString(result);

			// Return result
			return result;
		};

		/**
		 * History.normalizeHash()
		 * normalize a hash across browsers
		 * @return {string}
		 */
		History.normalizeHash = function(hash){
			// Prepare
			var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');

			// Return result
			return result;
		};

		/**
		 * History.setHash(hash)
		 * Sets the document hash
		 * @param {string} hash
		 * @return {History}
		 */
		History.setHash = function(hash,queue){
			// Prepare
			var adjustedHash, State, pageUrl;

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.setHash: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.setHash,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Log
			//History.debug('History.setHash: called',hash);

			// Prepare
			adjustedHash = History.escapeHash(hash);

			// Make Busy + Continue
			History.busy(true);

			// Check if hash is a state
			State = History.extractState(hash,true);
			if ( State && !History.emulated.pushState ) {
				// Hash is a state so skip the setHash
				//History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call',arguments);

				// PushState
				History.pushState(State.data,State.title,State.url,false);
			}
			else if ( document.location.hash !== adjustedHash ) {
				// Hash is a proper hash, so apply it

				// Handle browser bugs
				if ( History.bugs.setHash ) {
					// Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249

					// Fetch the base page
					pageUrl = History.getPageUrl();

					// Safari hash apply
					History.pushState(null,null,pageUrl+'#'+adjustedHash,false);
				}
				else {
					// Normal hash apply
					document.location.hash = adjustedHash;
				}
			}

			// Chain
			return History;
		};

		/**
		 * History.escape()
		 * normalize and Escape a Hash
		 * @return {string}
		 */
		History.escapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Escape hash
			result = window.escape(result);

			// IE6 Escape Bug
			if ( !History.bugs.hashEscape ) {
				// Restore common parts
				result = result
					.replace(/\%21/g,'!')
					.replace(/\%26/g,'&')
					.replace(/\%3D/g,'=')
					.replace(/\%3F/g,'?');
			}

			// Return result
			return result;
		};

		/**
		 * History.getHashByUrl(url)
		 * Extracts the Hash from a URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getHashByUrl = function(url){
			// Extract the hash
			var hash = String(url)
				.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')
				;

			// Unescape hash
			hash = History.unescapeHash(hash);

			// Return hash
			return hash;
		};

		/**
		 * History.setTitle(title)
		 * Applies the title to the document
		 * @param {State} newState
		 * @return {Boolean}
		 */
		History.setTitle = function(newState){
			// Prepare
			var title = newState.title,
				firstState;

			// Initial
			if ( !title ) {
				firstState = History.getStateByIndex(0);
				if ( firstState && firstState.url === newState.url ) {
					title = firstState.title||History.options.initialTitle;
				}
			}

			// Apply
			try {
				document.getElementsByTagName('title')[0].innerHTML = title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
			}
			catch ( Exception ) { }
			document.title = title;

			// Chain
			return History;
		};


		// ====================================================================
		// Queueing

		/**
		 * History.queues
		 * The list of queues to use
		 * First In, First Out
		 */
		History.queues = [];

		/**
		 * History.busy(value)
		 * @param {boolean} value [optional]
		 * @return {boolean} busy
		 */
		History.busy = function(value){
			// Apply
			if ( typeof value !== 'undefined' ) {
				//History.debug('History.busy: changing ['+(History.busy.flag||false)+'] to ['+(value||false)+']', History.queues.length);
				History.busy.flag = value;
			}
			// Default
			else if ( typeof History.busy.flag === 'undefined' ) {
				History.busy.flag = false;
			}

			// Queue
			if ( !History.busy.flag ) {
				// Execute the next item in the queue
				clearTimeout(History.busy.timeout);
				var fireNext = function(){
					var i, queue, item;
					if ( History.busy.flag ) return;
					for ( i=History.queues.length-1; i >= 0; --i ) {
						queue = History.queues[i];
						if ( queue.length === 0 ) continue;
						item = queue.shift();
						History.fireQueueItem(item);
						History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
					}
				};
				History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
			}

			// Return
			return History.busy.flag;
		};

		/**
		 * History.busy.flag
		 */
		History.busy.flag = false;

		/**
		 * History.fireQueueItem(item)
		 * Fire a Queue Item
		 * @param {Object} item
		 * @return {Mixed} result
		 */
		History.fireQueueItem = function(item){
			return item.callback.apply(item.scope||History,item.args||[]);
		};

		/**
		 * History.pushQueue(callback,args)
		 * Add an item to the queue
		 * @param {Object} item [scope,callback,args,queue]
		 */
		History.pushQueue = function(item){
			// Prepare the queue
			History.queues[item.queue||0] = History.queues[item.queue||0]||[];

			// Add to the queue
			History.queues[item.queue||0].push(item);

			// Chain
			return History;
		};

		/**
		 * History.queue (item,queue), (func,queue), (func), (item)
		 * Either firs the item now if not busy, or adds it to the queue
		 */
		History.queue = function(item,queue){
			// Prepare
			if ( typeof item === 'function' ) {
				item = {
					callback: item
				};
			}
			if ( typeof queue !== 'undefined' ) {
				item.queue = queue;
			}

			// Handle
			if ( History.busy() ) {
				History.pushQueue(item);
			} else {
				History.fireQueueItem(item);
			}

			// Chain
			return History;
		};

		/**
		 * History.clearQueue()
		 * Clears the Queue
		 */
		History.clearQueue = function(){
			History.busy.flag = false;
			History.queues = [];
			return History;
		};


		// ====================================================================
		// IE Bug Fix

		/**
		 * History.stateChanged
		 * States whether or not the state has changed since the last double check was initialised
		 */
		History.stateChanged = false;

		/**
		 * History.doubleChecker
		 * Contains the timeout used for the double checks
		 */
		History.doubleChecker = false;

		/**
		 * History.doubleCheckComplete()
		 * Complete a double check
		 * @return {History}
		 */
		History.doubleCheckComplete = function(){
			// Update
			History.stateChanged = true;

			// Clear
			History.doubleCheckClear();

			// Chain
			return History;
		};

		/**
		 * History.doubleCheckClear()
		 * Clear a double check
		 * @return {History}
		 */
		History.doubleCheckClear = function(){
			// Clear
			if ( History.doubleChecker ) {
				clearTimeout(History.doubleChecker);
				History.doubleChecker = false;
			}

			// Chain
			return History;
		};

		/**
		 * History.doubleCheck()
		 * Create a double check
		 * @return {History}
		 */
		History.doubleCheck = function(tryAgain){
			// Reset
			History.stateChanged = false;
			History.doubleCheckClear();

			// Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
			// Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940
			if ( History.bugs.ieDoubleCheck ) {
				// Apply Check
				History.doubleChecker = setTimeout(
					function(){
						History.doubleCheckClear();
						if ( !History.stateChanged ) {
							//History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);
							// Re-Attempt
							tryAgain();
						}
						return true;
					},
					History.options.doubleCheckInterval
				);
			}

			// Chain
			return History;
		};


		// ====================================================================
		// Safari Bug Fix

		/**
		 * History.safariStatePoll()
		 * Poll the current state
		 * @return {History}
		 */
		History.safariStatePoll = function(){
			// Poll the URL

			// Get the Last State which has the new URL
			var
				urlState = History.extractState(document.location.href),
				newState;

			// Check for a difference
			if ( !History.isLastSavedState(urlState) ) {
				newState = urlState;
			}
			else {
				return;
			}

			// Check if we have a state with that url
			// If not create it
			if ( !newState ) {
				//History.debug('History.safariStatePoll: new');
				newState = History.createStateObject();
			}

			// Apply the New State
			//History.debug('History.safariStatePoll: trigger');
			History.Adapter.trigger(window,'popstate');

			// Chain
			return History;
		};


		// ====================================================================
		// State Aliases

		/**
		 * History.back(queue)
		 * Send the browser history back one item
		 * @param {Integer} queue [optional]
		 */
		History.back = function(queue){
			//History.debug('History.back: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.back: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.back,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.back(false);
			});

			// Go back
			history.go(-1);

			// End back closure
			return true;
		};

		/**
		 * History.forward(queue)
		 * Send the browser history forward one item
		 * @param {Integer} queue [optional]
		 */
		History.forward = function(queue){
			//History.debug('History.forward: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.forward: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.forward,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.forward(false);
			});

			// Go forward
			history.go(1);

			// End forward closure
			return true;
		};

		/**
		 * History.go(index,queue)
		 * Send the browser history back or forward index times
		 * @param {Integer} queue [optional]
		 */
		History.go = function(index,queue){
			//History.debug('History.go: called', arguments);

			// Prepare
			var i;

			// Handle
			if ( index > 0 ) {
				// Forward
				for ( i=1; i<=index; ++i ) {
					History.forward(queue);
				}
			}
			else if ( index < 0 ) {
				// Backward
				for ( i=-1; i>=index; --i ) {
					History.back(queue);
				}
			}
			else {
				throw new Error('History.go: History.go requires a positive or negative integer passed.');
			}

			// Chain
			return History;
		};


		// ====================================================================
		// HTML5 State Support

		// Non-Native pushState Implementation
		if ( History.emulated.pushState ) {
			/*
			 * Provide Skeleton for HTML4 Browsers
			 */

			// Prepare
			var emptyFunction = function(){};
			History.pushState = History.pushState||emptyFunction;
			History.replaceState = History.replaceState||emptyFunction;
		} // History.emulated.pushState

		// Native pushState Implementation
		else {
			/*
			 * Use native HTML5 History API Implementation
			 */

			/**
			 * History.onPopState(event,extra)
			 * Refresh the Current State
			 */
			History.onPopState = function(event,extra){
				// Prepare
				var stateId = false, newState = false, currentHash, currentState;

				// Reset the double check
				History.doubleCheckComplete();

				// Check for a Hash, and handle apporiatly
				currentHash	= History.getHash();
				if ( currentHash ) {
					// Expand Hash
					currentState = History.extractState(currentHash||document.location.href,true);
					if ( currentState ) {
						// We were able to parse it, it must be a State!
						// Let's forward to replaceState
						//History.debug('History.onPopState: state anchor', currentHash, currentState);
						History.replaceState(currentState.data, currentState.title, currentState.url, false);
					}
					else {
						// Traditional Anchor
						//History.debug('History.onPopState: traditional anchor', currentHash);
						History.Adapter.trigger(window,'anchorchange');
						History.busy(false);
					}

					// We don't care for hashes
					History.expectedStateId = false;
					return false;
				}

				// Ensure
				stateId = History.Adapter.extractEventData('state',event,extra) || false;

				// Fetch State
				if ( stateId ) {
					// Vanilla: Back/forward button was used
					newState = History.getStateById(stateId);
				}
				else if ( History.expectedStateId ) {
					// Vanilla: A new state was pushed, and popstate was called manually
					newState = History.getStateById(History.expectedStateId);
				}
				else {
					// Initial State
					newState = History.extractState(document.location.href);
				}

				// The State did not exist in our store
				if ( !newState ) {
					// Regenerate the State
					newState = History.createStateObject(null,null,document.location.href);
				}

				// Clean
				History.expectedStateId = false;

				// Check if we are the same state
				if ( History.isLastSavedState(newState) ) {
					// There has been no change (just the page's hash has finally propagated)
					//History.debug('History.onPopState: no change', newState, History.savedStates);
					History.busy(false);
					return false;
				}

				// Store the State
				History.storeState(newState);
				History.saveState(newState);

				// Force update of the title
				History.setTitle(newState);

				// Fire Our Event
				History.Adapter.trigger(window,'statechange');
				History.busy(false);

				// Return true
				return true;
			};
			History.Adapter.bind(window,'popstate',History.onPopState);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url,queue){
				//History.debug('History.pushState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.pushState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.pushState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.pushState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End pushState closure
				return true;
			};

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url,queue){
				//History.debug('History.replaceState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.replaceState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.replaceState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.replaceState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End replaceState closure
				return true;
			};

		} // !History.emulated.pushState


		// ====================================================================
		// Initialise

		/**
		 * Load the Store
		 */
		if ( sessionStorage ) {
			// Fetch
			try {
				History.store = JSON.parse(sessionStorage.getItem('History.store'))||{};
			}
			catch ( err ) {
				History.store = {};
			}

			// Normalize
			History.normalizeStore();
		}
		else {
			// Default Load
			History.store = {};
			History.normalizeStore();
		}

		/**
		 * Clear Intervals on exit to prevent memory leaks
		 */
		History.Adapter.bind(window,"beforeunload",History.clearAllIntervals);
		History.Adapter.bind(window,"unload",History.clearAllIntervals);

		/**
		 * Create the initial State
		 */
		History.saveState(History.storeState(History.extractState(document.location.href,true)));

		/**
		 * Bind for Saving Store
		 */
		if ( sessionStorage ) {
			// When the page is closed
			History.onUnload = function(){
				// Prepare
				var	currentStore, item;

				// Fetch
				try {
					currentStore = JSON.parse(sessionStorage.getItem('History.store'))||{};
				}
				catch ( err ) {
					currentStore = {};
				}

				// Ensure
				currentStore.idToState = currentStore.idToState || {};
				currentStore.urlToId = currentStore.urlToId || {};
				currentStore.stateToId = currentStore.stateToId || {};

				// Sync
				for ( item in History.idToState ) {
					if ( !History.idToState.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.idToState[item] = History.idToState[item];
				}
				for ( item in History.urlToId ) {
					if ( !History.urlToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.urlToId[item] = History.urlToId[item];
				}
				for ( item in History.stateToId ) {
					if ( !History.stateToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.stateToId[item] = History.stateToId[item];
				}

				// Update
				History.store = currentStore;
				History.normalizeStore();

				// Store
				sessionStorage.setItem('History.store',JSON.stringify(currentStore));
			};

			// For Internet Explorer
			History.intervalList.push(setInterval(History.onUnload,History.options.storeInterval));
			
			// For Other Browsers
			History.Adapter.bind(window,'beforeunload',History.onUnload);
			History.Adapter.bind(window,'unload',History.onUnload);
			
			// Both are enabled for consistency
		}

		// Non-Native pushState Implementation
		if ( !History.emulated.pushState ) {
			// Be aware, the following is only for native pushState implementations
			// If you are wanting to include something for all browsers
			// Then include it above this if block

			/**
			 * Setup Safari Fix
			 */
			if ( History.bugs.safariPoll ) {
				History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));
			}

			/**
			 * Ensure Cross Browser Compatibility
			 */
			if ( navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName||'') === 'Mozilla' ) {
				/**
				 * Fix Safari HashChange Issue
				 */

				// Setup Alias
				History.Adapter.bind(window,'hashchange',function(){
					History.Adapter.trigger(window,'popstate');
				});

				// Initialise Alias
				if ( History.getHash() ) {
					History.Adapter.onDomLoad(function(){
						History.Adapter.trigger(window,'hashchange');
					});
				}
			}

		} // !History.emulated.pushState


	}; // History.initCore

	// Try and Initialise History
	History.init();

})(window);
/**
 * History.js jQuery Adapter
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

// Closure
(function(window,undefined){
	"use strict";

	// Localise Globals
	var
		History = window.History = window.History||{},
		jQuery = window.jQuery;

	// Check Existence
	if ( typeof History.Adapter !== 'undefined' ) {
		throw new Error('History.js Adapter has already been loaded...');
	}

	// Add the Adapter
	History.Adapter = {
		/**
		 * History.Adapter.bind(el,event,callback)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @param {function} callback
		 * @return {void}
		 */
		bind: function(el,event,callback){
			jQuery(el).bind(event,callback);
		},

		/**
		 * History.Adapter.trigger(el,event)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @param {Object=} extra - a object of extra event data (optional)
		 * @return {void}
		 */
		trigger: function(el,event,extra){
			jQuery(el).trigger(event,extra);
		},

		/**
		 * History.Adapter.extractEventData(key,event,extra)
		 * @param {string} key - key for the event data to extract
		 * @param {string} event - custom and standard events
		 * @param {Object=} extra - a object of extra event data (optional)
		 * @return {mixed}
		 */
		extractEventData: function(key,event,extra){
			// jQuery Native then jQuery Custom
			var result = (event && event.originalEvent && event.originalEvent[key]) || (extra && extra[key]) || undefined;

			// Return
			return result;
		},

		/**
		 * History.Adapter.onDomLoad(callback)
		 * @param {function} callback
		 * @return {void}
		 */
		onDomLoad: function(callback) {
			jQuery(callback);
		}
	};

	// Try and Initialise History
	if ( typeof History.init !== 'undefined' ) {
		History.init();
	}

})(window);

/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
Granite = window.Granite || {};
Granite.UI = Granite.UI || {};
Granite.UI.Foundation = Granite.UI.Foundation || {};

(function(document, $) {
    "use strict";

    // Wraps cui-contentloaded event
    
    $(document).on("cui-contentloaded.foundation", function(e, options) {
        if (options && options._foundationcontentloaded) return;
        
        $(e.target).trigger("foundation-contentloaded", {
            _cuicontentloaded: true
        });
    });
    
    $(document).on("foundation-contentloaded.foundation", function(e, options) {
        if (options && options._cuicontentloaded) return;
        
        $(e.target).trigger("cui-contentloaded", {
            _foundationcontentloaded: true
        });
    });
})(window.document, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, undefined) {
    "use strict";
    
    /**
     * @namespace
     */
    Granite.UI.Foundation.Utils = Granite.UI.Foundation.Utils || (function() {
        var existingScripts = [];
        
        var removeEl = function(newContent, selector, comparator, existings) {
            existings = existings || $(selector);
            
            newContent.find(selector).each(function() {
                var item = this;
                if (existings.is(function() { return comparator(this, item); })) {
                    $(item).remove();
                }
            });
        };
        
        /**
         * Merge array2 into array1.
         * 
         * @returns array1
         */
        var mergeScript = function(array1, array2) {
            if (array1.length === 0) {
                $.each(array2, function() {
                    if ($(this).prop("src")) {
                        array1.push(this);
                    }
                });
                return array1;
            }
            
            $.each(array2, function() {
                var a2 = this;
                var a2src = $(a2).prop("src");
                
                if (!a2src) return;
                
                var found = false;
                
                $.each(array1, function() {
                    var a1src = $(this).prop("src");
                    if (a1src === a2src) {
                        found = true;
                        return false;
                    }
                });
                
                if (!found) {
                    array1.push(a2);
                }
            });
            return array1;
        };
        
        /**
         * @scope Granite.UI.Foundation.Utils
         */
        return {
            /**
             * Process the given html so that it is suitable to be injected to the DOM.
             * Currently this method is trying to clean up against duplicate js and css that are already loaded.
             * 
             * @param {String|jQuery} html
             * @param {String} [selector] Only extract out the html under the given selector (inclusive). If no element matchs the selector or this parameter is falsy then html is process as is.  
             * @returns {String|jQuery} The result of the process
             */
            processHtml: function(html, selector) {
                var container;
                if (html.jquery) {
                    container = html;
                } else {
                    var div = document.createElement("div");
                    div.innerHTML = html;
                    container = $(div);
                }
                
                removeEl(container, "script", function(oldEl, newEl) {
                    var newSrc = $(newEl).prop("src");
                    
                    // TODO decide what to do with inline script
                    // this is mainly CQURLInfo, and will cause issue if the component depend on it and the value is overwritten
                    // for now just include it
                    if (!newSrc) return false;

                    return $(oldEl).prop("src") === newSrc;
                    
                }, $(mergeScript(existingScripts, $("script"))));
                
                removeEl(container, "link", function(oldEl, newEl) {
                    var oldLink = $(oldEl);
                    var newLink = $(newEl);
                    
                    if (oldLink.prop("rel") !== "stylesheet" || newLink.prop("rel") !== "stylesheet") {
                        return false;
                    } else {
                        return oldLink.prop("href") === newLink.prop("href");
                    }
                });
                
                var content = container.find(selector);
                
                if (html.jquery) {
                    if (selector) {
                        return content.length ? content : container;
                    } else {
                        return container;
                    }
                } else {
                    if (selector) {
                        return content.length ? content[0].outerHTML : container[0].innerHTML;
                    } else {
                        return container[0].innerHTML;
                    }
                }
            }
        };
    })();
})(document, Granite, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(Granite, $) {
    "use strict";
    
    Granite.UI.Foundation.Adapters = Granite.UI.Foundation.Adapters || (function() {
        function Registry() {
            this.map = {};
        }
        Registry.prototype = {
            /**
             * Registers an adapter for the given type and selector.
             * @param String type
             * @param String selector
             * @param Function adapter
             */
            register: function(type, selector, adapter) {
                this.map[type] = {
                    type: type,
                    selector: selector,
                    adapter: adapter
                };
            },
            /**
             * Checks if the registry has an adapter with the given type.
             * @param String type
             */
            has: function(type) {
                return this.map.hasOwnProperty(type);
            },
            /**
             * Returns adapter config for the given type.
             * The config is an object having the following properties:
             * type: String
             * selector: String
             * adapter: Function
             * 
             * @param String type
             */
            get: function(type) {
                return this.has(type) ? this.map[type] : undefined;
            },
            /**
             * Adapts the given element to the given type.
             * Only the element matching the selector--specified during adapter registration--will be adapted.
             * Returns undefined when there is no matching adapter.
             * 
             * @param DOMElement el
             * @param String type
             */
            adapt: function(el, type) {
                var $el = $(el);
                
                return $el.data(type) || (function($el, config) {
                    if (!config) return;
                    
                    if ($el.is(config.selector)) {
                        var api = config.adapter(el[0]);
                        $el.data(config.type, api);
                        return api;
                    }
                })($el, this.get(type));
            }
        };
        
        return new Registry();
    })();
    
    /**
     * Returns the API related to the type for the first element in the jQuery collection.
     * e.g.
     * var collectionAPI = $(".foundation-collection").adaptTo("foundation-collection");
     * 
     * @param String type The type the current element will be adapted to.
     */
    $.fn.adaptTo = $.fn.adaptTo || function(type) {
        return Granite.UI.Foundation.Adapters.adapt(this, type);
    };
})(Granite, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, undefined) {
    "use strict";
    
    Granite.UI.Foundation.Layouts = Granite.UI.Foundation.Layouts || (function() {
        function Registry() {
            this.layouter = {};
            this.cleaner = {};
        }
        Registry.prototype = {
            register: function(name, layouter, cleaner) {
                this.layouter[name] = layouter;
                this.cleaner[name] = cleaner;
            },
            has: function(name) {
                return this.layouter.hasOwnProperty(name);
            },
            hasCleaner: function(name) {
                return this.cleaner.hasOwnProperty(name);
            },
            get: function(name) {
                return this.has(name) ? this.layouter[name] : undefined;
            },
            getCleaner: function(name) {
                return this.hasCleaner(name) ? this.cleaner[name] : undefined;
            },
            layout: function(el) {
                var $el = $(el);
                var config = $el.data("foundationLayout");
                var layouter = this.get(config.name);
                if (layouter) {
                    layouter(el, config);
                }

                // show the right toggle button
                this.displayToggle($el.data("foundationLayout"));
            },
            displayToggle: function (layout) {
                var $toggleCon = $('.foundation-admin-layouttoggle'),
                    $buttons = $toggleCon.find('button');

                $buttons.each(function (i, e) {
                    var $e = $(e),
                        layoutToggle = $e.data('foundation-admin-layouttoggle-layout');

                    if (layoutToggle.name !== layout.name) {
                        $e.removeClass("hide");
                    } else {
                        $e.addClass("hide");
                    }
                });
            },
            switchLayout: function(el, newConfig) {
                var $el = $(el),
                    prevConfig = $el.data("foundationLayout");

                if (prevConfig.name === newConfig.name) {
                    return;
                }
                
                if (prevConfig) {
                    (this.getCleaner(prevConfig.name) || this.clean)(el, prevConfig);
                }
                
                $el.addClass(newConfig.name);
                $el.data("foundationLayout", newConfig);
                this.layout(el);
            },
            clean: function(el) {
                var $el = $(el);
                var config = $el.data("foundationLayout");
                $el.removeClass(config.name);
                $el.data("foundationLayout", null);
            }
        };
        
        return new Registry();
    })();
    
    $(document).on("foundation-contentloaded.foundation-layout", function(e) {
        $(e.target).filter("[data-foundation-layout]").add($("[data-foundation-layout]", e.target)).each(function() {
            Granite.UI.Foundation.Layouts.layout(this);
        });
    });
})(document, Granite, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, CUI) {
    "use strict";
    
    // NOTE: foundation-layout-card is now exclusive to manage the layout of foundation-collection only
    
    var ns = ".foundation-layout-card";
    
    function addListener(collection) {
        $(document).on("foundation-mode-change" + ns, function(e, mode, group) {
            if (mode !== "default" && mode !== "selection") return;
            if (collection.data("foundationModeGroup") !== group) return;

            CUI.CardView.get(collection).setGridSelectionMode(mode === "selection");
            collection.closest(".foundation-collection-container").toggleClass("mode-selection", mode === "selection");
        });

        collection.on("change:selection" + ns, function(e) {
            collection.trigger("foundation-selections-change");
        });
    }
    
    function removeListener(collection) {
        $(document).off("foundation-mode-change" + ns);
        collection.off("change:selection" + ns);
    }
    
    Granite.UI.Foundation.Layouts.register("foundation-layout-card", function(el, config) {

        var collection = $(el);
        
        if (collection.hasClass("grid")) return;

        collection.wrapInner("<div class='grid-0'>");
        collection.closest(".foundation-collection-container").addClass("card");

        collection.cardView({
            "selectorConfig": {
                "itemSelector": ".foundation-collection-item",
                "headerSelector": "header",
                "dataContainer": "grid-0",
                "enableImageMultiply": true,
                "view": {
                    "selectedItem": {
                        "list": {
                            "cls": "foundation-selections-item selected"
                        },
                        "grid": {
                            "cls": "foundation-selections-item selected"
                        }
                    },
                    "selectedItems": {
                        "list": {
                            "selector": ".foundation-selections-item"
                        },
                        "grid": {
                            "selector": ".foundation-selections-item"
                        }
                    }
                },
                "controller": {
                    "selectElement": {
                        "list": ".foundation-collection-item .select",
                        "grid": ".foundation-collection-item"
                    },
                    "moveHandleElement": {
                        "list": ".foundation-collection-item > .move"
                    },
                    "targetToItem": {
                        "list": function($target) {
                            return $target.closest(".foundation-collection-item");
                        },
                        "grid": function($target) {
                            return $target.closest(".foundation-collection-item");
                        },
                        "header": function($target) {
                            return $target.closest("header");
                        }
                    },
                    "gridSelect": {
                        "cls": "mode-selection"
                    },
                    "selectAll": {
                        "selector": "header > i.select",
                        "cls": "selected"
                    }
                }
            }
        });

        CUI.CardView.get(collection).setDisplayMode(CUI.CardView.DISPLAY_GRID);
        addListener(collection);

        if (config.selectionMode) {
            CUI.CardView.get(collection).setGridSelectionMode(true);
        }
        
        var selectionMode = collection.data("foundationSelectionsMode");
        if (selectionMode) {
            CUI.CardView.get(collection).setSelectionModeCount(selectionMode);
        }
    }, function(el, config) {
        Granite.UI.Foundation.Layouts.clean(el);

        var collection = $(el);
        collection.closest(".foundation-collection-container").removeClass("card");
        removeListener(collection);
    });
})(document, Granite, Granite.$, CUI);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, CUI) {
    "use strict";
    
    // NOTE: foundation-layout-list is now exclusive to manage the layout of foundation-collection only
    
    var ns = ".foundation-layout-list";
    
    function getSameGroupEl(type, groupName) {
        if (groupName) {
            return $("." + type + "[data-foundation-mode-group~='" + groupName + "'], ." + type + ":not([data-foundation-mode-group])");
        } else {
            return $("." + type);
        }
    }

    function addListener(collection) {
        var selectionApi = collection.adaptTo("foundation-selections");
        var group = collection.data("foundationModeGroup");
        
        collection.on("change:selection" + ns, function(e) {
            collection.trigger("foundation-selections-change");
            
            var beforeCount = collection.data("foundation-layout-list.internal.beforeCount") || 0;
            var afterCount = selectionApi.count();
            
            if (beforeCount === 0 && afterCount > 0) {
                collection.trigger("foundation-mode-change", ["selection", group]);
            } else if (beforeCount > 0 && afterCount === 0) {
                collection.trigger("foundation-mode-change", ["default", group]);
            }
            
            collection.data("foundation-layout-list.internal.beforeCount", afterCount);
        });
    }
    
    function removeListener(collection) {
        collection.off("change:selection" + ns);
        collection.data("foundation-layout-list.internal.beforeCount", undefined);
    }

    Granite.UI.Foundation.Layouts.register("foundation-layout-list", function(el, config) {
        var collection = $(el);
        
        if (collection.hasClass("list")) return;

        var group = collection.data("foundationModeGroup");
        
        // TODO Currently using inline style so that it override the display but still easily removed without interfering existing classes
        // Need to think how to do it in more foolproof way
        getSameGroupEl("foundation-mode-change", group).css("display", "none"); 

        if (!collection.data("cardView")) {
            //bootstrap collection before applying plugin
            collection.addClass("list");
            collection.wrapInner("<div class='grid-0'>");
        }

        collection.cardView({
            "selectorConfig": {
                "itemSelector": ".foundation-collection-item",
                "headerSelector": "header",
                "dataContainer": "grid-0",
                "enableImageMultiply": true,
                "view": {
                    "selectedItem": {
                        "list": {
                            "cls": "foundation-selections-item selected"
                        },
                        "grid": {
                            "cls": "foundation-selections-item selected"
                        }
                    },
                    "selectedItems": {
                        "list": {
                            "selector": ".foundation-selections-item"
                        },
                        "grid": {
                            "selector": ".foundation-selections-item"
                        }
                    }
                },
                "controller": {
                    "selectElement": {
                        "list": ".foundation-collection-item .select",
                        "grid": ".foundation-collection-item"
                    },
                    "moveHandleElement": {
                        "list": ".foundation-collection-item > .move"
                    },
                    "targetToItem": {
                        "list": function($target) {
                            return $target.closest(".foundation-collection-item");
                        },
                        "grid": function($target) {
                            return $target.closest(".foundation-collection-item");
                        },
                        "header": function($target) {
                            return $target.closest("header");
                        }
                    },
                    "gridSelect": {
                        "cls": "mode-selection"
                    },
                    "selectAll": {
                        "selector": "header > i.select",
                        "cls": "selected"
                    }
                }
            }
        });
        CUI.CardView.get(collection).setDisplayMode(CUI.CardView.DISPLAY_LIST);
        addListener(collection);
        
        var selectionMode = collection.data("foundationSelectionsMode");
        if (selectionMode) {
            CUI.CardView.get(collection).setSelectionModeCount(selectionMode);
        }

    }, function(el, config) {
        Granite.UI.Foundation.Layouts.clean(el);
        
        var collection = $(el);
        
        var group = collection.data("foundationModeGroup");
        getSameGroupEl("foundation-mode-change", group).css("display", "");
        
        removeListener(collection);
    });
})(document, Granite, Granite.$, CUI);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, undefined) {
    "use strict";
    
    function isGroup(el, config, groupName) {
        if (groupName) {
            return config.group === groupName;
        } else {
            return true;
        }
    }
    
    Granite.UI.Foundation.Layouts.register("foundation-layout-mode", function(el, config) {
        var container = $(el);
        
        $(document).on("foundation-mode-change.foundation-layout-mode", function(e, mode, group) {
            if (!isGroup(container, config, group)) return;

            container.children(":not(.mode-" + mode + ")").addClass("hide").removeClass("show");
            container.children(".mode-" + mode).addClass("show").removeClass("hide");
        });        
    });
})(document, Granite, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, document, Granite, $) {
    "use strict";
    
    // NOTE: foundation-layout-wizard is now exclusive to manage the layout of foundation-wizard only
    
    var ns = ".foundation-layout-wizard";
    
    function overrideLeftButtons(step, nav) {
        var overrides = step.find(".foundation-wizard-control").map(function() {
            var control = $(this);
            var action = control.data("foundationWizardControlAction");
            
            if (action !== "prev" && action !== "cancel") return;
            
            control.addClass("hidden");
            return control.clone().removeClass("hidden").addClass("back").data("foundation-wizard-control.internal.clone", true)[0];
        });
        
        var left = nav.find(".left");
        left.children().detach().each(function() {
            var el = $(this);
            if (el.data("foundation-wizard-control.internal.clone")) {
                el.remove();
            }
        });
        
        if (overrides.length) {
            left.append(overrides);
        } else {
            left.append(nav.data("foundation-wizard-nav.internal.left"));
        }
    }
    
    function overrideRightButtons(step, nav) {
        var overrides = step.find(".foundation-wizard-control").map(function() {
            var control = $(this);
            var action = control.data("foundationWizardControlAction");
            
            if (action !== "next") return;
            
            control.addClass("hidden");
            return control.clone().removeClass("hidden").addClass("next").data("foundation-wizard-control.internal.clone", true)[0];
        });
        
        var right = nav.find(".right");
        right.children().detach().each(function() {
            var el = $(this);
            if (el.data("foundation-wizard-control.internal.clone")) {
                el.remove();
            }
        });
        
        if (overrides.length) {
            right.append(overrides);
        } else {
            right.append(nav.data("foundation-wizard-nav.internal.right"));
        }
    }
    
    function showStep(wizard, index) {
        var steps = wizard.children(".foundation-wizard-step");
        var step = steps.eq(index);
        
        if (!step.length) return;
        
        var nav = wizard.find("nav");
        
        nav.find("ol li").eq(index)
            .prevAll().removeClass("active").addClass("stepped")
            .end()
            .addClass("active")
                .nextAll().andSelf().removeClass("stepped");
        
        overrideLeftButtons(step, nav);
        overrideRightButtons(step, nav);
        
        steps.filter(".active").removeClass("active");
        step.addClass("active");
        
        wizard.trigger("foundation-wizard-stepchange", step[0]);
    }
    
    function prev(wizard) {
        var steps = wizard.children(".foundation-wizard-step");
        var active = steps.filter(".active");
        var step = active.prev(".foundation-wizard-step");
        
        if (!step.length) return;
        
        var nav = wizard.find("nav");
        
        nav.find("ol li.active").removeClass("active")
            .prev().addClass("active").removeClass("stepped");
        
        overrideLeftButtons(step, nav);
        overrideRightButtons(step, nav);
        
        active.removeClass("active");
        step.addClass("active");
        
        wizard.trigger("foundation-wizard-stepchange", step[0]);
    }
    
    function next(wizard) {
        var steps = wizard.children(".foundation-wizard-step");
        var active = steps.filter(".active");
        var step = active.next(".foundation-wizard-step");
        
        if (!step.length) return;
        
        var nav = wizard.find("nav");
        
        nav.find("ol li.active").removeClass("active").addClass("stepped")
            .next().addClass("active");
        
        overrideLeftButtons(step, nav);
        overrideRightButtons(step, nav);
        
        active.removeClass("active");
        step.addClass("active");
        
        wizard.trigger("foundation-wizard-stepchange", step[0]);
    }
    
    // We are not using CUI.Wizard here as it is very difficult to do HATEOAS currently
    // e.g. you cannot use your own <button>
    // So we just reuse the styling and fix CUI.Wizard later on.
    function enhance(wizard) {
        var nav = wizard.find("nav");
        nav.find("ol li").eq(0).append("<div class='lead-fill'></div>");
        
        nav.data("foundation-wizard-nav.internal.left", nav.find(".left").children());
        nav.data("foundation-wizard-nav.internal.right", nav.find(".right").children());
        
        // Show step in the next tick to allow others add listener to the wizard
        window.setTimeout(function() {
            showStep(wizard, 0);
        }, 0);
    }
    
    function addListener(wizard) {
        wizard.fipo("tap" + ns, "click" + ns, ".foundation-wizard-control", function(e) {
            var control = $(this);
            var action = control.data("foundationWizardControlAction");
            
            if (action === "next") {
                next(wizard);
            } else if (action === "prev") {
                prev(wizard);
            }
        });
    }
    
    function removeListener(wizard) {
        wizard.off(ns);
    }
    
    Granite.UI.Foundation.Layouts.register("foundation-layout-wizard", function(el, config) {
        var wizard = $(el);
        
        if (!wizard.is(".foundation-wizard")) return;
        
        enhance(wizard);
        addListener(wizard);
        
    }, function(el, config) {
        Granite.UI.Foundation.Layouts.clean(el);

        var wizard = $(el);
        removeListener(wizard);
    });
})(window, document, Granite, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, undefined) {
    "use strict";
    
    $(document).on("click.foundation-content", ".foundation-content-control", function(e) {
        e.preventDefault();
        var control = $(this);
        var action = control.data("foundationContentControlAction");
        var contentAPI = control.closest(".foundation-content").adaptTo("foundation-content");
        
        if (action === "back") {
            contentAPI.back();
        } else if (action === "forward") {
            contentAPI.forward();
        }
    });
    
    Granite.UI.Foundation.Adapters.register("foundation-content", ".foundation-content", function(el) {
        var content = $(el);
        var prevs = [];
        var nexts = [];
        
        var detachCurrent = function(content) {
            return content.children(".foundation-content-current")
                .removeClass("foundation-content-current")
                .detach();
        };
        
        var get = function(url) {
            return $.ajax(url, {
                cache: !$.browser.msie // don't cache if IE. See GRANITE-2276
            });
        };
        
        return {
            go: function(url, replace) {
                var self = this;
                return get(url).pipe(function(html) {
                    if (replace) {
                        self.replace(html);
                    } else {
                        self.push(html);
                    }
                });
            },
            /**
             * Refreshes the current content. It will use current document.location to fetch the new html.
             */
            refresh: function() {
                var self = this;
                var url = "" + document.location; // covert it to string
                return get(url).pipe(function(html) {
                    self.replace(html);
                });
            },
            push: function(html) {
                var el = Granite.UI.Foundation.Utils.processHtml(html, ".foundation-content-current");
                
                nexts = [];
                prevs.push(detachCurrent(content));
                
                $("<div class='foundation-content-current'>").append(el).appendTo(content).trigger("foundation-contentloaded");
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            },
            replace: function(html) {
                var el = Granite.UI.Foundation.Utils.processHtml(html, ".foundation-content-current");
                content.children(".foundation-content-current").empty().append(el).trigger("foundation-contentloaded");
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            },
            back: function() {
                var prev = prevs.pop();
                if (!prev) return this;
                
                var clean = Granite.UI.Foundation.Utils.processHtml(prev);
                
                nexts.unshift(detachCurrent(content));
                clean.addClass("foundation-content-current").appendTo(content);
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            },
            forward: function() {
                var next = nexts.shift();
                if (!next) return this;
                
                var clean = Granite.UI.Foundation.Utils.processHtml(next);
                
                prevs.push(detachCurrent(content));
                clean.addClass("foundation-content-current").appendTo(content);
                
                // avoid return this; planned to return the history token instead, so that one can go back to that history easily
                // return this;
            }
        };
    });
})(document, Granite, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, document, $) {
    "use strict";
    
    var History = window.History;
    
    if (!History.enabled) return;
    
    var ns = ".foundation-content-history";

    // build prefix for window title
    var prefix = History.options.initialTitle;
    if (prefix.indexOf("|") != -1) {
        // "AEM Sites | Geometrixx" >> "AEM Sites"
        prefix = prefix.substring(0, prefix.indexOf("|")).replace(/\s\s*$/, '');
    }

    function getInfo(el, config) {
        var url = el.prop("href");
        var elTitle = el.data("foundation-content-history-title");
        var title = prefix +  (elTitle ? " | " + elTitle : "");

        if (typeof config == "string") {
            return {
                title: title,
                url: url,
                push: config != "replace"
            };
        } else {
            return {
                title: title,
                url: url,
                push: !config.replace
            };
        }
    }
    
    $(document).on("click" + ns, "a[data-foundation-content-history]", function(e) {
        try {
            var a = $(this);
            var config = a.data("foundationContentHistory");
            var contentApi = a.closest(".foundation-content").adaptTo("foundation-content");
            
            var info = getInfo(a, config);
            
            if (info.push) {
                History.pushState(info.data, info.title, info.url);
            } else {
                History.replaceState(info.data, info.title, info.url);
            }
            
            e.preventDefault();
        } catch (e) {
            // Do nothing i.e. normal behavior
        }
    });
    
    History.Adapter.bind(window, "statechange", function(e) {
        var state = History.getState();
        
        var content = $(".foundation-content");
        if (!content.length) return;
        
        var contentApi = content.adaptTo("foundation-content");
        
        // For now we do a new request instead of say go back to history
        var url = "" + document.location; // Need to be a string
        contentApi.go(url, false);
    });
    
})(window, document, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, undefined) {
    "use strict";
    
    Granite.UI.Foundation.Adapters.register("foundation-selections", ".foundation-collection", function(el) {
        var collection = $(el);
        
        return {
            count: function() {
                return collection.find(".foundation-selections-item").length;
            },
            
            clear: function(suppressEvent) {
                var length = collection.find(".foundation-selections-item").removeClass("foundation-selections-item").length;
                
                if (!suppressEvent && length) {
                    collection.trigger("foundation-selections-change");
                }
                
                return this;
            }
        };
    });
    
})(document, Granite, Granite.$);
/*
 ADOBE CONFIDENTIAL

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    var ns = ".foundation-collection-action";
    
    function toggle(action, show) {
        action.toggleClass("hide", !show);
    }
    
    function isCorrentCount(countConfig, count) {
        if (count === 0 && countConfig === 0) {
            return true;
        }
        if (count > 0 && countConfig === ">0") {
            return true;
        }
        return false;
    }
    
    function isCorrentSelectionCount(selectionConfig, selectionCount) {
        if (selectionCount === 0 && selectionConfig === "none") {
            return true;
        }
        if (selectionCount === 1 && selectionConfig === "single") {
            return true;
        }
        if (selectionCount >= 1 && selectionConfig === "multiple") {
            return true;
        }
        return false;
    }
    
    function isCommon(action, collection) {
        var rels = collection.find(".foundation-selections-item").toArray()
            .map(function(item) {
                var rel = $(item).find(".foundation-collection-quickactions").data("foundationCollectionQuickactionsRel") || "";
                rel = rel.trim();
                return rel.length ? rel.split(/\s+/) : [];
            });
        
        var noRelAtAll = rels.every(function(v) { return v.length === 0; });
        if (noRelAtAll) return true;
        
        return rels.every(function(v) {
            return !v.every(function(rel) { return !action.hasClass(rel); });
        });
    }
    
    function isActivate(action, config, collection) {
        var result = true;
        
        if (config.hasOwnProperty("activeCount")) {
            var count = collection.find(".foundation-collection-item").length;
            result = isCorrentCount(config.activeCount, count);
        }
        
        if (result && config.hasOwnProperty("activeSelectionCount")) {
            var api = collection.adaptTo("foundation-selections");
            result = isCorrentSelectionCount(config.activeSelectionCount, api.count());
        }
        
        if (result) {
            result = isCommon(action, collection);
        }
        
        return result;
    }
    
    $(document).on("foundation-contentloaded" + ns, function(e) {
        $(".foundation-collection-action", e.target).each(function() {
            var action = $(this);
            var config = action.data("foundationCollectionAction");
            
            if (!config) return;
            
            var collection = $(config.target);
            
            if (!collection.length) return;
            
            toggle(action, isActivate(action, config, collection));
        });
    });
    
    $(document).on("foundation-selections-change" + ns, ".foundation-collection", function(e) {
        var collection = $(this);
        
        $(".foundation-collection-action").each(function() {
            var action = $(this);
            var config = action.data("foundationCollectionAction");
            
            if (!config || !collection.is(config.target)) return;
            
            toggle(action, isActivate(action, config, collection));
        });
    });
})(document, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, CUI) {
    "use strict";
    
    var ns = ".foundation-collection-infinityscrolling";
    
    function handleScroll(collection, scrollContainer) {
        var scrollHeight = scrollContainer.prop("scrollHeight");
        var scrollTop = scrollContainer.prop("scrollTop");
        var clientHeight = scrollContainer.prop("clientHeight");
        
        if (clientHeight + scrollTop >= scrollHeight && collection.is(":visible")) {
            loadNextPage(collection);
        }
    }

    function loadInitPage(collection, scrollContainer) {
        var ch = scrollContainer.height();
        var sh = scrollContainer.prop("scrollHeight");

        var nextPage = collection.data("src");

        if (nextPage && (sh - ch) === 0) {
            loadNextPage(collection).done(function() {
                loadInitPage(collection, scrollContainer);
            });
        }
    }

    function loadNextPage(collection) {
        if (collection.data("foundationCollectionInfinityscrolling.isLoading")) return $.Deferred().fail();
        
        var nextPage = collection.data("src");
        if (!nextPage) return $.Deferred().fail();
        
        collection.data("foundationCollectionInfinityscrolling.isLoading", true);
        
        return $.ajax({
            url: nextPage
        }).done(function(html) {
            var el = $(Granite.UI.Foundation.Utils.processHtml(html));

            collection.data("src", el.find(".foundation-collection").data("src"));

            // TODO make collection is adaptable to foundation-layout and provide append method there
            // Assuming we are using CUI is wrong here
            CUI.CardView.get(collection).append(el.find(".foundation-collection-item").toArray());
            
            collection.data("foundationCollectionInfinityscrolling.isLoading", false);
            collection.trigger("foundation-contentloaded");
        }).fail(function() {
            collection.data("infinityscroll.isLoading", false);
        });
    }
        
    $(document).on("foundation-contentloaded" + ns, function(e) {
        $(".foundation-collection", e.target).each(function() {
            var collection = $(this);
            
            var scrollContainer = (function(collection) {
                var scrollSrc = collection.data("scrollSrc");
                
                if (scrollSrc) return collection.closest(scrollSrc);
                
                // just return parent, need to specify data-scroll-src if not suitable. See GRANITE-2223
                return collection.parent();
            })(collection);
            
            // remove and re-register
            scrollContainer.off("scroll" + ns).on("scroll" + ns, function() {
                handleScroll(collection, scrollContainer);
            });
            
            loadInitPage(collection, scrollContainer);
        });
    });
    
})(document, Granite, Granite.$, CUI);
/*
 ADOBE CONFIDENTIAL

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var ns = ".foundation-collection-quickactions";
    var isTouch = !!("ontouchstart" in window);

    function isSameGroup(collection, groupName) {
        return !groupName || collection.is("[data-foundation-mode-group~='" + groupName + "'], :not([data-foundation-mode-group])");
    }

    function getActions(item, collection, config) {
        var actions = item.find(".foundation-collection-quickactions").children();
        if (actions.length) {
            return actions;
        }
        
        return collection.siblings("[data-foundation-collection-quickactions-name~=" + config.fallback + "]").children();
    }

    function addListener(collection) {
        var config = collection.data("foundationCollectionQuickactions");
        var selectionsApi = collection.adaptTo("foundation-selections");
        var events = $.quickaction.settings.event;

        collection.finger(events.openMenu.touch + ns, ".foundation-collection-item", function(e) {
            // disable quickactions if we are not in card layout
            if (!collection.hasClass("foundation-layout-card")) {
                return;
            }

            var item = $(this);
            var actions = getActions(item, collection, config);

            if (!actions || !actions.length) return;

            e.preventDefault();
            e.stopImmediatePropagation();

            $.quickaction(e, actions.map(function() {
                return {
                    display: $(this).clone(true).data("foundationCollectionItem", item[0])
                };
            }), {
                container: collection,
                layout: $.quickaction.LAYOUT_CIRCLE,
                autoClose: true,
                displayCloseButton: true /* FIX: make it configurable again, as we lost this functionality after CQ5-25991 */
            });

            selectionsApi.clear(true);
            item.addClass("foundation-selections-item");
            collection.trigger("foundation-selections-change");

            collection.one("quickactionclosemenu" + ns, function() {
                selectionsApi.clear();
            });
        });

        collection.pointer(events.openMenu.pointer + ns, ".foundation-collection-item", function(e) {
            // disable quickactions if we are not in card layout
            if (!collection.hasClass("foundation-layout-card")) {
                return;
            }

            var item = $(this);
            var actions = getActions(item, collection, config);

            if (!actions || !actions.length) return;

            e.preventDefault();
            e.stopImmediatePropagation();

            var cfg = {
                container: collection,
                anchor: item,
                layout: $.quickaction.LAYOUT_BAR
            };

            /* display quickactions */
            $.quickaction(e, actions.map(function() {
                return {
                    display: $(this).clone(true).data("foundationCollectionItem", item[0])
                };
            }), cfg);

            // TODO This code doesn't belong here, but to quickaction plugin
            
            /* hide quickactions if mouse leaves page preview */
            item.off(events.closeMenu.pointer + ns);
            item.on(events.closeMenu.pointer + ns, function(e) {
                /* but don't hide actions if mouse is over quickaction bar */
                if ($(e.relatedTarget).closest('.' + cfg.layout.cssClass).length) {
                    return;
                }

                $.quickaction.LAYOUT_BAR.destroy(cfg);
                item.off(events.closeMenu.pointer + ns);
            });

            /* hide quickactions if mouse leave quickaction bar */
            var bar = cfg.layout.getQuickactionsBar();

            if (bar) {
                bar.off(events.closeMenu.pointer + ns);
                bar.on(events.closeMenu.pointer + ns, function(e) {
                    /* but don't hide actions if mouse is over page-card again */
                    if ($(e.relatedTarget).closest(item).length) {
                        return;
                    }

                    $.quickaction.LAYOUT_BAR.destroy(cfg);
                    bar.off(events.closeMenu.pointer + ns);
                });
            }
        });
    }

    function removeListener(collection) {
        collection.off(ns);
    }

    // TODO quickaction needs to be moved to cardlayout.js as it is card layout specific
    $(document).on("foundation-contentloaded" + ns, function(e) {

        $(".foundation-collection[data-foundation-collection-quickactions]", e.target).each(function() {
            var collection = $(this);

            var config = collection.data("foundationCollection");
            if (!config || config.mode === "default") {
                addListener(collection);
            }

            $(document).on("foundation-mode-change" + ns, function(e, mode, group) {
                if (!isSameGroup(collection, group)) return;

                if (mode === "default") {
                    addListener(collection);
                } else {
                    removeListener(collection);
                }
            });
        });
    });
})(window, document, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, Granite, $, undefined) {
    "use strict";
    
    function getSameGroupEl(type, groupName) {
        if (groupName) {
            return $("." + type + "[data-foundation-mode-group~='" + groupName + "'], ." + type + ":not([data-foundation-mode-group])");
        } else {
            return $("." + type);
        }
    }
    
    function changeMode(form, mode) {
        form.toggleClass("mode-edit mode-default");
    }
    
    function resetField($el) {
        var api = $el.adaptTo("foundation-field");
        if (api) {
            api.reset();
        }
    }
    
    function submitForm(form) {
        return $.ajax({
            type: form.prop("method"),
            url: form.prop("action"),
            contentType: form.prop("enctype"),
            data: form.serialize(),
            cache: false
        });
    }

    function createRedirect(form) {
        var url = form.data("redirect");
        if (url) {
            return function() {
                $.ajax(url)
                    .fail(function(){/*handle error*/})
                    .always(createRenderOutput(form));
            };
        } else {
            return createRenderOutput(form);
        }
    }

    function createRenderOutput(form) {
        var panelSelector = form.data("foundationFormOutputReplace") || form.data("foundationFormOutputPush");
        if (panelSelector) {
            return function(html) {
                var p = $(panelSelector);
                var contentAPI = p.adaptTo("foundation-content");
                if (contentAPI) {
                    if (form.data("foundationFormOutputReplace")) {
                        contentAPI.replace(html);
                    } else {
                        contentAPI.push(html);
                    }
                } else {
                    p.html(html);
                }
            };
        } else {
            return function(data) {
                // Do nothing
            };
        }
    }
    
    $(document).on("foundation-mode-change.foundation-form", function(e, mode, group) {
        if (mode !== "default" && mode !== "edit") return;
        
        changeMode(getSameGroupEl("foundation-form", group), mode);
    });

    $(document).on("foundation-form-submit-callback.foundation-form", "form.foundation-form", function(e) {
        createRedirect($(this)).call();
    });

    $(document).on("reset.foundation-form", "form.foundation-form", function(e) {
        $(this).adaptTo("foundation-form").reset(true);
    });
    
    $(document).on("submit.foundation-form", "form.foundation-form", function(e) {
        var form = $(this);
    
        if (form.data("foundationFormAjax")) {
            e.preventDefault();
            var disable = form.data("foundation-form-disable");
            if (disable == true || disable == "true") {
            }
            else {
                submitForm(form)
                    .done(createRedirect(form));
                    //.fail(); // TODO handle fail, probably by displaying error dialog
            }
        }
    });

    // polyfill for <button>'s form attribute
    $(document).on("click", "button[type='submit']", function(e) {
        var formId = $(this).attr("form");
        if (formId) {
            e.preventDefault();
            $("#" + formId).submit();
        }
    });
    
    Granite.UI.Foundation.Adapters.register("foundation-form", ".foundation-form", function(el) {
        var form = $(el);
        
        return {
            /**
             * Resets the form.
             * @param {boolean} skipNative Skips the native form reset method (formEl.reset())
             */
            reset: function(skipNative) {
                if (!skipNative) {
                    el.reset();
                }
                
                form.find(".foundation-field-editable").each(function() {
                    var editable = $(this);
                    resetField(editable.find(".foundation-field-readonly"));
                    resetField(editable.find(".foundation-field-edit"));
                });
            }
        };
    });
    
})(document, Granite, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, document, $) {
    "use strict";
    
    var ns = ".foundation-wizard";
    
    function cancel(control) {
        var href = control.data("href");
        
        if (!href) return;

        window.location.href = "" + href;
    }
    
    $(document).fipo("tap" + ns, "click" + ns, ".foundation-wizard-control", function(e) {
        var control = $(this);
        var action = control.data("foundationWizardControlAction");
        
        if (action === "cancel") {
            e.preventDefault();
            cancel(control);
        }
    });
    
})(window, document, Granite.$);
/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, document, Granite, $, undefined) {
    "use strict";

    function getPersistence(local) {
        var storage = local ? window.localStorage : window.sessionStorage;
        return {
            get: function(key) {
                return JSON.parse(storage.getItem(key));
            },

            set: function(key, data) {
                storage.setItem(key, JSON.stringify(data));
            },

            remove: function(key) {
                storage.removeItem(key);
            }
        };
    }

    Granite.UI.Foundation.Adapters.register("foundation-clipboard", $(window), function(el) {
        var window = $(el);
        var persistence = getPersistence();

        return {
            get: function(key) {
                return persistence.get(key);
            },
            set: function(key, data) {
                persistence.set(key, data);

                window.trigger("foundation-clipboard-change", {
                    key: key,
                    data: data,
                    timestamp: new Date().getTime()
                });
            },
            remove: function(key) {
                persistence.remove(key);

                window.trigger("foundation-clipboard-change", {
                    key: key,
                    data: null,
                    timestamp: new Date().getTime()
                });
            }
        };
    });
})(window, document, Granite, Granite.$);
/*
 ADOBE CONFIDENTIAL

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function(document, $, undefined) {
    "use strict";

    var ns = ".foundation-mode";

    // Exclusively using click event here. See GRANITE-2191
    $(document).on("click" + ns, ".foundation-mode-change", function(e) {
        e.preventDefault();
        
        var button = $(this);
        var mode = button.data("foundationModeValue");
        var group = button.data("foundationModeGroup");

        button.trigger("foundation-mode-change", [mode, group]);
    });
})(document, Granite.$);
