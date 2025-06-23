import * as PIXI from 'pixi.js';

interface RectangleOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: number; // Hex color, e.g. 0xff0000
  alpha?: number; // 0 - 1
}

export class RectanglePrimitive {
  public graphics: PIXI.Graphics;
  private options: Required<RectangleOptions>;

  constructor(options: RectangleOptions = {}) {
    this.options = {
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: options.width ?? 100,
      height: options.height ?? 100,
      color: options.color ?? 0x0000ff,
      alpha: options.alpha ?? 1,
    };

    this.graphics = new PIXI.Graphics();
    this.draw();
  }

  private draw() {
    const { x, y, width, height, color, alpha } = this.options;
    this.graphics.clear();
    this.graphics.setFillStyle({color: color, alpha: alpha});
    this.graphics.roundRect(x, y, width, height, 10);
    this.graphics.fill();
  }

  public update(options: Partial<RectangleOptions>) {
    Object.assign(this.options, options);
    this.draw();
  }

  public destroy() {
    this.graphics.destroy();
  }
}
