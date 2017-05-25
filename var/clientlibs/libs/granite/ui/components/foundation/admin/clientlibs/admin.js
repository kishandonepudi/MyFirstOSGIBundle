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
(function(document, $) {
    "use strict";
    
    $(document).on("foundation-contentloaded.foundation-admin-rail", function(e) {
        $(".rail", e.target).rail();
    });
})(document, Granite.$);
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
(function(window, document, $) {
    "use strict";
    
    var ns = ".foundation-admin-rail-toggle";
    
    $(document).fipo("tap" + ns, "click" + ns, ".foundation-admin-rail-toggle", function(e) {
        e.preventDefault();
        var toggle = $(this),
            railSelector = toggle.data("target"),
            rail = $(railSelector);
        rail.toggleClass("closed");
        $(window).resize();

        CUI.util.state.save(railSelector, "class");
    });
    
    // Prevent default for touch
    $(document).finger("click" + ns, ".foundation-admin-rail-toggle", function(e) {
        e.preventDefault();
    });
})(window, document, Granite.$);
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
    "use strict";

    var $doc = $(document),
        stateSelector = ".foundation-collection";

    function switchLayout(target, layout, button) {
        Granite.UI.Foundation.Layouts.switchLayout(target, layout);
    }

    $doc.fipo("tap.foundation-admin-layouttoggle", "click.foundation-admin-layouttoggle", ".foundation-admin-layouttoggle button", function(e) {
        var button = $(this),
            parent = button.parent(),
            layout = button.data("foundationAdminLayouttoggleLayout"),
            target = $(parent.data("target")).get(0);

        switchLayout(target, layout, button);

        CUI.util.state.save(stateSelector, 'class');
    });
    
})(document, Granite, Granite.$);
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
    "use strict";
    
    function getElHavingTarget(selector, target) {
        return $(selector).filter(function() {
            return $($(this).data("target")).filter(target).length;
        });
    }
    
    function createTemplater(template) {
        return function(data) {
            if (!template) return "";
            return template.replace("{{count}}", data.count);
        };
    }
    
    function updateStatus(status, collection) {
        var templater = createTemplater(status.data("template"));
        var selectionsAPI = collection.adaptTo("foundation-selections");
        
        status.html(templater({
            count: selectionsAPI.count()
        }));
    }
    
    $(document).on("foundation-selections-change.foundation-admin-selectionstatus", ".foundation-collection", function() {
        var collection = $(this);
        
        getElHavingTarget(".foundation-admin-selectionstatus", collection).each(function() {
            var status = $(this);
            updateStatus(status, collection);
        });
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
    "use strict";

    function showOneItemProperty(activator, item) {
        if (!item) return;

        var url = activator.data("href") + "?item=" + encodeURIComponent($(item).data("path"));
        var contentAPI = activator.closest(".foundation-content").adaptTo("foundation-content");
        return contentAPI.go(url);
    }

    function showProperties(activator, collection) {
        var selections = collection.find(".foundation-selections-item");

        if (!selections.length) return;

        var url = activator.data("href") + "?" + selections.map(function() {
            return "item=" + encodeURIComponent($(this).data("path"));
        }).toArray().join("&");

        var contentAPI = activator.closest(".foundation-content").adaptTo("foundation-content");
        return contentAPI.go(url);
    }

    $(document).fipo("tap.foundation-admin-properties-activator", "click.foundation-admin-properties-activator", ".foundation-admin-properties-activator", function(e) {
        var activator = $(this);
        var config = activator.data("foundationCollectionAction");

        if (config) {
            var collection = $(config.target).first();
            showProperties(activator, collection);
        } else {
            var item = $(activator.data("foundationCollectionItem"));
            showOneItemProperty(activator, item);
        }

    });
})(document, Granite.$);
