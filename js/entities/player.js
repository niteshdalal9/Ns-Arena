NSArena.Player = class {
    constructor(game,x,y) {
        this.game = game; this.x=x; this.y=y; this.radius=18; this.speed=220;
        this.maxHealth=100; this.health=100; this.alive=true; this.team='blue';
        this.faceAngle=0; this.attackCD=0; this.attackCDMax=0.36; this.attackRange=67.5; this.attackDmg=20;
        this.attackConeDeg=70; this.attackFlash=0; this.attackFlashMax=0.15;
        this.dashCD=0; this.dashCDMax=3; this.dashSpeed=500; this.dashDur=0; this.dashDurMax=0.15; this.dashDir={x:0,y:0};
        this.invuln=0; this.hitFlash=0;
    }
    update(dt, move, skipFacingFromMove) {
        this.attackCD = Math.max(0, this.attackCD-dt);
        this.dashCD = Math.max(0, this.dashCD-dt);
        this.invuln = Math.max(0, this.invuln-dt);
        this.hitFlash = Math.max(0, this.hitFlash-dt);
        this.attackFlash = Math.max(0, this.attackFlash-dt);
        if (this.dashDur > 0) {
            this.dashDur-=dt;
            this.x += this.dashDir.x * this.dashSpeed * dt;
            this.y += this.dashDir.y * this.dashSpeed * dt;
            return;
        }
        if (move.x || move.y) {
            if (!skipFacingFromMove) this.faceAngle = Math.atan2(move.y, move.x);
            this.x += move.x * this.speed * dt;
            this.y += move.y * this.speed * dt;
        }
    }
    canAttack() { return this.attackCD <= 0 && this.dashDur <= 0; }
    attack() { this.attackCD = this.attackCDMax; }
    canDash() { return this.dashCD <= 0 && this.dashDur <= 0; }
    dash(dir) {
        const len = Math.sqrt(dir.x*dir.x+dir.y*dir.y) || 1;
        this.dashDir = { x: dir.x/len, y: dir.y/len };
        this.dashDur = this.dashDurMax;
        this.dashCD = this.dashCDMax;
        this.invuln = this.dashDurMax;
    }
    takeDamage(dmg) {
        if (this.invuln > 0) return;
        this.health -= dmg; this.hitFlash = 0.15; this.invuln = 0.2;
        if (this.health <= 0) { this.health=0; this.alive=false; this.game.onKill(null, this); }
    }
    heal(amt) { this.health = Math.min(this.maxHealth, this.health+amt); }
};