import * as itemsApi from './items';
import * as booksApi from './books';
import * as chatApi from './chat';
import * as modelsApi from './models';
import * as configsApi from './configs';
import * as cytoscapeApi from './cytoscape';
import * as collectionsApi from './collections';
import * as operationsApi from './operations';
import * as relationshipsApi from './relationships';
import * as modelCallApi from './modelCalls';
import * as promptsApi from './prompts';

export const api = {
    items: itemsApi,
    books: booksApi,
    chat: chatApi,
    models: modelsApi,
    configs: configsApi,
    cytoscape: cytoscapeApi,
    collections: collectionsApi,
    operations: operationsApi,
    relationships: relationshipsApi,
    modelCalls: modelCallApi,
    prompts: promptsApi,
};
