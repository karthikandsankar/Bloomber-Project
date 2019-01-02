var obj;

function initPlainTextInput(){
 var text = document.getElementById("jsonInput").innerText
	textToJSON(text)

}

function textToJSON(str){
	if(str==null||str==""){
		displayError("There is no JSON inputed");
	}else{
		try {
			obj = JSON.parse(str);
			objChanged(obj);
			objParse(obj);
			closedWarning();
			$( "#jsonInputPanel" ).slideUp();
			$( "#JSONuploadFileDiv" ).slideUp();
			displayError("");
		}catch(err) {
			displayError(err.message);
		}
	}
}

function displayError(message){
	document.getElementById("jsonInputMessage").innerText = message;
	document.getElementById("jsonInputMessage").style.display="block";
	if(message==""||message==null)
		document.getElementById("jsonInputMessage").style.display="none";
}

function displayFloatingError(message){
	document.getElementById("floatingError").innerText = message;
	$("#floatingError").slideDown().delay(1000).slideUp();
}

var warn = document.getElementById("warning")

function displayWarning(message){
	if(!document.getElementById("warning"))
		document.body.appendChild(warn)
	document.getElementById("warningText").innerHTML = message;
	document.getElementById("warning").style.display="block";
	if(message==""||message==null)
		document.getElementById("warning").style.display="none";
}

function closedWarning(){
	if(outliers[0]){
		document.querySelectorAll('[data-path-0="'+outliers[0]["name"]+'"]')[0].scrollIntoView( true );
		document.querySelectorAll('[data-path-0="'+outliers[0]["name"]+'"]')[0].style.backgroundColor = "red";
		if ((window.innerHeight + window.scrollY) < document.body.offsetHeight)
			window.scrollBy(0, -60);
		setTimeout(displayWarning, 100,outliers[0]["error"]);
		outliers.shift();
	}
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

var outliers = [];
function objParse(obj){
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
			if(counts[num]/Object.keys(obj).length>=.90)
				childNums.push(num);
		}
		var validItems = 0
		for(var num of childNums){
			for(var prop in obj){
				if(Number(obj[prop][num])){
					validItems++
				}
			}
			if(validItems/Object.keys(obj).length>=.90){
				for(var prop in obj){
					if(obj[prop][num]==""){
						obj[prop][num]="0";
					}
				}
			}
		}
		if(childNums!=[]){
			for(var prop in obj) {
					for(var num of childNums){
						if(obj[prop][num]=="")
							outliers.push({"name":prop,"error":"The property <strong>\""+num+"\"</strong> in item <strong>\""+prop+"\"</strong> has a blank string"});
					}


					if(Object.keys(obj[prop]).sort().join(',')!== childNums.sort().join(',')){
						var err = "It looks like item <strong>"+prop+"</strong> is missing the ";
						var errors=[]
						for(var num of childNums){
							if(!Object.keys(obj[prop]).includes(num))
								errors.push(num);
						}
						if(errors.length==1){
							err+="property <strong>\""+errors[0]+"\"</strong>"
						}else{
							err+=" properties: "
							for(var i=0; i!=errors.length;i++){
								if(i!=errors.length-1)
									err+="<strong>\""+errors[i]+"\"</strong>, "
								else
									err+="and <strong>\""+errors[i]+"\"</strong>"
							}
						}

					    outliers.push({"name":prop,"error":err});
					}else{

					}
			}
		}
		//document.querySelectorAll('[data-path-0="'++'"]');
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
		try{
			var newObj=JSON.parse((parentElem.childNodes[1].innerText).replace(/\s/g, ''));
			EditWithPath(obj,props,newObj);
			objChanged(obj);
		}catch(err){
			displayFloatingError(err);
		}
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

window.onload = function() {
	if(sessionStorage.getItem('obj')!="\"undefined\""&&sessionStorage.getItem('obj')!=null){
		obj = JSON.parse(sessionStorage.getItem('obj'));
		objChanged(obj);
	}else{
			document.getElementById("Input Field").checked = true
			document.getElementById("Input Field label").classList.add("active");
	}
	settingChanged();
}

var linear;
var icons;

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
		$( "#jsonInputPanel" ).slideDown()
		$( "#JSONuploadFileDiv" ).slideUp();
		document.getElementById("Input Field").checked = false;
	}else if(document.getElementById("JSON file").checked){
		$( "#jsonInputPanel" ).slideUp()
		$( "#JSONuploadFileDiv" ).slideDown();
		document.getElementById("JSON file").checked = false;
	}else if(document.getElementById("JSON file").checked){
		$( "#jsonInputPanel" ).slideUp()
		$( "#JSONuploadFileDiv" ).slideUp();
		document.getElementById("JSON in folder").checked = false;

		var request = new XMLHttpRequest();
		request.open("GET", "SBHSData.json", false);
		request.onreadystatechange = function() {
		  if ( request.readyState === 4 && request.status === 200 ) {
		    textToJSON(request.responseText);
		  }
		}
		request.send(null);
	}else{
		$( "#jsonInputPanel" ).slideUp()
		$( "#JSONuploadFileDiv" ).slideUp();
	}
		if(obj!=null){
		objChanged(obj);
		}
}

function objChanged(NewObj){
	if(NewObj)
		document.getElementById("downloadJSON").style.display = "block"
	else
		document.getElementById("downloadJSON").style.display = "none"
	sessionStorage.setItem('obj', JSON.stringify(NewObj))
	clearDiv(containingDiv);
	scan(NewObj,[],containingDiv);
}

function fileUploaded(){
	var file = document.getElementById("JSONuploadFile").files[0]
	if(file.type=="application/json"){
			$("#JSONuploadFileDiv").slideUp();
			fr = new FileReader();
			fr.onload = function(){
				textToJSON(fr.result);
			}
			fr.readAsText(file);
	}else{
		displayError("File is not the correct format");
	}
}

document.getElementById("jsonInput").addEventListener('paste', function(event) {
		if(document.getElementById("jsonInput").innerHTML == ""){
			// cancel paste
	    event.preventDefault();
	    // get text representation of clipboard
	    var text = event.clipboardData.getData('text/plain');
			//document.getElementById("jsonInput").innerHTML = text;
			textToJSON(text);
		}
});

function downloadJSON(){
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href",     dataStr     );
	dlAnchorElem.setAttribute("download", "server-data-JSON.json");
	dlAnchorElem.click();
}
