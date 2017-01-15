'use strict';

import Promise from 'bluebird';
import { openTransaction } from './transaction';


export function useDatabase(database) {
    return new Database(database);
}


export function createDatabaseUpgradeHandler(callback) {
    if (typeof callback !== 'function') {
        return function ignoreDatabaseUpgrade(event) {
            console.warn('Unhandled IndexedDB upgradeneeded event', event);
        };
    }

    return function upgradeDatabase(event) {
        var database = event.target.result;
        callback(new DatabaseUpgrade(database));
    };
}


class Database {
    constructor(database) {
        this._database = database;
        this._database.onerror = function(event) {
            console.error(`Unhandled error on ${database.name}`, event, event.target.error);
        };
    }

    get name() {
        return this._database.name;
    }

    get version() {
        return this._database.version;
    }

    get objectStoreNames() {
        return this._database.objectStoreNames;
    }

    transaction(stores, mode, callback) {
        if (typeof mode === 'function') {
            callback = mode;
            mode = undefined;
        }

        return openTransaction(this._database, stores, mode, callback);
    }

    usingStore(store, mode = 'readonly', callback) {
        if (typeof store !== 'string') {
            Promise.reject(new Error('Store must be a string when directly using a store.'));
        }

        if (typeof mode === 'function') {
            callback = mode;
            mode = 'readonly';
        }

        return this.transaction(store, mode, transaction => {
            return callback(transaction.objectStore(store));
        });
    }

    usingReadOnlyStore(store, callback) {
        return this.usingStore(store, 'readonly', callback);
    }

    usingReadWriteStore(store, callback) {
        return this.usingStore(store, 'readwrite', callback);
    }

    close() {
        this._database.close();
    }
}


class DatabaseUpgrade {
    constructor(database) {
        this._database = database;
    }

    createObjectStore() {
        var _database = this._database;
        var transaction;
        var store = this._database.createObjectStore.apply(this._database, arguments);

        return {
            get transaction() {
                if (transaction) {
                    return transaction;
                }

                transaction = new Promise((resolve, reject) => {
                    var _transaction = store.transaction;

                    _transaction.oncomplete = function() {
                        resolve(new Database(_database));
                    };

                    _transaction.onerror = function(event) {
                        reject(event.target.error);
                    };
                });

                return transaction;
            },

            createIndex() {
                store.createIndex.apply(store, arguments);
            },

            deleteIndex() {
                store.deleteIndex.apply(store, arguments);
            }
        };
    }

    deleteObjectStore() {
        this._database.deleteObjectStore(name);
    }
}
