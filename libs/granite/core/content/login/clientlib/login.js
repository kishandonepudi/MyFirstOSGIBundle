/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any. The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
jQuery(function($){

    function flushError() {
        $("#error").text('').addClass('hidden');
    }

    function displayError(message) {
        $("#error").text(message).removeClass('hidden');
    }

    // Bind an event listener on login form to make an ajax call
    $("#login").submit(function(event) {
        event.preventDefault();
        var form = this;
        var path = form.action;
        var user = form.j_username.value;
        var pass = form.j_password.value;
        var errorMessage = form.errorMessage.value;
        var resource = form.resource.value;

        // if no user is given, avoid login request
        if (!user) {
            return true;
        }

        // disable 403 handler in granite
        $.ajaxSetup({
            statusCode: {
                403: $.noop
            }
        });

        // send user/id password to check and persist
        $.ajax({
            url: path,
            type: "POST",
            async: false,
            global: false,
            dataType: "text",
            data: {
                _charset_: "utf-8",
                j_username: user,
                j_password: pass,
                j_validate: true
            },
            success: function (data, code, jqXHR){
                var u = resource;
                if (window.location.hash && u.indexOf('#') < 0) {
                    u = u + window.location.hash;
                }
                document.location = u;
            },
            error: function() {
                displayError(errorMessage);
                form.j_password.value="";
            }
        });
        return true;
    });

});
