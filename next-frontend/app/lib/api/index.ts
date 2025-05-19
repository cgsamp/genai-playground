import * as booksApi from './books';
import * as chatApi from './chat';
import * as modelsApi from './models';
import * as configsApi from './configs';
import * as cytoscapeApi from './cytoscape';

export const api = {
    books: booksApi,
    chat: chatApi,
    models: modelsApi,
    configs: configsApi,
    cytoscape: cytoscapeApi,
};
