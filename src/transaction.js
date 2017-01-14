'use strict';

import Promise from 'bluebird';
import ObjectStore from './object-store';


export const openTransaction = Promise.method(function openTransaction(database, stores, mode = 'readonly', callback) {
    if (mode !== 'readonly' && mode !== 'readwrite') {
        throw new Error(`Unsupported transaction mode "${mode}"`);
    }

    if (typeof callback !== 'function') {
        throw new Error(`Transaction callback must be a function, got ${typeof callback}`);
    }

    var transaction = database.transaction(stores, mode);
    var callbackResult = callback(new Transaction(transaction)); // eslint-disable-line callback-return

    return new Promise((resolve, reject) => {
        transaction.oncomplete = function() {
            resolve(callbackResult);
        };

        transaction.onerror = function(event) {
            reject(event.target.error);
        };
    });
});


class Transaction {
    constructor(transaction) {
        this._transaction = transaction;
    }

    get mode() {
        return this._transaction.mode;
    }

    abort() {
        return this._transaction.abort();
    }

    objectStore(name) {
        var store = this._transaction.objectStore(name);
        return new ObjectStore(store);
    }
}
