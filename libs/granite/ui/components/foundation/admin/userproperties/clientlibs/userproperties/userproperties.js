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
(function(document, Granite, $) {

    function submitForm(form) {
        return $.ajax({
            type: form.prop("method"),
            url: form.prop("action"),
            contentType: form.prop("enctype"),
            data: form.serialize()
        });
    }
    
    $(document).on("click.user-preferences", "#user_dialog a[href=#user_preferences]", function() {
        $("#user_dialog").popover("hide");
    });
    
    $(document).on("submit.foundation-form-reload", ".foundation-form-reload", function(event) {
        event.preventDefault();
        
        submitForm($(this)).done(function() {
            setTimeout(function() {
                location.reload();
            }, 100);
        });
    });
    
})(document, Granite, Granite.$);
