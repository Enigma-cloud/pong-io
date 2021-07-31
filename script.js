// Canvas
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 700;
const height = 500;
const screenHeight = window.screen.height;
const canvasPosition = screenHeight / 2 - height / 2;
const isMobile = window.matchMedia('(max-width: 700px)');
const gameContainer = document.getElementById('game-container');
const gameOverEl = document.createElement('div');
const startScreenEl = document.getElementById('start-screen');
const startGameBtn = document.getElementById('start-game');
const menuBar = document.getElementById('menu');

// Paddle
const paddleHeight = 50;
const paddleWidth = 10;
const paddleDiff = 25;
let paddleRightY = (height/2) - paddleDiff;
let paddleLeftY = 225;
let playerMoved = false;
let paddleContact = false;

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
  speedY = -1;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 1;
let isGameOver = true;
let isNewGame = true;

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
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = 'bold 32px Courier New';
  context.fillText(playerScore, (canvas.width / 2) + 40, 40);
  context.fillText(computerScore, (canvas.width / 2) - 60, 40);
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
  ballX = width / 2;
  ballY = height / 2;
  speedX = (-speedX) / 1.5;
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
  // Bounce off player paddle (Left)
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
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
      
    }
  }
  // Bounce off computer paddle (Right)
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
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
      
    }
  }
}

// Computer Movement
function computerAI() {
  if (playerMoved) {
    if (paddleLeftY + paddleDiff < ballY) {
      paddleLeftY += computerSpeed;
    } else {
      paddleLeftY -= computerSpeed;
    }
  }
}

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
  scoreBoard.textContent = `${computerScore} : ${playerScore}`
  // Button
  const playAgainBtn = document.createElement('button');
  const backToMenuBtn = document.createElement('button');

  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play Again';
  backToMenuBtn.setAttribute('onclick', 'showStartScreen()')
  backToMenuBtn.textContent = 'Back to Menu'
  // Append
  gameOverEl.append(title, scoreBoard, playAgainBtn, backToMenuBtn);
  gameContainer.appendChild(gameOverEl);
  
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    const winner = playerScore === winningScore ? 'Player' : 'Computer';
    showGameOverEl(winner);
  }
}

// Called Every Frame
function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  computerAI();
  gameOver();
  if (!isGameOver && !isPaused) {
    window.requestAnimationFrame(animate);
  } 
}

let isPaused = false;

// Reset variables
function resetGame() {
  isGameOver = false;
  isNewGame = false;
  isPaused = false;
  playerScore = 0;
  computerScore = 0;
  // Reset Modal
  settingsModal.style.display = 'none';
}

// Start Game, Reset Everything
function startGame() {
  startScreenEl.style.display = 'none';
  gameContainer.contains(gameOverEl) ? gameContainer.removeChild(gameOverEl) : '';
  menuBar.style.display = 'flex';
  canvas.hidden = false;

  resetGame();
  ballReset();
  createCanvas();
  animate();

  canvas.addEventListener('mousemove', (e) => {
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
  });
}

// Go back to start screen
function showStartScreen() {
  if (confirm('Go back to start menu?')) {
    gameContainer.removeChild(canvas);
    gameContainer.removeChild(gameOverEl);
  }
  menuBar.style.display = 'none';
  startScreenEl.style.display = 'flex';
}

function openSettings() {
  if (settingsModal.style.display !== 'none') {
    settingsModal.style.display = 'none';
  }
  else {
    settingsModal.style.display = 'flex';
  console.log(settingsModal.style.display);
  }
  isPaused = !isPaused;
  return animate();
}

// Event Listeners
const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');

settingsBtn.addEventListener('click', openSettings);

startGameBtn.addEventListener('click', startGame);
window.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    openSettings();
  }
})

// On Load
// startGame();
