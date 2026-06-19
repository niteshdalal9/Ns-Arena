NSArena.LoginUI = class {
    constructor(game) {
        this.game=game; this.accounts=JSON.parse(localStorage.getItem('nsaccounts')||'{}');
        this.mode='login';
        this.form=document.getElementById('login-form');
        this.user=document.getElementById('login-username');
        this.pass=document.getElementById('login-password');
        this.msg=document.getElementById('login-message');
        document.getElementById('btn-login').addEventListener('click', ()=>this.submit());
        document.getElementById('btn-register').addEventListener('click', ()=>this.toggleMode());
        document.getElementById('btn-guest').addEventListener('click', ()=>this.guest());
    }
    show() { this.form.classList.remove('hidden'); this.user.value=''; this.pass.value=''; this.msg.textContent=''; }
    hide() { this.form.classList.add('hidden'); }
    submit() {
        const u=this.user.value.trim(), p=this.pass.value;
        if(!u||!p) { this.msg.textContent='Fill all fields.'; return; }
        if(this.mode==='register') {
            if(this.accounts[u]) { this.msg.textContent='Username exists.'; return; }
            this.accounts[u]=btoa(p); localStorage.setItem('nsaccounts',JSON.stringify(this.accounts));
            this.msg.textContent='Account created. Login now.'; this.mode='login';
        } else {
            if(!this.accounts[u]||this.accounts[u]!==btoa(p)) { this.msg.textContent='Invalid credentials.'; return; }
            this.hide(); this.game.state=NSArena.GameState.LOADING; this.game.loadingTarget='menu'; this.game.loadingUI.reset();
        }
    }
    toggleMode() { this.mode=this.mode==='login'?'register':'login'; this.msg.textContent=''; }
    guest() { this.hide(); this.game.state=NSArena.GameState.LOADING; this.game.loadingTarget='menu'; this.game.loadingUI.reset(); }
};