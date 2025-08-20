# express-typed-rpc

[![build status](https://github.com/mhweiner/express-typed-rpc/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/express-typed-rpc/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/%F0%9F%9A%80%20AutoRel-2D4DDE)](https://github.com/mhweiner/autorel)


A type-safe RPC library for Express.js that provides full TypeScript support for client-server communication.

## Features

- **Type Safety**: Full TypeScript support with automatic type inference
- **Date Object Support**: Automatic serialization/deserialization of Date objects
- **Error Handling**: Built-in error handling with custom error types
- **Flexible Context**: Support for request context injection
- **Lightweight**: Minimal dependencies and overhead

## Installation

```bash
npm install express-typed-rpc
```

## Basic Usage

### Server Setup

```typescript
import express from 'express';
import {createAPI} from 'express-typed-rpc';

const app = express();
const router = express.Router();

// Define your API
const api = {
  hello: (name: string): string => `Hello, ${name}!`,
  getCurrentTime: (): Date => new Date(), // Date objects are automatically handled
  getUser: (id: number): {id: number, name: string, createdAt: Date} => ({
    id,
    name: 'John Doe',
    createdAt: new Date()
  })
};

// Create the API routes
createAPI(router, api);

app.use('/api', router);
app.listen(3000);
```

### Client Usage

```typescript
import {client} from 'express-typed-rpc';

// Type-safe client calls
const result = await client<typeof api.hello>('hello', 'World');
console.log(result); // "Hello, World!"

const time = await client<typeof api.getCurrentTime>('getCurrentTime');
console.log(time instanceof Date); // true - Date objects are preserved!

const user = await client<typeof api.getUser>('getUser', 123);
console.log(user.createdAt instanceof Date); // true
```

## Date Object Handling

The library automatically handles Date objects by:

1. **Serialization**: Converting Date objects to a special format during JSON serialization
2. **Deserialization**: Converting the special format back to Date objects on the client side

This means you can work with Date objects naturally without manual conversion:

```typescript
// Server
const api = {
  getEvents: (): {id: number, date: Date}[] => [
    {id: 1, date: new Date('2023-12-25')},
    {id: 2, date: new Date('2023-12-26')}
  ]
};

// Client
const events = await client<typeof api.getEvents>('getEvents');
events.forEach(event => {
  console.log(event.date instanceof Date); // true
  console.log(event.date.toLocaleDateString()); // Works as expected
});
```

## Advanced Usage

### With Context

```typescript
import {createAPI, ExpressContextResolver} from 'express-typed-rpc';

interface Context {
  userId: string;
  isAdmin: boolean;
}

const contextResolver: ExpressContextResolver<Context> = (req) => ({
  userId: req.headers['user-id'] as string,
  isAdmin: req.headers['is-admin'] === 'true'
});

const api = {
  getUserData: (input: string, context: Context) => {
    if (!context.isAdmin) {
      throw new Error('Unauthorized');
    }
    return `Data for user ${context.userId}: ${input}`;
  }
};

createAPI(router, api, contextResolver);
```

### Error Handling

```typescript
import {client, Non200Response} from 'express-typed-rpc';

try {
  const result = await client('someEndpoint', data);
} catch (error) {
  if (error instanceof Non200Response) {
    console.log('Server error:', error.status, error.response);
  } else {
    console.log('Network error:', error);
  }
}
```

## API Reference

### `createAPI(router, api, contextResolver?)`

Creates Express routes for the provided API.

- `router`: Express Router instance
- `api`: Object containing resolver functions
- `contextResolver?`: Optional function to create request context

### `client<A>(name, input, options?)`

Makes a type-safe RPC call.

- `name`: API endpoint name
- `input`: Input data for the endpoint
- `options?`: Optional client configuration

### Types

- `Resolver<I, O, C>`: Function type for API endpoints
- `ExpressContextResolver<C>`: Function type for context creation
- `InferAPI<T>`: Utility type to infer API types

## License

MIT
