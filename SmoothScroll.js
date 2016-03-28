/**
 * Created by Vitaly Egorov <egorov@samsonos.com> on 31.07.14.
 */
/**
 * Generic javascript smooth scroll
 */
var sjsSmoothScroll = function(params) {
    // Pointer to current object
    var _self = this;

    // Avoid errors when no params is passed
    if (!params) params = {};

    /** External before handler must return true to scroll */
    var _beforeHandler = params.beforeHandler ? params.beforeHandler : function () {
        return true;
    };
    /** External finish handler called when scroll is finished */
    var _finishHandler = params.finishHandler ? params.finishHandler : function () {
        return true;
    };
    /** Scroll speed */
    var _speed = params.speed ? params.speed : 500;
    /** Scroll speed when page is loaded if hash is present */
    var _startSpeed = params.startSpeed ? params.startSpeed : 0;
    /** Step to determine which anchor is active **/
    var _menuStep = params.menuStep ? params._menuStep : 100;
    /** CSS class to mark active link */
    var _menuCSSActive = params.menuCSSActive ? params.menuCSSActive : 'active';
    /** Offset from element in pixels */
    var _offset = params.offset ? params.offset : 0;
    /** External handler when menu item state is changed */
    var _stateChangeHandler = params.stateChangeHandler ? params.stateChangeHandler : function (menuLink, allLinks) {
        // Make all links inactive
        allLinks.removeClass(_menuCSSActive);
        // Activate current link matches this slide
        menuLink.addClass(_menuCSSActive);

        return menuLink.a('href');
    };

    /**
     * Get SamsonJS DOM node anchor from link
     * @param link SamsonJS scroll link object
     * @return SamsonJS|false DOM node anchor object
     */
    _self.getAnchor = function (link) {
        // If SamsonJS object is passed - get href attribute other wise we think that this is hash string
        var hash = typeof(link) == 'object' ? link.a('href').substring(link.a('href').indexOf('#')) : link;

        // Get hash parameter from link URL
        var href = hash.substring(hash.indexOf('#'));

        // Try to find DOM object
        var anchor = s(href);
        if (anchor.length) {
            // Return SamsonJS DOM node object
            return anchor;
        } else { // Return false to use in if's
            console.log('Cannot find anchor element('+hash+')');
            return false;
        }
    };

    /** Collection of cached anchors */
    var _anchors = [];

    // Iterate ALL scroll links to make the most relevant link active
    _self.each(function (link) {
        // Get DOM element by link
        var anchor = _self.getAnchor(link);
        if (anchor) {
            // Retrieve only need info from anchor
            _anchors.push({
                top: anchor.offset().top,
                height: anchor.height(),
                id: anchor.a('id')
            });
        }
    });

    // If we have hash pointer on plugin load
    if (typeof window.location.hash != 'undefined') {
        // Find anchor by URL hash identifier
        var anchor = _self.getAnchor('#' + window.location.hash);
        // Check if before handler returns true
        if (anchor && _beforeHandler()) {
            // Scroll window to this anchor
            s.pageScrollTop(anchor.offset().top, _startSpeed, _finishHandler);
        }
    }

    /** Store current selected menu item to avoid re-rendering of all menu items */
    var _currentActiveIdx = -1;

    // Save most relevant hash
    var _hashString = '';

    // Viewport height
    var _screenHeight = s.pageHeight();

    // Current scroll Y position
    var _scrollTop;

    // Our timer function to reduce recalculations
    setInterval(function() {
        // Current anchor index
        var idx = 0;

        // Iterate ALL anchors
        for (var i in _anchors) {
            var anchor = _anchors[i];

            // If this menu item is not already active
            if (idx !== _currentActiveIdx) {
                // Get current anchor absolute position on page
                var anchorOffset = anchor.top;
                // Get current anchor height
                var anchorHeight = anchor.height;
                // Get current anchor absolute bottom Y position on page
                var anchorOffsetBottom = anchor.top + anchor.height;

                // Get current center screen Y position
                var scrollMiddleY = _scrollTop + _screenHeight / 2 + _offset;

                // If scroll is near this anchor
                if ((scrollMiddleY > anchorOffset && scrollMiddleY < anchorOffsetBottom) || (scrollMiddleY > anchorOffset && scrollMiddleY < anchorOffsetBottom)) {
                    // Store active menu item index
                    _currentActiveIdx = idx;

                    //s.trace('Changing active item to '+idx);

                    // Call state changing handler
                    var anchorId = _stateChangeHandler(_self.elements[idx], _self);

                    // Save link
                    _hashString = '#' + anchor.id;

                    // Change url with hash of active item
                    if (window.history.pushState) {
                        window.history.pushState(null, null, window.location.pathname + _hashString);
                    } else {
                        window.location.hash = _hashString;
                    }
                }
            }

            // Increase anchor counter
            idx++;
        }
    }, 100);

    /**
     * Generic container scroll event handler for switching active links
     */
    _self.scrollHandler = function (obj, obj, event) {
        // Set current scroll
        _scrollTop = s.pageScrollTop();
    };

    // Call first time by ourselves to select active link
    _self.scrollHandler();

    // Bind scroll event
    s(window).scroll(_self.scrollHandler);

    // Iterate all objects in current DOM collection
    return _self.each(function (link) {
        // Find anchor by URL hash identifier
        var anchor = _self.getAnchor(link);
        // Check if before handler returns true
        if (anchor) {
            // Bind click event to scroll to anchor
            link.click(function () {
                // Call before handler
                if (_beforeHandler()) {
                    //s.trace('scrolling page to '+anchor.a('id')+' '+anchor.offset().top);
                    // Perform animation to scroll page to anchor + offset
                    s.scrollPageTo(anchor.offset().top + _offset, _speed, function () {
                        // Change current window hash
                        window.location.hash = anchor.a('id');
                        // Call external finish handler
                        _finishHandler();
                    });
                }

                // Ignore link default action propagation
                return false;
            });
        }
    });
};

/** Add smooth scroller to SamsonJS framework as plugin */
SamsonJS.extend({ smoothScroll : sjsSmoothScroll });
