import { mapEnum } from "../Shared/EnumConverter.mjs"

export const terrainSizeEnumDefault = 513;
export const terrainSizeEnum = mapEnum({
    '128':   129,
    '256':   257,
    '512':   513,
    '1024':  1025,
    '2048':  2049,
    '4096':  4097,
    '8192':  8193,
    '16384': 16385,
});

export const terrainPatchSizeEnumDefault = 33;
export const terrainPatchSizeEnum = mapEnum({
    '16':    17,
    '32':    33,
    '64':    65,
    '128':   129,
    '256':   257,
    '512':   513,
    '1024':  1025,
    '2048':  2049,
});

export const terrainHeightsCompressAlgoritmDefault = 'none';
export const terrainHeightsCompressAlgoritm = mapEnum({
    'None': 'none',
    'X2': 'x2',
    'X4': 'x4'
});