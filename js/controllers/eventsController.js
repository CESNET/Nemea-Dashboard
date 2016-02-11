app.controller('eventsController', function($scope, $http, $mdToast, api) {
    $scope.filter = {
        "category" : "",
        "proto" : "",
        "desc" : "",
        "flows_from" : "",
        "flows_to" : "",
        "items" : 100,
        "btn" : "Load"
    };
    $scope.query = {
        "from" : "",
        "to" : "",
        "date" : "",
        "limit" : 100
    }
    
    $scope.data = [];

    api.get($scope.filter.items).success(function(data) {
				//console.log(JSON.stringify(data));
				$scope.data = data;
	});

    $scope.loadItems = function(query) {
        $scope.filter.btn = "Loading...";
        
        var from = query.from.split(':');
        var from_date = new Date(query.date);
        from_date.setUTCHours(from[0]);
        from_date.setUTCMinutes(from[1]);

        if (query.to) {
            var to = query.to.split(':');
            var to_date = new Date(query.date);
            to_date.setUTCHours(to[0]);
            to_date.setUTCMinutes(to[1]);
        } else {
            var to_date = null;
        }

        var send = {
            "from" : from_date,
            "to" : to_date,
            "category" : query.category,
            "description" : query.description,
            "limit" : query.limit
        }
        api.get('query', send, true).success(function(data) {
		    console.log(data);
            
			$scope.data = data;
            $scope.filter.btn = "Load"
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Data loaded!')
                    .position("top right")
                    .hideDelay(3000)
                );
	    }).error(function() {
            $scope.filter.btn = "Load";    
        });
    }



    $scope.enableTable = true;
    /*$scope.filter = "$";
    $scope.search = {$ : '', "Source": [ { "Proto": [ "" ], "IP4": [ "" ] }]}
    $scope.changeFilterTo = function(pr) {
        $scope.filter = pr; 
    }*/

    $scope.events = function(item) {
        //console.log(JSON.stringify(item));
        var res = [];
        if ($scope.filter.proto != ""){
            if (i == 50) {console.log("filtering proto"); i = 0;}
            if ("Source" in item) {
                if ("Proto" in item.Source[0] && item.Source[0].Proto[0].toLowerCase().indexOf($scope.filter.proto.toLowerCase()) > -1) {
                    res.push(1);
                }
                else
                    res.push(0);
            } else {
                res.push(0);
            }
        }

        if ($scope.filter.category != "") {
            if (item.Category[0].toLowerCase().indexOf($scope.filter.category.toLowerCase()) > -1) {
                res.push(1);
            } else {
                res.push(0);
            }
        }

        if ($scope.filter.desc != "") {
            if (item.Description.toLowerCase().indexOf($scope.filter.desc.toLowerCase()) > -1)
                res.push(1);
            else
                res.push(0);
        }

        if ($scope.filter.flows_from != "") {
            if (item.FlowCount > Number($scope.filter.flows_from))
                res.push(1);
            else
                res.push(0);
        }

        if ($scope.filter.flows_to != "") {
            if (item.FlowCount < Number($scope.filter.flows_to))
                res.push(1);
            else
                res.push(0);
        }

        var logicvalue = 1;
  //      console.log(res);
        for (var i = 0; i < res.length; i++) {
            logicvalue = logicvalue * res[i];
      //      console.log(Number(res[i]));
    //        console.log(logicvalue);
        }
        return logicvalue == 1 ? true : false;

    }

});

app.directive('validateHours', function() {
    var to = [];
    var from = [];
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            ctrl.$validators.time = function(modelValue, viewValue) {
                if (attrs.ngModel == "query.from" && viewValue) {
                    from = viewValue.split(':');
                } else if (viewValue) {
                    to = viewValue.split(':');
                }
            
            if (to.length == 2) {
                if (to[0] < from[0] || (to[0] <= from[0] && to[1] < from[1])) {
                    //ctrl.$setValidity('time', false);
                    return false;
                } 
            }
            return true;
            }
        }
    }
});
