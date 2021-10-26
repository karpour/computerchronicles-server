export function validatePositiveInteger(value: unknown): number {
    if (typeof (value) === 'number') {
        if (Number.isInteger(value))
            return value;
        throw new Error(`Not a positive integer: ${value}`);
    }
    throw new Error(`Not a number: ${value}`);
}
