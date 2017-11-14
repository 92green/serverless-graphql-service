// @flow
import Configurator from './configurator';
import type {InputConfig} from './definitions';

export default function (config: InputConfig): Configurator {
    return new Configurator(config);
}