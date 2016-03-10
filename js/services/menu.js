app.directive("sidebarMenu", function() {
	return {
        scope: {
			section: '='
		},
		templateUrl: 'partials/sidebar-menu.html',
        controller: function($scope, $mdSidenav, $location, MENU, user, dashboard) {
            $scope.menu = MENU;

            $scope.dashboards = dashboard.getAll();
            $scope.selectedDashboard = dashboard.active();

            $scope.isActive = function(current) {
                return('#' + $location.path() == current);
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

            $scope.addDashboard = function() {
                $scope.$emit('addDashboard');
            }

            $scope.switchDashboard = function(index) {
                $scope.selectedDashboard = dashboard.active(index);
                $scope.$emit('switchDashboard', index);
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


