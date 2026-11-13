import Phaser from "phaser";
import type { Hud } from "../hud.ts";
import { Backdrop } from "./backdrop.ts";

/** Every scene change fades out this long, to the same deep violet-black. */
const FADE_OUT_MS = 450;
const FADE_RGB = [4, 2, 12] as const;

/**
 * What the title, the play scene and the cutscene have in common: the shared
 * backdrop, the HUD, the Space bar and the fade between scenes.
 */
export abstract class ArcadeScene extends Phaser.Scene {
  protected backdrop!: Backdrop;
  /** True once the scene has begun fading out to the next one. */
  protected leaving = false;

  constructor(key: string, protected readonly hud: Hud) {
    super(key);
  }

  /** Fills the stage; runs every time the scene starts. */
  protected abstract build(): void;

  /** What the Space bar does here. */
  protected abstract onSpace(): void;

  create(): void {
    this.leaving = false;
    this.backdrop = new Backdrop(this);
    this.input.keyboard?.on("keydown-SPACE", () => this.onSpace());
    this.build();
  }

  override update(_time: number, delta: number): void {
    this.backdrop.scroll(delta);
  }

  protected fadeIn(ms: number): void {
    this.cameras.main.fadeIn(ms, ...FADE_RGB);
  }

  /** Fades out, then starts another scene. Later requests are ignored. */
  protected fadeTo(key: string, data?: object): void {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(FADE_OUT_MS, ...FADE_RGB);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start(key, data);
    });
  }
}
