import type { int } from "../Extras/Types.mjs";
import type { IPatch } from "../Core/IPatch.mjs";
import type { IPatchLod } from "../Core/IPatchLod.mjs";
import { defaultPatchLod } from "../Core/LodState.mjs";

export class PatchState {
    public visible: boolean = false;
    public lod: Readonly<IPatchLod> = defaultPatchLod;
    public indicesBaseIndex: number = 0;
    public indicesCount: number = 0;
}

export default class Patch extends PatchState implements IPatch {

    readonly index: number;
    readonly size: number;
    readonly x: number;
    readonly z: number;
    readonly minX: number;
    readonly minZ: number;

    constructor(index: number, x: int, z: int, minX: int, minZ: int, size: number) {

        super();

        this.index = index;
        this.size  = size;
        this.x     = x;
        this.z     = z;
        
        this.minX  = minX;
        this.minZ  = minZ;
    }
}