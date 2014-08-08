/**
 * Created by Vitaly Egorov <egorov@samsonos.com> on 31.07.14.
 */
/**
 * Generic javascript smooth scroll
 */
var sjsSmoothScroll = function(params) {
    // Pointer to current object
    var _self = this;

    s.trace(_self);

    // Avoid errors when no params is passed
    if(!params) params = {};

    /** External before handler must return true to scroll */
    var _beforeHandler = params.beforeHandler ? params.beforeHandler : function(){return true;};
    /** External finish handler called when scroll is finished */
    var _finishHandler = params.finishHandler ? params.finishHandler : function(){return true;};
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

    /**
     * Get SamsonJS DOM node anchor from link
     * @param link SamsonJS scroll link object
     * @return SamsonJS|false DOM node anchor object
     */
    _self.getAnchor = function(link) {
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
            return false;
        }
    };

    // If we have hash pointer on plugin load
    if (typeof window.location.hash != 'undefined') {
        // Find anchor by URL hash identifier
        var anchor = _self.getAnchor('#'+window.location.hash);
        // Check if before handler returns true
        if(anchor && _beforeHandler()) {
            // Scroll window to this anchor
            s.pageScrollTop(anchor.offset().top, _startSpeed, _finishHandler);
        }
    }
    
	/**
	 * Generic container scroll event handler for switching active links
	 */
    _self.scrollHander = function(){
        // Get current scroll
        var st = s.pageScrollTop();

        // Current anchor index
        var idx = 0;

        // Iterate ALL scroll links to make the most relevant link active
        _self.each(function(link){

            // Find anchor by URL hash identifier
            var anchor = _self.getAnchor(link);
            if(anchor) {
                // If scroll is near this anchor
                if (anchor.offset().top - st < _menuStep) {

                    // Make all links inactive
                    _self.removeClass(_menuCSSActive);
                    //s.trace(_self);
                    // Activate current link matches this slide
                    _self.elements[idx].addClass(_menuCSSActive);
                }
            }

            // Increase anchor counter
            idx++;
        });
    };
	
	// Call first time by ourselves to select active link
	_self.scrollHander();
	
	// Bind scroll event
	s(window).scroll(_self.scrollHander);

    // Iterate all objects in current DOM collection
    return _self.each(function(link){
        // Find anchor by URL hash identifier
        var anchor = _self.getAnchor(link);
        // Check if before handler returns true
        if(anchor) {
            // Bind click event to scroll to anchor
            link.click(function(){
                // Call before handler
                if (_beforeHandler()) {
                    //s.trace('scrolling page to '+anchor.a('id')+' '+anchor.offset().top);
                    // Perform animation to scroll page to anchor + offset
                    s.scrollPageTo(anchor.offset().top + _offset, _speed, function(){
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
}

/** Add smooth scroller to SamsonJS framework as plugin */
SamsonJS.extend({ smoothScroll : sjsSmoothScroll });