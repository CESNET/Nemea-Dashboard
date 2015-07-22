app.controller('homeController', ['$scope', '$mdSidenav', '$log', '$sce', 'jsondata', '$mdDialog', '$timeout', function($scope, $mdSidenav, $log, $sce, jsondata, $mdDialog, $timeout) {
	$scope.title = "Home sweet home";

  $mdSidenav('left').close();

  $scope.toggleLeft = function() {
      // $log.warning("klik");
      $mdSidenav('left').toggle();

    };

  

}]);

app.controller('sidebar', ['$scope', '$mdSidenav', 'menu', function($scope, $mdSidenav, menu) {



	menu.success(function(data) {
		$scope.menu = data;
	})

  $scope.enable = true;
  $scope.toggleItem = function() {
    $scope.toggleBtn = "toggled";
  };
    
}]);

app.factory('confirmLogout', function(){
	return function (){
	    
	};
});

app.controller('topBar', topBarCtrl);

function topBarCtrl($mdDialog, confirmLogout, $location, $mdSidenav){

  this.toggleLeft = function() {
      // $log.warning("klik");
      $mdSidenav('left').toggle();

    };

	this.user = "Petr"
  	
  this.logout = function() {
    var confirm = $mdDialog.confirm()
	        .title('Are you sure?')
	        .content('You are about to be logged out. All unsaved changes will be lost in the void!')
	        .ok('Log me out')
	        .cancel('Keep me here')
    $mdDialog.show(confirm).then(
    	function() {
    		$location.path('/login');
    	});
  };

  
};