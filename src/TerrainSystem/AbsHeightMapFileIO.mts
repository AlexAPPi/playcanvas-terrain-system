import type { float, int } from "../Shared/Types.mjs";
import type AbsHeightMap from "./AbsHeightMap.mjs";

export const heightMapVersion = 99;
export const factorSize = 3;

export interface IHeightMapFileImportOptions {
    adaptiveWidthAndDepth?: boolean,
    adaptiveMinMaxHeight?: boolean,
}

export interface IImportFileHeader {
    width: int,
    depth: int,
    minHeight: float,
    maxHeight: float
}

export abstract class AbsHeightMapFileIO {

    private __readHeightFactor(view: DataView, headerSize: int, width: int, x: int, z: int) {

        const index = z * width + x;
        const r = view.getUint8(headerSize + index * factorSize + 0);
        const g = view.getUint8(headerSize + index * factorSize + 1);
        const b = view.getUint8(headerSize + index * factorSize + 2);
    
        const scaled = (r << 16) | (g << 8) | b;
        const factor = scaled / 16777215;
        
        return factor;
    }

    private __writeHeightFactor(view: DataView, headerSize: int, heightMap: AbsHeightMap, x: int, z: int) {
        const index  = z * heightMap.width + x;
        const factor = heightMap.getFactor(x, z);
        const scaled = Math.floor(factor * 16777215);
        const r = (scaled >> 16) & 0xFF;
        const g = (scaled >> 8) & 0xFF;
        const b = (scaled & 0xFF);

        view.setUint8(headerSize + index * factorSize + 0, r);
        view.setUint8(headerSize + index * factorSize + 1, g);
        view.setUint8(headerSize + index * factorSize + 2, b);
    }

    protected async __importFromFile(heightMap: AbsHeightMap, buffer: ArrayBuffer, options?: IHeightMapFileImportOptions): Promise<IImportFileHeader | null> {

        // TODO:
        // header version 99
        // headerByteSize, version, width, depth, minHeight, maxHeight
    
        const view    = new DataView(buffer);
        const version = view.getUint32(1, true);

        if (version !== heightMapVersion) {
            console.warn('Height map version: %f no support.', version);
            return null;
        }
    
        const headerSize = view.getUint8(0);
        const width      = view.getUint32(5, true);
        const depth      = view.getUint32(9, true);
        const minHeight  = view.getFloat32(13, true);
        const maxHeight  = view.getFloat32(17, true);
    
        const delta = options?.adaptiveMinMaxHeight
            ? heightMap.maxHeight - heightMap.minHeight
            : maxHeight - minHeight;
        
        const resultMinHeight = options?.adaptiveMinMaxHeight ? heightMap.minHeight : minHeight;
        
        if (heightMap.width !== width ||
            heightMap.depth !== depth &&
            options &&
            options.adaptiveWidthAndDepth) {
            
            // TODO: its work for x^n + 1, z^n + 1
            const factorX = (width - 1) / (heightMap.width - 1);
            const factorZ = (depth - 1) / (heightMap.depth - 1);

            for (let z = 0; z < depth; z += factorZ) {

                for (let x = 0; x < width; x += factorX) {

                    // TODO: smooth for heightMap more import data
                    const factor = this.__readHeightFactor(view, headerSize, width, x | 0, z | 0);
                    const height = resultMinHeight + factor * delta;

                    heightMap.set(x / factorX, z / factorZ, height);
                }
            }
        }
        else {
        
            for (let z = 0; (z < depth) && (z < heightMap.depth); z++) {
        
                for (let x = 0; (x < width) && (x < heightMap.width); x++) {

                    const factor = this.__readHeightFactor(view, headerSize, width, x, z);
                    const height = resultMinHeight + factor * delta;
                    
                    heightMap.set(x, z, height);
                }
            }
        }

        return {
            width,
            depth,
            minHeight,
            maxHeight
        }
    }

    protected async __exportToBuffer(heightMap: AbsHeightMap) {
    
        // TODO:
        // header version 99
        // headerByteSize, version, width, depth, minHeight, maxHeight
    
        const headerSize = 1 + 4 + 4 + 4 + 4 + 4;
        const buffer = new ArrayBuffer(headerSize + factorSize * heightMap.width * heightMap.depth);
        const view   = new DataView(buffer);
    
        view.setUint8  (0, headerSize);
        view.setUint32 (1, heightMapVersion, true);
        view.setUint32 (5, heightMap.width, true);
        view.setUint32 (9, heightMap.depth, true);
        view.setFloat32(13, heightMap.minHeight, true);
        view.setFloat32(17, heightMap.maxHeight, true);
    
        for (let z = 0; z < heightMap.depth; z++) {

            for (let x = 0; x < heightMap.width; x++) {
            
                this.__writeHeightFactor(view, headerSize, heightMap, x, z);
            }
        }
    
        return buffer;
    }
}

export default AbsHeightMapFileIO;