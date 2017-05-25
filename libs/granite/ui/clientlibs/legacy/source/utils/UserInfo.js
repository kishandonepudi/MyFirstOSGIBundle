/**
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved
 */

/**
 * A helper class providing UserInfo.
 * @static
 * @singleton
 * @class _g.ui.UserInfo
 */
_g.ui.UserInfo = (function() {
	var CURRENT_USER_URL = _g.HTTP.externalize("/libs/granite/security/currentuser.json");
	
	var currentUserPromise;
	function getCurrentUser() {
		if (currentUserPromise) {
			return currentUserPromise;
		}
		
		currentUserPromise = _g.$.getJSON(CURRENT_USER_URL);
		return currentUserPromise;
	}
	
	return {
		/**
         * Return the current authenticated user.
         * @static
         * @return {Promise} The promise of the user
         */
		getCurrentUser: getCurrentUser
	};
})();
