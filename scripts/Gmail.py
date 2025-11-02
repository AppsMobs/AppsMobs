"""
Script personnalisé pour BootyBot - Création automatique de comptes Gmail
"""
import random
import os
from datetime import datetime
try:
    import pyperclip
except ImportError:
    pyperclip = None  # Fallback si pyperclip n'est pas disponible

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


def my_script(android_client, serial):
    """
    Votre script personnalisé
    
    Args:
        android_client: Instance Android (pour cliquer, swiper, etc.)
        serial: Numéro de série du device
        
    Returns:
        dict: {'success': bool, 'message': str, 'data': {}}
    """
    # Importer les fonctions de logging
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        log(serial, "Début du script Gmail")

        # Activer le mode avion

        wait(random.uniform(1, 2))
        
        # Cliquer sur account
        FindPosClickList(['account.png', 'account1.png', 'account2.png'], 0.8)
        wait(random.uniform(0.2, 0.4))
        
        swipe(1387, 824, 1387, 185, duration=500)
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('add.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('google.png', 0.8)
        wait(random.uniform(3, 5))
        
        # Attendre que signin apparaisse
        Find('singin.png', 0.8)
        swipe(1387, 824, 1387, 185, duration=500)
        wait(random.uniform(0.3, 0.4))
        
        FindPosClick('create.png', 0.8)
        wait(random.uniform(0.3, 0.4))
        
        FindPosClick('formy.png', 0.8)
        wait(random.uniform(0.3, 0.5))
        
        FindPosClick('name.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        write('safaa')
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('next.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('month.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        swipe(1075, 980, 1075, 80, duration=500)
        wait(random.uniform(0.4, 0.6))
        
        FindPosClick('december.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('day.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        write('4')
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('year.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        write('1991')
        wait(random.uniform(0.2, 0.4))
        back()
        
        FindPosClick('gender.png', 0.8)
        wait(random.uniform(0.3, 0.5))
        
        FindPosClick('female.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('next.png', 0.8)
        wait(random.uniform(2, 4))
        
        # Vérifier si "choose" apparaît
        if Findd('choose.png', 0.8):
            swipe(1387, 700, 1387, 300, duration=500)
            FindPosClick('own.png', 0.8)
            wait(random.uniform(0.2, 0.4))
        else:
            FindPosClick('username.png', 0.8)
            wait(random.uniform(0.2, 0.4))
        
        # Générer l'adresse Gmail
        adresse_gmail = generate_random_gmail()
        adresse_gmail_txt = adresse_gmail + "@gmail.com"
        
        # Enregistrer l'adresse Gmail dans un fichier texte
        date_generation = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        script_dir = os.path.dirname(os.path.abspath(__file__))
        gmail_file = os.path.join(script_dir, "adresses_gmail.txt")
        with open(gmail_file, "a", encoding='utf-8') as f:
            f.write(f"{adresse_gmail_txt} - Généré le {date_generation}\n")

        # Écrire l'adresse Gmail générée
        write(adresse_gmail)
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('next.png', 0.8)
        wait(random.uniform(4, 6))
        
        FindPosClick('password.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        write('Dofuspl1.')
        wait(random.uniform(0.2, 0.4))
        
        FindPosClick('next.png', 0.8)
        wait(random.uniform(5, 6))
        
        # Vérifier review ou skip
        if Findd('review.png', 0.8):
            FindPosClick('next.png', 0.8)
            wait(random.uniform(0.2, 0.4))
        elif Findd('skip.png', 0.8):
            FindPosClick('skip.png', 0.8)
            wait(random.uniform(0.2, 0.4))
        
        # Attendre que privacy apparaisse
        Find('privacy.png', 0.8)
        wait(random.uniform(0.2, 0.4))
        
        # Faire plusieurs swipes pour descendre
        for _ in range(4):
            swipe(1387, 1000, 1387, 100, duration=500)
            wait(random.uniform(0.2, 0.4))
        
        FindPosClick('agree.png', 0.8)
        wait(random.uniform(8, 10))
            
        log(serial, "Script terminé avec succès!")
        result['success'] = True
        result['message'] = f'Script exécuté sur {serial}'
        result['data']['device'] = serial
    except Exception as e:
        log(serial, f"Erreur: {e}", "ERROR")
        result['success'] = False
        result['message'] = str(e)
        import traceback
        result['data']['traceback'] = traceback.format_exc()
    
    return result
