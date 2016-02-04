app.value('boxes_arr', [
  { 
    "row"   : 0,
    "height" : "",
    "items" : [
      {
        "title"   : "Events shares",
        "type"    : "piechart",
        "content" : "",
        "config"  : {
            "metric"    : "category",
            "type"      : "piechart",
            "period"    : "24",
            "begintime" : ""
        }
      },
      {
        "title"   : "Last 24 hours",
        "type"    : "barchart",
        "data"    : "",
        "timestamp": "",
        "config" : {
            "metric" : "category",
            "type" : "barchart",
            "period" : 24,
            "window" : 15,
            "begintime" : ""
        }
        /*"options" : { 
            chart: {
                type: 'multiBarChart',
                height: 300,
                margin : {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                x: function(d){ return d.x; },
                y: function(d){ return d.y; },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e){ console.log("stateChange"); },
                    changeState: function(e){ console.log("changeState"); },
                    //tooltipShow: function(e){ console.log("tooltipShow"); },
                    //tooltipHide: function(e){ console.log("tooltipHide"); }
                },
                xAxis: {
                    axisLabel: 'Time (ms)',
                    tickFormat: function(d) {
                        return d3.time.format('%x/%X')(new Date(d))
                    }
                },
                yAxis: {
                    axisLabel: 'Voltage (v)',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: 0
                },
            },
            title: {
                enable: true,
                text: 'Title for Line Chart 2'
            },
          }*/
      },
      // {
      //   "title": "three",
      //   "type"    : "incident"
      // },
    ]
  },
  { 
    "row"   : 1,
    "items" : [
      {
        "title" : "Last 1000 events",
        "type"  : "graph",
        // "data"  : [
        //   { 'key' : 'PORTSCAN_H',
        //     'y': 687
        //   },
        //   { 'key' : 'DNSAMP',
        //     'y': 2
        //   },
        //   { 'key' : 'VOIP_PREFIX_GUESS',
        //     'y': 189
        //   },
        //   { 'key' : 'BRUTEFORCE',
        //     'y': 122
        //   }],
        "options": {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                donut : true,
                padAngle : 0.02,
                cornerRadius : 3,
                transitionDuration: 500,
                labelThreshold: 0.1,
                color: ["#0ec4f4", "#631FF6", "#FFDC06", "#FF8406", "#b56969", "#e6cf8b"],
                legend: {
                    margin: {
                        top: 0,
                        right: 100,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        }
      },
      {
        "title": "2",
        "type"    : "incident"
      },
    ]
  },
  ]);

//app.value('editMode', false);

function processData(data) {
  var dataArr = [];
  angular.forEach(data, function(value, key) {
    //console.log(data[key]["scale"]);
    dataArr.push({ x : data[key]["time_first"]*1000, y : data[key]["scale"]});
  });

  return [{values: dataArr}];
};

function pieChart(data) {
  var counter = new Object();
  angular.forEach(data, function(value, key) {
      var doctype = data[key]['type'];

      if (counter[doctype] != undefined ) {
        counter[doctype] += 1;
      } else {
        counter[doctype] = 1;
      }
  });

  var dataArr = [];
  angular.forEach(counter, function(value, key) {
    dataArr.push({key : key, y : value});
  });

  return dataArr;
}

app.controller('userController', function($scope){
  console.log("hello!");
});

app.controller('homeController', function($scope, $mdSidenav, $log, $sce, api, $mdDialog, $timeout, boxes_arr, $http, $rootScope) {
	$scope.boxes_arr = boxes_arr;
  $scope.title = "Home sweet home";
  
  //Show/hide edit buttons on button click
  //@default: hidden/false
  $scope.$on('reqChangeMode', function(e) {
    if ($scope.editMode == undefined) {
      $scope.editMode = true;
    } else {
      $scope.editMode = !($scope.editMode);
    }
  });

  /*var resp = $http.get('http://localhost:5000/events/type/portscan/last/100')
        .success(function(response) {
          $scope.data = response;
          return processData(response)
        })
        .error(function(response) {
          console.log(response);
        });

        console.log($scope.data);
*/
  /*api('type/portscan/top/10').success(function(data) {
    var proccessed = processData(data);
    //console.log(proccessed);
    boxes_arr[0].items[1].data = proccessed;
    //console.log(JSON.stringify(boxes_arr[0].items[1].data));
  })

  api('type/portscan/top/1').success(function(data) {
    //var proccessed = processData(data);
    //console.log(proccessed);
    //boxes_arr[0].items[1].data = proccessed;
    //console.log(JSON.stringify(data));
  })

  api('last/1000').success(function(data) {
    boxes_arr[1].items[0].data = pieChart(data);
    //console.log(pieChart(data));
  })*/

  

        //console.log(data);
        //boxes_arr[0].items[1].data = data;


  $scope.addRow = function() {
    $log.info("adding row");
    console.log(boxes_arr);
    var tmp = {};

    tmp.row = boxes_arr.length;
    tmp.items = [{
      "title" : "aloha!"
    }];
    boxes_arr.push(tmp);
  };

  $scope.showTitle = true;

});


app.constant("MENU", [
	{
		"title" : "Dashboard",
		/*"items" : [
			{
				"title" : "Users",
				"link"	: "user"
			},
			{
				"title" : "My profile"
			}
		]*/
	},
	{
		"title" : "Events",
		"link" 	: "events"
	},
	/*{
		"title" : "Analytics23",
		"items" : [
			{
				"title" : "Users",
				"link" 	: "settings"
			},
			{
				"title" : "My profile",
				"link"	: "profile"
			},
			{
				"title" : "My profile",
				"link"	: "profile"
			}
		]

	},
	{
		"title" : "Analytics123",
		"link" 	: "login"
	},*/
	{
		"title" : "Settings",
		"items" : [
			{
				"title" : "Users",
				"link" 	: "settings"
			},
			{
				"title" : "My profile",
				"link"	: "profile"
			},
			{
				"title" : "My profile",
				"link"	: "profile"
			}
		]
	}
]);



app.factory('confirmLogout', function(){
	return function (){
	    
	};
});

app.controller('topBar', topBarCtrl);

function topBarCtrl($mdDialog, confirmLogout, $location, $mdSidenav){

	this.user = "Petr"

  this.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };
  	
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

app.controller('row', function($scope, $timeout){
  $scope.$on('requestRedraw', function(e) {
    e.stopPropagation();
    $timeout(function() {
      console.log("request accepted");
      window.dispatchEvent(new Event('resize'));
    }, 10);
  });
});

app.controller('box', function($scope, $log, boxes_arr, $timeout, $element, $mdDialog, PROTOCOLS, TYPES, CATEGORIES, $http, PIECHART, AREA){
    
    function timeShift() {    
        if ($scope.box != undefined && ($scope.box.type == "piechart" || $scope.box.type == "barchart" )) {
            $scope.box.config.begintime = (function() {
                var now = new Date();
                now.setHours(now.getHours() - $scope.box.config.period);
                console.log(now)
                return now;
            })();
        }
    }

    timeShift();

    $scope.loading = true;
        
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    $scope.editMode = false;
    $scope.backupModel = {};


    $scope.protocol = PROTOCOLS;
    $scope.types = TYPES;
    $scope.categories = CATEGORIES;


    ///////////////////////////////////////////////////////
    // Edit mode handling
    ///////////////////////////////////////////////////////

    // Trigger editing mode and save current state
    $scope.edit = function(box) {
        $scope.editMode = true;
        $scope.backupModel = angular.copy(box);
    }

    // Save changes and disable edit mode
    $scope.save = function() {
        if ($scope.box.type == 'piechart')
            $scope.box.options = PIECHART.options;
        if ($scope.box.type == 'barchart')
            $scope.box.options = AREA.options;$scope.backupModel = {};
        $scope.box.config.type = $scope.box.type;
        $scope.editMode = false;
        $scope.loading = true;
        timeShift();
        $http.post('http://benefizio.liberouter.org:5555/v2/events/agg', JSON.stringify($scope.box.config)).success(function(data) {
            $scope.loading = false;    
            $scope.box.data = data;
            $scope.api.updateWithTimeout(5);        
        });
    }

    // Revert to original and disable edit mode
    $scope.cancel = function(box) {
        $scope.box = angular.copy($scope.backupModel);
        $scope.backupModel = {};
        $scope.editMode = false;
    }
    $scope.total = 0;
    
    if ($scope.box != undefined && ($scope.box.type == "piechart" || $scope.box.type == "barchart")) {
        if ($scope.box.type == 'piechart')
            $scope.box.options = PIECHART.options;
        if ($scope.box.type == 'barchart')
            $scope.box.options = AREA.options;
       
        $scope.box.config.type = $scope.box.type;
        
        $http.post('http://benefizio.liberouter.org:5555/v2/events/agg', JSON.stringify($scope.box.config)).success(function(data) {
            $scope.loading = false;
            $scope.box.data = data;
            if ($scope.box.type == 'piechart') {
                console.log($scope.box.data)
                for(var i = 0; i < $scope.box.data.length; i++) {
                    console.log($scope.box.data[i].x)
                    $scope.total = $scope.total + Number($scope.box.data[i].x);
                }
            }
        });
        //}
    }


    $scope.user = function() {
        var settings = angular.copy($scope.boxes_arr);
        console.log(settings);
        for (var i = 0; i < settings.length; i++) {
            for (var j = 0; j < settings[i].items.length; j++) {
                settings[i].items[j].data = [];
                console.log(settings[i].items[j].data);
            }
        }
        
        var query = {
            'id' : '56b33e737194ed8d440db2b7',
            'password' : 'password',
            'settings' : settings
        }
        $http.put('http://benefizio.liberouter.org:5555/v2/users/', JSON.stringify(query))
            .success(function(data) {
                console.log(data);
            })
            .error(function(data){
                $log.error(data)
            })
    }

    


  //Add element to given row
    $scope.addElem = function(index) {
        $log.info("adding element");

        var item = {
            title : 'New widget',
            config : {}

        };
        $scope.full = false;


    if (boxes_arr[index].items.length > 5) {
      $scope.full = true;
    } else {
      boxes_arr[index].items.push(item);
    }

    $scope.$emit('requestRedraw');
  };

  $scope.removeElem = function(parIndex,index) {

    $log.info(parIndex);
    $log.info(index);

    boxes_arr[parIndex].items.splice(index, 1);
    var tmp = {};
            
    if(boxes_arr[parIndex].items.length == 0) {
      tmp = boxes_arr[parIndex].items[index];
      boxes_arr.splice(parIndex, 1);
    }

    $scope.$emit('requestRedraw');
  };

});
