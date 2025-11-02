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

def downswip(xmin=900, xmax=1100, ymin=400, ymax=600):
    x = random.randint(xmin, xmax)
    y2 = random.randint(ymin, ymax - 200)  # Assure une différence de 200 pixels
    y1 = y2 + 250
    swipe(x, y1, x, y2)

def leftswip(xmin=900, xmax=1400, ymin=500, ymax=800):
    y = random.randint(ymin, ymax)
    x1 = random.randint(xmin, xmax - 200)  # Assure une différence de 200 pixels
    x2 = x1 + 250
    swipe(x1, y, x2, y)


def rightswip(xmin=700, xmax=1000, ymin=700, ymax=900):
    y = random.randint(ymin, ymax)
    x2 = random.randint(xmin, xmax - 200)  # Assure une différence de 200 pixels
    x1 = x2 + 250
    swipe(x1, y, x2, y)


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
        up()
        #checkpopup()
        #captcha()
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
        up()
        if_find_click("x.png",0.82,region=(1100,116,490,450))
        up()
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
                pygame.mixer.Sound("alarm.mp3").play()  # Jouez le son après 10 tentatives consécutives sans image
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
                pygame.mixer.Sound("alarm.mp3").play()  # Jouez le son après 10 tentatives consécutives sans image
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
def FinddPosClickList(images, conf, region=None, xp=0, yp=0):
    while True:
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
                    # if Findd("victoire.png", 0.7):
                    #     break

def FindPosClickCombat(image,conf, region=None,xp=0,yp=0):
    time.sleep(0.5)
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
# Example: long_press_image(image, duration_ms=duree*1000, confidence=confi)


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
