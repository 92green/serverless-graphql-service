//@flow
import test from 'ava';
import decorateLoaders from '../dataloaders';
import DataLoader from 'dataloader';
import sinon from 'sinon';
import {Map} from 'immutable';

test('decorateLoaders takes an object and applies loaders to functions', async (t: Object): Promise<void> => {
    const loaders = {
        loaderModule: {
            loaderFunction: (ids) => Promise.resolve(ids)
        }
    };

    const decoratedLoaders = decorateLoaders({loaders});
    const result = await decoratedLoaders.loaderModule.loaderFunction.load(10);

    t.true(decoratedLoaders.loaderModule.loaderFunction instanceof DataLoader);
    t.is(10, result);
});


test('decorateLoaders will call decorator function for each loader', async (t: Object): Promise<void> => {

    const loaders = {
        loaderModule: {
            loaderFunction: (suffix: string) => ((ids) => Promise.resolve(ids.map(ii => ii + ' ' + suffix)))
        }
    };

    const decoratedLoaders = decorateLoaders({loaders, loaderDecorator: (loaderOuter) => loaderOuter('world')});
    const result = await decoratedLoaders.loaderModule.loaderFunction.load('hello');

    t.is('hello world', result);
});




test('decorateLoaders will call applier function for each loader', async (t: Object): Promise<void> => {

    const loaders = {
        loaderModule: {
            loaderFunction: (ids) => Promise.resolve(ids)
        }
    };

    const decoratedLoaders = decorateLoaders({loaders, loaderApplier: (fn, ids) => fn(ids.map(ii => ii + ' ' + 'world'))});
    const result = await decoratedLoaders.loaderModule.loaderFunction.load('hello');

    t.is('hello world', result);
});


test('decorateLoaders will create loaders that can accept immutable data as ids', async (t: Object): Promise<void> => {
    const loaderFunction = sinon.spy((ids) => Promise.resolve(ids.map(ii => ii.get('id'))));
    const loaders = {
        loaderModule: {
            loaderFunction: loaderFunction
        }
    };

    const decoratedLoaders = decorateLoaders({loaders});

    const result1 = await decoratedLoaders.loaderModule.loaderFunction.load(Map({id: '1234'}));
    const result2 = await decoratedLoaders.loaderModule.loaderFunction.load(Map({id: '1234'}));

    t.true(loaderFunction.calledOnce);
    t.is('1234', result1);
    t.is('1234', result2);
});



test('decorateLoaders will create loaders that can accept objects data as ids', async (t: Object): Promise<void> => {
    const loaderFunction = sinon.spy((ids) => Promise.resolve(ids.map(ii => ii.id)));
    const loaders = {
        loaderModule: {
            loaderFunction: loaderFunction
        }
    };

    const decoratedLoaders = decorateLoaders({loaders});

    const result1 = await decoratedLoaders.loaderModule.loaderFunction.load({id: '1234'});
    const result2 = await decoratedLoaders.loaderModule.loaderFunction.load({id: '1234'});

    t.true(loaderFunction.calledOnce);
    t.is('1234', result1);
    t.is('1234', result2);
});