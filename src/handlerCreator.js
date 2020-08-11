// @flow

import {graphql} from 'graphql';
import type {GraphQLError} from 'graphql';
import parseRequestBody from './requestParser';
import {GromitError} from 'gromit';
import errorFormatter from './errorFormatter';
import stringify from 'json-stringify-safe';
import type {
    RequestHandler,
    MergedConfig,
    AWSLambdaEvent,
    AWSLambdaResponse,
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
        lambdaContext: AWSLambdaContext
    ): Promise<AWSLambdaResponse> => {
        // Ensure that response happens right after callback
        lambdaContext.callbackWaitsForEmptyEventLoop = false;

        // lowercase headers (leaves existing headers too)
        Object.keys(httpEvent.headers).forEach((key: string) => {
            httpEvent.headers[key.toLowerCase()] = httpEvent.headers[key];
        });
        let query, variables, context;
        try {
            const authorizationResult = await config.authorizeRequest(httpEvent, lambdaContext);
            const requestPayload = parseRequestBody(httpEvent.body);
            query = requestPayload.query;
            variables = requestPayload.variables
            context = await config.buildContext(requestPayload, authorizationResult, httpEvent, lambdaContext);

            const result = await graphql(schema, query, rootValue, context, variables || {});

            const formattedResult = errorFormatter(result);

            if(result.errors && result.errors.length > 0) {
                result.errors.forEach((err: GraphQLError) => {
                    config.logErrors(err.originalError || err, {
                        context,
                        query,
                        variables
                    });
                });
            }

            const response = {
                ...baseResponse,
                body: formattedResult
            };

            const {body, ...modifiedResponse} = await config.modifyResponse(response, httpEvent, lambdaContext);

            return {
                ...modifiedResponse,
                body: stringify(body)
            };

        } catch(err) {
            const gromitError = err.isGromitError
                ? err
                : GromitError.wrap(err);

            config.logErrors(gromitError, {
                context,
                query,
                variables
            });

            const response = {
                ...baseResponse,
                statusCode: gromitError.statusCode,
                body: {
                    errors: [gromitError.toJSON()]
                }
            };

            const {body, ...modifiedResponse} = await config.modifyResponse(response, httpEvent, lambdaContext);
            return {
                ...modifiedResponse,
                body: stringify(body)
            };
        }
    };
}