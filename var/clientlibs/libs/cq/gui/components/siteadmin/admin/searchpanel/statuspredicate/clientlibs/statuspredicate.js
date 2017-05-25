(function(document, $) {
    var _pad = function (num) {
        if (("" + num.length) == 1) return "0" + num;
        else return num;
    };
 
    $(document).on ('change', '.searchpanel input[name=pubpredicate]', function (evt) { 
        var checked = $(evt.target).attr('checked');
        var name    = $(evt.target).attr('name');
        var val     = $(evt.target).attr('value');
        var $form   = $(evt.target).closest('form');
   
        $form.find("input[name=pubpredicate]").attr ("checked", false);
        $(evt.target).attr('checked', checked);

        if (checked) {
            $(".pubpredicate-hidden-val").val("Activate");
            $(".pubpredicate-hidden-val").disabled = false;
        }
        else {
            $(".pubpredicate-hidden-val").val("");
        }
        $form.find('input[type=hidden]').each(function() {
                this.disabled = !($(this).val());
             });
        $form.submit();
    });
    $(document).on ('change', '.searchpanel input[name=livecopypredicate]', function (evt) { 
        var checked = $(evt.target).attr('checked');
        var name    = $(evt.target).attr('name');
        var val     = $(evt.target).attr('value');
        var $form   = $(evt.target).closest('form');

        $form.find("input[name=livecopypredicate]").attr ("checked", false);
        $(evt.target).attr('checked', checked);

        if (checked) {
            $(".livecopypredicate-hidden-val").val("%");
            $(".livecopypredicate-hidden-val").disabled = false;
        }
        else {
            $(".livecopypredicate-hidden-val").val("");
        }
        $form.find('input[type=hidden]').each(function() {
                this.disabled = !($(this).val());
             });
        $form.submit();
    });
})(document, Granite.$);
