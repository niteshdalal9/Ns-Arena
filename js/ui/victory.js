NSArena.VictoryUI = class {
    init() {}
    draw(ctx, w, h, game) {
        ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(0,0,w,h);
        const winner = game.blueScore>=game.winScore?'blue':game.redScore>=game.winScore?'red':game.blueScore>game.redScore?'blue':'red';
        const txt = winner==='blue'?'VICTORY':'DEFEAT';
        ctx.fillStyle=winner==='blue'?'#00e5ff':'#ff3355';
        ctx.font=`bold ${Math.min(w*0.07,50)}px monospace`; ctx.textAlign='center';
        ctx.fillText(txt, w/2, h*0.22);
        ctx.fillStyle='#fff'; ctx.font=`bold ${Math.min(w*0.035,24)}px monospace`;
        ctx.fillText(`BLUE ${game.blueScore} - ${game.redScore} RED`, w/2, h*0.38);
        this.drawButton(ctx, w/2, h*0.72, 'PLAY AGAIN', ()=>{ game.startMatch(); });
        this.drawButton(ctx, w/2, h*0.82, 'MAIN MENU', ()=>{ game.state=NSArena.GameState.MENU; game.menu.init(); game.updateMobileOverlay(); });
    }
    drawButton(ctx, x, y, label, action) {
        const w=200, h=45, hover=this.isHover(x,y,w,h);
        ctx.fillStyle=hover?'rgba(0,140,220,0.5)':'rgba(0,30,60,0.5)';
        ctx.strokeStyle='rgba(0,200,255,0.6)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.rect(x-w/2, y-h/2, w, h); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#fff'; ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(label, x, y);
    }
    isHover(x,y,w,h) {
        const mx=this.game.input.mouseX, my=this.game.input.mouseY;
        return mx>=x-w/2 && mx<=x+w/2 && my>=y-h/2 && my<=y+h/2;
    }
    handleClick(mx, my) {
        if (this.isHover(this.game.width/2, this.game.height*0.72, 200, 45)) this.game.startMatch();
        else if (this.isHover(this.game.width/2, this.game.height*0.82, 200, 45)) {
            this.game.state=NSArena.GameState.MENU; this.game.menu.init(); this.game.updateMobileOverlay();
        }
    }
};