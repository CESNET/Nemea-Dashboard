app.directive("sidebarMenu", function() {
	return {
        scope: {
			section: '='
		},
		templateUrl: 'partials/sidebar-menu.html',
        controller: function($scope, $mdSidenav, $location, MENU, user) {
            $scope.menu = MENU;

            $scope.isActive = function(current) {
                return('#' + $location.path() == current);
            }

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

            $scope.logout = function() {
                user.logout();
            }
    
 
        }
	};
});

app.directive("topbarMenu", function() {
	return {
		scope: {
			section: '='
		},
		templateUrl: 'partials/topbar-menu.html',
        controller : function($scope, $mdSidenav) {
            $scope.toggleLeft = function() {
                $mdSidenav('left').toggle();
            }
        }
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


