NSArena.CombatSystem = class {
    constructor(game) { this.game=game; }
    // True if (tx,ty) falls inside attacker's forward-facing cone (attackConeDeg wide).
    inCone(attacker, tx, ty) {
        const dx=tx-attacker.x, dy=ty-attacker.y;
        const angleToTarget = Math.atan2(dy, dx);
        let diff = Math.abs(angleToTarget - attacker.faceAngle);
        if (diff > Math.PI) diff = Math.PI*2 - diff;
        return diff <= (attacker.attackConeDeg * Math.PI/180) / 2;
    }
    playerAttack(player) {
        if (!player.canAttack()) return;
        player.attack();
        player.attackFlash = player.attackFlashMax;
        this.game.audio.playFire();
        for (const bot of this.game.redBots) {
            if (bot.alive && Math.hypot(player.x-bot.x, player.y-bot.y) <= player.attackRange+bot.radius
                && this.inCone(player, bot.x, bot.y)) {
                bot.takeDamage(player.attackDmg, player);
                this.game.spawnParticles(bot.x, bot.y, '#ff3355', 6);
            }
        }
        const a=player.faceAngle, sx=player.x+Math.cos(a)*25, sy=player.y+Math.sin(a)*25;
        this.game.spawnParticles(sx, sy, '#00e5ff', 4);
    }
    botAttack(bot) {
        if (!bot.canAttack()) return;
        bot.attack();
        bot.attackFlash = bot.attackFlashMax;
        const targets = bot.team==='blue'? this.game.redBots : this.game.blueBots;
        const player = this.game.player;
        if (player && player.alive && bot.team!=='blue' && Math.hypot(bot.x-player.x, bot.y-player.y) <= bot.attackRange+player.radius
            && this.inCone(bot, player.x, player.y)) {
            player.takeDamage(bot.attackDmg);
            this.game.spawnParticles(player.x, player.y, '#3399ff', 6);
            return;
        }
        for (const t of targets) {
            if (t.alive && Math.hypot(bot.x-t.x, bot.y-t.y) <= bot.attackRange+t.radius
                && this.inCone(bot, t.x, t.y)) {
                t.takeDamage(bot.attackDmg, bot);
                this.game.spawnParticles(t.x, t.y, t.team==='blue'?'#3399ff':'#ff3355', 6);
            }
        }
    }
};