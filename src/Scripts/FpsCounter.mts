class FpsCounter extends pc.ScriptType {

    fps: { tick(): void } | undefined;

    initialize(): void {
        
        const constr = (window as any).FPSMeter;

        if (constr) {
            this.fps = new constr({
                heat: true,
                graph: true
            });
        }
    }

    update(dt: number): void {
        this.fps?.tick();
    }
}

export default FpsCounter;
export const fpsCounterScriptName = 'FpsCounter';

pc.registerScript(FpsCounter, fpsCounterScriptName);