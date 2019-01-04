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
         newInput.onclick = checkUpdated;

         if(Number(average))
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
    var checked=false;
    for(var elem of document.getElementsByName(category)){
      if(elem.checked){
        checked = true;
        if(totalArrays[category]["rel"] != elem.value){
          newVal = elem.value;
        }
      }
    }
    console.log(newVal)
    if(!checked)
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
  console.log(totalArrays)
  generateGraphs()
}

function generateGraphs(){
  var scrollPos = window.pageYOffset
  var plotData=[]
  for(var category in totalArrays){
    if(totalArrays[category]["rel"]=="dependent"){


        for(var secondcategory in totalArrays){
          if(totalArrays[secondcategory]["rel"]=="independent"){
            var lists = {}
            for(var sub in obj){
              if(Number(obj[sub][category])){
                if(!lists[ obj[sub][secondcategory] ])
                  lists[ obj[sub][secondcategory] ]=[]
                lists[ obj[sub][secondcategory] ].push(Number(obj[sub][category]));
              }
            }

            var name = category.charAt(0).toUpperCase() + category.slice(1) + " vs " + secondcategory.charAt(0).toUpperCase() + secondcategory.slice(1);
            console.log(name);

            var data=[];
            var bar = true;
            if(document.getElementById(name+"-sel")==null){
              if(Object.keys(lists).length<15)
                bar = false;
            }else{
              if(document.getElementById(name+"-sel").value == "Box and Wiskers")
                bar = false;
            }
            if(!bar){
              for(var list in lists){
                  data.push({
                      y: lists[list],
                      type: 'box',
                      name: list,
                      jitter: 1,
                  });
              }
              for (var i = 0; i < data.length; i++) {
                let value = data[i]["y"]
                let compare = (data[i]["y"].reduce((previous, current) => current += previous) / data[i]["y"].length)
                for (var j = i - 1; j > -1 && (data[j]["y"].reduce((previous, current) => current += previous) / data[j]["y"].length) < compare; j--) {
                  console.log((data[j]["y"].reduce((previous, current) => current += previous) / data[j]["y"].length))
                  data[j + 1]["y"] = data[j]["y"]
                }
                data[j + 1]["y"] = value
              }
              console.log(data);
            }else{
              var x = [];
              var y = [];
              for(var list in lists){

                let avg = lists[list].reduce((previous, current) => current += previous) / lists[list].length;

                  x.push(list);
                  y.push(avg);
              }

              //InsertionSort
              for (var i = 0; i < y.length; i++) {
                let value = y[i]
                let value2 = x[i]
                for (var j = i - 1; j > -1 && y[j] < value; j--) {
                  y[j + 1] = y[j]
                  x[j + 1] = x[j]
                }
                y[j + 1] = value
                x[j + 1] = value2
              }

              data.push({
                  y: y,
                  x: x,
                  type: 'bar',
              });
              console.log(data);
            }

            plotData.push({name:name, data:data, lay:{  yaxis: {title: category.charAt(0).toUpperCase() + category.slice(1),},xaxis: {title: secondcategory.charAt(0).toUpperCase() + secondcategory.slice(1),}}, "options":options,bar:bar})



          }
        }


    }
  }
  document.getElementById("graphsOut").innerHTML ="";

  for(var data of plotData){
    createPlot(data.name, data.data, data.lay, data.options,data.bar);
  }
  setTimeout(window.scrollBy,200,0,scrollPos);

  setTimeout(cleanLogo,100);
}

function cleanLogo(){
  for(var elem of document.querySelectorAll("[href='https://plot.ly/']")){
    elem.style.display = "none";
  }
}

function createPlot(name, data, lay, options,bar){
  var header = document.createElement("DIV");
  header.classList.add("form-inline");
  header.classList.add("text-center");
  header.classList.add("d-flex");
  header.classList.add("justify-content-between");


  var title = document.createElement("h3");
  title.classList.add("text-center");
  title.classList.add("display-4");
  title.innerText = name
  title.style.marginRight = "15px"
  var newId = name+"-title";
  header.appendChild(title);
  console.log(title);
  title.id = newId

  var titleDiv = document.createElement("DIV");
  var str1 =""
  var str2 =""
  if(bar)
    str1 = "selected"
  else
    str2 = "selected"



  var HTMLval ='<div class="input-group mb-3 align-middle" style="margin:5px!important"><div class="input-group-prepend"><label class="input-group-text" for="displayStyle">Style</label></div><select id="'+name.replace(/</g, "&lt;").replace(/>/g, "&gt;")+'-sel" class="custom-select" onchange="generateGraphs()"><option '+str1+' value="Bar Graph">Bar Graph</option><option '+str2+' value="Box and Wiskers">Box & Wiskers</option></select></div>';
  titleDiv.classList.add("align-self-end");
  titleDiv.classList.add("d-flex");
  header.appendChild(titleDiv);

  titleDiv.innerHTML = HTMLval;

  (document.getElementById("graphsOut")).appendChild(header);

  var div = document.createElement("DIV");
  (document.getElementById("graphsOut")).appendChild(div);
  div.id = name

  console.log(div);
  setTimeout(Plotly.newPlot,100,name, data, lay, options);

}
