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
