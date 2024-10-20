(() => {

    // При таком подходе ширина не может быть равна размеру патча

    const patch = 129;
    const width = 1025;
    const depth = 1025;
    const patches = [];
    const numPatchesX = (width - 1) / (patch - 1) | 0;
    const numPatchesZ = (depth - 1) / (patch - 1) | 0;
    const matrix = new Array(patch * patch * numPatchesX * numPatchesZ);
    const patchMatrixLength = patch * patch;

    const matrixFormatter = (x, z) => `${x},${z}`;
    const getIndex = (x, z) => {

        const localX = x % patch;
        const localZ = z % patch;
        const patchX = Math.ceil(x / patch) - (localX > 0 ? 1 : 0);
        const patchZ = Math.ceil(z / patch) - (localZ > 0 ? 1 : 0);

        const patchOffset = (patchZ * numPatchesX + patchX) * patchMatrixLength;
        const localIndex  = (localZ * patch + localX);

        return patchOffset + localIndex;
    }

    for (let z = 0; z < depth; z++) {

        for (let x = 0; x < width; x++) {

            const idx = getIndex(x, z);
            matrix[idx] = matrixFormatter(x, z);
        }
    }

    for (let patchZ = 0; patchZ < numPatchesZ; patchZ++) {

        for (let patchX = 0; patchX < numPatchesX / 2; patchX++) {

            const patchMatrix = new Array(patchMatrixLength);
            const chunkFirstLevel  = patchZ * numPatchesX + patchX * 2;
            const chunkSecondLevel = patchZ * numPatchesX + patchX * 2 + 1;

            for (let z = 0; z < patch; z++) {

                for (let x = 0; x < patch; x++) {

                    const idx    = z * patch + x;
                    const mIdx1  = patchMatrixLength * chunkFirstLevel + idx;
                    const mIdx2  = patchMatrixLength * chunkSecondLevel + idx;

                    const orig1  = matrix[mIdx1];
                    const orig2  = matrix[mIdx2];

                    patchMatrix[idx] = `${orig1}|${orig2}|${matrixFormatter(x, z)}`;
                }
            }

            patches.push(patchMatrix);
        }
    }

    console.log(matrix, patches);

    function testXZ(x, z) {

        const mIdx = getIndex(x, z);

        const localX = x % patch;
        const localZ = z % patch;
        const patchX = Math.ceil(x / patch) - (localX > 0 ? 1 : 0);
        const patchZ = Math.ceil(z / patch) - (localZ > 0 ? 1 : 0);
        const level  = patchZ * numPatchesX + patchX;
        const localIndex = localZ * patch + localX;
        const normalizeLevel = level / 2 | 0;
        const numChunk = patchX % 2;

        console.log(numChunk, patches[normalizeLevel][localIndex], matrix[mIdx]);
    }
    
    testXZ(1893, 572);
    testXZ(1010, 754);
    testXZ(234, 456);
    testXZ(128, 64);
    testXZ(0, 0);
    testXZ(1, 0);
})();

(() => {

    const patch = 33;
    const chunk = 65;
    const heightMap = new CompressedPatchedHeightMap(1025, 1025, patch, chunk, 0, 100);

    const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    for (let z = 0; z < heightMap.depth; z++) {

        for (let x = 0; x < heightMap.width; x++) {

            const test = randomIntFromInterval(0, 100);

                           heightMap.set(x, z, test);
            const result = heightMap.get(x, z);

            if ((test - result) * 100 > 0.5) {
                console.log(x, z, test, result);
            }
        }
    }

    const patchX = 2;
    const patchZ = 2;
    const tmp = heightMap.getChunkBuffer(Uint16Array, patchX, patchZ);
    const offsetX  = patchX * chunk;
    const offsetZ  = patchZ * chunk;
    const offsetNX = (patchX + 1) * chunk;

    for (let z = 0; z < chunk; z++) {

        for (let x = 0; x < chunk; x++) {

            const idx = (z * chunk + x) * 2;
            const height1 = tmp[idx] / 0xffff;
            const height2 = tmp[idx + 1] / 0xffff;
            const factor1 = heightMap.getFactor(offsetX + x, offsetZ + z);
            const factor2 = heightMap.getFactor(offsetNX + x, offsetZ + z);
            console.log(x, z, height1, factor1, height2, factor2);
        }
    }
    
})();