app.controller('usersController', function($scope, api, user, $mdDialog) {
    
    user.get(true).success(function(d) {$scope.people = d});

    //$scope.users = users;
    /*.success(function(data) {
        console.log(data)
        $scope.users = data;
    });*/


    $scope.myUsername = function() {
        var tmp = user.get();
        return tmp['username'];
    }

    $scope.deleteUser = function(user_id) {
        console.log(user_id);
        user.delete(user_id).success(function(data) {
            console.log(data);
            user.get(true).success(function(data) {
                $scope.users = data;
            });
        })
    }

    $scope.addUser = function(ev) {
        $scope.addUserBox = true;
        $mdDialog.show({
            controller: 'addUserController',
            templateUrl: 'partials/addUser.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: true,
            /*locals: {
                box: $scope.box
            },*/
        })
        .then(function(answer) {
            //$scope.save();
            console.log(answer)
            user.post(answer).success(function(data) {
                console.log(data);

                user.get(true).success(function(data) {
                    $scope.users = data;
                });
            })
        }, function() { // cancel
            //$scope.box = angular.copy($scope.backupModel);
            //$scope.backupModel = {};
        });

    }
});

app.controller('addUserController', function($scope, $mdDialog) {

    $scope.user = {
        username : '',
        name : '',
        surname : '',
        password : '',
        settings :[
		{
			"settings" : {
				"title" : "Basic",
				"timeshift" : "0",
				"interval" : "60"
			},
			"items" : [
				{
					"loading" : false,
					"row" : 0,
					"config" : {
						"period" : "24",
						"type" : "piechart",
						"metric" : "category"
					},
					"sizeX" : 4,
					"sizeY" : 3,
					"col" : 0,
					"title" : "24h shares",
					"type" : "piechart",
					"content" : "Click the menu icon to select edit"
				}
			]
		}
	]
	}
    $scope.saveAndClose = function(user) {
        console.log(user)
        $mdDialog.hide(user);
    };

    $scope.cancel = function(box) {
        console.log("Cancelling");
        $mdDialog.cancel();
    }
})
