import * as PIXI from 'pixi.js';

interface RectangleOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: number; // Hex color, e.g. 0xff0000
  alpha?: number; // 0 - 1
}

export class RectanglePrimitive extends PIXI.Graphics {
  constructor(options: RectangleOptions) {
    super();
    this.draw(options);
  }

  draw(options: RectangleOptions) {
    const { x = 0, y = 0, width = 100, height = 100, color = 0x0000ff, alpha = 1 } = options;
    this.clear();
    this.setFillStyle({color: color, alpha: alpha});
    this.roundRect(x, y, width, height, 10);
    this.fill();
  }

  update(options: Partial<RectangleOptions>) {
    this.draw({ ...options }); // could merge with existing state
  }
}
