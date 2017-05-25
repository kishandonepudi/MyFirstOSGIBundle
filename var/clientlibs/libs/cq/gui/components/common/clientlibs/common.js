/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

(function(document, $) {
    $.fn.overlayMask = function (action, appendEl) {
    var mask = this.find('.overlay-mask');
    // Creates required mask

    if (!mask.length && (!action || action === 'show')) {
      mask = $('<div class="overlay-mask"></div>');
      mask.css({
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        zIndex: 10000
      }).appendTo(this);
      mask.append(appendEl);
    }

    // Act based on params

    if (!action || action === 'show') {
      this.fadeTo(0, 0.5);
      mask.show();
    } else if (action === 'hide') {
      this.fadeTo(0, 1);
      mask.hide();
    }
    return this;
  };

})(document, Granite.$);  
(function(document, $) {
    $(document).ready(function(){
        var searchForms = $('form.foundation-form .search').closest('form');
        searchForms.each(function(){
            $(this).on("submit.foundation-form", function(e){
                var disable = $(e.target).data("foundation-form-disable");
                if (disable == true || disable == "true") {
                }
                else {
            	    var spinner = $('<div style=" position: fixed; top: 50%; left: 50%;" class="spinner large"></div>');
                    $('.foundation-content').overlayMask('show', spinner);
                }
            });
        });
    });
    
    $(document).on("foundation-contentloaded", ".foundation-content",  function(e) {
       $('.foundation-content').overlayMask('hide');
    });
    
    
})(document, Granite.$);
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

(function(document, $) {

    function getHref(switcher) {
        var desktopOnly = switcher.data("desktoponly");

        if( desktopOnly ) {
            var target = desktopOnly;
            if (desktopOnly.indexOf("#") == desktopOnly.length - 1) {
                // desktopOnly URL ends with "#" >> add current path (suffix)
                var path = Granite.HTTP.internalize(window.location.pathname);
                var index = path.indexOf("/", 1);
                if (index != -1) {
                    // path consists of vanity URL plus suffix: add suffix to target
                    target += path.substring(index)
                }
            }
            return Granite.HTTP.externalize(target);
        }

        return null;
    }

    $(document).on("click", ".desktoponly-switcher", function(e){
        var href = getHref($(this));
        if( href ) {
            window.open(href);
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
    });

    // workaround to not show the switcher on touch devices (TO BE REMOVED) 
    $(document).on("touchstart", "nav.feature", function(e){
        $(this).find("a.action").remove();
    });

})(document, Granite.$);
