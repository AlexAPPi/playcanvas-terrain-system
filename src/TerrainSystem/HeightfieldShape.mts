import { float, int, IVector3, RefObject } from "../Shared/Types.mjs";
import { IReadonlyAbsPatchedHeightMap } from "./AbsPatchedHeightMap.mjs";
import { IZone } from "./IZone.mjs";
import TerrainRaycastResult from "./TerrainRaycastResult.mjs";
import Triangle from "./Triangle.mjs";

export interface ICoordXZ {
    x: int,
    z: int,
}

export interface IGridRaycastState {
    x: int,
    z: int,
    param: int,
    prevX: int,
    prevZ: int,
    prevParam: int,
    maxDistanceFlat: float,
}

const infinite        = 9999999;
const modelTransform  = new pc.Mat4();
const tmpRay          = new pc.Ray();
const tmpRaycastVec   = new pc.Vec3();
const tmpPos1         = new pc.Vec3();
const tmpPos2         = new pc.Vec3();
const tmpPos3         = new pc.Vec3();

const triangle       = new Triangle();
const debugTmpVec    = new pc.Vec3();
const debugTransform = new pc.Mat4();
const debugPositions = new Array(16);

let debugTransformIsIdentity = true;

export interface IAABB extends IZone {
    minY: float,
    maxY: float,
}

function debugDrawTriangleLines(tri: pcx.Tri, color = pc.Color.YELLOW) {
    /*
    [
        tri.v0.x, tri.v0.y, tri.v0.z, tri.v1.x, tri.v1.y, tri.v1.z,
        tri.v1.x, tri.v1.y, tri.v1.z, tri.v2.x, tri.v2.y, tri.v2.z,
        tri.v2.x, tri.v2.y, tri.v2.z, tri.v0.x, tri.v0.y, tri.v0.z,
    ], color, false);
    ]
    */
    debugTransform.transformPoint(tri.v0, debugTmpVec);
    debugPositions[0] = debugPositions[15] = debugTmpVec.x;
    debugPositions[1] = debugPositions[16] = debugTmpVec.y;
    debugPositions[2] = debugPositions[17] = debugTmpVec.z;
    debugTransform.transformPoint(tri.v1, debugTmpVec);
    debugPositions[3] = debugPositions[6] = debugTmpVec.x;
    debugPositions[4] = debugPositions[7] = debugTmpVec.y;
    debugPositions[5] = debugPositions[8] = debugTmpVec.z;
    debugTransform.transformPoint(tri.v2, debugTmpVec);
    debugPositions[9]  = debugPositions[12] = debugTmpVec.x;
    debugPositions[10] = debugPositions[13] = debugTmpVec.y;
    debugPositions[11] = debugPositions[14] = debugTmpVec.z;
    pc.app?.drawLineArrays(debugPositions, color, false);
}

export function intersectsRayBox(aabb: IAABB, ray: pcx.Ray) {

    const rayOrigin    = ray.origin;
    const rayDirection = ray.direction;

    const minX = aabb.minX;
    const maxX = aabb.maxX;
    const minY = aabb.minY;
    const maxY = aabb.maxY;
    const minZ = aabb.minZ;
    const maxZ = aabb.maxZ;

    let tmin = (minX - rayOrigin.x) / rayDirection.x;
    let tmax = (maxX - rayOrigin.x) / rayDirection.x;

    if (tmin > tmax) {
        let temp = tmin;
        tmin = tmax;
        tmax = temp;
    }

    let tymin = (minY - rayOrigin.y) / rayDirection.y;
    let tymax = (maxY - rayOrigin.y) / rayDirection.y;

    if (tymin > tymax) {
        let temp = tymin;
        tymin = tymax;
        tymax = temp;
    }

    if ((tmin > tymax) || (tymin > tmax)) {
        return false;
    }

    if (tymin > tmin) {
        tmin = tymin;
    }

    if (tymax < tmax) {
        tmax = tymax;
    }

    let tzmin = (minZ - rayOrigin.z) / rayDirection.z;
    let tzmax = (maxZ - rayOrigin.z) / rayDirection.z;

    if (tzmin > tzmax) {
        let temp = tzmin;
        tzmin = tzmax;
        tzmax = temp;
    }

    if ((tmin > tzmax) || (tzmin > tmax)) {
        return false;
    }

    return true;
}

export default class HeightfieldShape {

    private _heightMap: IReadonlyAbsPatchedHeightMap;
    private _beginPos: pcx.Vec3;
    private _endPos: pcx.Vec3;
    private _boundingBox: IAABB;

    constructor(heightMap: IReadonlyAbsPatchedHeightMap) {
        this._heightMap = heightMap;
        this._beginPos = new pc.Vec3();
        this._endPos = new pc.Vec3();
        this.updateBoundingBox();
    }

    public updateBoundingBox() {
        
        const halfWidth = this._heightMap.width / 2;
        const halfDepth = this._heightMap.depth / 2;

        this._boundingBox = {
            minX: -halfWidth,
            minY: this._heightMap.minHeight,
            minZ: -halfDepth,
            maxX: halfWidth,
            maxY: this._heightMap.maxHeight,
            maxZ: halfDepth,
        }
    }

    protected _triangleIntersectsRay(tri: Triangle, ray: pcx.Ray, bestResult: TerrainRaycastResult): boolean {

        if (tri.intersectsRay(ray, tmpRaycastVec)) {
    
            const distance = tmpRaycastVec.distance(ray.origin);
            
            if (bestResult.distance > distance) {
                bestResult.distance = distance;
    
                tri.getNormal(bestResult.localNormal);
    
                bestResult.normal.copy(bestResult.localNormal);
                bestResult.localPoint.copy(tmpRaycastVec);
                bestResult.point.copy(tmpRaycastVec);
    
                debugDrawTriangleLines(tri, pc.Color.RED);
    
                const distanceP0 = bestResult.point.distance(tri.v0);
                const distanceP1 = bestResult.point.distance(tri.v1);
                const distanceP2 = bestResult.point.distance(tri.v2);
    
                if (distanceP0 > distanceP1) {
    
                    if (distanceP1 > distanceP2) {
                        bestResult.vertexIndex = tri.index2;
                    }
                    else {
                        bestResult.vertexIndex = tri.index1;
                    }
                }
                else {
                    
                    if (distanceP0 > distanceP2) {
                        bestResult.vertexIndex = tri.index2;
                    }
                    else {
                        bestResult.vertexIndex = tri.index0;
                    }
                }
    
                return true;
            }
        }
    
        //debugDrawTriangleLines(tri);
        return false;
    }

    protected _assignPosition(index: int, buf: RefObject<IVector3>) {

        const x = index % this._heightMap.width | 0;
        const z = index / this._heightMap.width | 0;

        buf.x = (-this._heightMap.width / 2) + x;
        buf.y = this._heightMap.get(x, z);
        buf.z = (-this._heightMap.depth / 2) + z;
    }

    protected _quadAction(rs: IGridRaycastState, ray: pcx.Ray, result: TerrainRaycastResult): boolean {

        const x = rs.prevX;
        const z = rs.prevZ;

        if (x < 0 || z < 0 || x >= this._heightMap.width - 1 || z >= this._heightMap.depth - 1) {
			return false;
		}

        const xFan2 = x % 2 === 0;
        const zFan2 = z % 2 === 0;

        let index0, index1, index2;

        {
            if (xFan2 !== zFan2) {
                index0 = (z + 0) * this._heightMap.width + (x + 0);
                index1 = (z + 1) * this._heightMap.width + (x + 0);
                index2 = (z + 0) * this._heightMap.width + (x + 1);
            } else {
                index0 = (z + 0) * this._heightMap.width + (x + 0);
                index1 = (z + 1) * this._heightMap.width + (x + 1);
                index2 = (z + 0) * this._heightMap.width + (x + 1);
            }

            this._assignPosition(index0, tmpPos1);
            this._assignPosition(index1, tmpPos2);
            this._assignPosition(index2, tmpPos3);

            triangle.index0 = index0;
            triangle.index1 = index1;
            triangle.index2 = index2;

            triangle.set(tmpPos1, tmpPos2, tmpPos3);
        }

        if (this._triangleIntersectsRay(triangle, ray, result)) {
            return true;
        }

        {
            if (xFan2 !== zFan2) {
                index0 = (z + 0) * this._heightMap.width + (x + 1);
                index1 = (z + 1) * this._heightMap.width + (x + 0);
                index2 = (z + 1) * this._heightMap.width + (x + 1);
            } else {
                index0 = (z + 0) * this._heightMap.width + (x + 0);
                index1 = (z + 1) * this._heightMap.width + (x + 0);
                index2 = (z + 1) * this._heightMap.width + (x + 1);
            }

            this._assignPosition(index0, tmpPos1);
            this._assignPosition(index1, tmpPos2);
            this._assignPosition(index2, tmpPos3);

            triangle.index0 = index0;
            triangle.index1 = index1;
            triangle.index2 = index2;

            triangle.set(tmpPos1, tmpPos2, tmpPos3);
        }

        if (this._triangleIntersectsRay(triangle, ray, result)) {
            return true;
        }

        return false;
    }

    private _intersectsRay(localRay: pcx.Ray, result: TerrainRaycastResult = new TerrainRaycastResult()): boolean {

        if (!intersectsRayBox(this._boundingBox, localRay)) {
            return false;
        }

        this._beginPos.copy(localRay.origin);
        this._beginPos.x += this._boundingBox.maxX;
        this._beginPos.z += this._boundingBox.maxZ;

        this._endPos.copy(localRay.direction).add(this._beginPos);

        let rayDirectionFlatX = this._endPos.x - this._beginPos.x;
        let rayDirectionFlatZ = this._endPos.z - this._beginPos.z;

        const maxDistanceFlat = Math.sqrt(rayDirectionFlatX ** 2 + rayDirectionFlatZ ** 2);

        if (maxDistanceFlat < 0.0001) {
            // Consider the ray vertical
            rayDirectionFlatX = 0;
            rayDirectionFlatZ = 0;
        }
        else {
            rayDirectionFlatX /= maxDistanceFlat;
            rayDirectionFlatZ /= maxDistanceFlat;
        }

        const xiStep = rayDirectionFlatX > 0 ? 1 : rayDirectionFlatX < 0 ? -1 : 0;
        const ziStep = rayDirectionFlatZ > 0 ? 1 : rayDirectionFlatZ < 0 ? -1 : 0;

        const paramDeltaX = xiStep !== 0 ? 1 / Math.abs(rayDirectionFlatX) : infinite;
        const paramDeltaZ = ziStep !== 0 ? 1 / Math.abs(rayDirectionFlatZ) : infinite;

        let paramCrossX;
        let paramCrossZ;

        if (xiStep !== 0) {
            paramCrossX = xiStep === 1
                ? (Math.ceil(this._beginPos.x) - this._beginPos.x) * paramDeltaX
                : (this._beginPos.x - Math.floor(this._beginPos.x)) * paramDeltaX;
        }
        else {
            paramCrossX = infinite;  // Will never cross on X
        }

        if (ziStep !== 0) {
            paramCrossZ = ziStep === 1
                ? (Math.ceil(this._beginPos.z) - this._beginPos.z) * paramDeltaZ
                : (this._beginPos.z - Math.floor(this._beginPos.z)) * paramDeltaZ;
        }
        else {
            paramCrossZ = infinite;  // Will never cross on Z
        }

        const rs: IGridRaycastState = {
            x: this._beginPos.x | 0,
            z: this._beginPos.z | 0,
            param: 0,
            prevX: 0,
            prevZ: 0,
            prevParam: 0,
            maxDistanceFlat: maxDistanceFlat,
        };

	    // Workaround cases where the ray starts at an integer position
	    if (paramCrossX === 0.0) {
            paramCrossX += paramDeltaX;
            // If going backwards, we should ignore the position we would get by the above flooring,
            // because the ray is not heading in that direction
            if (xiStep === -1) {
                rs.x -= 1;
            }
        }

        if (paramCrossZ === 0.0) {
            paramCrossZ += paramDeltaZ;
            if (ziStep === -1)
                rs.z -= 1;
        }

        let hasHit = false;

        while (!hasHit) {

            rs.prevX = rs.x;
            rs.prevZ = rs.z;
            rs.prevParam = rs.param;
    
            if (paramCrossX < paramCrossZ) {
                // X lane
                rs.x += xiStep;
                // Assign before advancing the param,
                // to be in sync with the initialization step
                rs.param = paramCrossX;
                paramCrossX += paramDeltaX;
            }
            else {
                // Z lane
                rs.z += ziStep;
                rs.param = paramCrossZ;
                paramCrossZ += paramDeltaZ;
            }
    
            if (this._quadAction(rs, localRay, result)) {
                hasHit = true;
            }

            if (rs.param > rs.maxDistanceFlat) {
                rs.param = rs.maxDistanceFlat;
                break;
            }
        }

        return hasHit;
    }

    public intersectsRay(worldTranform: pcx.Mat4 | null | undefined, ray: pcx.Ray, result: TerrainRaycastResult = new TerrainRaycastResult()): boolean {

        if (worldTranform) {
            modelTransform.copy(worldTranform).invert();
            modelTransform.transformPoint(ray.origin, tmpRay.origin);
            modelTransform.transformVector(ray.direction, tmpRay.direction);
    
            debugTransform.copy(worldTranform);
            debugTransformIsIdentity = false;
        }
        else if (!debugTransformIsIdentity) {
            debugTransform.setIdentity();
            debugTransformIsIdentity = true;
        }
    
        const hit = this._intersectsRay(worldTranform ? tmpRay : ray, result);
    
        if (hit && worldTranform) {
            // update world point and normal, but save local
            worldTranform.transformPoint(result.point, result.point);
            worldTranform.transformVector(result.normal, result.normal);
        }
    
        return !!hit;
    }
}