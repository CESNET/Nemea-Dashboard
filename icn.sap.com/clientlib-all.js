BFL.MainNamespace.SectionController = (function ($) {

    var sections = [];

    function addSection(section) {
        sections.push(section);
    }

    function setSectionBackground(section) {
        if (section.slider === "true" || 'IMAGE' === section.backgroundType) {
            setSectionBackgroundImage(section.id);
        } else {
            $(".slide#" + section.id).css("background", "#" + section.backgroundColor);
        }
    }

    function setSectionBackgroundImage(sectionId) {
        $("#" + sectionId).find("div[data-bfl-background-image-container]").each(function () {
            var currentPicture = this;
            var matches = [];
            $("div[data-media]", currentPicture).each(function () {
                var media = $(this).attr("data-media");
                if (!media || ( window.matchMedia && window.matchMedia(media).matches )) {
                    matches.push(this);
                }
            });
            if (matches.length) {
                $(this).parent().css("background-image", "url('" + matches.pop().getAttribute("data-src") + "')");
            }
        });
    }

    return {

        initializeSection: function (section) {
            addSection(section);
            setSectionBackground(section);
            $(window).on("debouncedresize", function () {
                setSectionBackground(section);
            });

            if (section.slider === "true" && section.sliderConfiguration) {
                BFL.MainNamespace.FlexSliderController.initialize($('#' + section.id), section.sliderConfiguration);
            }
        }
    };

})(jQuery);

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
 * Based on Adobe's Picturefill
 * Author: Scott Jehl, Filament Group, 2012 | License: MIT/GPLv2
 */

(function ($, w) {

    // Enable strict mode
    "use strict";

    w.bflPicturefill = function (context) {
        var undefined;
        if (context === undefined) {
            context = $("body");
        }

        $("div[data-bfl-image-container]", context).each(function () {
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
                    $picImg = $("<img />").
                        attr("alt", $currentPicture.attr("data-alt")).
                        attr("title", $currentPicture.attr("data-alt"));
                    if ($currentPicture.attr("data-css")) {
                        $picImg.attr("class", $currentPicture.attr("data-css"));
                    }
                    if ($currentPicture.attr("data-link-path")) {
                        var $imgLink = $("<a />").
                            attr("href", $currentPicture.attr("data-link-path")).
                            attr("class", $currentPicture.attr("data-link-class")).
                            attr("target", $currentPicture.attr("data-link-target"));
                        $picImg.appendTo($imgLink);
                        if ($currentPicture.attr("data-link-title").length > 0) {
                            $("<span/>").text($currentPicture.attr("data-link-title")).appendTo($imgLink);
                        }
                        $imgLink.appendTo($currentPicture);
                    } else {
                        $picImg.appendTo($currentPicture);
                    }
                }
                $picImg.attr("src", matches.pop().getAttribute("data-src"));
            } else {
                if ($picImg.parent().prop("tagName") === "A") {
                    $picImg.parent().remove();
                } else {
                    $picImg.remove();
                }
            }
        });
    };

    // Run on debounced resize and domready
    $(function () {
        w.bflPicturefill();
    });

    $(w).on("debouncedresize", function () {
        w.bflPicturefill();
    });

}(jQuery, this));
var FIJI_UI = (function () {

    function defineNamespace(name, separator, container) {
        var ns = name.split(separator || '.'),
            o = container || window,
            i,
            len;
        for (i = 0, len = ns.length; i < len; i++) {
            o = o[ns[i]] = o[ns[i]] || {};
        }
        return o;
    }

    return {
        MainNamespace: defineNamespace("FIJI.ui"),

        ClassicUINamespace: defineNamespace("FIJI.ui.classic")
    }

})();
FIJI_UI.MainNamespace.Utils = (function ($) {

    return {

        isEditMode: function () {
            if (typeof CQ !== "undefined" && CQ.WCM) {
                if (CQ.WCM.isEditMode(true)) {
                    return true;
                }
            }
            return false;
        },

        isPreviewMode: function () {
            if (typeof CQ !== "undefined" && CQ.WCM) {
                if (CQ.WCM.isPreviewMode(true)) {
                    return true;
                }
            }
            return false;
        },

        isDesignMode: function () {
            if (typeof CQ !== "undefined" && CQ.WCM) {
                if (CQ.WCM.isDesignMode(true)) {
                    return true;
                }
            }
            return false;
        },

        isAuthorInstance: function () {
            return (typeof CQ !== "undefined" && CQ.WCM);
        },

        isEmptyOrNull: function (str) {
            return str === undefined || str === null || str.length === 0;
        }

    };

})(jQuery);
FIJI_UI.MainNamespace.IDSContext = function (provider, cookie) {
    var cookieName = cookie;
    var providerName = provider;

    function User() {
        this.firstname = "";
        this.lastname = "";
        this.loggedIn = "";
        this.email = "";
        this.company = "";
        this.country = "";
        this.type = "";
        this.userId = "";
        this.initialize = function (json) {
            if (json != null && !FIJI_UI.MainNamespace.Utils.isEmptyOrNull(json.loggedIn)) {
                this.loggedIn = json.loggedIn;
                this.firstname = json.firstname || "";
                this.lastname = json.lastname || "";
                this.email = json.email || "";
                this.company = json.company || "";
                this.country = json.country || "";
                this.type = json.type || "";
                this.userId = json.uid || "";
            }
        };
        this.getFirstname = function () {
            return this.firstname;
        };
        this.getLastname = function () {
            return this.lastname;
        };
        this.getLoggedIn = function () {
            return this.loggedIn;
        };
        this.getEmail = function () {
            return this.email;
        };
        this.getCompany = function () {
            return this.company;
        };
        this.getCountry = function () {
            return this.country;
        };
        this.getType = function () {
            return this.type;
        };
        this.getUserId = function () {
            return this.userId;
        };
        this.isEmpty = function () {
            return (this.loggedIn == "");
        };
    }

    function getCookie() {
        var arg = cookieName + "=";
        var alen = arg.length;
        var clen = document.cookie.length;
        var i = 0;
        while (i < clen) {
            var j = i + alen;
            if (document.cookie.substring(i, j) == arg) {
                return getCookieVal(j);
            }
            i = document.cookie.indexOf(" ", i) + 1;
            if (i == 0) {
                break;
            }
        }
        return null;
    }

    function getCookieVal(offset) {
        var endstr = document.cookie.indexOf(";", offset);
        if (endstr == -1) {
            endstr = document.cookie.length;
        }
        return unescape(document.cookie.substring(offset, endstr));
    }

    return {
        getUser: function (callbackFunction) {
            $.ajaxSetup({
                cache: false
            });
            $.getJSON(
                "/bin/user." + providerName + ".html",
                {},
                function (json) {
                    var user = new User();
                    user.initialize(json);

                    if (typeof callbackFunction == 'function') {
                        callbackFunction.call(this, user);
                    }
                }
            );
        },

        isAnonymous: function () {
            var cookie = getCookie();
            return cookie == null || cookie == 'xxxxxx';
        }
    }
};

FIJI_UI.MainNamespace.HeaderController = (function ($) {

    var $loginBlock, $logoutBlock, $userInfoBlock;

    function doSearch(searchServerUrl, searchFilter, searchTerm) {
        if (searchTerm) {
            var params = {};
            params["filter"] = searchFilter;
            var qParams = $.param(params);
            window.location = searchServerUrl + "/ui#query=" + searchTerm + "&" + qParams;
        }
    }

    function disableIDSLinks($elems) {
        if (FIJI_UI.MainNamespace.Utils.isAuthorInstance()) {
            $elems.attr('onclick', null).click(function () {
                alert("IDS functionality is disabled in author mode!");
                return false;
            });
        }
    }

    function initUserInfoComponent(user) {
        if (!user.isEmpty()) {
            $loginBlock.hide();
            $logoutBlock.show();
            $userInfoBlock.find("span>span").text(user.getFirstname());
            $userInfoBlock.show();
            disableIDSLinks($userInfoBlock);
        } else {
            $logoutBlock.hide();
            $userInfoBlock.hide();
            $loginBlock.show();
            disableIDSLinks($loginBlock);
        }
    }

    function setCookie(cname, cvalue, exhours) {
        var d = new Date();
        d.setTime(d.getTime() + (exhours * 60 * 60 * 1000));
        document.cookie = cname + "=" + cvalue + "; " + "expires=" + d.toGMTString();
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function isFirstTimeVisitor() {
        var autoLogin = getCookie("FIRST_TIME_VISITOR");
        if (autoLogin != "") {
            return false;
        } else {
            setCookie("FIRST_TIME_VISITOR", "true", 1); // 1 hour availability for this cookie
            return true;
        }
    }

    return {

        initializeSearchSection: function (searchServerUrl, filter) {
            var $searchForm = $("#headerSearchForm"),
                $searchInput = $("#headerSearchInput"),
                $searchIcon = $("#headerSearchIcon");

            $searchForm.submit(function (e) {
                e.preventDefault();

                var searchText = $.trim($searchInput.val());
                doSearch(searchServerUrl, filter, searchText);
            });

            var isOpen = false;

            $searchIcon.on('click', function (e) {
                e.preventDefault();

                if (window.matchMedia('(min-width: 768px)').matches) {
                    if (isOpen === false) {
                        $searchForm.addClass('navbar-form--open');
                        $searchInput.focus();
                        isOpen = true;
                    } else {
                        $searchForm.removeClass('navbar-form--open');
                        $searchInput.focusout();
                        isOpen = false;
                    }
                }  // if > 768

            });  // end onclick()
        },

        initializeAuthenticationSection: function (providerName, cookieName, autoLogin) {
            $loginBlock = $("#headerLoginBlock");
            $logoutBlock = $("#headerLogoutBlock");
            $userInfoBlock = $("#headerUserInfoBlock");

            var idsContext = FIJI_UI.MainNamespace.IDSContext(providerName, cookieName);
            if (autoLogin === true && idsContext.isAnonymous() && isFirstTimeVisitor()) {
                // Imitate click for the 1st time visitor to enable Auto Login (on Publish only)
                if (!FIJI_UI.MainNamespace.Utils.isAuthorInstance()) {
                    document.querySelectorAll("#headerLoginLink").click();
                }
            }
            idsContext.getUser(initUserInfoComponent);
        }

    };

})(jQuery);

FIJI_UI.MainNamespace.FooterController = (function ($) {

    return {

    }

})(jQuery);

