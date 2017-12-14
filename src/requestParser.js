// @flow
import {GromitError} from 'gromit';
import type {GraphqlRequestPayload} from './definitions';
export default function parseRequestBody(body: string): GraphqlRequestPayload {

    let graphqlRequest;

    try {
        graphqlRequest = JSON.parse(body);
    } catch(err) {
        throw GromitError.badRequest('Request body is not valid JSON');
    }

    if(!graphqlRequest || typeof graphqlRequest.query !== 'string') {
        throw GromitError.badRequest('Request body does not contain a graphql query');
    }

    if(typeof graphqlRequest.variables === 'string' && graphqlRequest.variables !== '') {
        try {
            graphqlRequest.variables = JSON.parse(graphqlRequest.variables);
        } catch(err) {
            throw GromitError.badRequest('Graphql variables are not valid JSON');
        }
    }

    return graphqlRequest;
}