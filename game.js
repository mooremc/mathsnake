const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let snake = [];
let snakeSize = 20; // Size of each segment
let snakeSpeed = 2;
let direction = '';
let snakeColor = '#4CAF50';

let numbers = [];
let targetNumber = 10;
let currentCount = 0;
let numberMultiple = 1;

let flashTimer = 0;
let isFlashing = false;
let gameOver = false;

let leaderboard = [];

// Start screen elements
const startScreen = document.getElementById('startScreen');
const multipleSelect = document.getElementById('multipleSelect');
const colorInput = document.getElementById('colorInput');
const startButton = document.getElementById('startButton');

// Leaderboard elements
const leaderboardDiv = document.getElementById('leaderboard');
const scoreList = document.getElementById('scoreList');
const restartButton = document.getElementById('restartButton');

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', showStartScreen);

function startGame() {
    // Get user inputs
    numberMultiple = parseInt(multipleSelect.value);
    snakeColor = colorInput.value;

    // Automatically set targetNumber
    if (numberMultiple === 1) {
        targetNumber = 10;
    } else if (numberMultiple === 5) {
        targetNumber = 50;
    } else if (numberMultiple === 10) {
        targetNumber = 100;
    }

    // Hide start screen and show canvas
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    leaderboardDiv.style.display = 'none';

    resetGame();
    gameLoop();
}

function showStartScreen() {
    // Show start screen and hide other elements
    startScreen.style.display = 'block';
    canvas.style.display = 'none';
    leaderboardDiv.style.display = 'none';
}

// Initialize the game
function resetGame() {
    gameOver = false;
    currentCount = 0;
    direction = '';
    snake = [];
    snake[0] = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    numbers = [];
    for (let i = 0; i < 5; i++) {
        spawnNumber();
    }
}

function getRandomNumber() {
    let nums;
    if (currentCount >= targetNumber) {
        nums = [-1, -2, -3, -4, -5]; // Provide negative numbers
    } else {
        nums = [1, 2, 3, 4, 5]; // Provide positive numbers
    }

    // Multiply numbers by numberMultiple
    nums = nums.map(num => num * numberMultiple);

    return nums[Math.floor(Math.random() * nums.length)];
}

function spawnNumber() {
    const angle = Math.random() * 2 * Math.PI;
    const speed = 1.5;
    const number = {
        x: Math.random() * (canvas.width - 30) + 15,
        y: Math.random() * (canvas.height - 30) + 15,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        value: getRandomNumber(),
        radius: 15
    };
    numbers.push(number);
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(snake[i].x, snake[i].y, snakeSize, snakeSize);
    }
}

function updateSnake() {
    // Move snake segments
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i].x = snake[i - 1].x;
        snake[i].y = snake[i - 1].y;
    }

    // Update head position
    if (direction === 'right') snake[0].x += snakeSpeed;
    if (direction === 'left') snake[0].x -= snakeSpeed;
    if (direction === 'up') snake[0].y -= snakeSpeed;
    if (direction === 'down') snake[0].y += snakeSpeed;

    // Boundary conditions
    if (snake[0].x < 0) snake[0].x = 0;
    if (snake[0].y < 0) snake[0].y = 0;
    if (snake[0].x + snakeSize > canvas.width) snake[0].x = canvas.width - snakeSize;
    if (snake[0].y + snakeSize > canvas.height) snake[0].y = canvas.height - snakeSize;
}

function drawNumbers() {
    numbers.forEach((number) => {
        ctx.fillStyle = number.value > 0 ? 'green' : 'red';
        ctx.beginPath();
        ctx.arc(number.x, number.y, number.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(number.value, number.x - 10, number.y + 5);
    });
}

function updateNumbers() {
    numbers.forEach((number) => {
        number.x += number.dx;
        number.y += number.dy;

        // Bounce off walls
        if (number.x - number.radius < 0 || number.x + number.radius > canvas.width) {
            number.dx = -number.dx;
        }
        if (number.y - number.radius < 0 || number.y + number.radius > canvas.height) {
            number.dy = -number.dy;
        }
    });
}

function checkCollision() {
    numbers.forEach((number, index) => {
        // Check collision with snake head
        const distX = snake[0].x + snakeSize / 2 - number.x;
        const distY = snake[0].y + snakeSize / 2 - number.y;
        const distance = Math.hypot(distX, distY);

        if (distance < number.radius + snakeSize / 2) {
            currentCount += number.value;

            // Prevent currentCount from going below zero
            if (currentCount < 0) currentCount = 0;

            // Adjust snake length
            if (number.value > 0) {
                let segmentsToAdd = number.value / numberMultiple;
                for (let i = 0; i < segmentsToAdd; i++) {
                    snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y });
                }
            } else {
                let segmentsToRemove = Math.min(snake.length - 1, Math.abs(number.value / numberMultiple));
                snake.splice(-segmentsToRemove);
                if (snake.length < 1) snake.push({ x: snake[0].x, y: snake[0].y });
            }

            // Start flash effect
            isFlashing = true;
            flashTimer = 0;

            // Remove the number and spawn a new one
            numbers.splice(index, 1);
            spawnNumber();
        }
    });
}

function checkWin() {
    if (!gameOver && currentCount === targetNumber) {
        gameOver = true;
        setTimeout(() => {
            alert('Congratulations! You reached the target number!');
            updateLeaderboard();
            showLeaderboard();
        }, 10);
    }
}

function updateLeaderboard() {
    leaderboard.push({ score: currentCount, target: targetNumber });
    leaderboard.sort((a, b) => b.score - a.score);
}

function showLeaderboard() {
    canvas.style.display = 'none';
    leaderboardDiv.style.display = 'block';

    // Display leaderboard
    scoreList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        if (index < 10) { // Limit to top 10 scores
            const listItem = document.createElement('li');
            listItem.textContent = `Score: ${entry.score}, Target: ${entry.target}`;
            scoreList.appendChild(listItem);
        }
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawText() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Target: ${targetNumber}`, canvas.width - 200, 30);
    ctx.fillText(`Your Count: ${currentCount}`, canvas.width - 200, 60);
}

function handleFlash() {
    if (isFlashing) {
        flashTimer++;
        if (flashTimer % 10 < 5) {
            ctx.fillStyle = 'yellow';
            ctx.font = '20px Arial';
            ctx.fillText(`Your Count: ${currentCount}`, canvas.width - 200, 60);
        }
        if (flashTimer > 30) {
            isFlashing = false;
            flashTimer = 0;
        }
    }
}

function gameLoop() {
    clearCanvas();
    drawSnake();
    drawNumbers();
    updateSnake();
    updateNumbers();
    checkCollision();
    drawText();
    handleFlash();
    checkWin();
    if (canvas.style.display === 'block') {
        requestAnimationFrame(gameLoop);
    }
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        direction = 'right';
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        direction = 'left';
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        direction = 'up';
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        direction = 'down';
    }
}

document.addEventListener('keydown', keyDown);

// Show the start screen initially
showStartScreen();
