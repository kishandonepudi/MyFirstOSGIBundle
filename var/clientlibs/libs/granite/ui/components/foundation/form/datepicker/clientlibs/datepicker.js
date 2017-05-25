$(document).on("foundation-contentloaded", function(event) {

    var document = event.target;
    
    $(document).find("[data-datepicker-format]").each(function() {
        var format = $(this).data("datepicker-format");
        if (!format) return;
        
        var date = $(this).text();
        if (!date) return;
        
        var m = moment(date, ["YYYY-MM-DD[T]HH:mm:ss.000Z", "YYYY-MM-DD[T]HH:mm:ssZ", format]);
        if (!m) return;
        
        var formatted = m.format(format);
        $(this).replaceWith(formatted);
        
    });
                                                      
});
