/**
 * Utility functions for handling Date objects in express-typed-rpc
 */

export function toDateString(date: Date): string {

    return date.toISOString();

}

export function fromDateString(dateString: string): Date {

    return new Date(dateString);

}

export function isDateString(value: any): value is string {

    return typeof value === 'string' && !Number.isNaN(Date.parse(value));

}

/**
 * Type guard to check if a value looks like a date string
 * Use this to automatically convert date strings back to Date objects
 */
export function convertDateStrings<T>(obj: T): T {

    if (obj === null || obj === undefined) {

        return obj;

    }

    if (Array.isArray(obj)) {

        return obj.map(convertDateStrings) as T;

    }

    if (typeof obj === 'object') {

        const converted: any = {};

        for (const [key, value] of Object.entries(obj)) {

            converted[key] = convertDateStrings(value);

        }
        return converted as T;

    }

    if (isDateString(obj)) {

        return fromDateString(obj) as T;

    }

    return obj;

}
