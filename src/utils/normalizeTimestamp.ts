export const normalizeTimestamp = (value: number | string | undefined): string => {
    if (typeof value === 'number') {
        const ms = value < 10000000000 ? value * 1000 : value;
        return new Date(ms).toISOString();
    }
    if (typeof value === 'string' && value.trim()) {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
    }
    return new Date().toISOString();
};
