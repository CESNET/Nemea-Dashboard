var val = 100;
function load(which) {
//	val = $("#mysel").val();
	console.log(val);
	
	d3.select("#chart svg").selectAll("*").remove();
	if (which) {
		loadAreaChart();
	}
	else
		loadBarChart();
};

load(false);

function loadAreaChart() { 
	d3.json('testfile_' + val + '.json', function(data) {
	console.log(data);
	nv.addGraph(function() {
    var chart = nv.models.stackedAreaChart()
                 .margin({right: 100})
                  .x(function(d) { return d[0] })   //We can modify the data accessor functions...
                  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
                  .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
                  .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
                //  .transitionDuration(500)
                  .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                  .clipEdge(true);
    //Format x-axis labels with custom function.
    chart.xAxis.tickFormat(d3.format(',.2f'));

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('#chart svg')
      .datum(data)
	  //.transition().duration(500)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
});
}



function loadBarChart() {
	d3.json('../json/testfile_' + val + '.json', function(data) {
			console.log(data);
	  nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
					 .margin({right: 0, top: 0, left: 0})
					  .x(function(d) { return d[0] })   //We can modify the data accessor functions...
					  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
					  //.useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
					  .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
					//  .transitionDuration(500)
					  .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
					  .clipEdge(true);
		//Format x-axis labels with custom function.
		chart.xAxis.tickFormat(d3.format(',.2f'));
		   /* .tickFormat(function(d) { 
			  return d3.time.format('%x')(new Date(d)) 
		});*/

		chart.yAxis
			.tickFormat(d3.format(',.2f'));

		d3.select('#chart svg')
		  .datum(data)
		  //.transition().duration(500)
		  .call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	  });
	});
}


