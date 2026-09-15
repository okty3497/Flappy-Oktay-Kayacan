// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
const bird = {
    x: canvas.width * 0.2,
    y: canvas.height * 0.5,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.6,
    jump: -12,
    color: '#FFD700'
};

const pipes = [];
const pipeWidth = 80;
const pipeGap = 150;
const pipeSpacing = 300;
let pipeCounter = 0;

let score = 0;
let gameRunning = false;
let gameOver = false;

// Input handling
let touchActive = false;

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchActive = true;
    
    if (!gameRunning && !gameOver) {
        startGame();
    } else if (gameRunning) {
        bird.velocity = bird.jump;
    }
});

document.addEventListener('touchend', () => {
    touchActive = false;
});

document.addEventListener('click', () => {
    if (!gameRunning && !gameOver) {
        startGame();
    } else if (gameRunning) {
        bird.velocity = bird.jump;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning && !gameOver) {
            startGame();
        } else if (gameRunning) {
            bird.velocity = bird.jump;
        }
    }
});

function startGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    bird.y = canvas.height * 0.5;
    bird.velocity = 0;
    pipes.length = 0;
    pipeCounter = 0;
    
    document.getElementById('titleScreen').classList.remove('show');
    document.getElementById('tapHint').style.display = 'none';
    document.getElementById('gameOverScreen').classList.remove('show');
}

function update() {
    if (!gameRunning) return;

    // Gravity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Boundaries
    if (bird.y + bird.height > canvas.height) {
        endGame();
        return;
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }

    // Generate pipes
    pipeCounter++;
    if (pipeCounter > pipeSpacing) {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - 50;
        const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        pipes.push({
            x: canvas.width,
            topHeight: randomHeight,
            scored: false
        });
        
        pipeCounter = 0;
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 5;

        // Collision detection
        if (
            bird.x < pipes[i].x + pipeWidth &&
            bird.x + bird.width > pipes[i].x
        ) {
            // Top pipe collision
            if (bird.y < pipes[i].topHeight) {
                endGame();
                return;
            }
            // Bottom pipe collision
            if (bird.y + bird.height > pipes[i].topHeight + pipeGap) {
                endGame();
                return;
            }
        }

        // Scoring
        if (!pipes[i].scored && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].scored = true;
            score++;
            document.getElementById('scoreValue').textContent = score;
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function draw() {
    // Background
    ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds (decorative)
    drawClouds();

    // Draw pipes
    ctx.fillStyle = '#00AA00';
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);

        // Pipe outline
        ctx.strokeStyle = '#006600';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);
    }

    // Draw bird (circle with face)
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Bird eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 - 8, bird.y + bird.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 8, bird.y + bird.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Bird beak
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width / 2 + 15, bird.y + bird.height / 2);
    ctx.lineTo(bird.x + bird.width / 2 + 20, bird.y + bird.height / 2 - 3);
    ctx.lineTo(bird.x + bird.width / 2 + 20, bird.y + bird.height / 2 + 3);
    ctx.closePath();
    ctx.fill();

    // Draw ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    // Cloud 1
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(140, 80, 35, 0, Math.PI * 2);
    ctx.arc(180, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    // Cloud 2
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 150, 25, 0, Math.PI * 2);
    ctx.arc(canvas.width - 110, 150, 30, 0, Math.PI * 2);
    ctx.arc(canvas.width - 70, 150, 25, 0, Math.PI * 2);
    ctx.fill();
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.add('show');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
