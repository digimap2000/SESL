import { useRef } from 'react';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';
import { Application, Graphics } from 'pixi.js'

export function Chart({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    //  const appRef = useRef<Application | null>(null)


    console.log('Chart component rendered');

    //
    // Using our custom useAsyncEffect hook to handle the async initialization of the PixiJS
    // application. This gives us the isMounted() function to safely check if the component
    // is still mounted when our async init completes, allowing us to clean up properly
    // or add the canvas to the DOM.
    // 
    useAsyncEffect(async (isMounted) => {
        const app = new Application();

        console.log('Initializing PixiJS application');

        await app.init({
            resizeTo: containerRef.current as HTMLElement,
            backgroundColor: 0x000000,
            backgroundAlpha: 0,
            antialias: true,
            resolution: 1,
            preference: 'webgl',
        });

        // Checking here to see if the component is still mounted, in which case we can continue
        // to append the PixiJS canvas to the container and return the cleanup function.
        if (isMounted() && containerRef.current) {
            containerRef.current.appendChild(app.canvas);


            const graphics = new Graphics();
            app.stage.addChild(graphics);     

            function redraw() {

                console.log('Painting chart');

                graphics.clear()
                graphics.setFillStyle({ color: 'green' })
                graphics.setStrokeStyle({ width: 2, color: 'red' })

                graphics.rect(0, 0, 100, 100)
                graphics.fill()

                graphics.moveTo(0, 0)
                graphics.lineTo(app.renderer.width, app.renderer.height)
                graphics.stroke()

                console.log('Chart painted' + app.renderer.width + 'x' + app.renderer.height);

            }
            window.addEventListener('resize', redraw);
            redraw();

            return () => {
                app.destroy(true, { children: true, texture: true });
            };
        }

        // The component is no longer mounted so must have been unmounted before the async 
        // init completed. We can safely destroy the PixiJS application here and return
        // nothing, as the cleanup function will not be called.
        app.destroy(true, { children: true, texture: true });
        return;

    }, []);

    //
    // Outer div is used to control the layout and styling of the chart.
    // Inner div is the container for the PixiJS application which will
    // autosize to fill the available space. This allows the user to supply
    // a className prop to control the layout of the chart within its parent.
    //
    return (
        <div className={`flex flex-col ${className}`}>
            <div ref={containerRef} className="flex-1 w-full" />
        </div>
    );
}
