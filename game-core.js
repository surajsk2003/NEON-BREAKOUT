// NEON BREAKOUT - Core Game Logic
class NeonBreakout {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        if (!this.canvas || !this.ctx) {
            console.error('Game canvas not found!');
            return;
        }
        
        this.gameState = 'start';
        this.difficulty = 'normal';
        this.lastFrameTime = 0;
        this.fps = 60;
        
        this.stats = {
            score: 0,
            level: 1,
            lives: 3,
            combo: 1,
            maxCombo: 1,
            bricksDestroyed: 0,
            startTime: 0
        };
        
        this.ball = null;
        this.paddle = null;
        this.bricks = [];
        this.balls = [];
        this.keys = {};
        this.mouse = { x: 0, y: 0, isMoving: false };
        
        this.difficultySettings = {
            easy: { ballSpeed: 4, brickRows: 3, lives: 5 },
            normal: { ballSpeed: 5, brickRows: 4, lives: 3 },
            hard: { ballSpeed: 6.5, brickRows: 5, lives: 2 },
            insane: { ballSpeed: 8, brickRows: 6, lives: 1 }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupUI();
        this.resizeCanvas();
        this.gameLoop();
        this.showScreen('startScreen');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                
                this.mouse.x = (e.clientX - rect.left) * scaleX;
                this.mouse.y = (e.clientY - rect.top) * scaleY;
                this.mouse.isMoving = true;
                
                setTimeout(() => this.mouse.isMoving = false, 100);
            });
        }
        
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        // Button event listeners
        const addClickHandler = (id, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        };
        
        addClickHandler('startBtn', () => this.startGame());
        addClickHandler('restartBtn', () => this.restartGame());
        addClickHandler('nextLevelBtn', () => this.nextLevel());
        addClickHandler('resumeBtn', () => this.resumeGame());
        addClickHandler('mainMenuBtn', () => this.showMainMenu());
        addClickHandler('backToMenuBtn', () => this.showMainMenu());
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
            });
        });
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'p':
            case 'P':
            case 'Escape':
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
                break;
            case ' ':
                e.preventDefault();
                if (this.gameState === 'playing' && this.ball && !this.ball.launched) {
                    this.ball.launch();
                }
                break;
        }
    }
    
    setupUI() {
        this.elements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            combo: document.getElementById('combo'),
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            finalCombo: document.getElementById('finalCombo'),
            finalTime: document.getElementById('finalTime')
        };
    }
    
    resizeCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        const container = this.canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            const aspectRatio = 4/3;
            let width = Math.min(rect.width * 0.9, 800);
            let height = width / aspectRatio;
            
            if (height > rect.height * 0.8) {
                height = rect.height * 0.8;
                width = height * aspectRatio;
            }
            
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
        }
    }
    
    startGame() {
        const settings = this.difficultySettings[this.difficulty];
        this.stats = {
            score: 0,
            level: 1,
            lives: settings.lives,
            combo: 1,
            maxCombo: 1,
            bricksDestroyed: 0,
            startTime: Date.now()
        };
        
        this.gameState = 'playing';
        this.hideAllOverlays();
        this.initLevel();
        this.resetBall();
        this.resetPaddle();
    }
    
    restartGame() {
        this.startGame();
    }
    
    pauseGame() {
        this.gameState = 'paused';
        this.showScreen('pauseScreen');
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.hideAllOverlays();
    }
    
    nextLevel() {
        this.stats.level++;
        this.gameState = 'playing';
        this.hideAllOverlays();
        this.initLevel();
        this.resetBall();
        this.resetPaddle();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        if (this.elements.finalScore) this.elements.finalScore.textContent = this.stats.score;
        if (this.elements.finalLevel) this.elements.finalLevel.textContent = this.stats.level;
        if (this.elements.finalCombo) this.elements.finalCombo.textContent = `x${this.stats.maxCombo}`;
        if (this.elements.finalTime) this.elements.finalTime.textContent = this.formatTime(Date.now() - this.stats.startTime);
        this.showScreen('gameOverScreen');
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        this.showScreen('levelCompleteScreen');
    }
    
    initLevel() {
        const settings = this.difficultySettings[this.difficulty];
        const levelFeatures = this.getLevelFeatures(this.stats.level);
        
        const rows = Math.min(settings.brickRows + Math.floor(this.stats.level / 2), 8);
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 25;
        const padding = 5;
        const offsetTop = 80;
        const offsetLeft = (this.canvas.width - (cols * (brickWidth + padding))) / 2;
        
        this.bricks = [];
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const health = Math.floor(r / 2) + 1 + Math.floor(this.stats.level / 5);
                const brick = new Brick({
                    x: c * (brickWidth + padding) + offsetLeft,
                    y: r * (brickHeight + padding) + offsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    health,
                    maxHealth: health,
                    hue: (r * 60 + c * 15) % 360,
                    points: health * 10 * this.stats.level
                });
                
                // Apply level-specific features
                this.applyLevelFeatures(brick, r, c, levelFeatures);
                this.bricks.push(brick);
            }
        }
        
        // Apply level modifiers
        this.applyLevelModifiers(levelFeatures);
    }
    
    getLevelFeatures(level) {
        const features = {
            movingBricks: false,
            invisibleBricks: false,
            regeneratingBricks: false,
            multiHitBricks: false,
            paddleShrink: false,
            ballSpeedIncrease: 0,
            extraBalls: 0,
            obstacles: false
        };
        
        // Level 2-3: Moving bricks
        if (level >= 2) features.movingBricks = true;
        
        // Level 4-5: Multi-hit bricks
        if (level >= 4) features.multiHitBricks = true;
        
        // Level 6-7: Invisible bricks
        if (level >= 6) features.invisibleBricks = true;
        
        // Level 8-9: Regenerating bricks
        if (level >= 8) features.regeneratingBricks = true;
        
        // Level 10+: Paddle shrinks
        if (level >= 10) features.paddleShrink = true;
        
        // Every 3 levels: Ball speed increase
        features.ballSpeedIncrease = Math.floor(level / 3) * 0.5;
        
        // Every 5 levels: Extra ball
        if (level % 5 === 0 && level > 0) features.extraBalls = 1;
        
        // Level 15+: Obstacles
        if (level >= 15) features.obstacles = true;
        
        return features;
    }
    
    applyLevelFeatures(brick, row, col, features) {
        // Moving bricks (every 4th brick in top rows)
        if (features.movingBricks && row < 2 && col % 4 === 0) {
            brick.isMoving = true;
            brick.moveSpeed = 1 + Math.random();
            brick.moveDirection = Math.random() > 0.5 ? 1 : -1;
            brick.originalX = brick.x;
            brick.moveRange = 60;
        }
        
        // Multi-hit bricks (random 20%)
        if (features.multiHitBricks && Math.random() < 0.2) {
            brick.health += 2;
            brick.maxHealth = brick.health;
            brick.points *= 2;
            brick.hue = 270; // Purple for multi-hit
        }
        
        // Invisible bricks (random 15%)
        if (features.invisibleBricks && Math.random() < 0.15) {
            brick.isInvisible = true;
            brick.alpha = 0.3;
            brick.points *= 1.5;
        }
        
        // Regenerating bricks (random 10%)
        if (features.regeneratingBricks && Math.random() < 0.1) {
            brick.isRegenerating = true;
            brick.regenTimer = 0;
            brick.regenDelay = 5000;
            brick.hue = 120; // Green for regenerating
            brick.points *= 2;
        }
    }
    
    applyLevelModifiers(features) {
        // Increase ball speed
        if (features.ballSpeedIncrease > 0) {
            this.balls.forEach(ball => {
                const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                const newSpeed = currentSpeed + features.ballSpeedIncrease;
                const ratio = newSpeed / currentSpeed;
                ball.dx *= ratio;
                ball.dy *= ratio;
            });
        }
        
        // Shrink paddle
        if (features.paddleShrink && this.paddle) {
            this.paddle.width = Math.max(80, this.paddle.width - 20);
        }
        
        // Add extra balls
        if (features.extraBalls > 0) {
            for (let i = 0; i < features.extraBalls; i++) {
                const newBall = new Ball({
                    x: this.canvas.width / 2 + (i * 50),
                    y: this.canvas.height - 120,
                    radius: 8,
                    speed: this.ball.speed,
                    canvas: this.canvas
                });
                this.balls.push(newBall);
            }
        }
        
        // Add obstacles
        if (features.obstacles) {
            this.addObstacles();
        }
    }
    
    addObstacles() {
        // Add moving obstacles in the middle area
        for (let i = 0; i < 2; i++) {
            this.bricks.push(new Brick({
                x: 200 + i * 300,
                y: 300,
                width: 40,
                height: 40,
                health: 999, // Indestructible
                maxHealth: 999,
                hue: 0, // Red for obstacles
                points: 0,
                isObstacle: true,
                isMoving: true,
                moveSpeed: 2,
                moveDirection: 1,
                originalX: 200 + i * 300,
                moveRange: 150
            }));
        }
    }
    
    resetBall() {
        const settings = this.difficultySettings[this.difficulty];
        this.ball = new Ball({
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            radius: 10,
            speed: settings.ballSpeed,
            canvas: this.canvas
        });
        this.balls = [this.ball];
    }
    
    resetPaddle() {
        this.paddle = new Paddle({
            x: this.canvas.width / 2 - 80,
            y: this.canvas.height - 40,
            width: 160,
            height: 20,
            speed: 10,
            canvas: this.canvas
        });
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        if (this.paddle) {
            this.paddle.update(this.keys, this.mouse);
        }
        
        // Update special bricks
        this.updateSpecialBricks(deltaTime);
        
        this.balls = this.balls.filter(ball => {
            ball.update(deltaTime);
            
            // Wall collisions
            if (ball.x <= ball.radius || ball.x >= this.canvas.width - ball.radius) {
                ball.dx = -ball.dx;
            }
            
            if (ball.y <= ball.radius) {
                ball.dy = -ball.dy;
            }
            
            // Paddle collision
            if (this.paddle && this.checkBallPaddleCollision(ball, this.paddle)) {
                this.handleBallPaddleCollision(ball, this.paddle);
            }
            
            // Brick collisions
            this.checkBallBrickCollisions(ball);
            
            // Ball out of bounds
            if (ball.y > this.canvas.height) {
                return false;
            }
            
            return true;
        });
        
        // Check if all balls are lost
        if (this.balls.length === 0) {
            this.stats.lives--;
            this.stats.combo = 1;
            
            if (this.stats.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
            }
        }
        
        // Check level completion
        if (this.bricks.every(brick => brick.destroyed)) {
            this.levelComplete();
        }
        
        this.updateUI();
    }
    
    checkBallPaddleCollision(ball, paddle) {
        return ball.y + ball.radius >= paddle.y && 
               ball.x >= paddle.x && 
               ball.x <= paddle.x + paddle.width &&
               ball.dy > 0;
    }
    
    handleBallPaddleCollision(ball, paddle) {
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3;
        
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.cos(angle) * speed;
    }
    
    checkBallBrickCollisions(ball) {
        this.bricks.forEach(brick => {
            if (brick.destroyed) return;
            
            if (this.checkCollision(ball, brick)) {
                this.handleBrickCollision(ball, brick);
            }
        });
    }
    
    checkCollision(ball, brick) {
        return ball.x + ball.radius > brick.x && 
               ball.x - ball.radius < brick.x + brick.width &&
               ball.y + ball.radius > brick.y && 
               ball.y - ball.radius < brick.y + brick.height;
    }
    
    handleBrickCollision(ball, brick) {
        // Don't destroy obstacles, just bounce
        if (brick.isObstacle) {
            const ballCenterX = ball.x;
            const ballCenterY = ball.y;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;
            
            const dx = ballCenterX - brickCenterX;
            const dy = ballCenterY - brickCenterY;
            
            if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }
            return;
        }
        
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        
        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;
        
        if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
            ball.dx = -ball.dx;
        } else {
            ball.dy = -ball.dy;
        }
        
        brick.takeDamage();
        
        const points = brick.points * this.stats.combo;
        this.stats.score += points;
        this.stats.combo++;
        this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
        
        if (brick.destroyed) {
            this.stats.bricksDestroyed++;
        }
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.bricks.forEach(brick => brick.draw(this.ctx));
            this.balls.forEach(ball => ball.draw(this.ctx));
            
            if (this.paddle) {
                this.paddle.draw(this.ctx);
            }
        }
        
        if (this.gameState === 'paused') {
            this.drawPauseOverlay();
        }
    }
    
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.font = '48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.restore();
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    updateUI() {
        if (this.elements.score) this.elements.score.textContent = this.stats.score.toLocaleString().padStart(8, '0');
        if (this.elements.level) this.elements.level.textContent = this.stats.level.toString().padStart(2, '0');
        if (this.elements.lives) this.elements.lives.textContent = this.stats.lives.toString().padStart(2, '0');
        if (this.elements.combo) this.elements.combo.textContent = `x${this.stats.combo}`;
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.overlay').forEach(overlay => {
            overlay.classList.remove('active');
        });
        
        setTimeout(() => {
            document.getElementById(screenId).classList.add('active');
        }, 100);
    }
    
    hideAllOverlays() {
        document.querySelectorAll('.overlay').forEach(overlay => {
            overlay.classList.remove('active');
        });
    }
    
    showMainMenu() {
        this.gameState = 'start';
        this.showScreen('startScreen');
    }
    
    updateSpecialBricks(deltaTime) {
        this.bricks.forEach(brick => {
            // Moving bricks
            if (brick.isMoving) {
                brick.x += brick.moveSpeed * brick.moveDirection * (deltaTime / 16);
                
                if (Math.abs(brick.x - brick.originalX) > brick.moveRange) {
                    brick.moveDirection *= -1;
                }
                
                // Keep within canvas bounds
                if (brick.x < 0 || brick.x + brick.width > this.canvas.width) {
                    brick.moveDirection *= -1;
                    brick.x = Math.max(0, Math.min(this.canvas.width - brick.width, brick.x));
                }
            }
            
            // Regenerating bricks
            if (brick.isRegenerating && brick.health < brick.maxHealth) {
                brick.regenTimer += deltaTime;
                if (brick.regenTimer >= brick.regenDelay) {
                    brick.health = Math.min(brick.health + 1, brick.maxHealth);
                    brick.destroyed = false;
                    brick.regenTimer = 0;
                }
            }
            
            // Invisible bricks (flicker effect)
            if (brick.isInvisible) {
                brick.alpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
            }
        });
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / 60000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the game
const game = new NeonBreakout();