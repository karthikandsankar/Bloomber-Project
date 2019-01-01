var obj;
window.onload = function() {
	if(sessionStorage.getItem('obj')=="\"undefined\""||sessionStorage.getItem('obj')==null){
    $("#errorMessage").slideDown();
	}else{
    obj=JSON.parse(sessionStorage.getItem('obj'));
    $("#graphs").slideDown();

    var trace1 = {
      x: ['giraffes', 'orangutans', 'monkeys'],
      y: [20, 14, 23],
      name: 'SF Zoo',
      type: 'bar'
    };

    var trace2 = {
      x: ['giraffes', 'orangutans', 'monkeys'],
      y: [12, 18, 29],
      name: 'LA Zoo',
      type: 'bar'
    };

    var data = [trace1, trace2];

    var layout = {barmode: 'group'};

    var options = {

    	scrollZoom: true, // lets us scroll to zoom in and out - works
    	showLink: false, // removes the link to edit on plotly - works
    	modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan', 'pan2d', 'autoScale2d'],
    	//modeBarButtonsToAdd: ['lasso2d'],
    	displayLogo: false, // this one also seems to not work
    	displayModeBar: true, //this one does work
    };

    Plotly.newPlot('barGraph', data, layout, options);




  }
}
