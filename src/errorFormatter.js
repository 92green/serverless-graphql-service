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

export default function errorFormatter(
    result: {data: ?Object, errors: ?Array<GraphQLError>}
): {data: ?Object, errors: ?Array<Object>} {
    if(result.errors && result.errors.length > 0) {
        return Object.assign({}, result, {
            errors: result.errors.map((err: GraphQLError): Object  => {
                return formatError(err);
            })
        });
    }
    return result;
}
