import * as itemsApi from './items';
import * as chatApi from './chat';
import * as modelsApi from './models';
import * as configsApi from './configs';
import * as cytoscapeApi from './cytoscape';
import * as collectionsApi from './collections';
import * as operationsApi from './operations';
import * as relationshipsApi from './relationships';
import * as modelCallApi from './modelCalls';

export const api = {
    items: itemsApi,
    chat: chatApi,
    models: modelsApi,
    configs: configsApi,
    cytoscape: cytoscapeApi,
    collections: collectionsApi,
    operations: operationsApi,
    relationships: relationshipsApi,
    modelCalls: modelCallApi,
};
