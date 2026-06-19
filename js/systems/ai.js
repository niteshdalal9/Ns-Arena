NSArena.AISystem = class {
    constructor(game) { this.game=game; }
    update(bot, dt) {
        bot.update(dt);
        if (!bot.alive) return;
        const hpRatio = bot.health/bot.maxHealth;
        const enemy = this.nearestEnemy(bot);
        const kit = this.nearestKit(bot);
        const distEnemy = enemy ? Math.hypot(bot.x-enemy.x, bot.y-enemy.y) : Infinity;
        const distKit = kit ? Math.hypot(bot.x-kit.x, bot.y-kit.y) : Infinity;
        if (hpRatio<0.35 && kit && distKit<650) { bot.state='healing'; bot.target=kit; }
        else if (enemy && distEnemy<480) { bot.state='chasing'; bot.target=enemy; }
        else if (enemy && distEnemy<800) { bot.state='chasing'; bot.target=enemy; }
        else { bot.state='patrol'; bot.target=null; }
        switch (bot.state) {
            case 'chasing': if (enemy && distEnemy>bot.attackRange+enemy.radius) bot.moveToward(enemy.x, enemy.y, dt); break;
            case 'healing': if (kit && kit.active) bot.moveToward(kit.x, kit.y, dt); break;
            case 'patrol':
                if (!bot.patrolTarget || Math.hypot(bot.x-bot.patrolTarget.x, bot.y-bot.patrolTarget.y)<20) {
                    bot.patrolTarget = { x:80+Math.random()*(this.game.worldWidth-160), y:80+Math.random()*(this.game.worldHeight-160) };
                }
                bot.moveToward(bot.patrolTarget.x, bot.patrolTarget.y, dt); break;
        }
        if (enemy && distEnemy <= bot.attackRange+enemy.radius+5 && bot.reactTimer<=0) {
            bot.faceAngle = Math.atan2(enemy.y-bot.y, enemy.x-bot.x);
            this.game.combat.botAttack(bot);
            bot.reactTimer = bot.reactTime;
        }
        if (bot.stuckTimer>1.5) { bot.stuckTimer=0; bot.patrolTarget=null; }
    }
    nearestEnemy(bot) {
        let best=null, min=Infinity;
        const player = this.game.player;
        if (bot.team==='red' && player && player.alive) { const d=Math.hypot(bot.x-player.x,bot.y-player.y); if(d<min){min=d; best=player;} }
        const foes = bot.team==='blue'? this.game.redBots : this.game.blueBots;
        for (const f of foes) if (f.alive) { const d=Math.hypot(bot.x-f.x,bot.y-f.y); if(d<min){min=d; best=f;} }
        return best;
    }
    nearestKit(bot) {
        let best=null, min=Infinity;
        for (const k of this.game.healthKits) if (k.active) { const d=Math.hypot(bot.x-k.x,bot.y-k.y); if(d<min){min=d; best=k;} }
        return best;
    }
};