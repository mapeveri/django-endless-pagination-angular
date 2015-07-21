'use strict';
var App = angular.module('TestApp', ['EndlessPagination']);

App.controller("TestController", function($scope){

	// Get a reference of the notifications element.
	var notifications = angular.element(document.querySelector('#notifications'));

	// Add a notification: the element containing the value will have *id*.
    var notify = function(id, key, value) {
      var key_element = angular.element('<strong />').html(key + ': ');
      var value_element = angular.element('<span />').attr('id', id).html(value);
      var notification = angular.element('<p />').append(key_element).append(value_element);
      notifications.append(notification);
    }

	$scope.callbacks_click = function(context){
	    // Paginate!
	    notifications.html('');
        notify('onclick', 'First object on click', angular.element(document.querySelector('#endless h4')).html());
        notify('onclick-label', 'Clicked label', angular.element(this).text());
        notify('onclick-url', 'URL', context.url);
        notify('onclick-key', 'Querystring key', context.key);
	}

	$scope.callbacks_completed = function(context, fragment){
		// Complete
		notify('oncompleted', 'First object on completed', angular.element(document.querySelector('#endless h4')).html());
        notify('oncompleted-label', 'Clicked label', angular.element(this).text());
        notify('oncompleted-url', 'URL', context.url);
        notify('oncompleted-key', 'Querystring key', context.key);
	}

});
