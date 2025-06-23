import Compressor from "../Shared/Compressor.mjs";
import type { float, int } from "../Shared/Types.mjs";
import type AbsHeightMap from "./AbsHeightMap.mjs";
import { IReadonlyAbsHeightMap } from "./AbsHeightMap.mjs";

export const heightMapVersion = 99;
export const factorSize = 3;

export interface IHeightMapFileImportOptions {
    adaptiveWidthAndDepth?: boolean,
    adaptiveMaxHeight?: boolean,
}

export interface IImportFileHeader {
    width: int,
    depth: int,
    maxHeight: float
}

export const heightMapFileCompressedFormat: CompressionFormat = 'gzip';

export abstract class AbsHeightMapFileIO {

    private __readHeightFactor(view: DataView, headerSize: int, width: int, x: int, z: int) {

        const index = z * width + x;
        const r = view.getUint8(headerSize + index * factorSize + 0);
        const g = view.getUint8(headerSize + index * factorSize + 1);
        const b = view.getUint8(headerSize + index * factorSize + 2);
    
        const scaled = (r << 16) | (g << 8) | b;
        const factor = scaled / 0xffffff;
        
        return factor;
    }

    private __writeHeightFactor(view: DataView, headerSize: int, heightMap: IReadonlyAbsHeightMap, x: int, z: int) {

        const index  = z * heightMap.width + x;
        const factor = heightMap.getFactor(x, z);
        const scaled = Math.floor(factor * 0xffffff);
        const r = (scaled >> 16) & 0xff;
        const g = (scaled >> 8) & 0xff;
        const b = (scaled & 0xff);

        view.setUint8(headerSize + index * factorSize + 0, r);
        view.setUint8(headerSize + index * factorSize + 1, g);
        view.setUint8(headerSize + index * factorSize + 2, b);
    }

    protected async __importFromFile(heightMap: AbsHeightMap, buffer: ArrayBuffer, options?: IHeightMapFileImportOptions): Promise<IImportFileHeader | null> {

        // TODO:
        // header version 99
        // headerByteSize, version, width, depth, maxHeight

        const nBuffer = await Compressor.decompressBuffer(buffer, heightMapFileCompressedFormat);
        const view    = new DataView(nBuffer);
        const version = view.getUint32(1, true);

        if (version !== heightMapVersion) {
            console.warn('Height map version: %f no support.', version);
            return null;
        }
    
        const headerSize = view.getUint8(0);
        const width      = view.getUint32(5, true);
        const depth      = view.getUint32(9, true);
        const maxHeight  = view.getFloat32(13, true);
    
        const finalMaxHeight = options?.adaptiveMaxHeight ? heightMap.maxHeight : maxHeight;
        
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
                    const height = factor * finalMaxHeight;

                    heightMap.set(x / factorX, z / factorZ, height);
                }
            }
        }
        else {
        
            for (let z = 0; (z < depth) && (z < heightMap.depth); z++) {
        
                for (let x = 0; (x < width) && (x < heightMap.width); x++) {

                    const factor = this.__readHeightFactor(view, headerSize, width, x, z);
                    const height = factor * finalMaxHeight;
                    
                    heightMap.set(x, z, height);
                }
            }
        }

        return {
            width,
            depth,
            maxHeight
        }
    }

    protected async __exportToBuffer(heightMap: AbsHeightMap) {
    
        // TODO:
        // header version 99
        // headerByteSize, version, width, depth, maxHeight
    
        const headerSize = 1 + 4 + 4 + 4 + 4;
        const buffer     = new ArrayBuffer(headerSize + factorSize * heightMap.width * heightMap.depth);
        const view       = new DataView(buffer);
    
        view.setUint8  (0, headerSize);
        view.setUint32 (1, heightMapVersion, true);
        view.setUint32 (5, heightMap.width, true);
        view.setUint32 (9, heightMap.depth, true);
        view.setFloat32(13, heightMap.maxHeight, true);
    
        for (let z = 0; z < heightMap.depth; z++) {

            for (let x = 0; x < heightMap.width; x++) {
            
                this.__writeHeightFactor(view, headerSize, heightMap, x, z);
            }
        }

        return Compressor.compressBuffer(buffer, heightMapFileCompressedFormat);
    }
}

export default AbsHeightMapFileIO;