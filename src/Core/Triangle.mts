import type { int } from "../Extras/Types.mjs";

const tmpTriVecA = new pc.Vec3();
const tmpTriVecB = new pc.Vec3();

export class Triangle extends pc.Tri {

    index0: int;
    index1: int;
    index2: int;

    getNormal(rsh: pcx.Vec3) {
        tmpTriVecA.sub2(this.v1, this.v0);
        tmpTriVecB.sub2(this.v2, this.v0);
        rsh.cross(tmpTriVecA, tmpTriVecB).normalize();
    }
}

export default Triangle;