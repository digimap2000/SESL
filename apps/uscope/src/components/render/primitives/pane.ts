import * as PIXI from 'pixi.js';

export class Pane extends PIXI.Container {
  private background: PIXI.Graphics;
  public readonly id: number;

  constructor(id: number = 0) {
    super();
    this.id = id;
    this.background = new PIXI.Graphics();
    this.addChild(this.background);
    this.resize(200, 100);
  }

  resize(width: number, height: number) {
    console.log(`Pane #${this.id} resized to ${width}x${height}`);
    this.background.clear();
    this.background.setFillStyle({color: 0xFF0000, alpha: 0.5});
    this.background.roundRect(0, 0, width, height, 10);
    this.background.fill();
  }
}
