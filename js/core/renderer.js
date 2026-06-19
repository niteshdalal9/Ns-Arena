NSArena.Renderer = class {
    constructor(game) { this.game = game; this.stars = []; for (let i=0;i<100;i++) this.stars.push({x:Math.random()*2000,y:Math.random()*2000,s:1+Math.random()*2,a:0.3+Math.random()*0.5}); }
    drawBackground() {
        const ctx=this.game.ctx, w=this.game.width, h=this.game.height;
        ctx.fillStyle='#06060d'; ctx.fillRect(0,0,w,h);
        const time=performance.now()/1000;
        for (const s of this.stars) {
            const sx=((s.x%w)+w)%w, sy=((s.y%h)+h)%h;
            ctx.fillStyle=`rgba(0,200,255,${s.a*(0.6+0.4*Math.sin(time*2+s.x))})`;
            ctx.beginPath(); ctx.arc(sx,sy,s.s,0,Math.PI*2); ctx.fill();
            s.y-=0.1; if(s.y<-10)s.y=h+10;
        }
    }
    drawStartup(phase, elapsed, phases) {
        const ctx=this.game.ctx, w=this.game.width, h=this.game.height;
        ctx.fillStyle='#020212'; ctx.fillRect(0,0,w,h);
        const cx=w/2, cy=h/2, pulse=1+Math.sin(elapsed*3)*0.15;
        ctx.save(); ctx.globalAlpha=0.3; ctx.strokeStyle='#00e5ff'; ctx.lineWidth=3; ctx.shadowColor='#00e5ff'; ctx.shadowBlur=30*pulse;
        ctx.beginPath(); ctx.arc(cx,cy-40,80*pulse,0,Math.PI*2); ctx.stroke(); ctx.restore();
        const alpha = phase===3 ? Math.max(0,1-(elapsed-phases[0].duration-phases[1].duration-phases[2].duration)/phases[3].duration) : 1;
        if (phase>=0) {
            ctx.save(); ctx.globalAlpha=alpha; ctx.font=`bold ${Math.min(w*0.09,70)}px monospace`; ctx.textAlign='center';
            ctx.fillStyle='#fff'; ctx.shadowColor='#00e5ff'; ctx.shadowBlur=50*pulse;
            ctx.fillText('NS', cx, cy-50); ctx.fillText('SYSTEMS', cx, cy+20); ctx.restore();
        }
        if (phase>=1) {
            ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle='#a0a0b0'; ctx.font=`${Math.min(w*0.025,18)}px monospace`; ctx.textAlign='center';
            ctx.fillText('Powered by NS SYSTEMS', cx, cy+70); ctx.restore();
        }
        if (phase>=2) {
            const devs=['Nitesh Dalal','Vanshika','Shankar Thakur'];
            ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle='#8b5cf6'; ctx.font=`${Math.min(w*0.032,22)}px monospace`; ctx.textAlign='center';
            for (let i=0;i<devs.length;i++) ctx.fillText(devs[i], cx, cy+120+i*32);
            ctx.restore();
        }
        if (phase<3) {
            const totalDur=phases[0].duration+phases[1].duration+phases[2].duration;
            const progress=Math.min(1, elapsed/totalDur);
            const bw=Math.min(w*0.45,350), bx=cx-bw/2, by=h*0.85;
            ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(bx,by,bw,5);
            ctx.shadowColor='#00e5ff'; ctx.shadowBlur=12;
            const grad=ctx.createLinearGradient(bx,0,bx+bw,0); grad.addColorStop(0,'#00e5ff'); grad.addColorStop(1,'#8b5cf6');
            ctx.fillStyle=grad; ctx.fillRect(bx,by,bw*progress,5); ctx.shadowBlur=0;
        }
    }
    drawArena() {
        const ctx=this.game.ctx, w=this.game.width, h=this.game.height;
        const cam=this.game.camera, ww=this.game.worldWidth, wh=this.game.worldHeight;
        ctx.fillStyle='#0a0a14'; ctx.fillRect(0,0,w,h);
        ctx.save();
        ctx.translate(-cam.x, -cam.y);
        // Grid lines, only across the visible slice of the world for performance
        ctx.strokeStyle='rgba(0,150,200,0.08)'; ctx.lineWidth=0.5;
        const startX = Math.max(0, Math.floor(cam.x/50)*50), endX = Math.min(ww, cam.x+w);
        for (let x=startX; x<=endX; x+=50) { ctx.beginPath(); ctx.moveTo(x,Math.max(0,cam.y)); ctx.lineTo(x,Math.min(wh,cam.y+h)); ctx.stroke(); }
        const startY = Math.max(0, Math.floor(cam.y/50)*50), endY = Math.min(wh, cam.y+h);
        for (let y=startY; y<=endY; y+=50) { ctx.beginPath(); ctx.moveTo(Math.max(0,cam.x),y); ctx.lineTo(Math.min(ww,cam.x+w),y); ctx.stroke(); }
        // Mid-map divider
        ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=2; ctx.setLineDash([10,20]);
        ctx.beginPath(); ctx.moveTo(ww/2,0); ctx.lineTo(ww/2,wh); ctx.stroke(); ctx.setLineDash([]);
        // World border
        ctx.strokeStyle='rgba(0,229,255,0.4)'; ctx.lineWidth=3; ctx.strokeRect(2,2,ww-4,wh-4);
        ctx.restore();
    }
    drawEntities(player, blue, red, kits) {
        const ctx=this.game.ctx, cam=this.game.camera;
        ctx.save();
        ctx.translate(-cam.x, -cam.y);
        for (const k of kits) if (k.active) this.drawKit(k);
        for (const b of blue) if (b.alive) this.drawBot(b, '#3399ff');
        for (const b of red) if (b.alive) this.drawBot(b, '#ff3355');
        if (player && player.alive) this.drawPlayer(player);
        ctx.restore();
    }
    drawPlayer(p) {
        const ctx=this.game.ctx;
        this.drawAttackCone(p, '#00e5ff');
        ctx.save(); ctx.shadowColor='rgba(0,191,255,0.7)'; ctx.shadowBlur=18;
        ctx.fillStyle='#1a8aff'; ctx.strokeStyle='#00e5ff'; ctx.lineWidth=2.5;
        this.hexagon(ctx, p.x, p.y, p.radius); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(p.x+Math.cos(p.faceAngle)*12, p.y+Math.sin(p.faceAngle)*12, 4,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
    drawBot(b, col) {
        const ctx=this.game.ctx;
        this.drawAttackCone(b, col);
        ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=8;
        ctx.fillStyle='#000'; ctx.strokeStyle=col; ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(b.x, b.y-b.radius); ctx.lineTo(b.x+b.radius*0.7, b.y); ctx.lineTo(b.x, b.y+b.radius); ctx.lineTo(b.x-b.radius*0.7, b.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(b.x+Math.cos(b.faceAngle)*7, b.y+Math.sin(b.faceAngle)*7, 2.5,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
    // Briefly flashes a translucent wedge showing the directional attack cone that just fired.
    drawAttackCone(entity, color) {
        if (!(entity.attackFlash > 0)) return;
        const ctx=this.game.ctx;
        const half = (entity.attackConeDeg * Math.PI/180) / 2;
        ctx.save();
        ctx.globalAlpha = (entity.attackFlash / entity.attackFlashMax) * 0.35;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(entity.x, entity.y);
        ctx.arc(entity.x, entity.y, entity.attackRange, entity.faceAngle-half, entity.faceAngle+half);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    drawKit(k) {
        const ctx=this.game.ctx, r=k.radius+Math.sin(k.pulse)*2;
        ctx.save(); ctx.shadowColor='rgba(0,255,136,0.6)'; ctx.shadowBlur=12;
        ctx.fillStyle=k.type==='large'?'rgba(0,200,100,0.8)':'rgba(0,180,80,0.7)';
        ctx.strokeStyle='#00ff88'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(k.x, k.y, r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#fff'; ctx.fillRect(k.x-2, k.y-r*0.6, 4, r*1.2); ctx.fillRect(k.x-r*0.6, k.y-2, r*1.2, 4);
        ctx.restore();
    }
    drawParticles(parts) {
        const ctx=this.game.ctx, cam=this.game.camera;
        ctx.save();
        ctx.translate(-cam.x, -cam.y);
        for (const p of parts) { ctx.globalAlpha=p.alpha; ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); }
        ctx.globalAlpha=1;
        ctx.restore();
    }
    hexagon(ctx, x, y, r) {
        ctx.beginPath();
        for (let i=0;i<6;i++) { const a=Math.PI/3*i; ctx.lineTo(x+r*Math.cos(a), y+r*Math.sin(a)); }
        ctx.closePath();
    }
};