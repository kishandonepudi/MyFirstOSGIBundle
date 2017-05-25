/*

  ADOBE CONFIDENTIAL
  __________________

   Copyright 2011 Adobe Systems Incorporated
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

jQuery(function ($) {

$(".search .search-field input").each(function () {
    var input = $(this),
        label = $("label[for="+this.id+"]");
    
    if (input.val() !== "") {
        label.hide();
    }
    
    input
        .focus(function () {
            label.fadeOut(100);
        })
        .blur(function () {
            if (input.val() === "") {
                label.fadeIn(300);
            }
        });
});

});
