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

/*
    Stirrup.js - lightweight library for creating subclasses.

    View: Base class for all client views which provides access to the underlying jQuery
        element and an arbitrary set of options.

    Example:
        var MyClass = Granite.UI.Foundation.Stirrup.Base.extend({
            someProp: 'My property value',
            someMethod: function () { ... }
        });
        var instance = new MyClass();

 */
(function (Granite, $) {
    "use strict";

    var Stirrup = Granite.Stirrup = {};

    var Base = Stirrup.Base = function () {};

    var View = Stirrup.View = function(options) {
        this._configure(options || {});
        this._ensureElement();
        this.initialize.apply(this, arguments);
    };

    $.extend(View.prototype, {

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function(){},

        // Change the view's element (`this.el` property)
        setElement: function(element) {
            this.$el = (element instanceof $) ? element : $(element);
            this.el = this.$el[0];
            return this;
        },

        // Performs the initial configuration of a View with a set of options.
        _configure: function(options) {
            if (this.options) options = $.extend({}, this.options, options);
            if (options.el) this.el = options.el;
            this.options = options;
            this.document = window.document;
        },

        // Ensure that the View has a DOM element to render into.
        // If `this.el` is a string, pass it through `$()`, take the first
        // matching element, and re-assign it to `el`.
        _ensureElement: function() {
            if (this.el) {
                this.setElement(this.el);
            }
        }

    });

    // `ctor` and `inherits` are from Backbone (with some modifications):
    // http://documentcloud.github.com/backbone/

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function () {};

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var inherits = function (parent, protoProps, staticProps) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call `super()`.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () { return parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        $.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) $.extend(child.prototype, protoProps);

        // Add static properties to the constructor function, if supplied.
        if (staticProps) $.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    // Self-propagating extend function.
    // Create a new class that inherits from the class found in the `this` context object.
    // This function is meant to be called in the context of a constructor function.
    var extend = function (protoProps, staticProps) {
        var child = inherits(this, protoProps, staticProps);
        child.extend = extend;
        return child;
    };

    Base.extend = View.extend = extend;

})(Granite, jQuery);
