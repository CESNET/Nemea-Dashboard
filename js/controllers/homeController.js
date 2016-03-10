app.controller('homeController', function($scope, user, $timeout, $interval, $log, $localStorage, $route, $mdDialog, dashboard) {
    
    $scope.dashboards = dashboard.getAll();
    $scope.dashboardSettings = dashboard.settings();

    $scope.activeGrid = false;
    $scope.refresh_interval = $scope.dashboardSettings.interval;
    
    // To store interval ID
    var refresh = undefined;
    $scope.refresh_enabled = angular.isDefined(refresh);

    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.addItem = function() {
        $scope.$broadcast('addItem');
    }

    $scope.enableGrid = function() {
        console.log('Enable grid')
        $scope.$broadcast('enableGrid');
        $scope.activeGrid = !$scope.activeGrid;
    }
    $scope.$on('requestRedraw', function(e) {
        e.stopPropagation();
        $timeout(function() {
            console.log("request accepted");
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });

    $scope.clearCache = function() {
        $log.debug("deleting timestamp")
        delete $localStorage['timestamp'];
        $route.reload();
    }

    $scope.setInterval = function() {
        if (angular.isDefined(refresh)) {
            $interval.cancel(refresh);
            refresh = undefined;
            console.log('broadcast failed')
        } else {
            refresh = $interval(function() {
                //$scope.clearCache();
                console.log('broadcast')
                $scope.$broadcast('refreshData');
            }, $scope.refresh_interval*1000);
        }

        $scope.refresh_enabled = angular.isDefined(refresh)

    }

    

    $scope.selectedDashboard = dashboard.selectedDashboard;

    $scope.editDashboard = function(ev, index) {
        // Make a backup copy of current dashboards
        $scope.backupDashboards = angular.copy($scope.dashboards);

        $mdDialog.show({
            controller: "editDashboardController",
            templateUrl: 'partials/addDashboard.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true,
        })
        .then(function() {
            dashboard.save();
            $scope.refresh_interval = $scope.dashboardSettings.interval;
        }, function() {
            $scope.dashboards = $scope.backupDashboards;
            console.log($scope.backupDashboards);
            $scope.backupDashboards = {};
            console.log($scope.dashboards)
            console.log("reverting");
        });
    }


    $scope.$on('addDashboard', function(ev) {
        console.log("Adding new dashboard");

        $mdDialog.show({
            controller: 'addDashboardController',
            templateUrl: 'partials/addDashboard.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: true,
        })
        .then(function(answer) {
            var newIndex = dashboard.add(answer);
            console.log(newIndex)
            dashboard.save();
            $scope.$broadcast('switchDashboard', newIndex);
            /*dashboard.switch(newIndex);
            $scope.selectedDashboard = newIndex;
            $scope.$broadcast('reloadDashboard'); */
        }, function() { // cancel
        });
        
    });

    $scope.$on('switchDashboard', function(ev, index) {
        delete $localStorage['timestamp'];
        dashboard.switch(index)
        $scope.selectedDashboard = dashboard.active(index);
        console.log()
        $scope.$broadcast('reloadDashboard');
    });
    


});

app.controller('box', function($scope, $log, $mdDialog, PROTOCOLS, TYPES, CATEGORIES, PIECHART, AREA, api, user, $mdMedia, $localStorage, $timeout, dashboard){
    
    function timeShift(offset) {
        //console.log(offset)
        offset = angular.isDefined(offset) ? offset : 0;
        $scope.box.config.begintime = (function() {

            var now = new Date();
            
            var shift_time = (Number(offset) + Number($scope.box.config.period))*60*60*1000;
            var shifted = now.getTime() - shift_time;
            return Math.floor(shifted/1000);
        })();

        $scope.box.config.endtime = (function() {
            var now = new Date();

            now.setTime(now.getTime() - Number(offset)*60*60*1000);
            return Math.floor(now/1000);
        })();
    }

    timeShift($scope.dashboard.settings.timeshift);

    $scope.box.loading = true;
        
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

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
        $scope.user();
        if ($scope.box.type == 'piechart') {
            $scope.box.options = PIECHART.options;
            
        }
        if ($scope.box.type == 'barchart')
            $scope.box.options = AREA.options;
        

        $scope.backupModel = {};

        $scope.box.config.type = $scope.box.type;
        
        // Disable edit mode
        $scope.editMode = false;

        
        // Shift time for query
        timeShift($scope.dashboard.settings.timeshift);

        // Get required data
        if ($scope.box.type == 'piechart' || $scope.box.type == 'barchart') {
            api.get('agg', $scope.box.config, true).success(function(data) {
                $scope.box.loading = false;    
                $scope.box.data = data;
            })
        } else if ($scope.box.type == 'top') {
            api.get('top', $scope.box.config, true).success(function(data) {
                $scope.box.loading = false;    
                $scope.box.data = data;
            })
        } else if ($scope.box.type == 'sum') {
            api.get('count', $scope.box.config).success(function(data) {
                $scope.box.loading = false;
                $scope.box.data = data;
            })
        }
    }
    $scope.changeSelector = function(sel) {
        angular.forEach($scope.box.data, function(value, key) {
            angular.forEach(value.values, function(val, k) {
                val['selector'] = sel;
            })
        })
        $scope.$emit('requestRedraw')

    }

    $scope.changeSelector($scope.box.selector);

    

    // Revert to original and disable edit mode
    $scope.cancel = function(box) {
        $scope.box = angular.copy($scope.backupModel);
        $scope.backupModel = {};
    }
    
    $scope.top = function() {
        timeShift($scope.box.settings.timeshift)
        api.get('top', $scope.box.config, true).success(function(data) {
            console.log(data);
            $scope.box.data = data;
        })
    }

    var cache_time = (new Date() - new Date($localStorage['timestamp']))/1000;
    if (isNaN(cache_time))
        cache_time = 300 + 10;

    

    
    // Show loading indicator
    if (cache_time < 300) {
        $scope.box.loading = false;
        //console.log("data is cached")
    }
    else {
        $scope.box.loading = true;
        //console.log('Data is not cached, redraw')
        
    }

    $scope.$on('gridster-item-initialized', function(item) {
        if ($scope.box.type == 'piechart' || $scope.box.type == 'barchart') {
            $timeout(function() { $scope.$emit('requestRedraw');}, 500);
        }
    })

    function getData() {
        if ($scope.box.type == "piechart" || $scope.box.type == "barchart") {
            // The box is a chart
            if ($scope.box.type == 'piechart') {
                $scope.box.options = PIECHART.options;
            }
            if ($scope.box.type == 'barchart')
                $scope.box.options = angular.copy(AREA.options);
           
            $scope.box.config.type = $scope.box.type;

            if (cache_time > 300) {
                api.get('agg', $scope.box.config, false, true).success(function(data) {
                    $scope.box.loading = false;
                    $scope.box.data = data;
                    $scope.$emit('requestRedraw');
                });
            }
        } else if ($scope.box.type == 'top' && cache_time > 300) {
            api.get('top', $scope.box.config, false, true).success(function(data) {
                $scope.box.loading = false;
                $scope.box.data = data;
            })
        } else if ($scope.box.type == 'sum' && cache_time > 300) {
            api.get('count', $scope.box.config, false, true).success(function(data) {
                $scope.box.loading = false;
                $scope.box.data = data;
            })
        }
    };

    getData();


    $scope.$on('refreshData', function() { 
        //console.log('refreshing'); 
        cache_time = 300+10; 
        getData();
    })
 
    $scope.user = function() {
       dashboard.save(); 
    }

    $scope.$on('saveUser', function() {
        $scope.user()
    });

    $scope.$on('gridster-item-resized', function(gridster) {
        $timeout(function() {
          console.log("request accepted");
          window.dispatchEvent(new Event('resize'));
        }, 100);
    })


    $scope.showEdit = function(ev, box) {
        $scope.backupModel = angular.copy($scope.box);

        $mdDialog.show({
            controller: 'editBoxController',
            templateUrl: 'partials/edit.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: true,
            locals: {
                box: $scope.box
            },
        })
        .then(function(answer) {
            $scope.save();
        }, function() { // cancel
            $scope.box = angular.copy($scope.backupModel);
            $scope.backupModel = {};
        });
        
  };

  
});

app.controller('grid', function($scope, $timeout, $log, $route, user, dashboard) {
    $scope.opt = {
        outerMargin: false,
        columns: 8,
        pushing: true,
        rowHeight: 170,
        colWidth : 'auto',
        floating: true,
        swapping: true,
        mobileBreakPoint: 933,
        draggable: {
            enabled: false,
        },
        resizable: {
            enabled: false,
            handles: ['n', 'e', 's', 'w', 'se', 'sw'],
            stop: function(event, $element, widget) {
                //console.log("resize end");
                $scope.$emit('requestRedraw');
            }
        }
    }

    $scope.dashboard = dashboard.get();
    $scope.items = $scope.dashboard.items;
    //console.log($scope.items);

    $scope.$on('enableGrid', function() {
        if ($scope.opt.resizable.enabled == true) {
            $scope.$broadcast('saveUser');
        }
        
        $scope.opt.resizable.enabled = !$scope.opt.resizable.enabled; 
        $scope.opt.draggable.enabled = !$scope.opt.draggable.enabled; 
    })

    $scope.remove = function(box) {
        var tmp = $scope.items.splice($scope.items.indexOf(box), 1);
        $scope.$broadcast('saveUser');
    };

    $scope.$on('addItem', function() {
        var item = {
            "title" : "New box",
            "loading" : false,
            sizeX: 1,
            sizeY: 1,
            content: "",
            config : {
                period : 0
            }
            //row : row,
            //col : col
        }

        $scope.items.push(item)
    });

    

    $scope.$on('reloadDashboard', function() {
        $scope.dashboard = dashboard.get();
        $scope.items = $scope.dashboard.items;
        console.log($scope.dashboard);
        $scope.$emit('requestRedraw')
    })




})


app.controller('editBoxController', function($scope, $mdDialog, box, PROTOCOLS, TYPES, CATEGORIES) {
    
    $scope.box = box;
    
    $scope.backupModel = angular.copy(box);

    $scope.categories = CATEGORIES;
    $scope.protocols = PROTOCOLS;
    $scope.types = TYPES;

    $scope.saveAndClose = function() {
        $mdDialog.hide();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };


    $scope.cancel = function(box) {
        console.log("Cancelling");
        $mdDialog.cancel();
    }

    $scope.changeSelector = function(sel) {
        angular.forEach($scope.box.data, function(value, key) {
            angular.forEach(value.values, function(val, k) {
                val['selector'] = sel;
            })
        })
        $scope.$emit('requestRedraw')

    }


});

app.controller('addDashboardController', function($scope, $mdDialog) {
    
    $scope.editDashboard = false;
    
    $scope.saveAndClose = function(answer) {
        $mdDialog.hide(answer);
    };


    $scope.cancel = function(box) {
        console.log("Cancelling");
        $mdDialog.cancel();
    }

});


app.controller('editDashboardController', function($scope, $mdDialog, dashboard) {
    
    // Load dashboard settings
    $scope.db = dashboard.settings();

    // Varible to differentiate between editing and adding a dashboard
    // We are using the same partial to display within dialog
    $scope.editDashboard = true;

 
    $scope.saveAndClose = function(answer) {
        dashboard.update(answer);
        $mdDialog.hide();
    };

    $scope.deleteDashboard = function() {
        dashboard.delete();
        $scope.$broadcast('switchDashboard', 0);
        dashboard.active(0);
        $mdDialog.hide();
    }


    $scope.cancel = function(box) {
        console.log("Cancelling");
        $mdDialog.cancel();
    }

});
