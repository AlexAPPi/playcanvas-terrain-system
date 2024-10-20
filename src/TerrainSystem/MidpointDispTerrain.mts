import { calcNextPowerOfTwo, randomFloatRange } from "../Shared/Utils.mjs";
import { int, float } from "../Shared/Types.mjs";
import BaseTerrain from "./Terrain.mjs";

export class MidpointDispTerrain extends BaseTerrain {

    public createMidpointDisplacement(roughness: float): void {

        if (roughness < 0.0) {
            throw Error("roughness must be positive");
        }

        this._createMidpointDisplacementF32(roughness);
        this.normalizeHeightMap();
    }

    private _createMidpointDisplacementF32(roughness: float): void {

        let rectSize  = calcNextPowerOfTwo(this.width);
        let curHeight = rectSize / 2.0;

        const heightReduce = Math.pow(2.0, -roughness);
    
        while (rectSize > 0) {

            this._diamondStep(rectSize, curHeight);
            this._squareStep(rectSize, curHeight);

            rectSize = (rectSize / 2) | 0;
            curHeight *= heightReduce;
        }
    }

    private _diamondStep(rectSize: int, curHeight: float): void {

        const HalfRectSize = Math.floor(rectSize / 2);

        for (let y = 0; y < this.depth; y += rectSize) {

            for (let x = 0; x < this.width; x += rectSize) {
                
                let nextX = (x + rectSize) % this.width;
                let nextY = (y + rectSize) % this.depth;
    
                if (nextX < x) {
                    nextX = this.width - 1;
                }
    
                if (nextY < y) {
                    nextY = this.depth - 1;
                }
    
                const topLeft     = this.heightMap.get(x, y);
                const topRight    = this.heightMap.get(nextX, y);
                const bottomLeft  = this.heightMap.get(x, nextY);
                const bottomRight = this.heightMap.get(nextX, nextY);
    
                const midX = (x + HalfRectSize) % this.width;
                const midY = (y + HalfRectSize) % this.depth;
    
                const randValue = randomFloatRange(curHeight, -curHeight);
                const midPoint = (topLeft + topRight + bottomLeft + bottomRight) / 4.0;
    
                this.setHeight(midX, midY, midPoint + randValue);
            }
        }
    }

    private _squareStep(rectSize: int, curHeight: float): void {

        const halfRectSize = (rectSize / 2) | 0;

        for (let y = 0; y < this.depth; y += rectSize) {

            for (let x = 0; x < this.width; x += rectSize) {
                
                let nextX = (x + rectSize) % this.width;
                let nextY = (y + rectSize) % this.depth;
    
                if (nextX < x) {
                    nextX = this.width - 1;
                }
    
                if (nextY < y) {
                    nextY = this.depth - 1;
                }
    
                const midX = (x + halfRectSize) % this.width;
                const midY = (y + halfRectSize) % this.depth;
                  
                const prevMidX = (x - halfRectSize + this.width) % this.width;
                const prevMidY = (y - halfRectSize + this.depth) % this.depth;
    
                const curTopLeft  = this.heightMap.get(x, y);
                const curTopRight = this.heightMap.get(nextX, y);
                const curCenter   = this.heightMap.get(midX, midY);
                const prevYCenter = this.heightMap.get(midX, prevMidY);
                const curBotLeft  = this.heightMap.get(x, nextY);
                const prevXCenter = this.heightMap.get(prevMidX, midY);
    
                const curLeftMid = (curTopLeft + curCenter + curBotLeft + prevXCenter) / 4.0 + randomFloatRange(-curHeight, curHeight);
                const curTopMid  = (curTopLeft + curCenter + curTopRight + prevYCenter) / 4.0 + randomFloatRange(-curHeight, curHeight);
    
                this.setHeight(midX, y, curTopMid);
                this.setHeight(x, midY, curLeftMid);
            }
        }
    }
}