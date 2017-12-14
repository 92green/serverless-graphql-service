// @flow

import DataLoader from 'dataloader';
import {fromJS} from 'immutable';

type LoaderModule = {
    [string]: LoaderMap
};

type LoaderMap = {
    [string]: Function
};

type DecoratedLoaderModule = {
    [string]: DecoratedLoaderMap
};

type DecoratedLoaderMap = {
    [string]: DataLoader<*, *>
};

type LoaderDecorator = (fn: Function) => ((ids: Array<any>) => Promise<Array<any>>);
type LoaderFunction = (ids: Array<any>) => Promise<Array<any>>;
type LoaderApplier = (fn: LoaderFunction, ids: Array<any>) => Promise<Array<any>>;

const mapObject = (obj: Object, mapper: (any) => any): Object => {
    return Object
        .keys(obj)
        .reduce((rr: Object, ii: string) => ({
            ...rr,
            [ii]: mapper(obj[ii])
        }), {});
};


export default function decorateLoaders({
    loaders,
    loaderDecorator = (fn) => fn,
    loaderApplier = (fn, ids) => fn(ids)
}: {
    loaders: LoaderModule,
    loaderDecorator?: LoaderDecorator,
    loaderApplier?: LoaderApplier
}): DecoratedLoaderModule {
    return mapObject(loaders, (loaderMap: LoaderMap): DecoratedLoaderMap => {
        return initLoaders(loaderMap, loaderDecorator, loaderApplier);
    });
}


function initLoaders(
    loaderMap: LoaderMap,
    loaderDecorator: LoaderDecorator,
    loaderApplier: LoaderApplier
): DecoratedLoaderMap {
    return mapObject(loaderMap, (fn: Function): DataLoader<*, *> => {
        const loaderFunction = loaderDecorator(fn);
        return createLoader(loaderFunction, loaderApplier);
    });
}

function createLoader(loaderFunction: LoaderFunction, loaderApplier: LoaderApplier): DataLoader<*, *> {
    return new DataLoader(
        (ids: Array<any>): Promise<Array<any>> => loaderApplier(loaderFunction, ids),
        {
            cacheKeyFn: (id: any): string => {
                if(typeof id.hashCode === 'function') return id.hashCode();
                if(typeof id === 'object') return fromJS(id).hashCode();
                return "" + id;
            }
        }
    );
}