// TODO yvv: move this whole logic to Shared project and pass provider name as a parameter
var Utils = function () {
    return {
        isEmptyOrNull: function (str) {
            return str === undefined || str === null || str.length === 0;
        }
    }
}();

var IDSContext = function (provider, cookie) {
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
            if (json != null && !Utils.isEmptyOrNull(json.loggedIn)) {
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

var CarouselController = function () {
    return {
        // Shows/hides Text Video Panel after clicking on "More" link/Play Video icon on Carousel
        showTextVideoPanel: function(panelId, slideLink, isIcon, carouselWrapperCss) {
            if(isIcon) {
                slideLink = $(slideLink).parent().find('.more-info');
            }
            var $panel = $('#' + panelId),
                // current <article> inside <div class="carousel"><section class="slider"></section></div>
                $currentCarouselArticle = $(slideLink).parent().parent(),
                // all <article> elements inside <div class="carousel"><section class="slider"></section></div>
                $allCarouselArticles =  $currentCarouselArticle.parent().find('article'),
                // show more instead of less
                $allLinks =  $currentCarouselArticle.parent().find('article .more-info'),
                $panelClosed = ($panel.css('display') == 'none'),
                $slideIsActive = $currentCarouselArticle.hasClass('active');
            if ($panelClosed) {
                if (carouselWrapperCss) {
                    $('.' + carouselWrapperCss + ' .textVideoPanel').hide();
                }
                $allCarouselArticles.removeClass('active');
                $allLinks.text('more');
                $panel.slideDown().css('overflow', '');
                $currentCarouselArticle.addClass('active');
                $(slideLink).text('less');
            } else {
                if ($slideIsActive) {
                    $panel.slideUp().css('overflow', '');
                    $currentCarouselArticle.removeClass('active');
                    $(slideLink).text('more');
                } else{
                    $allLinks.text('more');
                    $(slideLink).text('less');
                    $allCarouselArticles.removeClass('active');
                    $currentCarouselArticle.addClass('active');
                    // Loading New Content
                }
            }
        },

        // Hide all Text Video Panels if Prev/Next link is clicked
        hideAllTextVideoPanels: function(controlLink) {
            var $carouselPanels = $(controlLink).parent().parent().parent().parent().parent().find('.textVideoPanel');
            $carouselPanels.each(function() {
                if($(this).hasClass('textVideoPanel')) {
                    var $panelClosed = ($(this).css('display') == 'none');
                    if(!$panelClosed) {
                        // Close opened panel and update carousel item
                        $(this).slideUp().css('overflow', '');
                        var $currentCarouselArticle = $(this).parent().find('.slider .active');
                        $currentCarouselArticle.removeClass('active');
                        $currentCarouselArticle.find('.more-info').text('more');
                    }
                }
            });
        },

        initializeSliders: function() {
            $('.carousel.usecase .slider').bxSlider({
                minSlides: 1,
                moveSlides: 1,
                maxSlides: 3,
                slideWidth: 288,
                slideMargin: 30
            });
            window.testimonialCarouselSlider = $('.carousel.testimonials .slider').bxSlider({
                minSlides: 1,
                maxSlides: 5,
                slideWidth: 178,
                slideMargin: 15
            });
            if(testimonialCarouselSlider.length > 0) {
                var slideQty = testimonialCarouselSlider.getSlideCount();
                if(slideQty < 6) {
                    testimonialCarouselSlider.reloadSlider({
                        controls: false,
                        minSlides: 1,
                        maxSlides: slideQty,
                        pager: false,
                        slideWidth: 178,
                        slideMargin: 15,
                        onSliderLoad: function() {
                            var $bxWrapper = testimonialCarouselSlider.parent().parent();
                            if((slideQty < 5) && ("bx-wrapper" == $bxWrapper.attr("class"))) {
                                $bxWrapper.css({"margin": "0px"});
                            }
                        }
                    });
                }
            }
        }
    }
}();

/*
* DD ScrollSpy Menu Script (c) Dynamic Drive (www.dynamicdrive.com)
* Last updated: Aug 1st, 14'
* Visit http://www.dynamicdrive.com/ for this script and 100s more.
*/

// Aug 1st, 14': Updated to v1.2, which supports showing a progress bar inside each menu item (except in iOS devices). Other minor improvements.

if (!Array.prototype.filter){
  Array.prototype.filter = function(fun /*, thisp */){
    "use strict";
 
    if (this == null)
      throw new TypeError();
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();
 
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++){
      if (i in t){
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }
 
    return res;
  };
}

(function($){

	var defaults = {
		spytarget: window,
		scrolltopoffset: 0,
		scrollbehavior: 'smooth',
		scrollduration: 500,
		highlightclass: 'selected',
		enableprogress: '',
		mincontentheight: 30
	}

	var isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) // detect iOS devices

	function inrange(el, range, field){ // check if "playing field" is inside range
		var rangespan = range[1]-range[0], fieldspan = field[1]-field[0]
		if ( (range[0]-field[0]) >= 0 && (range[0]-field[0]) < fieldspan ){ // if top of range is on field
			return true
		}
		else{
			if ( (range[0]-field[0]) <= 0 && (range[0]+rangespan) > field[0] ){ // if part of range overlaps field
				return true
			}
		}
		return false
	}

	$.fn.ddscrollSpy = function(options){
		var $window = $(window)
		var $body=(window.opera)? (document.compatMode=="CSS1Compat"? $('html') : $('body')) : $('html,body')


		return this.each(function(){
			var o = $.extend({}, defaults, options)
			o.enableprogress = (isiOS)? '' : o.enableprogress // disable enableprogress in iOS
			var targets = [], curtarget = ''
			var cantscrollpastindex = -1 // index of target content that can't be scrolled past completely when scrollbar is at the end of the doc
			var $spytarget = $( o.spytarget ).eq(0)
			var spyheight = $spytarget.outerHeight()
			var spyscrollheight = (o.spytarget == window)? $body.get(0).scrollHeight : $spytarget.get(0).scrollHeight
			var $menu = $(this)
			var totaltargetsheight = 0 // total height of target contents
			function spyonmenuitems($menu){
				var $menuitems = $menu.find('a[href^="#"]')
				targets = []
				curtarget = ''
				totaltargetsheight = 0
				$menuitems.each(function(i){
					var $item = $(this)
					var $target = $( $item.attr('href') )
					var target = $target.get(0)
					var $progress = null // progress DIV that gets dynamically added inside menu A element if o.enableprogress enabled
					if ($target.length == 0) // if no matching links found
						return true
					$item
						.off('click.goto')
						.on('click.goto', function(e){
							if ( o.spytarget == window && (o.scrollbehavior == 'jump' || !history.pushState))
								window.location.hash = $item.attr('href')
							if (o.scrollbehavior == 'smooth' || o.scrolltopoffset !=0){
								var $scrollparent = (o.spytarget == window)? $body : $spytarget
								var addoffset = 1 // add 1 pixel to scrollTop when scrolling to an element to make sure the browser always returns the correct target element (strange bug)
								if (o.scrollbehavior == 'smooth' && (history.pushState || o.spytarget != window)){
									$scrollparent.animate( {scrollTop: targets[i].offsettop + addoffset}, o.scrollduration, function(){
										if (o.spytarget == window && history.pushState){
											history.pushState(null, null, $item.attr('href'))
										}
									})
								}
								else{
									$scrollparent.prop('scrollTop', targets[i].offsettop + addoffset)
								}
								e.preventDefault()
							}
						})
					if (o.enableprogress){ // if o.enableprogress enabled
						if ($item.find('div.' + o.enableprogress).length == 0){ //if no progress DIV found inside menu item
							$item.css({position: 'relative', overflow: 'hidden'}) // add some required style to parent A element
							$('<div class="' + o.enableprogress + '" style="position:absolute; left: -100%" />').appendTo($item)
						}
						$progress = $item.find('div.' + o.enableprogress)
					}
					var targetoffset = (o.spytarget == window)? $target.offset().top : (target.offsetParent == o.spytarget)? target.offsetTop : target.offsetTop - o.spytarget.offsetTop
					targetoffset +=  o.scrolltopoffset
					var targetheight = ( parseInt($target.data('spyrange')) > 0 )? parseInt($target.data('spyrange')) : ( $target.outerHeight() || o.mincontentheight)
					var offsetbottom = targetoffset + targetheight
					if (cantscrollpastindex == -1 && offsetbottom > (spyscrollheight - spyheight)){ // determine index of first target which can't be scrolled past
						cantscrollpastindex = i
					}
					targets.push( {$menuitem: $item, $des: $target, offsettop: targetoffset, height: targetheight, $progress: $progress, index: i} )
				})
				if (targets.length > 0)
					totaltargetsheight = targets[targets.length-1].offsettop + targets[targets.length-1].height
			}

			function highlightitem(){
				if (targets.length == 0)
					return
				var prevtarget = curtarget
				var scrolltop = $spytarget.scrollTop()
				var cantscrollpasttarget = false
				var shortlist = targets.filter(function(el, index){ // filter target elements that are currently visible on screen
					return inrange(el, [el.offsettop, el.offsettop + el.height], [scrolltop, scrolltop + spyheight])
				})
				if (shortlist.length > 0){
					curtarget = shortlist.shift() // select the first element that's visible on screen
					if (prevtarget && prevtarget != curtarget)
						prevtarget.$menuitem.removeClass(o.highlightclass)
					if (!curtarget.$menuitem.hasClass(o.highlightclass)) // if there was a previously selected menu link and it's not the same as current
						curtarget.$menuitem.addClass(o.highlightclass) // highlight its menu item
					if (curtarget.index >= cantscrollpastindex && scrolltop >= (spyscrollheight - spyheight)){ // if we're at target that can't be scrolled past and we're at end of document
						if (o.enableprogress){ // if o.enableprogress enabled
							for (var i=0; i<targets.length; i++){ // highlight everything
								targets[i].$menuitem.find('div.' + o.enableprogress).css('left', 0)
							}
						}
						curtarget.$menuitem.removeClass(o.highlightclass)
						curtarget = targets[targets.length-1]
						if (!curtarget.$menuitem.hasClass(o.highlightclass))
							curtarget.$menuitem.addClass(o.highlightclass)
						return
					}
					if (o.enableprogress){ // if o.enableprogress enabled
						var scrollpct = ((scrolltop-curtarget.offsettop) / curtarget.height) * 100
						curtarget.$menuitem.find('div.' + o.enableprogress).css('left', -100 + scrollpct + '%')
						for (var i=0; i<targets.length; i++){
							if (i < curtarget.index){
								targets[i].$menuitem.find('div.' + o.enableprogress).css('left', 0)
							}
							else if (i > curtarget.index){
								targets[i].$menuitem.find('div.' + o.enableprogress).css('left', '-100%')
							}
						}
					}
				}
				else if (scrolltop > totaltargetsheight){ // if no target content visible on screen but scroll bar has scrolled past very last content already
					if (o.enableprogress){ // if o.enableprogress enabled
						curtarget.$menuitem.removeClass(o.highlightclass)
						for (var i=0; i<targets.length; i++){
							targets[i].$menuitem.find('div.' + o.enableprogress).css('left', 0)
						}
					}
				}
			}

			function updatetargetpos(){
				if (targets.length == 0)
					return
				var $menu = targets[0].$menu
				spyheight = $spytarget.outerHeight()
				spyscrollheight = (o.spytarget == window)? $body.get(0).scrollHeight : $spytarget.get(0).scrollHeight
				totaltargetsheight = 0
				cantscrollpastindex = -1
				for (var i = 0; i < targets.length; i++){
					var $target = targets[i].$des
					var target = $target.get(0)
					var targetoffset = (o.spytarget == window)? $target.offset().top : (target.offsetParent == o.spytarget)? target.offsetTop : target.offsetTop - o.spytarget.offsetTop
					targetoffset += o.scrolltopoffset
					targets[i].offsettop = targetoffset
					targets[i].height = ( parseInt($target.data('spyrange')) > 0 )? parseInt($target.data('spyrange')) : ( $target.outerHeight() || o.mincontentheight)
					if (o.enableprogress){ // if o.enableprogress enabled
						var offsetbottom = targetoffset + targets[i].height // recalculate cantscrollpastindex
						if (cantscrollpastindex == -1 && offsetbottom > (spyscrollheight - spyheight)){
							cantscrollpastindex = i
						}
					}
				}
				totaltargetsheight = targets[targets.length-1].offsettop + targets[targets.length-1].height
			}

			spyonmenuitems($menu)

			$menu.on('updatespy', function(){
				spyonmenuitems($menu)
				highlightitem()
			})

			$spytarget.on('scroll resize', function(){
				highlightitem()
			})

			highlightitem()

			$window.on('load resize', function(){
				updatetargetpos()
			})

		}) // end return
	}

})(jQuery);
var FooterAnimation = (function () {
    var o = {};

    // Shows footer after scroll to last slide
    o.showFooter = function () {
        if ((Modernizr.mq("(min-width: 900px)") && (!Modernizr.touch))) {
            var $lastSlide = $('.slide:last');
            var $lastSlideHeight = $lastSlide.height();

            var topFooterIndent = parseInt($lastSlide.css("top")) + $lastSlideHeight + "px";

            $("#footer").css({'margin-top': topFooterIndent, 'z-index': '10'});
        }
    };

    return o;
})();

var SectionContainerController = function () {
    var sections = [];

    function initParallax() {
        if ($('.slides').hasClass('home')) {
            if ((Modernizr.mq('(min-width: 900px)') && (!Modernizr.touch))) {
                //.parallax(xPosition, inertia, outerHeight) options:
                //xPosition - Horizontal position of the element
                //inertia - speed to move relative to vertical scroll. Example: 0.1 is one tenth the speed of scrolling, 2 is twice the speed of scrolling
                //outerHeight (true/false) - Whether or not jQuery should use it's outerHeight option to determine when a section is in the viewport
                for (var i = 0; i < sections.length; i++) {
                    $("#" + sections[i].id).parallax("50%", sections[i].scrollSpeed, true);
                }

                var deck = new $.scrolldeck({
                    slides: '.slide',
                    buttons: '#slide-navigation li a',
                    easing: 'easeInOutExpo',
                    offset: -64
                });

                $('#slide-navigation').removeClass('hidden');
                $('section.slide').addClass('with-parallax');
            }
        }
    }

    // Hides Top Navigation in mobile version and shows it by click on button "Show Menu"
    function showTopNavigation() {
        var $topNav = $("#header").find(".headerNavigation nav ul");

        $(".show-navigation").click(function () {
            $topNav.slideToggle(function () {
                $topNav.toggleClass("mobile-invisible").removeAttr("style");
            });
        });
    }

    // Fixes Top Navigation on top of the page after scrolling
    function fixingTopNavigation() {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 67) {
                $("#header").addClass("fixed");
            } else {
                $("#header").removeClass("fixed");
            }
        });
    }

    return {
        addSection: function (section) {
            sections.push(section);
        },

        showWithParallax: function () {
            showTopNavigation();
            fixingTopNavigation();
            initParallax();
        },

        showWithNoEffects: function () {
            showTopNavigation();
            fixingTopNavigation();
        }
    }
}();

var QuickLinksController = function () {

    return {
        showQuickLinks: function () {
            var $links = $('.quickLinks'),
                $panel =  $links.find('> article'),
                $switch = $links.find('> .switch');
            $switch.bind('click', function(){
                var $isClosed = $links.hasClass('closed');
                if ($isClosed) {
                    $links.animate(
                        {marginRight: '0'},
                        function () {
                            $links.removeClass('closed');
                            $switch.text('close');
                        }
                    );
                    $panel.animate({width: '215px'});
                } else {
                    $links.animate(
                        {marginRight: '-215px'},
                        function () {
                            $links.addClass('closed');
                            $switch.text('quick links');
                        }
                    );
                    $panel.animate({width: 0});
                }
            });
            $(window).scroll(function () {
                if ($(this).scrollTop() > 240) {
                    $links.addClass('fixed');
                } else {
                    $links.removeClass('fixed');
                }
            });
        }
    }
}();

var LocationsController = function () {
    var locations = [];

    var gMarkers = [];
    var map;
    var infowindow;

    function initMap(mapContainer) {
        if (locations.length == 0) {
            return;
        }

        var bounds     = new google.maps.LatLngBounds();
        var mapOptions = {
            disableDoubleClickZoom: true,
            draggable: false,
            minZoom: 2,
            scrollwheel: false
        };
        map = new google.maps.Map(mapContainer, mapOptions);

        // Set markers around the map
        for (var i = 0; i < locations.length; i++) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
                title: locations[i].name,
                id: i,
                map: map
            });
            gMarkers.push(marker);

            bounds.extend(marker.position);
            google.maps.event.addListener(marker, 'click', onMapMarkerClick);
        }

        // Set zoom to cover all markers:
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
        google.maps.event.addListenerOnce(map, 'idle', function() {
            if ( map.getZoom() > 3 ) {
                map.setZoom(3);
            }
        });

        // Set info window for initial marker:
        infowindow = new google.maps.InfoWindow();
        infowindow.setContent(locations[0].name);
        infowindow.open(map, gMarkers[0]);

        /*
         * The google.maps.event.addListener() event waits for
         * the creation of the infowindow HTML structure 'domready'
         * and before the opening of the infowindow defined styles
         * are applied.
         */
        google.maps.event.addListener(infowindow, 'domready', function() {

            // Info Window Closing Button repositioning:
            // -----------------------------------------

            // Using the .next() method of jQuery you reference the following DIV to .gm-style-iw.
            // This is the DIV that groups the close button elements.
            var iwCloseBtn = $('.gm-style-iw').next();

            iwCloseBtn.css({
                top: '5px',
                right: '5px'
            });

        });  // end addListener()

    }

    function onTabClick(index) {
        return function () {
            map.setCenter({
                lat: locations[index].latitude,
                lng: locations[index].longitude
            });
            map.setZoom(3);
            infowindow.setContent(locations[index].name);
            infowindow.open(map, gMarkers[index]);
        }
    }

    function onMapMarkerClick() {
        map.setZoom(3);
        map.setCenter( this.position );
        infowindow.setContent( this.title );
        infowindow.open( map, this );
        $('#marker_' + this.id).tab('show');
    }

    function drawTabs(tabContainer) {
        for (var i = 0; i < locations.length; i++) {
            var menuLink = $("<a>").attr("id", "marker_" + i).attr("href", "#address_" + i).text(locations[i].name);
            menuLink.on("click", function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            menuLink.on("click", onTabClick(i));

            var li = $("<li>");
            $(li).append(menuLink);
            $(tabContainer).append(li);

            if (i == 0) menuLink.tab('show'); // select default tab
        }
    }

    function drawTabPanels(tabPanelContainer) {
        for (var i = 0; i < locations.length; i++) {
            var div = $("<div>").attr("class", "inno-footer__address-tab  tab-pane").attr("id", "address_" + i);
            var h3 = $("<h3>").text(locations[i].name);
            var p = $("<p>").html(locations[i].address.replace(/\n/g, "<br/>"));
            var divAddress = $("<div>").attr("class", "inno-footer__address-links");
            var phoneLink = $("<a>").attr("href", "tel:" + locations[i].phone).text(locations[i].phone);
            var emailLink = $("<a>").attr("href", "mailto:" + locations[i].email).text(locations[i].email);
            divAddress.append(phoneLink).append(emailLink);
            div.append(h3).append(p).append(divAddress);
            $(tabPanelContainer).append(div);
        }
    }

    return {
        addLocation: function (location) {
            locations.push(location);
        },

        showMap: function (mapContainer, tabsContainer, tabPanelsContainer) {
            if (locations.length !== 0) {
                initMap(mapContainer);
                drawTabPanels(tabPanelsContainer);
                drawTabs(tabsContainer);
            }
        }
    }
}();

var WARPWidgetController = function () {

    function getConfiguration(appConfig) {
        // disable WARP on author instance
        if (typeof CQ !== "undefined" && CQ.WCM) {
            if (CQ.WCM.isEditMode(true) || CQ.WCM.isDesignMode(true) || CQ.WCM.isPreviewMode(true)) {
                return null;
            }
        }
        if (appConfig) {
            return appConfig;
        }
        return null;
    }

    return {
        initialize: function (appConfig) {
            var swa = window.swa = getConfiguration(appConfig);
            if (swa) {
                var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
                g.type = 'text/javascript';
                g.defer = true;
                g.async = true;
                g.src = swa.baseUrl + 'js/privacy.js';
                s.parentNode.insertBefore(g, s);
            }
        }
    };
}();

var HeaderNavigationController = function () {
    return {
        initialize: function (menu) {
            $menu = $(menu);
            $listitems = $menu.find("li.dropdown");
            $links = $menu.find("li.dropdown > a");
            $menus = $menu.find(".dropdown-menu");
            $links.append('<span class="nav-toggle"><i class="fa fa-caret-down"></i><i class="fa fa-caret-up"></i></span>');
            HeaderNavigationController.setHeights($menu);
            if (Modernizr.touch || HeaderNavigationController.isSmallScreen()) {
                $links.click(function (e) {
                    e.preventDefault();
                    if ($(this).parent("li").hasClass("open")) {
                        HeaderNavigationController.closeMenus($(this).siblings(".dropdown-menu"));
                        $menu.parents(".headerNavigation").removeClass("isopen");
                    } else {
                        $menu.parents(".headerNavigation").addClass("isopen");
                        HeaderNavigationController.closeMenus($menus);
                        HeaderNavigationController.openMenus($(this).siblings(".dropdown-menu"));
                    }
                });
            } else {
                $listitems.hoverIntent({
                    over: function () {
                        $menu.parents(".headerNavigation").addClass("isopen");
                        // HeaderNavigationController.closeMenu($menus);
                        HeaderNavigationController.openMenu($(this).find(".dropdown-menu"));
                    },
                    out: function () {
                        HeaderNavigationController.closeMenu($(this).find('.dropdown-menu'));
                        $menu.parents(".headerNavigation").removeClass("isopen");
                    },
                    sensitivity: 5,
                    interval: 200,
                    timeout: 300
                });
            }
        },
        // This function sets the height of dropdown menus for animating purposes
        setHeights: function (el) {
            $menu = $(el);
            $menus = $menu.find(".dropdown-menu");
            $menu.parent().addClass("in");
            $menus.each(function () {
                $(this).removeClass("ready");
                $(this).css("max-height", "1000px").data("max-height", $(this).height()).css("max-height", "0px");
                $(this)[0].offsetHeight;  // Trigger a reflow, flushing the CSS change.
                $(this).addClass("ready");
            });
            $menu.parent().removeClass("in");
        },
        openMenu: function ($el) {
            $el.each(function () {
                // $(this).slideDown("fast");
                $(this).css("max-height", $(this).data("max-height")).parent("li").addClass("open");
            });
        },
        openMenus: function ($els) {
            $els.each(function () {
                // $(this).slideDown("fast");
                $(this).css("max-height", $(this).data("max-height")).parent("li").addClass("open");
            });
        },
        closeMenu: function ($el) {
            $el.each(function () {
                // $(this).slideUp("fast");
                $(this).css("max-height", 0).parent("li").removeClass("open");
            });
        },
        closeMenus: function ($els) {
            $els.each(function () {
                // $(this).slideUp("fast");
                $(this).css("max-height", 0).parent("li").removeClass("open");
            });
        },
        isSmallScreen: function () {
            var ww = $(window).width();
            return ww < 640;
        }
    };
}();

$(document).ready(function () {
    HeaderNavigationController.initialize(".headerNavigation ul.nav");
});

$(window).resize(function () {
    HeaderNavigationController.setHeights(".headerNavigation ul.nav");
});
var UserInfoController = function () {

    function disableIDSLinks(selectors) {
        var $elems = $(selectors);
        if(typeof CQ !== "undefined" && CQ.WCM) {
            if (CQ.WCM.isEditMode(true) || CQ.WCM.isDesignMode(true) || CQ.WCM.isPreviewMode(true)) {
                $elems.attr('onclick',null).click(function () {
                    alert("IDS functionality is disabled in author mode!");
                    return false;
                });
            }
        }
    }

    function initUserInfoComponent(user) {
        if (!user.isEmpty()) {
            $("#anonymousUserInfo").hide();
            $("#loggedUserInfo").css("display", "inline-block");
            $("#userInfoName").text(user.getFirstname());
            disableIDSLinks("#loggedUserInfo a");
        } else {
            $("#loggedUserInfo").hide();
            $("#anonymousUserInfo").css("display", "inline-block");
            disableIDSLinks("#anonymousUserInfo a");
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
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function isFirstTimeVisitor() {
        var autoLogin = getCookie("SAPHANA_IS_FIRST_TIME_VISITOR");
        if (autoLogin != "") {
            return false;
        } else {
            setCookie("SAPHANA_IS_FIRST_TIME_VISITOR", "true", 1);
            return true;
        }
    }

    return {
        initialize: function (providerName, cookieName) {
            var idsContext = IDSContext(providerName, cookieName);
            if(idsContext.isAnonymous() && isFirstTimeVisitor()) {
                if(typeof CQ !== "undefined" && CQ.WCM) {
                    if (!(CQ.WCM.isEditMode(true) || CQ.WCM.isDesignMode(true) || CQ.WCM.isPreviewMode(true))) {
                        // Imitate click for the 1st time visitor to check Auto Login (Publish only)
                        document.querySelectorAll(".login")[0].click();
                    }
                }
            }
            idsContext.getUser(initUserInfoComponent);
        }
    }
}();

var lpMTagConfig=lpMTagConfig||{};lpMTagConfig.vars=lpMTagConfig.vars||[];lpMTagConfig.dynButton=lpMTagConfig.dynButton||[];lpMTagConfig.lpProtocol=document.location.toString().indexOf("https:")==0?"https":"http";lpMTagConfig.pageStartTime=(new Date).getTime();if(!lpMTagConfig.pluginsLoaded)lpMTagConfig.pluginsLoaded=!1;
lpMTagConfig.loadTag=function(){for(var a=document.cookie.split(";"),b={},c=0;c<a.length;c++){var d=a[c].substring(0,a[c].indexOf("="));b[d.replace(/^\s+|\s+$/g,"")]=a[c].substring(a[c].indexOf("=")+1)}a=b.HumanClickRedirectOrgSite;b=b.HumanClickRedirectDestSite;if(!lpMTagConfig.pluginsLoaded)lpMTagConfig.pageLoadTime=(new Date).getTime()-lpMTagConfig.pageStartTime,b="?site="+(a==lpMTagConfig.lpNumber?b:lpMTagConfig.lpNumber)+"&d_id="+lpMTagConfig.deploymentID+"&default=simpleDeploy",lpAddMonitorTag(lpMTagConfig.deploymentConfigPath!=
null?lpMTagConfig.lpProtocol+"://"+lpMTagConfig.deploymentConfigPath+b:lpMTagConfig.lpProtocol+"://"+lpMTagConfig.lpTagSrv+"/visitor/addons/deploy2.asp"+b),lpMTagConfig.pluginsLoaded=!0};
function lpAddMonitorTag(a){if(!lpMTagConfig.lpTagLoaded){if(typeof a=="undefined"||typeof a=="object")a=lpMTagConfig.lpMTagSrc?lpMTagConfig.lpMTagSrc:lpMTagConfig.lpTagSrv?lpMTagConfig.lpProtocol+"://"+lpMTagConfig.lpTagSrv+"/hcp/html/mTag.js":"/hcp/html/mTag.js";a.indexOf("http")!=0?a=lpMTagConfig.lpProtocol+"://"+lpMTagConfig.lpServer+a+"?site="+lpMTagConfig.lpNumber:a.indexOf("site=")<0&&(a+=a.indexOf("?")<0?"?":"&",a=a+"site="+lpMTagConfig.lpNumber);var b=document.createElement("script");b.setAttribute("type",
"text/javascript");b.setAttribute("charset","iso-8859-1");b.setAttribute("src",a);document.getElementsByTagName("head").item(0).appendChild(b)}}window.attachEvent?window.attachEvent("onload",lpMTagConfig.loadTag):window.addEventListener("load",lpMTagConfig.loadTag,!1);
(function(){lpMTagConfig.containsUnit=!1;lpMTagConfig.containsLanguage=!1;for(var a=0;a<lpMTagConfig.vars.length;a++){var b=null;lpMTagConfig.vars[a].length==2?b=lpMTagConfig.vars[a][0]:lpMTagConfig.vars[a].length>2&&(b=lpMTagConfig.vars[a][1]);switch(b){case "unit":lpMTagConfig.containsUnit=!0;break;case "language":lpMTagConfig.containsLanguage=!0}}})();
function lpSendData(a,b,c){if(arguments.length>0)lpMTagConfig.vars=lpMTagConfig.vars||[],lpMTagConfig.vars.push([a,b,c]);if(typeof lpMTag!="undefined"&&typeof lpMTagConfig.pluginCode!="undefined"&&typeof lpMTagConfig.pluginCode.simpleDeploy!="undefined"){var d=lpMTagConfig.pluginCode.simpleDeploy.processVars();lpMTag.lpSendData(d,!0)}}function lpAddVars(a,b,c){lpMTagConfig.vars=lpMTagConfig.vars||[];lpMTagConfig.vars.push([a,b,c])};

lpMTagConfig.lpTagSrv = lpMTagConfig.lpTagSrv || "sales.liveperson.net";
lpMTagConfig.lpServer = lpMTagConfig.lpServer || "sales.liveperson.net";
lpMTagConfig.deploymentID = "1";

var LivePersonWidgetController = function () {

    return {
        initialize: function (baseConfig, appConfig) {
            // disable Live Person Widget on author instance
            if(typeof CQ !== "undefined" && CQ.WCM) {
                if (CQ.WCM.isEditMode(true) || CQ.WCM.isDesignMode(true) || CQ.WCM.isPreviewMode(true)) {
                    $("#lpChatButtonDiv1").attr('onclick',null).click(function () {
                        alert("Live Chat functionality is disabled in author mode!");
                        return false;
                    });
                }
                return false;
            }

            if (typeof (baseConfig) != "undefined") {
                baseConfig.lpNumber = appConfig.lpNumber;
                baseConfig.vars = baseConfig.vars || [];
                baseConfig.vars.push(
                    ["Site", "sap"], ["Country", "us"], ["Language", "en"], ["Collection", "suiteonhana"],
                    ["Section", "hana"], ["WBSCode", "crm-xh14-cht-ctcibt"], ["Unit", "sales"],
                    ["Url", window.location.href], ["BlockThisPage", appConfig.blockThisPage]);
                $("#lpChatButtonDiv1").click(function () {
                    baseConfig.dynButton0.actionHook();
                });
            }
        }
    };
}();

$(function(){
    var $thumbnails = $(".video-panel-thumbnail img");
    $thumbnails.each(function(index, customThumbnail){
        $(customThumbnail).load(function(){
            var paddingBottomNewRatio = 100 * parseInt(customThumbnail.clientHeight) / parseInt(customThumbnail.clientWidth) ;
            $(customThumbnail).parent().parent().css({"padding-bottom": paddingBottomNewRatio+"%"});
        });
    })
});
var UseCaseContainerController = function () {
    var USECASES_URL = "/bin/saphana/usecases";

    var containerId;
    var requestData = {};

    function find(config) {
        if (config) {
            requestData = config.requestData;
            containerId = config.containerId;
        }

        $.ajax({
            type: "GET",
            url: USECASES_URL,
            dataType: "json",
            data: requestData,
            cache: false,
            error: function () {
                $("#usecaseResults_" + containerId + " .usecase-listing-placeholder").html("Error occurred while retrieving use cases!");
            },
            success: function (data) {
                if (data.length === 0) {
                    $("#usecaseResults_" + containerId + " .usecase-listing-placeholder").empty();
                    $("#usecaseResults_" + containerId).empty();
                    return;
                }
                drawContainer(data);
            }
        });
    }

    function drawContainer(data) {
        var source = $("#usecase-listing-template_" + containerId).html();
        var template = Handlebars.compile(source);
        var html = template(data);
        $("#usecaseResults_" + containerId + " .usecase-listing-placeholder").html(html);
    }

    function setTagFilter(tags, tag) {
        var index = tags.indexOf(tag);
        if (index != -1) {
            tags.splice(index, 1);
        } else {
            tags.push(tag);
        }
    }


    return {
        showData: function (config) {
            find(config);
        },
        setIndustryTagFilter: function (tag) {
            setTagFilter(requestData['industryTags[]'], tag);
            find();
        },
        setLobTagFilter: function (tag) {
            setTagFilter(requestData['lobTags[]'], tag);
            find();
        },
        setRegionTagFilter: function (tag) {
            setTagFilter(requestData['regionTags[]'], tag);
            find();
        },
        setUsecaseAndProductTagFilter: function (tag) {
            setTagFilter(requestData['usecaseAndProductTags[]'], tag);
            find();
        },
        setSortType: function (sortType) {
            requestData.sortType = sortType;
            find();
        },
        removeRecordsLimit: function () {
            delete requestData.limit;
            find();
        },
        toggleAttribute: function(el) {
            if($(el).hasClass('collapsed')) {
                $(el).removeClass('collapsed').addClass('expanded').siblings('.scroll').slideDown();
            } else {
                $(el).removeClass('expanded').addClass('collapsed').siblings('.scroll').slideUp();
            }
        }
    }
}();

jQuery.fn.isLoaded = function() {
    return this
        .filter("img")
        .filter(function() { return this.complete; }).length > 0;
};


var TutorialStepController = function () {

    return {
        showHideSteps: function (stepId, slideLink) {
            if ( Modernizr.mq('(max-width: 900px)') ) {
                var $stepContent = $('#' + stepId).find('.step-content'),
                    $stepVideo = $('#' + stepId).find('.video');

                $stepContent.slideToggle('slow', function () {
                    $stepContent.removeAttr('style').toggleClass('opened');
                });
                $stepVideo.slideToggle('slow', function () {
                    $stepVideo.removeAttr('style').toggleClass('opened');
                });
                $(slideLink).toggleClass('minus');
            }
        }
    }
}();

var ThreeColumnLinkingController = function () {

    return {
        initialize: function() {
            $('.threeColumnLinking section.bxslider').each(function( index ) {
                $(this).clone().toggleClass('bxslider').toggleClass('mobile-invisible').insertAfter($(this));
            });
        }
    }
}();

$(document).ready(function () {
    ThreeColumnLinkingController.initialize();
});

var ThreeColumnCaptionController = function () {

    return {
        showHideContent: function (htmlSectionsWrapperId, htmlSectionId, columnLink) {
            var $htmlSection = $('#' + htmlSectionId),
                $article = $(columnLink).parent().parent().parent(),
                $allArticles = $article.parent().find('article'),
                $allHTMLSections = $('#' + htmlSectionsWrapperId + ' .offering'),
                $columnHeader = $article.find('h2'),
                hasImages = $allArticles.find('.image').length > 0,
                $topIndent = $columnHeader.height() - (hasImages ? 29 : 80) + 'px',
                $wrapper = $('#' + htmlSectionsWrapperId),
                $wrapperHeight = $htmlSection.height() + 310 +  'px';

            $wrapper.css('height', $wrapperHeight);
            $htmlSection.css('margin-top', $topIndent);

            $allArticles.removeClass('active');
            $allHTMLSections.hide();
            if (hasImages) {
                $allArticles.find('p > a').hide();
            }

            $article.toggleClass('active');
            $htmlSection.toggle();

            $('#' + htmlSectionsWrapperId + ' .offering .close-button').click(function () {
                $allArticles.find('p > a').show();
                $(this).parent().hide();
                $allArticles.removeClass('active');
                $wrapper.css('height', 'auto');
            });
        },

        initialize: function() {
            $('.threeColumnCaption section.bxslider').each(function( index ) {
                $(this).clone().toggleClass('bxslider').toggleClass('mobile-invisible').insertAfter($(this));
            });
        }
    }
}();

$(document).ready(function () {
    ThreeColumnCaptionController.initialize();
});

var TestimonialsCarouselController = function () {

    return {
        filter: function (tag, filterLink) {
            // Remove active for all filters, then set it for the chosen one
            var $allFilterItems = $(filterLink).parent().parent().find("li");
            $allFilterItems.each(function() {
                if($(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
            });
            $(filterLink).parent().addClass("active");
            // all <article> elements inside <div class="carousel"><section class="slider"></section></div>
            var $allCarouselArticles = $(filterLink).parent().parent().parent().parent().find("article");
            var carouselItemNum = 0;
            $allCarouselArticles.each(function() {
                if("bx-clone" !== $(this).attr("class")) {
                    carouselItemNum++;
                }
            });
            if("All" == tag) {
                // Set initial slider settings
                testimonialCarouselSlider.reloadSlider({
                    minSlides: 1,
                    maxSlides: 5,
                    slideWidth: 178,
                    slideMargin: 15
                });
                var $bxWrapperDivs = $(filterLink).parent().parent().parent().parent().find("div");
                $bxWrapperDivs.each(function() {
                    if(("bx-wrapper" == $(this).attr("class")) && (carouselItemNum < 5)) {
                        $(this).css({"margin": "0px"});
                    }
                });
            } else {
                var count = 0, itemsToHide = [], itemsToShow = [];
                $allCarouselArticles.each(function() {
                    var attr = $(this).attr("title");
                    if (typeof attr !== "undefined" && attr !== false) {
                        if (attr.indexOf(tag) < 0) {
                            itemsToHide.push(this);
                        } else {
                            // Count actual number of slides with defined tag
                            if("bx-clone" !== $(this).attr("class")) {
                                count++;
                            }
                            itemsToShow.push(this);
                        }
                    }
                });
                // Reload slider with new settings
                // See complete documentation here: http://bxslider.com/options
                testimonialCarouselSlider.reloadSlider({
                    controls: ((count < 6) ? false : true),
                    minSlides: 1,
                    maxSlides: ((count < 6) ? count : 5),
                    pager: ((count < 6) ? false : true),
                    slideWidth: 178,
                    slideMargin: 15,
                    onSliderLoad: function() {
                        for (var i = 0; i < itemsToHide.length; i++) {
                            $(itemsToHide[i]).hide();
                        }
                        for (var i = 0; i < itemsToShow.length; i++) {
                            $(itemsToShow[i]).show();
                        }
                    }
                });
                var $bxWrapperDivs = $(filterLink).parent().parent().parent().parent().find("div");
                $bxWrapperDivs.each(function() {
                    if(("bx-wrapper" == $(this).attr("class")) && (count < 5)) {
                        $(this).css({"margin": "0px"});
                    }
                });
            }
        }
    }
}();

$(document).ready(function() {
    $("a.flex-prev, a.flex-next").click(function(){
        var videos = $(".flexslider--panel .embed-video-container iframe");
        $(videos).each(function(index, videoElement){
            var iframe = videoElement.contentWindow;
            var func = "pauseVideo";
            iframe.postMessage('{"event":"command","func":"' + func + '","args":""}','*');
        });
    });
});
var DocumentsContainerController = function () {

    return {
        showHideContent: function (initialPanelId, expandedPanelId, slideLink) {
            $('#' + initialPanelId).slideToggle();
            $('#' + expandedPanelId).slideToggle();
            $(slideLink).toggleClass('minus');

            if ($(slideLink).hasClass('minus')) {
                $(slideLink).text('Less');
            }
            else {
                $(slideLink).text('More');
            }
        }
    }
}();

/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-touch-shiv-mq-cssclasses-teststyles-prefixes-load
 */
;window.Modernizr=function(a,b,c){function x(a){j.cssText=a}function y(a,b){return x(m.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}var d="2.7.1",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n={},o={},p={},q=[],r=q.slice,s,t=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},u=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b).matches;var d;return t("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=r.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(r.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(r.call(arguments)))};return e}),n.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:t(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c};for(var C in n)w(n,C)&&(s=C.toLowerCase(),e[s]=n[C](),q.push((e[s]?"":"no-")+s));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=m,e.mq=u,e.testStyles=t,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+q.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
(function($){var plugin={};var defaults={mode:"horizontal",slideSelector:"",infiniteLoop:true,hideControlOnEnd:false,speed:500,easing:null,slideMargin:0,startSlide:0,randomStart:false,captions:false,ticker:false,tickerHover:false,adaptiveHeight:false,adaptiveHeightSpeed:500,video:false,useCSS:true,preloadImages:"visible",responsive:true,touchEnabled:true,swipeThreshold:50,oneToOneTouch:true,preventDefaultSwipeX:true,preventDefaultSwipeY:false,pager:true,pagerType:"full",pagerShortSeparator:" / ",
pagerSelector:null,buildPager:null,pagerCustom:null,controls:true,nextText:"Next",prevText:"Prev",nextSelector:null,prevSelector:null,autoControls:false,startText:"Start",stopText:"Stop",autoControlsCombine:false,autoControlsSelector:null,auto:false,pause:4E3,autoStart:true,autoDirection:"next",autoHover:false,autoDelay:0,minSlides:1,maxSlides:1,moveSlides:0,slideWidth:0,onSliderLoad:function(){},onSlideBefore:function(){},onSlideAfter:function(){},onSlideNext:function(){},onSlidePrev:function(){}};
$.fn.bxSlider=function(options){if(this.length==0)return this;if(this.length>1){this.each(function(){$(this).bxSlider(options)});return this}var slider={};var el=this;plugin.el=this;var windowWidth=$(window).width();var windowHeight=$(window).height();var init=function(){slider.settings=$.extend({},defaults,options);slider.settings.slideWidth=parseInt(slider.settings.slideWidth);slider.children=el.children(slider.settings.slideSelector);if(slider.children.length<slider.settings.minSlides)slider.settings.minSlides=
slider.children.length;if(slider.children.length<slider.settings.maxSlides)slider.settings.maxSlides=slider.children.length;if(slider.settings.randomStart)slider.settings.startSlide=Math.floor(Math.random()*slider.children.length);slider.active={index:slider.settings.startSlide};slider.carousel=slider.settings.minSlides>1||slider.settings.maxSlides>1;if(slider.carousel)slider.settings.preloadImages="all";slider.minThreshold=slider.settings.minSlides*slider.settings.slideWidth+(slider.settings.minSlides-
1)*slider.settings.slideMargin;slider.maxThreshold=slider.settings.maxSlides*slider.settings.slideWidth+(slider.settings.maxSlides-1)*slider.settings.slideMargin;slider.working=false;slider.controls={};slider.interval=null;slider.animProp=slider.settings.mode=="vertical"?"top":"left";slider.usingCSS=slider.settings.useCSS&&(slider.settings.mode!="fade"&&function(){var div=document.createElement("div");var props=["WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var i in props)if(div.style[props[i]]!==
undefined){slider.cssPrefix=props[i].replace("Perspective","").toLowerCase();slider.animProp="-"+slider.cssPrefix+"-transform";return true}return false}());if(slider.settings.mode=="vertical")slider.settings.maxSlides=slider.settings.minSlides;el.data("origStyle",el.attr("style"));el.children(slider.settings.slideSelector).each(function(){$(this).data("origStyle",$(this).attr("style"))});setup()};var setup=function(){el.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>');slider.viewport=
el.parent();slider.loader=$('<div class="bx-loading" />');slider.viewport.prepend(slider.loader);el.css({width:slider.settings.mode=="horizontal"?slider.children.length*100+215+"%":"auto",position:"relative"});if(slider.usingCSS&&slider.settings.easing)el.css("-"+slider.cssPrefix+"-transition-timing-function",slider.settings.easing);else if(!slider.settings.easing)slider.settings.easing="swing";var slidesShowing=getNumberSlidesShowing();slider.viewport.css({width:"100%",overflow:"hidden",position:"relative"});
slider.viewport.parent().css({maxWidth:getViewportMaxWidth()});if(!slider.settings.pager)slider.viewport.parent().css({margin:"0 auto 0px"});slider.children.css({"float":slider.settings.mode=="horizontal"?"left":"none",listStyle:"none",position:"relative"});slider.children.css("width",getSlideWidth());if(slider.settings.mode=="horizontal"&&slider.settings.slideMargin>0)slider.children.css("marginRight",slider.settings.slideMargin);if(slider.settings.mode=="vertical"&&slider.settings.slideMargin>0)slider.children.css("marginBottom",
slider.settings.slideMargin);if(slider.settings.mode=="fade"){slider.children.css({position:"absolute",zIndex:0,display:"none"});slider.children.eq(slider.settings.startSlide).css({zIndex:50,display:"block"})}slider.controls.el=$('<div class="bx-controls" />');if(slider.settings.captions)appendCaptions();slider.active.last=slider.settings.startSlide==getPagerQty()-1;if(slider.settings.video)el.fitVids();var preloadSelector=slider.children.eq(slider.settings.startSlide);if(slider.settings.preloadImages==
"all")preloadSelector=slider.children;if(!slider.settings.ticker){if(slider.settings.pager)appendPager();if(slider.settings.controls)appendControls();if(slider.settings.auto&&slider.settings.autoControls)appendControlsAuto();if(slider.settings.controls||(slider.settings.autoControls||slider.settings.pager))slider.viewport.after(slider.controls.el)}else slider.settings.pager=false;loadElements(preloadSelector,start)};var loadElements=function(selector,callback){var total=selector.find("img, iframe").length;
if(total==0){callback();return}var count=0;selector.find("img, iframe").each(function(){$(this).one("load",function(){if(++count==total)callback()}).each(function(){if(this.complete)$(this).load()})})};var start=function(){if(slider.settings.infiniteLoop&&(slider.settings.mode!="fade"&&!slider.settings.ticker)){var slice=slider.settings.mode=="vertical"?slider.settings.minSlides:slider.settings.maxSlides;var sliceAppend=slider.children.slice(0,slice).clone().addClass("bx-clone");var slicePrepend=
slider.children.slice(-slice).clone().addClass("bx-clone");el.append(sliceAppend).prepend(slicePrepend)}slider.loader.remove();setSlidePosition();if(slider.settings.mode=="vertical")slider.settings.adaptiveHeight=true;slider.viewport.height(getViewportHeight());el.redrawSlider();slider.settings.onSliderLoad(slider.active.index);slider.initialized=true;if(slider.settings.responsive)$(window).bind("resize",resizeWindow);if(slider.settings.auto&&slider.settings.autoStart)initAuto();if(slider.settings.ticker)initTicker();
if(slider.settings.pager)updatePagerActive(slider.settings.startSlide);if(slider.settings.controls)updateDirectionControls();if(slider.settings.touchEnabled&&!slider.settings.ticker)initTouch()};var getViewportHeight=function(){var height=0;var children=$();if(slider.settings.mode!="vertical"&&!slider.settings.adaptiveHeight)children=slider.children;else if(!slider.carousel)children=slider.children.eq(slider.active.index);else{var currentIndex=slider.settings.moveSlides==1?slider.active.index:slider.active.index*
getMoveBy();children=slider.children.eq(currentIndex);for(i=1;i<=slider.settings.maxSlides-1;i++)if(currentIndex+i>=slider.children.length)children=children.add(slider.children.eq(i-1));else children=children.add(slider.children.eq(currentIndex+i))}if(slider.settings.mode=="vertical"){children.each(function(index){height+=$(this).outerHeight()});if(slider.settings.slideMargin>0)height+=slider.settings.slideMargin*(slider.settings.minSlides-1)}else height=Math.max.apply(Math,children.map(function(){return $(this).outerHeight(false)}).get());
return height};var getViewportMaxWidth=function(){var width="100%";if(slider.settings.slideWidth>0)if(slider.settings.mode=="horizontal")width=slider.settings.maxSlides*slider.settings.slideWidth+(slider.settings.maxSlides-1)*slider.settings.slideMargin;else width=slider.settings.slideWidth;return width};var getSlideWidth=function(){var newElWidth=slider.settings.slideWidth;var wrapWidth=slider.viewport.width();if(slider.settings.slideWidth==0||(slider.settings.slideWidth>wrapWidth&&!slider.carousel||
slider.settings.mode=="vertical"))newElWidth=wrapWidth;else if(slider.settings.maxSlides>1&&slider.settings.mode=="horizontal")if(wrapWidth>slider.maxThreshold);else if(wrapWidth<slider.minThreshold)newElWidth=(wrapWidth-slider.settings.slideMargin*(slider.settings.minSlides-1))/slider.settings.minSlides;return newElWidth};var getNumberSlidesShowing=function(){var slidesShowing=1;if(slider.settings.mode=="horizontal"&&slider.settings.slideWidth>0)if(slider.viewport.width()<slider.minThreshold)slidesShowing=
slider.settings.minSlides;else if(slider.viewport.width()>slider.maxThreshold)slidesShowing=slider.settings.maxSlides;else{var childWidth=slider.children.first().width();slidesShowing=Math.floor(slider.viewport.width()/childWidth)}else if(slider.settings.mode=="vertical")slidesShowing=slider.settings.minSlides;return slidesShowing};var getPagerQty=function(){var pagerQty=0;if(slider.settings.moveSlides>0)if(slider.settings.infiniteLoop)pagerQty=slider.children.length/getMoveBy();else{var breakPoint=
0;var counter=0;while(breakPoint<slider.children.length){++pagerQty;breakPoint=counter+getNumberSlidesShowing();counter+=slider.settings.moveSlides<=getNumberSlidesShowing()?slider.settings.moveSlides:getNumberSlidesShowing()}}else pagerQty=Math.ceil(slider.children.length/getNumberSlidesShowing());return pagerQty};var getMoveBy=function(){if(slider.settings.moveSlides>0&&slider.settings.moveSlides<=getNumberSlidesShowing())return slider.settings.moveSlides;return getNumberSlidesShowing()};var setSlidePosition=
function(){if(slider.children.length>slider.settings.maxSlides&&(slider.active.last&&!slider.settings.infiniteLoop))if(slider.settings.mode=="horizontal"){var lastChild=slider.children.last();var position=lastChild.position();setPositionProperty(-(position.left-(slider.viewport.width()-lastChild.width())),"reset",0)}else{if(slider.settings.mode=="vertical"){var lastShowingIndex=slider.children.length-slider.settings.minSlides;var position=slider.children.eq(lastShowingIndex).position();setPositionProperty(-position.top,
"reset",0)}}else{var position=slider.children.eq(slider.active.index*getMoveBy()).position();if(slider.active.index==getPagerQty()-1)slider.active.last=true;if(position!=undefined)if(slider.settings.mode=="horizontal")setPositionProperty(-position.left,"reset",0);else if(slider.settings.mode=="vertical")setPositionProperty(-position.top,"reset",0)}};var setPositionProperty=function(value,type,duration,params){if(slider.usingCSS){var propValue=slider.settings.mode=="vertical"?"translate3d(0, "+value+
"px, 0)":"translate3d("+value+"px, 0, 0)";el.css("-"+slider.cssPrefix+"-transition-duration",duration/1E3+"s");if(type=="slide"){el.css(slider.animProp,propValue);el.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){el.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");updateAfterSlideTransition()})}else if(type=="reset")el.css(slider.animProp,propValue);else if(type=="ticker"){el.css("-"+slider.cssPrefix+"-transition-timing-function","linear");
el.css(slider.animProp,propValue);el.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){el.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");setPositionProperty(params["resetValue"],"reset",0);tickerLoop()})}}else{var animateObj={};animateObj[slider.animProp]=value;if(type=="slide")el.animate(animateObj,duration,slider.settings.easing,function(){updateAfterSlideTransition()});else if(type=="reset")el.css(slider.animProp,value);else if(type==
"ticker")el.animate(animateObj,speed,"linear",function(){setPositionProperty(params["resetValue"],"reset",0);tickerLoop()})}};var populatePager=function(){var pagerHtml="";var pagerQty=getPagerQty();for(var i=0;i<pagerQty;i++){var linkContent="";if(slider.settings.buildPager&&$.isFunction(slider.settings.buildPager)){linkContent=slider.settings.buildPager(i);slider.pagerEl.addClass("bx-custom-pager")}else{linkContent=i+1;slider.pagerEl.addClass("bx-default-pager")}pagerHtml+='<div class="bx-pager-item"><a href="" data-slide-index="'+
i+'" class="bx-pager-link">'+linkContent+"</a></div>"}slider.pagerEl.html(pagerHtml)};var appendPager=function(){if(!slider.settings.pagerCustom){slider.pagerEl=$('<div class="bx-pager" />');if(slider.settings.pagerSelector)$(slider.settings.pagerSelector).html(slider.pagerEl);else slider.controls.el.addClass("bx-has-pager").append(slider.pagerEl);populatePager()}else slider.pagerEl=$(slider.settings.pagerCustom);slider.pagerEl.delegate("a","click",clickPagerBind)};var appendControls=function(){slider.controls.next=
$('<a class="bx-next" href="">'+slider.settings.nextText+"</a>");slider.controls.prev=$('<a class="bx-prev" href="">'+slider.settings.prevText+"</a>");slider.controls.next.bind("click",clickNextBind);slider.controls.prev.bind("click",clickPrevBind);if(slider.settings.nextSelector)$(slider.settings.nextSelector).append(slider.controls.next);if(slider.settings.prevSelector)$(slider.settings.prevSelector).append(slider.controls.prev);if(!slider.settings.nextSelector&&!slider.settings.prevSelector){slider.controls.directionEl=
$('<div class="bx-controls-direction" />');slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);slider.controls.el.addClass("bx-has-controls-direction").append(slider.controls.directionEl)}};var appendControlsAuto=function(){slider.controls.start=$('<div class="bx-controls-auto-item"><a class="bx-start" href="">'+slider.settings.startText+"</a></div>");slider.controls.stop=$('<div class="bx-controls-auto-item"><a class="bx-stop" href="">'+slider.settings.stopText+
"</a></div>");slider.controls.autoEl=$('<div class="bx-controls-auto" />');slider.controls.autoEl.delegate(".bx-start","click",clickStartBind);slider.controls.autoEl.delegate(".bx-stop","click",clickStopBind);if(slider.settings.autoControlsCombine)slider.controls.autoEl.append(slider.controls.start);else slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);if(slider.settings.autoControlsSelector)$(slider.settings.autoControlsSelector).html(slider.controls.autoEl);else slider.controls.el.addClass("bx-has-controls-auto").append(slider.controls.autoEl);
updateAutoControls(slider.settings.autoStart?"stop":"start")};var appendCaptions=function(){slider.children.each(function(index){var title=$(this).find("img:first").attr("title");if(title!=undefined&&(""+title).length)$(this).append('<div class="bx-caption"><span>'+title+"</span></div>")})};var clickNextBind=function(e){if(slider.settings.auto)el.stopAuto();el.goToNextSlide();e.preventDefault()};var clickPrevBind=function(e){if(slider.settings.auto)el.stopAuto();el.goToPrevSlide();e.preventDefault()};
var clickStartBind=function(e){el.startAuto();e.preventDefault()};var clickStopBind=function(e){el.stopAuto();e.preventDefault()};var clickPagerBind=function(e){if(slider.settings.auto)el.stopAuto();var pagerLink=$(e.currentTarget);var pagerIndex=parseInt(pagerLink.attr("data-slide-index"));if(pagerIndex!=slider.active.index)el.goToSlide(pagerIndex);e.preventDefault()};var updatePagerActive=function(slideIndex){var len=slider.children.length;if(slider.settings.pagerType=="short"){if(slider.settings.maxSlides>
1)len=Math.ceil(slider.children.length/slider.settings.maxSlides);slider.pagerEl.html(slideIndex+1+slider.settings.pagerShortSeparator+len);return}slider.pagerEl.find("a").removeClass("active");slider.pagerEl.each(function(i,el){$(el).find("a").eq(slideIndex).addClass("active")})};var updateAfterSlideTransition=function(){if(slider.settings.infiniteLoop){var position="";if(slider.active.index==0)position=slider.children.eq(0).position();else if(slider.active.index==getPagerQty()-1&&slider.carousel)position=
slider.children.eq((getPagerQty()-1)*getMoveBy()).position();else if(slider.active.index==slider.children.length-1)position=slider.children.eq(slider.children.length-1).position();if(slider.settings.mode=="horizontal")setPositionProperty(-position.left,"reset",0);else if(slider.settings.mode=="vertical")setPositionProperty(-position.top,"reset",0)}slider.working=false;slider.settings.onSlideAfter(slider.children.eq(slider.active.index),slider.oldIndex,slider.active.index)};var updateAutoControls=
function(state){if(slider.settings.autoControlsCombine)slider.controls.autoEl.html(slider.controls[state]);else{slider.controls.autoEl.find("a").removeClass("active");slider.controls.autoEl.find("a:not(.bx-"+state+")").addClass("active")}};var updateDirectionControls=function(){if(getPagerQty()==1){slider.controls.prev.addClass("disabled");slider.controls.next.addClass("disabled")}else if(!slider.settings.infiniteLoop&&slider.settings.hideControlOnEnd)if(slider.active.index==0){slider.controls.prev.addClass("disabled");
slider.controls.next.removeClass("disabled")}else if(slider.active.index==getPagerQty()-1){slider.controls.next.addClass("disabled");slider.controls.prev.removeClass("disabled")}else{slider.controls.prev.removeClass("disabled");slider.controls.next.removeClass("disabled")}};var initAuto=function(){if(slider.settings.autoDelay>0)var timeout=setTimeout(el.startAuto,slider.settings.autoDelay);else el.startAuto();if(slider.settings.autoHover)el.hover(function(){if(slider.interval){el.stopAuto(true);slider.autoPaused=
true}},function(){if(slider.autoPaused){el.startAuto(true);slider.autoPaused=null}})};var initTicker=function(){var startPosition=0;if(slider.settings.autoDirection=="next")el.append(slider.children.clone().addClass("bx-clone"));else{el.prepend(slider.children.clone().addClass("bx-clone"));var position=slider.children.first().position();startPosition=slider.settings.mode=="horizontal"?-position.left:-position.top}setPositionProperty(startPosition,"reset",0);slider.settings.pager=false;slider.settings.controls=
false;slider.settings.autoControls=false;if(slider.settings.tickerHover&&!slider.usingCSS)slider.viewport.hover(function(){el.stop()},function(){var totalDimens=0;slider.children.each(function(index){totalDimens+=slider.settings.mode=="horizontal"?$(this).outerWidth(true):$(this).outerHeight(true)});var ratio=slider.settings.speed/totalDimens;var property=slider.settings.mode=="horizontal"?"left":"top";var newSpeed=ratio*(totalDimens-Math.abs(parseInt(el.css(property))));tickerLoop(newSpeed)});tickerLoop()};
var tickerLoop=function(resumeSpeed){speed=resumeSpeed?resumeSpeed:slider.settings.speed;var position={left:0,top:0};var reset={left:0,top:0};if(slider.settings.autoDirection=="next")position=el.find(".bx-clone").first().position();else reset=slider.children.first().position();var animateProperty=slider.settings.mode=="horizontal"?-position.left:-position.top;var resetValue=slider.settings.mode=="horizontal"?-reset.left:-reset.top;var params={resetValue:resetValue};setPositionProperty(animateProperty,
"ticker",speed,params)};var initTouch=function(){slider.touch={start:{x:0,y:0},end:{x:0,y:0}};slider.viewport.bind("touchstart MSPointerDown",onTouchStart)};var onTouchStart=function(e){if(slider.working)e.preventDefault();else{slider.touch.originalPos=el.position();var orig=e.originalEvent;var touchPoints=typeof orig.changedTouches!="undefined"?orig.changedTouches:[orig];slider.touch.start.x=touchPoints[0].pageX;slider.touch.start.y=touchPoints[0].pageY;slider.viewport.bind("touchmove MSPointerMove",
onTouchMove);slider.viewport.bind("touchend MSPointerUp",onTouchEnd)}};var onTouchMove=function(e){var orig=e.originalEvent;var touchPoints=typeof orig.changedTouches!="undefined"?orig.changedTouches:[orig];var xMovement=Math.abs(touchPoints[0].pageX-slider.touch.start.x);var yMovement=Math.abs(touchPoints[0].pageY-slider.touch.start.y);if(xMovement*3>yMovement&&slider.settings.preventDefaultSwipeX)e.preventDefault();else if(yMovement*3>xMovement&&slider.settings.preventDefaultSwipeY)e.preventDefault();
if(slider.settings.mode!="fade"&&slider.settings.oneToOneTouch){var value=0;if(slider.settings.mode=="horizontal"){var change=touchPoints[0].pageX-slider.touch.start.x;value=slider.touch.originalPos.left+change}else{var change=touchPoints[0].pageY-slider.touch.start.y;value=slider.touch.originalPos.top+change}setPositionProperty(value,"reset",0)}};var onTouchEnd=function(e){slider.viewport.unbind("touchmove MSPointerMove",onTouchMove);var orig=e.originalEvent;var touchPoints=typeof orig.changedTouches!=
"undefined"?orig.changedTouches:[orig];var value=0;slider.touch.end.x=touchPoints[0].pageX;slider.touch.end.y=touchPoints[0].pageY;if(slider.settings.mode=="fade"){var distance=Math.abs(slider.touch.start.x-slider.touch.end.x);if(distance>=slider.settings.swipeThreshold){slider.touch.start.x>slider.touch.end.x?el.goToNextSlide():el.goToPrevSlide();el.stopAuto()}}else{var distance=0;if(slider.settings.mode=="horizontal"){distance=slider.touch.end.x-slider.touch.start.x;value=slider.touch.originalPos.left}else{distance=
slider.touch.end.y-slider.touch.start.y;value=slider.touch.originalPos.top}if(!slider.settings.infiniteLoop&&(slider.active.index==0&&distance>0||slider.active.last&&distance<0))setPositionProperty(value,"reset",200);else if(Math.abs(distance)>=slider.settings.swipeThreshold){distance<0?el.goToNextSlide():el.goToPrevSlide();el.stopAuto()}else setPositionProperty(value,"reset",200)}slider.viewport.unbind("touchend MSPointerUp",onTouchEnd)};var resizeWindow=function(e){var windowWidthNew=$(window).width();
var windowHeightNew=$(window).height();if(windowWidth!=windowWidthNew||windowHeight!=windowHeightNew){windowWidth=windowWidthNew;windowHeight=windowHeightNew;el.redrawSlider()}};el.goToSlide=function(slideIndex,direction){if(slider.working||slider.active.index==slideIndex)return;slider.working=true;slider.oldIndex=slider.active.index;if(slideIndex<0)slider.active.index=getPagerQty()-1;else if(slideIndex>=getPagerQty())slider.active.index=0;else slider.active.index=slideIndex;slider.settings.onSlideBefore(slider.children.eq(slider.active.index),
slider.oldIndex,slider.active.index);if(direction=="next")slider.settings.onSlideNext(slider.children.eq(slider.active.index),slider.oldIndex,slider.active.index);else if(direction=="prev")slider.settings.onSlidePrev(slider.children.eq(slider.active.index),slider.oldIndex,slider.active.index);slider.active.last=slider.active.index>=getPagerQty()-1;if(slider.settings.pager)updatePagerActive(slider.active.index);if(slider.settings.controls)updateDirectionControls();if(slider.settings.mode=="fade"){if(slider.settings.adaptiveHeight&&
slider.viewport.height()!=getViewportHeight())slider.viewport.animate({height:getViewportHeight()},slider.settings.adaptiveHeightSpeed);slider.children.filter(":visible").fadeOut(slider.settings.speed).css({zIndex:0});slider.children.eq(slider.active.index).css("zIndex",51).fadeIn(slider.settings.speed,function(){$(this).css("zIndex",50);updateAfterSlideTransition()})}else{if(slider.settings.adaptiveHeight&&slider.viewport.height()!=getViewportHeight())slider.viewport.animate({height:getViewportHeight()},
slider.settings.adaptiveHeightSpeed);var moveBy=0;var position={left:0,top:0};if(!slider.settings.infiniteLoop&&(slider.carousel&&slider.active.last))if(slider.settings.mode=="horizontal"){var lastChild=slider.children.eq(slider.children.length-1);position=lastChild.position();moveBy=slider.viewport.width()-lastChild.outerWidth()}else{var lastShowingIndex=slider.children.length-slider.settings.minSlides;position=slider.children.eq(lastShowingIndex).position()}else if(slider.carousel&&(slider.active.last&&
direction=="prev")){var eq=slider.settings.moveSlides==1?slider.settings.maxSlides-getMoveBy():(getPagerQty()-1)*getMoveBy()-(slider.children.length-slider.settings.maxSlides);var lastChild=el.children(".bx-clone").eq(eq);position=lastChild.position()}else if(direction=="next"&&slider.active.index==0){position=el.find("> .bx-clone").eq(slider.settings.maxSlides).position();slider.active.last=false}else if(slideIndex>=0){var requestEl=slideIndex*getMoveBy();position=slider.children.eq(requestEl).position()}if("undefined"!==
typeof position){var value=slider.settings.mode=="horizontal"?-(position.left-moveBy):-position.top;setPositionProperty(value,"slide",slider.settings.speed)}}};el.goToNextSlide=function(){if(!slider.settings.infiniteLoop&&slider.active.last)return;var pagerIndex=parseInt(slider.active.index)+1;el.goToSlide(pagerIndex,"next")};el.goToPrevSlide=function(){if(!slider.settings.infiniteLoop&&slider.active.index==0)return;var pagerIndex=parseInt(slider.active.index)-1;el.goToSlide(pagerIndex,"prev")};el.startAuto=
function(preventControlUpdate){if(slider.interval)return;slider.interval=setInterval(function(){slider.settings.autoDirection=="next"?el.goToNextSlide():el.goToPrevSlide()},slider.settings.pause);if(slider.settings.autoControls&&preventControlUpdate!=true)updateAutoControls("stop")};el.stopAuto=function(preventControlUpdate){if(!slider.interval)return;clearInterval(slider.interval);slider.interval=null;if(slider.settings.autoControls&&preventControlUpdate!=true)updateAutoControls("start")};el.getCurrentSlide=
function(){return slider.active.index};el.getSlideCount=function(){return slider.children.length};el.redrawSlider=function(){slider.children.add(el.find(".bx-clone")).outerWidth(getSlideWidth());slider.viewport.css("height",getViewportHeight());if(!slider.settings.ticker)setSlidePosition();if(slider.active.last)slider.active.index=getPagerQty()-1;if(slider.active.index>=getPagerQty())slider.active.last=true;if(slider.settings.pager&&!slider.settings.pagerCustom){populatePager();updatePagerActive(slider.active.index)}};
el.destroySlider=function(){if(!slider.initialized)return;slider.initialized=false;$(".bx-clone",this).remove();slider.children.each(function(){$(this).data("origStyle")!=undefined?$(this).attr("style",$(this).data("origStyle")):$(this).removeAttr("style")});$(this).data("origStyle")!=undefined?this.attr("style",$(this).data("origStyle")):$(this).removeAttr("style");$(this).unwrap().unwrap();if(slider.controls.el)slider.controls.el.remove();if(slider.controls.next)slider.controls.next.remove();if(slider.controls.prev)slider.controls.prev.remove();
if(slider.pagerEl)slider.pagerEl.remove();$(".bx-caption",this).remove();if(slider.controls.autoEl)slider.controls.autoEl.remove();clearInterval(slider.interval);if(slider.settings.responsive)$(window).unbind("resize",resizeWindow)};el.reloadSlider=function(settings){if(settings!=undefined)options=settings;el.destroySlider();init()};init();return this}})(jQuery);

/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */

/* hoverIntent is similar to jQuery's built-in "hover" method except that
 * instead of firing the handlerIn function immediately, hoverIntent checks
 * to see if the user's mouse has slowed down (beneath the sensitivity
 * threshold) before firing the event. The handlerOut function is only
 * called after a matching handlerIn.
 *
 * // basic usage ... just like .hover()
 * .hoverIntent( handlerIn, handlerOut )
 * .hoverIntent( handlerInOut )
 *
 * // basic usage ... with event delegation!
 * .hoverIntent( handlerIn, handlerOut, selector )
 * .hoverIntent( handlerInOut, selector )
 *
 * // using a basic configuration object
 * .hoverIntent( config )
 *
 * @param  handlerIn   function OR configuration object
 * @param  handlerOut  function OR selector for delegation OR undefined
 * @param  selector    selector OR undefined
 * @author Brian Cherne <brian(at)cherne(dot)net>
 */
(function($) {
    $.fn.hoverIntent = function(handlerIn,handlerOut,selector) {

        // default configuration values
        var cfg = {
            interval: 100,
            sensitivity: 6,
            timeout: 0
        };

        if ( typeof handlerIn === "object" ) {
            cfg = $.extend(cfg, handlerIn );
        } else if ($.isFunction(handlerOut)) {
            cfg = $.extend(cfg, { over: handlerIn, out: handlerOut, selector: selector } );
        } else {
            cfg = $.extend(cfg, { over: handlerIn, out: handlerIn, selector: handlerOut } );
        }

        // instantiate variables
        // cX, cY = current X and Y position of mouse, updated by mousemove event
        // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
        var cX, cY, pX, pY;

        // A private function for getting mouse position
        var track = function(ev) {
            cX = ev.pageX;
            cY = ev.pageY;
        };

        // A private function for comparing current and previous mouse position
        var compare = function(ev,ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if ( Math.sqrt( (pX-cX)*(pX-cX) + (pY-cY)*(pY-cY) ) < cfg.sensitivity ) {
                $(ob).off("mousemove.hoverIntent",track);
                // set hoverIntent state to true (so mouseOut can be called)
                ob.hoverIntent_s = true;
                return cfg.over.apply(ob,[ev]);
            } else {
                // set previous coordinates for next time
                pX = cX; pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
            }
        };

        // A private function for delaying the mouseOut function
        var delay = function(ev,ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = false;
            return cfg.out.apply(ob,[ev]);
        };

        // A private function for handling mouse 'hovering'
        var handleHover = function(e) {
            // copy objects to be passed into t (required for event object to be passed in IE)
            var ev = $.extend({},e);
            var ob = this;

            // cancel hoverIntent timer if it exists
            if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

            // if e.type === "mouseenter"
            if (e.type === "mouseenter") {
                // set "previous" X and Y position based on initial entry point
                pX = ev.pageX; pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $(ob).on("mousemove.hoverIntent",track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                if (!ob.hoverIntent_s) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

                // else e.type == "mouseleave"
            } else {
                // unbind expensive mousemove event
                $(ob).off("mousemove.hoverIntent",track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                if (ob.hoverIntent_s) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
            }
        };

        // listen for mouseenter and mouseleave
        return this.on({'mouseenter.hoverIntent':handleHover,'mouseleave.hoverIntent':handleHover}, cfg.selector);
    };
})(jQuery);
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function() {};
    var methods = [ "assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "table", "time", "timeEnd", "timeStamp", "trace", "warn" ];
    var length = methods.length;
    var console = window.console = window.console || {};
    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
})();

(function(global,factory){if(typeof exports==="object"&&exports){factory(exports)}else if(typeof define==="function"&&define.amd){define(["exports"],factory)}else{factory(global.Mustache={})}})(this,function(mustache){var Object_toString=Object.prototype.toString;var isArray=Array.isArray||function(object){return Object_toString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}var RegExp_test=RegExp.prototype.test;function testRegExp(re,string){return RegExp_test.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};function escapeHtml(string){return String(string).replace(/[&<>"'\/]/g,function(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tags){if(typeof tags==="string")tags=tags.split(spaceRe,2);if(!isArray(tags)||tags.length!==2)throw new Error("Invalid tags: "+tags);openingTagRe=new RegExp(escapeRegExp(tags[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tags[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tags[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length)}else{nonSpace=true}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n")stripSpace()}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);token=[type,value,start,scanner.pos];tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function(){return this.tail===""};Scanner.prototype.scan=function(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view==null?{}:view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function(view){return new Context(view,this)};Context.prototype.lookup=function(name){var cache=this.cache;var value;if(name in cache){value=cache[name]}else{var context=this,names,index;while(context){if(name.indexOf(".")>0){value=context.view;names=name.split(".");index=0;while(value!=null&&index<names.length)value=value[names[index++]]}else if(typeof context.view=="object"){value=context.view[name]}if(value!=null)break;context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.cache={}}Writer.prototype.clearCache=function(){this.cache={}};Writer.prototype.parse=function(template,tags){var cache=this.cache;var tokens=cache[template];if(tokens==null)tokens=cache[template]=parseTemplate(template,tags);return tokens};Writer.prototype.render=function(template,view,partials){var tokens=this.parse(template);var context=view instanceof Context?view:new Context(view);return this.renderTokens(tokens,context,partials,template)};Writer.prototype.renderTokens=function(tokens,context,partials,originalTemplate){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this._renderSection(token,context,partials,originalTemplate);else if(symbol==="^")value=this._renderInverted(token,context,partials,originalTemplate);else if(symbol===">")value=this._renderPartial(token,context,partials,originalTemplate);else if(symbol==="&")value=this._unescapedValue(token,context);else if(symbol==="name")value=this._escapedValue(token,context);else if(symbol==="text")value=this._rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype._renderSection=function(token,context,partials,originalTemplate){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate)}}else if(typeof value==="object"||typeof value==="string"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate)}return buffer};Writer.prototype._renderInverted=function(token,context,partials,originalTemplate){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate)};Writer.prototype._renderPartial=function(token,context,partials){if(!partials)return;var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null)return this.renderTokens(this.parse(value),context,partials,value)};Writer.prototype._unescapedValue=function(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype._escapedValue=function(token,context){var value=context.lookup(token[1]);if(value!=null)return mustache.escape(value)};Writer.prototype._rawValue=function(token){return token[1]};mustache.name="mustache.js";mustache.version="1.1.0";mustache.tags=["{{","}}"];var defaultWriter=new Writer;mustache.clearCache=function(){return defaultWriter.clearCache()};mustache.parse=function(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function(template,view,partials){return defaultWriter.render(template,view,partials)};mustache.to_html=function(template,view,partials,send){var result=mustache.render(template,view,partials);if(isFunction(send)){send(result)}else{return result}};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer});
