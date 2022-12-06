

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
}


const partners = {'Matthias': ['Sebastian', 'Vodka mit 2 Sprudelwasser und Limetten'], 'Sebastian': ['Timothy', 'Vodka mit Sprudel und Limetten'], 'Jannis': ['Niels', 'Tanquery Sevilla oder auch Stornsdorfer'], 'Claudius': ['David', 'Havanna Cola'], 'Florian': ['Matthias', 'Jacky Cola'], 'Timothy': ['Florian', 'Bacardi Cola'], 'Jan-Vincent': ['Maximilian', 'Asbach Cola'], 'Niels': ['Jannis', 'etwas liköriges zum shotten'], 'David': ['Claudius', 'Vodka mit Sprite'], 'Tim': ['Jan-Vincent', 'Jägermeister'], 'Maximilian': ['Tim', 'Rum']};
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