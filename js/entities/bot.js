NSArena.Bot = class {
    constructor(game, team, index, pos) {
        this.game = game; this.team=team; this.index=index;
        this.x=pos.x; this.y=pos.y; this.radius=14; this.speed=150+Math.random()*60;
        this.maxHealth=100; this.health=100; this.alive=true;
        this.faceAngle = team==='blue'?0:Math.PI;
        this.attackCD=0; this.attackCDMax=0.55+Math.random()*0.25; this.attackRange=40; this.attackDmg=16+Math.floor(Math.random()*6);
        this.attackConeDeg=70; this.attackFlash=0; this.attackFlashMax=0.12;
        this.invuln=0; this.hitFlash=0;
        this.state='patrol'; this.target=null; this.patrolTarget=null;
        this.stuckTimer=0; this.lastX=this.x; this.lastY=this.y;
        this.reactTime=0.2+Math.random()*0.3; this.reactTimer=0;
    }
    update(dt) {
        this.attackCD = Math.max(0, this.attackCD-dt);
        this.invuln = Math.max(0, this.invuln-dt);
        this.hitFlash = Math.max(0, this.hitFlash-dt);
        this.attackFlash = Math.max(0, this.attackFlash-dt);
        this.reactTimer = Math.max(0, this.reactTimer-dt);
        const moved = Math.hypot(this.x-this.lastX, this.y-this.lastY);
        this.stuckTimer = moved < 5*dt ? this.stuckTimer+dt : 0;
        this.lastX=this.x; this.lastY=this.y;
    }
    canAttack() { return this.attackCD <= 0; }
    attack() { this.attackCD = this.attackCDMax; }
    takeDamage(dmg, attacker) {
        if (this.invuln > 0) return;
        this.health -= dmg; this.hitFlash=0.12; this.invuln=0.15;
        if (this.health <= 0) { this.health=0; this.alive=false; this.game.onKill(attacker||null, this); }
    }
    heal(amt) { this.health = Math.min(this.maxHealth, this.health+amt); }
    respawn(pos) {
        this.x=pos.x; this.y=pos.y; this.health=this.maxHealth; this.alive=true;
        this.attackCD=0; this.invuln=1.5; this.state='patrol'; this.target=null; this.stuckTimer=0;
    }
    moveToward(tx, ty, dt) {
        const dx=tx-this.x, dy=ty-this.y, dist=Math.hypot(dx,dy);
        if (dist<1) return;
        this.faceAngle = Math.atan2(dy,dx);
        const step = this.speed*dt;
        if (dist <= step) { this.x=tx; this.y=ty; }
        else { this.x += (dx/dist)*step; this.y += (dy/dist)*step; }
    }
};