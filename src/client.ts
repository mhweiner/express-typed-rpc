import toResult from './lib/toResult';

export type ClientOptions = {
    endpoint: string
    fetchOptions?: Omit<RequestInit, 'method' | 'body'>
    onError?: (error: any) => void
    onResponseError?: (response: Response) => void
};

// We're purposely not putting any type alias for the client route to aid in better IDE intellisense.
// Otherwise, the TS compiler/autocomplete might suggest the type alias instead of the underlying (initial) type.

export async function client<A extends {
    name: string
    input: any
    output: any
}>(
    name: A['name'],
    input: A['input'],
    options?: ClientOptions
): Promise<A['output']> {

    const [err, resp] = await toResult(fetch(`${options?.endpoint}${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options?.fetchOptions?.headers,
        },
        body: JSON.stringify(input),
        ...options?.fetchOptions,
    }));

    if (err) {

        options?.onError?.(err);

        // Re-throw the error so the promise rejects correctly
        throw err;

    }

    if (!resp.ok) {

        options?.onResponseError?.(resp);

        // if onResponseError is not provided or doesn't throw an error, throw a default error
        throw new Error(`API call failed with status ${resp.status}`);

    }

    const data = await resp.json();

    return data as A['output'];

}
