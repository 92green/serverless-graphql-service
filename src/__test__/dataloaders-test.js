//@flow
import test from 'ava';
import decorateLoaders from '../dataloaders';
import DataLoader from 'dataloader';

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


