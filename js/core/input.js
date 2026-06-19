NSArena.InputHandler = class {
    constructor(game) {
        this.game=game; this.keys={}; this.mouseX=0; this.mouseY=0; this.mouseDown=false;
        this.isAttacking=false; this.isDashing=false;
        window.addEventListener('keydown',e=>{ this.keys[e.key.toLowerCase()]=true; if(e.key===' ') { e.preventDefault(); this.isDashing=true; } });
        window.addEventListener('keyup',e=>{ this.keys[e.key.toLowerCase()]=false; if(e.key===' ') this.isDashing=false; });
        window.addEventListener('mousedown',e=>{ if(e.button===0) { this.mouseDown=true; this.isAttacking=true; } });
        window.addEventListener('mouseup',e=>{ if(e.button===0) this.mouseDown=false; });
        window.addEventListener('mousemove',e=>{ this.mouseX=e.clientX; this.mouseY=e.clientY; });
        window.addEventListener('contextmenu',e=>e.preventDefault());
    }
    update() { this.isAttacking = this.mouseDown; }
    getMovement() {
        const dir={x:0,y:0};
        if (this.keys['w']||this.keys['arrowup']) dir.y=-1;
        if (this.keys['s']||this.keys['arrowdown']) dir.y=1;
        if (this.keys['a']||this.keys['arrowleft']) dir.x=-1;
        if (this.keys['d']||this.keys['arrowright']) dir.x=1;
        const len=Math.sqrt(dir.x*dir.x+dir.y*dir.y);
        if (len>1) { dir.x/=len; dir.y/=len; }
        return dir;
    }
};