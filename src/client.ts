/* eslint-disable max-lines-per-function */
import {invokeOrFail} from './lib/invokeOrFail';
import toResult from './lib/toResult';

export type ClientOptions = {
    endpoint: string
    fetchOptions?: Omit<RequestInit, 'method' | 'body'>
    onError?: (error: any) => void
};

export class Non200Response<T> extends Error {

    status: number;
    response: T;

    constructor(status: number, response: T) {

        super('Non200Response');
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = 'Non200Response';
        this.status = status;
        this.response = response;

    }

}

/**
 * We're purposely not putting any type alias for the client route to aid in better IDE intellisense.
 * Otherwise, the TS compiler/autocomplete might suggest the type alias instead of the underlying (initial) type.
*/
export async function client<A extends {
    name: string
    input: any
    output: any
}, ErrorResponseType = {}>(
    name: A['name'],
    input: A['input'],
    options?: ClientOptions
): Promise<A['output']> {

    const [err, resp] = await toResult(fetch(`${options?.endpoint}/${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options?.fetchOptions?.headers,
        },
        body: JSON.stringify(input || {}),
        ...options?.fetchOptions,
    }));

    if (err) {

        options?.onError?.(err);

        // Re-throw the error so the promise rejects correctly
        throw err;

    }

    const data = await resp.text();
    let responseData: any;

    if (data.trim().length) {

        const [, result] = invokeOrFail(() => JSON.parse(data));

        responseData = result;

    }

    if (!resp.ok) {

        throw new Non200Response(resp.status, responseData as ErrorResponseType);

    }

    return responseData as A['output'];

}
