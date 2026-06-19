NSArena.AudioManager = class {
    constructor() { this.ctx=null; try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){} }
    unlock() { if(this.ctx&&this.ctx.state==='suspended') this.ctx.resume(); }
    playFire() {
        if(!this.ctx) return;
        const now=this.ctx.currentTime, len=this.ctx.sampleRate*0.08;
        const buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
        const data=buf.getChannelData(0);
        for(let i=0;i<len;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(len*0.15));
        const src=this.ctx.createBufferSource(); src.buffer=buf;
        const flt=this.ctx.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=1200; flt.Q.value=0.8;
        const gain=this.ctx.createGain(); gain.gain.setValueAtTime(0.15,now); gain.gain.exponentialRampToValueAtTime(0.001,now+0.12);
        src.connect(flt); flt.connect(gain); gain.connect(this.ctx.destination);
        src.start(now); src.stop(now+0.12);
    }
};