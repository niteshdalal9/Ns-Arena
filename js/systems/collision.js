NSArena.CollisionSystem = class {
    constructor(game) { this.game=game; }
    clamp(entity) {
        const m=entity.radius+8, w=this.game.worldWidth, h=this.game.worldHeight;
        entity.x = Math.max(m, Math.min(w-m, entity.x));
        entity.y = Math.max(m, Math.min(h-m, entity.y));
    }
    checkKit(kit) {
        if (!kit.active) return;
        const entities = [this.game.player, ...this.game.blueBots, ...this.game.redBots].filter(e=>e && e.alive);
        for (const e of entities) {
            if (Math.hypot(e.x-kit.x, e.y-kit.y) < e.radius+kit.radius && e.health < e.maxHealth) {
                e.heal(kit.healAmt);
                kit.collect();
                this.game.spawnParticles(kit.x, kit.y, '#00ff88', 8);
                break;
            }
        }
    }
};