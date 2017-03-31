////////////////////////////// VARIABLES GLOBALES /////////////////////////////////////////////
var formElement=null;///////// variable para guardar "myform" ( del archivo index.html )
var nota = 0; /////////////// variable para la nota final
var tiempoExamen=120;//////// duración máxima del examen en segundos
var stopTiempo=false;//////// variable para detener la cuenta atrás del tiempo al pulsar para corregir 
////////////////////////////// variables globales para almacenar las respuestas de cada tipo de pregunta
var respuestaNum=[];////////// tipo num      
var respuestaTexto=[];//////// tipo texto
var respuestaSelect=[];/////// tipo select
var respuestasCheckbox = [];// tipo checkbox
var respuestasRadio= [];////// tipo radio
////////////////////////////// variables globales para almacenar la cantidad de preguntas de cada tipo
var radioNum=0////////// tipo radio
var checkNum=0;////////// tipo checkbox  
var textNum=0;////////// tipo texto   
var numNum=0;////////// tipo num
var selNum=0;////////// tipo select  
var correct=true;// variable de control para corregir e examen
var todasCont=false; // variable de control para controlar que todas las preguntas son contestadas.

var globalCount=0;// contador global para saber el numero de preguntas que tiene el examen.
var arrayAnswerMod=[];// array de booleanos para saber si cada pregunta se ha contestado o no.
var corregido=false; // variable para controlar la desactivacion del boton de corregir
var xmlDoc = null; //global, para modificarlo y serializarlo (y sacarlo por pantalla)
var xslDoc = null;
/////////Después de cargar la página (onload) se definen los eventos sobre los elementos entre otras acciones.

window.onload = function(){

  window.setInterval(function(){

}, 1000);



if (todasCont==false){

  document.getElementById("corregir").disabled=true;

} 

 /////////CORREGIR al apretar el botón
 
 formElement=document.getElementById("myform");
 formElement.onsubmit=function(){
   inicializar();
   corregirTodo();  
   return false;
}
 

 /////////////////LEER XML de xml/preguntas.xml

 var xhttp = new XMLHttpRequest();
 xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
   gestionarXml(this);
  }
 };
 xhttp.open("GET", "xml/preguntas.xml", true);
 xhttp.send();

 //LEER XSL de xml/questions.xml
 var xhttp2 = new XMLHttpRequest();
 xhttp2.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
   xslDoc=this.responseXML;
  }
 };
 xhttp2.open("GET", "xml/preguntas.xsl", true);
 xhttp2.send();
}


////////////////////////////// Funciones para gestion del cuestionario. Cargamos nuestro archivo .xml en xmlDOC y rellenamos el array "answers" con la información
////////////////////////////// de cada tipo de pregunta (Type, Title,...) mediante un for. Luego llamamos a "creadorHtml", se pone en marcha el contador
//////////////////////////////  de tiempo.
function gestionarXml(dadesXml){
 xmlDoc = dadesXml.responseXML; //Parse XML to xmlDoc
 xmlAnswers=xmlDoc.getElementsByTagName("title").length;
 answers=[];
 for(i=0;i<xmlAnswers;i++){
  answers[i]={};
  answers[i].type=xmlDoc.getElementsByTagName("type")[i].innerHTML;
  answers[i].title=xmlDoc.getElementsByTagName("title")[i].innerHTML;
  answers[i].text=xmlDoc.getElementsByTagName("text")[i].innerHTML;
  optionsLength=xmlDoc.getElementById("preg"+(i+1)).getElementsByTagName("option").length;
  answersLength=xmlDoc.getElementById("preg"+(i+1)).getElementsByTagName("answer").length;
  if(optionsLength>0){
    answers[i].options=[];
    for(j=0;j<optionsLength;j++){
      answers[i].options[j]=xmlDoc.getElementById("preg"+(i+1)).getElementsByTagName("option")[j].innerHTML;
    }
  }else{
    answers[i].options=null;
  }
    answers[i].answers=[];
  for(k=0;k<answersLength;k++){
    answers[i].answers[k]=xmlDoc.getElementById("preg"+(i+1)).getElementsByTagName("answer")[k].innerHTML;
  }

 }
 ////FINFOR
 ////////////////////////// Crear el html y el contador para el tiempo de examen 
 var now = new Date();
 var countDownDate=now.setSeconds(now.getSeconds() + tiempoExamen);
 creadorCountDown();
 creadorHtml(answers);
 createListenerOnAnswers();
 
/// Creamos la funcion que nos avisa cuando introducimos una respuesta

 function createListenerOnAnswers(){
  tam=document.querySelectorAll(".answer").length;
  for(j=0;j<tam;j++){
    arrayAnswerMod[j]=false;
  }

  for(i=0;i<tam;i++){

    document.querySelectorAll(".answer")[i].onchange = function(e){
     
       if(e.target.getAttribute("count")==null){
        blim=parseInt(e.target.parentNode.getAttribute("count"));
        
        arrayAnswerMod[blim-1]=true;
         
      }else{
        blim=parseInt(e.target.getAttribute("count"));
        arrayAnswerMod[blim-1]=true;
         
        
      }
      for(k=0;k<tam;k++){
       
        if(arrayAnswerMod[k]==false){
          todasCont=false;
     
          break;
        }

        if(k==(tam-1)){
          todasCont=true;
          if(corregido==false){
            document.getElementById("corregir").disabled=false;
            corregido=true;

          }
          
  

        }


      }
     
    };
  }


    

 }


 ////////////////////////////// Funcion para la cuenta atras del tiempo de examen
 ////////////////////////////// Al acabar el tiempo el examen se autocorrige

function creadorCountDown(){
x = setInterval(function() {
  var aux = new Date().getTime();
  var distance = countDownDate - aux;
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

if(stopTiempo==false){

  document.getElementById("relojerino").innerHTML = "Tiempo restante: "+ minutes + "m " + seconds + "s ";
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("relojerino").innerHTML = "TIEMPO AGOTADO";
    if(todasCont==true){
       corregirTodo();
    window.scrollTo(0,document.body.scrollHeight);
  }else{
  
    document.getElementById("resultadosDiv").style.backgroundColor = "salmon"; 
    darRespuestaHtml("No has contestado todas las preguntas a tiempo. Tu nota es 0 puntos sobre 10.");
    var disp=document.getElementById("resultadosDiv").style.display;
    if (disp!="none"){
    alert("FALTAN PREGUNTAS POR RESPONDER");}
  } 
    
  }
}
}, 1000);
}

////////////////////////////// Funcion creadorHtml. Nos crea la estructura para direccionar cada pregunta a las correspondientes funciones
////////////////////////////// según el tipo.

function creadorHtml(obj){

  for(i=0;i<obj.length;i++){

    switch(obj[i].type) {
    case "select":
        createSelect(obj[i]);
        rellenarSelect(obj[i]);
        break;
    case "text":
        createText(obj[i]);
        rellenarTexto(obj[i]);
        break;
    case "checkbox":
        createCheck(obj[i]);
        rellenarCheck(obj[i]);
        break;
    case "radio":
        createRadio(obj[i]);
        rellenarRadio(obj[i]);
        break;
    case "number":
        createNumber(obj[i]);
        rellenarNum(obj[i]);
        break;
    default:
        console.log("nope");
}
  }
}

}


////////////////////////////// Funciones de creación. Aqui Creamos los distintos tipos de pregunta y sus campos.

function createSelect(dat){
  globalCount++;
  selNum++;
  container=document.getElementById("myform");
 var select= document.createElement("h3");
 select.setAttribute("id","tituloSelect"+selNum);
 var select2=document.createElement("h4");
 select2.setAttribute("id","textSelect"+selNum)
 var select3=document.createElement("select");
 select3.setAttribute("id","sel"+selNum);
 select3.setAttribute("count",globalCount);

 select3.setAttribute("class","select answer");
 var select4=document.createElement("br");
 var corregir=document.getElementById("corregir");
 var x = document.createElement("HR");
 x.style.color="blue";
 container.insertBefore(select,corregir);
 container.insertBefore(select2,corregir);
 container.insertBefore(select3,corregir);
 container.insertBefore(select4,corregir);
 container.insertBefore(x,corregir);
 document.getElementById("tituloSelect"+selNum).style.padding= "2% 0px 0px 10px";
 document.getElementById("textSelect"+selNum).style.padding= "0px 0px 0px 30px";
 container.style.border = "thick solid #0000FF";
  document.getElementById("sel"+selNum).style.margin="10px";
}

function createCheck(obj){
  globalCount++;
  checkNum++;
   

   container=document.getElementById("myform");
 var check= document.createElement("h3");
 check.setAttribute("id","tituloCheckbox"+checkNum);
 var check2=document.createElement("h4");
 check2.setAttribute("id","textCheckbox"+checkNum)
 var check3=document.createElement("div");
 check3.setAttribute("id","checkboxDiv"+checkNum);
 check3.setAttribute("class","checkBox answer");
 check3.setAttribute("count",globalCount);
 var check4=document.createElement("br");
 var corregir=document.getElementById("corregir");
 var x = document.createElement("HR");
x.style.color="blue";
 container.insertBefore(check,corregir);
 container.insertBefore(check2,corregir);
 container.insertBefore(check3,corregir);
 container.insertBefore(check4,corregir);
   container.insertBefore(x,corregir);
 document.getElementById("tituloCheckbox"+checkNum).style.padding= "2% 0px 0px 10px";
 document.getElementById("textCheckbox"+checkNum).style.padding= "0px 0px 0px 13px";
 container.style.border = "thick solid #0000FF";
  document.getElementById("checkboxDiv"+checkNum).style.margin="10px";

  
}

function createText(obj){
  globalCount++;
  textNum++;
   container=document.getElementById("myform");
 var text= document.createElement("h3");
 text.setAttribute("id","tituloTexto"+textNum);
 var text2=document.createElement("h4");
 text2.setAttribute("id","textInput"+textNum)
 var text3=document.createElement("input");
 text3.setAttribute("type","text");
 text3.setAttribute("id","respuesta"+textNum);
 text3.setAttribute("class","respuesta answer");
 text3.setAttribute("count",globalCount);
 var text4=document.createElement("br"); 
 var corregir=document.getElementById("corregir");
  var x = document.createElement("HR");
x.style.color="blue";
 container.insertBefore(text,corregir);
 container.insertBefore(text2,corregir);
 container.insertBefore(text3,corregir);
 container.insertBefore(text4,corregir);
   container.insertBefore(x,corregir);
  document.getElementById("tituloTexto"+textNum).style.padding= "2% 0px 0px 10px";
  
  document.getElementById("textInput"+textNum).style.padding= "0px 0px 0px 13px";
  document.getElementById("respuesta"+textNum).style.margin="10px";
 container.style.border = "thick solid #0000FF";
}

function createRadio(obj){
  globalCount++;
  radioNum++;
   container=document.getElementById("myform");
 var radio= document.createElement("h3");
 radio.setAttribute("id","tituloRadio"+radioNum);
 var radio2=document.createElement("h4");
 radio2.setAttribute("id","textRadio"+radioNum)
var radio3=document.createElement("div");
 radio3.setAttribute("id","radioDiv"+radioNum);
 radio3.setAttribute("class","radio answer");
 radio3.setAttribute("count",globalCount);
 var radio4=document.createElement("br");
 var x = document.createElement("HR");
 x.style.color="blue";
 corregir=document.getElementById("corregir");
 container.insertBefore(radio,corregir);
 container.insertBefore(radio2,corregir);
 container.insertBefore(radio3,corregir);
 container.insertBefore(radio4,corregir);
   container.insertBefore(x,corregir);
  document.getElementById("tituloRadio"+radioNum).style.padding= "2% 0px 0px 10px";
  document.getElementById("textRadio"+radioNum).style.padding= "0px 0px 0px 13px";
   container.style.border = "thick solid #0000FF";
    document.getElementById("radioDiv"+radioNum).style.margin="10px";
}

function createNumber(obj){
  globalCount++;
numNum++;
   container=document.getElementById("myform");
 var number= document.createElement("h3");
 number.setAttribute("id","tituloNum"+numNum);
 var number2=document.createElement("h4");
 number2.setAttribute("id","textNum"+numNum)
 var number3=document.createElement("input");
 number3.setAttribute("id","numeroIntroducido"+numNum);
  number3.setAttribute("type","number");
  number3.setAttribute("class","numeroIntroducido answer");
  number3.setAttribute("count",globalCount);
 var number4=document.createElement("br");
 var corregir=document.getElementById("corregir");
 var x= document.createElement("HR");
 x.style.color="blue";
 container.insertBefore(number,corregir);
 container.insertBefore(number2,corregir);
 container.insertBefore(number3,corregir);
 container.insertBefore(number4,corregir);
   container.insertBefore(x,corregir);
 document.getElementById("tituloNum"+numNum).style.padding= "2% 0px 0px 10px";
  document.getElementById("textNum"+numNum).style.padding= "0px 0px 0px 13px";
 container.style.border = "thick solid #0000FF";
  document.getElementById("numeroIntroducido"+numNum).style.margin="10px";
}


////////////////////////////// Funciones de rellenar el examen. Aqui sacamos por pantalla el titulo, texto y opciones ( si hay ) para la realización
//////////////////////////////  del examen y almacenamos las respuestas en las variables corresponiendentes para la posterior corrección.

function ponerDatosHtml(nodes,type){
 
  var select = document.getElementsByTagName(type)[0];
  var result = nodes.iterateNext();
  i=0;
  while (result) {
   var option = document.createElement("option");
   option.text = result.innerHTML;
   option.value=i+1; i++;
   select.options.add(option);
   result = nodes.iterateNext();
  }  
}
 
//////////////////////////// Funciones para rellenar cada pregunta en nuestro html.

function rellenarSelect(dat){
 var titulSelect=xmlDoc.getElementsByTagName("title")[0].innerHTML;
 var xpath="/questions/question[@type='select'+selNum]/option";
 var nodeSelect = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);

  respuestaSelect[selNum]=[];
  document.getElementById("tituloSelect"+selNum).innerHTML=dat.title;
  document.getElementById("textSelect"+selNum).innerHTML=dat.text;
  var select = document.getElementById("sel"+selNum);
  for (v = 0; v < dat.options.length; v++) {  
    var option = document.createElement("option");
    option.text = dat.options[v];
    option.value=v+1;
    select.options.add(option);
 } 
 for(w=0;w<dat.answers.length;w++){
  respuestaSelect[selNum]=dat.answers[w];
 } 
 var sele=document.getElementById("sel"+selNum);
 sele.value="-";
 

}

function rellenarTexto(dat){
 respuestaTexto[textNum]=dat.answers[0];
 document.getElementById("tituloTexto"+textNum).innerHTML = dat.title;

 document.getElementById("textInput"+textNum).innerHTML = dat.text;
}

function rellenarCheck(dat){
 
 var xpath="/questions/question[@type=''+checkNum]/option";
 var nodeCheck = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);

respuestasCheckbox[checkNum]=[];
   var checkboxContainer=document.getElementById("checkboxDiv"+checkNum);
 document.getElementById("tituloCheckbox"+checkNum).innerHTML = dat.title;
  document.getElementById("textCheckbox"+checkNum).innerHTML = dat.text;
 for (v = 0; v < dat.options.length; v++) { 
   var input= document.createElement("input");
   var labelC= document.createElement("label");
    labelC.innerHTML=dat.options[v];
    labelC.setAttribute("for", "color_"+checkNum+""+v);
    input.setAttribute("class","check"+checkNum);
    input.type="checkbox";
    input.name="color";
    input.id="color_"+checkNum+""+v;    
    checkboxContainer.appendChild(input);
    checkboxContainer.appendChild(labelC);
 }  
 for(w=0;w<dat.answers.length;w++){
  respuestasCheckbox[checkNum][w]=dat.answers[w];
 }

}

function rellenarRadio(dat){
 
 var xpath="/questions/question[@type='radio'+radioNum]/option";
 var nodeRadio = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);
 document.getElementById("tituloRadio"+radioNum).innerHTML = dat.title;
  document.getElementById("textRadio"+radioNum).innerHTML = dat.text;
  var radioDiv=document.getElementById("radioDiv"+radioNum);
 for (v = 0; v < dat.options.length; v++) { 
    var input = document.createElement("input");
    var labelR= document.createElement("label"+radioNum);
    input.setAttribute("class","radioB"+radioNum);
    labelR.innerHTML=dat.options[v];
    labelR.setAttribute("for", "color_"+v);
    input.type="radio";
    input.name="color"+radioNum;
    input.id="color_"+v;    
    radioDiv.appendChild(input);
    radioDiv.appendChild(labelR);
 }  
  respuestasRadio[radioNum]=parseInt(dat.answers);

}

function rellenarNum(dat){
  respuestaNum[numNum]=dat.answers[0];
document.getElementById("tituloNum"+numNum).innerHTML = dat.title;
document.getElementById("textNum"+numNum).innerHTML = dat.text;
}


///////////////////////////// Función para corregir el cuestionario. Se bloquea el botón de corregir y se da el desglose de la nota
///////////////////////////// indicando las acertadas y las falladas.

function corregirTodo(){
  document.getElementById("resultadosDiv").style.paddingBottom = "13px";
  document.getElementById("resultadosDiv").style.paddingLeft = "13px";
  document.getElementById("resultadosDiv").style.paddingTop = "13px";
  document.getElementById("resultadosDiv").style.border = "thick solid navy";
  document.getElementById("resultadosDiv").style.color = "indigo";
  document.getElementById("resultadosDiv").innerHTML = "Corrección:";
  var div = document.getElementById("resultadosDiv"); 
  var newElem = document.createElement("BR");

   var spans = div.getElementsByTagName("SPAN");  
  for (i = 1; i < spans.length; i++) {
        var newElem = document.createElement("BR");
        div.insertBefore(newElem, spans[i]);
    }

	window.clearInterval(x);
	if(correct==true){
  corregirSelect();
  corregirTexto();
  corregirCheckbox();
  corregirRadio();
  corregirNumber();
  presentarNota();
  
  corregido=true;
  document.getElementById("corregir").disabled=true;
}
  else{
  	darRespuestaHtml("Faltan preguntas por contestar");
  
  }
}

////////////////////////////// Funciones de corrección. Aqui comparamos los valores introducidos por el usuario con los valores de las respuestas.
////////////////////////////// Actualizamos la Nota y indicamos los outputs que el usuario verá como corrección ( función darRespuestaHtml ).



function corregirTexto(){
  var t=document.getElementsByClassName("respuesta");
  for(i=0;i<t.length;i++){
  	var s=document.getElementById("respuesta"+(i+1)).value;
    if(s!=""){
  	 if (s==respuestaTexto[i+1]) {
        document.getElementById("respuesta"+(i+1)).style.backgroundColor = "lightgreen";
      
        nota +=1;
        

      }
      
     else{
     
      darRespuestaHtml("Pregunta Texto"+(i+1)+" incorrecta. La respuesta era: "+respuestaTexto[i+1]);
     document.getElementById("respuesta"+(i+1)).style.backgroundColor = "salmon";
    
     nota -=0.5;
         
      }
    }else{

      darRespuestaHtml("Pregunta Texto"+(i+1)+" sin contestar");
    
      
       
    }
  }


}

function corregirNumber(){ /// revisar
  

  var t=document.getElementsByClassName("numeroIntroducido");
  for(i=0;i<t.length;i++){
    var s=parseInt(document.getElementById("numeroIntroducido"+(i+1)).value); 
    if(isNaN(s)!=true){
     
    if (s==parseInt(respuestaNum[i+1])) {
      document.getElementById("numeroIntroducido"+(i+1)).style.backgroundColor = "lightgreen";
     
      nota +=1;
    }else{
      document.getElementById("numeroIntroducido"+(i+1)).style.backgroundColor = "salmon";
      darRespuestaHtml("Pregunta Number"+(i+1)+" incorrecta. La respuesta era: "+parseInt(respuestaNum[i+1]));
      nota-=0.5;
           
    }
    }else{
      darRespuestaHtml("Pregunta Number"+(i+1)+" sin contestar");
    
           
    }
  
  }

  }

function corregirSelect(){
var cantSel=document.getElementsByClassName("select").length;
 for(i=0;i<cantSel;i++){
 var e=document.getElementById("sel"+(i+1));
 if(e.options[e.selectedIndex]==undefined){
 darRespuestaHtml("Pregunta Select"+(i+1)+" sin contestar");
  
 }else{
 if(e.options[e.selectedIndex].index==parseInt(respuestaSelect[i+1])){  
    document.getElementById("sel"+(i+1)).style.backgroundColor = "lightgreen";  
         
  
    nota +=1;
  }else{
    document.getElementById("sel"+(i+1)).style.backgroundColor = "salmon"; 
   darRespuestaHtml("Pregunta Select"+(i+1)+" incorrecta. La opción correcta era la opción número "+(parseInt(respuestaSelect[i+1])+1));
   nota -=0.5;
      
  } 
 }
 }

}

function corregirCheckbox(){ 
  var cl=document.getElementsByClassName("checkBox").length;
  for(i=0;i<cl;i++){
    var aciertosCheck=0;
    var erroresCheck=0;
    var acertado=false;
    var checkerino=false;
    var chL=document.getElementsByClassName("check"+(i+1)).length;
     for(j=0;j<chL;j++){
      acertado=false;
      checkerino=document.getElementsByClassName("check"+(i+1))[j].checked;
      if(checkerino==true){
        for(k=0;k<respuestasCheckbox[i+1].length;k++){
          if(parseInt(respuestasCheckbox[i+1][k])==j){
            aciertosCheck++;
            acertado=true;
          }
          if(k==(respuestasCheckbox[i+1].length-1)&&acertado==false){
            erroresCheck++;
          }
        }
      }
     }
   
var notaTotal=1;
var posiblesAcierto=respuestasCheckbox[i+1].length;
var cantidadCasillas=chL;
var sumaAciertos=notaTotal/posiblesAcierto;
var restaFallos=(notaTotal/(cantidadCasillas/2));
var notaObtenida=(sumaAciertos*aciertosCheck)-(restaFallos*erroresCheck);

nota+=notaObtenida;
var p=respuestasCheckbox[i+1];
if(notaObtenida>0){
 if(notaObtenida==1){
  document.getElementById("checkboxDiv"+(i+1)).style.backgroundColor = "lightgreen"; 
       

}
else{
  darRespuestaHtml("Pregunta Checkbox"+(i+1)+" parcialmente correcta. Te suma: "+notaObtenida.toFixed(2)+". Opciones correctas: ");
   for (q=0;q<p.length;q++){
 	 	darRespuestaHtml("Opción "+(parseInt(p[q])+1));
     	
     	}
    document.getElementById("checkboxDiv"+(i+1)).style.backgroundColor = "lightyellow";
    
}
  }else{
    if(notaObtenida<0){
    document.getElementById("checkboxDiv"+(i+1)).style.backgroundColor = "salmon"; 
    darRespuestaHtml("Pregunta Checkbox"+(i+1)+" incorrecta. Te resta: "+notaObtenida.toFixed(2)+". Opciones correctas: ");
     for (x=0;x<p.length;x++){
 	 	darRespuestaHtml("Opción "+(parseInt(p[x])+1));
     	
     	}
  } if(notaObtenida==0){
     if(aciertosCheck>=1){

    
     	
     darRespuestaHtml("Pregunta Checkbox"+(i+1)+" parcialmente correcta. Te suma: "+notaObtenida.toFixed(2)+". Opciones correctas: ");
 	 for (l=0;l<p.length;l++){
 	 	darRespuestaHtml("Opción "+(parseInt(p[l])+1));
     
     	}

      document.getElementById("checkboxDiv"+(i+1)).style.backgroundColor = "lightyellow"; 
    

  }else{
     darRespuestaHtml("Pregunta Checkbox"+(i+1)+" sin contestar.");
    
  } 
  }
}
}
}

function corregirRadio(){
  var noSel=true;
  var aux=false;
  var cr=document.getElementsByClassName("radio").length;
   for(i=0;i<cr;i++){
    var chr=document.getElementsByClassName("radioB"+(i+1)).length;
    var p=respuestasRadio[i+1];

    for(j=0;j<chr;j++){
        aux=document.getElementsByClassName("radioB"+(i+1))[j].checked;
        if(aux==true){
          noSel=false;
          if(j==respuestasRadio[i+1]){
            document.getElementById("radioDiv"+(i+1)).style.backgroundColor = "lightgreen"; 
                 
            nota+=1;
          }else{
              var aux2=1/chr;
              document.getElementById("radioDiv"+(i+1)).style.backgroundColor = "salmon";
             darRespuestaHtml("Pregunta Radio"+(i+1)+" incorrecta. Tu nota baja "+aux2.toFixed(2)+" . La opción correcta era la número "+(parseInt(p)+1));
             nota=nota-aux2;
           
          }
        }
      }
      if(noSel==true){
    darRespuestaHtml("Pregunta Radio"+(i+1)+" sin contestar.");
 
     } 
   }

}


////////////////////////////////Gestionar la presentación de las respuestas
////////////////////////////// darrespuestaHtml nos muestra por pantalla lo que recibe por parámetro
////////////////////////////// presentarNota nos muestra el valor de la nota que hemos obtenido. Nunca menor a 0.
////////////////////////////// inicializar nos deja el valor nota a 0 y nos "borra" los outputs que pudiese haber de una ejecución previa.

function darRespuestaHtml(r){
 var p = document.createElement("p");
 var node = document.createTextNode(r);
 p.appendChild(node);
 document.getElementById("resultadosDiv").appendChild(p);
}

function presentarNota(){
 
 
  stopTiempo=true;
  if(nota>0){
    if(nota<5){
      document.getElementById("resultadosDiv").style.backgroundColor = "salmon"; 
    } 
      
      darRespuestaHtml("Nota: "+nota.toFixed(2)+" puntos sobre 10");
  }else{
   
    document.getElementById("resultadosDiv").style.backgroundColor = "salmon";
    
    darRespuestaHtml("Nota: 0 puntos sobre 10");
  }
console.log("NOTA:"+nota);

}
function inicializar(){
   todasCont=false;
   stopTiempo=false;
   document.getElementById("resultadosDiv").innerHTML = "";
   nota=0.0;
}


