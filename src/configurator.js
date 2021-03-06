// @flow

import handlerCreator from './handlerCreator';
import type {
    InputConfig,
    ConfigUpdate,
    MergedConfig,
    ResponseModifier,
    RequestAuthorizer,
    ErrorLogger,
    ContextBuilder,
    RequestHandler
} from './definitions';

export default class Configurator {
    _config: MergedConfig;
    constructor(config: InputConfig) {
        const defaults = {
            authorizeRequest: () => Promise.resolve(),
            modifyResponse: (response) => Promise.resolve(response),
            buildContext: () => Promise.resolve({}),
            logErrors: () => {}
        };

        this._config = {
            authorizeRequest: config.authorizeRequest || defaults.authorizeRequest,
            modifyResponse: config.modifyResponse || defaults.modifyResponse,
            buildContext: config.buildContext || defaults.buildContext,
            logErrors: config.logErrors || defaults.logErrors,
            schema: config.schema,
            rootValue: config.rootValue
        };
    }

    unit(config: ConfigUpdate): Configurator {
        return new Configurator({
            ...this._config,
            ...config
        });
    }

    authorizeRequest(fn: RequestAuthorizer): Configurator {
        return this.unit({authorizeRequest: fn});
    }

    modifyResponse(fn: ResponseModifier): Configurator {
        return this.unit({modifyResponse: fn});
    }

    buildContext(fn: ContextBuilder): Configurator {
        return this.unit({buildContext: fn});
    }

    logErrors(fn: ErrorLogger): Configurator {
        return this.unit({logErrors: fn});
    }

    init(): RequestHandler {
        return handlerCreator(this._config);
    }
}