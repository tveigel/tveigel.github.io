

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
}


const partners = {'David': ['Sebastian', 'Vodka mit 2 Sprudelwasser und Limetten'], 'Niels': ['Timothy', 'Vodka mit Sprudel und Limetten'], 'Florian': ['Niels', 'Tanquery Sevilla oder auch Stornsdorfer'], 'Jannis': ['David', 'Havanna Cola'], 'Maximilian': ['Matthias', 'Jacky Cola'], 'Jan-Vincent': ['Florian', 'Blueberry Bacardi'], 'Matthias': ['Maximilian', 'Asbach Cola'], 'Tim': ['Jannis', 'etwas liköriges zum shotten'], 'Timothy': ['Claudius', 'Vodka mit Sprite'], 'Sebastian': ['Jan-Vincent', 'Jägermeister'], 'Claudius': ['Tim', 'Rum']};
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