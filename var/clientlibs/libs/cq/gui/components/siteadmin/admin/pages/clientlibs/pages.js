(function(document, $) {

    "use strict";

    var SEL_MODE_KEY = "pages.gridSelectionMode";

    var SEL_MODE_RESTORE_KEY = "pages.gridSelectionRestore";

    var SAVED_SELECTION_KEY = "pages.savedSelection";

    var _ignoreEvent = false;

    function getNs() {
        return location.pathname;
    }

    var $doc = $(document);
    $doc.off("change:gridSelect.pages");
    $doc.on("change:gridSelect.pages", ".foundation-collection", function(e) {
        if (_ignoreEvent) {
            return;
        }
        var ns = getNs();
        CUI.util.state.setSessionItem(SEL_MODE_KEY, e.value, ns);
        if (!e.val) {
            CUI.util.state.removeSessionItem(SAVED_SELECTION_KEY, ns);
            CUI.util.state.removeSessionItem(SEL_MODE_RESTORE_KEY, false);
        }
    });

    $doc.off("tap.pages");
    $doc.off("click.pages");
    $doc.fipo("tap.pages", "click.pages", ".foundation-collection-action", function(e) {
        var cv = CUI.CardView.get($(".foundation-collection"));
        var selected = cv.getSelection(false);
        var selectedPaths = [ ];
        for (var s = 0; s < selected.length; s++) {
            var path = $(selected[s]).data("path");
            if (path) {
                selectedPaths.push(path);
            }
        }
        CUI.util.state.setSessionItem(SEL_MODE_RESTORE_KEY, true, getNs());
        CUI.util.state.setSessionItem(SAVED_SELECTION_KEY, selectedPaths, getNs());
    });

    $doc.off("foundation-contentloaded.pages");
    $doc.on("foundation-contentloaded.pages", function(e) {
        _ignoreEvent = true;
        var $coll = $(".foundation-collection");
        if(!$coll.length) {
        	_ignoreEvent = false;	
        	return;
        }
        // initialize card view ...
        var ns = getNs();
        var isSelectionMode = (CUI.util.state.getSessionItem(SEL_MODE_KEY, ns) === true);
        var isRestore = (CUI.util.state.getSessionItem(SEL_MODE_RESTORE_KEY, ns) === true);
        var cv = CUI.CardView.get($coll);
        var isGridView = (cv.getDisplayMode() == CUI.CardView.DISPLAY_GRID);
        if (isRestore && isSelectionMode && isGridView) {
            $coll.trigger("foundation-mode-change",
                    [ "selection", $coll.data("foundationModeGroup")]);
        }
        if (isRestore && (!isGridView || (isGridView && isSelectionMode))) {
            var selectedPaths = CUI.util.state.getSessionItem(SAVED_SELECTION_KEY, ns);
            if (selectedPaths) {
                var model = cv.getModel();
                var itemCnt = model.getItemCount();
                var selCnt = selectedPaths.length;
                // determine items to select from the data-path of their elements
                var toSelect = [ ];
                if (selCnt > 0) {
                    for (var i = 0; i < itemCnt; i++) {
                        var item = model.getItemAt(i);
                        var $item = item.getItemEl();
                        var path = $item.data("path");
                        if (path) {
                            for (var s = 0; s < selCnt; s++) {
                                if (selectedPaths[s] === path) {
                                    toSelect.push(item);
                                    break;
                                }
                            }
                        }
                    }
                }
                // do the actual selection here so we can use the "more selection operations
                // following" optimization
                selCnt = toSelect.length;
                for (s = 0; s < selCnt; s++) {
                    cv.select(toSelect[s], (s !== (selCnt - 1)));
                }
                if(selCnt > 0) {
                	CUI.util.state.removeSessionItem(SEL_MODE_RESTORE_KEY, ns);
                	CUI.util.state.removeSessionItem(SAVED_SELECTION_KEY, ns);
                }
            }
        }
        
        _ignoreEvent = false;
    });

})(document, Granite.$);
