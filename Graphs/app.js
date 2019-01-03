var totalArrays={};
var obj;

var options = {

  scrollZoom: true, // lets us scroll to zoom in and out - works
  showLink: false, // removes the link to edit on plotly - works
  modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan', 'pan2d', 'autoScale2d',],
  //modeBarButtonsToAdd: ['lasso2d'],
  displayLogo: false, // this one also seems to not work
  displayModeBar: true, //this one does work
};


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
        totalArrays[category]["average"]="Can't be parsed as a number"
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
      checkUpdated();



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

         //Create Checkbox
         var input = document.createElement("INPUT")
         input.value = "ignore";
         input.name = property
         input.type = "checkbox"
         input.onclick = checkUpdated;
         if(occurrences/Object.keys(obj).length>=.9)
            input.checked = true;
          else
            input.checked = false;
         var cell = document.createElement("td")
         cell.appendChild(input)
         row.appendChild(cell);

         var newInput = input.cloneNode();
         newInput.value = "dependent"

         if(occurrences/Object.keys(obj).length>=.1&&occurrences/Object.keys(obj).length<.9)
            newInput.checked = true;
          else
            newInput.checked = false;

         var cell = document.createElement("td")
         cell.appendChild(newInput)
         row.appendChild(cell);

         tabBody.appendChild(row);
}
function createCell(txt){
  var cell = document.createElement("td");
  var textnode=document.createTextNode(txt);
  cell.appendChild(textnode);
  return cell;
}

function checkUpdated(){

  for(var category in totalArrays){
    var newVal;
    for(var elem of document.getElementsByName(category)){
      if(elem.checked && totalArrays[category]["rel"] != elem.value){
        newVal = elem.value;
      }
    }
      console.log(newVal)
      if(totalArrays[category]["rel"]==null)
        totalArrays[category]["rel"] = "independent";
    if(newVal){
      totalArrays[category]["rel"] = newVal;
      for(var elem of document.getElementsByName(category)){
        if(totalArrays[category]["rel"] != elem.value){
          elem.checked = false;
        }
      }
    }
  }

  generateGraphs()
}

function generateGraphs(){
document.getElementById("graphsOut").innerHTML ="";
  for(var category in totalArrays){
    if(totalArrays[category]["rel"]=="dependent"){


        for(var secondcategory in totalArrays){
          if(totalArrays[secondcategory]["rel"]=="independent"){
            var lists = {}
            for(var sub in obj){
              if(!lists[ obj[sub][secondcategory] ])
                lists[ obj[sub][secondcategory] ]=[]
              lists[ obj[sub][secondcategory] ].push(obj[sub][category]);
            }
            var data=[];
            for(var list in lists){
                data.push({
                    y: lists[list],
                    type: 'box',
                    name: list,
                });
            }

            var div = document.createElement("DIV");
            var name = category + "vs" + secondcategory;
            console.log(name);
            (document.getElementById("graphsOut")).appendChild(div);
            div.id = name

            setTimeout(Plotly.newPlot,100,name, data, {}, options);

          }
        }


    }
  }

  setTimeout(cleanLogo,100);
}

function cleanLogo(){
  for(var elem of document.querySelectorAll("[href='https://plot.ly/']")){
    elem.style.display = "none";
  }
}
