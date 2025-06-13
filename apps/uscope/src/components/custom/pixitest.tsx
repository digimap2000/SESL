import {
    Application,
    extend,
} from '@pixi/react'
import {
    Container,
    Graphics,
} from 'pixi.js'

import { useCallback, useEffect, useRef } from 'react'

extend({
    Container,
    Graphics,
})

export function PixiGraph(): JSX.Element {

    const drawCallback = useCallback(graphics => {
        graphics.clear()
        graphics.setFillStyle({ color: 'red' })
        graphics.rect(0, 0, 100, 100)
        graphics.fill()
    }, [])

    useEffect(() => {
        console.log('Mounted Application')
        return () => {
            console.log('Unmounted Application')
        }
    }, [])

    return (
        <Application>
            <pixiContainer x={100} y={100}>
                <pixiGraphics key={Date.now()} draw={drawCallback} />
            </pixiContainer>
        </Application>
    )
}