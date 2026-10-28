# Tilt Ball — mini-jeu contrôlé par inclinaison

Projet pédagogique en HTML, CSS et JavaScript.

## Fichiers

- `index.html` : structure de la page et éléments du jeu.
- `style.css` : apparence du jeu, du terrain, de la bille et des obstacles.
- `script.js` : déplacement, collisions, chronomètre, victoire et capteur d'orientation.

## Ouvrir le projet dans VS Code

1. Téléchargez et décompressez `tilt-ball.zip`.
2. Dans VS Code, choisissez **File > Open Folder**.
3. Sélectionnez le dossier `tilt-ball` décompressé.
4. Ouvrez `index.html` dans un navigateur ou utilisez l'extension Live Server pour le test sur ordinateur.

## Tester sur iPhone

L'accès aux capteurs de mouvement peut nécessiter une origine sécurisée HTTPS et une autorisation dans Safari. Un fichier ouvert directement (`file://`) ou depuis une adresse locale non sécurisée ne permet généralement pas de tester correctement les capteurs.

Pour jouer sur iPhone, publiez les fichiers sur un hébergement HTTPS, puis ouvrez l'adresse publiée dans Safari et appuyez sur **Démarrer**. Autorisez l'accès aux mouvements si iOS le demande.

## État du projet

Cette version est une première base d'apprentissage. Le déplacement, les collisions et les commandes doivent être testés sur le navigateur cible ; les axes de l'orientation peuvent nécessiter un ajustement selon la position du téléphone. Le niveau affiché est pour l'instant décoratif et ne change pas automatiquement.
