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

    openCursor(key, direction, callback) {
        _openCursor(this._store, key, direction, callback);
    }

    openKeyCursor(key, direction, callback) {
        _openKeyCursor(this._store, key, direction, callback);
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

    openCursor(key, direction, callback) {
        _openCursor(this._index, key, direction, callback);
    }

    openKeyCursor(key, direction, callback) {
        _openKeyCursor(this._index, key, direction, callback);
    }
}


class Cursor {
    constructor(cursor) {
        this._cursor = cursor;
    }

    get direction() {
        return this._cursor.direction;
    }

    get key() {
        return this._cursor.key;
    }

    get primaryKey() {
        return this._cursor.primaryKey;
    }

    advance() {
        this._cursor.advance.apply(this._cursor, arguments);
    }

    continue() {
        this._cursor.continue.apply(this._cursor, arguments);
    }

    delete() {
        return promisifyRequest(this._cursor.delete.apply(this._cursor, arguments));
    }

    update() {
        return promisifyRequest(this._cursor.update.apply(this._cursor, arguments));
    }
}


class CursorWithValue extends Cursor {
    constructor(cursor) {
        super(cursor);
    }

    get value() {
        return this._cursor.value;
    }
}


function _openCursor(source, key, direction, callback) {
    var request = source.openCursor(key, direction);

    request.onsuccess = event => {
        var cursor = event.target.result;
        callback(cursor == null ? null : new CursorWithValue(cursor));
    };

    request.onerror = event => {
        console.error('Cursor error', event.target.error);
    };
}


function _openKeyCursor(source, key, direction, callback) {
    var request = source.openKeyCursor(key, direction);

    request.onsuccess = event => {
        var cursor = event.target.result;
        callback(cursor == null ? null : new Cursor(cursor));
    };

    request.onerror = event => {
        console.error('Cursor error', event.target.error);
    };
}
