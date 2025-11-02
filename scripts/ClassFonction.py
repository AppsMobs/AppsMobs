from androidautogui import android
from adbutils import adb
import time
import yaml
import sys
import logging
import random
import pandas as pd
import pygame
import os
import math
import numpy as np
import pytesseract
from PIL import Image


# Initialise pygame
pygame.init()

previous_click_x = None
previous_click_y = None
devices=adb.device_list()
d=len(devices)
print(d)
if d>1:
    for i,device in zip(range(len(devices)),devices):
        print("("+str(i)+") :   "+str(device.prop.name))
    while 1==1:
        try:
            device=devices[int(input("device number : "))]
            android_device = android(device)
            break
        except Exception as e:
            print(e)
elif d==0:
    print("no device was connected")
else:
    device=devices[0]
    android_device = android(device)



def entre():
    android_device.entre()

##############################################################################

    

def click(x,y):
    android_device.click(x,y)

def mode_avion():
    android_device.airplane_on()
    time.sleep(3)
    android_device.airplane_off()

def doubleclick(x,y):
    android_device.click(x,y)
    android_device.click(x,y)
    print(f"Double clic en position ({x}, {y}).")

# def up(xmin=420,xmax=750):
#     x=random.randint(xmin,xmax)
#     click(x,10)
# def down(xmin=400,xmax=700):
#     x=random.randint(xmin,xmax)
#     click(x,1418)
# def left(ymin=280,ymax=600):
#     y=random.randint(ymin,ymax)
#     click(10,y)
# def right(ymin=280,ymax=600):
#     y=random.randint(ymin,ymax)
#     click(1110,y)


def upswip(xmin=470, xmax=1050, ymin=400, ymax=700):
    x = random.randint(xmin, xmax)
    y1 = random.randint(ymin, ymax - 200)  # Assure une différence de 200 pixels
    y2 = y1 + 250
    swipe(x, y1, x, y2)
    print("Je monte en haut")

def downswip(xmin=900, xmax=1100, ymin=400, ymax=600):
    x = random.randint(xmin, xmax)
    y2 = random.randint(ymin, ymax - 200)  # Assure une différence de 200 pixels
    y1 = y2 + 250
    swipe(x, y1, x, y2)
    print("Je vais en bas")

def leftswip(xmin=900, xmax=1400, ymin=500, ymax=800):
    y = random.randint(ymin, ymax)
    x1 = random.randint(xmin, xmax - 200)  # Assure une différence de 200 pixels
    x2 = x1 + 250
    swipe(x1, y, x2, y)
    print("Je tourne a gauche")


def rightswip(xmin=700, xmax=1000, ymin=700, ymax=900):
    y = random.randint(ymin, ymax)
    x2 = random.randint(xmin, xmax - 200)  # Assure une différence de 200 pixels
    x1 = x2 + 250
    swipe(x1, y, x2, y)
    print("Je tourne a droite")


def moveFromTo(Fromimage,Toimage, duration=500):
    Fromx,Fromy=Find(Fromimage,0.8)
    Tox,Toy=Find(Toimage,0.8)
    android_device.device.shell(f"input swipe {Fromx} {Fromy} {Tox} {Toy} {duration}")
    print(f"Swipe from {Fromimage} to {Toimage} with duration {duration} ms")

    #clt.control.swipe(Fromx,Fromy,Tox,Toy,move_steps_delay=0.007)

def swipe(x1, y1, x2, y2, duration=500):
    #self.android_device.control.swipe(Fromx,Fromy,Tox,Toy,move_step_length=5,move_steps_delay=.002)
    #self.device.swipe(Fromx,Fromy,Tox,Toy,2)
    android_device.device.shell2(f"input swipe {x1} {y1} {x2} {y2} {duration}")

def write(text):
    android_device.write(text)



def FindAndClickTrue(images,conf,region=None):

    for i in range(len(images)):
        cord=android_device.locate_center_on_screen(images[i], confidence=conf,region=region)
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
        # up()
        #checkpopup()
        #captcha()
        # if x:
        #     if_find_click("images/xx.png",0.85)
        time.sleep(0.2)
        image_center = android_device.locate_center_on_screen(image, confidence=conf,region=region)
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
        image_center = android_device.locate_center_on_screen(image, confidence=conf,region=region)
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
    # if_find_click("x.png",0.82)
    cord=android_device.locate_center_on_screen(image, confidence=conf,region=region)
    time.sleep(0.15)
    if cord!= None:
        x,y=cord
        print("i can see "+image)
        return x,y
    else:
        print("i cant see "+image)
        return False
def Findd0(image,conf,region=None): #Findd
    #if_find_click("x.png",0.82)
    cord=android_device.locate_center_on_screen(image, confidence=conf,region=region)
    time.sleep(0.15)
    if cord!= None:
        x,y=cord
        print("i can see "+image)
        return x,y
    else:
        print("i cant see "+image)
        return False
def Finddd(image, conf, region=None): #none
    cord = android_device.locate_center_on_screen(image, confidence=conf, region=region)
    if cord is not None:
        x, y = cord
        print("I can see " + image)
        return x, y  # Retourne les coordonnées si l'image est trouvée
    else:
        print("I can't see " + image)
        return None  # Retourne None si l'image n'est pas trouvée
def Findddd(image, conf, region=None): #none
    cord = android_device.locate_center_on_screen(image, confidence=conf, region=region)
    if cord is not None:
        x, y = cord
        print("I can see " + image)
    else:
        print("I can't see " + image)
        x, y = None, None  # Assigner None à x et y si l'image n'est pas trouvée
    return x, y
def Findtf(image,conf,region=None):
    cord=android_device.locate_center_on_screen(image, confidence=conf,region=region)

    if cord!= None:

        print("i can see "+image)

        return True
    else:
        print("i cant see "+image)
        return False

def Findtfmultiple(images,conf,region=None):
    for image in images:
        cord=android_device.locate_center_on_screen(image, confidence=conf,region=region)
        if cord!= None:

            print("i can see "+image)

            return True

    print("i cant see images")
    return False


def Finddoubleclick(image,conf,region=None):
    while True:
        cord=android_device.locate_center_on_screen(image, confidence=conf,region=region)

        if cord!= None:
            x,y=cord
            print("i can see "+image)
            doubleclick(x,y)
            return
        else:
            print("i cant see "+image)
def FindAndDoubleClick(images,conf,region=None):
    while True:
        for image in images:
            image_center = android_device.locate_center_on_screen(image, confidence=conf,region=region)

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
def FindAndDoubleClickAvoid(images, conf, region=None):
    avoid_rectangle = {
        'top_left': (650, 860),
        'bottom_right': (737, 897)
    }

    while True:
        for image in images:
            while True:
                start_time = time.time()
                image_center = android_device.locate_center_on_screen(image, confidence=conf, region=region)

                if image_center is not None:
                    x, y = image_center
                    if not (avoid_rectangle['top_left'][0] <= x <= avoid_rectangle['bottom_right'][0] and
                            avoid_rectangle['top_left'][1] <= y <= avoid_rectangle['bottom_right'][1]):
                        click(x, y)
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
    results = {image: android_device.locate_center_on_screen(image, confidence=conf, region=region) for image in images}

    return results
def Findmulti(images,conf, region=None):
    # Search for the image until it is found
    while True:
        time.sleep(0.2)
        for image in images:
            image_center = android_device.locate_center_on_screen(image, confidence=conf,region=region)
            print(image)
            if image_center is not None:
                x,y=image_center
                print(f"Image {image} détectée à la position (x, y) : ({x}, {y}) avec une confiance de {conf}")
                return x,y
            else:
                # Take a break between searches
                print(f"Image {image} non détectée avec une confiance de {conf}")
def Find0AllImages(images, conf, region=None):
    time.sleep(0.2)
    # Search for all occurrences of images
    results = {}
    for image in images:
        all_positions = android_device.locate_center_all_on_screen(image, confidence=conf, region=region)
        if all_positions:
            results[image] = all_positions

    return results
def Finddd0AllImages(image, conf, region=None):
    time.sleep(0.2)
    all_positions = android_device.locate_center_all_on_screen(image, confidence=conf, region=region)
    if all_positions is not None:
        return all_positions
    else:
        return []
def FindPosClick(image, conf, region=None, xp=0, yp=0, max_attempts=40):#avec x+captcha
    consecutive_failures = 0
    
    while True:
        # up()
        if_find_click("x.png",0.82,region=(1100,116,490,450))
        time.sleep(0.2)
        # if_find_click("images/x.png",0.82,region=(940,90,60,60))
        image_center = android_device.locate_center_on_screen(image, confidence=conf, region=region)

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
                pygame.mixer.Sound("piano.mp3").play()  # Jouez le son après 10 tentatives consécutives sans image
                print("Playing alarm sound")
                time.sleep(10)  # Attendre 0.2 minutes (10 secondes) avant de reprendre les recherches
                consecutive_failures = 0  # Réinitialiser le compteur d'échecs

def FindPosClick0(image, conf, region=None, xp=0, yp=0, max_attempts=40):#sans x
    consecutive_failures = 0
    while True:
        # if_find_click("x.png",0.82)
        # if_find_click("images/x.png",0.82,region=(940,90,60,60))
        up()
        time.sleep(0.2)
        image_center = android_device.locate_center_on_screen(image, confidence=conf, region=region)

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
                pygame.mixer.Sound("piano.mp3").play()  # Jouez le son après 10 tentatives consécutives sans image
                print("Playing alarm sound")
                time.sleep(10)  # Attendre 0.2 minutes (10 secondes) avant de reprendre les recherches
                consecutive_failures = 0  # Réinitialiser le compteur d'échecs
def FindPosClickList(images, conf, region=None, xp=0, yp=0):
    for image in images:
            image_center = android_device.locate_center_on_screen(image, confidence=conf, region=region)
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

def FinddPosClickList(images, conf, region=None):
    while True:
        for image in images:
            image_center = android_device.locate_center_on_screen(image, confidence=conf, region=region)
            if image_center is not None:
                x, y = image_center
                print("Je vois et je clique sur l'" + image)
                # Clique sur le centre de l'image
                click(x, y)
                return  # Stop the function once an image is found and clicked
            else:
                # Pause entre les recherches
                print("Je n'arrive pas à voir l'image " + image + ", je continue à chercher.")
                if Findd0("victoire.png", 0.7):
                    niveau()
                    break
        time.sleep(0.2)  # Pause entre les itérations de la boucle principale

def FindPosClickCombat(image,conf, region=None,xp=0,yp=0):
    time.sleep(0.3)
    while True:
        if Findd0("erreur_dc.png",0.82):
            dc ()
        image_center = android_device.locate_center_on_screen(image, confidence=conf,region=region)
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
                niveau()
                break

def if_find_click(image,conf, region=None):
        image_center = android_device.locate_center_on_screen(image, confidence=conf,region=region)
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

    cord=android_device.locate_center_on_screen(image, confidence=conf,region=region)

    if cord!= None:
        print("i can see "+image)
        return True
    else:
        print("i cant see "+image)
        return False

def findPosClickinrangebellowInList(images, confi):
    time.sleep(0.2)
        #------------------------
    for i in range(len(images)):
        image_center = android_device.locate_center_on_screen(images[i], confidence=confi, region=(351,507, 200, 120))
        if image_center is not None:
            x,y=image_center
            print("i can see "+images[i])
            return True
    else:
        # Take a break between searches
        print("i cant see "+images[i])
        return False

# ClickProlonge removed - use long_press_image instead
def long_press_image(image_path, duration_ms=1000, confidence=0.8):
    """Long press on an image. Replaces ClickProlonge."""
    cord = android_device.locate_center_on_screen(image_path, confidence)
    if cord is not None:
        x, y = cord
        # Simuler un appui long
        android_device.device.shell(f"input swipe {x} {y} {x} {y} {duration_ms}")
        print(f"Appui long sur {image_path}")
    else:
        print(f"L'image {image_path} n'a pas été trouvée.")

def connect(j,ndc,mdp,conf):
    time.sleep(0.5)

    FindPosClick('Dopeul/jouer.png',0.90)
    time.sleep(12)
    if(FindTF('Dopeul/chrome_1.png',0.8)==True):
        FindPosClick('Dopeul/chrome_1.png',0.90)
        time.sleep(.2)
        FindPosClick('Dopeul/chrome_2.png',0.90)
        time.sleep(1)
        FindPosClick('Dopeul/chrome_3.png',0.90)
        time.sleep(5)
    if(FindTF('Dopeul/chrome_4.png',0.8)==True):
        FindPosClick('Dopeul/chrome_4.png',0.90)
        time.sleep(5)
    if(FindTF('Dopeul/chrome_5.png',0.8)==True):
        FindPosClick('Dopeul/chrome_5.png',0.90)
        time.sleep(5)
    Find('Dopeul/ndc.png',0.9)
    x,y=Find('Dopeul/ndc.png',0.9)
    click(x,y+10)
    time.sleep(3)
    write(ndc[j])
    time.sleep(0.5)
    entre()
    write(mdp[j])
    time.sleep(0.5)
    entre()
    time.sleep(4)
    if(FindTF('Dopeul/ok_continuer.png',0.8)==True):
        FindPosClick('Dopeul/ok_continuer.png',0.90)
        time.sleep(2)
    if(FindTF('Dopeul/ok_continuer1.png',0.8)==True):
        FindPosClick('Dopeul/ok_continuer1.png',0.90)
        time.sleep(2)
    android_device.swipe(1700, 900, 1700, 300)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick('Dopeul/continuer.png',0.90)
    time.sleep(2)
    FindPosClick('Dopeul/pascettefois.png',0.90)
    time.sleep(1)

    time.sleep(10)
    logging.info(ndc[j])
    refresh()

def connect_save(j,ndc,mdp,conf):
    time.sleep(0.5)

    FindPosClick('Dopeul/jouer.png',0.90)
    time.sleep(12)
    if(FindTF('Dopeul/chrome_1.png',0.8)==True):
        FindPosClick('Dopeul/chrome_1.png',0.90)
        time.sleep(.2)
        FindPosClick('Dopeul/chrome_2.png',0.90)
        time.sleep(1)
        FindPosClick('Dopeul/chrome_3.png',0.90)
        time.sleep(5)
    if(FindTF('Dopeul/chrome_4.png',0.8)==True):
        FindPosClick('Dopeul/chrome_4.png',0.90)
        time.sleep(5)
    if(FindTF('Dopeul/chrome_5.png',0.8)==True):
        FindPosClick('Dopeul/chrome_5.png',0.90)
        time.sleep(5)
    if(FindTF('images/chrome_6.png',0.8)==True):
        FindPosClick('images/chrome_6.png',0.90)
        time.sleep(5)
    Findmulti(['Dopeul/ndc.png','Dopeul/ndc1.png'],0.8)
    x,y=Findmulti(['Dopeul/ndc.png','Dopeul/ndc1.png'],0.8)
    click(x,y+10)
    time.sleep(3)
    write(ndc[j])
    time.sleep(0.5)
    entre()
    write(mdp[j])
    time.sleep(0.5)
    entre()
    time.sleep(4)
    if(FindTF('Dopeul/ok_continuer.png',0.8)==True):
        FindPosClick('Dopeul/ok_continuer.png',0.90)
        time.sleep(2)
    if(FindTF('Dopeul/ok_continuer1.png',0.8)==True):
        FindPosClick('Dopeul/ok_continuer1.png',0.90)
        time.sleep(2)
    android_device.swipe(1700, 900, 1700, 300)
    time.sleep(random.uniform(0.2,0.4))
    FinddPosClickList(['Dopeul/continuer.png','Dopeul/continuer1.png','Dopeul/continuer2.png'],0.80)
    time.sleep(2)
    time.sleep(2)
    FinddPosClickList(["Dopeul/valider.png", "Dopeul/valider1.png","Dopeul/valider2.png"],0.8)
    time.sleep(10)
    logging.info(ndc[j])
    if(FindTF("poscompte.png",0.85)):
        refresh()
        time.sleep(7)


def clear_cache():
    android_device.clear_chrome_cache()
    print("Clear Cache de Chrome...")
    time.sleep(1)
def screen_off():
        android_device.screen_off()

def mode_avion():
    print("Activation du mode avion...")
    android_device.airplane_on()
    time.sleep(1)
    print("Mode avion activé.")
    print("Désactivation du mode avion...")
    android_device.airplane_off()
    time.sleep(4)
    print("Mode avion désactivé.")
def niveau():
    if Findd('niveau.png',0.8):
        time.sleep(0.3)
        echap()
def persochange():
    while(FindTF('list.png',0.8)==False):
        echap()
        time.sleep(.8)

    x,y=Find('list.png',0.8)
    click(x,y)
    time.sleep(0.5)
    click(x-180,y+370)

def disconnect():
    while(FindTF('deconnecter.png',0.8)==False):
        echap()
        time.sleep(0.8)
    FindPosClick0('deconnecter.png',0.85)
    time.sleep(0.5)
    FindPosClick0('oui.png',0.85)
    time.sleep(6)
    # mode_avion()
    # clear_cache()
    # android_device.restart()
def disconnect_save():
    while(FindTF('deconnecter.png',0.8)==False):
        echap()
        time.sleep(0.8)
    FindPosClick0('deconnecter.png',0.85)
    time.sleep(0.5)
    FindPosClick0('oui.png',0.85)
    time.sleep(6)
    FindPosClick('me_deconnecter.png',0.8)
    time.sleep(0.5)
    mode_avion()
    # clear_cache()
    # android_device.restart()
def up():
    result = Findd('niveau.png', 0.8)
    if result:
        if isinstance(result, tuple) and len(result) == 2:  # Vérifie si le résultat est un tuple de coordonnées valide
            x, y = result
            time.sleep(random.uniform(0.3, 0.5))
            click(x + 480, y)
            time.sleep(random.uniform(0.3, 0.5))
        else:
            print("Résultat invalide de la fonction Findd :", result)
    else:
        print("Image 'niveau.png' non trouvée.")

def dc ():
    if(FindTF('erreur_dc.png',0.8)==True):
        FindPosClick0('ok_erreur.png',0.8)
        time.sleep(random.uniform(0.5,0.8))
        FindPosClick0('jouer.png',0.8)
        time.sleep(random.uniform(2.5,4.8))
        FindPosClick0('ok_erreur.png',0.8)
        time.sleep(random.uniform(2.5,4.8))

def pop_nouveau():
    if Findd('nouveau.png',0.8):
        time.sleep(random.uniform(0.3,0.7))
        echap()
        time.sleep(random.uniform(0.3,0.7))
def refresh():
    android_device.device.shell("input keyevent KEYCODE_HOME")
    time.sleep(1)
    android_device.device.shell(f"monkey -p com.ankama.dofustouch -c android.intent.category.LAUNCHER 1")
def coffre():
    if(FindTF('x.png',0.8)==True):
        echap()
    while(FindTF('coffre.png',0.8)==True):
        FindPosClick0('coffre.png',0.8)
        time.sleep(0.7)

        FindPosClick0('tout_accepter.png',0.8)
        time.sleep(3)
        if(FindTF('x.png',0.8)==True):
            echap()
def option():
    mode_creature()
    deplacement()
    reglage()
    chat()
def echange():
    if Findd('ouiechange.png',0.8):
        time.sleep(random.uniform(0.3,0.7))
        FindPosClick('ouiechange.png',0.8)
        time.sleep(random.uniform(3,6))
        echap()
        time.sleep(random.uniform(0.3,0.7))
# def up():
#     result = Findd('niveau.png', 0.8)
#     if result:
#         if isinstance(result, tuple) and len(result) == 2:  # Vérifie si le résultat est un tuple de coordonnées valide
#             x, y = result
#             time.sleep(random.uniform(0.3, 0.5))
#             click(x + 480, y)
#             time.sleep(random.uniform(0.3, 0.5))
#         else:
#             print("Résultat invalide de la fonction Findd :", result)
#     else:
#         print("Image 'niveau.png' non trouvée.")
def pack():
    if(FindTF('pack.png',0.8)==True):
        time.sleep(random.uniform(0.3,0.7))
        echap()
    if(FindTF('interface.png',0.8)==True):
        time.sleep(random.uniform(0.3,0.7))
        echap()

def load_excel_data(excel_file, sheet_name):
    """
    Charge et surveille les modifications du fichier Excel en continu.
    """
    while True:
        try:
            df = pd.read_excel(excel_file, sheet_name=sheet_name, engine='openpyxl')
            if {'ndc', 'mdp'}.issubset(df.columns):
                ndc = df['ndc'].dropna().astype(str).tolist()
                mdp = df['mdp'].dropna().astype(str).tolist()
                return ndc, mdp
            else:
                logging.error("Colonnes requises absentes dans la feuille.")
        except Exception as e:
            logging.error(f"Erreur lors du chargement du fichier Excel : {e}")
        time.sleep(5)  # Rafraîchir les données toutes les 5 secondes

def question():
    if Findd('Albuela2\question.png',0.8):
        time.sleep(random.uniform(0.3,0.7))
        FindPosClick('Albuela2\q2.png',0.8)
        time.sleep(random.uniform(0.3,0.6))
        echap()
        time.sleep(random.uniform(0.3,0.7))
def drop():
     if Findd('Astrub/Piounette/check_4.png',0.8):
        time.sleep(random.uniform(0.3,0.7))
        long_press_image('Astrub/Piounette/check_5.png', duration_ms=500, confidence=0.8)
        time.sleep(random.uniform(0.3,0.6))
        echap()
def afterconnect(i,x,n):
    logging.info("personnage number : "+str(x))
    if(x!=0):
        persochange()
        time.sleep(5)
    for i in range (0,n):
        souvegarde()

    for i in range (0,n):
        refresh()
    for i in range (0,n):

        #cadeau()
        checksucce()
        checkpopup()
def echap():
    device.shell("input keyevent KEYCODE_BACK")
def captcha():
    if Findd('captcha.png',0.8):
            time.sleep(random.uniform(0.3,0.7))
            FindPosClick0('ok_captcha.png',0.8)
            pygame.mixer.Sound("captcha.mp3").play()
            print("Playing Captcha sound")
            time.sleep(random.uniform(3,6))
def mode_creature():
    if(FindTF('creature.png',0.85)==True):
        FindPosClick('creature.png',0.85)     
def invisible():
    FindPosClick('tire.png',0.8)  
    time.sleep(random.uniform(0.3,0.6))
    if(FindTF('invisible.png',0.85)==True):
        FindPosClick('invisible.png',0.85)      
def chat():
    FindPosClick('chat.png',0.8)  
    time.sleep(random.uniform(0.3,0.6))
    if(FindTF('chat1.png',0.85)==True):
        FindPosClick('chat1.png',0.85) 
        time.sleep(random.uniform(0.3,0.6))
        echap()
        time.sleep(random.uniform(0.3,0.6))
        echap()
        time.sleep(random.uniform(0.3,0.6))
    else:
        echap()
        time.sleep(random.uniform(0.3,0.6))
        FindPosClick('chat1.png',0.85)
        time.sleep(random.uniform(0.3,0.6)) 
        echap()
        time.sleep(random.uniform(0.3,0.6))
def pdv():
     while True:
        if Findd("pdv.png", 0.86) == False:
            print("Je m'assoie pour rechagrer mes PDV.")
            FindPosClick("emote.png",0.8)
            time.sleep(random.uniform(0.2,0.4))
            FindPosClick("emote1.png",0.8)
            time.sleep(random.uniform(0.2,0.4))
            FindPosClick("sit.png",0.8)
            time.sleep(20)  # Attendre 200 secondes
        else:
            print("Tous mes PDV snt remplies.")
            break  # Sortir de la boucle lorsque "pdv.png" est trouvé

def Sleep():
    sleep_duration = random.uniform(1, 20)
    print(f"Attente pendant {sleep_duration} secondes")
    time.sleep(sleep_duration)

    # Si le temps d'attente est supérieur à 40 secondes, effectue un clic aléatoire
    if sleep_duration > 15:
        positions = [(893, 850), (650, 980), (790, 870), (650, 750), (950, 650), (690, 870)]
        random_position = random.choice(positions)
        click(*random_position)
        print(f"Clic effectué en position {random_position}")
        time.sleep(random.uniform(3,7))

def deplacement():
    echap()
    FindPosClick0('option.png',0.8)
    FindPosClick0('combat.png',0.8)
    time.sleep(random.uniform(0.1,0.2))
    FindPosClick0('animation.png',0.8)
    time.sleep(random.uniform(0.1,0.2))
    FindPosClick0('deplacement.png',0.8)
    swipe(1785, 848, 1785, 283, duration=500)
    time.sleep(random.uniform(0.3,0.5))
    FindPosClick0('tjr.png',0.8)
    time.sleep(random.uniform(0.5,0.8))
    FindPosClick0('jamais.png',0.8)
    time.sleep(random.uniform(0.5,0.8))
    FindPosClick0('tjr.png',0.8)
    time.sleep(random.uniform(0.5,0.8))
    FindPosClick0('jamais1.png',0.8)
    time.sleep(random.uniform(0.5,0.8))
    echap()
    time.sleep(random.uniform(0.5,0.8))
    click(1789,36)
    time.sleep(random.uniform(0.2,0.4))
    click(1789,36)
def groupe():
    echap()
    FindPosClick0('option.png',0.8)
    FindPosClick0('afficher.png',0.8)
    time.sleep(random.uniform(0.3,0.5))
    echap()
def caracteristique():
    FindPosClick0('caracteristique.png',0.8)
    time.sleep(random.uniform(0.4,0.6))
    x,y=Find("force.png",0.82)
    doubleclick(x+394,y)
    time.sleep(random.uniform(0.4,0.6))
    FindPosClick0('fleche1.png',0.8)
    long_press_image("fleche1.png", duration_ms=8000, confidence=0.8)
    time.sleep(random.uniform(0.4,0.6))
    FindPosClick0('valider1.png',0.8)
    time.sleep(random.uniform(0.4,0.6))
    echap()
    if_find_click("x.png",0.82)
def boost():
    FindPosClick0('sort.png',0.8)
    time.sleep(random.uniform(0.4,0.6))
    print("Swip sort")
    swipe(x1=463, y1=605, x2=463, y2=941, duration=500)
    time.sleep(random.uniform(0.4,0.6))
    x,y=Find("rempart.png",0.8, region=(37,103,1200,700))
    time.sleep(random.uniform(0.2, 0.4))
    for _ in range(2): 
        click(x+566,y)
        time.sleep(random.uniform(0.4, 0.7))
            # click(x+566,y+215) #bouclier
    FindPosClick0('valider.png',0.8)
    time.sleep(random.uniform(0.2, 0.4))
    FindPosClick0('oui.png',0.8)
    time.sleep(random.uniform(0.4, 0.7))
    echap()
def reglage():
    FindPosClick('emote00.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick0('sort.png',0.8)
    time.sleep(random.uniform(0.4,0.6))
    FindPosClick('ronce.png',0.8,region=(1598,116,400,600))
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick('retirer.png',0.8)
    time.sleep(random.uniform(0.2,0.4))
    print("Swip sort")
    swipe(x1=463, y1=605, x2=463, y2=941, duration=500)
    time.sleep(random.uniform(0.4,0.6))
    swipe(x1=228, y1=416, x2=2131, y2=275, duration=500)
    time.sleep(random.uniform(0.4,0.6))
    echap()
    FindPosClick("emote0.png",0.8)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick("emote.png",0.8)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick("emote1.png",0.8)
    time.sleep(random.uniform(0.2,0.4))
    swipe(x1=679, y1=993, x2=2117, y2=623, duration=700)
    time.sleep(random.uniform(0.2,0.4))
    FindPosClick("emote.png",0.8)
def log_elapsed_time(step_name, start_time):
    elapsed_time = time.time() - start_time
    minutes, seconds = divmod(elapsed_time, 60)
    logging.info("Temps écoulé pour {}: {} minutes et {} secondes".format(step_name, int(minutes), int(seconds)))

def execute_step(step_name, function):
    start_time = time.time()
    function()
    log_elapsed_time(step_name, start_time)

def sort(groupes_monstres):
    
    monstres = ["Corp/monstre_1.png","Corp/monstre_2.png","Corp/monstre_3.png","Corp/monstre_4.png",]

    fecas = ["Corp/feca_1.png","Corp/feca_2.png","Corp/feca_3.png","Corp/feca_4.png"]
    FindPosClickCombat('ronce.png', 0.7)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    proche_position = monstre_proche(monstres, feca_positions)
    if proche_position:
        x, y = proche_position
        click(x, y)  
        time.sleep(random.uniform(0.5, 0.7))
    elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
        for groupe, images in groupes_monstres.items():
            for image in images:
                if Finddd(image, 0.85):
                    FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                    break
def positions_feca(fecas_images):
    positions = []
    for feca_image in fecas_images:
        result = Finddd(feca_image, 0.95)
        print(f"Position de l'image {feca_image}: {result}")  # Ajoutez cette ligne pour afficher la position de l'image de sadi
        if result:
            positions.append(result)
    return positions


def red_proche(monstre_start):
    distances = {}
    
    # Trouver la position de chaque monstre
    for monstre_objet in monstre_start:
        monstre_positions = Finddd0AllImages(monstre_objet, 0.86)
        if monstre_positions:
            print("Positions du monstre trouvées :", monstre_positions)
            
            # Trouver la position de toutes les images red à l'écran
            red_positions = Find0AllImages(["red.png"], 0.96)
            if red_positions:
                print("Positions des red.png trouvées :", red_positions)
                
                # Calculer la distance entre chaque monstre et chaque image red
                for monstre_position in monstre_positions:
                    monstre_x, monstre_y = monstre_position
                    for red_image, red_centers in red_positions.items():
                        for red_center in red_centers:
                            red_x, red_y = red_center
                            distance = ((red_x - monstre_x) ** 2 + (red_y - monstre_y) ** 2) ** 0.5
                            distances[(monstre_x, monstre_y, red_x, red_y)] = min(distances.get((monstre_x, monstre_y, red_x, red_y), float('inf')), distance)

    # Trouver l'image red la plus proche de chaque monstre
    if distances:
        red_proche = min(distances, key=distances.get)
        print("Position de l'image red la plus proche de chaque monstre :", red_proche)
        # Cliquer sur l'image red la plus proche de chaque monstre
        click(red_proche[2], red_proche[3])
    else:
        print("Aucune position d'image red trouvée pour aucun monstre.")

    
def red_loin(monstre_start):
    distances = {}
    
    # Trouver la position de chaque monstre
    for monstre_objet in monstre_start:
        monstre_positions = Finddd0AllImages(monstre_objet, 0.86)
        if monstre_positions:
            print("Positions du monstre trouvées :", monstre_positions)
            
            # Trouver la position de toutes les images red à l'écran
            red_positions = Find0AllImages(["red.png"], 0.96)
            if red_positions:
                print("Positions des red.png trouvées :", red_positions)
                
                # Calculer la distance entre chaque monstre et chaque image red
                for monstre_position in monstre_positions:
                    monstre_x, monstre_y = monstre_position
                    for red_image, red_centers in red_positions.items():
                        for red_center in red_centers:
                            red_x, red_y = red_center
                            distance = ((red_x - monstre_x) ** 2 + (red_y - monstre_y) ** 2) ** 0.5
                            distances[(monstre_x, monstre_y, red_x, red_y)] = max(distances.get((monstre_x, monstre_y, red_x, red_y), float('-inf')), distance)

    # Trouver l'image red la plus éloignée de chaque monstre
    if distances:
        red_loin = max(distances, key=distances.get)
        print("Position de l'image red la plus éloignée de chaque monstre :", red_loin)
        # Cliquer sur l'image red la plus éloignée de chaque monstre
        click(red_loin[2], red_loin[3])
    else:
        print("Aucune position d'image red trouvée pour aucun monstre.")

  
def position_glyphe(feca_position, monstre_position, max_glyphe_bad, max_glyphe_gauche, max_glyphe_droite, max_glyphe_haut):
    feca_x, feca_y = feca_position
    monstre_x, monstre_y = monstre_position
    
    # Calcul des décalages par rapport au Féca
    decalage_x = monstre_x - feca_x
    decalage_y = monstre_y - feca_y
    
    # Vérification de la distance entre le monstre et le Féca
    distance = ((decalage_x) ** 2 + (decalage_y) ** 2) ** 0.5
    if distance > 600:
        return None
    
    # Calcul de la position de la glyphe en fonction du côté du monstre par rapport au Féca
    if decalage_y > 0 and abs(decalage_y) > abs(decalage_x):
        glyphe_x = max_glyphe_bad
        glyphe_y = feca_y + 145
    elif decalage_x < 0 and abs(decalage_x) > abs(decalage_y):
        glyphe_x = max_glyphe_gauche
        glyphe_y = feca_y
    elif decalage_x > 0 and abs(decalage_x) > abs(decalage_y):
        glyphe_x = max_glyphe_droite
        glyphe_y = feca_y
    else:
        glyphe_x = max_glyphe_haut
        glyphe_y = feca_y + 277
        
    return (glyphe_x + 1334) / 2, (glyphe_y + 782) / 2


def place_glyphe(glyphe_position):
    if glyphe_position:
        click(glyphe_position[0], glyphe_position[1])
    else:
        print("Le monstre est trop loin pour placer la glyphe.")

def positions_glyphes(position_feca):
    x_feca, y_feca = position_feca
    
    # Positions de la glyphe par rapport à la position du personnage Feca
    max_glyphe_bad = (x_feca + 267, y_feca + 145)  # Côté bas
    max_glyphe_gauche = (x_feca - 267, y_feca + 145)  # Côté gauche
    max_glyphe_droite = (x_feca + 170, y_feca - 193)  # Côté droit
    max_glyphe_haut = (x_feca - 396, y_feca - 185)  # Côté haut
    
    return max_glyphe_bad, max_glyphe_gauche, max_glyphe_droite, max_glyphe_haut

def monstre_proche(monstres, positions, radius=300):
    distances = {}
    for monstre_objet in monstres:
        monstre_position = Finddd(monstre_objet, 0.86)
        if monstre_position:
            for feca_x, feca_y in positions:
                monstre_x, monstre_y = monstre_position
                if check_monster_position(monstre_x, monstre_y, feca_x, feca_y, radius):
                    distance = ((feca_x - monstre_x) ** 2 + (feca_y - monstre_y) ** 2) ** 0.50
                    distances[(monstre_x, monstre_y)] = min(distances.get((monstre_x, monstre_y), float('inf')), distance)

    if distances:
        proche_position = min(distances, key=distances.get)
        return proche_position  
    else:
        return None
def monstre_proche_glyphe(monstres, monstres_sans, positions, radius=300):
    distances = {}
    for monstre_objet in monstres + monstres_sans:
        monstre_position = Finddd(monstre_objet, 0.82)
        if monstre_position:
            for feca_x, feca_y in positions:
                monstre_x, monstre_y = monstre_position
                if check_monster_position(monstre_x, monstre_y, feca_x, feca_y, radius):
                    distance = ((feca_x - monstre_x) ** 2 + (feca_y - monstre_y) ** 2) ** 0.50
                    distances[(monstre_x, monstre_y)] = min(distances.get((monstre_x, monstre_y), float('inf')), distance)

    if distances:
        proche_position = min(distances, key=distances.get)
        return proche_position  
    else:
        return None
def check_monster_position(monstre_x, monstre_y, feca_x, feca_y, radius):
    distance_squared = (monstre_x - feca_x) ** 2 + (monstre_y - feca_y) ** 2
    return distance_squared <= radius ** 2

def deplacement_oppose(feca_position, monstre_position):
    feca_x, feca_y = feca_position
    monstre_x, monstre_y = monstre_position
    distance_proche = ((monstre_x - feca_x) ** 2 + (monstre_y - feca_y) ** 2) ** 0.5
    
    # Vérification pour éviter la division par zéro
    if distance_proche != 0:
        dx = 40 * (feca_x - monstre_x) / distance_proche
        dy = 40 * (feca_y - monstre_y) / distance_proche
        return dx, dy
    else:
        # Si la distance est égale à zéro, retournez 0, 0 pour éviter la division par zéro
        return 0, 0

def deplacer(position_feca, positions_monstres, position_proche, portee_min=600, portee_approche=800, distance_cercle=40):
    if not positions_monstres:
        print("Aucun monstre en vue. Le Sadida reste immobile.")
        return 0, 0

    feca_x, feca_y = position_feca
    print(f"Position actuelle du Sadida : ({feca_x}, {feca_y})")

    if position_proche:
        print("Un monstre s'approche du Sadida.")

        # Calcul de la distance entre le Sadida et le monstre proche
        distance_proche = ((position_proche[0] - feca_x) ** 2 + (position_proche[1] - feca_y) ** 2) ** 0.5

        if distance_proche > portee_min:  # Monstre éloigné
            print("Le monstre est trop loin pour être attaqué.")
            # Déplacement du Sadida vers le monstre proche
            dx, dy = position_proche[0] - feca_x, position_proche[1] - feca_y
            print(f"Le Sadida se déplace vers le monstre : ({dx}, {dy})")
            return dx, dy

        elif distance_proche <= portee_min:  # Monstre à portée minimale
            print("Le monstre est à portée minimale du Sadida.")
            print("Le Sadida préfère rester à sa position actuelle.")
            return 0, 0

    elif positions_monstres:  # Au moins un monstre détecté
        print("Des monstres sont présents dans les environs.")
        print(f"Le Sadida se déplace de {distance_cercle} pixels dans la direction opposée au monstre le plus proche.")

    # Calcul de la position opposée au monstre proche
    dx, dy = deplacement_oppose(position_feca, positions_monstres[0])
    # Calcul de la magnitude
    magnitude = (dx ** 2 + dy ** 2) ** 0.5
    
    # Vérification si la magnitude est différente de zéro avant de procéder à la normalisation
    if magnitude != 0:
        dx = dx * distance_cercle / magnitude
        dy = dy * distance_cercle / magnitude
        print(f"Le Sadida se déplace stratégiquement : ({dx}, {dy})")
        return dx, dy
    else:
        print("Le monstre proche est juste à côté, aucun déplacement nécessaire.")
        return 0, 0
####################################################################################COMBAT##################################
def UP_Perso(monstres_a_combattre):
    while(Findtf("pret.png",0.7)==False):
        for monster, images in monstres_a_combattre.items():
            for image in images:
                if Findd(image, 0.70):
                        Finddoubleclick(image, 0.70)
                        time.sleep(5)
    CombatUp(cadre_bourgade)



def combat_proche(groupes_monstres=None):  # Définition de la fonction avec groupes_monstres par défaut à None
    if groupes_monstres is None:  # Vérifier si l'argument groupes_monstres est None
        print("Aucun groupe de monstres fourni.")
        return
    
    monstre_images = []
    for groupe, images in groupes_monstres.items():
        monstre_images.extend(images)
      
    # Ajoutez votre code après la définition de la fonction combat
    fecas = ["Corp/feca_1.png","Corp/feca_2.png","Corp/feca_3.png","Corp/feca_4.png"]
    monstres = ["Corp/monstre_1.png","Corp/monstre_2.png","Corp/monstre_3.png","Corp/monstre_4.png","Corp/monstre_11.png","Corp/monstre_22.png","Corp/monstre_44.png","Corp/monstre_55.png","Corp/monstre_66.png"]
    fecas_cadre = ["Corp/Cadre/cadre_feca.png","Corp/Cadre/cadre_feca_albuera.png"]
    monstre_start = ["Corp/monstre_start_1.png","Corp/monstre_start_2.png","Corp/monstre_start_3.png","Corp/monstre_start_4.png","Corp/monstre_start_5.png"]
    red_proche(monstre_start)
    FindPosClick('pret.png', 0.8)
    time.sleep(2)
    
    while True:
        if Findd0("atoidejouer.png", 0.8):
            time.sleep(random.uniform(0.5, 0.8))
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                image_trouvee = False
                for groupe, images in groupes_monstres.items():
                    if image_trouvee:
                        break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                    for image in images:
                        if Finddd(image, 0.85):
                            FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                            image_trouvee = True
                            break 
            if Findd0("bouclier.png", 0.8):
                FindPosClickCombat("bouclier.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                if feca_positions:
                    x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                    click(x, y)
                    time.sleep(random.uniform(0.5, 0.7))
                else:
                    # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                    for feca_image in fecas_cadre:
                        if Finddd(feca_image, 0.95):
                            FindPosClickCombat(feca_image,0.95)
                            break
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche(monstres, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))
                elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                    image_trouvee = False
                    for groupe, images in groupes_monstres.items():
                        if image_trouvee:
                            break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                        for image in images:
                            if Finddd(image, 0.85):
                                FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                                image_trouvee = True
                                break 
                            
            # Appel de la fonction deplacer_sadi même lorsque proche_position est fausse
            if feca_positions:  # Vérification si feca_positions n'est pas vide
                deplacer(feca_positions[0], feca_positions, proche_position)
            FindPosClickCombat("findetour.png", 0.8)
            time.sleep(random.uniform(0.5, 0.6))
        if Findd0("victoire.png", 0.8):
            up()
            pack()
            # pdv()
            break
        if Findd0("defaite.png", 0.8):
            # pdv()
            break

def combat_proche_glyphe(groupes_monstres=None):
    if groupes_monstres is None:  # Vérifier si l'argument groupes_monstres est None
        print("Aucun groupe de monstres fourni.")
        return
    
    monstre_images = []
    for groupe, images in groupes_monstres.items():
        monstre_images.extend(images)
      
    # Ajoutez votre code après la définition de la fonction combat
    fecas = ["Corp/feca_1.png","Corp/feca_2.png","Corp/feca_3.png","Corp/feca_4.png"]
    monstres = ["Corp/monstre_1.png","Corp/monstre_2.png","Corp/monstre_3.png","Corp/monstre_4.png","Corp/monstre_11.png","Corp/monstre_22.png","Corp/monstre_44.png","Corp/monstre_55.png","Corp/monstre_66.png"]
    fecas_cadre = ["Corp/Cadre/cadre_feca.png","Corp/Cadre/cadre_feca_albuera.png"]
    monstre_start = ["Corp/monstre_start_1.png","Corp/monstre_start_2.png","Corp/monstre_start_3.png","Corp/monstre_start_4.png","Corp/monstre_start_5.png"]
    red_proche(monstre_start)
    FindPosClick('pret.png', 0.8)
    time.sleep(2)
    
    while True:
        if Findd0("atoidejouer.png", 0.8):
            time.sleep(random.uniform(0.5, 0.8))
            if Findd0("glyphe.png", 0.8):
                FindPosClickCombat("glyphe.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                if feca_positions:
                    x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                    click(x, y)
                    time.sleep(random.uniform(0.5, 0.7))
                else:
                    # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                    for feca_image in fecas_cadre:
                        if Finddd(feca_image, 0.95):
                            FindPosClickCombat(feca_image,0.95)
                            break
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche(monstres, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))
                elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                    image_trouvee = False
                    for groupe, images in groupes_monstres.items():
                        if image_trouvee:
                            break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                        for image in images:
                            if Finddd(image, 0.85):
                                FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                                image_trouvee = True
                                break 
            if Findd0("bouclier.png", 0.8):
                FindPosClickCombat("bouclier.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                if feca_positions:
                    x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                    click(x, y)
                    time.sleep(random.uniform(0.5, 0.7))
                else:
                    # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                    for feca_image in fecas_cadre:
                        if Finddd(feca_image, 0.95):
                            FindPosClickCombat(feca_image,0.95)
                            break
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche(monstres, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))
                elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                    image_trouvee = False
                    for groupe, images in groupes_monstres.items():
                        if image_trouvee:
                            break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                        for image in images:
                            if Finddd(image, 0.85):
                                FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                                image_trouvee = True
                                break 
                            
            # Appel de la fonction deplacer_sadi même lorsque proche_position est fausse
            proche_position = None
            if feca_positions:  # Vérification si feca_positions n'est pas vide
                deplacer(feca_positions[0], feca_positions, proche_position)
            FindPosClickCombat("findetour.png", 0.8)
            time.sleep(random.uniform(0.5, 0.6))
        if Findd0("victoire.png", 0.8):
            up()
            pack()
            # pdv()
            break
        if Findd0("defaite.png", 0.8):
            # pdv()
            break


def combat_loin(groupes_monstres=None):  # Définition de la fonction avec groupes_monstres par défaut à None
    if groupes_monstres is None:  # Vérifier si l'argument groupes_monstres est None
        print("Aucun groupe de monstres fourni.")
        return
    
    monstre_images = []
    for groupe, images in groupes_monstres.items():
        monstre_images.extend(images)
      
    # Ajoutez votre code après la définition de la fonction combat
    fecas = ["Corp/feca_1.png","Corp/feca_2.png","Corp/feca_3.png","Corp/feca_4.png"]
    monstres = ["Corp/monstre_1.png","Corp/monstre_2.png","Corp/monstre_3.png","Corp/monstre_4.png","Corp/monstre_11.png","Corp/monstre_22.png","Corp/monstre_44.png","Corp/monstre_55.png","Corp/monstre_66.png"]
    fecas_cadre = ["Corp/Cadre/cadre_feca.png","Corp/Cadre/cadre_feca_albuera.png"]
    monstre_start = ["Corp/monstre_start_1.png","Corp/monstre_start_2.png","Corp/monstre_start_3.png","Corp/monstre_start_4.png","Corp/monstre_start_5.png"]
    red_loin(monstre_start)
    FindPosClick('pret.png', 0.8)
    time.sleep(2)
    
    while True:
        if Findd0("atoidejouer.png", 0.8):
            time.sleep(random.uniform(0.5, 0.8))
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                image_trouvee = False
                for groupe, images in groupes_monstres.items():
                    if image_trouvee:
                        break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                    for image in images:
                        if Finddd(image, 0.85):
                            FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                            image_trouvee = True
                            break 
            if Findd0("bouclier.png", 0.8):
                FindPosClickCombat("bouclier.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                if feca_positions:
                    x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                    click(x, y)
                    time.sleep(random.uniform(0.5, 0.7))
                else:
                    # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                    for feca_image in fecas_cadre:
                        if Finddd(feca_image, 0.95):
                            FindPosClickCombat(feca_image,0.95)
                            break
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche(monstres, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))
                elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                    image_trouvee = False
                    for groupe, images in groupes_monstres.items():
                        if image_trouvee:
                            break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                        for image in images:
                            if Finddd(image, 0.85):
                                FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                                image_trouvee = True
                                break 
                            
            # Appel de la fonction deplacer_sadi même lorsque proche_position est fausse
            if feca_positions:  # Vérification si feca_positions n'est pas vide
                deplacer(feca_positions[0], feca_positions, proche_position)
            time.sleep(random.uniform(0.5, 0.6))
            FindPosClickCombat("findetour.png", 0.8)
            time.sleep(random.uniform(0.5, 0.6))
        if Findd0("victoire.png", 0.8):
            up()
            pack()
            # pdv()
            break
        if Findd0("defaite.png", 0.8):
            # pdv()
            break
def testcombat(groupes_monstres=None):  # Définition de la fonction avec groupes_monstres par défaut à None
    if groupes_monstres is None:  # Vérifier si l'argument groupes_monstres est None
        print("Aucun groupe de monstres fourni.")
        return
    
    monstre_images = []
    for groupe, images in groupes_monstres.items():
        monstre_images.extend(images)
      
    # Ajoutez votre code après la définition de la fonction combat
    fecas = ["Corp/feca_1.png","Corp/feca_2.png","Corp/feca_3.png","Corp/feca_4.png"]
    monstres = ["Corp/monstre_1.png","Corp/monstre_2.png","Corp/monstre_3.png","Corp/monstre_4.png","Corp/monstre_11.png","Corp/monstre_22.png","Corp/monstre_44.png"]
    fecas_cadre = ["Corp/Cadre/cadre_feca.png","Corp/Cadre/cadre_feca_albuera.png","Corp/Cadre/cadre_feca_personnalise.png"]
    monstre_start = ["Corp/monstre_start_1.png","Corp/monstre_start_2.png","Corp/monstre_start_3.png","Corp/monstre_start_4.png","Corp/monstre_start_5.png","Corp/monstre_start_6.png"]
    monstre_sans = ["Corp/monstre_sans_1.png","Corp/monstre_sans_2.png","Corp/monstre_sans_3.png","Corp/monstre_sans_4.png","Corp/monstre_sans_5.png","Corp/monstre_sans_6.png"]
    # red_proche(monstre_start)
    click(1006,969)
    FindPosClick('pret.png', 0.8)
    time.sleep(2)
    
    while True :
        if FindCombat("atoidejouer.png", 0.8):##########################1
            time.sleep(random.uniform(0.5, 0.8))
            if Findd0("glyphe.png", 0.8):
                FindPosClickCombat('glyphe.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche_glyphe(monstres, monstre_sans, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))
            if Findd0("tp.png", 0.9):
                FindPosClickCombat('tp.png', 0.9)
                if proche_position:
                    x, y = proche_position
                    click(x + 40, y - 30)  # Clique sur x - 40, y + 50 si c'est un monstre_sans
                    time.sleep(random.uniform(0.5, 0.7))
            if Findd0("bouclier.png", 0.8):
                    FindPosClickCombat("bouclier.png", 0.8)
                    time.sleep(random.uniform(0.5, 0.7))
                    feca_positions = positions_feca(fecas)
                    if feca_positions:
                        x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                        click(x, y)
                        time.sleep(random.uniform(0.5, 0.7))
                    else:
                        # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                        for feca_image in fecas_cadre:
                            if Finddd(feca_image, 0.95):
                                FindPosClickCombat(feca_image,0.95)
                                break
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche(monstres, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))
                elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                    image_trouvee = False
                    for groupe, images in groupes_monstres.items():
                        if image_trouvee:
                            break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                        for image in images:
                            if Finddd(image, 0.85):
                                FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                                image_trouvee = True
                                break 
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                image_trouvee = False
                for groupe, images in groupes_monstres.items():
                    if image_trouvee:
                        break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                    for image in images:
                        if Finddd(image, 0.85):
                            FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                            image_trouvee = True
                            break 
            FindPosClickCombat("findetour.png", 0.8)  
            time.sleep(random.uniform(0.5, 0.6))
            FindCombat("atoidejouer.png", 0.8)##########################2
            time.sleep(random.uniform(0.5, 0.8))
            if Findd0("glyphe.png", 0.8):
                FindPosClickCombat('glyphe.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche_glyphe(monstres, monstre_sans, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))        
            if Findd0("agressif.png", 0.8):
                FindPosClickCombat('agressif.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                if feca_positions:
                    x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                    click(x, y)
                    time.sleep(random.uniform(0.5, 0.7))
                else:
                    # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                    for feca_image in fecas_cadre:
                        if Finddd(feca_image, 0.95):
                            FindPosClickCombat(feca_image,0.95)
                            break
            if Findd0("foudr.png", 0.8):
                FindPosClickCombat('foudr.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                if feca_positions:
                    x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                    click(x, y)
                    time.sleep(random.uniform(0.5, 0.7))
                else:
                    # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                    for feca_image in fecas_cadre:
                        if Finddd(feca_image, 0.95):
                            FindPosClickCombat(feca_image,0.95)
                            break
            if Findd0("bouclier.png", 0.8):
                    FindPosClickCombat("bouclier.png", 0.8)
                    time.sleep(random.uniform(0.5, 0.7))
                    feca_positions = positions_feca(fecas)
                    if feca_positions:
                        x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                        click(x, y)
                        time.sleep(random.uniform(0.5, 0.7))
                    else:
                        # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                        for feca_image in fecas_cadre:
                            if Finddd(feca_image, 0.95):
                                FindPosClickCombat(feca_image,0.95)
                                break
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche(monstres, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))
                elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                    image_trouvee = False
                    for groupe, images in groupes_monstres.items():
                        if image_trouvee:
                            break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                        for image in images:
                            if Finddd(image, 0.85):
                                FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                                image_trouvee = True
                                break 
            FindPosClickCombat("findetour.png", 0.8)
            if FindCombat("victoire.png", 0.8):  # Vérification de l'image de victoire
                up()
                pack()
                captcha()
                echap()
                break
            time.sleep(random.uniform(0.5, 0.6)) 
            FindCombat("atoidejouer.png", 0.8)##########################3
            time.sleep(random.uniform(0.5, 0.6)) 
            if Findd0("glyphe.png", 0.8):
                FindPosClickCombat('glyphe.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche_glyphe(monstres, monstre_sans, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7))        
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            FindPosClickCombat('barricade.png', 0.85)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            if feca_positions:
                x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                click(x, y)
                time.sleep(random.uniform(0.5, 0.7))
            else:
                # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                for feca_image in fecas_cadre:
                    if Finddd(feca_image, 0.95):
                        FindPosClickCombat(feca_image,0.95)
                        break
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                image_trouvee = False
                for groupe, images in groupes_monstres.items():
                    if image_trouvee:
                        break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                    for image in images:
                        if Finddd(image, 0.85):
                            FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                            image_trouvee = True
                            break 
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                image_trouvee = False
                for groupe, images in groupes_monstres.items():
                    if image_trouvee:
                        break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                    for image in images:
                        if Finddd(image, 0.85):
                            FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                            image_trouvee = True
                            break 
            FindPosClickCombat("findetour.png", 0.8)
            time.sleep(random.uniform(0.5, 0.6)) 
        if Findd0("victoire.png", 0.8):
            up()
            pack()
            captcha()
            echap()
            break
        
def CombatUp(groupes_monstres=None):  # Combat tester sur la zone bourgade avec feca feu 195
    if groupes_monstres is None:  # Vérifier si l'argument groupes_monstres est None
        print("Aucun groupe de monstres fourni.")
        return
    
    monstre_images = []
    for groupe, images in groupes_monstres.items():
        monstre_images.extend(images)
      
    # Ajoutez votre code après la définition de la fonction combat
    fecas = ["Corp/feca_1.png","Corp/feca_2.png","Corp/feca_3.png","Corp/feca_4.png"]
    monstres = ["Corp/monstre_1.png","Corp/monstre_2.png","Corp/monstre_3.png","Corp/monstre_4.png","Corp/monstre_11.png","Corp/monstre_22.png","Corp/monstre_33.png","Corp/monstre_44.png","Corp/monstre_55.png"]
    fecas_cadre = ["Corp/Cadre/cadre_feca.png","Corp/Cadre/cadre_feca_albuera.png","Corp/Cadre/cadre_feca_personnalise.png"]
    monstre_start = ["Corp/monstre_start_1.png","Corp/monstre_start_2.png","Corp/monstre_start_3.png","Corp/monstre_start_4.png","Corp/monstre_start_5.png","Corp/monstre_start_6.png"]
    monstre_sans = ["Corp/monstre_sans_1.png","Corp/monstre_sans_2.png","Corp/monstre_sans_3.png","Corp/monstre_sans_4.png","Corp/monstre_sans_5.png","Corp/monstre_sans_6.png","Corp/monstre_sans_7.png","Corp/monstre_sans_8.png"]
    click(1006,969)
    # red_proche(monstre_start)
    FindPosClick('pret.png', 0.8)
    time.sleep(2)
    

    FindCombat("atoidejouer.png",0.8)
    FindPosClickCombat('glyphe.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    proche_position = monstre_proche_glyphe(monstres, monstre_sans, feca_positions)
    if proche_position:
            x, y = proche_position
            click(x, y)  
            time.sleep(random.uniform(0.5, 0.7))
    FindPosClickCombat('tp.png', 0.9)
    if proche_position:
        x, y = proche_position
        click(x + 40, y - 30)  # Clique sur x - 40, y + 50 si c'est un monstre_sans
        time.sleep(random.uniform(0.5, 0.7))
    FindPosClickCombat("bouclier.png", 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    if feca_positions:
        x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
        click(x, y)
        time.sleep(random.uniform(0.5, 0.7))
    else:
        # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
        for feca_image in fecas_cadre:
            if Finddd(feca_image, 0.95):
                FindPosClickCombat(feca_image,0.95)
                break
    FindPosClickCombat('ronce.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    proche_position = monstre_proche(monstres, feca_positions)
    if proche_position:
        x, y = proche_position
        click(x, y)  
        time.sleep(random.uniform(0.5, 0.7))
    elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
        image_trouvee = False
        for groupe, images in groupes_monstres.items():
            if image_trouvee:
                break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
            for image in images:
                if Finddd(image, 0.85):
                    FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                    image_trouvee = True
                    break 
    FindPosClickCombat("findetour.png", 0.8)  
    time.sleep(random.uniform(0.5, 0.6))
    FindCombat("atoidejouer.png", 0.8)##########################2
    time.sleep(random.uniform(0.5, 0.8))
    FindPosClickCombat('agressif.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    if feca_positions:
        x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
        click(x, y)
        time.sleep(random.uniform(0.5, 0.7))
    else:
        # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
        for feca_image in fecas_cadre:
            if Finddd(feca_image, 0.95):
                FindPosClickCombat(feca_image,0.95)
                break
    FindPosClickCombat('foudr.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    if feca_positions:
        x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
        click(x, y)
        time.sleep(random.uniform(0.5, 0.7))
    else:
        # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
        for feca_image in fecas_cadre:
            if Finddd(feca_image, 0.95):
                FindPosClickCombat(feca_image,0.95)
                break
    FindPosClickCombat('ronce.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    proche_position = monstre_proche(monstres, feca_positions)
    if proche_position:
        x, y = proche_position
        click(x, y)  
        time.sleep(random.uniform(0.5, 0.7))
    elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
        image_trouvee = False
        for groupe, images in groupes_monstres.items():
            if image_trouvee:
                break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
            for image in images:
                if Finddd(image, 0.85):
                    FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                    image_trouvee = True
                    break 
    FindPosClickCombat("findetour.png", 0.8)
    FindCombat("atoidejouer.png", 0.8)
    FindPosClickCombat('glyphe.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    proche_position = monstre_proche_glyphe(monstres, monstre_sans, feca_positions)
    if proche_position:
            x, y = proche_position
            click(x, y)  
            time.sleep(random.uniform(0.5, 0.7))
    FindPosClickCombat('barricade.png', 0.85)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    if feca_positions:
        x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
        click(x, y)
        time.sleep(random.uniform(0.5, 0.7))
    else:
        # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
        for feca_image in fecas_cadre:
            if Finddd(feca_image, 0.95):
                FindPosClickCombat(feca_image,0.95)
                break  
    FindPosClickCombat('ronce.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    proche_position = monstre_proche(monstres, feca_positions)
    if proche_position:
        x, y = proche_position
        click(x, y)  
        time.sleep(random.uniform(0.5, 0.7))
    FindPosClickCombat('fournaise.png', 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    feca_positions = positions_feca(fecas)
    proche_position = monstre_proche(monstres, feca_positions)
    if proche_position:
        x, y = proche_position
        click(x, y)  
        time.sleep(random.uniform(0.5, 0.7))
    FindPosClickCombat("findetour.png", 0.8)
    while True:
        if(Findd("atoidejouer.png",0.7)):
            if Findd0("bouclier.png", 0.8):
                    FindPosClickCombat("bouclier.png", 0.8)
                    time.sleep(random.uniform(0.5, 0.7))
                    feca_positions = positions_feca(fecas)
                    if feca_positions:
                        x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                        click(x, y)
                        time.sleep(random.uniform(0.5, 0.7))
                    else:
                        # Si aucun Feca n'est détecté, cliquez sur la liste des images de Fecas
                        for feca_image in fecas_cadre:
                            if Finddd(feca_image, 0.95):
                                FindPosClickCombat(feca_image,0.95)
                                break
            if Findd0("glyphe.png", 0.8):
                FindPosClickCombat('glyphe.png', 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                feca_positions = positions_feca(fecas)
                proche_position = monstre_proche_glyphe(monstres, monstre_sans, feca_positions)
                if proche_position:
                    x, y = proche_position
                    click(x, y)  
                    time.sleep(random.uniform(0.5, 0.7)) 
            if Findd0("tp.png", 0.9):
                FindPosClickCombat('tp.png', 0.9)
                if proche_position:
                    x, y = proche_position
                    click(x + 40, y - 30)  # Clique sur x - 40, y + 50 si c'est un monstre_sans
                    time.sleep(random.uniform(0.5, 0.7))
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                image_trouvee = False
                for groupe, images in groupes_monstres.items():
                    if image_trouvee:
                        break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                    for image in images:
                        if Finddd(image, 0.85):
                            FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                            image_trouvee = True
                            break 
            FindPosClickCombat('ronce.png', 0.8)
            time.sleep(random.uniform(0.5, 0.7))
            feca_positions = positions_feca(fecas)
            proche_position = monstre_proche(monstres, feca_positions)
            if proche_position:
                x, y = proche_position
                click(x, y)  
                time.sleep(random.uniform(0.5, 0.7))
            elif groupes_monstres:  # Si aucun monstre proche, mais des groupes de monstres sont visibles
                image_trouvee = False
                for groupe, images in groupes_monstres.items():
                    if image_trouvee:
                        break  # Sortir de la boucle externe si une image a déjà été trouvée et cliquée
                    for image in images:
                        if Finddd(image, 0.85):
                            FindPosClickCombat(image, 0.85)  # Ajoutez le niveau de confiance ici
                            image_trouvee = True
                            break 
            time.sleep(random.uniform(0.5, 0.6)) 
            FindPosClickCombat("findetour.png", 0.8)
            time.sleep(random.uniform(0.5, 0.6)) 
        elif(Findd("victoire.png",0.7)!=False):
            up()
            pack()
            captcha()
            echap()
            break
def combat_dopeul():
    fecas = ["Corp/feca_1.png","Corp/feca_2.png","Corp/feca_3.png","Corp/feca_4.png"]
    click(743,800)
    time.sleep(random.uniform(0.2,0.5))
    FindPosClick("pret.png",0.8)
    time.sleep(random.uniform(1.2,2))
    Find("atoidejouer.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("bouclier.png", 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    FindPosClickCombat("Corp/Cadre/cadre_feca.png", 0.8)
    time.sleep(random.uniform(0.5, 0.7))
    FindPosClick("ronce.png",0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("Corp/Cadre/cadre_dopeul.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("findetour.png", 0.8)
    time.sleep(random.uniform(0.5, 0.6))
    Find("atoidejouer.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    click(638,707)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClick("ronce.png",0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("Corp/Cadre/cadre_dopeul.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClick("ronce.png",0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("Corp/Cadre/cadre_dopeul.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("findetour.png", 0.8)
    time.sleep(random.uniform(0.5, 0.6))
    while True:
        if Findd0("atoidejouer.png", 0.8):
            time.sleep(random.uniform(0.5,0.7))
            FindPosClick("ronce.png",0.8)
            time.sleep(random.uniform(0.5,0.7))
            FindPosClickCombat("Corp/Cadre/cadre_dopeul.png", 0.8)
            time.sleep(random.uniform(0.5,0.7))
            if Findd0("bouclier.png", 0.8):
                FindPosClickCombat("bouclier.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                FindPosClickCombat("Corp/Cadre/cadre_feca.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                FindPosClickCombat("findetour.png", 0.8)
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5,0.7))
                FindPosClickCombat("Corp/Cadre/cadre_dopeul.png", 0.8)
                time.sleep(random.uniform(0.5,0.7))
                FindPosClickCombat("findetour.png", 0.8)
                time.sleep(random.uniform(0.5, 0.6))
                feca_positions = positions_feca(fecas)
                if feca_positions:
                    x, y = feca_positions[0]  # Sélectionnez le premier Feca trouvé
                    click(x-60, y-60)
        if Findd0("victoire.png", 0.8):
                up()
                break
        
def combat_rat():
    click(684,716)
    time.sleep(random.uniform(0.2,0.5))
    FindPosClick("pret.png",0.8)
    time.sleep(random.uniform(1.2,2))
    Find("atoidejouer.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClick("ronce.png",0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("Corp/Cadre/cadre_rat.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClick("ronce.png",0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("Corp/Cadre/cadre_rat.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    click(576,771)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("findetour.png", 0.8)
    time.sleep(random.uniform(0.5, 0.6))
    Find("atoidejouer.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClick("ronce.png",0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("Corp/Cadre/cadre_rat.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClick("ronce.png",0.8)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("Corp/Cadre/cadre_rat.png", 0.8)
    time.sleep(random.uniform(0.5,0.7))
    click(480,823)
    time.sleep(random.uniform(0.5,0.7))
    FindPosClickCombat("findetour.png", 0.8)
    time.sleep(random.uniform(0.5, 0.6))
    while True:
        if Findd0("atoidejouer.png", 0.8):
            time.sleep(random.uniform(0.5,0.7))
            FindPosClick("ronce.png",0.8)
            time.sleep(random.uniform(0.5,0.7))
            FindPosClickCombat("Corp/Cadre/cadre_rat.png", 0.8)
            time.sleep(random.uniform(0.5,0.7))
            if Findd0("bouclier.png", 0.8):
                FindPosClickCombat("bouclier.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                FindPosClickCombat("Corp/Cadre/cadre_feca.png", 0.8)
                time.sleep(random.uniform(0.5, 0.7))
                FindPosClickCombat("findetour.png", 0.8)
            else:
                FindPosClickCombat('ronce.png', 0.8)
                time.sleep(random.uniform(0.5,0.7))
                FindPosClickCombat("Corp/Cadre/cadre_rat.png", 0.8)
                time.sleep(random.uniform(0.5,0.7))
                FindPosClickCombat("findetour.png", 0.8)
                time.sleep(random.uniform(0.5, 0.6))
        if Findd0("victoire.png", 0.8):
                up()
                break