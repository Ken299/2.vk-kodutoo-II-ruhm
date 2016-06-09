(function(){
   "use strict";

   var School = function(){

     // SEE ON SINGLETON PATTERN
     if(School.instance){
       return School.instance;
     }
     //this viitab kooli fn
     School.instance = this;

     this.routes = School.routes;
     // this.routes['home-view'].render()

     console.log('Andmebaasis');

     // KÕIK muuutujad, mida muudetakse ja on rakendusega seotud defineeritakse siin
     this.click_count = 0;
     this.currentRoute = null;
     console.log(this);

     // hakkan hoidma kõiki hindeid
     this.grades = [];

     // Kui tahan kooli andmebaasile referenci siis kasutan THIS = KOOLI RAKENDUS ISE
     this.init();
   };

   window.School = School; // Paneme muuutja külge

   School.routes = {
     'home-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>avaleht');
       }
     },
     'list-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>loend');

         //simulatsioon laeb kaua
         window.setTimeout(function(){
           //document.querySelector('.loading').innerHTML = 'laetud!';
         }, 3000);

       }
     },
     'manage-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
       }
     }
   };

   // Kõik funktsioonid lähevad kooli andmebaasi külge
   School.prototype = {

     init: function(){
       console.log('Rakendus läks tööle');

       //kuulan aadressirea vahetust
       window.addEventListener('hashchange', this.routeChange.bind(this));

       // kui aadressireal ei ole hashi siis lisan juurde
       if(!window.location.hash){
         window.location.hash = 'home-view';
         // routechange siin ei ole vaja sest käsitsi muutmine käivitab routechange event'i ikka
       }else{
         //esimesel käivitamisel vaatame urli üle ja uuendame menüüd
         this.routeChange();
       }

       //saan kätte hinded localStorage kui on
       if(localStorage.grades){
           //võtan stringi ja teen tagasi objektideks
           this.grades = JSON.parse(localStorage.grades);
           console.log('laadisin localStorageist massiiivi ' + this.grades.length);

           //tekitan loendi htmli
           this.grades.forEach(function(grade){

               var new_grade = new Grade(grade.id, grade.title, grade.ingredients, grade.links);

               var li = new_grade.createHtmlElement();
               document.querySelector('.list-of-grades').appendChild(li);

           });

       }else{
		   
		   //küsin AJAXIGA
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (xhttp.readyState == 4 && xhttp.status == 200) {
					
					console.log(xhttp.responseText);
					//tekst -> objekktideks
					School.instance.grades = JSON.parse(xhttp.responseText);
					console.log(School.instance.grades);
					
					//teen hinded htmli
					School.instance.grades.forEach(function(grade){

					   var new_grade = new Grade(grade.id, grade.title, grade.ingredients, grade.links);

					   var li = new_grade.createHtmlElement();
					   document.querySelector('.list-of-grades').appendChild(li);

				   });
				   
				   //salvestan localStoragisse
				   localStorage.setItem('grades', JSON.stringify(School.instance.grades));
				   
					
				}
			};
			//xhttp.open("GET", "save.php", true);
			//xhttp.send();
			
			
	   }


       // esimene loogika oleks see, et kuulame hiireklikki nupul
       this.bindEvents();

     },

     bindEvents: function(){
       document.querySelector('.add-new-grade').addEventListener('click', this.addNewClick.bind(this));

       //kuulan trükkimist otsikastis
       document.querySelector('#search').addEventListener('keyup', this.search.bind(this));

     },
	 
	 edit: function(event){
       var selected_id = event.target.dataset.id;
       var clicked_li = event.target.parentNode.parentNode;
       $("#editData").modal({backdrop: true});
 
        $(document).on("click", "#edit_close", function(event){
         return;
       });
 
        $(document).on("click", "#save", function(event){
        console.log(clicked_li);
        var title = document.querySelector('.editTitle').value;
        var ingredients = document.querySelector('.editIngredients').value;
		var links = document.querySelector('.editLinks').value;
        this.grades = JSON.parse(localStorage.grades);
        clicked_li.parentNode.removeChild(clicked_li);
        for(var i=0; i<this.grades.length; i++){
          if(this.grades[i].id == selected_id){
            this.grades[i].title = title;
            this.grades[i].ingredients = ingredients;
			this.grades[i].links = links;
            break;
          }
        }
        localStorage.setItem('grades', JSON.stringify(this.grades));
        location.reload();
       });
     },
	 deletegrade: function(event){
		
		// millele vajutasin SPAN
		console.log(event.target);
		
		// tema parent ehk mille sees ta on LI
		console.log(event.target.parentNode);
		
		//mille sees see on UL
		console.log(event.target.parentNode.parentNode);
		
		//id
		console.log(event.target.dataset.id);
		
		var c = confirm("Oled kindel?");
		
		// vajutas no, pani ristist kinni
		if(!c){	return; }
		
		//KUSTUTAN
		console.log('kustutan');
		
		// KUSTUTAN HTMLI
		var ul = event.target.parentNode.parentNode;
		var li = event.target.parentNode;
		
		ul.removeChild(li);
		
		//KUSTUTAN OBJEKTI ja uuenda localStoragit
		
		var delete_id = event.target.dataset.id;
		
		for(var i = 0; i < this.grades.length; i++){
			
			if(this.grades[i].id == delete_id){
				//see on see
				//kustuta kohal i objekt ära
				this.grades.splice(i, 1);
				break;
			}	
		}
		
		localStorage.setItem('grades', JSON.stringify(this.grades));
		

		
	 },
     search: function(event){
         //otsikasti väärtus
         var needle = document.querySelector('#search').value.toLowerCase();
         console.log(needle);

         var list = document.querySelectorAll('ul.list-of-grades li');
         console.log(list);

         for(var i = 0; i < list.length; i++){

             var li = list[i];

             // ühe listitemi sisu tekst
             var stack = li.querySelector('.content').innerHTML.toLowerCase();

             //kas otsisõna on sisus olemas
             if(stack.indexOf(needle) !== -1){
                 //olemas
                 li.style.display = 'list-item';

             }else{
                 //ei ole, index on -1, peidan
                 li.style.display = 'none';

             }

         }
     },

     addNewClick: function(event){

       var title = document.querySelector('.title').value;
       var ingredients = document.querySelector('.ingredients').value;
	   var links = document.querySelector('.links').value;

       //1) tekitan uue hinde'i
	   var id = guid();
       var new_grade = new Grade(id, title, ingredients, links);

       //lisan massiiivi hinde
       this.grades.push(new_grade);
       console.log(JSON.stringify(this.grades));
       // JSON'i stringina salvestan localStorage'isse
       localStorage.setItem('grades', JSON.stringify(this.grades));
	   
		
		//AJAX
		var xhttp = new XMLHttpRequest();
		
		//mis juhtub kui päring lõppeb
		xhttp.onreadystatechange = function() {
			
			console.log(xhttp.readyState);
			
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				
				console.log(xhttp.responseText);
			}
		};
		
		//teeb päringu
		//xhttp.open("GET", "save.php?id="+id+"&title="+title+"&ingredients="+ingredients+"&links="+links, true);
		//xhttp.send();
	   

       // 2) lisan selle htmli listi juurde
       var li = new_grade.createHtmlElement();
       document.querySelector('.list-of-grades').appendChild(li);


     },

     routeChange: function(event){

       //kirjutan muuutujasse lehe nime, võtan maha #
       this.currentRoute = location.hash.slice(1);
       console.log(this.currentRoute);

       //kas meil on selline leht olemas?
       if(this.routes[this.currentRoute]){

         //muudan menüü lingi aktiivseks
         this.updateMenu();

         this.routes[this.currentRoute].render();


       }else{
         /// 404 - ei olnud
       }


     },

     updateMenu: function() {
       //http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
       //1) võtan maha aktiivse menüülingi kui on
       document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '');

       //2) lisan uuele juurde
       //console.log(location.hash);
       document.querySelector('.'+this.currentRoute).className += ' active-menu';

     }

   }; // ANDMEBAASi LÕPP

   var Grade = function(new_id, new_title, new_ingredients, new_links){
	 this.id = new_id;
     this.title = new_title;
     this.ingredients = new_ingredients;
	 this.links = new_links;
     console.log('created new grade');
   };

   Grade.prototype = {
     createHtmlElement: function(){

       /*
       li
        span.letter
          M <- title esimene täht
        span.content
          title | ingredients
       */

       var li = document.createElement('li');

       var span = document.createElement('span');
       span.className = 'letter';

       var letter = document.createTextNode(this.title.charAt(0));
       span.appendChild(letter);

       li.appendChild(span);

       var span_with_content = document.createElement('span');
       span_with_content.className = 'content';

       var content = document.createTextNode(this.title + ' | ' + this.ingredients + ' | ' + this.links + ' | ');
       span_with_content.appendChild(content);

       li.appendChild(span_with_content);
	   
	   //DELETE nupp
	   var span_delete = document.createElement('button');
	   span_delete.style.color = "red";
	   span_delete.style.cursor = "pointer";
	   //span_delete.style.textDecoration = "underline overline";
	   
	   //kustutamiseks panen id kaasa
	   span_delete.setAttribute("data-id", this.id);
	   span_delete.innerHTML = " Kustuta";
	  
	   li.appendChild(span_delete);
	   
	   //keegi vajutas nuppu
	   span_delete.addEventListener("click", School.instance.deletegrade.bind(School.instance));
	   
	   var span_edit = document.createElement('button');
	   span_edit.style.color = "green";
	   span_edit.style.cursor = "pointer";
	   //span_edit.style.textDecoration = "underline overline";
       span_edit.setAttribute('data-id', this.id);
       span_edit.innerHTML = " Muuda";
       li.appendChild(span_edit);
       span_edit.addEventListener('click', School.instance.edit.bind(School.instance));

       return li;

     }
   };
   
   //HELPER
   function guid(){
		var d = new Date().getTime();
		if(window.performance && typeof window.performance.now === "function"){
			d += performance.now(); //use high-precision timer if available
		}
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	}

   // kui leht laetud käivitan andmebaasi rakenduse
   
   window.onload = function(){
     var app = new School();
   };

})();
