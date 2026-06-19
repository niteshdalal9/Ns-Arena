NSArena.SpawnSystem = class {
    constructor(game) { this.game=game; this.maxKits=6; this.timer=0; }
    initKits() {
        const kits=[], w=this.game.worldWidth, h=this.game.worldHeight, m=80;
        const spots = [
            {x:w*0.2,y:h*0.25},{x:w*0.35,y:h*0.5},{x:w*0.5,y:h*0.3},
            {x:w*0.5,y:h*0.7},{x:w*0.65,y:h*0.5},{x:w*0.8,y:h*0.25},
            {x:w*0.3,y:h*0.75},{x:w*0.7,y:h*0.75}
        ];
        for (let i=0;i<this.maxKits;i++) {
            const loc = spots[i] || {x:m+Math.random()*(w-m*2), y:m+Math.random()*(h-m*2)};
            kits.push(new NSArena.HealthKit(this.game, loc.x, loc.y, i<2?'large':'small'));
        }
        return kits;
    }
    update(dt) {
        this.timer+=dt;
        if (this.timer>=3) { this.timer=0; const active=this.game.healthKits.filter(k=>k.active).length;
            if (active<3) {
                const inactive=this.game.healthKits.filter(k=>!k.active && k.respawnTimer<=0);
                if (inactive.length) { const k=inactive[Math.floor(Math.random()*inactive.length)]; k.active=true; }
            }
        }
    }
};