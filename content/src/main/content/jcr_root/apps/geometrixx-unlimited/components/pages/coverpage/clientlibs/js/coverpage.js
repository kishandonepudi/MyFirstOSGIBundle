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
$(window).load(function() {
    var $body = $("body"); //Cache this for performance

    var setBodyScale = function() {
        var scaleSourceX = $body.width(),
            scaleFactorX = 0.06,    
            scaleSourceY = $body.height(),
            scaleFactorY = 0.08,                       
            maxScale = 600,
            minScale = 0; //Tweak these values to taste

        var fontSize = Math.min(scaleSourceX * scaleFactorX, scaleSourceY * scaleFactorY); //Multiply the width of the body by the scaling factor:

        if (fontSize > maxScale) fontSize = maxScale;
        if (fontSize < minScale) fontSize = minScale; //Enforce the minimum and maximums

        $body.css('font-size', fontSize + '%');
    }

    $(".footer-content-hidden").removeClass("footer-content-hidden");

    $(window).resize(function(){
        setBodyScale();
    });

    //Fire it when the page first loads:
    setBodyScale();
});