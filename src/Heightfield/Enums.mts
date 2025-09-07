import { mapEnum } from "../Extras/EnumConverter.mjs"

export const fieldSizeEnumDefault = 513;
export const fieldSizeEnum = mapEnum({
    '128':   129,
    '256':   257,
    '512':   513,
    '1024':  1025,
    '2048':  2049,
    '4096':  4097,
    '8192':  8193,
    '16384': 16385,
});

export const fieldPatchSizeEnumDefault = 33;
export const fieldPatchSizeEnum = mapEnum({
    '16':    17,
    '32':    33,
    '64':    65,
    '128':   129,
    '256':   257,
    '512':   513,
    '1024':  1025,
    '2048':  2049,
});

export const fieldHeightValueTypeDefault = '32f';
export const fieldHeightValueTypeEnum = mapEnum({
    '32F': '32f',
    '16U': '16u',
    '8U': '8u'
});