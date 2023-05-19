export type Result<E, T> = [E] | [undefined, T];
export type PromiseResult<E, T> = Promise<Result<E, T>>;

export default async function toResult<E extends Error, T>(p: Promise<T>): PromiseResult<E, T> {

    try {

        const result = await p;

        return [undefined, result as T];

    } catch (e) {

        return [e as E];

    }

}
