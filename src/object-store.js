'use strict';

import { promisifyRequest } from './request';


export default class ObjectStore {
    constructor(store) {
        this._store = store;
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

    put() {
        return promisifyRequest(this._store.put.apply(this._store, arguments));
    }

    count() {
        return promisifyRequest(this._store.count.apply(this._store, arguments));
    }
}
