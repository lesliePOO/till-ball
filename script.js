/* =====================================================
   PROJET : TILT BALL
   Objectif : contrôler une bille en inclinant le téléphone.
   Cette version est une base pédagogique à tester et améliorer.
   ===================================================== */

/* 1. RÉCUPÉRATION DES ÉLÉMENTS HTML */
const ball = document.getElementById("ball"); // Bille mobile.
const board = document.getElementById("board"); // Terrain de jeu.
const goal = document.getElementById("goal"); // Zone d'arrivée.
const statusText = document.getElementById("status"); // Message d'état.
const timerText = document.getElementById("timer"); // Chronomètre.
const startButton = document.getElementById("start-button"); // Bouton démarrer.
const resetButton = document.getElementById("reset-button"); // Bouton recommencer.

/* 2. VARIABLES DU JEU */
// Position du centre de la bille, en pourcentage du terrain.
let ballX = 8;
let ballY = 88;

// Vitesse de la bille en pourcentage par image.
let velocityX = 0;
let velocityY = 0;

// État de la partie.
let gameRunning = false;
let gameWon = false;
let sensorsListening = false;

// Temps de jeu et identifiants des tâches.
let elapsedSeconds = 0;
let timerInterval = null;
let animationFrame = null;

// Inclinaison normalisée du téléphone.
let tiltX = 0;
let tiltY = 0;

// Paramètres de déplacement à ajuster pendant les tests.
const sensitivity = 0.10;
const maxSpeed = 0.8;
const ballRadius = 11; // Rayon en pixels.

/* 3. AFFICHER LA BILLE */
function drawBall() {
  // Les coordonnées sont exprimées en pourcentage de la taille du terrain.
  ball.style.left = `${ballX}%`;
  ball.style.top = `${ballY}%`;
}

/* 4. METTRE À JOUR LE CHRONOMÈTRE */
function updateTimer() {
  const minutes = Math.floor(elapsedSeconds / 60); // Minutes complètes.
  const seconds = elapsedSeconds % 60; // Secondes restantes.
  timerText.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/* 5. DÉTECTER LES COLLISIONS ENTRE LA BILLE ET LES MURS */
function checkWallCollision(nextX, nextY) {
  const boardRect = board.getBoundingClientRect(); // Dimensions du terrain.

  // Conversion des coordonnées en pourcentage vers les pixels.
  const pixelX = (nextX / 100) * boardRect.width;
  const pixelY = (nextY / 100) * boardRect.height;

  const walls = document.querySelectorAll(".wall"); // Tous les obstacles.

  for (const wall of walls) {
    const rect = wall.getBoundingClientRect();

    // Coordonnées du mur relatives au terrain.
    const left = rect.left - boardRect.left;
    const right = rect.right - boardRect.left;
    const top = rect.top - boardRect.top;
    const bottom = rect.bottom - boardRect.top;

    // Trouve le point du rectangle le plus proche du centre de la bille.
    const nearestX = Math.max(left, Math.min(pixelX, right));
    const nearestY = Math.max(top, Math.min(pixelY, bottom));

    const dx = pixelX - nearestX;
    const dy = pixelY - nearestY;

    // Une distance inférieure au rayon signifie que la bille touche le mur.
    if (dx * dx + dy * dy < ballRadius * ballRadius) {
      return true;
    }
  }

  return false; // Aucun obstacle n'a été touché.
}

/* 6. DÉPLACER LA BILLE */
function moveBall() {
  // Arrête la boucle lorsque la partie n'est plus active.
  if (!gameRunning) return;

  // L'inclinaison modifie progressivement la vitesse.
  velocityX += tiltX * sensitivity;
  velocityY += tiltY * sensitivity;

  // Limite la vitesse maximale pour garder un contrôle du jeu.
  velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, velocityX));
  velocityY = Math.max(-maxSpeed, Math.min(maxSpeed, velocityY));

  // Calcule les prochaines coordonnées.
  let nextX = ballX + velocityX;
  let nextY = ballY + velocityY;

  // Empêche le centre de la bille de dépasser les limites du terrain.
  nextX = Math.max(2, Math.min(98, nextX));
  nextY = Math.max(2, Math.min(98, nextY));

  // Teste le déplacement horizontal séparément.
  if (checkWallCollision(nextX, ballY)) {
    velocityX = 0; // Annule la vitesse horizontale en cas de collision.
  } else {
    ballX = nextX;
  }

  // Teste ensuite le déplacement vertical.
  if (checkWallCollision(ballX, nextY)) {
    velocityY = 0; // Annule la vitesse verticale en cas de collision.
  } else {
    ballY = nextY;
  }

  drawBall(); // Actualise la position visible de la bille.
  checkWin(); // Vérifie si l'arrivée a été atteinte.

  // Demande au navigateur de dessiner la prochaine image.
  if (gameRunning) {
    animationFrame = requestAnimationFrame(moveBall);
  }
}

/* 7. VÉRIFIER SI LE JOUEUR A GAGNÉ */
function checkWin() {
  const ballRect = ball.getBoundingClientRect();
  const goalRect = goal.getBoundingClientRect();

  // Détecte le chevauchement entre la bille et la zone d'arrivée.
  const overlapping =
    ballRect.left < goalRect.right &&
    ballRect.right > goalRect.left &&
    ballRect.top < goalRect.bottom &&
    ballRect.bottom > goalRect.top;

  if (overlapping && !gameWon) {
    gameWon = true;
    gameRunning = false;

    clearInterval(timerInterval); // Arrête le chronomètre.
    cancelAnimationFrame(animationFrame); // Arrête l'animation.

    statusText.textContent =
      `Bravo ! Tu as terminé le niveau en ${timerText.textContent} !`;
    startButton.textContent = "Rejouer";
  }
}

/* 8. LIRE L'ORIENTATION DU TÉLÉPHONE */
function handleOrientation(event) {
  if (!gameRunning) return; // Ignore les mouvements hors partie.

  // gamma : inclinaison latérale ; beta : inclinaison avant/arrière.
  const gamma = event.gamma ?? 0;
  const beta = event.beta ?? 0;

  // Normalise approximativement les angles pour piloter la bille.
  tiltX = Math.max(-1, Math.min(1, gamma / 45));
  tiltY = Math.max(-1, Math.min(1, beta / 45));
}

/* 9. ACTIVER LES CAPTEURS, AVEC AUTORISATION SI NÉCESSAIRE */
async function enableSensors() {
  // Safari sur iOS peut exiger une demande explicite déclenchée par un clic.
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();

      if (permission !== "granted") {
        statusText.textContent =
          "Autorisation refusée. Autorise l'accès aux mouvements pour jouer.";
        return false;
      }
    } catch (error) {
      console.error("Erreur d'autorisation des capteurs :", error);
      statusText.textContent =
        "Impossible d'activer les capteurs. Vérifie Safari et HTTPS.";
      return false;
    }
  }

  // Vérifie la disponibilité de l'API d'orientation.
  if (typeof DeviceOrientationEvent === "undefined") {
    statusText.textContent =
      "Les capteurs d'orientation ne sont pas disponibles dans ce navigateur.";
    return false;
  }

  // Évite d'ajouter plusieurs fois le même écouteur.
  if (!sensorsListening) {
    window.addEventListener("deviceorientation", handleOrientation);
    sensorsListening = true;
  }

  return true;
}

/* 10. DÉMARRER UNE PARTIE */
async function startGame() {
  if (gameRunning) return; // Empêche plusieurs démarrages simultanés.

  // Active d'abord les capteurs du téléphone.
  const sensorsEnabled = await enableSensors();
  if (!sensorsEnabled) return;

  // Si le joueur vient de gagner, une nouvelle partie repart de zéro.
  if (gameWon) {
    resetGame();
  }

  tiltX = 0;
  tiltY = 0;
  gameRunning = true;
  gameWon = false;

  statusText.textContent = "Partie en cours ! Incline ton téléphone.";
  startButton.textContent = "Partie en cours…";

  // Le chronomètre avance chaque seconde.
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimer();
  }, 1000);

  // Lance la boucle d'animation.
  animationFrame = requestAnimationFrame(moveBall);
}

/* 11. RÉINITIALISER LA PARTIE */
function resetGame() {
  gameRunning = false;
  gameWon = false;

  clearInterval(timerInterval); // Arrête le chronomètre.
  cancelAnimationFrame(animationFrame); // Arrête l'animation.

  // Replace la bille à son point de départ.
  ballX = 8;
  ballY = 88;

  // Supprime toute vitesse restante.
  velocityX = 0;
  velocityY = 0;
  tiltX = 0;
  tiltY = 0;

  // Remet le temps à zéro et actualise l'écran.
  elapsedSeconds = 0;
  updateTimer();
  drawBall();

  statusText.textContent = "Partie réinitialisée. Prêt à jouer ?";
  startButton.textContent = "Démarrer";
}

/* 12. RELIER LES BOUTONS À LEURS FONCTIONS */
startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

/* 13. INITIALISER L'AFFICHAGE AU CHARGEMENT DE LA PAGE */
drawBall();
updateTimer();

/* Retire proprement l'écouteur lorsque la page est quittée. */
window.addEventListener("pagehide", () => {
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrame);
  if (sensorsListening) {
    window.removeEventListener("deviceorientation", handleOrientation);
  }
});
