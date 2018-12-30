var obj;

function initPlainTextInput(){
 var text = document.getElementById("jsonInput").innerText

	if(text==null||text==""){
		displayError("There is no JSON inputed");
	}else{
		try {
			obj = JSON.parse(text);
			objChanged(obj);
		}catch(err) {
			displayError(err.message);
		}
	}
}

function displayError(message){
	document.getElementById("jsonInputMessage").innerHTML = message;
	document.getElementById("jsonInputMessage").style.display="block";
}


var containingDiv = document.getElementById("containingDiv");

function showData(){
	firebase.database().ref().once("value",function(snap){
		console.log(snap.val());
	});
}

var output = document.createElement("p");

document.body.appendChild(output);

var parsedData;

function clearDiv(div){
	div.innerHTML="";
}

function scan(funcData, path, div){
	for(prop in funcData){
		var count = path.length;
		var tempObj = document.createElement("div");
		if(linear)
			tempObj.style.whiteSpace = "nowrap";
		var newHTML="";
		newHTML="<strong>"+prop.replace(/</g, "&lt;").replace(/>/g, "&gt;")
		if(icons)
			newHTML+="<span onclick='editObj(this)' title='Edit'> ✎</span><span onclick='deleteObj(this)' title='Delete'> 🗑️</span>"
		newHTML+="</strong>";
		tempObj.innerHTML=newHTML;
		tempObj.style.borderRadius = "5px";
		tempObj.style.margin="5px";
		//tempObj.style.minWidth="5vw";
		tempObj.style.display = "inline-block";
		tempObj.classList.add("align-top");
		var shadeOfBlack = 255 - (count+1)*30%256;
		tempObj.style.backgroundColor = "rgb("+shadeOfBlack+", "+shadeOfBlack+", "+shadeOfBlack+")";
		if(shadeOfBlack<100){
			tempObj.style.color = "white";
		}else{
			tempObj.style.color = "black";
		}
		if(count!=0){
			tempObj.style.marginLeft="5vw"
		}
		//tempObj.style.marginRight="0px"

		var temparr = path.slice(0);
		temparr.push(prop);

		for(var i =0; i!=temparr.length; i++){
			tempObj.dataset["path-"+i] = temparr[i];
		}

		if(funcData[prop] !== null && typeof funcData[prop] === 'object'){
			scan(funcData[prop],temparr,tempObj);
		}else{
			tempObj.style.color = "black";
			var val
			if(typeof funcData[prop] === 'string'){
				val = "\""+funcData[prop].replace(/</g,"&lt;")+"\"";
				tempObj.style.backgroundColor="rgba(12, 176, 168, 0.75)";
			}else{
				if(typeof funcData[prop] === 'boolean'){
					if(funcData[prop])
						tempObj.style.backgroundColor="rgba(47, 233, 26, 0.75)";
					else
						tempObj.style.backgroundColor="rgba(255, 56, 56, 0.75)";
				}else if(typeof funcData[prop] === 'number'){
					tempObj.style.backgroundColor="rgba(220, 133, 19, 0.75)";
				}else{
					tempObj.style.backgroundColor="rgba(5, 35, 183, 0.75)";
				}
				val = funcData[prop];
			}
			tempObj.innerHTML+=": "+ val;
		}
		//tempObj.style.wordWrap = "break-word";
		if(linear)
			div.appendChild(document.createElement("br"));
		div.appendChild(tempObj);
	}
}

var tab = document.createElement("pre")
tab.innerHTML = "&#09;";
tab.style.display = "inline";

function textScan(funcData,div,count){
	if(funcData[prop] !== null && typeof funcData[prop] === 'object'){
		div.innerText+="{"
	}
	count++;
	console.log(count);
	for(prop in funcData){
		var tempObj = document.createElement("div");
		tempObj.style.display = "inline";

		tempObj.innerText = "'"+prop+"'";
		if(typeof funcData[prop] !== 'object'){
			var val;
			if(typeof funcData[prop] === 'string')
				val = "\""+funcData[prop].replace(/</g,"&lt;")+"\"";
			else
				val = funcData[prop];
			tempObj.innerText+=": "+ val;
		}else{
			tempObj.innerText+=": {"
		}

		div.appendChild(document.createElement("br"));

		for(var i = 0;i!=count;i++){
			div.appendChild(tab.cloneNode(true));
		}

		div.appendChild(tempObj);

		if(funcData[prop] !== null && typeof funcData[prop] === 'object'){
			console.log(count);
			textScan(funcData[prop],div,count);

			div.appendChild(document.createElement("br"));
			for(var i = 0;i!=count;i++){
				div.appendChild(tab.cloneNode(true));
			}
			var bracket = document.createElement("div");
			bracket.innerText = "}";
			bracket.style.display = "inline";
			div.appendChild(bracket.cloneNode(true));
		}
	}
	if(funcData[prop] !== null && typeof funcData[prop] === 'object'){
		div.innerText+="}"
	}
}

function editObj(elem){
	var parentElem = elem.parentNode.parentNode;
	console.log(elem);
	console.log(parentElem.firstChild.firstChild);
	console.log(parentElem.childNodes[1]);
	console.log(parentElem.childNodes[1].contentEditable);

	var i = 0;
	var props = [];
	while(parentElem.hasAttribute("data-path-"+i)){
		props.push(parentElem.dataset["path-"+i]);
		i++;
	}

	if(parentElem.childNodes[1].contentEditable!="true"){
		console.log(parentElem.childNodes);
		var parentName = parentElem.firstChild.firstChild.textContent;
		console.log(parentElem.firstChild.firstChild.textContent);
	  while (parentElem.childNodes.length > 1) {
			console.log(parentElem.lastChild);
	    parentElem.removeChild(parentElem.lastChild);
		}
		var editJSONbox = document.createElement("DIV")

		editJSONbox.contentEditable = "true";
		editJSONbox.style.border ="2px solid rgba(0,0,0,.25)"
		console.log(props);
		var val=obj;
		for(var prop of props){
			val = val[prop]
		}
		var txt = JSON.stringify(val, null, "\t");
		for (var x = 0; x < txt.length; x++)
		{
	    var c = txt.charAt(x);
			if(c=="\t"){
				editJSONbox.innerText+=txt.substring(0,x);
				txt=txt.substring(x,txt.length)
				 x = 0
				editJSONbox.innerHTML+="&emsp;";
			}
		}
		editJSONbox.innerText+=txt;
		console.log(editJSONbox);
		parentElem.appendChild(editJSONbox);

		var cancelBtn = document.createElement("span")
		//cancelBtn.onClick = cancelEditObj(this);
		//cancelBtn.innerText = "🗙"
		var headerBar = elem.parentNode;
		headerBar.insertBefore(cancelBtn,headerBar.childNodes[2])
		cancelBtn.outerHTML = "<span onclick='cancelEditObj(this)' title='Cancel'> 🗙 </span>"

		headerBar.childNodes[1].innerText=" 💾"
		headerBar.childNodes[1].title="Save"
		console.log(headerBar);
	}else{
		console.log(parentElem.childNodes[1].innerText);
		var newObj=JSON.parse((parentElem.childNodes[1].innerText).replace(/\s/g, ''));
		EditWithPath(obj,props,newObj);
		objChanged(obj);
	}

	//
	//objChanged(obj);
}

function cancelEditObj(elem){
	objChanged(obj);
	/*console.log(elem);
	var i = 0;
	var props = [];
	while(elem.parentNode.parentNode.hasAttribute("data-path-"+i)){
		props.push(elem.parentNode.parentNode.dataset["path-"+i]);
		i++;
	}

	var val=obj;
	for(var prop of props){
		val = val[prop]
	}

	clearDiv(elem.parentNode.parentNode);
	scan(val,[],elem.parentNode.parentNode);*/
}

function deleteObj(elem){
	console.log(elem.parentNode.parentNode);
	var i = 0;
	tempObj = obj;
	var props = [];
	while(elem.parentNode.parentNode.hasAttribute("data-path-"+i)){
		props.push(elem.parentNode.parentNode.dataset["path-"+i]);
		i++;
	}
	console.log(props);
	DeleteWithPath(obj,props);
	objChanged(obj);
}

function DeleteWithPath (newobj, path) {
	console.log(newobj);
	console.log(path);
  for (var i = 0; i < path.length - 1; i++) {
			console.log(path[i]+"test");
    newobj = newobj[path[i]];
  }
  delete newobj[path.pop()];
}

function EditWithPath (newobj, path,newVal) {
	console.log(newobj);
	console.log(path);
  for (var i = 0; i < path.length - 1; i++) {
			console.log(path[i]+"test");
    newobj = newobj[path[i]];
  }
  newobj[path.pop()] = newVal;
}

var linear = false;
var icons = true;
function settingChanged(){
	if(document.getElementById("displayStyle").value=="Compact")
		linear = false;
	else
		linear = true;
	if(document.getElementById("iconsDisplay").value=="Show")
		icons = true;
	else
		icons = false;
	if(document.getElementById("Input Field").checked){
		icons = true;
		$( "#jsonInputPanel" ).slideDown()
	}else if(document.getElementById("JSON file").checked){
		$( "#jsonInputPanel" ).slideUp()
		icons = true;
	}else{
		$( "#jsonInputPanel" ).slideUp()
		icons = false;
	}
		objChanged(obj);
}

function objChanged(NewObj){
	clearDiv(containingDiv);
	scan(NewObj,[],containingDiv);
}

var request = new XMLHttpRequest();
request.open("GET", "SBHSData.json", false);
request.send()
var my_JSON_object = JSON.parse(request.responseText);
alert (my_JSON_object);

var request = new XMLHttpRequest();
request.open("GET", "SBHSData.json", false);
request.onreadystatechange = function() {
  if ( request.readyState === 4 && request.status === 200 ) {
    var my_JSON_object = JSON.parse(request.responseText);
    console.log(my_JSON_object);
  }
}
request.send(null);
