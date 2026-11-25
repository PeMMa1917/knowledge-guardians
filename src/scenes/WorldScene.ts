/**
 * WorldScene: draws a map, moves the player and characters, and turns player
 * actions into domain commands. It DISPLAYS state; it does not decide rewards
 * (spec 22.2).
 *
 * Controls: arrows / WASD to walk, E / Space / Enter to interact,
 * click or tap to walk to a spot or a person (alternative control route).
 */
import { ensureLook } from './looks';
import { chime, clink } from '../app/ambience';
import { LUMEN_COLOURS } from '../app/settings';
import Phaser from 'phaser';
import { ctx, type WorldApi } from '../app/context';
import { MAPS } from '../maps';
import type { Interactable, MapDef } from '../maps/types';
import { STAMPS, TILE } from './art';
import { frayLevel } from '../domain/label';

type Dir = 'down' | 'up' | 'left' | 'right';

interface Actor {
  id: string;
  /** "Something new to say" marker above the head. */
  mark?: Phaser.GameObjects.Image;
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Image;
  facing: Dir;
}

const SPEED = 72; // px per second
const FEET = { w: 10, h: 6 };

export class WorldScene extends Phaser.Scene implements WorldApi {
  private map!: MapDef;
  private blocked: boolean[][] = [];
  private player!: Actor;
  private npcs: Actor[] = [];
  private follower: Actor | null = null;
  private trail: { x: number; y: number; f: Dir }[] = [];
  private lumen!: Phaser.GameObjects.Image;
  private lumenGlow!: Phaser.GameObjects.Image;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private playerSheet = 'player-a';
  private path: { x: number; y: number }[] = [];
  private pendingInteract: (() => void) | null = null;
  private zonesInside = new Set<string>();
  private paused = false;
  private target: { kind: 'npc'; actor: Actor } | { kind: 'obj'; obj: Interactable } | null = null;
  private fx: Phaser.GameObjects.GameObject[] = [];
  private lightPools: Phaser.GameObjects.Image[] = [];
  private portalRing: Phaser.GameObjects.Image | null = null;
  private stepTimer = 0;
  private transitioning = false;
  private objArt = new Map<string, Phaser.GameObjects.Image>();
  private frayGlows = new Map<string, Phaser.GameObjects.Image>();
  private threadGfx: Phaser.GameObjects.Graphics | null = null;
  private gapMark: Phaser.GameObjects.Image | null = null;
  private exploreAcc = 0;

  constructor() { super('world'); }

  create(): void {
    ctx.world = this;
    // Reset per-map fields (the scene object is reused when the map changes).
    if (!this.textures.exists('mark.new')) {
      // Pixel speech mark, drawn in code (original art).
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x1a1426, 1).fillRoundedRect(0, 0, 9, 10, 2).fillTriangle(3, 9, 6, 9, 4, 12);
      g.fillStyle(0xf2d27a, 1).fillRoundedRect(1, 1, 7, 8, 2).fillTriangle(4, 9, 5, 9, 4, 11);
      g.fillStyle(0x1a1426, 1).fillRect(4, 2, 1, 4).fillRect(4, 7, 1, 1);
      g.generateTexture('mark.new', 9, 13); g.destroy();
    }
    this.npcs = []; this.follower = null; this.trail = []; this.path = []; this.pendingInteract = null;
    this.zonesInside = new Set(); this.target = null; this.fx = []; this.lightPools = []; this.portalRing = null;
    this.transitioning = false; this.paused = false;
    this.objArt = new Map(); this.frayGlows = new Map(); this.threadGfx = null; this.gapMark = null; this.exploreAcc = 0;
    const s = ctx.controller.state;
    this.map = MAPS[s.mapId] ?? MAPS['nexus.archive'];
    this.buildMap();
    const kb = this.input.keyboard!;
    // Letter keys come from the player's key map (settings); arrows, Space and Enter always work.
    const km = ctx.settings.keys;
    this.keys = kb.addKeys({ W: km.up, A: km.left, S: km.down, D: km.right, E: km.interact, UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT', SPACE: 'SPACE', ENTER: 'ENTER' }) as Record<string, Phaser.Input.Keyboard.Key>;
    kb.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
    const interactKey = () => { if (!this.paused && !ctx.ui.isModalOpen()) this.tryInteract(); };
    this.keys.E.on('down', interactKey); this.keys.SPACE.on('down', interactKey); this.keys.ENTER.on('down', interactKey);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointer(p));
    this.scale.on('resize', () => this.fitCamera());
    this.playMusic(this.map.music);
    this.cameras.main.fadeIn(ctx.settings.reducedMotion ? 0 : 400, 10, 8, 24);
    // Arrival zone (e.g. "emberford") is recorded the moment the map opens.
    this.checkZones(true);
    ctx.ui.refreshHud();
  }

  // ------------------------------------------------------------------ build

  private buildMap(): void {
    const m = this.map;
    this.cameras.main.setBackgroundColor(m.background);
    this.blocked = Array.from({ length: m.height }, () => Array(m.width).fill(false));
    const block = (x: number, y: number, w: number, h: number) => {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.blocked[j]?.[i] !== undefined) this.blocked[j][i] = true;
    };

    // Starfield behind the floating Nexus hall.
    if (m.ambience === 'archive') {
      for (let i = 0; i < 160; i++) {
        const st = this.add.image(Phaser.Math.Between(-200, m.width * TILE + 200), Phaser.Math.Between(-200, m.height * TILE + 200), 'star').setDepth(-10).setAlpha(Phaser.Math.FloatBetween(0.2, 0.9));
        st.setScrollFactor(Phaser.Math.FloatBetween(0.3, 0.7));
        if (!ctx.settings.reducedMotion) this.tweens.add({ targets: st, alpha: 0.1, duration: Phaser.Math.Between(1200, 4000), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 3000) });
      }
    }

    // Floor into one render texture.
    const rt = this.add.renderTexture(0, 0, m.width * TILE, m.height * TILE).setOrigin(0).setDepth(-5);
    for (let y = 0; y < m.height; y++) {
      for (let x = 0; x < m.width; x++) {
        const f = m.floor(x, y);
        if (f) rt.drawFrame(STAMPS[f].sheet, f, x * TILE, y * TILE);
        else block(x, y, 1, 1);
      }
    }

    // Stamps.
    for (const st of m.stamps) {
      const def = STAMPS[st.stamp];
      const img = this.add.image(st.x * TILE, st.y * TILE, def.sheet, st.stamp).setOrigin(0);
      img.setDepth(def.above ? 100000 : (st.y + def.h) * TILE - 1);
      if (def.collide) block(st.x + def.collide[0], st.y + def.collide[1], def.collide[2], def.collide[3]);
      if (def.flat || (!def.collide && def.h <= 1)) img.setDepth(-4); // flat decorations stay on the floor
      if (st.anim && !ctx.settings.reducedMotion) {
        let i = 0;
        this.time.addEvent({ delay: 180, loop: true, callback: () => { i = (i + 1) % st.anim!.length; img.setFrame(st.anim![i]); } });
      }
    }
    for (const b of m.blocks) block(...b);

    // Interactable art.
    for (const it of m.interactables) {
      if (it.art && this.textures.exists(it.art)) {
        const tex = this.textures.get(it.art).getSourceImage() as HTMLCanvasElement;
        const cx = (it.x + it.w / 2) * TILE, by = (it.y + it.h) * TILE;
        const img = this.add.image(cx, by, it.art).setOrigin(0.5, 1).setDepth(by + 16); // sits on top of tables and counters
        if (tex.height <= 16 && it.kind === 'sign') img.setOrigin(0.5, 1);
        this.objArt.set(it.id, img);
        // The Fray (spec 2.11): a sickly gold glow on a label that says more than its support.
        if (it.kit) {
          const glow = this.add.image(cx, by - tex.height / 2, 'glow').setTint(0xe8c040).setBlendMode(Phaser.BlendModes.ADD).setDepth(200001).setScale(0.32);
          if (!ctx.settings.reducedMotion) this.tweens.add({ targets: glow, scale: 0.26, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          this.frayGlows.set(it.kit, glow);
        }
      }
      block(it.x, it.y, it.w, it.h);
    }
    this.threadGfx = this.add.graphics().setDepth(5);

    // Portal visuals.
    if (m.id === 'nexus.archive') {
      this.portalRing = this.add.image(13 * TILE, 4 * TILE, 'portal-ring').setDepth(3 * TILE).setScale(1.2);
      if (!ctx.settings.reducedMotion) this.tweens.add({ targets: this.portalRing, angle: 360, duration: 9000, repeat: -1 });
    }
    if (m.id === 'aethelgard.emberford') {
      this.add.image(19.5 * TILE + 8, 24 * TILE, 'portal-stone').setOrigin(0.5, 1).setDepth(24 * TILE);
      block(19, 23, 2, 1);
    }

    // Characters.
    const s = ctx.controller.state;
    for (const n of m.npcs) {
      if (n.visibleIf && !ctx.controller.check(n.visibleIf)) continue;
      if (n.id === s.companion) continue; // the companion walks with the player
      const a = this.makeActor(n.id, n.x, n.y, n.facing);
      this.npcs.push(a);
      block(n.x, n.y, 1, 1);
    }
    // Kip waits at the portal stone once the market Showdown has ended.
    if (m.id === 'aethelgard.emberford' && s.companion === 'kip-arden' && s.flags['sd.corvan.outcome'] !== undefined) {
      const a = this.makeActor('kip-arden', 21, 23, 'left');
      this.npcs.push(a);
      block(21, 23, 1, 1);
    }

    const look = ensureLook(this, ctx.controller.state.player.look);
    this.playerSheet = look;
    let px = s.pos.x, py = s.pos.y;
    if (px < 0 || py < 0 || this.blocked[py]?.[px] !== false) { px = m.spawn.x; py = m.spawn.y; }
    this.player = this.makeActor(look, px, py, s.facing, true);
    this.player.sprite.x = px * TILE + 8; this.player.sprite.y = py * TILE + 12;

    if (s.companion && !this.npcs.some((n) => n.id === s.companion)) {
      this.follower = this.makeActor(s.companion, px, py + 1, 'up');
    }

    // Lumen, the fairy guide.
    this.lumenGlow = this.add.image(0, 0, 'glow').setScale(0.25).setTint(LUMEN_COLOURS[ctx.settings.lumenColour] ?? 0xfff2b0).setAlpha(0.55).setBlendMode(Phaser.BlendModes.ADD);
    this.lumen = this.add.image(0, 0, 'lumen');

    this.buildAtmosphere();
    this.fitCamera();
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setBounds(-64, -96, m.width * TILE + 128, m.height * TILE + 160);
    this.refreshWorld();
  }

  /** State-driven visuals. Called after every command by the interface. */
  refreshWorld(): void {
    const s = ctx.controller.state;
    if (!s || !this.threadGfx) return;
    for (const it of this.map.interactables) {
      const img = this.objArt.get(it.id);
      if (img) img.setVisible(!it.visibleIf || ctx.controller.check(it.visibleIf));
    }
    // A small speech mark over people who have something new to say (a line not yet seen).
    for (const a of this.npcs) {
      const node = ctx.controller.engine.talkEntry(a.id, s);
      const fresh = !!node && !s.flags[`node.${node}`];
      if (fresh && !a.mark) {
        a.mark = this.add.image(a.sprite.x, a.sprite.y - 25, 'mark.new').setDepth(200000).setOrigin(0.5, 1);
        if (!ctx.settings.reducedMotion) this.tweens.add({ targets: a.mark, y: a.sprite.y - 27, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      } else if (!fresh && a.mark) { this.tweens.killTweensOf(a.mark); a.mark.destroy(); a.mark = undefined; }
    }
    for (const [kit, glow] of this.frayGlows) {
      const lvl = frayLevel(kit, s);
      glow.setVisible(lvl > 0 && !ctx.settings.reducedEffects).setAlpha(0.25 + lvl * 0.2);
    }
    // The Provenance Thread: a gold line through the places already followed, then a dark gap.
    const g = this.threadGfx; g.clear();
    this.gapMark?.destroy(); this.gapMark = null;
    for (const t of ctx.controller.pack.threads) {
      const pts = t.nodes.filter((n) => n.map === this.map.id && s.flags[`thread.${t.id}.${n.id}`]);
      if (!pts.length) continue;
      g.lineStyle(2, 0xf2d27a, 0.85);
      g.beginPath();
      pts.forEach((n, i) => { const x = n.x * TILE + 8, y = n.y * TILE + 8; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); });
      g.strokePath();
      for (const n of pts) g.fillStyle(0xfff2b0, 1).fillCircle(n.x * TILE + 8, n.y * TILE + 8, 2.5);
      if (s.flags[`thread.${t.id}.gap`]) {
        const last = pts[pts.length - 1];
        g.lineStyle(2, 0x1a1426, 0.9).lineBetween(last.x * TILE + 8, last.y * TILE + 8, t.gap.x * TILE + 8, t.gap.y * TILE + 8);
        this.gapMark = this.add.image(t.gap.x * TILE + 8, t.gap.y * TILE + 8, 'glow').setTint(0x1a1426).setScale(0.22).setDepth(6);
      }
    }
    if (this.portalRing) this.portalRing.setAlpha(ctx.controller.check({ objective: 'm01.o6.label' }) ? 1 : 0.35);
  }

  /** Active play time in this browser session, for the balance reminder. */
  static activeSeconds = 0;

  private makeActor(id: string, tx: number, ty: number, facing: Dir, isPlayer = false): Actor {
    // A character can use another character's sheet (for example the archivist uses a villager sheet).
    let sheet = this.textures.exists(`char.${id}`) ? id : ctx.controller.pack.characters.find((c) => c.id === id)?.sprite ?? id;
    if (sheet.startsWith('custom:')) sheet = ensureLook(this, sheet); // characters can use a made look too
    const sprite = this.add.sprite(tx * TILE + 8, ty * TILE + 12, `char.${sheet}`, this.idleFrame(facing)).setOrigin(0.5, 0.8);
    const shadow = this.add.image(sprite.x, sprite.y + 6, 'shadow').setDepth(sprite.y - 1);
    if (!isPlayer) sprite.setInteractive({ useHandCursor: true });
    const a: Actor = { id, sprite, shadow, facing };
    this.place(a);
    return a;
  }

  private idleFrame(d: Dir): number { return { down: 0, right: 17, up: 34, left: 51 }[d]; }

  private place(a: Actor): void {
    a.sprite.setDepth(a.sprite.y + 4);
    a.shadow.setPosition(a.sprite.x, a.sprite.y + 6).setDepth(a.sprite.y - 2);
  }

  private buildAtmosphere(): void {
    const m = this.map;
    const effects = !ctx.settings.reducedEffects;
    const w = m.width * TILE, h = m.height * TILE;
    // Ambient colour grade (multiply) and light pools (additive).
    const ambient = m.ambience === 'archive' ? 0xa29ce0 : 0xffe8c4;
    this.add.rectangle(-200, -200, w + 400, h + 400, ambient).setOrigin(0).setDepth(200000).setBlendMode(Phaser.BlendModes.MULTIPLY).setAlpha(effects ? 1 : 0);
    for (const l of m.lights) {
      const img = this.add.image(l.x * TILE, l.y * TILE, 'glow').setDepth(200001).setBlendMode(Phaser.BlendModes.ADD)
        .setTint(l.color).setScale((l.r * 2) / 128).setAlpha(effects ? 0.6 : 0);
      if (l.flicker && effects && !ctx.settings.reducedMotion) this.tweens.add({ targets: img, alpha: 0.4, scale: img.scale * 0.94, duration: Phaser.Math.Between(400, 900), yoyo: true, repeat: -1 });
      this.lightPools.push(img);
    }
    if (!effects) return;
    // Particles: dust motes in the archive, sparks and drifting petals in town.
    const area = new Phaser.Geom.Rectangle(0, 0, w, h);
    if (m.ambience === 'archive') {
      this.fx.push(this.add.particles(0, 0, 'spark', {
        emitZone: { type: 'random', source: area } as any, lifespan: 6000, speedY: { min: -6, max: -2 }, speedX: { min: -3, max: 3 },
        scale: { min: 0.3, max: 0.8 }, alpha: { start: 0, end: 0, ease: 'Sine.InOut', steps: 0 } as any, frequency: 140, tint: 0xfff2c8, blendMode: 'ADD',
        emitCallback: (p: Phaser.GameObjects.Particles.Particle) => { p.alpha = 0.6; },
      }).setDepth(200002));
      this.fx.push(this.add.particles(13 * TILE, 4 * TILE, 'spark', {
        lifespan: 1400, speed: { min: 6, max: 18 }, scale: { start: 0.8, end: 0 }, tint: [0x9fe8ff, 0xe0d0ff], blendMode: 'ADD', frequency: 90,
      }).setDepth(200002));
    } else {
      this.fx.push(this.add.particles(9 * TILE, 11 * TILE, 'spark', {
        lifespan: 1600, speedY: { min: -30, max: -12 }, speedX: { min: -8, max: 8 }, scale: { start: 0.7, end: 0 }, tint: [0xffb05a, 0xff7a2a], blendMode: 'ADD', frequency: 110,
      }).setDepth(200002));
      this.fx.push(this.add.particles(0, 0, 'spark', {
        emitZone: { type: 'random', source: area } as any, lifespan: 7000, speedY: { min: 4, max: 10 }, speedX: { min: 6, max: 14 },
        scale: { min: 0.4, max: 0.9 }, tint: [0xfff6d0, 0xffd7e8], frequency: 260, alpha: 0.7,
      }).setDepth(200002));
      this.fx.push(this.add.particles(19.5 * TILE + 8, 23 * TILE, 'spark', {
        lifespan: 1300, speed: { min: 4, max: 14 }, scale: { start: 0.7, end: 0 }, tint: 0x9fe8ff, blendMode: 'ADD', frequency: 160,
      }).setDepth(200002));
    }
    // Camera post effects (WebGL only).
    const cam = this.cameras.main as any;
    if (this.renderer.type === Phaser.WEBGL && cam.postFX) {
      cam.postFX.addVignette(0.5, 0.5, 0.95, 0.22);
      cam.postFX.addBloom(0xffffff, 1, 1, 0.8, 0.45, 4);
    }
  }

  applySettings(): void {
    // Rebuild atmosphere quickly by restarting the scene at the same spot.
    this.saveSpot();
    this.scene.restart();
  }

  private fitCamera(): void {
    const cam = this.cameras.main;
    const z = Math.max(2, Math.floor(Math.min(this.scale.width / (20 * TILE), this.scale.height / (12 * TILE))));
    cam.setZoom(z);
    cam.setRoundPixels(true);
  }

  private playMusic(key: string): void {
    const vol = ctx.settings.musicVolume;
    const current = this.sound.getAll('').find((s: any) => s.key?.startsWith('music.') && s.isPlaying) as Phaser.Sound.BaseSound | undefined;
    if (current && (current as any).key === key) return;
    this.sound.getAll('').forEach((s: any) => { if (s.key?.startsWith('music.')) s.stop(); });
    if (!this.cache.audio.exists(key) || vol <= 0) return;
    this.sound.play(key, { loop: true, volume: vol });
  }

  playSfx(key: string): void {
    if (ctx.settings.sfxVolume <= 0 || !this.cache.audio.exists(key)) return;
    this.sound.play(key, { volume: ctx.settings.sfxVolume });
  }

  setPaused(p: boolean): void { this.paused = p; }

  private ambT = 0;
  /** Ambient sound: the forge hammer in Emberford (louder near the anvil), chimes in the Nexus. */
  private ambience(dt: number): void {
    const vol = ctx.settings.sfxVolume;
    if (vol <= 0 || !this.player) return;
    this.ambT -= dt;
    if (this.ambT > 0) return;
    const forge = this.map.interactables.find((i) => i.kind === 'forge');
    if (forge) {
      const d = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, (forge.x + 1) * TILE, forge.y * TILE) / TILE;
      if (d < 14) clink(vol * (1 - d / 14));
      this.ambT = 2.4 + Math.random() * 1.2;
    } else if (this.map.ambience === 'archive') {
      chime(vol * 0.6);
      this.ambT = 7 + Math.random() * 6;
    } else this.ambT = 5;
  }

  // ----------------------------------------------------------------- update

  update(_t: number, dtMs: number): void {
    const dt = Math.min(dtMs, 100) / 1000;
    this.ambience(dt);
    const modal = this.paused || ctx.ui.isModalOpen() || this.transitioning;
    let vx = 0, vy = 0;
    if (!modal) {
      const k = this.keys;
      if (k.LEFT.isDown || k.A.isDown) vx -= 1;
      if (k.RIGHT.isDown || k.D.isDown) vx += 1;
      if (k.UP.isDown || k.W.isDown) vy -= 1;
      if (k.DOWN.isDown || k.S.isDown) vy += 1;
      if (vx || vy) { this.path = []; this.pendingInteract = null; }
      else if (this.path.length) {
        const n = this.path[0];
        const tx = n.x * TILE + 8, ty = n.y * TILE + 12;
        const dx = tx - this.player.sprite.x, dy = ty - this.player.sprite.y;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
          this.player.sprite.x = tx; this.player.sprite.y = ty; this.path.shift();
          if (!this.path.length && this.pendingInteract) { const f = this.pendingInteract; this.pendingInteract = null; f(); }
        } else { vx = Math.abs(dx) > 1 ? Math.sign(dx) : 0; vy = Math.abs(dy) > 1 ? Math.sign(dy) : 0; }
      }
    }
    const p = this.player;
    if (vx || vy) {
      const len = Math.hypot(vx, vy);
      const mx = (vx / len) * SPEED * dt, my = (vy / len) * SPEED * dt;
      if (!this.collides(p.sprite.x + mx, p.sprite.y)) p.sprite.x += mx;
      if (!this.collides(p.sprite.x, p.sprite.y + my)) p.sprite.y += my;
      const f: Dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
      p.facing = f;
      p.sprite.anims.play(`${this.playerSheet}.walk.${f}`, true);
      this.trail.push({ x: p.sprite.x, y: p.sprite.y, f });
      if (this.trail.length > 40) this.trail.shift();
      this.stepTimer += dt;
      if (this.stepTimer > 0.32) {
        this.stepTimer = 0;
        if (ctx.settings.sfxVolume > 0 && this.cache.audio.exists('sfx.step')) this.sound.play('sfx.step', { volume: ctx.settings.sfxVolume * 0.18 });
        // Footstep dust: a small puff that fades (off with reduced effects).
        if (!ctx.settings.reducedEffects) {
          const puff = this.add.image(p.sprite.x + Phaser.Math.Between(-2, 2), p.sprite.y + 5, 'glow')
            .setTint(this.map.ambience === 'archive' ? 0xc8c0e8 : 0xd8c49a).setAlpha(0.35).setScale(0.05).setDepth(p.sprite.y - 1);
          this.tweens.add({ targets: puff, alpha: 0, scale: 0.11, y: puff.y - 3, duration: 450, onComplete: () => puff.destroy() });
        }
      }
    } else {
      p.sprite.anims.stop();
      p.sprite.setFrame(this.idleFrame(p.facing));
    }
    this.place(p);
    this.updateFollower(!!(vx || vy));
    this.updateCompanionWait();
    this.updateLumen();
    if (!modal) {
      this.updateTarget();
      this.checkZones(false);
      // The event clock runs only while the player explores (spec 93.1).
      this.exploreAcc += dt;
      if (this.exploreAcc >= 10) {
        this.exploreAcc = 0;
        ctx.controller.dispatch({ type: 'Explore', seconds: 10 });
        // Balance (spec 92.3, 90.2): a gentle break reminder every 45 minutes of active play. It never blocks play.
        WorldScene.activeSeconds += 10;
        if (WorldScene.activeSeconds % 2700 === 0) {
          ctx.ui.toast('Lumen: You have played for a while. A real break, a walk or a glass of water helps more than one more quest. Your place is saved at any Waystone.', 'info');
        }
      }
    }
  }

  private collides(x: number, y: number): boolean {
    const l = x - FEET.w / 2, r = x + FEET.w / 2, t = y - FEET.h / 2 + 2, b = y + FEET.h / 2 + 2;
    for (const [px, py] of [[l, t], [r, t], [l, b], [r, b]]) {
      const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
      if (ty < 0 || tx < 0 || ty >= this.map.height || tx >= this.map.width) return true;
      if (this.blocked[ty][tx]) return true;
    }
    return false;
  }

  /** After the market Showdown, Kip stops following and waits at the portal stone. */
  private updateCompanionWait(): void {
    const f = this.follower;
    const s = ctx.controller.state;
    if (!f || this.map.id !== 'aethelgard.emberford' || f.id !== 'kip-arden' || s.flags['sd.corvan.outcome'] === undefined) return;
    if (ctx.ui.isModalOpen()) return; // wait until the conversation closes
    this.follower = null;
    this.npcs.push(f);
    const tx = 21 * TILE + 8, ty = 23 * TILE + 12;
    f.facing = 'left';
    const dist = Math.hypot(tx - f.sprite.x, ty - f.sprite.y);
    if (ctx.settings.reducedMotion || dist < 1) {
      f.sprite.setPosition(tx, ty); this.place(f);
    } else {
      f.sprite.anims.play(`${f.id}.walk.${Math.abs(tx - f.sprite.x) > Math.abs(ty - f.sprite.y) ? (tx > f.sprite.x ? 'right' : 'left') : (ty > f.sprite.y ? 'down' : 'up')}`, true);
      this.tweens.add({ targets: f.sprite, x: tx, y: ty, duration: Math.min(2500, dist * 18),
        onUpdate: () => this.place(f),
        onComplete: () => { f.sprite.anims.stop(); f.sprite.setFrame(this.idleFrame('left')); this.place(f); } });
    }
    if (this.blocked[23]?.[21] !== undefined) this.blocked[23][21] = true;
  }

  private updateFollower(moving: boolean): void {
    const f = this.follower;
    if (!f) return;
    const spot = this.trail.length > 16 ? this.trail[this.trail.length - 16] : null;
    if (spot && moving) {
      f.sprite.x = spot.x; f.sprite.y = spot.y; f.facing = spot.f;
      f.sprite.anims.play(`${f.id}.walk.${spot.f}`, true);
    } else {
      f.sprite.anims.stop(); f.sprite.setFrame(this.idleFrame(f.facing));
    }
    this.place(f);
  }

  private updateLumen(): void {
    const t = this.time.now / 1000;
    const bob = ctx.settings.reducedMotion ? 0 : Math.sin(t * 2.4) * 2;
    const side = this.player.facing === 'left' ? 1 : -1;
    const tx = this.player.sprite.x + side * 11, ty = this.player.sprite.y - 26 + bob;
    this.lumen.x += (tx - this.lumen.x) * 0.08; this.lumen.y += (ty - this.lumen.y) * 0.08;
    this.lumen.setDepth(this.player.sprite.y + 50);
    this.lumenGlow.setPosition(this.lumen.x, this.lumen.y).setDepth(this.lumen.depth - 1);
  }

  lumenBurst(): void {
    if (ctx.settings.reducedEffects) return;
    const e = this.add.particles(this.lumen.x, this.lumen.y, 'spark', {
      lifespan: 700, speed: { min: 20, max: 50 }, scale: { start: 1, end: 0 }, tint: [0xfff2b0, 0x9fe8ff], blendMode: 'ADD', emitting: false,
    }).setDepth(300000);
    e.explode(24);
    this.time.delayedCall(900, () => e.destroy());
  }

  // ---------------------------------------------------------- interaction

  private frontPoint(): { x: number; y: number } {
    const p = this.player.sprite;
    const d = { down: [0, 12], up: [0, -12], left: [-12, 0], right: [12, 0] }[this.player.facing];
    return { x: p.x + d[0], y: p.y + d[1] };
  }

  private updateTarget(): void {
    const fp = this.frontPoint();
    let best: typeof this.target = null; let bestD = 18;
    const actors = [...this.npcs, ...(this.follower ? [this.follower] : [])];
    for (const a of actors) {
      const d = Phaser.Math.Distance.Between(fp.x, fp.y, a.sprite.x, a.sprite.y);
      if (d < bestD) { bestD = d; best = { kind: 'npc', actor: a }; }
    }
    for (const it of this.map.interactables) {
      if (it.visibleIf && !ctx.controller.check(it.visibleIf)) continue;
      const rx = Phaser.Math.Clamp(fp.x, it.x * TILE, (it.x + it.w) * TILE);
      const ry = Phaser.Math.Clamp(fp.y, it.y * TILE, (it.y + it.h) * TILE + 6);
      const d = Phaser.Math.Distance.Between(fp.x, fp.y, rx, ry);
      if (d < bestD) { bestD = d; best = { kind: 'obj', obj: it }; }
    }
    this.target = best;
    if (!best) ctx.ui.setPrompt(null);
    else if (best.kind === 'npc') {
      const id = best.actor.id;
      const c = ctx.controller.pack.characters.find((x) => x.id === id);
      ctx.ui.setPrompt(`Talk to ${c?.name ?? 'them'}`);
    } else ctx.ui.setPrompt(`${best.obj.kind === 'sign' ? 'Read' : best.obj.kind === 'exhibit' ? 'Inspect' : best.obj.kind === 'thread' ? 'Follow the thread to' : 'Use'} ${best.obj.label}`);
  }

  tryInteract(): void {
    const t = this.target;
    if (!t) return;
    if (t.kind === 'npc') {
      const a = t.actor;
      const dx = this.player.sprite.x - a.sprite.x, dy = this.player.sprite.y - a.sprite.y;
      a.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      a.sprite.setFrame(this.idleFrame(a.facing));
      ctx.ui.openDialogue(a.id);
      return;
    }
    const it = t.obj;
    switch (it.kind) {
      case 'exhibit': ctx.ui.openExhibit(it.exhibit!); break;
      case 'bench': ctx.ui.openBench(); break;
      case 'label': ctx.ui.openLabel(it.kit!); break;
      case 'lock': ctx.ui.openLock(it.lock!); break;
      case 'forge': ctx.ui.openForge(); break;
      case 'assay': ctx.ui.openAssay(it.exhibit!); break;
      case 'thread': ctx.ui.followThread(it.thread!, it.node!); break;
      case 'waystone': ctx.ui.openWaystone(it.place ?? this.map.name); break;
      case 'sign':
        if (it.flag && ctx.controller.state.flags[it.flag] !== true) ctx.controller.dispatch({ type: 'SetFlag', flag: it.flag, value: true });
        ctx.ui.showSign(it.label, it.text ?? ''); break;
      case 'portal': break;
    }
  }

  private onPointer(p: Phaser.Input.Pointer): void {
    if (this.paused || ctx.ui.isModalOpen() || this.transitioning) return;
    const wx = p.worldX, wy = p.worldY;
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    // Clicked a character or an object? Walk next to it, then interact.
    const actors = [...this.npcs, ...(this.follower ? [this.follower] : [])];
    const hitA = actors.find((a) => a.sprite.getBounds().contains(wx, wy));
    const hitO = this.map.interactables.find((it) => (!it.visibleIf || ctx.controller.check(it.visibleIf)) && wx >= it.x * TILE && wx < (it.x + it.w) * TILE && wy >= (it.y - 1) * TILE && wy < (it.y + it.h) * TILE);
    if (hitA || hitO) {
      const cells = hitA ? [{ x: Math.floor(hitA.sprite.x / TILE), y: Math.floor(hitA.sprite.y / TILE), w: 1, h: 1 }] : [hitO!];
      const goal = this.nearestFreeAround(cells[0]);
      if (!goal) return;
      this.walkTo(goal.x, goal.y, () => {
        const cx = hitA ? hitA.sprite.x : (hitO!.x + hitO!.w / 2) * TILE;
        const cy = hitA ? hitA.sprite.y : (hitO!.y + hitO!.h / 2) * TILE;
        const dx = cx - this.player.sprite.x, dy = cy - this.player.sprite.y;
        this.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        this.updateTarget();
        this.tryInteract();
      });
      return;
    }
    if (this.blocked[ty]?.[tx] === false) this.walkTo(tx, ty, null);
  }

  private nearestFreeAround(r: { x: number; y: number; w: number; h: number }): { x: number; y: number } | null {
    const pt = { x: Math.floor(this.player.sprite.x / TILE), y: Math.floor(this.player.sprite.y / TILE) };
    const cands: { x: number; y: number }[] = [];
    for (let x = r.x - 1; x <= r.x + r.w; x++) { cands.push({ x, y: r.y + r.h }); cands.push({ x, y: r.y - 1 }); }
    for (let y = r.y; y < r.y + r.h; y++) { cands.push({ x: r.x - 1, y }); cands.push({ x: r.x + r.w, y }); }
    const ok = cands.filter((c) => this.blocked[c.y]?.[c.x] === false);
    ok.sort((a, b) => Math.hypot(a.x - pt.x, a.y - pt.y) - Math.hypot(b.x - pt.x, b.y - pt.y));
    return ok[0] ?? null;
  }

  private walkTo(tx: number, ty: number, then: (() => void) | null): void {
    const sx = Math.floor(this.player.sprite.x / TILE), sy = Math.floor(this.player.sprite.y / TILE);
    const path = this.bfs(sx, sy, tx, ty);
    if (!path) return;
    this.path = path;
    this.pendingInteract = then;
    if (!path.length && then) { this.pendingInteract = null; then(); }
  }

  private bfs(sx: number, sy: number, tx: number, ty: number): { x: number; y: number }[] | null {
    const W = this.map.width, H = this.map.height;
    const prev = new Map<number, number>();
    const q = [sy * W + sx]; prev.set(q[0], -1);
    while (q.length) {
      const c = q.shift()!;
      const cx = c % W, cy = Math.floor(c / W);
      if (cx === tx && cy === ty) {
        const out: { x: number; y: number }[] = [];
        let k = c;
        while (prev.get(k) !== -1) { out.unshift({ x: k % W, y: Math.floor(k / W) }); k = prev.get(k)!; }
        return out;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || this.blocked[ny][nx]) continue;
        const n = ny * W + nx;
        if (!prev.has(n)) { prev.set(n, c); q.push(n); }
      }
      if (prev.size > 4000) break;
    }
    return null;
  }

  // ------------------------------------------------------------ zones/maps

  private checkZones(arrival: boolean): void {
    const tx = Math.floor(this.player.sprite.x / TILE), ty = Math.floor(this.player.sprite.y / TILE);
    for (const z of this.map.zones) {
      const inside = tx >= z.x && tx < z.x + z.w && ty >= z.y && ty < z.y + z.h;
      if (!inside) { this.zonesInside.delete(z.id); continue; }
      if (this.zonesInside.has(z.id) && !arrival) continue;
      this.zonesInside.add(z.id);
      if (z.if && !ctx.controller.check(z.if)) {
        if (z.to && !arrival) ctx.ui.toast(z.id === 'portal' ? 'The portal is not open yet. Repair the label first.' : 'Not yet. Finish your work here first.', 'info');
        continue;
      }
      if (!ctx.controller.state.flags[`reached.${z.id}`]) ctx.controller.dispatch({ type: 'Reach', zone: z.id });
      if (z.to && !arrival) this.changeMap(z.to.map, z.to.x, z.to.y);
    }
  }

  private saveSpot(): void {
    const s = ctx.controller.state;
    s.pos = { x: Math.floor(this.player.sprite.x / TILE), y: Math.floor(this.player.sprite.y / TILE) };
    s.facing = this.player.facing;
  }

  /** Called by the shell before saving, so the save has the current position. */
  snapshotPosition(): void { this.saveSpot(); }

  changeMap(mapId: string, x: number, y: number): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.playSfx('sfx.sparkle');
    const go = () => {
      const s = ctx.controller.state;
      s.mapId = mapId; s.pos = { x, y }; s.facing = 'down';
      this.scene.restart();
    };
    if (ctx.settings.reducedMotion) go();
    else { this.cameras.main.fadeOut(500, 220, 240, 255); this.cameras.main.once('camerafadeoutcomplete', go); }
  }
}
