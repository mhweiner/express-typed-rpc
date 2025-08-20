export interface SerializedDate {
    __type: 'Date'
    value: string
}

export interface SerializedData {
    __type: string
    value: any
}

export function serializeResponse(data: any): any {

    if (data === null || data === undefined) {

        return data;

    }

    if (data instanceof Date) {

        return {
            __type: 'Date',
            value: data.toISOString(),
        } as SerializedDate;

    }

    if (Array.isArray(data)) {

        return data.map(serializeResponse);

    }

    if (typeof data === 'object') {

        const serialized: any = {};

        for (const [key, value] of Object.entries(data)) {

            serialized[key] = serializeResponse(value);

        }
        return serialized;

    }

    return data;

}

export function deserializeResponse(data: any): any {

    if (data === null || data === undefined) {

        return data;

    }

    // eslint-disable-next-line no-underscore-dangle
    if (typeof data === 'object' && data.__type === 'Date') {

        return new Date(data.value);

    }

    if (Array.isArray(data)) {

        return data.map(deserializeResponse);

    }

    if (typeof data === 'object') {

        const deserialized: any = {};

        for (const [key, value] of Object.entries(data)) {

            deserialized[key] = deserializeResponse(value);

        }
        return deserialized;

    }

    return data;

}
