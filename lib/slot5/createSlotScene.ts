// The Phaser scene that draws and animates the 5-reel slot.
//
// Phaser touches `window` as soon as it's imported, which breaks Next.js builds.
// So this file never imports Phaser directly: PhaserSlot.tsx loads Phaser in the
// browser and passes it in here. `import type` is fine because types vanish at build time.
import type PhaserNS from "phaser";
import { PAYLINES, REELS, ROWS, SYMBOLS, randomSymbol, type Grid, type LineWin, type Sym } from "./engine";

type PhaserLib = typeof PhaserNS;

export const GAME_W = 1000;
export const GAME_H = 600;
const CELL_W = 168;
const CELL_H = 150;
const REEL_GAP = 10;
const AREA_W = REELS * CELL_W + (REELS - 1) * REEL_GAP;
const AREA_H = ROWS * CELL_H;
const AREA_X = (GAME_W - AREA_W) / 2;
const AREA_Y = 95;
const LINE_COLORS = [0xfbbf24, 0x38bdf8, 0xf472b6, 0x34d399, 0xa78bfa, 0xfb923c, 0x22d3ee, 0xf87171, 0xa3e635, 0xe879f9];

export interface SlotSceneApi {
  /** Small bounce while waiting for the server result. */
  windUp(): void;
  /** Spins to the given result and shows wins. Resolves when the animation ends. */
  spinTo(grid: Grid, wins: LineWin[], bigWin: boolean): Promise<void>;
}

export function createSlotScene(Phaser: PhaserLib, onReady: (api: SlotSceneApi) => void) {
  return class SlotScene extends Phaser.Scene implements SlotSceneApi {
    private reels: PhaserNS.GameObjects.Container[] = [];
    private current: Grid = [];
    private winLayer!: PhaserNS.GameObjects.Graphics;
    private pulses: PhaserNS.Tweens.Tween[] = [];
    private banner!: PhaserNS.GameObjects.Text;

    constructor() {
      super("slot");
    }

    create() {
      this.makeTextures();
      this.drawCabinet();

      const mask = this.make.graphics({}, false).fillRect(AREA_X, AREA_Y, AREA_W, AREA_H).createGeometryMask();
      for (let r = 0; r < REELS; r++) {
        const col = Array.from({ length: ROWS }, () => randomSymbol());
        this.current.push(col);
        const container = this.add.container(this.reelX(r), AREA_Y);
        container.setMask(mask);
        this.fill(container, col);
        this.reels.push(container);
      }

      this.winLayer = this.add.graphics();
      this.banner = this.add
        .text(GAME_W / 2, AREA_Y + AREA_H / 2, "", {
          fontFamily: "Inter, sans-serif",
          fontSize: "72px",
          fontStyle: "800",
          color: "#fde68a",
          stroke: "#78350f",
          strokeThickness: 10,
        })
        .setOrigin(0.5)
        .setDepth(10)
        .setAlpha(0);

      onReady(this);
    }

    // ---- public API used by React -------------------------------------------

    windUp() {
      this.clearWins();
      this.reels.forEach((c, i) =>
        this.tweens.add({ targets: c, y: AREA_Y - 18, duration: 140, delay: i * 30, ease: "Quad.easeOut" }),
      );
    }

    spinTo(grid: Grid, wins: LineWin[], bigWin: boolean): Promise<void> {
      this.clearWins();
      const stops = this.reels.map((container, r) => {
        // Stop the wind-up bounce first. If it were still running, two tweens would
        // fight over the same `y` and the reel would stutter (most visible on reel 5,
        // whose wind-up starts last).
        this.tweens.killTweensOf(container);

        // Every reel moves at the same steady speed; later reels just travel further,
        // so they stop later. Speed is in pixels per millisecond.
        const SPEED = 2.6;
        const SLOW_CELLS = 3; // the last 3 symbols are used to slow down smoothly
        const runMs = 700 + r * 260; // time at full speed before slowing down
        const fillerCount = Math.max(4, Math.round((SPEED * runMs) / CELL_H));

        // Build a strip: the result on top, random symbols in the middle, the current symbols at the bottom.
        // Start showing the bottom, then slide the strip down so the result lands in view.
        const filler = Array.from({ length: fillerCount }, () => randomSymbol());
        const strip = [...grid[r], ...filler, ...this.current[r]];
        this.fill(container, strip);
        const startY = AREA_Y - (strip.length - ROWS) * CELL_H;
        const slowDistance = SLOW_CELLS * CELL_H;
        const fastDistance = AREA_Y - slowDistance - startY;
        container.y = startY;

        return new Promise<void>((resolve) => {
          // Phase 1: constant speed (linear), so symbols move the same distance every frame.
          this.tweens.add({
            targets: container,
            y: startY + fastDistance,
            duration: fastDistance / SPEED,
            ease: "Linear",
            onComplete: () => {
              // Phase 2: slow down. Quad.easeOut starts at twice its average speed,
              // so a duration of 2 × distance / speed hands over from phase 1 without a jump.
              this.tweens.add({
                targets: container,
                y: AREA_Y,
                duration: (2 * slowDistance) / SPEED,
                ease: "Quad.easeOut",
                onComplete: () => {
                  // Tiny bounce as the reel locks in.
                  this.fill(container, grid[r]);
                  this.tweens.add({ targets: container, y: AREA_Y + 10, duration: 70, yoyo: true, ease: "Sine.easeOut" });
                  resolve();
                },
              });
            },
          });
        });
      });

      this.current = grid.map((c) => [...c]);
      return Promise.all(stops).then(() => {
        this.showWins(wins);
        if (bigWin) this.celebrate();
      });
    }

    // ---- drawing --------------------------------------------------------------

    private reelX(r: number) {
      return AREA_X + r * (CELL_W + REEL_GAP);
    }

    private fill(container: PhaserNS.GameObjects.Container, symbols: Sym[]) {
      container.removeAll(true);
      symbols.forEach((s, i) => {
        container.add(this.add.image(CELL_W / 2, i * CELL_H + CELL_H / 2, `sym-${s}`).setName(`${i}`));
      });
    }

    private drawCabinet() {
      const g = this.add.graphics();
      // Outer frame
      g.fillStyle(0x0b1222, 1).fillRoundedRect(AREA_X - 26, AREA_Y - 26, AREA_W + 52, AREA_H + 52, 28);
      g.lineStyle(6, 0xf5a524, 1).strokeRoundedRect(AREA_X - 26, AREA_Y - 26, AREA_W + 52, AREA_H + 52, 28);
      // Reel backgrounds
      for (let r = 0; r < REELS; r++) {
        g.fillStyle(0x16213a, 1).fillRoundedRect(this.reelX(r), AREA_Y, CELL_W, AREA_H, 12);
      }
      // Title
      this.add
        .text(GAME_W / 2, 36, "GOLDEN CARABAO DELUXE", {
          fontFamily: "Inter, sans-serif",
          fontSize: "34px",
          fontStyle: "800",
          color: "#fbbf24",
          stroke: "#3b2400",
          strokeThickness: 6,
        })
        .setOrigin(0.5);
      // Payline numbers down both sides
      PAYLINES.forEach((rows, i) => {
        const y = AREA_Y + rows[0] * CELL_H + CELL_H / 2 + (i % 3) * 14 - 14;
        const tag = (x: number) =>
          this.add.circle(x, y, 11, LINE_COLORS[i]).setStrokeStyle(2, 0x0b1222);
        tag(AREA_X - 13);
        tag(AREA_X + AREA_W + 13);
      });
    }

    private makeTextures() {
      const size = { w: CELL_W - 8, h: CELL_H - 8 };
      const cx = size.w / 2;
      const cy = size.h / 2;

      const draw = (key: Sym, paint: (g: PhaserNS.GameObjects.Graphics) => void, label?: { text: string; color: string; size: number; y?: number }) => {
        const rt = this.add.renderTexture(0, 0, size.w, size.h).setVisible(false);
        const g = this.make.graphics({}, false);
        g.fillStyle(0x1f2b4a, 1).fillRoundedRect(0, 0, size.w, size.h, 16);
        g.lineStyle(2, 0xffffff, 0.08).strokeRoundedRect(1, 1, size.w - 2, size.h - 2, 16);
        paint(g);
        rt.draw(g);
        if (label) {
          const t = this.make.text(
            {
              x: cx,
              y: label.y ?? cy,
              text: label.text,
              style: { fontFamily: "Inter, sans-serif", fontSize: `${label.size}px`, fontStyle: "800", color: label.color, stroke: "#0b1222", strokeThickness: 6 },
            },
            false,
          );
          t.setOrigin(0.5);
          rt.draw(t);
          t.destroy();
        }
        rt.saveTexture(`sym-${key}`);
        g.destroy();
      };

      const star = (g: PhaserNS.GameObjects.Graphics, x: number, y: number, outer: number, inner: number) => {
        const pts: PhaserNS.Math.Vector2[] = [];
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const rad = i % 2 ? inner : outer;
          pts.push(new Phaser.Math.Vector2(x + Math.cos(a) * rad, y + Math.sin(a) * rad));
        }
        g.fillPoints(pts, true);
      };

      draw("wild", (g) => {
        g.fillStyle(0x3b2400, 1).fillRoundedRect(6, 6, size.w - 12, size.h - 12, 12);
        g.fillStyle(0xfbbf24, 1);
        star(g, cx, cy - 12, 46, 20);
      }, { text: "WILD", color: "#fde68a", size: 30, y: size.h - 26 });

      draw("seven", () => {}, { text: "7", color: "#f43f5e", size: 104 });

      draw("gem", (g) => {
        const hex = (r: number) =>
          Array.from({ length: 6 }, (_, i) => new Phaser.Math.Vector2(cx + Math.cos((Math.PI / 3) * i - Math.PI / 6) * r, cy + Math.sin((Math.PI / 3) * i - Math.PI / 6) * r));
        g.fillStyle(0x10b981, 1).fillPoints(hex(50), true);
        g.fillStyle(0x6ee7b7, 0.7).fillPoints(hex(30), true);
        g.lineStyle(3, 0x064e3b, 1).strokePoints(hex(50), true);
      });

      draw("coin", (g) => {
        g.fillStyle(0xf59e0b, 1).fillCircle(cx, cy, 50);
        g.fillStyle(0xfbbf24, 1).fillCircle(cx, cy, 42);
        g.lineStyle(3, 0x92400e, 1).strokeCircle(cx, cy, 42);
      }, { text: "₱", color: "#92400e", size: 54 });

      draw("bell", (g) => {
        g.fillStyle(0x38bdf8, 1);
        g.fillCircle(cx, cy - 10, 34);
        g.fillRect(cx - 34, cy - 10, 68, 34);
        g.fillTriangle(cx - 34, cy + 24, cx - 48, cy + 34, cx - 34, cy + 34);
        g.fillTriangle(cx + 34, cy + 24, cx + 48, cy + 34, cx + 34, cy + 34);
        g.fillRect(cx - 48, cy + 30, 96, 8);
        g.fillStyle(0x075985, 1).fillCircle(cx, cy + 46, 9);
        g.fillStyle(0xe0f2fe, 0.6).fillEllipse(cx - 14, cy - 20, 12, 24);
      });

      draw("cherry", (g) => {
        g.lineStyle(5, 0x15803d, 1);
        g.lineBetween(cx - 20, cy + 6, cx + 10, cy - 44);
        g.lineBetween(cx + 22, cy + 6, cx + 10, cy - 44);
        g.fillStyle(0xbe123c, 1).fillCircle(cx - 22, cy + 22, 25);
        g.fillStyle(0xe11d48, 1).fillCircle(cx + 22, cy + 22, 25);
        g.fillStyle(0xffe4e6, 0.7).fillCircle(cx - 30, cy + 13, 6).fillCircle(cx + 14, cy + 13, 6);
      });

      // Small coin used by the big-win particle effect.
      const pc = this.make.graphics({}, false);
      pc.fillStyle(0xfbbf24, 1).fillCircle(10, 10, 10).lineStyle(2, 0x92400e, 1).strokeCircle(10, 10, 8);
      pc.generateTexture("coin-particle", 20, 20);
      pc.destroy();

      // Sanity check that every symbol got a texture.
      SYMBOLS.forEach((s) => console.assert(this.textures.exists(`sym-${s}`), `missing texture ${s}`));
    }

    // ---- win presentation ---------------------------------------------------------

    private clearWins() {
      this.winLayer?.clear();
      this.pulses.forEach((t) => t.stop());
      this.pulses = [];
      this.reels.forEach((c) => c.each((img: PhaserNS.GameObjects.Image) => img.setScale(1).setAlpha(1)));
      this.banner?.setAlpha(0);
    }

    private showWins(wins: LineWin[]) {
      if (!wins.length) return;
      const winning = new Set<string>();

      wins.forEach((w) => {
        const rows = PAYLINES[w.line];
        const pts = rows.map((row, reel) => new Phaser.Math.Vector2(this.reelX(reel) + CELL_W / 2, AREA_Y + row * CELL_H + CELL_H / 2));
        this.winLayer.lineStyle(8, 0x000000, 0.35).strokePoints(pts);
        this.winLayer.lineStyle(5, LINE_COLORS[w.line], 1).strokePoints(pts);
        for (let reel = 0; reel < w.count; reel++) winning.add(`${reel}:${rows[reel]}`);
      });

      // Dim the losing symbols and pulse the winning ones.
      this.reels.forEach((c, reel) =>
        c.each((img: PhaserNS.GameObjects.Image) => {
          const row = Number(img.name);
          if (winning.has(`${reel}:${row}`)) {
            this.pulses.push(this.tweens.add({ targets: img, scale: 1.08, duration: 380, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
          } else {
            img.setAlpha(0.35);
          }
        }),
      );
    }

    private celebrate() {
      this.banner.setText("BIG WIN!").setScale(0.4).setAlpha(1);
      this.tweens.add({ targets: this.banner, scale: 1, duration: 450, ease: "Back.easeOut" });
      this.tweens.add({ targets: this.banner, alpha: 0, delay: 2200, duration: 400 });
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
