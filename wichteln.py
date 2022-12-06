
import random

names = [ "Sebastian", "Timothy", "Niels", "David", "Matthias", "Florian", "Maximilian", "Jannis", "Claudius", "Jan-Vincent", "Tim"]
drinks = ["Vodka mit 2 Sprudelwasser und Limetten", "Vodka mit Sprudel und Limetten", "Tanquery Sevilla oder auch Stornsdorfer", "Havanna Cola", "Jacky Cola", "Bacardi Cola", "Asbach Cola", "etwas liköriges zum shotten", 
        "Vodka mit Sprite", "Jägermeister", "Rum"]

# make sure noone draws themselfe
x = False
while x ==False:

    y = True
    partners = random.sample(names, len(names))
    for i in range(len(names)):
        if names[i] == partners[i]:
            y = False
    x = y
    

dic = {}


dic = {partners[i]:[names[i], drinks[i]] for i in range(len(names))}  

print(dic)
