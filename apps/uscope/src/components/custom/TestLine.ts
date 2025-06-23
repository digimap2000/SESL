import { Container, Graphics, Text } from 'pixi.js';

export function createLabelLine(label: string, lineLength: number): Container {
    const container = new Container();

    // Create text
    const text = new Text({
        text: label,
        style: {
            fontFamily: 'Geist Sans',
            fontSize: 12,
            fill: 'orange',
        }
    });
    text.anchor.set(0.5, 0.5); // Center anchor
    text.x = lineLength / 2;
    text.y = 0;


    const pillWidth = text.width + 24;
    const pillHeight = 20;
    const pill = new Graphics();
    pill.setFillStyle({ color: 'red' })
    pill.setStrokeStyle({ width: 1, color: 'orange' })
    pill.roundRect((lineLength - pillWidth) / 2, -pillHeight/2, pillWidth, pillHeight, pillHeight / 2);
    pill.stroke();
    
    const pillBounds = pill.getBounds();

    // Create line
    const line = new Graphics();
    line.setStrokeStyle({ width: 1, color: 'orange' })
    line.moveTo(5, 0);
    line.lineTo(pillBounds.minX, 0);
    line.moveTo(pillBounds.maxX, 0);
    line.lineTo(lineLength - 5, 0);
    line.stroke();

    const triangle = new Graphics();
    triangle.setFillStyle({ color: 'orange' })
    triangle.moveTo(0, 0);
    triangle.lineTo(10, 5);
    triangle.lineTo(10, -5);
    triangle.lineTo(0, 0);
    triangle.fill();
    triangle.moveTo(lineLength, 0);
    triangle.lineTo(lineLength-10, 5);
    triangle.lineTo(lineLength-10, -5);
    triangle.lineTo(lineLength, 0);
    triangle.fill();

    // Add to container
    container.addChild(line);
//    container.addChild(triangle);
    container.addChild(pill);
    container.addChild(text);

    return container;
}