NSArena.MobileControls = class {
    constructor(game) {
        this.game=game;
        this.moveActive=false; this.moveCenter={x:0,y:0}; this.moveValue={x:0,y:0};
        this.fireActive=false; this.fireCenter={x:0,y:0}; this.fireValue={x:0,y:0};
        this.isDashing=false;
    }
    setup() {
        const canvas = this.game.canvas;
        canvas.addEventListener('touchstart', e=>{
            // Only hijack touches for joystick/attack controls during actual gameplay.
            // Outside PLAYING (menu/settings/about/victory), let the touch fall through
            // so the browser can synthesize its normal 'click' event for canvas buttons.
            if (this.game.state !== NSArena.GameState.PLAYING) return;
            e.preventDefault();
            for (const t of e.changedTouches) {
                if (t.clientX < window.innerWidth*0.45 && !this.moveActive) {
                    this.moveActive=true; this.moveId=t.identifier;
                    this.updateMove(t.clientX, t.clientY);
                } else if (this.isInFireZone(t.clientX, t.clientY) && !this.fireActive) {
                    this.fireActive=true; this.fireId=t.identifier;
                    this.updateFire(t.clientX, t.clientY);
                }
            }
        }, {passive:false});
        canvas.addEventListener('touchmove', e=>{
            if (this.game.state !== NSArena.GameState.PLAYING) return;
            e.preventDefault();
            for (const t of e.changedTouches) {
                if (t.identifier===this.moveId) this.updateMove(t.clientX, t.clientY);
                else if (t.identifier===this.fireId) this.updateFire(t.clientX, t.clientY);
            }
        }, {passive:false});
        canvas.addEventListener('touchend', e=>{
            for (const t of e.changedTouches) {
                if (t.identifier===this.moveId) { this.moveActive=false; this.moveId=null; this.moveValue={x:0,y:0}; }
                else if (t.identifier===this.fireId) { this.fireActive=false; this.fireId=null; this.fireValue={x:0,y:0}; }
            }
        });
        document.getElementById('btn-dash').addEventListener('touchstart', e=>{ e.preventDefault(); this.isDashing=true; });
        document.getElementById('btn-dash').addEventListener('touchend', ()=> this.isDashing=false);
        this.updateCenters();
    }
    updateCenters() {
        const w=window.innerWidth, h=window.innerHeight;
        this.moveCenter = { x:30+70, y: h-30-70 };
        const fireBase = document.getElementById('fire-joystick-base');
        if (fireBase) {
            const rect = fireBase.getBoundingClientRect();
            this.fireCenter = { x: rect.left+rect.width/2, y: rect.top+rect.height/2 };
        }
    }
    isInFireZone(tx, ty) {
        const dx=tx-this.fireCenter.x, dy=ty-this.fireCenter.y;
        return Math.hypot(dx,dy) < 60;
    }
    updateMove(tx,ty) {
        const dx=tx-this.moveCenter.x, dy=ty-this.moveCenter.y;
        const dist=Math.hypot(dx,dy);
        const max=40;
        const val = dist>max ? {x:(dx/dist)*max, y:(dy/dist)*max} : {x:dx, y:dy};
        this.moveValue = { x: val.x/max, y: val.y/max };
        const thumb = document.getElementById('joystick-thumb');
        if (thumb) thumb.style.transform = `translate(calc(-50% + ${val.x}px), calc(-50% + ${val.y}px))`;
    }
    updateFire(tx,ty) {
        const dx=tx-this.fireCenter.x, dy=ty-this.fireCenter.y;
        const dist=Math.hypot(dx,dy);
        const max=35;
        const val = dist>max ? {x:(dx/dist)*max, y:(dy/dist)*max} : {x:dx, y:dy};
        this.fireValue = dist>2 ? { x: val.x/max, y: val.y/max } : {x:0,y:0};
        const thumb = document.getElementById('fire-joystick-thumb');
        if (thumb) thumb.style.transform = `translate(calc(-50% + ${val.x}px), calc(-50% + ${val.y}px))`;
    }
    getMovement() { return this.moveActive ? this.moveValue : {x:0,y:0}; }
    getAttackDirection() { return this.fireActive && (this.fireValue.x||this.fireValue.y) ? this.fireValue : null; }
    get isAttacking() { return this.fireActive; }
    update(dt) {
        // No automatic reset of isDashing – the touchend handler does it,
        // and the game consumes it after a successful dash.
    }
};