import {test} from 'hoare';

import {Router} from 'express';
import {InferAPI, createAPI} from './server';
import {client} from './client';

const apiRouter = Router();

test('should compile without errors', (assert) => {

    // Unfortunately, there is no easy way to see if there IS a compiler error and have the
    // test pass ^_^

    const api = {
        hello: (noun: string): Promise<string> => Promise.resolve(`hello, ${noun}!`),
        sum: (operands: number[]): number => operands.reduce((sum, num) => sum + num, 0),
    };

    createAPI(apiRouter, api);

    type API = InferAPI<typeof api>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hello: () => Promise<string> = () => client<API['hello']>('hello', 'world');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sum: () => Promise<number> = () => client<API['sum']>('sum', [1, 2, 3]);

    assert.equal(true, true, 'no TS compiler errors :)');

});
