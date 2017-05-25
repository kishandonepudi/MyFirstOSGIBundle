/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/*@cc_on(function(){
   var e = ['abbr','article','aside','audio','canvas','details','figcaption','figure','footer','header','hgroup','mark','meter','nav','output','progress','section','summary','time','video'];
   for (var i = e.length; i-- > 0;) document.createElement(e[i]);
})();
@*/

(function($) {
    $(function() {
        $('input.cq-auto-clear').each(function() {
            var def = this.value;
            this.onfocus = function() {
                if (this.value == def) {
                    this.value = "";
                }
            };
            this.onblur = function() {
                if (this.value == "") {
                    this.value = def;
                }
            };
        });

        $('#topnav').each(function() {

            function getSubnav(ele) {
                if (ele.nodeName.toLowerCase() == 'li') {
                    var subnav = $('> ul', ele);
                    return subnav.length ? subnav[0] : null;
                } else {
                    return ele;
                }
            }

            function hide() {
                var subnav = getSubnav(this);
                if (subnav) {
                    $(subnav).hide();
                }
            }

            function show() {
                var subnav = getSubnav(this);
                if (subnav) {
                    $(subnav).show();
                }
            }

            $('ul, li', this).hover(show, hide);
            $('li', this).hover(
                    function() {
                        $(this).addClass('hover');
                    },
                    function() {
                        $(this).removeClass('hover');
                    }
                    );
        });

    });
})($CQ || $);
