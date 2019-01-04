var obj;
var childNums = [];
var totalArrays={};
var fuse;
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
  	childNums =[];
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

    var options = {
      shouldSort: true,
      tokenize: true,
      includeScore: true,
      includeMatches: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: childNums
    };
    fuse = new Fuse(obj, options); // "list" is the item array

    for(var cat of childNums){
        var th = document.createElement("th");
        th.scope = "col"
        var textnode=document.createTextNode(cat.charAt(0).toUpperCase() + cat.slice(1));
        th.appendChild(textnode);
        document.getElementById("headRow").appendChild(th)
    }

  }
}

document.getElementById("search").addEventListener("input",function(){
  var query = document.getElementById("search").value
  if(query!=""){
    var tabBody=document.getElementById("propsTable");
    tabBody.innerHTML = ""
    var result = fuse.search(query);
    console.log(result);
    for(var item of result){

      var row=document.createElement("tr");

      if(item.score <.1){
        for(var cat of childNums){
          var found = false;
          for(var prop in item.item){
            if(prop == cat){
              var color = null;
              for(var match of item.matches){
                if(match.key == cat){
                  color="#d8d8d8";
                }
              }
              found=true;
              row.appendChild(createCell(item.item[prop],color));
              break;

            }
          }
          if(!found)
            row.appendChild(createCell("",null));
        }
        tabBody.appendChild(row);
      }else{
        break;
      }

    }
  }

});



function createCell(txt,color){
  var cell = document.createElement("td");
  if(color!=null)
    cell.style.backgroundColor = color;
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
