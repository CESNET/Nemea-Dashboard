app.controller('profileController', function($scope, user, api) {
    $scope.user = user.config();

    $scope.editUser = function(user) {
        console.log(user);
    }
})
