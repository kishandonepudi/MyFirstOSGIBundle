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
(function(window, document, Granite, $) {
    "use strict";
    
    // NOTE: foundation-layout-wizard is now exclusive to manage the layout of foundation-wizard only
    
    var ns = ".foundation-layout-wizard";
    
    function overrideLeftButtons(step, nav) {
        var overrides = step.find(".foundation-wizard-control").map(function() {
            var control = $(this);
            var action = control.data("foundationWizardControlAction");
            
            if (action !== "prev" && action !== "cancel") return;
            
            control.addClass("hidden");
            return control.clone().removeClass("hidden").addClass("back").data("foundation-wizard-control.internal.clone", true)[0];
        });
        
        var left = nav.find(".left");
        left.children().detach().each(function() {
            var el = $(this);
            if (el.data("foundation-wizard-control.internal.clone")) {
                el.remove();
            }
        });
        
        if (overrides.length) {
            left.append(overrides);
        } else {
            left.append(nav.data("foundation-wizard-nav.internal.left"));
        }
    }
    
    function overrideRightButtons(step, nav) {
        var overrides = step.find(".foundation-wizard-control").map(function() {
            var control = $(this);
            var action = control.data("foundationWizardControlAction");
            
            if (action !== "next") return;
            
            control.addClass("hidden");
            return control.clone().removeClass("hidden").addClass("next").data("foundation-wizard-control.internal.clone", true)[0];
        });
        
        var right = nav.find(".right");
        right.children().detach().each(function() {
            var el = $(this);
            if (el.data("foundation-wizard-control.internal.clone")) {
                el.remove();
            }
        });
        
        if (overrides.length) {
            right.append(overrides);
        } else {
            right.append(nav.data("foundation-wizard-nav.internal.right"));
        }
    }
    
    function showStep(wizard, index) {
        var steps = wizard.children(".foundation-wizard-step");
        var step = steps.eq(index);
        
        if (!step.length) return;
        
        var nav = wizard.find("nav");
        
        nav.find("ol li").eq(index)
            .prevAll().removeClass("active").addClass("stepped")
            .end()
            .addClass("active")
                .nextAll().andSelf().removeClass("stepped");
        
        overrideLeftButtons(step, nav);
        overrideRightButtons(step, nav);
        
        steps.filter(".active").removeClass("active");
        step.addClass("active");
        
        wizard.trigger("foundation-wizard-stepchange", step[0]);
    }
    
    function prev(wizard) {
        var steps = wizard.children(".foundation-wizard-step");
        var active = steps.filter(".active");
        var step = active.prev(".foundation-wizard-step");
        
        if (!step.length) return;
        
        var nav = wizard.find("nav");
        
        nav.find("ol li.active").removeClass("active")
            .prev().addClass("active").removeClass("stepped");
        
        overrideLeftButtons(step, nav);
        overrideRightButtons(step, nav);
        
        active.removeClass("active");
        step.addClass("active");
        
        wizard.trigger("foundation-wizard-stepchange", step[0]);
    }
    
    function next(wizard) {
        var steps = wizard.children(".foundation-wizard-step");
        var active = steps.filter(".active");
        var step = active.next(".foundation-wizard-step");
        
        if (!step.length) return;
        
        var nav = wizard.find("nav");
        
        nav.find("ol li.active").removeClass("active").addClass("stepped")
            .next().addClass("active");
        
        overrideLeftButtons(step, nav);
        overrideRightButtons(step, nav);
        
        active.removeClass("active");
        step.addClass("active");
        
        wizard.trigger("foundation-wizard-stepchange", step[0]);
    }
    
    // We are not using CUI.Wizard here as it is very difficult to do HATEOAS currently
    // e.g. you cannot use your own <button>
    // So we just reuse the styling and fix CUI.Wizard later on.
    function enhance(wizard) {
        var nav = wizard.find("nav");
        nav.find("ol li").eq(0).append("<div class='lead-fill'></div>");
        
        nav.data("foundation-wizard-nav.internal.left", nav.find(".left").children());
        nav.data("foundation-wizard-nav.internal.right", nav.find(".right").children());
        
        // Show step in the next tick to allow others add listener to the wizard
        window.setTimeout(function() {
            showStep(wizard, 0);
        }, 0);
    }
    
    function addListener(wizard) {
        wizard.fipo("tap" + ns, "click" + ns, ".foundation-wizard-control", function(e) {
            var control = $(this);
            var action = control.data("foundationWizardControlAction");
            
            if (action === "next") {
                next(wizard);
            } else if (action === "prev") {
                prev(wizard);
            }
        });
    }
    
    function removeListener(wizard) {
        wizard.off(ns);
    }
    
    Granite.UI.Foundation.Layouts.register("foundation-layout-wizard", function(el, config) {
        var wizard = $(el);
        
        if (!wizard.is(".foundation-wizard")) return;
        
        enhance(wizard);
        addListener(wizard);
        
    }, function(el, config) {
        Granite.UI.Foundation.Layouts.clean(el);

        var wizard = $(el);
        removeListener(wizard);
    });
})(window, document, Granite, Granite.$);
