app.value('boxes_arr', [
  { 
    "row"   : 0,
    "height" : "",
    "items" : [
      {
        "title"   : "one",
        "type"    : "incident",
        "content" : ""
      },
      {
        "title"   : "two",
        "type"    : "incident",
        "data"    : "",
        "timestamp": "",
        "options" : ""
      },
      {
        "title": "three",
        "type"    : "incident"
      },
      {
        "title": "four",
        "type"    : "incident"
      }
    ]
  },
  { 
    "row"   : 1,
    "items" : [
      {
        "title" : "1",
        "type"  : "graph",
        "data"  : [
          { 'key' : 'PORTSCAN_H',
            'y': 687
          },
          { 'key' : 'DNSAMP',
            'y': 2
          },
          { 'key' : 'VOIP_PREFIX_GUESS',
            'y': 189
          },
          { 'key' : 'BRUTEFORCE',
            'y': 122
          }],
        "config": {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                transitionDuration: 500,
                labelThreshold: 0.1,
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

app.controller('homeController', function($scope, $mdSidenav, $log, $sce, jsondata, $mdDialog, $timeout, boxes_arr) {
	$scope.boxes_arr = boxes_arr;

  $scope.title = "Home sweet home";

  $scope.options = { chart: {
                type: 'lineChart',
                height: 300,
                margin : {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                x: function(d){ return d[0]; },
                y: function(d){ return d[1]; },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e){ console.log("stateChange"); },
                    changeState: function(e){ console.log("changeState"); },
                    //tooltipShow: function(e){ console.log("tooltipShow"); },
                    //tooltipHide: function(e){ console.log("tooltipHide"); }
                },
                xAxis: {
                    axisLabel: 'Time (ms)'
                },
                yAxis: {
                    axisLabel: 'Voltage (v)',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: 30
                },
            },
            title: {
                enable: true,
                text: 'Title for Line Chart'
            },
            /*subtitle: {
                enable: true,
                css: {
                    'text-align': 'center',
                    'margin': '10px 13px 0px 7px'
                }
            },
            caption: {
                enable: true,
                css: {
                    'text-align': 'justify',
                    'margin': '10px 13px 0px 7px'
                }
            }*/
        };

        jsondata.success(function(data) {
          $scope.data = data;
        });

  $scope.editTitle = function(inputText) {

    $log.log(inputText);
    if ($scope.showTitle = true) {
      $timeout(function() {
        angular.element('.focusTitle').trigger('focus');
        console.log("trigger");
      }, 100);
    }
  }


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

app.controller('sidebar', function($scope, $mdSidenav, menu, $window) {

	menu.success(function(data) {
		$scope.menu = data;
	})

  $scope.enable = true;
  $scope.toggleItem = function() {
    $scope.toggleBtn = "toggled";
  };


  var w = angular.element($window);
  $scope.windowHeight = w.height();

  w.bind('resize', function () {
    $scope.windowHeight = w.height();
    $scope.$apply();
  })
  //$scope.windowHeight = $scope.height();


  $scope.closeLeft = function() {
      $mdSidenav('left').toggle();

    };
    
});

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

app.controller('box', function($scope, $log, boxes_arr, $timeout, jsondata, $element){
  
  //Add element to given row
  $scope.addElem = function(index) {
    $log.info("adding element");

    var item = {};

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