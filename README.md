# express-typed-rpc

[![build status](https://github.com/mhweiner/express-typed-rpc/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/express-typed-rpc/actions)
[![semantic-release](https://img.shields.io/badge/semantic--release-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()

Simple express middleware to easily create a fully-typed JSON API over HTTP on both the server-side and client-side.  This project is inspired by tRPC, but much simpler.

**Crazy Simple and Easy to Use 😃**

- Works out of the box with express and Typescript
- No magic or black boxes
- No code generation or build steps! Works 100% statically via Typescript's `infer` keyword
- No writing type specifications
- Minimal configuration
- Client included!
- Tiny codebase (~50LOC) with minimal dependencies. Written in clean, simple Typescript. Contribute or fork and make it your own.

**Make Your Code More Reliable and Go Faster! 🚀**

- Take advantage of Typescript and turn your runtime errors into compiler-time errors! Inputs and outputs are both fully typed.
- Easily unit-test your express handlers since they are now no longer dependent on `req` and `res`

## Installation (server)

```bash
npm i express-typed-rpc
```
 
## Example Usage

server.ts
```typescript
import express from 'express';
import { Router } from 'express';
import { createAPI, InferAPI } from 'express-typed-rpc';

// Define your Express router
const apiRouter = Router();

// Define your API
const api = {
    greet: (name: string, context: any): string => `Hello, ${name}!`,
    multiply: (numbers: {a: number, b: number}, context: any): number => numbers.a * numbers.b
};

// Create API using the provided function and api object
createAPI(apiRouter, api);

// Export type for use on client
export type API = InferAPI<typeof api>;

// Initialize Express application
const app = express();

// Use the router as middleware at the /api path
app.use('/api', apiRouter);

// Start the Express server
app.listen(process.env.PORT || 3000);
```

client.ts
```typescript
import { client } from 'express-typed-rpc';
import { API } from '@yourorg/server' // your private package, imports
                                      // type only, no code!

// Everything is now fully typed! Enjoy IDE autocompletion, validation, 
// and compile-time TypeScript errors.

const greet = async (name: string): Promise<string> => {
    return await client<API['greet']>('greet', name);
};

const multiply = async (numbers: {a: number, b: number}): Promise<number> => {
    return await client<API['multiply']>('multiply', numbers);
};
```

## Contribution

Please contribute to this project! Issue a PR against `main` and request review. 

- Please test your work thoroughly.
- Make sure all tests pass with appropriate coverage.

### How to build locally

```bash
npm i
```

### Running tests

```shell script
npm test
```
