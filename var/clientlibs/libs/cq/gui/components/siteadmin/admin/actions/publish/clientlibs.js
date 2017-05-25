(function(document, $) {

    $(document).fipo("tap.publish", "click.publish", ".cq-siteadmin-admin-actions-publish-activator", function(e) {

        // from path e.g. /libs/wcm/core/content/sites.html/content/geometrixx-media
        // to /libs/wcm/core/content/sites/createpagewizard.html#/content/geometrixx-media
        var gPath = Granite.HTTP.getPath();
        var lastDot = gPath.lastIndexOf(".");
        var extSuffixe = gPath.substr(lastDot);
        var suffixeSlash = extSuffixe.indexOf('/');

        var contentPath = extSuffixe.substr(suffixeSlash);
        if (suffixeSlash == -1) {
            contentPath = '/content';
        }

        var url = $('.publishwizard-url').data('url');
        var activator = $(this);

        var selectedItems = $(".foundation-collection").find(".foundation-selections-item");
        var params = "";
        for (var i = 0; i < selectedItems.length; i++) {
            var $item = $(selectedItems[i]);
            var path = $item.data("path");
            if (params.length > 0) {
                params += "&";
            }
            params += "item=" + encodeURI(path);
        }
        if (params.length > 0) {
            location.href = url + "?" + params;
        } else {
            var item = $(activator.data("foundationCollectionItem"));

            if (item) {
                contentPath = item.data("path");
            }

            // nothing selected -> activate current path
            location.href = url + "?item=" + encodeURI(contentPath);
        }

    });

})(document, Granite.$);
