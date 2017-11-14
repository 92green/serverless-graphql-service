// @flow

import {graphql} from 'graphql';
import parseRequestBody from './requestParser';
import {GromitError} from 'gromit';
import errorFormatter from './errorFormatter';
import type {
    RequestHandler,
    MergedConfig,
    AWSLambdaEvent,
    AWSLambdaCallback,
    AWSLambdaContext
} from './definitions';

export default function handlerCreator(config: MergedConfig): RequestHandler {
    const {schema, rootValue} = config;

    const baseResponse = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
        }
    };

    return async (
        httpEvent: AWSLambdaEvent,
        lambdaContext: AWSLambdaContext,
        callback: AWSLambdaCallback
    ): Promise<void> => {

        try {
            const authorizationResult = await config.authorizeRequest(httpEvent, lambdaContext);
            const requestPayload = parseRequestBody(httpEvent.body);

            const context = await config.buildContext(requestPayload, authorizationResult, httpEvent, lambdaContext);

            const {query, variables} = requestPayload;
            const result = await graphql(schema, query, rootValue, context, variables || {});
            const formattedResult = errorFormatter(result);

            const response = {
                ...baseResponse,
                body: formattedResult
            };

            const {body, ...modifiedResponse} = await config.modifyResponse(response, httpEvent, lambdaContext);

            callback(null, {
                ...modifiedResponse,
                body: JSON.stringify(body)
            });

        } catch(err) {
            const gromitError = err.isGromitError
                ? err
                : GromitError.wrap(err);

            const response = {
                ...baseResponse,
                statusCode: gromitError.statusCode,
                body: {
                    errors: [gromitError.toJSON()]
                }
            };

            const {body, ...modifiedResponse} = await config.modifyResponse(response, httpEvent, lambdaContext);

            callback(null, {
                ...modifiedResponse,
                body: JSON.stringify(body)
            });
        }
    };
}