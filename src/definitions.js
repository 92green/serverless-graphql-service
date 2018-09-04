// @flow
import type {GraphQLSchema} from 'graphql';

export type InputConfig = {
    schema: GraphQLSchema,
    rootValue: Object,
    authorizeRequest?: RequestAuthorizer,
    modifyResponse?: ResponseModifier,
    buildContext?: ContextBuilder,
    logErrors?: ErrorLogger
};

export type ConfigUpdate = {
    authorizeRequest?: RequestAuthorizer,
    modifyResponse?: ResponseModifier,
    buildContext?: ContextBuilder,
    logErrors?: ErrorLogger
};

export type MergedConfig = {
    schema: GraphQLSchema,
    rootValue: Object,
    authorizeRequest: RequestAuthorizer,
    modifyResponse: ResponseModifier,
    buildContext: ContextBuilder,
    logErrors: ErrorLogger
};

export type GraphqlRequestPayload = {
    query: string,
    variables: ?Object
};


export type RequestAuthorizer = (
    httpEvent: AWSLambdaEvent,
    lambdaContext: AWSLambdaContext
) => Promise<any>;

export type ResponseModifier = (
    response: AWSLambdaPreResponse,
    httpEvent: AWSLambdaEvent,
    lambdaContext: AWSLambdaContext
) => Promise<AWSLambdaPreResponse>;

export type ContextBuilder = (
    requestPayload: GraphqlRequestPayload,
    authorizationResult: any,
    httpEvent: AWSLambdaEvent, lambdaContext: AWSLambdaContext
) => Promise<Object>;

export type RequestHandler = (
    AWSLambdaEvent,
    AWSLambdaContext,
    AWSLambdaCallback
) => Promise<AWSLambdaResponse>;

export type ErrorLogger = (err: Object) => void;

export type AWSLambdaEvent = {
    body: string,
    headers: {
        Authorization: string,
        [key: string]: string
    },
    authorizationToken: string
};

export type AWSLambdaContext = {
    callbackWaitsForEmptyEventLoop: boolean,
    awsRequestId: string
};

export type AWSLambdaPreResponse = {
    statusCode: number,
    body: Object,
    headers: Object
};

export type AWSLambdaResponse = {
    statusCode: number,
    body: string,
    headers: Object
};

export type AWSLambdaCallback = (error: ?Error, response: AWSLambdaResponse) => void;