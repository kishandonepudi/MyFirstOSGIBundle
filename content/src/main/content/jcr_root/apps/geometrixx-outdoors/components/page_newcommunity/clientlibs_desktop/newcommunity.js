/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

(function (CQ, $CQ) {
    "use strict";
    CQ.soco.community = {};
    CQ.soco.community.callback = function () {
        // select blueprint
        $CQ('[name="bluePrintPathSelect"]').change(function () {
            var value = $CQ(this).val();
            $CQ('[name="bluePrintPath"]').val(value);
            $CQ('[name="msmMasterPages"]').val(value);

            var msmChapterPages = '';
            $CQ.getJSON(value + '.1.json', function(data) {
                // this is probably to slow for a long list of themes
                for (var key in data) {
                    if (data[key]['jcr:primaryType'] == 'cq:Page') {
                        msmChapterPages = msmChapterPages + value + '/' + key + ',';
                    }
                }
                $CQ('[name="msmChapterPages"]').val(msmChapterPages.slice(0, -1));
            });

            // show/hide description
            $CQ('.text [data-theme]').each(function() {
                if (value != $CQ(this).data('theme')) {
                    $CQ(this).parent().parent().hide();
                } else {
                    $CQ(this).parent().parent().fadeIn();
                }
            });
            
            // add selected class
            $CQ('[name="bluePrintPathSelect"]').each(function() {
                var $label = $(this).parent().parent().find('label');

                // add initial selected class to correct label
                $label.removeClass('selected');
                if($(this).is(':checked')) {
                    $label.addClass('selected');
                }
            });
            
        });
        
        //pre-populate 'msmChapterPages'
        var defaultPath = $CQ('[name="bluePrintPathSelect"]').val();
        $CQ.getJSON(defaultPath + '.1.json', function(data) {
            // this is probably to slow for a long list of themes
            var msmChapterPages = '';
            for (var key in data) {
                if (data[key]['jcr:primaryType'] == 'cq:Page') {
                    msmChapterPages = msmChapterPages + defaultPath + '/' + key + ',';
                }
            }
            $CQ('[name="msmChapterPages"]').val(msmChapterPages.slice(0, -1));
        });

        // Don't hide radio left column. We're using the label to show the clickable image.
        // TODO: would much better to stop these from being hidden in the first place.
        $CQ('.radio.section .form_leftcol').each(function() {
            $(this).css('display','block');
        });
        
        $CQ('[name="bluePrintPathSelect"]').each(function() {
            var $label = $(this).parent().parent().find('label');

            // add initial selected class to correct label
            $label.removeClass('selected');
            if($(this).is(':checked')) {
                $label.addClass('selected');
            }
            
            // Add css class to theme select radio labels
            $label.addClass('theme-select');
        });

        // hide description initially
        $CQ('.text [data-theme]').each(function() {
            if ($CQ('[name="bluePrintPath"]').val() != $CQ(this).data('theme')) {
                $CQ(this).parent().parent().hide();
            }
        });
        
        //validate name
        var namefield = $CQ('input[name$="liveCopyTitle"]');
        if(namefield.length > 0){
            namefield.parent().append('<button type="button" style="margin:0px 10px 0px 10px;" name="validate-name">Validate Name</button>');
            namefield.parent().append('<span class="hidden validate-result" name="validate-result" id="validate-result"></span>');
        }

        var rootfield = $CQ('input[name$="liveCopyPath"]');
         
        function validateGroupName(){
            return (function(){
                var resultfield = $CQ('[name="validate-result"]');
                
                $CQ.ajax({
                    dataType: "json",
                    url: "/services/validategroupname",
                    data: "liveCopyTitle="+namefield.val()+"&grouproot="+rootfield.val(),
                    success: function(msg) {
                        if(msg.value=="true"){
                            resultfield.text(CQ.I18n.getVarMessage("name is valid."));
                            resultfield.removeClass("invalid hidden").addClass("valid");
                        }else{
                            resultfield.text(CQ.I18n.getVarMessage("name is invalid!"));
                            resultfield.removeClass("valid hidden").addClass("invalid");
                        }
    
                    },
                    error: function(req, status, error) {
                        resultfield.text(msg.value);
                        resultfield.removeClass("valid hidden").addClass("invalid");
                    }
                });  
            });
        }
        
        namefield.blur(validateGroupName()); 
        
        $CQ('[name="validate-name"]').click(validateGroupName());        
    };
})(CQ, $CQ);