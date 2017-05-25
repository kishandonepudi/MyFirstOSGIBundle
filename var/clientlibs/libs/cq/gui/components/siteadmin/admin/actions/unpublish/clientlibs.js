(function(document, $) {

    var MAX_ENTRIES = 12;

    var multipleText = null;

    var rel = ".cq-siteadmin-admin-actions-unpublish";


    function replicationStarted(xhr, status) {
        if (status !== "success") {
            $(rel + "-error").modal().modal("show");
            return;
        }
        var contentApi = $(".foundation-content").adaptTo("foundation-content");
        contentApi.refresh();
    }

    function unpublishPages() {
        $(rel).modal("hide");
        var items = $(".foundation-collection").find(".foundation-selections-item");
        var paths = [];
        for (var i = 0; i < items.length; i++) {
            paths.push($(items[i]).data("path"));
        }
        if (paths.length > 0) {
            var url = Granite.HTTP.externalize("/bin/replicate.json");
            var cmd = "Deactivate";
            var settings = {
                "type": "POST",
                "data": {
                    "_charset_": "utf-8",
                    "cmd": cmd,
                    "path": paths
                },
                "complete": replicationStarted
            };
            $.ajax(url, settings);
        }
    }

    $(document).fipo("tap." + rel, "click." + rel, rel + " button.primary", function(e) {
        unpublishPages();
    });

    $(document).on("beforeshow." + rel, ".modal" + rel, function(e) {
        var $modal = $(rel);
        var $multiple = $modal.find(".multiple");
        var selectedItems = $(".foundation-collection article.foundation-selections-item");
        if (selectedItems.length == 1) {
            $modal.find(".single").removeClass("hidden");
            $multiple.addClass("hidden");
        } else {
            $modal.find(".single").addClass("hidden");
            $multiple.removeClass("hidden");
        }
        if (!multipleText) {
            multipleText = $multiple.text();
        }
        $multiple.text(multipleText.replace(/%no%/gi, selectedItems.length));
        var $pageList = $modal.find(".page-list");
        $pageList.empty();
        var itemCnt = Math.min(selectedItems.length, MAX_ENTRIES);
        for (var i = 0; i < itemCnt; i++) {
            var $item = $(selectedItems[i]);
            if (i > 0) {
                $pageList.append($("<br>"));
            }
            $pageList.append($item.find("h4").text());
        }
        if (selectedItems.length > itemCnt) {
            $pageList.append($("<br>")).append(" …");
        }
    });

}(document, Granite.$));
