/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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

// Initialize the PhoneGap camera component
function initializeCameraComponent(options) {

    // Default settings
    var settings = jQuery.extend({
        rootElementId: "camera"
    }, options);

    var $rootElement = jQuery("#" + settings.rootElementId);

    /**
     * Initialize component buttons
     */
    var initializeCaptureButtons = function() {
        // Initialize "Take photo" button
        $rootElement.find(".takePhoto")
            .unbind("click")
            .click(function() {
                navigator.camera.getPicture( cameraSuccess, cameraFail,
                    {
                        quality: 20,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA
                    }
                );

            });

        // Initialize "Choose from library" button
        $rootElement.find(".choosePhoto")
            .unbind("click")
            .click(function() {
                navigator.camera.getPicture( cameraSuccess, photoLibraryFail,
                    {
                        quality: 50,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                    }
                );
            });
    }

    var initializePreviewButtons = function() {
        // Initialize the submit button
        $rootElement.find(".submit")
            .unbind("click")
            .click(function() {
                submitImage();
            });

        // Initialize the discard button
        $rootElement.find(".discard")
            .unbind("click")
            .click(function() {
                hidePreviewShowCapture();
            });
    }

    // This function will be called when an image has been successfully captured
    // @param imageUri - URI to the image on the device
    var cameraSuccess = function(imageData) {
        $rootElement.find(".encodedFileContent").val(imageData);

        // Set the image src to the base64 data string
        $rootElement.find(".previewImage").attr("src",
            "data:image/jpeg;base64," + imageData);

        // Hide the image capture view, show preview
        showPreviewHideCapture();
    };

    // Called when an error occurs during image capture
    // @param message - failure string
    var cameraFail = function(message) {
        // We failed to use the native camera.
        // This may indicate the app is being run inside an emulator.
        // Try again to capture a photo this time using the photo library
        navigator.camera.getPicture( cameraSuccess, photoLibraryFail,
            {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            }
        );
    };

    // Called when an error occurs choosing a photo from the device library
    // @param message - failure string
    var photoLibraryFail = function(message) {
        if (message != "no image selected") {
            alert("Image capture failed: " + message);
        }
    };

    var submitImage = function() {
        $rootElement.find(".submitTable").hide(0);
        $rootElement.find(".progressBar").show(0);
        // Initiate mock post
        alert("Upload complete");
        $rootElement.find(".progressBar").hide(0);
        hidePreviewShowCapture();
    }

    // Show the preview image and submission controls
    var showPreviewHideCapture = function() {
        $rootElement.find(".cameraTable").hide();
        $rootElement.find(".previewTable").show();
        $rootElement.find(".submitTable").show();
        initializePreviewButtons();
    };

    var hidePreviewShowCapture = function() {
        $rootElement.find(".previewTable").hide();
        $rootElement.find(".submitTable").hide();
        $rootElement.find(".cameraTable").show();
        initializeCaptureButtons();
    };

    // Initialize capture view buttons
    initializeCaptureButtons();
}