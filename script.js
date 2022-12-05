

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
}

const names = ["Sebi", "Timothy", "Pablo", "David", "Matthias", "Florian", "Maxi", "Tim", "Jannis", "Nico", "Wolf", "Claudius", "Winne"]
const partners = {'Maxi': ['Sebi', 'Bacardi Cola'], 'Nico': ['Timothy', 'Tequila'], 'Tim': ['Pablo', 'Bacardi Cola'], 'Claudius': ['David', 'Bacardi Cola'],
 'Sebi': ['Matthias', 'Jacky Cola'], 'Wolf': ['Florian', 'Bacardi Cola'], 'Florian': ['Maxi', 'Asbach Cola'],
  'Winne': ['Tim', 'Bacardi Cola'], 'Pablo': ['Jannis', 'Bacardi Cola'], 'Timothy': ['Nico', 'Bacardi Cola'],
   'Matthias': ['Wolf', 'Bacardi Cola'], 'David': ['Claudius', 'Bacardi Cola'], 'Jannis': ['Winne', 'Bacardi Cola']}


var inp = prompt("Gib deinen Vornamen ein");

if (inp in partners) {


    
    var el = document.getElementById('result');
    el.innerHTML = ("Ay Gude "+inp+ "!" +"<br />"+  "du hast die Ehre " + partners[inp][0]+ " mit Schnaps zu versorgen." +"<br />"+ "Falls es dich interessiert: "+partners[inp][0] + " hat verlauten lassen, dass er gerne "+ partners[inp][1] +" oder Tequila trinken möchte." +"<br />"+ "Diese Entscheidung liegt aber in deiner Hand.");

}
else
el.innerHTML = ("Lade die Seite neu und gib deinen richtigen Namen ein");