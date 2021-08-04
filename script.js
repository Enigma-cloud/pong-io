// Canvas
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 800;
const height = 600;
const screenHeight = window.screen.height;
const canvasPosition = screenHeight / 2 - height / 2;
const isMobile = window.matchMedia('(max-width: 700px)');
// Screens
const startScreenEl = document.getElementById('start-screen');
const playGameBtn = document.getElementById('play-game');
const modeBtn = document.getElementById('select-game-mode');
const modeTitle = document.getElementById('mode-title');
const gameContainer = document.getElementById('game-container');
const gameOverEl = document.createElement('div');
const tipsModal = document.getElementById('tips-modal');
// Menu
const startGameBtn = document.getElementById('start-game');
const menuBar = document.getElementById('menu');
const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');
const ballColorBtn = document.getElementById('ball-color');
const modalBackToMenu = document.getElementById('modal-back-to-menu');

/** Constants & Variables */
// Paddle
const paddleHeight = 50;
const paddleWidth = 10;
const paddleDiff = 25;
const playerSpeed = 4;
let paddleRightY = (height/2) - paddleDiff;
let paddleLeftY = 225;
let playerMoved = false;
let paddleContact = false;

// Multiplayer - Movement Controller
const controller = {
  "s": {pressed: false,
      func: () => {
        playerMoved = true;
        paddleLeftY += playerSpeed;
        if (paddleLeftY > height - paddleHeight) {
          paddleLeftY = height - paddleHeight;
        }
      }
    },
  "w": {pressed: false,
      func: () => {
        playerMoved = true;
        paddleLeftY -= playerSpeed;
        if (paddleLeftY < 0) {
          paddleLeftY = 0;
        }
      }
    },
  "ArrowDown": {pressed: false,
      func: () => {
        playerMoved = true;
        paddleRightY += playerSpeed;
        if (paddleRightY > height - paddleHeight) {
          paddleRightY = height - paddleHeight;
        }
      }
    },
  "ArrowUp": {pressed: false,
      func: () => {
        playerMoved = true;
        paddleRightY -= playerSpeed;
        if (paddleRightY < 0) {
          paddleRightY = 0;
      }
    }
  }
};

// Ball
let ballX = width/2;
let ballY = height/2;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change Mobile Settings
if (isMobile.matches) {
  // Temporary Log
  console.log(isMobile.matches);
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -4;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerTwo = 0;
let playerOne = 0;
const winningScore = 1;
let isGameOver = true;
let isNewGame = true;
let isPaused = false;
// Game Mode
let isMultiplayer = false;


/** Functions */
// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Player 2 Paddle (Right)
  context.fillRect(width - 20, paddleRightY, paddleWidth, paddleHeight);

  // Player 1 / Computer Paddle (Left)
  context.fillRect(10, paddleLeftY, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([8]);
  context.moveTo(width/2, 0);
  context.lineTo(width/2, width);
  context.strokeStyle = 'grey';
  context.lineWidth = 4;
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = `#${ballColorBtn.value}`;
  context.fill();

  // Score
  context.font = 'bold 32px Courier New';
  context.fillStyle = `white`;
  context.fillText(playerTwo, (canvas.width / 2) + 40, 40);
  context.fillText(playerOne, (canvas.width / 2) - 60, 40);
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  gameContainer.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  isMultiplayer ? speedX = (-speedX) / 1.20 : speedX = (-speedX) / 1.10
  ballX = width / 2;
  ballY = height / 2;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Horizontal Speed
  ballX += -speedX;
  // Vertical Speed
  if (playerMoved && paddleContact) {
    ballY += speedY;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off bottom
  if (ballY > height && speedY > 0) {
    speedY = -speedY;
  }
  // Bounce off ceiling 
  if (ballY < 0 && speedY < 0) {
    speedY = -speedY;
  }
  // Bounce off player 1 paddle (Left)
  if (ballX > width - paddleDiff) {
    if (ballY > paddleRightY && ballY < paddleRightY + paddleHeight) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedX -= 1;
        // Max Speed
        if (speedX < -5) {
          speedX = -5;
          computerSpeed = 6;
        }
      }
      speedX = -speedX;
      trajectoryY = ballY - (paddleRightY + paddleDiff);
      speedY = trajectoryY * 0.3;
    } else if (ballX > width) {
      // Reset Ball, add to player 1 score
      ballReset();
      playerOne++;
      
    }
  }
  // Bounce off player 2 paddle (Right)
  if (ballX < paddleDiff) {
    if (ballY > paddleLeftY && ballY < paddleLeftY + paddleHeight) {
      // Add Speed on Hit
      if (playerMoved) {
        speedX += 1;
        // Max Speed
        if (speedX > 5) {
          speedX = 5;
        }
      }
      speedX = -speedX;
    } else if (ballX < 0) {
      // Reset Ball, add to Player Two score
      ballReset();
      playerTwo++;
      
    }
  }
}

// Toggle Game Mode
function toggleMode() {
  isMultiplayer = !isMultiplayer;
  modeTitle.textContent = `Mode: ${isMultiplayer ? 'Multiplayer' : 'Single Player'}`;
}

// Multiplayer - Execute Paddle Movement 
function executeMoves() {
  Object.keys(controller).forEach(key => {
    controller[key].pressed && controller[key].func();
  })
}

function mouseMovement(e) {
  playerMoved = true;
  // Compensate for canvas being centered
  paddleRightY = e.clientY - canvasPosition - paddleDiff;
  if (paddleRightY < 0) {
    paddleRightY = 0;
  }
  if (paddleRightY > height - paddleHeight) {
    paddleRightY = height - paddleHeight;
  }
  // Hide Cursor
  canvas.style.cursor = 'none';
}

// Single Player - Computer Movement
function computerAI() {
  if (playerMoved) {
    if (paddleLeftY + paddleDiff < ballY) {
      paddleLeftY += computerSpeed;
    } else {
      paddleLeftY -= computerSpeed;
    }
  }
}

// Go back to start screen
function showStartScreen() {
  if (!confirm('Go back to start menu?')) {
    return
  }
  gameContainer.removeChild(canvas);
  gameContainer.contains(gameOverEl) ? gameContainer.removeChild(gameOverEl) : '';
  menuBar.style.display = 'none';
  startScreenEl.style.display = 'flex';
}

// Open Settings Modal
function toggleSettings() {
  if (settingsModal.style.display !== 'none') {
    settingsModal.style.display = 'none';
    return
  }
  else {
    settingsModal.style.display = 'flex';
  }
  isPaused = !isPaused;
  return animate();
}

// Game Over Screen
function showGameOverEl(winner) {
  // Hide Canvas
  canvas.hidden = true;
  // Container
  gameOverEl.textContent = '';
  // gameOverEl.classList.add('screen-translucent');
  gameOverEl.classList.add('screen-container');
  // Title
  const title = document.createElement('h1');
  const scoreBoard = document.createElement('h2');
  title.textContent = `${winner} Wins!`;
  scoreBoard.textContent = `${playerOne} : ${playerTwo}`
  // Button
  const playAgainBtn = document.createElement('button');
  const backToMenuBtn = document.createElement('button');
  playAgainBtn.classList.add('fd-btn');
  playAgainBtn.addEventListener('click', () => {
    showMainGameScreen();
    startGame();
  })
  playAgainBtn.textContent = 'Play Again';
  backToMenuBtn.classList.add('fd-btn');
  backToMenuBtn.setAttribute('onclick', 'showStartScreen()')
  backToMenuBtn.textContent = 'Back to Menu'
  // Append
  gameOverEl.append(title, scoreBoard, playAgainBtn, backToMenuBtn);
  gameContainer.appendChild(gameOverEl);
  
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerTwo === winningScore || playerOne === winningScore) {
    isGameOver = true;

    if (isMultiplayer) {
      playerOneName = 'Player 1';
    }
    else {
      playerOneName = 'Computer';
    }
    // Set Winner
    const winner = playerTwo === winningScore ? 'Player 2' : playerOneName;
    showGameOverEl(winner);
  }
}

// Called Every Frame
function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  isMultiplayer ? executeMoves() : computerAI()
  gameOver();
  if (!isGameOver && !isPaused) {
    window.requestAnimationFrame(animate);
  } 
}

// Reset variables
function resetGame() {
  isGameOver = false;
  isNewGame = false;

  isPaused = false;
  playerTwo = 0;
  playerOne = 0;
  // Reset Modals
  settingsModal.style.display = 'none';
  tipsModal.style.display = 'none';
}

// Game Screen
function showMainGameScreen() {
  startScreenEl.style.display = 'none';
  menuBar.style.display = 'flex';
  gameContainer.contains(gameOverEl) ? gameContainer.removeChild(gameOverEl) : '';
  canvas.hidden = false;
  
}

// Tips Screen
function toggleTips() {
  if (tipsModal.style.display === 'flex') {
    tipsModal.style.display = 'none';
    return
  }
  tipsModal.style.display = 'flex';
}

// Start Game, Reset Everything
function startGame() {
  resetGame();
  ballReset();
  createCanvas();
  animate();

  if (isMultiplayer) {
    // Multiplayer - Movement Handlers
    document.addEventListener('keydown', (e) => {
      playerMoved = true;
      if (controller[e.key]) {
        controller[e.key].pressed = true;
      }
    });
    document.addEventListener('keyup', (e) => {
      if (controller[e.key]) {
        controller[e.key].pressed = false;
      }
    });
  }
  else {
    // Single Player - Mouse Movement
    canvas.addEventListener('mousemove', (e) => mouseMovement(e));
  }
}


/** On-load Event Listeners */
modalBackToMenu.addEventListener('click', showStartScreen);
ballColorBtn.addEventListener('change', createCanvas);
settingsBtn.addEventListener('click', toggleSettings);
playGameBtn.addEventListener('click', () => {
  startScreenEl.style.display = 'none';
  toggleTips();
});
startGameBtn.addEventListener('click', () => {
  showMainGameScreen();
  startGame();
});
window.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    toggleSettings();
  }
})