app.controller('eventsController', function($scope, $http, $location, api) {
    $scope.filter = {
        "category" : "",    // Category
        "src_ip" : "",      // Source IP
        "trt_ip" : "",      // Target IP
        "desc" : "",        // Description
        "flows_from" : "",  // FlowCount
        "flows_to" : "",    // FlowCount
        "items" : 100,      // Limit number of displayed items
    };
    $scope.query = {
        "from" : "",
        "to" : "",
        "date" : new Date(),
        "description" : "",
        "category" : "",
        "limit" : 100
    }

    $scope.data = [];
    $scope.loadbtn = "Load";
    $scope.nextButton = "Load next 100 items";
    console.log($scope.query.date);
    $scope.activeFilter = $location.search().filter;

    $scope.loadNext = function(time) {
        $scope.nextButton = "Loading...";

        if ($location.search().filter) {
            var query = angular.copy($scope.query);
            query.from = new Date(time);
            query.direction = 1;

            if (query.to) {
                var to = query.to.split(':');
                var to_date = new Date(query.date);
                to_date.setHours(to_date.getHours() + to[0]);
                to_date.setMinutes(to[1]);

            } else {
                var to_date = null;
            }

            query.to = to_date;


            api.get('query', query, true).success(function(data) {
                for(item in data) {
                    $scope.data.push(data[item]);
                }

                $scope.nextButton = "Load next 100 items";
            }).error(function(err, msg) {
            
                $scope.nextButton = "Load next 100 items";
            })
           
        }
        else {
            query = {
                "to" : new Date(time),
                "direction" : -1
            }

            api.get('query', query, true).success(function(data) {
                for(item in data) {
                    $scope.data.push(data[item]);
                }
                $scope.nextButton = "Load next 100 items";
            })
            .error(function(err, msg) {
            
                $scope.nextButton = "Load next 100 items";
            })
        }
    }

    $scope.loadItems = function(query) {
        $scope.loadbtn = "Loading...";
        var from = query.from.split(':');
        var from_date = new Date(query.date);
        from_date.setHours(from_date.getHours() + from[0]);
        from_date.setMinutes(from[1]);
        
        $location.search('filter', true);
        $location.search('from', query.from);
        $location.search('date', query.date);
        $location.search('limit', query.limit);

        

        if (query.to) {
            var to = query.to.split(':');
            var to_date = new Date(query.date);
            to_date.setHours(to_date.getHours() + to[0]);
            to_date.setMinutes(to[1]);
            $location.search('to', query.to);
        } else {
            var to_date = null;
        }

        if (query.description != "") {
            $location.search('description', query.description);
        } else {
            query.description = null;
        }

        if (query.category != "") {
            $location.search('category', query.category);
        } else {
            query.category = null;
        }

        var send = {
            "from" : from_date,
            "to" : to_date,
            "category" : query.category,
            "description" : query.description,
            "limit" : query.limit
        }
        api.get('query', send, true).success(function(data) {
			$scope.data = data;
            $scope.loadbtn = "Load"
	    }).error(function() {
            $scope.loadbtn = "Load";    
        });
    }
    
    if ($location.search().filter) {
        $scope.query = $location.search();
        console.log($scope.query.date)
        $scope.query.date = new Date($scope.query.date);
        $scope.loadItems($scope.query);
    } else {

        api.get("100").success(function(data) {
            $scope.data = data;
        });
    }

    $scope.events = function(item) {
        var res = [];
        if ($scope.filter.src_ip != ""){
            if ("Source" in item) {
                if ("IP4" in item.Source[0] && 
                    item.Source[0].IP4[0].toLowerCase().indexOf($scope.filter.src_ip.toLowerCase()) > -1) {
                    res.push(1);
                }
                else
                    res.push(0);
            } else {
                res.push(0);
            }
        }

        if ($scope.filter.trt_ip != ""){
            if ("Target" in item) {
                if ("IP4" in item.Target[0] && 
                    item.Target[0].IP4[0].toLowerCase().indexOf($scope.filter.trt_ip.toLowerCase()) > -1) {
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
        for (var i = 0; i < res.length; i++) {
            logicvalue = logicvalue * res[i];
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
            if (to.length == 2 || from.length == 2) {
                if (to[0] < from[0] || (to[0] <= from[0] && to[1] < from[1]) ||
                    to[0] < 0 || to[0] > 23 || to[1] < 0 || to[1] > 59 || from[0] < 0 || from[0] > 23 || from[1] < 0 || from[1] > 59
                    ) {
                    return false;
                } 
            }
            return true;
            }
        }
    }
});
