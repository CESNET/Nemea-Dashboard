app.controller('profileController', function($scope, $log, user, dashboard) {
    $scope.user = user.get();

    $scope.save_btn = "Save";

    $scope.editUser = function(user_data) {
        $scope.save_btn = "Processing...";

        user_data["settings"] = dashboard.clean();

        user.put(user_data, true).success(function(data) {
            window.localStorage["token"] = data["jwt"];
            $scope.err_msg = "";
            $scope.user = angular.copy(user.get());
            $scope.save_btn = "Save";
        })
        .error(function(data) {
            $scope.save_btn = "Save";
            console.log(data);
            $log.error(data["error"]);
            $scope.user.password = "";
            $scope.err_msg = data["error"];
        })
    }
})
