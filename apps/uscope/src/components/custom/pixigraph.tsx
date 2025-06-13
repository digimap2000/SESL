import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js'

export function PixiGraph() {
    const containerRef = useRef<HTMLDivElement>(null)
    //  const appRef = useRef<Application | null>(null)

    useEffect(() => {

        const init = async () => {
            if (!containerRef.current) return;

            const app = new Application();
            await app.init({
                width: 800,
                height: 600,
                backgroundColor: 0x1099bb,
                antialias: true,     // Enable antialiasing
                resolution: 1,       // Resolution / device pixel ratio
                preference: 'webgl', // or 'webgpu' // Renderer preference
            });

            containerRef.current.appendChild(app.canvas);

            // Cleanup on unmount
            return () => {
                app.destroy(true, { children: true, texture: true });
                if (containerRef.current && app.canvas.parentNode === containerRef.current) {
                    containerRef.current.removeChild(app.canvas);
                }
            };
        }

        init();

    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
