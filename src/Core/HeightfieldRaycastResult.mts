// Our system is divided into a general part and an engine part,
// for optimization we use the engine part in this file. (playcanvas Vec3)

export default class HeightfieldRaycastResult {

    public vertexIndex = 0;
    public distance    = Number.MAX_VALUE;
    public localNormal = new pc.Vec3(0, 1, 0);
    public normal      = new pc.Vec3(0, 1, 0);
    public localPoint  = new pc.Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    public point       = new pc.Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);

    public clear() {
        this.vertexIndex = 0;
        this.distance = Number.MAX_VALUE;
        this.localNormal.set(0, 1, 0);
        this.normal.set(0, 1, 0);
        this.localPoint.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this.point.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    }
}