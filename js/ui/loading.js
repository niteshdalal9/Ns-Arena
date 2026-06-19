NSArena.LoadingUI = class {
    constructor(game) { this.game = game; this.timer = 0; this.duration = 1.5; }
    reset() { this.timer = 0; }
    update(dt) {
        this.timer += dt;
        if (this.timer >= this.duration) {
            if (this.game.loadingTarget === 'menu') {
                this.game.state = NSArena.GameState.MENU;
                this.game.menu.init();
            } else if (this.game.loadingTarget === 'match') {
                this.game.state = NSArena.GameState.PLAYING;
            }
            this.game.updateMobileOverlay();
        }
    }
    draw(ctx, w, h) {
        ctx.fillStyle = '#020212'; ctx.fillRect(0,0,w,h);
        const p = this.timer / this.duration, bw = Math.min(w*0.4,300), bx = w/2 - bw/2, by = h*0.6;
        ctx.fillStyle = '#00e5ff';
        ctx.font = `bold ${Math.min(w*0.04,28)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('LOADING...', w/2, h*0.45);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(bx, by, bw, 6);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(bx, by, bw * p, 6);
    }
};