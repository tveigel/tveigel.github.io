

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
}


const partners = {'Claudius': ['Sebastian', 'Vodka mit 2 Sprudelwasser und Limetten'], 'Tim': ['Timothy', 'Vodka mit Sprudel und Limetten'], 'Jannis': ['Niels', 'Tanquery Sevilla oder auch Stornsdorfer'], 'Maximilian': ['David', 'Havanna Cola'], 'Jan-Vincent': ['Matthias', 'Jacky Cola'], 'Niels': ['Florian', 'Bacardi Cola'], 'David': ['Maximilian', 'Asbach Cola'], 'Sebastian': ['Jannis', 'etwas liköriges zum shotten'], 'Florian': ['Nico', 'Bacardi Cola'], 'Nico': ['Claudius', 'Vodka mit Sprite'], 'Matthias': ['Jan-Vincent', 'Jägermeister'], 'Timothy': ['Tim', 'Rum']};
var inp = prompt("Gib deinen Vornamen ein");
var inp = inp.trim();
var inp = inp.charAt(0).toUpperCase() + inp.slice(1);

var el = document.getElementById('result');

if (inp in partners) {


    el.innerHTML = ("Ay Gude "+inp+ "!" +"<br />"+  "du hast die Ehre " + partners[inp][0]+ " mit Schnaps zu versorgen." +"<br />"+ "Falls es dich interessiert: "+partners[inp][0] + " hat verlauten lassen, dass er gerne Tequila oder "+ partners[inp][1] +" trinken würde ." +"<br />"+ "Diese Entscheidung liegt aber in deiner Hand.");

}
else{
    
    el.innerHTML = ("Hallo "+inp+". Lade die Seite neu und gib deinen richtigen Namen ein");
    }