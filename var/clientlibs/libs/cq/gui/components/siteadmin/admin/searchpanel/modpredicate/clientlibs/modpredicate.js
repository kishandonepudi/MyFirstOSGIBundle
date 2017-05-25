(function(document, $) {
    $(document).on ('change', '.searchpanel input[name=modpredicate]', function (evt) { 
        var checked = $(evt.target).attr('checked');
        var name    = $(evt.target).attr('name');
        var val     = $(evt.target).attr('value');
        var $form   = $(evt.target).closest('form');

        var _pad = function (num) {
            if (("" + num.length) == 1) return "0" + num;
            else return num;
        };

        $form.find("input[name=modpredicate]").attr ("checked", false);
        $(evt.target).attr('checked', checked);

        var nd = null;
        var now = new Date().getTime();
        if (checked && val == "HOUR") {
            nd = new Date(now-(1000*60*60*2));
        } else if (checked && val == "DAY") {
            nd = new Date(now-(1000*60*60*24));
        } else if (checked && val == "WEEK") {
            nd = new Date(now-(1000*60*60*24*7));
        } else if (checked && val == "MONTH") {
            nd = new Date(now-(1000*60*60*24*7*4));
        } else if (checked && val == "YEAR") {
            nd = new Date(now-(1000*60*60*24*7*4*12));
        }

        if (nd != null) {
            var nv = nd.getFullYear()+"-"+_pad(nd.getMonth()+1)+"-"+_pad(nd.getDate())+"T"+_pad(nd.getHours())+":"+_pad(nd.getMinutes())+":00";
            $form.find(".modpredicate-hidden-val").val(nv);
            $form.find(".modpredicate-hidden-val").disabled = false;
        } else {
            $form.find(".modpredicate-hidden-val").val("");
        }
        $form.find('input[type=hidden]').each(function() {
                this.disabled = !($(this).val());
             });

        $form.submit();
    });
})(document, Granite.$);
