export type Result<E, T> = [E] | [undefined, T];

export function invokeOrFail<E extends Error, T>(executable: () => T): Result<E, T> {

    try {

        const result = executable();

        return [undefined, result as T];

    } catch (e) {

        return [e as E];

    }

}
