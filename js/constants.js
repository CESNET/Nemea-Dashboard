app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.constant('CATEGORIES', [ "any", "Recon.Scanning", "Attempt.Login", "Availability.DoS" ]);
app.constant('PROTOCOLS', [ "tcp", "dns", "udp" ]);
app.constant('TYPES', ["barchart", "piechart", "top", "sum"])

app.constant('PIECHART', { 
    options: {
        chart: {
            type: 'pieChart',
            height: 450,
            x: function(d){return d.key[0];},
            y: function(d){return d.x;},
            showLabels: true,
            donut : true,
            padAngle : 0.00,
            cornerRadius : 1,
            transitionDuration: 500,
            labelThreshold: 0,
            //color: ["#0ec4f4", "#631FF6", "#FFDC06", "#FF8406", "#b56969", "#e6cf8b"],
            legend: {
                margin: {
                    top: 5,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            },
            tooltipContent : function(key, x, y, e, graph) {
                                console.log(key);
                                console.log(y);
                                console.log(e);
                                console.log(graph);
                                return 'Olalala!';
                             },
            pie : {
                dispatch: {
                    //chartClick: function(e) {console.log(e)},
                    elementClick: function(e) {
                        var date = new Date();
                        console.log(e)
                        date.setTime(date.getTime() - 1000*60*60*24);
                        date.setHours(0);
                        date.setMinutes(0)
                        window.location = '#/events?filter&date=' + date.toISOString() + '&from=' + new Date().getHours() + ':' + new Date().getMinutes() + '&category=' + e.data.key[0]},
                    //elementDblClick: function(e) {console.log("element double click")},
                    //elementMouseover: function(e) {console.log("element mouseover")},
                    //elementMouseout: function(e) {console.log("element mouse out")}            
                },
                labelType : "percent",
                labelsOutside : true,
                //startAngle : function(d) { return d.startAngle/2 -Math.PI/2 },
                //endAngle : function(d) { return d.endAngle/2 -Math.PI/2 }
            }
        }
    }
});


app.constant('AREA', {
    options : {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 30,
                right: 20,
                bottom: 100,
                left: 50
            },
            x: function(d) { return d.x },
            y: function(d) { 
                if (d.selector)
                    return Number(d.FlowCount);
                else
                    return Number(d.Count);
            },
            useVoronoi: false,
            clipEdge: true,
            duration: 100,
            useInteractiveGuideline: false,
            tooltipContent : function(key, x, y, e, graph) {return("Ha");},
            xAxis: {
                showMaxMin: false,
                tickFormat: function(d) {
                    return d3.time.format('%m/%d %H:%M')(new Date(d))
                },
                rotateLabels : -45,
            },
            yAxis: {
                showMaxMin: false,
                tickFormat: function(d){
                    return d3.format('s')(d);
                },
            },  
            multibar: {
                dispatch : {
                    elementClick: function(e) {
                        var date = new Date(e.data.x);
                        console.log(e)
                        var hours = date.getHours();
                        var minutes = date.getMinutes();
                        date.setHours(0);
                        date.setMinutes(0);
                        window.location = '#/events?filter&date=' + date.toISOString() + '&from=' + ("0" + hours).slice(-2) + ':' + ("0" + minutes).slice(-2) + '&category=' + e.data.key;
                    },
                }
            }
        }
    }
});



app.constant("MENU", [
	{
		"title" : "Dashboard",
        "link" : "#/"
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
		"link" 	: "#/events"
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
				"title" : "My profile",
				"link"	: "#/profile"
			},
			{
				"title" : "Users",
				"link" 	: "/settings"
			},
		]
	}
]);
