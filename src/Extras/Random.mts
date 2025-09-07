export default class Random {

    public static readonly M1 = 268435456;
    public static readonly M2 = 941205;

    readonly seed: number;

    private _tmp: number;
    private _tick: number;

    constructor(seed: number) {
        this.seed = seed;
        this._tmp  = seed;
    }

    reset() {
        this._tmp = this.seed;
    }

    next(): number {
        this._tmp = (this._tmp * Random.M2) % Random.M1;
        this._tick = this._tmp / Random.M1;
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