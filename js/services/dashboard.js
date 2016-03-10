app.service('dashboard', function($log, $localStorage, user) {

    var selectedDashboard = 0;
    var dashboards = $localStorage['dashboard'];
    var active = dashboards[selectedDashboard];
    var backup;

    this.getAll = function() {
        return dashboards;
    }

    this.get = function() {
        return dashboards[selectedDashboard];
    }

    this.settings = function() {
        return dashboards[selectedDashboard].settings;
    }

    this.active = function(index) {
        if (angular.isDefined(index)) {
            selectedDashboard = index
        }

        return selectedDashboard;
    }

    this.update = function(updatedDashboard) {
        active.settings = updatedDashboard;
    }

    this.save = function() {
        var settings = angular.copy(dashboards);
        //console.log(settings)
        
        // Remove data and graph options
        for (var i = 0; i < settings.length; i++) {
            //console.log(settings[i]);
            //console.log(settings[i].items.length)
            for (var j = 0; j < settings[i].items.length; j++) {
                delete settings[i].items[j]["data"];
                delete settings[i].items[j]["options"];
            }
        }

        var query = {
            "settings" : settings
        }

        //console.log(query)

        //$log.info(query)
        return user.put(query)
            .success(function(data) {
                //console.log(data);
            })
            .error(function(data){
                $log.error(data)
            })
    }

    this.add = function(newDashboard) {
        // We need to set up first item in dashboard 
        var tmpDashboard = {
            settings : newDashboard,
            items : [{
                "title" : "New box",
                "loading" : false,
                sizeX: 1,
                sizeY: 1,
                content: "Click the menu icon to select edit",
                config : {
                    period : "0"
                }

            }]
        }

        dashboards.push(tmpDashboard);
        console.log(dashboards.length - 1);

        return (dashboards.length - 1);

    }

    this.delete = function() {
        backup = dashboards.splice(dashboards.indexOf(active), 1);
        selectedDashboard = 0;

        return backup;
    
    }

    this.switch = function(index) {
        active = dashboards[index];
        selectedDashboard = index;
        return active;
    }
        
});
