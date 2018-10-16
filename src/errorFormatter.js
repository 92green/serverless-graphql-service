// @flow

import type {GraphQLError} from 'graphql';

const formatError = (err: Object): Object => {
    return {
        message: err.message,
        path: err.path,
        location: err.location,
        statusCode: err.statusCode,
        name: err.name,
        ...(err.originalError && err.originalError.isGromitError ? err.originalError.toJSON() : null)
    };
};

type ObjMap<T> = { [key: string]: T, __proto__: null };

export default function errorFormatter(
    result: {data?: ObjMap<mixed>, errors?: $ReadOnlyArray<GraphQLError>}
): {data?: ObjMap<mixed>, errors?: $ReadOnlyArray<GraphQLError>} {
    if(result.errors && result.errors.length > 0) {
        return Object.assign({}, result, {
            errors: result.errors.map((err: GraphQLError): Object  => {
                return formatError(err);
            })
        });
    }
    return result;
}
