import type {NextFunction, Request, Response, Router} from 'express';

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type Resolver<I, O, C> = (input: I, context: C) => O;
export type ExpressContextResolver<C> = (req: Request) => C;

/* We're purposely not using a type alias for the client route to aid in better IDE intellisense.
 * Otherwise, the TS compiler/autocomplete might suggest the type alias instead of the underlying
 * (initial) type.
 */

type InferResolver<N, R> = R extends Resolver<infer I, infer O, any> ? {
    name: N
    input: I
    output: UnwrapPromise<O>
} : never;

export type InferAPI<T> = {
    [P in keyof T]: InferResolver<P, T[P]>;
};

function createAction(
    router: Router,
    name: string,
    resolver: Resolver<any, any, any>,
    contextResolver?: ExpressContextResolver<any>
): void {

    router.post(`/${name}`, async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        try {

            const context = contextResolver ? await contextResolver(req) : {};
            const response = await resolver(req.body, context);

            res.json(response);

        } catch (e) {

            next(e);

        }

    });

}

export function createAPI(
    router: Router,
    api: {[name: string]: Resolver<any, any, any>},
    contextResolver?: ExpressContextResolver<any>
): void {

    Object.keys(api).forEach((key) => createAction(router, key, api[key], contextResolver));

}
