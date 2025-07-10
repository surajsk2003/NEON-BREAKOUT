// Game object classes
class Ball {
    constructor({ x, y, radius, speed, canvas }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.baseSpeed = speed;
        this.canvas = canvas;
        this.dx = 0;
        this.dy = 0;
        this.trail = [];
        this.launched = false;
        this.glowIntensity = 0;
    }
    
    launch() {
        const angle = (Math.random() - 0.5) * Math.PI / 4;
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.cos(angle) * this.speed;
        this.launched = true;
    }
    
    update(deltaTime) {
        if (!this.launched) return;
        
        this.x += this.dx * (deltaTime / 16);
        this.y += this.dy * (deltaTime / 16);
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) {
            this.trail.shift();
        }
        
        // Update trail alpha
        this.trail.forEach((point, index) => {
            point.alpha = index / this.trail.length * 0.8;
        });
        
        // Update glow
        this.glowIntensity = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
    }
    
    draw(ctx) {
        // Draw trail
        this.trail.forEach((point, index) => {
            if (index === 0) return;
            
            ctx.save();
            ctx.globalAlpha = point.alpha;
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = this.radius * (index / this.trail.length);
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius * (index / this.trail.length), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
        
        // Draw main ball
        ctx.save();
        
        // Outer glow
        const glowRadius = this.radius + 10 + this.glowIntensity * 5;
        const gradient = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, glowRadius);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ball
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Core highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius/3, this.y - this.radius/3, this.radius/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    serialize() {
        return {
            x: this.x,
            y: this.y,
            dx: this.dx,
            dy: this.dy,
            radius: this.radius,
            speed: this.speed,
            baseSpeed: this.baseSpeed,
            launched: this.launched
        };
    }
    
    static deserialize(data, canvas) {
        const ball = new Ball({
            x: data.x,
            y: data.y,
            radius: data.radius,
            speed: data.speed,
            canvas
        });
        
        ball.dx = data.dx;
        ball.dy = data.dy;
        ball.baseSpeed = data.baseSpeed;
        ball.launched = data.launched;
        
        return ball;
    }
}

class Paddle {
    constructor({ x, y, width, height, speed, canvas }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originalWidth = width;
        this.speed = speed;
        this.canvas = canvas;
        this.targetX = x;
    }
    
    update(keys, mouse) {
        // Keyboard movement
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < this.canvas.width - this.width) {
            this.x += this.speed;
        }
        
        // Mouse movement with smoothing
        if (mouse.isMoving) {
            this.targetX = Math.max(0, Math.min(this.canvas.width - this.width, mouse.x - this.width / 2));
            this.x += (this.targetX - this.x) * 0.2;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Create gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(0.5, '#0080ff');
        gradient.addColorStop(1, '#004080');
        
        // Draw paddle shadow/glow
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw top highlight
        const highlightGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 5);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(this.x, this.y, this.width, 5);
        
        ctx.restore();
    }
    
    serialize() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            originalWidth: this.originalWidth,
            speed: this.speed
        };
    }
    
    static deserialize(data, canvas) {
        const paddle = new Paddle({
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            speed: data.speed,
            canvas
        });
        
        paddle.originalWidth = data.originalWidth;
        return paddle;
    }
}