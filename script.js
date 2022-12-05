

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
const partners = {'Nico': ['Sebastian', 'Vodka mit 2 Sprudelwasser und Limetten'], 'Claudius': ['Timothy', 'Vodka mit Sprite'], 'Wolf': ['Pablo', 'Bacardi Cola'], 'Pablo': ['David', 'Havanna Cola'], 'Sebastian': ['Matthias', 'Jacky Cola'], 'Tim G.': ['Florian', 'Bacardi Cola'], 'Tim W.': ['Maximilian', 'Asbach Cola'], 'Maximilian': ['Tim G.', 'Bacardi Cola'], 'Florian': ['Jannis', 'Bacardi Cola'], 'Matthias': ['Nico', 'Bacardi Cola'], 'Jannis': ['Wolf', 'Bacardi Cola'], 'Jan-Vincent': ['Claudius', 'Vodka mit Sprite'], 'Timothy': ['Jan-Vincent', 'Bacardi Cola'], 'David': ['Tim W.', 'Jacky Cola']}
var inp = prompt("Gib deinen Vornamen ein");
var el = document.getElementById('result');
if (inp in partners) {


    
    ;
    el.innerHTML = ("Ay Gude "+inp+ "!" +"<br />"+  "du hast die Ehre " + partners[inp][0]+ " mit Schnaps zu versorgen." +"<br />"+ "Falls es dich interessiert: "+partners[inp][0] + " hat verlauten lassen, dass er gerne "+ partners[inp][1] +" oder Tequila trinken möchte." +"<br />"+ "Diese Entscheidung liegt aber in deiner Hand.");

}
else{
    
    el.innerHTML = ("Lade die Seite neu und gib deinen richtigen Namen ein");
    }