import * as PIXI from 'pixi.js';
import { Pane } from '@/components/render/primitives/pane.ts';

const panelRects = [
    { x: .0, y: .0, width: .2, height: .7 },
    { x: .2, y: .0, width: .6, height: .7 },
    { x: .8, y: .0, width: .2, height: .7 },
    { x: .0, y: .7, width: .2, height: .3 },
    { x: .2, y: .7, width: .2, height: .3 },
    { x: .4, y: .7, width: .2, height: .3 },
    { x: .6, y: .7, width: .2, height: .3 },
    { x: .8, y: .7, width: .2, height: .3 }
];

export class Panel extends PIXI.Container {
    private background: PIXI.Graphics;
    public readonly spacing: number;

    constructor(spacing: number = 5) {
        super();
        this.spacing = spacing;
        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        this.resize(100, 100);

        // Add a Pane for each entry in panelRects
        panelRects.forEach((rect, index) => {
            const pane = new Pane(index);
            pane.x = rect.x;
            pane.y = rect.y;
            pane.resize(rect.width, rect.height);
            this.addChild(pane);
        });
    }

    resize(width: number, height: number) {

        this.background.clear();
        this.background.setFillStyle({ color: 0xFF0000, alpha: 0.5 });
        this.background.roundRect(0, 0, width, height, 10);
//        this.background.fill();

        width = width - (this.spacing * 2);
        height = height - (this.spacing * 2);
        this.children.forEach(child => {
            if (child instanceof Pane) {
                const rect = panelRects[child.id];                
                child.x = this.spacing + (rect.x * width) + this.spacing;
                child.y = this.spacing + (rect.y * height) + this.spacing;
                child.resize(
                    (rect.width * width) - (this.spacing * 2), 
                    (rect.height * height) - (this.spacing * 2));
            }
        });
    }
}
