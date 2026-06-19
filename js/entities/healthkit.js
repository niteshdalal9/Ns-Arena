NSArena.HealthKit = class {
    constructor(game, x, y, type) {
        this.game=game; this.x=x; this.y=y; this.type=type;
        this.radius=type==='large'?14:10; this.healAmt=type==='large'?50:25;
        this.active=true; this.pulse=Math.random()*Math.PI*2;
        this.respawnTime=type==='large'?25:15; this.respawnTimer=0;
    }
    update(dt) {
        this.pulse+=dt*3;
        if (!this.active) { this.respawnTimer-=dt; if (this.respawnTimer<=0) { this.active=true; this.pulse=Math.random()*Math.PI*2; } }
    }
    collect() { this.active=false; this.respawnTimer=this.respawnTime; }
};