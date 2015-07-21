'use strict';
var App = angular.module('EndlessPagination', []);

/*Closest*/
(function (ELEMENT) {
    ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
    ELEMENT.closest = ELEMENT.closest || function closest(selector) {
        var element = this;
        while (element) {
            if (element.matches(selector)) {
                break;
            }
            element = element.parentElement;
        }
        return element;
    };
}(Element.prototype));

/* polyfill for Element.prototype.matches */
if ( !Element.prototype.matches ) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector;
    if ( !Element.prototype.matches ) {
        Element.prototype.matches = function matches( selector ) {
            var element = this;
            var matches = ( element.document || element.ownerDocument ).querySelectorAll( selector );
            var i = 0;
            while ( matches[i] && matches[i] !== element ) {
                i++;
            }
            return matches[i] ? true : false;
        }
    }
}

/* addDelegatedEventListener */
Element.prototype.addDelegatedEventListener = function addDelegatedEventListener( type, selector, listener, useCapture, wantsUntrusted ) {
    this.addEventListener( type, function ( evt ) {
        var element = evt.target;
        do {
            if ( !element.matches || !element.matches( selector ) ) continue;
            listener.apply( element, arguments );
            return;
        } while ( ( element = element.parentNode ) );
    }, useCapture, wantsUntrusted );
}



App.directive('endlessPagination', function($http, $window, $document) {
    return function (scope, element, attrs) {

        var defaults = {
            // Twitter-style pagination container selector.
            containerSelector: '.endless_container',
            // Twitter-style pagination loading selector.
            loadingSelector: '.endless_loading',
            // Twitter-style pagination link selector.
            moreSelector: 'a.endless_more',
            // Digg-style pagination page template selector.
            pageSelector: '.endless_page_template',
            // Digg-style pagination link selector.
            pagesSelector: 'a.endless_page_link',
            // Callback called when the user clicks to get another page.
            onClick: function() {},
            // Callback called when the new page is correctly displayed.
            onCompleted: function() {},
            // Set this to true to use the paginate-on-scroll feature.
            paginateOnScroll: false,
            // If paginate-on-scroll is on, this margin will be used.
            paginateOnScrollMargin : 1,
            // If paginate-on-scroll is on, it is possible to define chunks.
            paginateOnScrollChunkSize: 0
        },

        settings = angular.extend(defaults, (attrs.endlessPagination ? eval('(' + attrs.endlessPagination + ')') : ""));

        var getContext = function(link) {
            return {
                key: link.attr('rel').split(' ')[0],
                url: link.attr('href')
            };
        };

        return angular.forEach(element, function() {
            var loadedPages = 1;
            // Twitter-style pagination.
            element[0].addDelegatedEventListener('click', settings.moreSelector, function ($event) {
                var link = angular.element(this);
                var html_link = link[0];
                var container = angular.element(html_link.closest(settings.containerSelector));
                var loading = container.children(settings.loadingSelector);
                // Avoid multiple Ajax calls.
                if (loading.offsetWidth > 0 && loading.offsetHeight > 0) {
                    $event.preventDefault();
                }
                link[0].style.display="none";
                loading[0].style.display="block";
                var context = getContext(link);
                //For get function onClick
                if(typeof settings.onClick == 'string'){
                    var onClick = scope.$eval(settings.onClick);
                }else{
                    var onClick = settings.onClick;
                }
                //For get function onComplete
                if(typeof settings.onCompleted == 'string'){
                    var onCompleted = scope.$eval(settings.onCompleted);
                }else{
                    var onCompleted = settings.onCompleted;
                }
                // Fire onClick callback.
                if (onClick.apply(html_link, [context]) !== false) {
                    // Send the Ajax request.
                    $http({
                        method: "GET",
                        url: context.url,
                        params: {querystring_key: context.key},
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }).success(function(fragment){
                        container.parent().append(fragment);
                        container.remove();
                        // Increase the number of loaded pages.
                        loadedPages += 1;
                        // Fire onCompleted callback.
                        onCompleted.apply(html_link, [context, fragment.trim()]);
                    });
                }
                $event.preventDefault();
            });

            // On scroll pagination.
            if (settings.paginateOnScroll) {
                angular.element($window).bind("scroll", function() {
                    if ($document[0].body.offsetHeight - $window.innerHeight -
                        $window.pageYOffset <= settings.paginateOnScrollMargin) {
                        // Do not paginate on scroll if chunks are used and
                        // the current chunk is complete.
                        var chunckSize = settings.paginateOnScrollChunkSize;
                        if (!chunckSize || loadedPages % chunckSize) {
                            if(document.querySelector(settings.moreSelector) != null){
                                document.querySelector(settings.moreSelector).click();
                            }
                        }
                    }
                });
            }

            // Digg-style pagination.
            element[0].addDelegatedEventListener('click', settings.pagesSelector, function ($event) {
                var link = angular.element(this),
                html_link = link[0],
                context = getContext(link);
                //For get function onClick
                if(typeof settings.onClick == 'string'){
                    var onClick = scope.$eval(settings.onClick);
                }else{
                    var onClick = settings.onClick;
                }
                //For get function onComplete
                if(typeof settings.onCompleted == 'string'){
                    var onCompleted = scope.$eval(settings.onCompleted);
                }else{
                    var onCompleted = settings.onCompleted;
                }
                // Fire onClick callback.
                if (onClick.apply(html_link, [context]) !== false) {
                    var page_template = angular.element(html_link.closest(settings.pageSelector));
                    $http({
                        method: "GET",
                        url: context.url,
                        params: {querystring_key: context.key},
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }).success(function(fragment){
                        page_template.html(fragment);
                        onCompleted.apply(html_link, [context, fragment.trim()]);
                    });
                }
                $event.preventDefault();
            });
        });
    };
});
