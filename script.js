const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let isGameOver = false;
let score = 0;
let frameCount = 0;
let keys = {};

// Game Objects
const player = { x: 180, y: 530, w: 40, h: 40, speed: 6, color: '#00ffff' };
let bullets = [];
let enemies = [];
let particles = [];

// Event Listeners for Desktop Keyboard
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Helper function to draw rectangles
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function handlePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;
    
    // Shoot mechanic (throttled so it doesn't fire a solid laser beam)
    if (keys['Space'] && frameCount % 10 === 0) {
        bullets.push({ x: player.x + player.w / 2 - 3, y: player.y, w: 6, h: 15, speed: 8, color: '#ffff00' });
    }
    
    drawRect(player.x, player.y, player.w, player.h, player.color);
}

function handleBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        drawRect(bullets[i].x, bullets[i].y, bullets[i].w, bullets[i].h, bullets[i].color);
        // Remove bullet if it goes off top of screen
        if (bullets[i].y < 0) bullets.splice(i, 1); 
    }
}

function handleEnemies() {
    // Spawn enemies randomly
    if (frameCount % 40 === 0) {
        let size = Math.random() * 20 + 20; // Size between 20 and 40
        let ex = Math.random() * (canvas.width - size);
        enemies.push({ x: ex, y: -size, w: size, h: size, speed: Math.random() * 2 + 2, color: '#ff4444' });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed;
        drawRect(e.x, e.y, e.w, e.h, e.color);

        // Check if Enemy hits Player
        if (player.x < e.x + e.w && player.x + player.w > e.x &&
            player.y < e.y + e.h && player.y + player.h > e.y) {
            isGameOver = true;
        }

        // Remove enemy if it passes the bottom
        if (e.y > canvas.height) enemies.splice(i, 1);
    }
}

function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            let e = enemies[i];
            let b = bullets[j];
            
            // If bullet hits enemy
            if (e && b && b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                // Create explosion particles
                for(let p = 0; p < 8; p++){
                    particles.push({
                        x: e.x + e.w / 2, y: e.y + e.h / 2, 
                        vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, 
                        life: 20
                    });
                }
                enemies.splice(i, 1); // Destroy enemy
                bullets.splice(j, 1); // Destroy bullet
                score += 10;
                scoreDisplay.innerText = `Score: ${score}`;
                break; 
            }
        }
    }
}

function handleParticles() {
    ctx.fillStyle = '#ffaa00';
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillRect(p.x, p.y, 4, 4);
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// --- CORE GAME LOOP ---
function gameLoop() {
    if (isGameOver) {
        gameOverScreen.classList.remove('hidden');
        finalScoreDisplay.innerText = score;
        return; // Stops the loop
    }

    // Clear the canvas every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    handlePlayer();
    handleBullets();
    handleEnemies();
    checkCollisions();
    handleParticles();

    frameCount++;
    requestAnimationFrame(gameLoop); // Calls itself for the next frame
}

// --- RESTART LOGIC ---
restartBtn.addEventListener('click', () => {
    isGameOver = false;
    score = 0;
    bullets = [];
    enemies = [];
    particles = [];
    player.x = 180;
    scoreDisplay.innerText = `Score: ${score}`;
    gameOverScreen.classList.add('hidden');
    gameLoop();
});

// --- MOBILE TOUCH CONTROLS LOGIC ---
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnShoot = document.getElementById('btn-shoot');

function setupTouchControls(buttonElement, keyName) {
    // For touch screens (Phones/Tablets)
    buttonElement.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        keys[keyName] = true; 
    }, { passive: false });
    
    buttonElement.addEventListener('touchend', (e) => { 
        e.preventDefault(); 
        keys[keyName] = false; 
    }, { passive: false });

    // For mouse clicks (Testing on Desktop)
    buttonElement.addEventListener('mousedown', () => { keys[keyName] = true; });
    buttonElement.addEventListener('mouseup', () => { keys[keyName] = false; });
    buttonElement.addEventListener('mouseleave', () => { keys[keyName] = false; });
}

// Hook up the buttons to act like keyboard keys
setupTouchControls(btnLeft, 'ArrowLeft');
setupTouchControls(btnRight, 'ArrowRight');
setupTouchControls(btnShoot, 'Space');

// Start the game!
gameLoop();