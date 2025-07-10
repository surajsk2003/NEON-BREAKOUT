// Brick classes
class Brick {
    constructor({ x, y, width, height, health, maxHealth, hue, points }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = maxHealth;
        this.hue = hue;
        this.points = points;
        this.destroyed = false;
        this.animation = 0;
        this.special = false;
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.destroyed = true;
        }
        this.animation = 1;
        return true;
    }
    
    draw(ctx) {
        if (this.destroyed && !this.isRegenerating) return;
        
        if (this.animation > 0) {
            this.animation -= 0.1;
        }
        
        ctx.save();
        
        const scale = 1 + this.animation * 0.1;
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.scale(scale, scale);
        ctx.translate(-this.width/2, -this.height/2);
        
        let alpha = this.health / this.maxHealth;
        
        // Apply special effects
        if (this.isInvisible) {
            alpha *= (this.alpha || 0.3);
        }
        
        if (this.isObstacle) {
            alpha = 1;
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 15;
        }
        
        const lightness = 40 + (alpha * 30);
        
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, ${lightness + 20}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, ${lightness}%, ${alpha})`);
        
        ctx.shadowColor = `hsl(${this.hue}, 70%, 60%)`;
        ctx.shadowBlur = 8 + this.animation * 10;
        
        // Special visual effects
        if (this.isMoving && !this.isObstacle) {
            ctx.shadowBlur += 5;
            ctx.shadowColor = '#00d4ff';
        }
        
        if (this.isRegenerating) {
            const regenProgress = this.regenTimer / this.regenDelay;
            ctx.strokeStyle = '#00ff9f';
            ctx.lineWidth = 3;
            ctx.strokeRect(-2, -2, this.width + 4, this.height + 4);
            
            // Regeneration progress bar
            ctx.fillStyle = '#00ff9f';
            ctx.fillRect(0, -8, this.width * regenProgress, 4);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.strokeStyle = `hsla(${this.hue}, 70%, ${lightness + 30}%, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this.width, this.height);
        
        if (this.health > 1 || this.isObstacle) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'center';
            const text = this.isObstacle ? '⚠' : this.health;
            ctx.fillText(text, this.width/2, this.height/2 + 4);
        }
        
        ctx.restore();
    }
    
    serialize() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            health: this.health,
            maxHealth: this.maxHealth,
            hue: this.hue,
            points: this.points,
            destroyed: this.destroyed,
            special: this.special
        };
    }
    
    static deserialize(data) {
        const brick = new Brick(data);
        brick.destroyed = data.destroyed;
        brick.special = data.special;
        return brick;
    }
}

class PowerUp {
    constructor({ x, y, type, icon, color, description }) {
        this.x = x;
        this.y = y;
        this.dy = 2;
        this.type = type;
        this.icon = icon;
        this.color = color;
        this.description = description;
        this.rotation = 0;
        this.scale = 1;
        this.pulse = 0;
    }
    
    update(deltaTime) {
        this.y += this.dy * (deltaTime / 16);
        this.rotation += 0.02;
        this.pulse += 0.1;
        this.scale = 1 + Math.sin(this.pulse) * 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = this.color + '40';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '16px Orbitron';
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        ctx.restore();
    }
}