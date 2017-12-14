# serverless-graphql-service

## Installation

```
yarn add @blueflag/serverless-graphql-service
```

## Usage

### `GraphqlRequestHandler`

`serverless-graphql-service` handles most of the repetitive parts of setting up a graphql service with serverless and AWS Lambda.

The library exports a configurator that provides several hooks to control how the request is handled.

The below example shows the request handler can be used to authorize requests with clarence-sdk.

```js
import GraphqlRequestHandler, {decorateLoaders} from '@blueflag/serverless-graphql-service';
import requestVerifier from '@blueflag/proto-clarence-sdk/lib/requestVerifier';

const verifyRequest = requestVerifier({
    clarenceUrl: 'http://clarence-url-here.com'
});

const handler: GraphqlRequestHandler({
    schema: GraphqlSchema,
    rootValue: GraphqlRootResolverObject
})
    .authorizeRequest(async (httpEvent: Object): Promise<Object> => {
        const token = (httpEvent.headers.authorization || '').replace(/^[A-Za-z]+\s+/, '');
        const contextId = httpEvent.headers['x-clarence-context-id'];
        return {
            viewer: await verifyRequest(token, contextId),
            token, contextId
        };
    })
    .buildContext(async (
        requestPayload: Object,
        {viewer, token, contextId}: Object
    ): Promise<Object> => {
        const context = {viewer, token, contextId};
        context.viewer.dataLoaders = decorateLoaders({loaders});
        return context;
    })
    .logErrors((err: Object) => {
        const error = err.originalError || err;
        logger.error(error);
    })
    .init();

```

The function signatures for the available hooks are:


#### `authorizeRequest`

Handle request authorization. If an error is thrown within this hook then it will be used as the error response for the request. The promise value returned from this hook will be passed to the `buildContext` hook as `authorizationResult`.


__Function Signature__

```js
type RequestAuthorizer = (
    httpEvent: AWSLambdaEvent,
    lambdaContext: AWSLambdaContext
) => Promise<any>;
```



#### `buildContext`

Used to build a the context object that is passed to graphql and will be available in all graphql resolvers.

__Function Signature__

```js
type ContextBuilder = (
    requestPayload: GraphqlRequestPayload,
    authorizationResult: any, // the result of authorizeRequest hook
    httpEvent: AWSLambdaEvent, lambdaContext: AWSLambdaContext
) => Promise<Object>;
```


#### `modifyResponse`

Used to modify the http response before the lambda callback is called.

__Function Signature__

```js
type ResponseModifier = (
    response: AWSLambdaPreResponse,
    httpEvent: AWSLambdaEvent,
    lambdaContext: AWSLambdaContext
) => Promise<{
    statusCode: number,
    body: Object,
    headers: Object
}>;
```

#### `logErrors`

A hook that will be called with each error in the graphql response.

__Function Signature__

```js
type ErrorLogger = (err: Object) => void;
```




### `decorateLoaders`

As well as the `GraphqlRequestHandler` this library also provides a `decorateLoaders` function which takes a nested object of data loader functions and wraps them in Dataloaders with optional decorators and appliers.

```js
const loaders = {
    user: {
        userItem: (config) => (ids) => Promise.all(ids.map(id => UserModel.fromId(id + config.idSuffix)))
    }
};

const loaderApplier = async (loaderFn, ids) => {
    const startTime = Date.now();
    const loaderFnName = loaderFn.customName || loaderFn.name;
    const resp = await loaderFn(ids);
    console.log(loaderFnName, Date.now() - startTime);
    return resp;
};

const config = {
    idSuffix: 'whatever'
};

const decoratedLoaders = decorateLoaders({
    loaders: loaders,
    loaderApplier: loaderApplier
    loaderDecorator: (loaderWrapper) => loaderWrapper(config)
});

```


`loaderApplier` is a function that will be called with the loader function and an array of ids. It can be used to time the loader or do any other handling that needs to be done just before the loader is called. The default loaderApplier is `(fn, ids) => fn(ids)`

`loaderDecorator` is a function that is called with each loader function. It can be used to pass configuration through to each loader or similar. The default loader decorator is `(fn) => fn`


