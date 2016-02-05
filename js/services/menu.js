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

app.service('api', ['$http', '$log', '$mdToast', function($http, $log, $mdToast) {

	var addr = "http://benefizio.liberouter.org:5555/v2/events/";

    this.get = function(url, info) {
		return $http.get(addr + url)
			.success(function(data) {
                if (info != undefined) {
                    $mdToast.show(
                        $mdToast
                            .simple()
                            .textContent('Data successully loaded')
                            .position("top right")
                            .hideDelay(5000)
                            .theme("success-toast")
                    );
                }

				return data;
			})
			.error(function() {
				$log.error('Cannot fetch data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Something went wrong')
                        .position("top right")
                        .hideDelay(5000)
                        .theme("error-toast")
                );

			});
    }

    this.post = function(url, data, info) {
        return $http.post(addr + url, JSON.stringify(data))
            .success(function(data) {
                if (info) {
                    $mdToast.show(
                        $mdToast
                            .simple()
                            .textContent('Data successfully loaded')
                            .position("top right")
                            .hideDelay(5000)
                            .theme("success-toast")
                    );
                }
                return data;        
            })
            .error(function() {
            	$log.error('Cannot fetch data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Something went wrong')
                        .position("top right")
                        .hideDelay(5000)
                        .theme("error-toast")
                );
            })
    }

    this.put = function(url, data, info) {
        return $http.put(addr + url, JSON.stringify(data))
            .success(function(data) {
                if (info) {
                    $mdToast.show(
                        $mdToast
                            .simple()
                            .textContent('Data successfully loaded')
                            .position("top right")
                            .hideDelay(5000)
                            .theme("success-toast")
                    );
                }
                return data;        
            })
            .error(function() {
            	$log.error('Cannot fetch data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Something went wrong')
                        .position("top right")
                        .hideDelay(5000)
                        .theme("error-toast")
                );
            })
    }

//    this.put = function

}]);

app.directive("sidebarMenu", function() {
	return {
        scope: {
			section: '='
		},
		templateUrl: 'partials/sidebar-menu.html',
        controller: function($scope, $mdSidenav, MENU) {
            $scope.menu = MENU;

            $scope.changeMode = function() {
                $scope.$emit('reqChangeMode');
            }

            $scope.enable = true;

            $scope.toggleItem = function() {
                $scope.toggleBtn = "toggled";
            };


            $scope.closeLeft = function() {
                $mdSidenav('left').toggle();
            };
    
 
        }
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
