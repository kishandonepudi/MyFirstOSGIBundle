(function($, undefined) {

    $.widget("granite.confirm", $.mobile.widget, {
        options: {
            theme: "a",
            initSelector: ":jqmData(role='confirm')"
        },

        _create: function() {
            this.intercept = true;
            
            this.element.addClass("ui-confirm ui-corner-all ui-shadow").addClass("ui-overlay-" + this.options.theme);
            
            this.confirmButton = this.element.find(":jqmData(rel='confirm')");
            this.cancelButton = this.element.find(":jqmData(rel='cancel')");
            
            this.button = $("#" + this.element.jqmData("for"));
            if (this.button.length > 0) {
                this._intercept();
            } else {
            	delete this.button;
            }
            
            this._bind();
        },
        
        _bind: function() {
            var me = this;
            
            this.cancelButton.click(function(e) {
            	if (me.options.oncancel) {
            		me.options.oncancel(e);
            	}
                me.close();
            });
            
            this.confirmButton.click(function(e) {
            	if (me.button) {
            		me.intercept = false;
                    me.button.click();
                    me.intercept = true;
            	}
            	if (me.options.onconfirm) {
            		me.options.onconfirm(e);
            	}
                me.close();
            });
        },
        
        _intercept: function() {
            var me = this;
            var buttonEl = this.button.get(0);
            
            // Check if handler is onclick
            if (buttonEl.onclick) {
                var prevHandler = buttonEl.onclick;
                buttonEl.onclick = function() {
                    if (me.intercept)
                        me.open();
                    else
                        prevHandler.apply(buttonEl, arguments);
                };
            } else {
                this.button.click(function(e) {
                    if (me.intercept) {
                        me.open();
                        return false;
                    }
                });
            }
        },
        
        widget: function() {
        	return this.element;
        },
        
        open: function() {
            this.element.fadeIn();
        },
        
        close: function() {
            this.element.fadeOut();
        }        
    });

    // auto self-init widgets
    $(document).bind("pagecreate create", function(e) {
        $.granite.confirm.prototype.enhanceWithin(e.target);
    });

})(jQuery);
