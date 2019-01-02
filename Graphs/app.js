var obj;
window.onload = function() {
	if(sessionStorage.getItem('obj')=="\"undefined\""||sessionStorage.getItem('obj')==null){
    $("#errorMessage").slideDown();
	}else{
    obj=JSON.parse(sessionStorage.getItem('obj'));
    $("#graphs").slideDown();

    var counts={}
  		for(var prop in obj) {
  			for(var subProp in obj[prop]) {
  				if(!counts[subProp])
  					counts[subProp]=0;
  				counts[subProp]++;
  			}
  		}
  		var childNums =[];
  		for(var num in counts) {
  			if(counts[num]/Object.keys(obj).length>=.99)
  				childNums.push(num);
  		}


      var totalArrays={};
      for(var category of childNums){
        for(var index in obj){
          if(totalArrays[category]==null)
            totalArrays[category]={"vals":[]}
          if(!totalArrays[category]["vals"].includes(obj[index][category]))
            totalArrays[category]["vals"].push(obj[index][category]);
        }
      }
      for(var category in totalArrays){
        for(var prop in totalArrays[category]["vals"]){
          if(typeof totalArrays[category]["vals"][prop] != totalArrays[category]["type"]){
            if(totalArrays[category]["type"]==null)
              totalArrays[category]["type"]= typeof totalArrays[category]["vals"][prop];
            else if(typeof totalArrays[category]["vals"][prop] !="undefined"){
              console.log("prop"+prop+"; cat"+category+";"+totalArrays[category]["vals"][prop]);
              totalArrays[category]["type"]="Multiple types present"
              break;
            }
          }
        }
      }
      for(var category in totalArrays){
        var total=0;
        var items = 0;
        var validItems = 0;
        totalArrays[category]["average"]="N/A"
        for(var prop in obj){
          items++
          if(Number(obj[prop][category])){
            total+=Number(obj[prop][category])
            validItems++
          }
        }
        console.log(validItems/Object.keys(obj).length);
        if(total!=NaN&&validItems/Object.keys(obj).length>=.90){
          totalArrays[category]["average"] = total/items
        }
      }
      console.log(totalArrays);
      for(var category in totalArrays){
        addRowToTable(category,totalArrays[category]["type"],totalArrays[category]["average"],Object.keys(totalArrays[category]["vals"]).length);
      }

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
    	modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan', 'pan2d', 'autoScale2d',],
    	//modeBarButtonsToAdd: ['lasso2d'],
    	displayLogo: false, // this one also seems to not work
    	displayModeBar: true, //this one does work
    };



    Plotly.newPlot('barGraph', data, layout, options);
    for(var elem of document.querySelectorAll("[href='https://plot.ly/']")){
      elem.style.display = "none";
    }



  }
}

function addRowToTable(property,type,average,occurrences)
{
         var tabBody=document.getElementById("propsTable");
         var row=document.createElement("tr");

         row.appendChild(createCell(property));
         row.appendChild(createCell(type));
         row.appendChild(createCell(average));
         row.appendChild(createCell(occurrences));

         tabBody.appendChild(row);
}
function createCell(txt){
  var cell = document.createElement("td");
  var textnode=document.createTextNode(txt);
  cell.appendChild(textnode);
  return cell;
}
