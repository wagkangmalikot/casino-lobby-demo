// The Phaser scene that draws and animates the 5-reel slot.
//
// Phaser touches `window` as soon as it's imported, which breaks Next.js builds.
// So this file never imports Phaser directly: PhaserSlot.tsx loads Phaser in the
// browser and passes it in here. `import type` is fine because types vanish at build time.
//
// All art is drawn in code with the Canvas 2D API (gradients, glows, text) and saved
// as Phaser textures, so the game has no image files to load.
import type PhaserNS from "phaser";
import { PAYLINES, REELS, ROWS, randomSymbol, type Grid, type LineWin, type Sym } from "./engine";

type PhaserLib = typeof PhaserNS;

export const GAME_W = 1000;
export const GAME_H = 600;
const CELL_W = 166;
const CELL_H = 132;
const REEL_GAP = 8;
const AREA_W = REELS * CELL_W + (REELS - 1) * REEL_GAP;
const AREA_H = ROWS * CELL_H;
const AREA_X = (GAME_W - AREA_W) / 2;
const AREA_Y = 114;
const FRAME = 22; // frame thickness around the reels
const LINE_COLORS = ["#fbbf24", "#38bdf8", "#f472b6", "#34d399", "#a78bfa", "#fb923c", "#22d3ee", "#f87171", "#a3e635", "#e879f9"];
const hex = (c: string) => parseInt(c.slice(1), 16);

export interface SlotSceneApi {
  /** Small lift while waiting for the server result. */
  windUp(): void;
  /** Spins to the given result and shows wins. Resolves when the animation ends. */
  spinTo(grid: Grid, wins: LineWin[], totalWin: number, bigWin: boolean): Promise<void>;
  /** Turbo makes reels spin faster and stop sooner. */
  setTurbo(on: boolean): void;
}

export function createSlotScene(Phaser: PhaserLib, onReady: (api: SlotSceneApi) => void, fontFamily = "sans-serif") {
  const FONT = fontFamily;

  return class SlotScene extends Phaser.Scene implements SlotSceneApi {
    private reels: PhaserNS.GameObjects.Container[] = [];
    private current: Grid = [];
    private winLayer!: PhaserNS.GameObjects.Graphics;
    private pulses: PhaserNS.Tweens.Tween[] = [];
    private banner!: PhaserNS.GameObjects.Text;
    private winText!: PhaserNS.GameObjects.Text;
    private bulbs: PhaserNS.GameObjects.Image[] = [];
    private turbo = false;

    constructor() {
      super("slot");
    }

    create() {
      this.makeTextures();
      this.add.image(GAME_W / 2, GAME_H / 2, "bg");
      this.add.image(GAME_W / 2, 36, "logo");
      this.add.image(GAME_W / 2, AREA_Y + AREA_H / 2, "frame");
      for (let r = 0; r < REELS; r++) this.add.image(this.reelX(r) + CELL_W / 2, AREA_Y + AREA_H / 2, "reel-bg");

      const mask = this.make.graphics({}, false).fillRect(AREA_X, AREA_Y, AREA_W, AREA_H).createGeometryMask();
      for (let r = 0; r < REELS; r++) {
        const col = Array.from({ length: ROWS }, () => randomSymbol());
        this.current.push(col);
        const container = this.add.container(this.reelX(r), AREA_Y);
        container.setMask(mask);
        this.fill(container, col);
        this.reels.push(container);
      }

      // Dark fade at the top and bottom of the window makes the reels look like drums.
      this.add.image(GAME_W / 2, AREA_Y + AREA_H / 2, "shade");
      this.winLayer = this.add.graphics();
      this.drawLineTags();
      this.drawBulbs();

      this.winText = this.add
        .text(GAME_W / 2, GAME_H - 24, "", { fontFamily: FONT, fontSize: "30px", fontStyle: "bold", color: "#fde68a", stroke: "#3b1300", strokeThickness: 6 })
        .setOrigin(0.5);

      this.banner = this.add
        .text(GAME_W / 2, AREA_Y + AREA_H / 2, "", { fontFamily: FONT, fontSize: "88px", fontStyle: "bold", color: "#fde68a", stroke: "#7c2d12", strokeThickness: 12 })
        .setOrigin(0.5)
        .setDepth(10)
        .setAlpha(0)
        .setShadow(0, 6, "#000000", 18, true, true);

      onReady(this);
    }

    // ---- public API used by React -------------------------------------------

    setTurbo(on: boolean) {
      this.turbo = on;
    }

    windUp() {
      this.clearWins();
      this.reels.forEach((c, i) =>
        this.tweens.add({ targets: c, y: AREA_Y - 16, duration: 120, delay: i * 25, ease: "Quad.easeOut" }),
      );
    }

    spinTo(grid: Grid, wins: LineWin[], totalWin: number, bigWin: boolean): Promise<void> {
      this.clearWins();
      const speed = this.turbo ? 4.4 : 2.6; // pixels per millisecond
      const stagger = this.turbo ? 120 : 240; // extra spin time for each reel to the right
      const baseRun = this.turbo ? 260 : 650;

      const stops = this.reels.map((container, r) => {
        // Stop the wind-up first. If it were still running, two tweens would
        // fight over the same `y` and the reel would stutter.
        this.tweens.killTweensOf(container);

        // Every reel moves at the same steady speed; later reels just travel further.
        const SLOW_CELLS = 3;
        const fillerCount = Math.max(4, Math.round((speed * (baseRun + r * stagger)) / CELL_H));
        const filler = Array.from({ length: fillerCount }, () => randomSymbol());
        // Strip: result on top, random symbols in the middle, current symbols at the bottom.
        const strip = [...grid[r], ...filler, ...this.current[r]];
        this.fill(container, strip);
        const startY = AREA_Y - (strip.length - ROWS) * CELL_H;
        const slowDistance = SLOW_CELLS * CELL_H;
        const fastDistance = AREA_Y - slowDistance - startY;
        container.y = startY;

        return new Promise<void>((resolve) => {
          // Phase 1: constant speed. Phase 2: Quad.easeOut, which starts at twice its average
          // speed, so a duration of 2 × distance / speed continues at the same speed with no jump.
          this.tweens.add({
            targets: container,
            y: startY + fastDistance,
            duration: fastDistance / speed,
            ease: "Linear",
            onComplete: () =>
              this.tweens.add({
                targets: container,
                y: AREA_Y,
                duration: (2 * slowDistance) / speed,
                ease: "Quad.easeOut",
                onComplete: () => {
                  this.fill(container, grid[r]);
                  this.tweens.add({ targets: container, y: AREA_Y + 9, duration: 70, yoyo: true, ease: "Sine.easeOut" });
                  resolve();
                },
              }),
          });
        });
      });

      this.current = grid.map((c) => [...c]);
      return Promise.all(stops).then(() => {
        this.showWins(wins);
        if (totalWin > 0) this.countUp(totalWin);
        if (bigWin) this.celebrate();
      });
    }

    // ---- layout helpers ---------------------------------------------------------

    private reelX(r: number) {
      return AREA_X + r * (CELL_W + REEL_GAP);
    }

    private fill(container: PhaserNS.GameObjects.Container, symbols: Sym[]) {
      container.removeAll(true);
      symbols.forEach((s, i) => {
        container.add(this.add.image(CELL_W / 2, i * CELL_H + CELL_H / 2, `sym-${s}`).setName(`${i}`));
      });
    }

    private drawLineTags() {
      PAYLINES.forEach((rows, i) => {
        const y = AREA_Y + rows[0] * CELL_H + CELL_H / 2 + ((i % 3) - 1) * 26;
        [AREA_X - FRAME / 2 - 1, AREA_X + AREA_W + FRAME / 2 + 1].forEach((x) => {
          this.add.circle(x, y, 12, hex(LINE_COLORS[i])).setStrokeStyle(2, 0x1a0b2e);
          this.add.text(x, y, `${i + 1}`, { fontFamily: FONT, fontSize: "13px", fontStyle: "bold", color: "#1a0b2e" }).setOrigin(0.5);
        });
      });
    }

    // Marquee bulbs around the cabinet that chase like a real slot machine.
    private drawBulbs() {
      const x0 = AREA_X - FRAME - 14;
      const y0 = AREA_Y - FRAME - 14;
      const w = AREA_W + 2 * (FRAME + 14);
      const h = AREA_H + 2 * (FRAME + 14);
      const pts: [number, number][] = [];
      const step = 34;
      for (let x = x0 + 20; x < x0 + w - 10; x += step) pts.push([x, y0]);
      for (let y = y0 + 20; y < y0 + h - 10; y += step) pts.push([x0 + w, y]);
      for (let x = x0 + w - 20; x > x0 + 10; x -= step) pts.push([x, y0 + h]);
      for (let y = y0 + h - 20; y > y0 + 10; y -= step) pts.push([x0, y]);
      this.bulbs = pts.map(([x, y]) => this.add.image(x, y, "bulb"));
      let tick = 0;
      this.time.addEvent({
        delay: 140,
        loop: true,
        callback: () => {
          tick++;
          this.bulbs.forEach((b, i) => b.setAlpha((i + tick) % 3 === 0 ? 1 : 0.35));
        },
      });
    }

    // ---- textures (Canvas 2D) ------------------------------------------------------

    private canvas(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) {
      const tex = this.textures.createCanvas(key, w, h)!;
      paint(tex.getContext());
      tex.refresh();
    }

    private makeTextures() {
      const round = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
      };

      // Background: deep purple glow
      this.canvas("bg", GAME_W, GAME_H, (ctx) => {
        const g = ctx.createRadialGradient(GAME_W / 2, GAME_H * 0.45, 40, GAME_W / 2, GAME_H / 2, GAME_W * 0.7);
        g.addColorStop(0, "#5b2a86");
        g.addColorStop(0.45, "#2a1048");
        g.addColorStop(1, "#0b0616");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        // Soft light rays
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = "#ffd88a";
        for (let i = 0; i < 14; i++) {
          ctx.save();
          ctx.translate(GAME_W / 2, -40);
          ctx.rotate(-0.9 + i * 0.14);
          ctx.fillRect(-14, 0, 28, GAME_H * 1.4);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      });

      // Logo
      this.canvas("logo", 620, 76, (ctx) => {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `800 52px ${FONT}`;
        const g = ctx.createLinearGradient(0, 8, 0, 54);
        g.addColorStop(0, "#fff7c2");
        g.addColorStop(0.45, "#fbbf24");
        g.addColorStop(1, "#b45309");
        ctx.lineJoin = "round";
        ctx.lineWidth = 12;
        ctx.strokeStyle = "#2b0f00";
        ctx.strokeText("CARABAO GOLD", 310, 30);
        ctx.shadowColor = "rgba(251,191,36,0.55)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = g;
        ctx.fillText("CARABAO GOLD", 310, 30);
        ctx.shadowBlur = 0;
        // "DELUXE" ribbon
        ctx.fillStyle = "#be123c";
        round(ctx, 254, 56, 112, 18, 9);
        ctx.fill();
        ctx.font = `800 12px ${FONT}`;
        ctx.fillStyle = "#fff1f2";
        ctx.fillText("D E L U X E", 310, 66);
      });

      // Cabinet frame: gold gradient border
      const fw = AREA_W + FRAME * 2;
      const fh = AREA_H + FRAME * 2;
      this.canvas("frame", fw + 8, fh + 8, (ctx) => {
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 8;
        const g = ctx.createLinearGradient(0, 0, 0, fh);
        g.addColorStop(0, "#fde68a");
        g.addColorStop(0.25, "#d97706");
        g.addColorStop(0.5, "#fbbf24");
        g.addColorStop(0.75, "#92400e");
        g.addColorStop(1, "#f59e0b");
        ctx.fillStyle = g;
        round(ctx, 4, 4, fw, fh, 26);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#120720";
        round(ctx, 4 + FRAME - 6, 4 + FRAME - 6, AREA_W + 12, AREA_H + 12, 14);
        ctx.fill();
      });

      // One reel column background
      this.canvas("reel-bg", CELL_W, AREA_H, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, AREA_H);
        g.addColorStop(0, "#1a0d2e");
        g.addColorStop(0.5, "#2d1650");
        g.addColorStop(1, "#1a0d2e");
        ctx.fillStyle = g;
        round(ctx, 0, 0, CELL_W, AREA_H, 10);
        ctx.fill();
      });

      // Top/bottom shading over the reels
      this.canvas("shade", AREA_W, AREA_H, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, AREA_H);
        g.addColorStop(0, "rgba(8,3,18,0.75)");
        g.addColorStop(0.16, "rgba(8,3,18,0)");
        g.addColorStop(0.84, "rgba(8,3,18,0)");
        g.addColorStop(1, "rgba(8,3,18,0.75)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, AREA_W, AREA_H);
      });

      // Marquee bulb
      this.canvas("bulb", 18, 18, (ctx) => {
        const g = ctx.createRadialGradient(8, 7, 1, 9, 9, 9);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.35, "#fde68a");
        g.addColorStop(1, "rgba(245,158,11,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 18, 18);
      });

      // Coin used by the big-win particles
      this.canvas("coin-particle", 22, 22, (ctx) => {
        const g = ctx.createRadialGradient(8, 8, 1, 11, 11, 11);
        g.addColorStop(0, "#fff7c2");
        g.addColorStop(0.6, "#fbbf24");
        g.addColorStop(1, "#92400e");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(11, 11, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // ---- symbols ----
      const W = CELL_W - 10;
      const H = CELL_H - 10;
      const cx = W / 2;
      const cy = H / 2;

      const symbol = (key: Sym, paint: (ctx: CanvasRenderingContext2D) => void) =>
        this.canvas(`sym-${key}`, W, H, (ctx) => {
          // Card behind each symbol
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#3a1d63");
          g.addColorStop(1, "#1d0e35");
          ctx.fillStyle = g;
          round(ctx, 1, 1, W - 2, H - 2, 14);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.save();
          paint(ctx);
          ctx.restore();
        });

      const letter = (key: Sym, text: string, top: string, bottom: string) =>
        symbol(key, (ctx) => {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `800 86px ${FONT}`;
          ctx.lineJoin = "round";
          ctx.lineWidth = 10;
          ctx.strokeStyle = "#12051f";
          ctx.strokeText(text, cx, cy + 4);
          const g = ctx.createLinearGradient(0, cy - 40, 0, cy + 44);
          g.addColorStop(0, top);
          g.addColorStop(1, bottom);
          ctx.fillStyle = g;
          ctx.shadowColor = bottom;
          ctx.shadowBlur = 14;
          ctx.fillText(text, cx, cy + 4);
          ctx.shadowBlur = 0;
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.strokeText(text, cx, cy + 4);
        });

      symbol("wild", (ctx) => {
        const g = ctx.createLinearGradient(0, 18, 0, H - 18);
        g.addColorStop(0, "#fde68a");
        g.addColorStop(0.5, "#f59e0b");
        g.addColorStop(1, "#b45309");
        ctx.shadowColor = "rgba(251,191,36,0.8)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = g;
        round(ctx, 14, 26, W - 28, H - 52, 14);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff7c2";
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `800 40px ${FONT}`;
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#5a1d00";
        ctx.strokeText("WILD", cx, cy + 2);
        ctx.fillStyle = "#fffbeb";
        ctx.fillText("WILD", cx, cy + 2);
        // little star on top
        ctx.fillStyle = "#fff7c2";
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const rad = i % 2 ? 6 : 14;
          ctx.lineTo(cx + Math.cos(a) * rad, 18 + Math.sin(a) * rad);
        }
        ctx.fill();
      });

      symbol("seven", (ctx) => {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `800 112px ${FONT}`;
        ctx.lineJoin = "round";
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#3b0010";
        ctx.strokeText("7", cx, cy + 6);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#fbbf24";
        ctx.strokeText("7", cx, cy + 6);
        const g = ctx.createLinearGradient(0, cy - 50, 0, cy + 55);
        g.addColorStop(0, "#ff8fa3");
        g.addColorStop(0.5, "#e11d48");
        g.addColorStop(1, "#7f0020");
        ctx.fillStyle = g;
        ctx.shadowColor = "rgba(244,63,94,0.7)";
        ctx.shadowBlur = 16;
        ctx.fillText("7", cx, cy + 6);
      });

      symbol("gem", (ctx) => {
        const top = cy - 42;
        const mid = cy - 12;
        const bot = cy + 46;
        ctx.shadowColor = "rgba(16,185,129,0.8)";
        ctx.shadowBlur = 22;
        const g = ctx.createLinearGradient(0, top, 0, bot);
        g.addColorStop(0, "#a7f3d0");
        g.addColorStop(0.4, "#10b981");
        g.addColorStop(1, "#064e3b");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx - 26, top);
        ctx.lineTo(cx + 26, top);
        ctx.lineTo(cx + 48, mid);
        ctx.lineTo(cx, bot);
        ctx.lineTo(cx - 48, mid);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(236,253,245,0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 48, mid);
        ctx.lineTo(cx + 48, mid);
        ctx.moveTo(cx - 26, top);
        ctx.lineTo(cx - 12, mid);
        ctx.lineTo(cx, bot);
        ctx.lineTo(cx + 12, mid);
        ctx.lineTo(cx + 26, top);
        ctx.stroke();
      });

      symbol("coin", (ctx) => {
        ctx.shadowColor = "rgba(251,191,36,0.7)";
        ctx.shadowBlur = 18;
        const g = ctx.createRadialGradient(cx - 14, cy - 16, 6, cx, cy, 50);
        g.addColorStop(0, "#fff7c2");
        g.addColorStop(0.5, "#fbbf24");
        g.addColorStop(1, "#a16207");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#92400e";
        ctx.beginPath();
        ctx.arc(cx, cy, 38, 0, Math.PI * 2);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `800 50px ${FONT}`;
        ctx.fillStyle = "#92400e";
        ctx.fillText("₱", cx, cy + 2);
        ctx.fillStyle = "rgba(255,247,194,0.6)";
        ctx.fillText("₱", cx - 1.5, cy);
      });

      symbol("bell", (ctx) => {
        ctx.shadowColor = "rgba(56,189,248,0.7)";
        ctx.shadowBlur = 18;
        const g = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
        g.addColorStop(0, "#0369a1");
        g.addColorStop(0.35, "#7dd3fc");
        g.addColorStop(1, "#075985");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 46);
        ctx.bezierCurveTo(cx + 30, cy - 46, cx + 34, cy - 10, cx + 36, cy + 14);
        ctx.quadraticCurveTo(cx + 40, cy + 26, cx + 48, cy + 30);
        ctx.lineTo(cx - 48, cy + 30);
        ctx.quadraticCurveTo(cx - 40, cy + 26, cx - 36, cy + 14);
        ctx.bezierCurveTo(cx - 34, cy - 10, cx - 30, cy - 46, cx, cy - 46);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(224,242,254,0.7)";
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy - 18, 6, 16, -0.25, 0, Math.PI * 2);
        ctx.fill();
      });

      letter("ace", "A", "#f9a8d4", "#be185d");
      letter("king", "K", "#93c5fd", "#1d4ed8");
      letter("queen", "Q", "#86efac", "#15803d");
      letter("jack", "J", "#fdba74", "#c2410c");
    }

    // ---- win presentation ---------------------------------------------------------

    private clearWins() {
      this.winLayer?.clear();
      this.pulses.forEach((t) => t.stop());
      this.pulses = [];
      this.reels.forEach((c) => c.each((img: PhaserNS.GameObjects.Image) => img.setScale(1).setAlpha(1)));
      this.banner?.setAlpha(0);
      this.winText?.setText("");
    }

    private showWins(wins: LineWin[]) {
      if (!wins.length) return;
      const winning = new Set<string>();

      wins.forEach((w) => {
        const rows = PAYLINES[w.line];
        const pts = rows.map((row, reel) => new Phaser.Math.Vector2(this.reelX(reel) + CELL_W / 2, AREA_Y + row * CELL_H + CELL_H / 2));
        const color = hex(LINE_COLORS[w.line]);
        // Glow, then dark outline, then bright core
        this.winLayer.lineStyle(16, color, 0.18).strokePoints(pts);
        this.winLayer.lineStyle(8, 0x000000, 0.45).strokePoints(pts);
        this.winLayer.lineStyle(5, color, 1).strokePoints(pts);
        for (let reel = 0; reel < w.count; reel++) winning.add(`${reel}:${rows[reel]}`);
      });

      this.reels.forEach((c, reel) =>
        c.each((img: PhaserNS.GameObjects.Image) => {
          if (winning.has(`${reel}:${Number(img.name)}`)) {
            this.pulses.push(this.tweens.add({ targets: img, scale: 1.08, duration: 360, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
          } else {
            img.setAlpha(0.32);
          }
        }),
      );
    }

    private countUp(total: number) {
      this.tweens.addCounter({
        from: 0,
        to: total,
        duration: Math.min(1400, 300 + total * 6),
        ease: "Quad.easeOut",
        onUpdate: (t) => this.winText.setText(`WIN  ₱${(t.getValue() ?? 0).toFixed(2)}`),
      });
    }

    private celebrate() {
      this.banner.setText("BIG WIN!").setScale(0.4).setAlpha(1);
      this.tweens.add({ targets: this.banner, scale: 1, duration: 450, ease: "Back.easeOut" });
      this.tweens.add({ targets: this.banner, alpha: 0, delay: 2400, duration: 400 });
      const emitter = this.add.particles(GAME_W / 2, AREA_Y - 30, "coin-particle", {
        x: { min: -AREA_W / 2, max: AREA_W / 2 },
        speedY: { min: 200, max: 480 },
        speedX: { min: -80, max: 80 },
        gravityY: 600,
        rotate: { min: 0, max: 360 },
        scale: { min: 0.8, max: 1.6 },
        lifespan: 1800,
        quantity: 4,
        frequency: 30,
      });
      emitter.setDepth(9);
      this.time.delayedCall(1300, () => emitter.stop());
      this.time.delayedCall(3400, () => emitter.destroy());
    }
  };
}
