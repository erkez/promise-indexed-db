'use strict';

import { promisifyRequest } from './request';


export default class ObjectStore {
    constructor(store) {
        this._store = store;
    }

    get name() {
        return this._store.name;
    }

    get indexNames() {
        return this._store.indexNames;
    }

    get keyPath() {
        return this._store.keyPath;
    }

    get autoIncrement() {
        return this._store.autoIncrement;
    }

    add() {
        return promisifyRequest(this._store.add.apply(this._store, arguments));
    }

    clear() {
        return promisifyRequest(this._store.clear.apply(this._store, arguments));
    }

    delete() {
        return promisifyRequest(this._store.delete.apply(this._store, arguments));
    }

    get() {
        return promisifyRequest(this._store.get.apply(this._store, arguments));
    }

    getKey() {
        return promisifyRequest(this._store.getKey.apply(this._store, arguments));
    }

    getAll() {
        return promisifyRequest(this._store.getAll.apply(this._store, arguments));
    }

    getAllKeys() {
        return promisifyRequest(this._store.getAllKeys.apply(this._store, arguments));
    }

    index() {
        var index = this._store.index.apply(this._store, arguments);
        return new Index(index);
    }

    openCursor() {
        throw new Error('Not implemented');
    }

    openKeyCursor() {
        throw new Error('Not implemented');
    }

    put() {
        return promisifyRequest(this._store.put.apply(this._store, arguments));
    }

    count() {
        return promisifyRequest(this._store.count.apply(this._store, arguments));
    }
}

class Index {
    constructor(index) {
        this._index = index;
    }

    get name() {
        return this._index.name;
    }

    get unique() {
        return this._index.unique;
    }

    get multiEntry() {
        return this._index.multiEntry;
    }

    get keyPath() {
        return this._index.keyPath;
    }

    get() {
        return promisifyRequest(this._index.get.apply(this._index, arguments));
    }

    getKey() {
        return promisifyRequest(this._index.getKey.apply(this._index, arguments));
    }

    getAll() {
        return promisifyRequest(this._index.getAll.apply(this._index, arguments));
    }

    getAllKeys() {
        return promisifyRequest(this._index.getAllKeys.apply(this._index, arguments));
    }

    openCursor() {
        throw new Error('Not implemented');
    }

    openKeyCursor() {
        throw new Error('Not implemented');
    }
}
