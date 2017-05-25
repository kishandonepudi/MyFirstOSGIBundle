/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

// create flow package
CQ.flow = {};
/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

CQ.flow.Step = function() {
    return {
        afterInsert:function(contentPath, definition) {
            this.refreshCreated(contentPath, definition);
            CQ.flow.Layout.adaptLayout();
        },
        
        afterDelete:function() {
            this.on("destroy", function(comp) {
                CQ.flow.Layout.adaptLayout();
            }, { single:true });
            this.refreshSelf();
        },
        
        afterEdit:function() {
            this.refreshSelf();
            CQ.flow.Layout.adaptLayout();
        },
        
        afterMove:function() {
            this.refreshSelf();
            CQ.flow.Layout.adaptLayout();
        }
    }
}();
/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

CQ.flow.Split = function() {
    return {
        splitTypeChanged:function(field, isChecked) {
            var tabs = field.findParentByType("tabpanel");
            tabs.items.get(1).setDisabled(!isChecked);
        }
    }
}();
/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

CQ.flow.Layout = function() {
    var adaptText = function(clazz) {
        var els = CQ.Ext.query(clazz);
        for (var i = 0; i < els.length; i++) {
            var el = CQ.Ext.get(els[i]);
            var w = el.parent().getComputedWidth();
            
            if (w < el.getTextWidth()) {
                var txt = CQ.Ext.util.Format.ellipsis(el.dom.innerHTML, w / 6, true);
                CQ.Ext.fly(el).update(txt);
            }
            el.setVisible(true);
        }
    };
    
    return CQ.Ext.apply(new CQ.Ext.util.Observable(), {
        initComponent:function() {
            CQ.flow.Layout.superclass.initComponent.call(this);

            this.addEvents(
                /**
                 * Fires when the layout was adapted
                 * @event afterlayout
                 */
                "afterlayout"
            );
        },
        
        adaptLayout:function() {
            (function(){
                // init split layout
                var mids = CQ.Ext.query("div[class='ctl-middle']");
                for (var i = 0; i < mids.length; i++) {
                    var midEl = CQ.Ext.get(mids[i]);

                    var cols = {};
                    var max = 0;
                    
                    // first column
                    var col = CQ.Ext.get(midEl.down("div.ctl-col"));
                    var spacer = CQ.Ext.get(col.down("div.ctl-spacer"));
                    var h = col.getComputedHeight() - spacer.getComputedHeight();
                    if (h > max) {
                        max = h;
                    }
                    cols[col.id] = {
                        "spacer":spacer,
                        "height":h
                    };
                    
                    // other columns
                    col = CQ.Ext.get(col.next("div.ctl-col"));
                    while (col != null) {
                        spacer = CQ.Ext.get(col.down("div.ctl-spacer"));
                        h = col.getComputedHeight() - spacer.getComputedHeight();
                        if (h > max) {
                            max = h;
                        }
                        cols[col.id] = {
                            "spacer":spacer,
                            "height":h
                        };
                        col = CQ.Ext.get(col.next("div.ctl-col"));
                    }
                    // adapt spacer
                    for (var col in cols) {
                        if (cols[col].height == max) {
                            cols[col].spacer.setHeight(0);
                        } else if (cols[col].height < max) {
                            cols[col].spacer.setHeight(max - cols[col].height);
                        }
                    }
                }
                CQ.flow.Layout.adaptText();
                this.fireEvent("afterlayout");
                
            }).defer(200, this);  // need to defer this a little to give 
                                  // browser the chance to render changes first
        },
        
        adaptText: function() {
            // adapt titles, descriptions, ...
            adaptText("div[class='title']");
            adaptText("div[class='description']");
            adaptText("span[class='step-details']");
            adaptText("div[class='loop-condition']");
        }
    });
}();

CQ.Ext.onReady(function() {
    // add listener for initial layout
    if (CQ.WCM.isEditMode() || CQ.WCM.isDesignMode()) {
        // need to wait for editables to be ready before we can calc layout
        CQ.WCM.on("editablesready", function() {
            CQ.flow.Layout.adaptLayout();
        });
    }
    
    CQ.flow.Layout.adaptLayout();
});

// add resize listener
CQ.Ext.EventManager.onWindowResize(CQ.flow.Layout.adaptLayout, CQ.flow.Layout);
