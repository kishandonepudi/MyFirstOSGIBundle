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
var ActivityManager = {};

ActivityManager.POST_URL = "/bin/granite/activitystreams";
ActivityManager.POST_WRITE_ACTIVITY_EXTENSION = ".write.activity";

ActivityManager.newActivity = function() {
    return new Activity();
};

ActivityManager.newActivityObject = function() {
    return new ActivityObject();
};

ActivityManager.writeActivity = function(activity) {
    var url = ActivityManager.POST_URL;
    _g.$.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(activity.toJSON()),
        contentType: "application/json;charset=UTF-8"
    });
};
