export default class Random {

    private _tmp: number;
    private _tick: number;

    readonly seed: number;

    constructor(seed: number) {
        this.seed = seed;
        this._tmp  = seed;
    }

    reset() {
        this._tmp = this.seed;
    }

    next(): number {
        this._tmp = (this._tmp * 48271) % 2147483647;
        this._tick = this._tmp / 2147483647;
        return this._tick;
    }

    nextFloat(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    nextInt(min: number, max: number): number {
        return this.nextFloat(min, max) | 0;
    }
    
    random(): number {
        return this.next();
    }

    nrand(): number {
        return this.nextFloat(-1, 1);
    }
}