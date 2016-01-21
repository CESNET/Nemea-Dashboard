app.factory('menu', ['$http', function($http) {
	return $http.get('json/menu.json')
		.success(function(data) {
			return data;
		});
	//	.error(console.log('Cannot retrieve data'));
}]);

app.factory('jsondata', ['$http', function($http) {
	return $http.get('json/testfile_100.json')
		.success(function(data) {
			return data;
		});
	//	.error(console.log('Cannot retrieve data'));
}]);

app.factory('api', ['$http', function($http) {
	return function(url) {
		/*$http.get('http://localhost:5000/events/' + url)
			.success(function(data) {
				console.log(data);
				response = data;
				return response;
			})
			.error(function() {
				console.log('Cannot fetch data');
			});
		return response;*/

		var addr = "http://pcstehlik.fit.vutbr.cz:5555/events/" + url

		return $http.get(addr)
			.success(function(data) {
				//console.log(JSON.stringify(data));
				return data;
			});

		//return $resource(addr, { query: { method: 'GET', isArray : false } } );
	}


//	.error(console.log('Cannot retrieve data'));
}]);

app.directive("sidebarMenu", function() {
	return {
		scope: {
			section: '='
		},
		templateUrl: 'partials/sidebar-menu.html'
	};
});

app.directive("topbarMenu", function() {
	return {
		scope: {
			section: '='
		},
		templateUrl: 'partials/topbar-menu.html'
	};
});

app.directive("boxes", function() {
	return {
		scope: {
			section: '='
		},
		templateUrl: 'partials/boxes.html'
	};
});

var loginService = angular.module('loginService', []);

loginService.factory('loginAuth', ['$http', function($http){

	var loginAuth = {};

	loginAuth.fetchUser = function (user) {
		return $http.post('http://pcstehlik.fit.vutbr.cz:5555/login', user);
	};

	return loginAuth;
}]);

app.directive('clickEdit', function() {
	var template = '<div><h2 ng-show="view.showTitle" ng-click="editTitle()">{{box.title}}</h2>' +
				'<md-input-container ng-hide="showTitle">' +
					'<input type="text" value="{{box.title}}" ng-blur="editTitle(box.title)" ng-model="box.title" class="focusTitle" aria-label="Edit Title">' +
				'</md-input-container></div>';

	return {
		restrict 	: "A",
		replace		: true,
		template 	: template,
		scope		: {
			value: "=clickEdit"
		},
		controller	: function($scope, inputText, $timeout) {
			$scope.view.showTitle = true;

			if ($scope.showTitle = true) {
		      $timeout(function() {
		        angular.element('.focusTitle').trigger('focus');
		        console.log("trigger");
		      }, 100);
		    };

		    $scope.editTitle = function() {
		    	$scope.view.showTitle = !$scope.view.showTitle;
		    };
		}
	};
});

app.directive("clickToEdit", function() {
    var editorTemplate = '<div class="click-to-edit">' +
        '<div ng-hide="view.editorEnabled" ng-click="enableEditor()">' +
            '<a ng-click="enableEditor()"><md-icon md-svg-src="img/icons/edit.svg"></md-icon></a>' +
            '{{value}} ' +
        '</div>' +
        '<md-input-container ng-show="view.editorEnabled">' +
	        '<div>' +
	            '<input ng-model="view.editableValue" class="focusTitle" aria-label="Title">' +
	            '<span ng-click="save()">Save</span>' +
	            ' or ' +
	            '<a ng-click="disableEditor()">cancel</a>.' +
	        '</div>' +
	    '</md-input-container>' +
    '</div>';

    return {
        restrict: "A",
        replace: true,
        template: editorTemplate,
        scope: {
            value: "=clickToEdit",
        },
        controller: function($scope, $timeout) {
            $scope.view = {
                editableValue: $scope.value,
                editorEnabled: false
            };

            $scope.enableEditor = function() {
                $scope.view.editorEnabled = true;
                $scope.view.editableValue = $scope.value;

                $timeout(function() {
		        angular.element('.focusTitle').trigger('focus');
		        console.log("trigger");
		      }, 100);
            };

            $scope.disableEditor = function() {
                $scope.view.editorEnabled = false;
            };

            $scope.save = function() {
                $scope.value = $scope.view.editableValue;
                $scope.disableEditor();
            };
        }
    };
});
