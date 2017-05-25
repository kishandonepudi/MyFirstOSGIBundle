/*************************************************************************
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
 **************************************************************************/

// This file adds the DPS Page Properties option to the sidekick
// Assumes Sidekick's code has already been included
(function(){
    "use strict";

    var dpsPropsText = CQ.I18n.getMessage("DPS Page Properties...");
    var dpsPropsDialog = "/libs/media/publishing/components/page/dialog";

    /**
     * Returns the config for the default DPS Properties button.
     * @param {Object} config The config
     * @private
     * @return {Object} The config for the default Properties button
     */
    var getDPSPropsConfig = function(config, currentPage) {
        var sidekick = CQ.wcm.Sidekick.findSidekick(this);
        var dialogPath = dpsPropsDialog ? dpsPropsDialog :
                sidekick.initialConfig.dpsPropsDialog;
        var allowed = dialogPath &&
                  CQ.User.getCurrentUser().hasPermissionOn("read", dialogPath) !== false;

        if(currentPage.info.path.indexOf("/content/publications/")==-1){
            return null; //this isn't a DPS page, don't provide this option.
        }

        return {
            "text": dpsPropsText,
            "disabled": !allowed,
            "handler": function() {

                // todo: cache propsDialog of same path?
                // create propsDialog on each call (because of calls from Content Finder)

                var propsDialog;
                try {
                    var contentWindow = CQ.utils.WCM.getContentWindow();
                    if (!dialogPath) {
                        CQ.Log.warn("CQ.wcm.Sidekick#getDPSPropsConfig: no properties dialog specified");
                        return;
                    }
                    var propsDialogConfig = contentWindow.CQ.WCM.getDialogConfig(dialogPath);
                    if (!propsDialogConfig.success) {
                        propsDialogConfig.success = function(form, action) {
                            CQ.Util.reload(CQ.WCM.getContentWindow());
                        };
                    }
                    if (!propsDialogConfig.failure) {
                        propsDialogConfig.failure = function(form, action) {
                            var response = CQ.HTTP.buildPostResponseFromHTML(action.response);
                            CQ.Ext.Msg.alert(response.headers[CQ.HTTP.HEADER_MESSAGE]);
                        };
                    }
                    propsDialog = contentWindow.CQ.WCM.getDialog(propsDialogConfig, dialogPath);
                    propsDialog.fieldEditLockMode = true;
                    propsDialog.loadContent(this.getPath() + "/jcr:content");
                    propsDialog.setTitle(CQ.I18n.getMessage("DPS Page Properties of {0}", this.getPath()));
                } catch (e) {
                    CQ.Log.error("CQ.wcm.Sidekick#getDPSPropsConfig: failed to build properties dialog: {0}", e.message);
                    return;
                }
                propsDialog.show();
            },
            "context": CQ.wcm.Sidekick.PAGE
        };
    };

    //Add this to the Sidekick's list of options
    CQ.wcm.Sidekick.DEFAULT_ACTIONS.splice(1,0,getDPSPropsConfig);

})();
/*
 ADOBE CONFIDENTIAL
 __________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

CQ.media = CQ.media || {};
CQ.media.Publishing = CQ.media.Publishing || {};

/**
 * Given the path to a dps article's, get the details
 * of the folio's orientation.
 * @param path to the dps article
 *
 * @return the folio's intent, either CQ.media.Media.DPS_FOLIO_ORIENTATION_LANDSCAPE,
 * CQ.media.Media.DPS_FOLIO_ORIENTATION_PORTRAIT, or
 * CQ.media.Media.DPS_FOLIO_ORIENTATION_BOTH.
 */
CQ.media.Publishing.orientationHelper = function(path) {
    "use strict";

    var orientation;
    var index = path.lastIndexOf("/jcr:content");

    if (index === -1) {
        index = path.length;
    }

    var url = path.substring(0, index);
    url += ".getFolioDetails.json";

    var response = CQ.HTTP.get(url);
    var data = $CQ.parseJSON(response.body);

    if (data.response.folio) {
        orientation = data.response.folio["dps-folioIntent"];
    }

    return orientation;
};
