NSArena.HUD = class {
    update(dt) {}
    draw(ctx, w, game) {
        const p=game.player;
        if (p && p.alive) {
            const ratio=p.health/p.maxHealth;
            ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(15,15,200,20);
            ctx.fillStyle=ratio>0.6?'#00ff88':ratio>0.3?'#ffcc00':'#ff3355';
            ctx.fillRect(15,15,200*ratio,20);
            ctx.fillStyle='#fff'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
            ctx.fillText(`HP ${p.health}/${p.maxHealth}`, 115, 30);
        }
        ctx.fillStyle='#fff'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
        ctx.fillText(`BLUE ${game.blueScore} / ${game.redScore} RED`, w/2, 18);
        const mins=Math.floor(game.matchTimer/60), secs=Math.floor(game.matchTimer%60);
        ctx.fillText(`${mins}:${secs.toString().padStart(2,'0')}`, w/2, 50);
        ctx.textAlign='right'; ctx.font='13px monospace';
        ctx.fillText(`KILLS: ${game.playerKills}`, w-15, 18);
        ctx.fillText(`DEATHS: ${game.playerDeaths}`, w-15, 36);
        ctx.textAlign='left';
    }
};