import { float } from "../Shared/Types.mjs";
import { IFrustum } from "../TerrainSystem/GeomipGridRenderPreparer.mjs";

const tmpVec = new pc.Vec3();
const tmpRad = new pc.Vec3();
const tmpSphere = new pc.BoundingSphere();

export class Frustum implements IFrustum {

    private _margin: float;
    private _mat: pcx.Mat4;
    private _scale: pcx.Vec3;
    private _frustum: pcx.Frustum;

    public get margin()             { return this._margin; }
    public set margin(value: float) { this._margin = value; }

    public get frustum()                   { return this._frustum; }
    public set frustum(value: pcx.Frustum) { this._frustum = value; }

    public get transform()                { return this._mat; }
    public set transform(value: pcx.Mat4) {
        this._mat.copy(value);
        this._mat.getScale(this._scale);
    }
    
    constructor() {
        this._margin = 1;
        this._mat    = new pc.Mat4();
        this._scale  = new pc.Vec3();
    }

    public containsSphere(localX: float, localY: float, localZ: float, radius: float) {

        tmpVec.set(localX, localY, localZ);
        tmpRad.copy(this._scale).mulScalar(radius);

        this._mat.transformPoint(tmpVec, tmpVec);

        // @ts-ignore [PLAYCANVAS:DOC]: center private in v2
        tmpSphere.center = tmpVec;
        tmpSphere.radius = tmpRad.distance(pc.Vec3.ZERO) * this._margin;

        return this._frustum.containsSphere(tmpSphere) > 0;
    }
}