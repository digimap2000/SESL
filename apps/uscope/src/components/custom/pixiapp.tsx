import { useRef } from 'react';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';
import { Application } from 'pixi.js'
import { Panel } from '@/components/render/panel.ts';

export function Chart({ className }: { className?: string }) {
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

    //
    // Using our custom useAsyncEffect hook to handle the async initialization of the PixiJS
    // application. This gives us the isMounted() function to safely check if the component
    // is still mounted when our async init completes, allowing us to clean up properly
    // or add the canvas to the DOM.
    // 
    useAsyncEffect(async (isMounted) => {
        const app = new Application();
        await app.init({
            resizeTo: undefined,                            //!< We manage resizing ourselves
            width: rootRef.current?.clientWidth || 640,     //!< Default width if not set
            height: rootRef.current?.clientHeight || 480,   //!< Default height if not set
            backgroundAlpha: 0,                             //!< Transparent background
            resolution: window.devicePixelRatio,
            autoDensity: true,                              //!< Ensures canvas scales correctly
            antialias: true,                                //!< Enable antialiasing for smoother graphics
            preference: 'webgl',                            //!< WegGL is fully featured and non experimental
        });

        // Lets get the error handling out of the way first. There is every chance that React
        // will unmount the component before the async init completes, so we need to check
        // if the component is still mounted before we try to append the PixiJS canvas to the
        // container. If it is not mounted, we can safely destroy the PixiJS application and
        // return nothing, as the cleanup function will not be called.
        if (!isMounted() || !canvasRef.current || !rootRef.current) {
            app.destroy(true, { children: true, texture: true });
            return;
        }

        // A single panel is added to the PixiJS application stage. This is our top level custom
        // comonent onto which we will add background, panes etc.
        app.stage.addChild(new Panel());

        // Our fully prepared PixiJS application is now ready to be added to the DOM. It is added
        // to the canvasRef which is a div that we have created to hold the PixiJS canvas. This floats
        // above the rootRef which is the main container for the chart sidestepping the resizing
        // issues that can occur when trying to append the canvas directly to the rootRef and resize it.
        canvasRef.current.appendChild(app.canvas);

        //
        // We're going to support component resizing using the ResizeObserver API. This calls our 
        // handler when the root div is resized. We can use the size of this empty, but well behaved,
        // div to resize the PixiJS application canvas floated in the inner div.
        //
        // We are expecting to see a single child panel but simply stack all the children vertically
        // and resize them to fit the available space.
        //
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            app.renderer.resize(width, height);            
            app.stage.children.forEach((child, index) => {
                if (child instanceof Panel) {
                    child.x = 0;
                    child.y = (height * index) / app.stage.children.length;
                    child.resize(width, height / app.stage.children.length);
                }
            });

        });
        observer.observe(rootRef.current);

        // Cleanup function to destroy the PixiJS application and remove the observer when the component
        // is unmounted. This ensures we don't leak memory or leave the PixiJS application running
        // after the component is no longer in the DOM.
        return () => {
            app.destroy(true, { children: true, texture: true });
        };

    }, []);

    //
    // The component layout is slightly unusual. This is to accommodate the
    // dynamic resizing of the PixiJS application canvas which can be problematic when
    // shrinking vertically as the application will attempt to overflow the window. 
    //
    // After some experimentation, I've found the best solution is an outer div defining the
    // layout and under the control of the user. This remains empty except for parenting a
    // floating inner div which is sized to cover the entire area of the
    // outer div and holds the PixiJS application canvas.
    // 
    return (
        <div ref={rootRef} className={className}>
            <div ref={canvasRef} className="float absolute" />
        </div>
    );
}
