export function isNumeric(value: string) {
    return /^-?\d+$/.test(value);
}

export function mapTitleEnum<T extends Record<string, unknown>>(someEnum: T) {

    const result = [];

    for (let value in someEnum) {

        // Skip number values
        if (!someEnum.hasOwnProperty(value) ||
            isNumeric(value)) {
            continue;
        }

        const enumEntry: Record<string, unknown> = {};
        enumEntry[value] = someEnum[value];
        result.push(enumEntry);
    }
    
    return result;
}

export function mapEnum<T extends Record<string, unknown>>(someEnum: T) {

    const result = [];

    for (let value in someEnum) {

        if (!someEnum.hasOwnProperty(value)) {
            continue;
        }

        const enumEntry: Record<string, unknown> = {};
        enumEntry[value] = someEnum[value];
        result.push(enumEntry);
    }
    
    return result;
}