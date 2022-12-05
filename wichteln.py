
import random

names = ["Sebi", "Timothy", "Pablo", "David", "Matthias", "Florian", "Maxi", "Tim", "Jannis", "Nico", "Wolf", "Claudius", "Winne"]
drinks = ["Bacardi Cola", "Tequila", "Bacardi Cola", "Bacardi Cola", "Jacky Cola", "Bacardi Cola", "Asbach Cola", "Bacardi Cola", "Bacardi Cola", "Bacardi Cola", "Bacardi Cola", 
        "Bacardi Cola", "Bacardi Cola"]

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