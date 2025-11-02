"""
Android helper functions (internal core module)

This module contains all public wrappers used by user scripts. It is
kept inside the core package so it is not shipped directly alongside
client scripts.
"""

# The content below is migrated from scripts/android_functions.py
# to keep a single source of truth.

import time
import random
import os


def my_script(android_client, device_serial, **kwargs):
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    try:
        result['success'] = True
        result['message'] = 'Script de démonstration - Voir la documentation'
        result['data'] = {'functions': 'documented', 'see_this_file': True}
    except Exception as e:
        result['message'] = f'Erreur: {str(e)}'
    return result


SCRIPT_INFO = {
    'name': 'Fonctions Android - Guide',
    'description': 'Démontre les fonctions disponibles pour contrôler Android',
    'author': 'AppsMobs',
    'version': '1.0.0',
    'max_duration': 30
}


# =============================
# Contrôles de base
# =============================

def click(android_client, x, y):
    android_client.click(x, y)
    print(f"Clic effectué en position ({x}, {y})")


def doubleclick(android_client, x, y):
    android_client.click(x, y)
    android_client.click(x, y)
    print(f"Double clic en position ({x}, {y})")


def swipe(android_client, x1, y1, x2, y2, duration=500):
    android_client.device.shell2(f"input swipe {x1} {y1} {x2} {y2} {duration}")
    print(f"Swipe de ({x1}, {y1}) vers ({x2}, {y2}) avec durée {duration}ms")


def write(android_client, text):
    android_client.write(text)
    print(f"Texte tapé: {text}")


def back(android_client):
    android_client.back()
    print("Touche BACK pressée")


def home(android_client):
    android_client.shell("input keyevent KEYCODE_HOME")
    print("Touche HOME pressée")


def entre(android_client):
    android_client.entre()
    print("Touche ENTRÉE pressée")


def switch(android_client):
    android_client.switch()
    print("Changement d'application")


def sleep(android_client, seconds):
    time.sleep(seconds)
    print(f"Attente de {seconds} secondes")


# =============================
# Swipes directionnels
# =============================

def upswipe(android_client, xmin=470, xmax=1050, ymin=400, ymax=700):
    x = random.randint(xmin, xmax)
    y1 = random.randint(ymin, ymax - 200)
    y2 = y1 + 250
    swipe(android_client, x, y1, x, y2)
    print("Je monte en haut")


def downswipe(android_client, xmin=900, xmax=1100, ymin=400, ymax=600):
    x = random.randint(xmin, xmax)
    y2 = random.randint(ymin, ymax - 200)
    y1 = y2 + 250
    swipe(android_client, x, y1, x, y2)
    print("Je vais en bas")


def leftswipe(android_client, xmin=900, xmax=1400, ymin=500, ymax=800):
    y = random.randint(ymin, ymax)
    x1 = random.randint(xmin, xmax - 200)
    x2 = x1 + 250
    swipe(android_client, x1, y, x2, y)
    print("Je tourne à gauche")


def rightswipe(android_client, xmin=700, xmax=1000, ymin=700, ymax=900):
    y = random.randint(ymin, ymax)
    x2 = random.randint(xmin, xmax - 200)
    x1 = x2 + 250
    swipe(android_client, x1, y, x2, y)
    print("Je tourne à droite")


# =============================
# Vision / Images
# =============================

def Find(image,conf, region=None,x=True): #ContinuousFindd
    # Search for the image until it is found
    while True:
        image_center = android_device.locate_center_on_screen(image, confidence=conf,region=region)
        if image_center is not None:
            x,y=image_center
            print("i can see "+str(image))
            return x,y
        else:
            # Take a break between searches
            print("i can't see "+str(image))

def Findd(image,conf,region=None): #Findd
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

# =============================
# Boucles de recherche + Click (while True)
# =============================


def FindPosClick(image, conf, region=None, xp=0, yp=0):#
    while True:

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

def FindPosClickSound(image, conf, region=None, xp=0, yp=0, max_attempts=20):#avec x+captcha
    consecutive_failures = 0

    while True:
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
                   break

def FindPosClickListLoop(images, conf, region=None, xp=0, yp=0):
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
                    #     break




# =============================
# Boucles de recherche + Double Click (while True)
# =============================
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

# =============================
# Réseau / Système
# =============================

def toggle_airplane_mode(android_client):
    print("Activation du mode avion...")
    android_client.airplane_on()
    time.sleep(3)
    print("Mode avion activé.")
    print("Désactivation du mode avion...")
    android_client.airplane_off()
    time.sleep(4)
    print("Mode avion désactivé.")


def clear_cache(android_client, package_name="com.android.chrome"):
    android_client.device.shell2(f"pm clear {package_name}")
    print(f"Cache vidé pour {package_name}")


def restart_app(android_client, package_name="com.example.app"):
    android_client.shell("input keyevent 3")  # Home
    android_client.shell2(f"pm trim-caches 999G")
    android_client.shell2(f"am start -n {package_name}/{package_name}.MainActivity")
    print(f"Application {package_name} redémarrée")


def screenshot(android_client, filename="screenshot.png"):
    android_client.save_last_frame()
    print(f"Screenshot sauvegardé: {filename}")


# =============================
# Utilitaires avancés
# =============================

def wait_for_image(android_client, image_path, confidence=0.8, timeout=30, region=None):
    start_time = time.time()
    while time.time() - start_time < timeout:
        pos = find(android_client, image_path, confidence, region)
        if pos:
            return pos
        time.sleep(0.5)
    print(f"Timeout: {image_path} non trouvé après {timeout}s")
    return None


def click_until_image_appears(android_client, click_positions, target_image, max_clicks=10, confidence=0.8):
    for _ in range(max_clicks):
        for x, y in click_positions:
            click(android_client, x, y)
            time.sleep(0.5)
            if find_image_bool(android_client, target_image, confidence):
                print(f"Image cible {target_image} trouvée!")
                return True
    print(f"Image cible {target_image} non trouvée après {max_clicks} clics")
    return False


def random_delay(min_seconds=0.5, max_seconds=1.5):
    delay = random.uniform(min_seconds, max_seconds)
    time.sleep(delay)
    print(f"Attente aléatoire de {delay:.2f} secondes")


def move_with_variation(android_client, start_image, target_image, confidence=0.8):
    start_pos = find(android_client, start_image, confidence)
    target_pos = find(android_client, target_image, confidence)
    if start_pos and target_pos:
        x1, y1 = start_pos
        x2, y2 = target_pos
        x1 += random.randint(-10, 10)
        y1 += random.randint(-10, 10)
        x2 += random.randint(-10, 10)
        y2 += random.randint(-10, 10)
        swipe(android_client, x1, y1, x2, y2)
        print(f"Swipe avec variation de {start_image} vers {target_image}")


def long_press(android_client, x, y, duration_ms=1000):
    android_client.device.shell2(f"input swipe {x} {y} {x} {y} {duration_ms}")
    print(f"Appui long de {duration_ms}ms en position ({x}, {y})")


def long_press_image(android_client, image_path, duration_ms=1000, confidence=0.8):
    pos = find(android_client, image_path, confidence)
    if pos:
        x, y = pos
        long_press(android_client, x, y, duration_ms)
        print(f"Appui long sur {image_path}")


