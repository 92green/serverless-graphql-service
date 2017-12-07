// @flow
import Configurator from './configurator';
import type {InputConfig} from './definitions';
import decorateLoaders from './dataloaders';

export default function (config: InputConfig): Configurator {
    return new Configurator(config);
}

export {decorateLoaders as decorateLoaders};


