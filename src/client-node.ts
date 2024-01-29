/* eslint-disable max-lines-per-function */
import http from 'http';
import https from 'https';
import {URL} from 'url';
import {invokeOrFail} from './lib/invokeOrFail';
import toResult from './lib/toResult';

export type ClientConfig = {
    endpoint: string
    options?: https.RequestOptions
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
    options?: ClientConfig
): Promise<A['output']> {

    const url = new URL(`${options?.endpoint}/${name}`);
    const requestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options?.options?.headers,
        },
        protocol: url.protocol,
    };

    const [err, resp] = await toResult(httpRequestPromise(requestOptions, JSON.stringify(input || {})));

    if (err) {

        options?.onError?.(err);
        throw err;

    }

    const responseData = await new Promise((resolve, reject) => {

        let data = '';

        resp.on('data', (chunk) => data += chunk);
        resp.on('end', () => resolve(data));
        resp.on('error', reject);

    }) as string;

    let parsedData: any;

    if (responseData.trim().length) {

        const [, result] = invokeOrFail(() => JSON.parse(responseData));

        parsedData = result;

    }

    resp.statusCode = resp.statusCode || 0;

    if (resp.statusCode < 200 || resp.statusCode >= 300) {

        throw new Non200Response(resp.statusCode, parsedData as ErrorResponseType);

    }

    return parsedData as A['output'];

}

async function httpRequestPromise(options: https.RequestOptions, body: string): Promise<http.IncomingMessage> {

    return new Promise((resolve, reject) => {

        const req = options.protocol === 'https:' ? https.request(options, resolve) : http.request(options, resolve);

        req.on('error', reject);
        req.write(body);
        req.end();

    });

}

