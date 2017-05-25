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
(function($) {
    $(function () {
        // Used to output caught errors
        function errorLog(error, message) {
            try {
                if ($.cq.isAuthor() || window.location.hash == '#debug') {
                    if (typeof console != 'undefined' && typeof console.log  != 'undefined') {
                        console.log(error);
                        console.log(message);
                    }
                    alert(error.name+':\n'+error.message+'.\n'+message+'.');
                }
            } catch (e) { }
        }

        try {
            // Opacity fading conflicts in IE8 with the PNG fix and text anti-aliasing
            var fadingSpeed = $.browser.msie ? 0 : 250;

            // Removes the URL hash if it corresponds to the id of an element in the given context
            function removeHash(context) {
                try {
                    if (window.location.hash.length > 0 && $(window.location.hash, context).length > 0) {
                        window.location = (window.location+'').replace(window.location.hash, '');
                    }
                } catch (e) {
                    errorLog(e, 'Could not remove hash');
                }
            }

            // carousel code
            try {
                $('.cq-carousel').each(function () {
                    var carousel = $(this);
                    var playDelay = +$("var[title='play-delay']", this).text();
                    if (!playDelay) {
                        playDelay = 6000;
                    }
                    var slidingSpeed = +$("var[title='transition-time']", this).text();
                    if (!slidingSpeed) {
                        slidingSpeed = 1000;
                    }
                    var banners = $('.cq-carousel-banners', this);
                    //do not why, but
                    // var links = $('.cq-carousel-banner-switch a', this);
                    //returns more links than expected after component reload. Changed to "find" = works......
                    var switcher = $('.cq-carousel-banner-switch', this);
                    var links = switcher.find('a');
                    var items = $('.cq-carousel-banner-item', this);
                    var width = items.outerWidth();
                    var itemActive = items.filter(':first');
                    var itemPrevious = null;
                    var interval = null;
                    var i = 0;

                    var ctlPrev = $('a.cq-carousel-control-prev', this);
                    ctlPrev.click(function() {
                        if (ctlPrev.is('.cq-carousel-active')) {
                            $(links[(i+links.length-1)%links.length]).click();
                        }
                        return false;
                    });
                    var ctlNext = $('a.cq-carousel-control-next', this);
                    ctlNext.click(function() {
                        if (ctlNext.is('.cq-carousel-active')) {
                            $(links[(i+1)%links.length]).click();
                        }
                        return false;
                    });
                    if (links.length > 1) {
                        ctlNext.addClass('cq-carousel-active');
                    }
                    function play() {
                        stop();
                        if( playDelay > 0) {
                            interval = setInterval(function () {
                                $(links[(i+1)%links.length]).click();
                            }, playDelay);
                        }
                    }
                    function stop() {
                        if (interval !== null) {
                            clearInterval(interval);
                            interval = null;
                        }
                    }

                    // Show first item (needed for browsers that don't support CSS3 selector :first-of-type)
                    if (fadingSpeed || $.browser.version > 6) {
                        itemActive.css('left', 0);
                    } else {
                        itemActive.show();
                    }

                    links
                        .click(function () {
                            var link = $(this);
                            var itemNew = items.filter(link.attr('href'));
                            var j = itemNew.prevAll().length;
                            var direction = (j > i || interval !== null) ? 1 : -1;

                            if (!link.is('.cq-carousel-active')) {
                                links.removeClass('cq-carousel-active');
                                link.addClass('cq-carousel-active');

                                if (itemActive.is(':animated')) {
                                    itemActive.stop(true, true);
                                    itemPrevious.stop(true, true);
                                }

                                if (fadingSpeed) {
                                    itemNew.css({'left': direction*width}).animate({'left': 0, 'opacity': 1}, slidingSpeed);
                                    itemActive.animate({'left': -direction*width, 'opacity': 0}, slidingSpeed);
                                } else if ($.browser.version > 6) {
                                    itemNew.css({'left': direction*width, opacity: 1}).animate({'left': 0}, slidingSpeed);
                                    itemActive.animate({'left': -direction*width}, slidingSpeed);
                                } else {
                                    itemNew.fadeIn();
                                    itemActive.fadeOut();
                                }

                                itemPrevious = itemActive;
                                itemActive = itemNew;
                                i = j;
                                if (i > 0) {
                                    ctlPrev.addClass('cq-carousel-active');
                                } else {
                                    ctlPrev.removeClass('cq-carousel-active');
                                }
                                if (i < links.length-1) {
                                    ctlNext.addClass('cq-carousel-active');
                                } else {
                                    ctlNext.removeClass('cq-carousel-active');
                                }
                            }

                            return false;
                        })
                        .each(function () {
                            var link = $(this);

                            link.attr('title', link.text());
                        })
                        .filter(':first').addClass('cq-carousel-active');

                    play();
                    carousel.hover(
                            function() {
                                stop();
                                ctlPrev.fadeIn();
                                ctlNext.fadeIn();
                            },
                            function() {
                                play();
                                ctlPrev.fadeOut();
                                ctlNext.fadeOut();
                            }
                    );

                    // Accessing the page with the anchor of a banner in the URL can break the layout
                    removeHash(this);
                });
            } catch (e) {
                errorLog(e, 'Could not initialize the banners');
            }
        } catch (e) {
            errorLog(e, 'Init failed');
        }
    });
})($CQ || $);
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
/**
 * Utility functions for forms components.
 */
function cq5forms_isArray(obj) {
	return typeof obj.length == 'number' && obj.item;
}

function cq5forms_showMsg(fid, field, msg, index) {
    var f = document.forms[fid].elements[field];
    alert(msg);
    if ( cq5forms_isArray(f) ) {
    	if ( !index) index = 0;
    	f[index].focus();
    } else {
    	f.focus()
    }
}
function cq5forms_isEmpty(obj) {
    if (obj === undefined) {
        // don't trigger validation messages on hidden fields (as in show/hide, not type=hidden)
        return false;
    }
    var empty = true;
    if ( cq5forms_isArray(obj)) {
        for(i=0;i<obj.length;i++) {
            if (obj[i].type == "radio" || obj[i].type == "checkbox" ) {
                if (obj[i].checked) {empty = false;}
            } else if (obj[i].localName == "option") {
                if (obj[i].selected) {empty = false;}
            } else {
                if (obj[i].value.length>0) { empty = false;}
            }
        }
    } else {
        if (obj.type == "radio" || obj.type == "checkbox" ) {
            if (obj.checked) {empty = false;}
        } else {
            if (obj.value.length>0) { empty = false;}
        }
    }
    return empty;
}
function cq5forms_regcheck(obj, pattern) {
    var result=false;
    var t = pattern.exec(obj);
    if (t) {
        var len = obj.length;
        var pattlen = t[0].length;
        result = (pattlen == len);
    }
    return result;
}

/**
 * Check the MultiResource checkbox if the value of the according field changes.
 * @param {Event} evt The event
 * @param {String} name The name of the mr checkbox
 * @param {boolean} force Force to check the mr checkbox
 */
function cq5forms_multiResourceChange(evt, name, force) {
    if (!force) {
        if (!evt) evt = window.event;
        if (evt.keyCode < 48 && evt.keyCode != 8 && evt.keyCode != 46) {
            //skip control keys, allow backspace and delete
            return;
        }
    }
    try {
        document.getElementById(name).checked = true;
    }
    catch (e) {}
}
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
(function($) {
    $(function () {
        // Used to output caught errors
        function errorLog(error, message) {
            try {
                if ($.cq.isAuthor() || window.location.hash == '#debug') {
                    if (typeof console != 'undefined' && typeof console.log  != 'undefined') {
                        console.log(error);
                        console.log(message);
                    }
                    alert(error.name+':\n'+error.message+'.\n'+message+'.');
                }
            } catch (e) { }
        }

        try {
            // Opacity fading conflicts in IE8 with the PNG fix and text anti-aliasing
            var fadingSpeed = $.browser.msie ? 0 : 250;

            // Removes the URL hash if it corresponds to the id of an element in the given context
            function removeHash(context) {
                try {
                    if (window.location.hash.length > 0 && $(window.location.hash, context).length > 0) {
                        window.location = (window.location+'').replace(window.location.hash, '');
                    }
                } catch (e) {
                    errorLog(e, 'Could not remove hash');
                }
            }

            // carousel code
            try {
                $('.cq-carousel').each(function () {
                    var carousel = $(this);
                    var playDelay = +$("var[title='play-delay']", this).text();
                    if (!playDelay) {
                        playDelay = 6000;
                    }
                    var slidingSpeed = +$("var[title='transition-time']", this).text();
                    if (!slidingSpeed) {
                        slidingSpeed = 1000;
                    }
                    var banners = $('.cq-carousel-banners', this);
                    //do not why, but
                    // var links = $('.cq-carousel-banner-switch a', this);
                    //returns more links than expected after component reload. Changed to "find" = works......
                    var switcher = $('.cq-carousel-banner-switch', this);
                    var links = switcher.find('a');
                    var items = $('.cq-carousel-banner-item', this);
                    var width = items.outerWidth();
                    var itemActive = items.filter(':first');
                    var itemPrevious = null;
                    var interval = null;
                    var i = 0;

                    var ctlPrev = $('a.cq-carousel-control-prev', this);
                    ctlPrev.click(function() {
                        if (ctlPrev.is('.cq-carousel-active')) {
                            $(links[(i+links.length-1)%links.length]).click();
                        }
                        return false;
                    });
                    var ctlNext = $('a.cq-carousel-control-next', this);
                    ctlNext.click(function() {
                        if (ctlNext.is('.cq-carousel-active')) {
                            $(links[(i+1)%links.length]).click();
                        }
                        return false;
                    });
                    if (links.length > 1) {
                        ctlNext.addClass('cq-carousel-active');
                    }
                    function play() {
                        stop();
                        if( playDelay > 0) {
                            interval = setInterval(function () {
                                $(links[(i+1)%links.length]).click();
                            }, playDelay);
                        }
                    }
                    function stop() {
                        if (interval !== null) {
                            clearInterval(interval);
                            interval = null;
                        }
                    }

                    // Show first item (needed for browsers that don't support CSS3 selector :first-of-type)
                    if (fadingSpeed || $.browser.version > 6) {
                        itemActive.css('left', 0);
                    } else {
                        itemActive.show();
                    }

                    links
                        .click(function () {
                            var link = $(this);
                            var itemNew = items.filter(link.attr('href'));
                            var j = itemNew.prevAll().length;
                            var direction = (j > i || interval !== null) ? 1 : -1;

                            if (!link.is('.cq-carousel-active')) {
                                links.removeClass('cq-carousel-active');
                                link.addClass('cq-carousel-active');

                                if (itemActive.is(':animated')) {
                                    itemActive.stop(true, true);
                                    itemPrevious.stop(true, true);
                                }

                                if (fadingSpeed) {
                                    itemNew.css({'left': direction*width}).animate({'left': 0, 'opacity': 1}, slidingSpeed);
                                    itemActive.animate({'left': -direction*width, 'opacity': 0}, slidingSpeed);
                                } else if ($.browser.version > 6) {
                                    itemNew.css({'left': direction*width, opacity: 1}).animate({'left': 0}, slidingSpeed);
                                    itemActive.animate({'left': -direction*width}, slidingSpeed);
                                } else {
                                    itemNew.fadeIn();
                                    itemActive.fadeOut();
                                }

                                itemPrevious = itemActive;
                                itemActive = itemNew;
                                i = j;
                                if (i > 0) {
                                    ctlPrev.addClass('cq-carousel-active');
                                } else {
                                    ctlPrev.removeClass('cq-carousel-active');
                                }
                                if (i < links.length-1) {
                                    ctlNext.addClass('cq-carousel-active');
                                } else {
                                    ctlNext.removeClass('cq-carousel-active');
                                }
                            }

                            return false;
                        })
                        .each(function () {
                            var link = $(this);

                            link.attr('title', link.text());
                        })
                        .filter(':first').addClass('cq-carousel-active');

                    play();
                    carousel.hover(
                            function() {
                                stop();
                                ctlPrev.fadeIn();
                                ctlNext.fadeIn();
                            },
                            function() {
                                play();
                                ctlPrev.fadeOut();
                                ctlNext.fadeOut();
                            }
                    );

                    // Accessing the page with the anchor of a banner in the URL can break the layout
                    removeHash(this);
                });
            } catch (e) {
                errorLog(e, 'Could not initialize the banners');
            }
        } catch (e) {
            errorLog(e, 'Init failed');
        }
    });
})($CQ || $);
/*
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
 */
/*
 * location: libs/social/commons/components/ugcparbase/clientlibs/commons.js
 * category: [cq.collab.comments,cq.social.commons]
 */
(function(CQ, $CQ) {
    "use strict";
    CQ.soco = CQ.soco || {};
    CQ.soco.commons = CQ.soco.commons || {};
    CQ.soco.TEMPLATE_PARAMNAME = ":templatename";
    CQ.soco.filterHTMLFragment = CQ.soco.filterHTMLFragment ||
    function(fragment, targetFunction) {
        try {
            targetFunction.call(null, $CQ(fragment));
        } catch(e) {
            throw e;
        }
    };
    var localEvents = {};
    localEvents.CLEAR = "lcl.cq.soco.events.clear";
    CQ.soco.commons.handleOnBlur = function(el, message) {
        //Apparently the RTE reports a <br/> as it's empty text
        if(($CQ(el).val() === "") || ($CQ(el).val() === "<br/>")) {
            $CQ(el).val(message);
        }
    };
    CQ.soco.commons.handleOnFocus = function(el, message) {
        if($CQ(el).val() === message) {
            $CQ(el).val("");
        }
    };
    CQ.soco.commons.validateFieldNotEmptyOrDefaultMessage = function(field, message) {
        var textValue = $CQ(field).val();
        var divTextValue = '<div>' + textValue + '</div>';
        if($CQ.trim(textValue).length != 0) {
            if (($CQ.trim($CQ(divTextValue).text()).length === 0) || ($CQ.trim(textValue) === message)) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    };

    CQ.soco.commons.clientSideComposer = function(targetForm, templateName, success, failure, addedData, action, verb) {
        var formAction = action || targetForm.attr('action'),
            formVerb = verb || targetForm.attr('method') || "POST";
        targetForm.find(":submit").click(function(event) {
            // If the frm has a file upload field then we can't do client side rendering, without using a jquery ui
            //  plugin or HTML5 to handle the upload.
            if((targetForm.find(":input[type='file']").val() != undefined) && targetForm.find(":input[type='file']").val() != "") {
                return;
            }
            event.preventDefault();
            // A submit button should only submit it's closest parent form and there is only one of those.
            var form = $CQ(event.target).closest("form")[0],
                formData;
            // Check if the form has an onsubmit function, which is used for validation
            if($CQ.isFunction(form.onsubmit)) {
                // If it returns false, then do not make the request because that signifies
                // validation failed.
                if(!form.onsubmit.call(form,event)) {
                    // Need to figure out a way to communicate this failure back to the caller,
                    // invoking "failure" breaks some of the symmetry.
                    return;

                }
            }

            formData = $CQ(form).serialize();
            if(templateName) {
                formData += "&" + encodeURIComponent(CQ.soco.TEMPLATE_PARAMNAME) + "=" + encodeURIComponent(templateName);
            }
            for(var key in addedData) {
                formData += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(addedData[key]);
            }

            $CQ(form).find(":input:visible").each(function() {
                $CQ(this).attr('disabled', 'disabled');
            });

            var localSuccess = function(data, status, jqxhr) {
                if(jqxhr.status === 201) {
                    $CQ(form).find(":input:visible").each(function() {
                        switch(this.type) {
                        case "password":
                        case "select-multiple":
                        case "select-one":
                        case "text":
                        case "textarea":
                            $CQ(this).val("");
                            break;
                        case "checkbox":
                        case "radio":
                            this.checked = false;
                        }
                        $CQ(this).removeAttr('disabled');
                    });
                    // This like the RTE hide form elements that are still
                    // used so notify them to clear.
                    $CQ(form).find(":input:hidden").each(function() {
                        $CQ(this).trigger(localEvents.CLEAR);
                    });
                    success.call(null, data, status, jqxhr);
                } else {
                    $CQ(form).find(":input:visible").each(function() {
                        $CQ(this).removeAttr('disabled');
                    });
                    failure.call(null, jqxhr, status);
                }
            };
            var localFail = function(jqxhr, status) {
                $CQ(form).find(":input:visible").each(function() {
                    $CQ(this).removeAttr('disabled');
                });
                failure.call(null, jqxhr, status);
            };
            $CQ.ajax(formAction, {
                data: formData,
                success: localSuccess,
                fail: localFail,
                type: formVerb
            });
        });
    };
    CQ.soco.commons.fillInputFromClientContext = function(jqFields, clientcontextProperty) {
        if(window.CQ_Analytics && CQ_Analytics.CCM) {
            $CQ(function() {
                var store = CQ_Analytics.CCM.getRegisteredStore(CQ_Analytics.ProfileDataMgr.STORENAME);
                if(store) {
                    var name = store.getProperty(clientcontextProperty, true) || '';
                    jqFields.val(name);
                }

                CQ_Analytics.CCM.addListener('storesloaded', function() {
                    var store = CQ_Analytics.CCM.getRegisteredStore(CQ_Analytics.ProfileDataMgr.STORENAME);
                    if(store && store.addListener) {
                        var name = store.getProperty(clientcontextProperty, true) || '';
                        jqFields.val(name);
                        store.addListener('update', function() {
                            var name = store.getProperty(clientcontextProperty, true) || '';
                            jqFields.val(name);
                        });
                    }
                });
            });
        }
    };

    CQ.soco.commons.activateRTE = function(targetForm, handlers) {
        var targetTextArea = targetForm.find("textarea"),
            width = targetTextArea.width() + 4,
            height = targetTextArea.height() + 60,
            controls = "bold italic underline",
            listeners = {},
            targetElement = targetTextArea[0],
            key, i, handlers = handlers || ["onfocus", "onblur"];
        // For some reason the RTE jquery plugin doesn't remap
        // handlers that are attached to the editor, so map the
        // handlers we are using.
        for(i = 0; i < handlers.length; i++) {
            key = handlers[i];
            if(null !=  targetElement[key]) {
                listeners[key.substring(2)] = targetElement[key];
            }
        }

        key = null;
        $CQ(targetTextArea).height(targetTextArea.height() + 60);
        var editor = targetTextArea.cleditor({
            width: width,
            height: height,
            controls: controls
        })[0];

        //Crazy hack to get height before its displayed
        var clonedToolbar = editor.$toolbar.clone().attr("id", false).css({
            visibility: "hidden",
            display: "block",
            position: "absolute"
        });
        $CQ('body').append(clonedToolbar);
        var toolBarHeight = $CQ(clonedToolbar).height();
        clonedToolbar.remove();
        //Hack Ends
        $CQ(editor.$frame[0]).ready(function() {
            $CQ(editor.$frame[0]).height(editor.options.height - toolBarHeight);
        });
        for(key in listeners) {
            $CQ(editor.$frame[0].contentWindow).bind(
            key, (function(func) {
                return function(event) {
                    var before = $CQ(targetElement).val();
                    func.call(targetElement, event);
                    if(before !== $CQ(targetElement).val()) {
                        editor.updateFrame();
                    }
                };
            }(listeners[key])));
        }
        targetTextArea.on(localEvents.CLEAR, function(event) {
            $CQ(targetElement).val("");
            $CQ(editor.$frame[0].contentWindow).blur();
        });
    };

    CQ.soco.commons.openModeration = function() {
        CQ.shared.Util.open(CQ.shared.HTTP.externalize('/communities.html/content/usergenerated' + CQ.WCM.getPagePath()));
    };
})(CQ, $CQ);
/*
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
 */
(function(CQ, $CQ) {
	"use strict";
	CQ.soco = CQ.soco || {};
	CQ.soco.comments = CQ.soco.comments || {};
	CQ.soco.comments.events = CQ.soco.comments.events || {};
	CQ.soco.comments.strings = CQ.soco.comments.strings || {};
	CQ.soco.comments.events.ADDED = "CQ.soco.comments.events.ADDED";
	CQ.soco.comments.events.OPEN_REPLY = "CQ.soco.comments.events.OPEN_REPLY";
	CQ.soco.comments.events.CLOSE_REPLY = "CQ.soco.comments.events.CLOSE_REPLY";
	CQ.soco.comments.events.DELETE = "CQ.soco.comments.events.DELETE";

	CQ.soco.comments.toggleReplyForm = function(target, formURL, isRTEenabled) {
		// From the Reply link that was clicked find the closest parent
		// comment-replies then get that div's
		// reply-form holder
		var replyFormDiv = $CQ(target).closest(".comment-replies").find(
				".reply-form").first(), numForms;
		if (formURL && replyFormDiv.children().length === 0) {
			try {
				numForms = $CQ(".comment-replies .reply-form > form").length;
				formURL = CQ.shared.HTTP.noCaching(formURL + "&composerCount="
						+ numForms);
				CQ.shared.HTTP.get(formURL,
						function(o, ok, response) {
							var result = response.responseText;
							replyFormDiv.html(result);
							var appendTarget = replyFormDiv
									.closest(".comment-replies");
							if (appendTarget.length === 0) {
								appendTarget = replyFormDiv.parent();
							}
							CQ.soco.comments.attachToComposer(replyFormDiv
									.find("form").first(), appendTarget,
									"comment");
							if (isRTEenabled) {
								CQ.soco.commons.activateRTE(replyFormDiv.find(
										"form").first());
							}
							// evaluate the first form element's id and remove
							// the '-form' ending to use it as the idPrefix for
							// updating the form
							// Disabling this till I can get the client context
							// running again. This appears to be a way to of
							// taking the changes from the client context into
							// the form.
							// var formElementId =
							// $CQ(form).children("form").attr("id");
							// if (formElementId) {
							// var tokens = formElementId.split("-");
							// tokens.length = tokens.length - 1;
							// var idPrefix = tokens.join("-");
							// if (CQ_Analytics && CQ_Analytics.CCM) {
							// var store =
							// CQ_Analytics.CCM.getRegisteredStore(CQ_Analytics.ProfileDataMgr.STORENAME);
							// if (store) {
							// CQ_collab_comments_formStateChanged(idPrefix,
							// store)
							// }
							// }
							// }
						});
			} catch (e) {
				throw e;
			}

		}
		replyFormDiv.toggle();
	};
	CQ.soco.comments.showError = function(targetForm, errorMessage) {
		var errorElem = $CQ(targetForm).find("div.comment-error");
		if (!errorElem) {
			alert(errorMessage);
		} else {
			errorElem.text(errorMessage);
		}
	};

	CQ.soco.comments.validateCommentForm = function(targetForm, defaultMessage,
			enterCommentError) {
		var form = $CQ(targetForm), idPrefix = "#" + form.attr("id");
		var message = form.find("textarea").first().val();
		if (message === undefined || message === "" || message === defaultMessage) {
			CQ.soco.comments.showError(targetForm, enterCommentError);
			return false;
		}
		try {
			var check = form.find(idPrefix + "-id");
			if (check.length === 0) {
				check = document.createElement("input");
				check.id = form.attr("id") + "-id";
				check.type = "hidden";
				check.name = "id";
				check.value = "nobot";
				form.append(check);
			}
		} catch (e) {
			return false;
		}
		return true;
	};

	var refreshReplyCount = function(jqComment) {
		var numReplies = +(jqComment.data("numreplies") || 0);
		if (numReplies === 1) {
			jqComment.find("span.numReplies").filter(":first").text(
					CQ.I18n.getMessage("{0} Reply", numReplies));
		} else if (numReplies === 0) {
			jqComment.find("span.numReplies").filter(":first").text(
					CQ.I18n.getMessage("0 Replies"));
		} else {
			jqComment.find("span.numReplies").filter(":first").text(
					CQ.I18n.getMessage("{0} Replies", (numReplies + '')));
		}

	};
	CQ.soco.comments.removeHandler = function(event) {
		var targetComment = $CQ(event.target).closest(".comment").parent();
		if (targetComment.length === 0) {
			return;
		}
		event.stopPropagation();
		$CQ.post($CQ(event.target).closest("form").attr("action"), function(
				data, textStatus, jqXHR) {
			var parentComment = targetComment;
			var numReplies = +(parentComment.data("numreplies") || 0);
			parentComment.data("numreplies", (numReplies - 1));
			refreshReplyCount(parentComment);
			$CQ(event.target).closest(".comment").remove();
		});
	};
	CQ.soco.comments.addHandler = function(event) {
		var parentComment = $CQ(event.target).parent().closest(
				".comment-replies");
		if (parentComment.length === 0) {
			return;
		}
		event.stopPropagation();
		var numReplies = +(parentComment.data("numreplies") || 0);
		parentComment.data("numreplies", (numReplies + 1));
		refreshReplyCount(parentComment);
		CQ.soco.comments.toggleReplyForm(event.target);
	};

	CQ.soco.comments.bindOnAdded = function(targetComment) {
		targetComment.bind(CQ.soco.comments.events.ADDED,
				CQ.soco.comments.addHandler);
	};

	CQ.soco.comments.bindOnRemove = function(targetComment) {
		targetComment.bind(CQ.soco.comments.events.DELETE,
				CQ.soco.comments.removeHandler);
	};

	CQ.soco.comments.attachToComposer = function(targetForm, appendTarget,
			templateName) {
		var success = function(data, status, jqxhr) {
			CQ.soco.filterHTMLFragment(data, function(node) {
				var newNode = node.appendTo(appendTarget);
				newNode.bind(CQ.soco.comments.events.DELETE,
						CQ.soco.comments.removeHandler);
				newNode.bind(CQ.soco.comments.events.ADDED,
						CQ.soco.comments.addHandler);
			});
			targetForm.trigger(CQ.soco.comments.events.ADDED);
			targetForm.find("textarea").blur();

		};
		var failure = function(jqXHR, textStatus) {
			throw new Error(textStatus);
		};
		CQ.soco.commons.clientSideComposer(targetForm, templateName, success,
				failure, {});
	};
})(CQ, $CQ);
/* ===================================================
 * bootstrap-transition.js v2.1.1
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  $(function () {

    "use strict"; // jshint ;_;


    /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
     * ======================================================= */

    $.support.transition = (function () {

      var transitionEnd = (function () {

        var el = document.createElement('bootstrap')
          , transEndEventNames = {
               'WebkitTransition' : 'webkitTransitionEnd'
            ,  'MozTransition'    : 'transitionend'
            ,  'OTransition'      : 'oTransitionEnd otransitionend'
            ,  'transition'       : 'transitionend'
            }
          , name

        for (name in transEndEventNames){
          if (el.style[name] !== undefined) {
            return transEndEventNames[name]
          }
        }

      }())

      return transitionEnd && {
        end: transitionEnd
      }

    })()

  })

}(window.jQuery);
/* ==========================================================
 * bootstrap-carousel.js v2.1.1
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* CAROUSEL CLASS DEFINITION
  * ========================= */

  var Carousel = function (element, options) {
    this.$element = $(element)
    this.options = options
    this.options.slide && this.slide(this.options.slide)
    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.prototype = {

    cycle: function (e) {
      if (!e) this.paused = false
      this.options.interval
        && !this.paused
        && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
      return this
    }

  , to: function (pos) {
      var $active = this.$element.find('.item.active')
        , children = $active.parent().children()
        , activePos = children.index($active)
        , that = this

      if (pos > (children.length - 1) || pos < 0) return

      if (this.sliding) {
        return this.$element.one('slid', function () {
          that.to(pos)
        })
      }

      if (activePos == pos) {
        return this.pause().cycle()
      }

      return this.slide(pos > activePos ? 'next' : 'prev', $(children[pos]))
    }

  , pause: function (e) {
      if (!e) this.paused = true
      if (this.$element.find('.next, .prev').length && $.support.transition.end) {
        this.$element.trigger($.support.transition.end)
        this.cycle()
      }
      clearInterval(this.interval)
      this.interval = null
      return this
    }

  , next: function () {
      if (this.sliding) return
      return this.slide('next')
    }

  , prev: function () {
      if (this.sliding) return
      return this.slide('prev')
    }

  , slide: function (type, next) {
      var $active = this.$element.find('.item.active')
        , $next = next || $active[type]()
        , isCycling = this.interval
        , direction = type == 'next' ? 'left' : 'right'
        , fallback  = type == 'next' ? 'first' : 'last'
        , that = this
        , e = $.Event('slide', {
            relatedTarget: $next[0]
          })

      this.sliding = true

      isCycling && this.pause()

      $next = $next.length ? $next : this.$element.find('.item')[fallback]()

      if ($next.hasClass('active')) return

      if ($.support.transition && this.$element.hasClass('slide')) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $next.addClass(type)
        $next[0].offsetWidth // force reflow
        $active.addClass(direction)
        $next.addClass(direction)
        this.$element.one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
      } else {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $active.removeClass('active')
        $next.addClass('active')
        this.sliding = false
        this.$element.trigger('slid')
      }

      isCycling && this.cycle()

      return this
    }

  }


 /* CAROUSEL PLUGIN DEFINITION
  * ========================== */

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('carousel')
        , options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option)
        , action = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.cycle()
    })
  }

  $.fn.carousel.defaults = {
    interval: 5000
  , pause: 'hover'
  }

  $.fn.carousel.Constructor = Carousel


 /* CAROUSEL DATA-API
  * ================= */

  $(function () {
    $('body').on('click.carousel.data-api', '[data-slide]', function ( e ) {
      var $this = $(this), href
        , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
        , options = !$target.data('modal') && $.extend({}, $target.data(), $this.data())
      $target.carousel(options)
      e.preventDefault()
    })
  })

}(window.jQuery);
/*
 * debouncedresize: special jQuery event that happens once after a window resize
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work? 
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function($) {

var $event = $.event,
	$special,
	resizeTimeout;

$special = $event.special.debouncedresize = {
	setup: function() {
		$( this ).on( "resize", $special.handler );
	},
	teardown: function() {
		$( this ).off( "resize", $special.handler );
	},
	handler: function( event, execAsap ) {
		// Save the context
		var context = this,
			args = arguments,
			dispatch = function() {
				// set correct event type
				event.type = "debouncedresize";
				$event.dispatch.apply( context, args );
			};

		if ( resizeTimeout ) {
			clearTimeout( resizeTimeout );
		}

		execAsap ?
			dispatch() :
			resizeTimeout = setTimeout( dispatch, $special.threshold );
	},
	threshold: 150
};

})(jQuery);
/*
 ADOBE CONFIDENTIAL
 __________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function($) {

    $(function() {
        var $signIn = $("header .signin");
        var $signInBtn = $(".authenticate");
        var $nav = $("header .topnav nav");
        var $menuBtn = $(".menu-dropdown");

        // the following bit of script is more for ppl who demo
        // and don't demo on devices.  When they resize the browser
        // set things back to a normal state
        var width = $(window).width();
        $(window).on("resize", $.proxy(function(event) {
            if (width != $(window).width() ) {
                width = $(window).width();
                $nav.show();
                if ($(window).width() < 767) {
                    $nav.hide();
                }
            }
        }, this));

        $menuBtn.on("click", function(event) {
            $signIn.removeClass("show");
            $nav.toggle();
        });

        $signInBtn.on("click", function(event) {
            $nav.hide();
            $signIn.toggleClass("show");
        });
    });

})(Granite.$, undefined);
/*
 ADOBE CONFIDENTIAL
 __________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function($) {

    $(function() {
        function initalizeButtons() {
            if ($(window).width() <= 480) {
                $(".userinfo ul li a").each(function(item) {
                    $(this).addClass("btn");
                });
            } else {
                $(".userinfo ul li a").each(function(item) {
                    $(this).removeClass("btn");
                });
            }
        }

        $(window).on("resize", function() {
            initalizeButtons();
        });

        initalizeButtons();
    });

})($CQ, undefined);
/*
 ADOBE CONFIDENTIAL
 __________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

jQuery(function ($) {
    if (window.CQ_Analytics) {

        var initializeRecommendedArticles = function () {

            $("div.personalized-articles").each(function () {
                var $currentSection = $(this);
                var tagCloudManager = ClientContext.get("tagcloud");
                if (tagCloudManager === null) {
                    return;
                }
                var tagCloudObj = tagCloudManager.data;

                // Build an array to sort the tag object properties
                var tagsSortedByValue = [];
                for (tag in tagCloudObj) {
                    tagsSortedByValue.push([tag, tagCloudObj[tag]]);
                }

                // Sort the tags by highest value (most prevelant in browsing history)
                tagsSortedByValue.sort(function (a, b) {
                    return b[1] - a[1];
                });

                // We're only concerned with the actual tags and their order
                var tagSelectorString = "";

                for (var i = 0; i < 2 && i < tagsSortedByValue.length; i++) {
                    // Double encoded URI component so sling does not misinterpret it
                    tagSelectorString += encodeURIComponent(encodeURIComponent(tagsSortedByValue[i][0])) + ".";
                }

                var recommendationUrl = $currentSection.data("path") + tagSelectorString + "html";
                $currentSection.load(recommendationUrl, function () {
                    if (window.picturefill) {
                        window.picturefill($currentSection);
                    }
                });
            });
        };


        //first load is done when all stores are loaded
        if (CQ_Analytics.CCM.areStoresInitialized) {
            initializeRecommendedArticles.call(this);
        } else {
            CQ_Analytics.CCM.addListener("storesinitialize", initializeRecommendedArticles);
        }
    }
});
/*
 ADOBE CONFIDENTIAL
 __________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

jQuery(function ($) {
    $("div.popular-articles").each(function () {
        var $currentSection = $(this);
        var popularPath = $currentSection.data("path");
        if (typeof popularPath !== "undefined") {
            var popularUrl = popularPath + "html";
            $currentSection.load(popularUrl, function () {
                if (window.picturefill) {
                    window.picturefill($currentSection);
                }
            });
        }
    });
});
/*
 ADOBE CONFIDENTIAL
 __________________

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function($) {

    $(function() {

        var duration = 400;

        function focusIn() {
            var search = $("#globalsearch");
            if (search.hasClass("searchmode")) {
                return;
            }
            // for some reason we need to prime the toggle to happen...
            search.addClass("searchmode", duration);
            $("header .topnav nav ul").addClass("searchmode", duration, function(event) {
                $("#sp-searchtext").focus();
            });
        }

        function focusOut() {
            $("header .topnav nav ul").removeClass("searchmode", duration);
            $("#globalsearch").removeClass("searchmode", duration);
            $(document).focus();
        }

        $("#globalsearch").on("mouseup", focusIn);
        $("#sp-searchtext").on("focusout", focusOut);

        // for some reason we have to prime the transition...
        // need to figure this out at some point to clean up the code
        $("#globalsearch").addClass("searchmode", 0);
        $("header .topnav nav ul").addClass("searchmode", 0);
        $("header .topnav nav ul").removeClass("searchmode", 0);
        $("#globalsearch").removeClass("searchmode", 0);
    });

})(Granite.$, undefined);
(function($) {
    $(function () {
        $("#bootstrapCarousel").carousel();
    })
})($CQ || jQuery);
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */

window.matchMedia = window.matchMedia || (function( doc, undefined ) {

  "use strict";

  var bool,
      docElem = doc.documentElement,
      refNode = docElem.firstElementChild || docElem.firstChild,
      // fakeBody required for <FF4 when executed in <head>
      fakeBody = doc.createElement( "body" ),
      div = doc.createElement( "div" );

  div.id = "mq-test-1";
  div.style.cssText = "position:absolute;top:-100em";
  fakeBody.style.background = "none";
  fakeBody.appendChild(div);

  return function(q){

    div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

    docElem.insertBefore( fakeBody, refNode );
    bool = div.offsetWidth === 42;
    docElem.removeChild( fakeBody );

    return {
      matches: bool,
      media: q
    };

  };

}( document ));
/*
 * Adobe Systems Incorporated
 * Modified: October 30th, 2012
 *
 * Picturefill - Responsive Images that work today. (and mimic the proposed Picture element with divs).
 * Author: Scott Jehl, Filament Group, 2012 | License: MIT/GPLv2
 */

(function ($, w) {

    // Enable strict mode
    "use strict";

    w.picturefill = function (context) {
        var undefined;
        if (context === undefined) {
            context = $("body");
        }

        $("div[data-picture]", context).each(function () {
            var currentPicture = this;
            var matches = [];
            $("div[data-media]", currentPicture).each(function () {
                var media = $(this).attr("data-media");
                if (!media || ( w.matchMedia && w.matchMedia(media).matches )) {
                    matches.push(this);
                }
            });

            var $picImg = $("img", currentPicture).first();

            if (matches.length) {
                if ($picImg.size() === 0) {
                    var $currentPicture = $(currentPicture);
                    $picImg = $("<img />").attr("alt", $currentPicture.attr("data-alt")).appendTo($currentPicture);
                }
                $picImg.attr("src", matches.pop().getAttribute("data-src"));
            } else {
                $picImg.remove();
            }
        });
    };

    // Run on debounced resize and domready
    $(function () {
        w.picturefill();
    });

    $(w).on("debouncedresize", function () {
        w.picturefill();
    });

}($CQ, this));
