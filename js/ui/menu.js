// js/ui/menu.js
NSArena.MenuUI = class {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        this.updateButtons();
    }

    updateButtons() {
        const w = this.game.width;
        const h = this.game.height;
        if (this.game.state === NSArena.GameState.MENU) {
            this.buttons = [
                { label: 'PLAY',       x: w/2, y: h*0.48, w: 200, h: 50, action: 'play' },
                { label: 'SETTINGS',   x: w/2, y: h*0.58, w: 200, h: 50, action: 'settings' },
                { label: 'ABOUT',      x: w/2, y: h*0.68, w: 200, h: 50, action: 'about' },
            ];
        } else if (this.game.state === NSArena.GameState.SETTINGS ||
                   this.game.state === NSArena.GameState.ABOUT) {
            this.buttons = [
                { label: 'BACK',       x: w/2, y: h*0.75, w: 200, h: 50, action: 'back' },
            ];
        } else {
            this.buttons = [];
        }
    }

    draw(ctx, w, h, state) {
        this.updateButtons();

        if (state === NSArena.GameState.MENU) {
            ctx.fillStyle = '#00e5ff';
            ctx.font = `bold ${Math.min(w*0.07, 48)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('NS ARENA 2.0', w/2, h*0.22);
            ctx.fillStyle = '#a0a0b0';
            ctx.font = `${Math.min(w*0.02, 15)}px monospace`;
            ctx.fillText('Powered by NS SYSTEMS', w/2, h*0.29);
            ctx.fillStyle = '#8b5cf6';
            ctx.font = `${Math.min(w*0.016, 12)}px monospace`;
            ctx.fillText('Nitesh Dalal | Vanshika | Shankar Thakur', w/2, h*0.88);
        } else if (state === NSArena.GameState.SETTINGS) {
            ctx.fillStyle = '#00e5ff';
            ctx.font = `bold ${Math.min(w*0.05, 36)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('SETTINGS', w/2, h*0.25);
            ctx.fillStyle = '#c0c0d0';
            ctx.font = `${Math.min(w*0.022, 16)}px monospace`;
            ctx.fillText('WASD + Mouse | Mobile: Joysticks', w/2, h*0.42);
        } else if (state === NSArena.GameState.ABOUT) {
            ctx.fillStyle = '#00e5ff';
            ctx.font = `bold ${Math.min(w*0.05, 36)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('ABOUT', w/2, h*0.2);
            ctx.fillStyle = '#c0c0d0';
            ctx.font = `${Math.min(w*0.02, 15)}px monospace`;
            ctx.fillText('Arena Combat Simulator', w/2, h*0.32);
            ctx.fillStyle = '#8b5cf6';
            ctx.font = `bold ${Math.min(w*0.022, 17)}px monospace`;
            ctx.fillText('Nitesh Dalal  Vanshika  Shankar Thakur', w/2, h*0.56);
        }

        for (const b of this.buttons) {
            const hover = this.isHover(b);
            ctx.fillStyle = hover ? 'rgba(0,140,220,0.5)' : 'rgba(0,30,60,0.5)';
            ctx.strokeStyle = hover ? '#00e5ff' : 'rgba(0,191,255,0.5)';
            ctx.lineWidth = 2;
            this.roundRect(ctx, b.x - b.w/2, b.y - b.h/2, b.w, b.h, 10);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = hover ? '#fff' : '#00e5ff';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.label, b.x, b.y);
        }
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r);
        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h);
        ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
    }

    isHover(btn) {
        const mx = this.game.input.mouseX;
        const my = this.game.input.mouseY;
        return mx >= btn.x - btn.w/2 && mx <= btn.x + btn.w/2 &&
               my >= btn.y - btn.h/2 && my <= btn.y + btn.h/2;
    }

    handleClick(mx, my) {
        this.updateButtons();
        for (const b of this.buttons) {
            if (mx >= b.x - b.w/2 && mx <= b.x + b.w/2 &&
                my >= b.y - b.h/2 && my <= b.y + b.h/2) {
                if (b.action === 'play') this.game.startMatch();
                else if (b.action === 'settings') { this.game.state = NSArena.GameState.SETTINGS; this.init(); }
                else if (b.action === 'about') { this.game.state = NSArena.GameState.ABOUT; this.init(); }
                else if (b.action === 'back') { this.game.state = NSArena.GameState.MENU; this.init(); }
                break;
            }
        }
    }
};