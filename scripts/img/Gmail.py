from androidautogui import android
from adbutils import adb
import time
import yaml
import logging
import random
import pandas as pd
import pygame
import os
import random
import string
from datetime import datetime
import pyperclip




# Initialise pygame
pygame.init()
previous_click_x = None
previous_click_y = None
devices=adb.device_list()
if len(devices) == 1:
    device=devices[0]
else :
    for i,device in enumerate(devices):
        print("("+str(i)+") :   "+str(device.prop.name))


    device=devices[int(input("device number : "))]

client = android(device)
print(f"Le device {device.prop.name} est connecté.")
client.device.shell2("input keyevent KEYCODE_CTRL_LEFT; input keyevent KEYCODE_O")
print("L'écran du téléphone est éteint.")








##############################################################################
def code_action(string):
    client.client.control.keycode(string)


def click(x, y):
    x_variation = random.uniform(-3, 3)
    y_variation = random.uniform(-3, 3)

    x_with_variation = int(x + x_variation)
    y_with_variation = int(y + y_variation)

    client.click(x_with_variation, y_with_variation)
    # print(f"Clic en position ({x_with_variation}, {y_with_variation}).")

def mode_avion():
    client.device.airplane_on()
    time.sleep(1)
    client.device.airplane_off()
    time.sleep(4)


def doubleclick(x,y):
    client.click(x,y)
    client.click(x,y)
    print(f"Double clic en position ({x}, {y}).")

def up(xmin=420,xmax=750):
    x=random.randint(xmin,xmax)
    click(x,10)
def down(xmin=400,xmax=700):
    x=random.randint(xmin,xmax)
    click(x,1418)
def left(ymin=280,ymax=600):
    y=random.randint(ymin,ymax)
    click(10,y)
def right(ymin=280,ymax=600):
    y=random.randint(ymin,ymax)
    click(1110,y)


def upswip(xmin=420, xmax=750, ymin=150, ymax=400):
    x = random.randint(xmin, xmax)
    y1 = random.randint(ymin, ymax - 200)  # Assure une différence de 200 pixels
    y2 = y1 + 250
    swipe(x, y1, x, y2)

def downswip(xmin=900, xmax=1400, ymin=600, ymax=900):
    x = random.randint(xmin, xmax)
    y2 = random.randint(ymin, ymax - 200)  # Assure une différence de 200 pixels
    y1 = y2 + 250
    swipe(x, y1, x, y2)

def leftswip(xmin=250, xmax=700, ymin=500, ymax=800):
    y = random.randint(ymin, ymax)
    x1 = random.randint(xmin, xmax - 200)  # Assure une différence de 200 pixels
    x2 = x1 + 250
    swipe(x1, y, x2, y)


def rightswip(xmin=700, xmax=1300, ymin=700, ymax=900):
    y = random.randint(ymin, ymax)
    x2 = random.randint(xmin, xmax - 200)  # Assure une différence de 200 pixels
    x1 = x2 + 250
    swipe(x1, y, x2, y)


def moveFromTo(Fromimage,Toimage, duration=500):
    Fromx,Fromy=Find(Fromimage,0.8)
    Tox,Toy=Find(Toimage,0.8)
    client.device.shell(f"input swipe {Fromx} {Fromy} {Tox} {Toy} {duration}")
    print(f"Swipe from {Fromimage} to {Toimage} with duration {duration} ms")

    #clt.control.swipe(Fromx,Fromy,Tox,Toy,move_steps_delay=0.007)

def swipe(x1, y1, x2, y2, duration=500):
    client.device.shell(f"input swipe {x1} {y1} {x2} {y2} {duration}")
    print(f"Swipe from position({x1}, {y1}) to ({x2}, {y2}) with duration {duration} ms")

def write(text):
    client.write(text)



def FindAndClickTrue(images,conf,region=None):

    for i in range(len(images)):
        cord=client.locate_center_on_screen(images[i], confidence=conf,region=region)
        if cord!= None:
            x,y=cord

            print("i can see "+images[i])
            click(x,y)
            return True
        else:
            print("i can't see "+images[i])
            return False


def Find(image,conf, region=None,x=True): #ContinuousFindd
    # Search for the image until it is found
    while True:
        # echange()
        #checkpopup()
        #captcha()
        time.sleep(0.1)
        # if x:
        #     if_find_click("images/xx.png",0.85)
        image_center = client.locate_center_on_screen(image, confidence=conf,region=region)
        if image_center is not None:
            x,y=image_center
            print("i can see "+str(image))
            return x,y
        else:
            # Take a break between searches
            print("i can't see "+str(image))
def FindCombat(image,conf, region=None,x=True): #ContinuousFindd
    # Search for the image until it is found
    while True:
        # echange()
        time.sleep(0.2)
        # if x:
        #     if_find_click("images/xx.png",0.85)
        image_center = client.locate_center_on_screen(image, confidence=conf,region=region)
        if image_center is not None:
            x,y=image_center
            print("i can see "+str(image))
            return x,y
        else:
            # Take a break between searches
            print("i can't see "+str(image))
            if Findd("victoire.png", 0.7):
                    break


def Findd(image,conf,region=None): #Findd
    cord=client.locate_center_on_screen(image, confidence=conf,region=region)
    time.sleep(0.2)
    if cord!= None:
        x,y=cord
        print("i can see "+image)
        return x,y
    else:
        print("i cant see "+image)
        return False
def Findd0(image,conf,region=None): #Findd
    #if_find_click("x.png",0.82)
    cord=client.locate_center_on_screen(image, confidence=conf,region=region)
    time.sleep(0.2)
    if cord!= None:
        x,y=cord
        print("i can see "+image)
        return x,y
    else:
        print("i cant see "+image)
        return False
def Finddd(image, conf, region=None): #none
    cord = client.locate_center_on_screen(image, confidence=conf, region=region)
    if cord is not None:
        x, y = cord
        print("I can see " + image)
        return x, y  # Retourne les coordonnées si l'image est trouvée
    else:
        print("I can't see " + image)
        return None  # Retourne None si l'image n'est pas trouvée

def Findtf(image,conf,region=None):
    cord=client.locate_center_on_screen(image, confidence=conf,region=region)

    if cord!= None:

        print("i can see "+image)

        return True
    else:
        print("i cant see "+image)
        return False

def Findtfmultiple(images,conf,region=None):
    for image in images:
        cord=client.locate_center_on_screen(image, confidence=conf,region=region)
        if cord!= None:

            print("i can see "+image)

            return True

    print("i cant see images")
    return False

def random_action():
    # generate four random integers between 0 and 3
    rand_values = [random.randint(0, 3) for i in range(2)]
    numb1=0
    numb2=0
    # perform action based on which value was generated
    if rand_values[0] == 0:
        numb1=-40
        numb2=-10
    elif rand_values[1] == 1:
        numb1=40
        numb2=10
    else:
        numb1=75
        numb2=48
    return numb1,numb2

def Finddoubleclick(image,conf,region=None):
    while True:
        cord=client.locate_center_on_screen(image, confidence=conf,region=region)

        if cord!= None:
            x,y=cord
            print("i can see "+image)
            doubleclick(x,y)
            return
        else:
            print("i cant see "+image)

def FindAndDoubleClick(images,conf,region=None):
    while True:
        echange()
        for image in images:
            image_center = client.locate_center_on_screen(image, confidence=conf,region=region)

            if image_center is not None:
                x,y=image_center
                print("i can see "+image)
                #click on the center of the image
                click(x,y)
                click(x,y)
                return x,y
            else:
                time.sleep(0.2)
                # Take a break between searches
                print("i cant see "+image)
def FindAndDoubleClick(images, conf, region=None):
    avoid_rectangle = {
        'top_left': (650, 860),
        'bottom_right': (737, 897)
    }

    while True:
        for image in images:
            while True:
                start_time = time.time()
                image_center = client.locate_center_on_screen(image, confidence=conf, region=region)

                if image_center is not None:
                    x, y = image_center
                    if not (avoid_rectangle['top_left'][0] <= x <= avoid_rectangle['bottom_right'][0] and
                            avoid_rectangle['top_left'][1] <= y <= avoid_rectangle['bottom_right'][1]):
                        click(x, y)
                        click(x, y)
                        end_time = time.time()
                        click_interval = end_time - start_time
                        print(f"Je vois et je clique sur l'{image}. Position du clic : x={x}, y={y}, Intervalle de temps entre les clics : {click_interval} secondes")
                        return x, y
                    else:
                        print(f"L'image {image} est dans la zone à éviter. Je continue la recherche...")
                        break
                else:
                    time.sleep(0.2)
                    print(f"Je ne vois pas l'{image}. Je continue la recherche...")
                    break

def FindAllImages(images, conf, region=None):
    time.sleep(0.2)
    # Search for all occurrences of images
    results = {image: client.locate_center_on_screen(image, confidence=conf, region=region) for image in images}

    return results


def Findmulti(images,conf, region=None):
    # Search for the image until it is found
    time.sleep(0.2)
    while True:
        for image in images:
            image_center = client.locate_center_on_screen(image, confidence=conf,region=region)
            print(image)
            if image_center is not None:
                x,y=image_center
                print("i can see "+image)
                return x,y
            else:
                # Take a break between searches
                print("i can't see "+image)

def FindPosClick(image, conf, region=None, xp=0, yp=0, max_attempts=20):#avec x+captcha
    consecutive_failures = 0

    while True:

        time.sleep(0.2)
        image_center = client.locate_center_on_screen(image, confidence=conf, region=region)

        if image_center is not None:
            x, y = image_center
            print(f"Je vois et je clique sur l'{image} à la Position du clic : x={x}, y={y}")
            # Cliquez au centre de l'image
            x += xp + random.randint(-5, 5)
            y += yp + random.randint(-5, 5)

            # Cliquez au centre de l'image avec une petite variation aléatoire
            click(x + xp, y + yp)
            break
        else:
            # Prenez une pause entre les recherches
            print("Je n'arrive pas à voir l'image " + image + ", je continue à chercher.")
            consecutive_failures += 1

            if consecutive_failures >= max_attempts:
                pygame.mixer.Sound("alarm.mp3").play()  # Jouez le son après 10 tentatives consécutives sans image
                print("Playing alarm sound")
                time.sleep(10)  # Attendre 0.2 minutes (10 secondes) avant de reprendre les recherches
                consecutive_failures = 0  # Réinitialiser le compteur d'échecs

def FindPosClick0(image, conf, region=None, xp=0, yp=0, max_attempts=20):#sans x

    while True:
        # if_find_click("x.png",0.82)
        # if_find_click("images/x.png",0.82,region=(940,90,60,60))
        time.sleep(0.2)
        image_center = client.locate_center_on_screen(image, confidence=conf, region=region)

        if image_center is not None:
            x, y = image_center
            print(f"Je vois et je clique sur l'{image} à la Position du clic : x={x}, y={y}")
            # Cliquez au centre de l'image
            x += xp + random.randint(-5, 5)
            y += yp + random.randint(-5, 5)

            # Cliquez au centre de l'image avec une petite variation aléatoire
            click(x + xp, y + yp)
            break
        else:
            # Prenez une pause entre les recherches
            print("Je n'arrive pas à voir l'image " + image + ", je continue à chercher.")
           


def FindPosClickEchange(image,conf, region=None,xp=0,yp=0):
    while True:
        echange()
        # if_find_click("images/xx.png",0.82)
        # if_find_click("images/x.png",0.82,region=(940,90,60,60))
        time.sleep(0.2)
        image_center = client.locate_center_on_screen(image, confidence=conf,region=region)
        if image_center is not None:
            x,y=image_center
            print("Je vois et je click sur l'"+image)
            #click on the center of the image
            click(x+xp,y+yp)
            break
        else:
            # Take a break between searches
            print("Je n'arrive pas à voir l'image " + image + ", je continue à chercher.")

def FindPosClickList(images, conf, region=None, xp=0, yp=0):
    for image in images:
            image_center = client.locate_center_on_screen(image, confidence=conf, region=region)
            if image_center is not None:
                x, y = image_center
                print("Je vois et je clique sur l'" + image)
                # Clique sur le centre de l'image
                click(x + xp, y + yp)
                break
            else:
                # Pause entre les recherches
                print("Je n'arrive pas à voir l'image " + image + ", je continue à chercher.")
                time.sleep(0.2)
                if Findd("victoire.png", 0.7):
                   break
def FinddPosClickList(images, conf, region=None, xp=0, yp=0):
    while True:
        for image in images:
                image_center = client.locate_center_on_screen(image, confidence=conf, region=region)
                if image_center is not None:
                    x, y = image_center
                    print("Je vois et je clique sur l'" + image)
                    # Clique sur le centre de l'image
                    click(x + xp, y + yp)
                    break
                else:
                    # Pause entre les recherches
                    print("Je n'arrive pas à voir l'image " + image + ", je continue à chercher.")
                    time.sleep(0.2)
                    # if Findd("victoire.png", 0.7):
                    #     break

def FindPosClickCombat(image,conf, region=None,xp=0,yp=0):
    time.sleep(0.3)
    while True:
        if Findd0("erreur_dc.png",0.82):
            dc ()
        image_center = client.locate_center_on_screen(image, confidence=conf,region=region)
        if image_center is not None:
            x,y=image_center
            print("i can see "+image)
            #click on the center of the image
            click(x+xp,y+yp)
            break
        else:
            # Take a break between searches
            print("i cant see "+image)
            if Findd0("victoire.png", 0.7):
                break

def if_find_click(image,conf, region=None):
        image_center = client.locate_center_on_screen(image, confidence=conf,region=region)
        if image_center is not None:
            x,y=image_center
            print("i can see "+image)
            #click on the center of the image
            click(x,y)
        else:
            # Take a break between searches
            print("i cant see "+image)


def FindTF(image,conf,region=None):
    # if_find_click("images/xx.png",0.82)

    cord=client.locate_center_on_screen(image, confidence=conf,region=region)

    if cord!= None:
        print("i can see "+image)
        return True
    else:
        return False

def findPosClickinrangebellowInList(images, confi):
    time.sleep(0.2)
        #------------------------
    for i in range(len(images)):
        image_center = client.locate_center_on_screen(images[i], confidence=confi, region=(351,507, 200, 120))
        if image_center is not None:
            x,y=image_center
            print("i can see "+images[i])
            return True
    else:
        # Take a break between searches
        print("i cant see "+images[i])
        return False

# ClickProlonge removed - use long_press_image instead
# Example: long_press_image(image, duration_ms=duree*1000, confidence=confi)



    Find('images/ndc.png',0.95,region=(800,240,450,100),x=False)
    x,y=Find('images/ndc.png',0.95,region=(800,240,450,100),x=False)

    click(x,y+10)
    time.sleep(1.2)

    write(ndc[nn+j])
    time.sleep(0.8)
    code_action(66)
    write(mdp[nn+j])
    time.sleep(0.5)
    code_action(66)
    time.sleep(conf['account']['time_sleep_connecting'])
    nn=nn+1
    logging.info(ndc[nn+j-1])

def mode_avion():
    client.airplane_on()
    time.sleep(3)
    client.airplane_off()

    time.sleep(5)


def echap():
    device.shell("input keyevent KEYCODE_BACK")

def generate_random_gmail(order="random"):
    # Base de données de noms de personnes et de personnages de Dofus
    noms = [
        "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
        "Mia", "Benjamin", "Charlotte", "Elijah", "Amelia", "James", "Harper", "Alexander", "Abigail", "Michael",
        "Iop", "Eniripsa", "Osamodas", "Cra", "Enutrof", "Sram", "Feca", "Xelor",
        "Sacrieur", "Pandawa", "Roublard", "Zobal", "Steamer", "Eliotrope", "Huppermage",
        "Ouginak", "Sadida", "Féca", "Écaflip", "Sram", "Masqueraider", "Rogue", "Foggernaut",
        "DofusEmeraude", "DofusTurquoise", "DofusPourpre", "DofusOcre", "DofusVulbis",
        "DofusAbyssal", "DofusIvoire", "Dofusebene", "Pandala", "Dofawa", "Dragodinde", "Bouftou",
        "Tofu", "Wabbit", "Abraknyde", "Bwork", "Chacha", "Dragodinde", "Bouftou", "Tournesol"
    ]
    
    # Générer un nombre aléatoire entre 1980 et 2012
    annee = random.randint(1980, 2012)
    
    # Choisir aléatoirement un nom de la liste
    nom = random.choice(noms)
    
    # Choisir aléatoirement un personnage de Dofus dans la liste
    personnage_dofus = random.choice(noms[20:])  # Les personnages de Dofus commencent à l'indice 20
    
    # Choix de l'ordre de génération des éléments
    if order == "random":
        elements = [nom.lower(), str(annee), personnage_dofus]
        random.shuffle(elements)
    elif order == "nom_dernier":
        elements = [str(annee), personnage_dofus, nom.lower()]
    elif order == "personnage_dofus_dernier":
        elements = [nom.lower(), str(annee), personnage_dofus]
    else:  # Par défaut, utilise un ordre aléatoire
        elements = [nom.lower(), str(annee), personnage_dofus]
        random.shuffle(elements)
    
    # Formater l'adresse Gmail avec les éléments choisis
    gmail = ".".join(elements)
    return gmail

    # # Générer une adresse Gmail
    # adresse_gmail = generate_random_gmail()
    # adresse_gmail_txt = adresse_gmail + "@gmail.com"

    # # Enregistrer l'adresse Gmail dans un fichier texte avec la date de génération
    # date_generation = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # with open("adresses_gmail.txt", "a") as f:
    #     f.write(f"{adresse_gmail_txt} - Généré le {date_generation}\n")


    # print("Adresse Gmail générée :", adresse_gmail_txt)
    # print("L'adresse a été copiée dans le presse-papiers.")
    # print("L'adresse a été enregistrée dans le fichier adresses_gmail.txt avec la date de génération.")

def gmail():
    mode_avion()
    FindPosClick0('account.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    swipe(1387, 824, 1387, 185, duration=500)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('add.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('google.png',0.8)
    time.sleep(random.uniform(3,5))
    Find("singin.png",0.8)
    swipe(1387, 824, 1387, 185, duration=500)
    time.sleep(random.uniform(0.3,0.4))
    FindPosClick0('create.png',0.8)
    time.sleep(random.uniform(0.3,0.4))
    FindPosClick0('formy.png',0.8)
    time.sleep(random.uniform(0.3,0.5))
    FindPosClick0('name.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    write('safaa')
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('next.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('month.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    swipe(1075, 980, 1075, 80, duration=500)
    time.sleep(random.uniform(0.4,0.6))
    FindPosClick0('december.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('day.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    write('4')
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('year.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    write('1991')
    time.sleep(random.uniform(0.2,0.4))
    echap()
    
    FindPosClick0('gender.png',0.8)
    
    time.sleep(random.uniform(0.3,0.5))
    FindPosClick0('female.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('next.png',0.8)
    time.sleep(random.uniform(2,4))
    if Findd("choose.png",0.8) :
        swipe(1387, 700, 1387, 300, duration=500)
        FindPosClick0('own.png',0.8)
        time.sleep(random.uniform(0.2,0.4))
    else : 
        FindPosClick0('username.png',0.8)
        time.sleep(random.uniform(0.2,0.4))
    
    adresse_gmail = generate_random_gmail()
    pyperclip.copy(adresse_gmail)
    adresse_gmail_txt = adresse_gmail + "@gmail.com"
    # Enregistrer l'adresse Gmail dans un fichier texte avec la date de génération
    date_generation = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("adresses_gmail.txt", "a") as f:
        f.write(f"{adresse_gmail_txt} - Généré le {date_generation}\n")

    # Coller l'adresse Gmail générée dans le champ correspondant
    write(adresse_gmail)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('next.png',0.8)
    time.sleep(random.uniform(4,6))
    FindPosClick0('password.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    write('Dofuspl1.')
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('next.png',0.8)
    time.sleep(random.uniform(5,6))
    if Findd('review.png',0.8):
        FindPosClick0('next.png',0.8)
        time.sleep(random.uniform(0.2,0.4))
    elif Findd('skip.png',0.8):
        FindPosClick0('skip.png',0.8)
        time.sleep(random.uniform(0.2,0.4))
    Find('privacy.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    swipe(1387, 1000, 1387, 100, duration=500)
    time.sleep(random.uniform(0.2,0.4))
    swipe(1387, 1000, 1387, 100, duration=500)
    time.sleep(random.uniform(0.2,0.4))
    swipe(1387, 1000, 1387, 100, duration=500)
    time.sleep(random.uniform(0.2,0.4))
    swipe(1387, 1000, 1387, 100, duration=500)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('agree.png',0.8)
    time.sleep(random.uniform(8,10))



gmail()
  