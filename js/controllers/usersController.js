app.controller('usersController', function($scope, api, user) {
    user.get(true).success(function(data) {
        $scope.users = data;
    });

    $scope.deleteUser = function(user_id) {
        console.log(user_id);
    }
})
