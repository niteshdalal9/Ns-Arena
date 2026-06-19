// js/core/game.js
const NSArena = window.NSArena || {};

NSArena.GameState = {
    STARTUP: 'startup', LOGIN: 'login', LOADING: 'loading',
    MENU: 'menu', SETTINGS: 'settings', ABOUT: 'about',
    PLAYING: 'playing', VICTORY: 'victory'
};

NSArena.Game = class {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = NSArena.GameState.STARTUP;
        this.deltaTime = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.width = 0;
        this.height = 0;
        this.isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window && window.innerWidth < 1024);

        this.renderer = new NSArena.Renderer(this);
        this.input = new NSArena.InputHandler(this);
        this.mobile = new NSArena.MobileControls(this);
        this.audio = new NSArena.AudioManager();
        this.combat = new NSArena.CombatSystem(this);
        this.collision = new NSArena.CollisionSystem(this);
        this.spawner = new NSArena.SpawnSystem(this);
        this.ai = new NSArena.AISystem(this);
        this.menu = new NSArena.MenuUI(this);
        this.hud = new NSArena.HUD(this);
        this.victory = new NSArena.VictoryUI(this);
        this.loginUI = new NSArena.LoginUI(this);
        this.loadingUI = new NSArena.LoadingUI(this);

        this.player = null;
        this.blueBots = [];
        this.redBots = [];
        this.healthKits = [];
        this.particles = [];
        this.blueScore = 0;
        this.redScore = 0;
        this.playerKills = 0;
        this.playerDeaths = 0;
        this.matchTimer = 600;
        this.matchTime = 600;
        this.winScore = 30;
        this.matchActive = false;
        this.respawnQueue = [];
        this.lastJoystickDir = { x: 1, y: 0 };

        // World / camera: the arena is larger than the screen, camera follows the player
        this.worldScale = 3;
        this.worldWidth = 0;
        this.worldHeight = 0;
        this.camera = { x: 0, y: 0 };

        this.startupPhase = 0;
        this.startupTimer = 0;
        this.startupPhases = [
            { name: 'logo', duration: 2.2 },
            { name: 'powered', duration: 1.5 },
            { name: 'devs', duration: 3.0 },
            { name: 'fadeout', duration: 0.8 },
        ];

        this.loadingTarget = 'menu';
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initInputs();
    }

    initInputs() {
        // Canvas click routing for menus & victory (only one listener needed)
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            if (this.state === NSArena.GameState.MENU ||
                this.state === NSArena.GameState.SETTINGS ||
                this.state === NSArena.GameState.ABOUT) {
                this.menu.handleClick(mx, my);
            } else if (this.state === NSArena.GameState.VICTORY) {
                this.victory.handleClick(mx, my);
            }
        });

        // Mobile controls setup (only if needed)
        if (this.isMobile) {
            this.mobile.setup();
        }
        this.updateMobileOverlay();
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }

    start() {
        const loop = (now) => {
            this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
            this.lastTime = now;
            this.update(this.deltaTime);
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(dt) {
        switch (this.state) {
            case NSArena.GameState.STARTUP: this.updateStartup(dt); break;
            case NSArena.GameState.LOADING: this.loadingUI.update(dt); break;
            case NSArena.GameState.PLAYING: this.updateGameplay(dt); break;
        }
        this.input.update();
        if (this.isMobile) this.mobile.update(dt);
    }

    updateStartup(dt) {
        this.startupTimer += dt;
        const total = this.startupTimer;
        if (this.startupPhase === 0 && total >= 2.2) this.startupPhase = 1;
        if (this.startupPhase === 1 && total >= 3.7) this.startupPhase = 2;
        if (this.startupPhase === 2 && total >= 6.7) this.startupPhase = 3;
        if (this.startupPhase === 3 && total >= 7.5) {
            this.state = NSArena.GameState.LOGIN;
            this.loginUI.show();
        }
    }

    updateGameplay(dt) {
        if (!this.matchActive) return;
        this.matchTimer -= dt;
        if (this.matchTimer <= 0 || this.blueScore >= this.winScore || this.redScore >= this.winScore) {
            this.matchActive = false;
            this.state = NSArena.GameState.VICTORY;
            this.victory.init();
            this.updateMobileOverlay();
            return;
        }
        // Respawns
        for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
            const q = this.respawnQueue[i];
            q.timer -= dt;
            if (q.timer <= 0) {
                this.respawnQueue.splice(i, 1);
                if (q.type === 'player') {
                    this.player = new NSArena.Player(this, this.getSpawnPos('blue').x, this.getSpawnPos('blue').y);
                } else {
                    const bots = q.team === 'blue' ? this.blueBots : this.redBots;
                    const bot = bots.find(b => b.index === q.index && !b.alive);
                    if (bot) bot.respawn(this.getSpawnPos(q.team));
                }
            }
        }
        // Player
        if (this.player && this.player.alive) {
            let moveDir = this.input.getMovement();
            if (this.isMobile) {
                const joy = this.mobile.getMovement();
                if (joy.x || joy.y) { moveDir = joy; this.lastJoystickDir = { ...joy }; }
            } else if (moveDir.x || moveDir.y) this.lastJoystickDir = { ...moveDir };
            // On mobile, the fire joystick owns facing completely while it's held — movement
            // must never fight it for control of faceAngle, so you can strafe one way with
            // the move stick while independently aiming/firing another way with the fire stick.
            const fireOwnsFacing = this.isMobile && this.mobile.isAttacking;
            this.player.update(dt, moveDir, fireOwnsFacing);
            this.collision.clamp(this.player);
            if (!this.isMobile) {
                // Desktop: player always faces the mouse cursor (converted to world space)
                // so directional attacks line up with where you're aiming.
                // Important: use the IDEAL (non-lagged) camera target here, not the smoothed
                // this.camera used for rendering. The render camera lags slightly behind the
                // player while moving (that's what makes it look smooth) -- using that lagged
                // value here created a feedback loop where sustained movement with the mouse
                // resting near screen-center could lock faceAngle to a near-constant wrong
                // direction. The ideal target has no lag, so aim always matches the cursor.
                const camTarget = this.getCameraTarget();
                const worldMouseX = this.input.mouseX + camTarget.x;
                const worldMouseY = this.input.mouseY + camTarget.y;
                if (worldMouseX !== this.player.x || worldMouseY !== this.player.y) {
                    this.player.faceAngle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
                }
            }
            if (this.input.isAttacking || this.mobile.isAttacking) {
                if (this.isMobile && this.mobile.isAttacking) {
                    const aim = this.mobile.getAttackDirection();
                    if (aim) this.player.faceAngle = Math.atan2(aim.y, aim.x);
                }
                this.combat.playerAttack(this.player);
            }
            if ((this.input.isDashing || this.mobile.isDashing) && this.player.canDash()) {
                const dir = (moveDir.x || moveDir.y) ? moveDir : this.lastJoystickDir;
                this.player.dash(dir);
                this.input.isDashing = false;
                this.mobile.isDashing = false;
            }
        }
        this.updateCamera(dt);
        // Bots
        for (const bot of [...this.blueBots, ...this.redBots]) {
            if (bot.alive) { this.ai.update(bot, dt); this.collision.clamp(bot); }
        }
        // Health kits
        for (const kit of this.healthKits) {
            if (kit.active) { kit.update(dt); this.collision.checkKit(kit); }
        }
        this.spawner.update(dt);
        this.updateParticles(dt);
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
            else { p.x += p.vx * dt; p.y += p.vy * dt; p.alpha = p.life / p.maxLife; p.size *= 0.995; }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        switch (this.state) {
            case NSArena.GameState.STARTUP: this.renderer.drawStartup(this.startupPhase, this.startupTimer, this.startupPhases); break;
            case NSArena.GameState.LOGIN: this.renderer.drawBackground(); break;
            case NSArena.GameState.LOADING: this.loadingUI.draw(this.ctx, this.width, this.height); break;
            case NSArena.GameState.MENU: case NSArena.GameState.SETTINGS: case NSArena.GameState.ABOUT:
                this.renderer.drawBackground(); this.menu.draw(this.ctx, this.width, this.height, this.state); break;
            case NSArena.GameState.PLAYING:
                this.renderer.drawArena();
                this.renderer.drawEntities(this.player, this.blueBots, this.redBots, this.healthKits);
                this.renderer.drawParticles(this.particles);
                this.hud.draw(this.ctx, this.width, this);
                break;
            case NSArena.GameState.VICTORY:
                this.renderer.drawArena();
                this.renderer.drawEntities(this.player, this.blueBots, this.redBots, this.healthKits);
                this.renderer.drawParticles(this.particles);
                this.victory.draw(this.ctx, this.width, this.height, this);
                break;
        }
    }

    updateMobileOverlay() {
        const overlay = document.getElementById('mobile-overlay');
        if (this.isMobile && this.state === NSArena.GameState.PLAYING) {
            overlay.classList.remove('hidden');
            this.mobile.updateCenters();
        } else overlay.classList.add('hidden');
    }

    startMatch() {
        this.blueScore = 0; this.redScore = 0; this.playerKills = 0; this.playerDeaths = 0;
        this.matchTimer = this.matchTime; this.matchActive = true; this.respawnQueue = []; this.particles = [];
        this.worldWidth = this.width * this.worldScale;
        this.worldHeight = this.height * this.worldScale;
        this.player = new NSArena.Player(this, this.getSpawnPos('blue').x, this.getSpawnPos('blue').y);
        this.blueBots = []; for (let i = 0; i < 4; i++) this.blueBots.push(new NSArena.Bot(this, 'blue', i, this.getSpawnPos('blue')));
        this.redBots = []; for (let i = 0; i < 5; i++) this.redBots.push(new NSArena.Bot(this, 'red', i, this.getSpawnPos('red')));
        this.healthKits = this.spawner.initKits();
        this.snapCamera();
        this.state = NSArena.GameState.LOADING;
        this.loadingTarget = 'match';
        this.loadingUI.reset();
        this.updateMobileOverlay();
    }

    getSpawnPos(team) {
        const margin = 60;
        const xMin = team === 'blue' ? 0.05 : 0.75, xMax = team === 'blue' ? 0.25 : 0.95;
        const zoneX0 = this.worldWidth * xMin, zoneX1 = this.worldWidth * xMax;
        return {
            x: zoneX0 + margin + Math.random() * Math.max(0, (zoneX1 - zoneX0) - margin * 2),
            y: margin + Math.random() * (this.worldHeight * 0.8)
        };
    }

    // The ideal (non-lagged) camera position: exactly centers the player, clamped to
    // world bounds. Used both as the lerp target for the smoothed render camera, and
    // directly (lag-free) for mouse-aim direction.
    getCameraTarget() {
        if (!this.player) return { x: this.camera.x, y: this.camera.y };
        const targetX = Math.max(this.width / 2, Math.min(this.worldWidth - this.width / 2, this.player.x));
        const targetY = Math.max(this.height / 2, Math.min(this.worldHeight - this.height / 2, this.player.y));
        return { x: targetX - this.width / 2, y: targetY - this.height / 2 };
    }

    // Centers the camera on the player instantly (used at match start, no smoothing).
    snapCamera() {
        const t = this.getCameraTarget();
        this.camera = { x: t.x, y: t.y };
    }

    // Smoothly follows the player each frame, clamped so the camera never shows past the world edge.
    updateCamera(dt) {
        if (!this.player) return;
        const t = this.getCameraTarget();
        const lerp = Math.min(1, dt * 8);
        this.camera.x += (t.x - this.camera.x) * lerp;
        this.camera.y += (t.y - this.camera.y) * lerp;
    }

    onKill(killer, victim) {
        if (killer && killer.team === 'blue' && victim.team === 'red') { this.blueScore++; if (killer === this.player) this.playerKills++; }
        else if (killer && killer.team === 'red' && (victim === this.player || victim.team === 'blue')) { this.redScore++; if (victim === this.player) this.playerDeaths++; }
        this.spawnParticles(victim.x, victim.y, victim.team === 'blue' ? '#3399ff' : '#ff3355', 15);
        if (victim === this.player) this.respawnQueue.push({ type: 'player', timer: 3 });
        else this.respawnQueue.push({ type: 'bot', team: victim.team, index: victim.index, timer: 2.5 + Math.random() * 2 });
    }

    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200, life: 0.5 + Math.random() * 0.5, maxLife: 0.6, alpha: 1, size: 3 + Math.random() * 5, color });
    }
};