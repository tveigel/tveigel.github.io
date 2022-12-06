
import random

names = [ "Sebastian", "Timothy", "Pablo", "David", "Matthias", "Florian", "Maximilian", "Tim G.", "Jannis", "Nico", "Wolf", "Claudius", "Jan-Vincent", "Tim W."]
drinks = ["Vodka mit 2 Sprudelwasser und Limetten", "Vodka mit Sprite", "Bacardi Cola", "Havanna Cola", "Jacky Cola", "Bacardi Cola", "Asbach Cola", "Bacardi Cola", "Bacardi Cola","Bacardi Cola", "Bacardi Cola", 
        "Vodka mit Sprite", "Bacardi Cola", "Jacky Cola"]

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
