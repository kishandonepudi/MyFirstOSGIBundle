(function(document, $) {
    (function () {
        var validateInput = function (evt) {
            var val = $(evt.target).attr('value').trim();
            if (val == "") {
                $(evt.target).closest("form").data("foundation-form-disable", "true");
            } else {
                $(evt.target).closest("form").data("foundation-form-disable", "");
            }
        };

        $(document).on('keypress', '.searchpanel input[name = fulltext]', validateInput); //required to catch <enter>
        $(document).on('input', '.searchpanel input[name = fulltext]', validateInput); //required to catch any other change
        $(document).on('click', '.searchpanel .search > button', function (e) {
            var val = $(e.target).closest('form').find('input[name = fulltext]').attr('value').trim();
            if (val == "") {
                e.preventDefault();
                return false;
            } else {
                return true;
            }
        });
    })();
    //cache-killer for CQ-26457
    $("form").submit( function(e) {
        $(this).find('input[name="_dc"]').val((new Date()).getTime());
    });
})(document, Granite.$);
