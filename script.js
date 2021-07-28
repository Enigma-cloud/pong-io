// Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 800;
const height = 600;
const screenHeight = window.screen.height;
const canvasPosition = screenHeight / 2 - height / 2;
const isMobile = window.matchMedia('(max-width: 800px)');
const gameOverEl = document.createElement('div');

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
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 10;
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
  context.font = '32px Courier New';
  context.fillText(playerScore, (canvas.width / 2) + 40, 40);
  context.fillText(computerScore, (canvas.width / 2) - 60, 40);
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
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
  // Bounce off Bottom
  if (ballY > height && speedY > 0) {
    speedY = -speedY;
  }
  // Bounce off Ceiling 
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
  gameOverEl.classList.add('screen-container');
  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;
  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play Again';
  // Append
  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);
  
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
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  } 
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    paddleRightY = e.clientY - canvasPosition + (4 * paddleDiff);
    console.log(paddleRightY)
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

function showStartScreen() {
  
}

// On Load
startGame();
