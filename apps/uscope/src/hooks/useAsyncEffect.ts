import { useEffect } from 'react';

/**
 * A hook for running async effects with optional cleanup and safe unmount detection.
 * 
 * The requirement for this hook stems from the need to handle asynchronous operations within the
 * react lifecycle. For example, when creating a PixiJS application we must call "init" to set it up,
 * before we can get a handle to the canvas element and append it to the DOM. This call is asynchronous,
 * and it is quite possible that the component will unmount before the async operation completes.
 *
 * This hook allows the effect to be run asynchronously whilst implementing an isMounted() function
 * for the caller to safely check if the component is still mounted before performing any operations..
 * 
 * @param effect - Async function that receives an isMounted() function and returns optional cleanup
 * @param deps - Dependency array like in useEffect
 */
export function useAsyncEffect(
    effect: (isMounted: () => boolean) => Promise<void | (() => void | Promise<void>)>,
    deps: React.DependencyList
): void {
    useEffect(() => {
        let isActive = true;
        let cleanupFunc: void | (() => void | Promise<void>);

        const maybeAsyncCleanup = async () => {
            if (typeof cleanupFunc === 'function') {
                await cleanupFunc();
            }
        };

        (async () => {
            cleanupFunc = await effect(() => isActive);
        })();

        return () => {
            isActive = false;
            maybeAsyncCleanup();
        };
    }, deps);
}
