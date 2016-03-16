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
        "from" : "12:00",
        "to" : "",
        "date" : new Date(),
        "description" : "",
        "category" : "",
        "orderby" : "DetectTime",
        "dir" : 1,
        "limit" : 100,
        "srcip" : "",
        "dstip" : ""
    }

    $scope.orderBy = ["DetectTime", "Category", "Description", "FlowCount"];
    $scope.searchText = "";

    /*$scope.querySearch = function (query) {
      var results = query ? $scope.orderBy.filter( createFilterFor(query) ) : [];
      return results;
    }

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return ($scope.orderBy.indexOf(lowercaseQuery) === 0);
      };
    }*/

   

    $scope.data = [];
    $scope.loadbtn = "Load";
    $scope.nextButton = "Load next 100 items";
    $scope.activeFilter = $location.search().filter;

    $scope.getQuery = function(ip) {
        console.log(ip);
    }

    /*$scope.parseDate = function(date) {
        console.log(date);
        
        var new_date = date.getTime();//new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
        return new_date;
    }*/
    
    $scope.switchDir = function(val) {
        if (val == -1 || val) {
            $scope.dirVal = "Descending";
            $scope.query.dir = -1;
        } else {
            $scope.dirVal = "Ascending";
            $scope.query.dir = 1;
        }
    }

    $scope.switchDir($location.search().dir);

    $scope.loadNext = function(time) {
        $scope.nextButton = "Loading...";

        if ($location.search().filter) {
            var query = angular.copy($scope.query);
            query.from = new Date(time);
            query.dir = 1;

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
                $scope.remaining = data.pop();

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
                "dir" : -1
            }

            api.get('query', query, true).success(function(data) {
                $scope.remaining = data.pop();
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

        console.log(query)
        
        from_date.setHours(from[0]);
        from_date.setMinutes(from[1]);

        var unix_date = angular.copy(query.date);
        console.log("copying date");
        
        $location.search('filter', true);
        $location.search('from', query.from);
        $location.search('date', unix_date.getTime());
        $location.search('limit', query.limit);
        $location.search('orderby', query.orderby);
        $location.search('dir', query.dir);
       

        if (query.to) {
            var to = query.to.split(':');
            var to_date = new Date(query.date);
            to_date.setHours(to[0]);
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

        if (query.srcip != "") {
            $location.search('srcip', query.srcip);
        } else {
            $location.search("srcip", null);
            query.srcip = null;

        }
        
        if (query.dstip != "") {
            $location.search('dstip', query.dstip);
        } else {
            $location.search("dstip", null);
            query.dstip = null;
        }

        var send = {
            "from" : from_date,
            "to" : to_date,
            "category" : query.category,
            "description" : query.description,
            "limit" : query.limit,
            "orderby" : query.orderby,
            "dir" : query.dir,
            "srcip" : query.srcip,
            "dstip" : query.dstip
        }
        api.get('query', send, true).success(function(data) {
			$scope.remaining = data.pop();//[data.length - 1])
			$scope.data = data;
            $scope.loadbtn = "Load"
	    }).error(function() {
            $scope.loadbtn = "Load";    
        });
    }
    
    if ($location.search().filter) {
        // Query filter is set, apply it
        
        var tmp_query = angular.copy($location.search());
        
        // First convert UNIX Timestamp to Date
        tmp_query['date'] = new Date(Number(tmp_query['date']));
        
        $scope.query = tmp_query;
        
        // Fetch items
        $scope.loadItems($scope.query);
    } else {
        // Fetch 100 recent events
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
