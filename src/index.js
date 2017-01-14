'use strict';

import Promise from 'bluebird';
import { useDatabase, createDatabaseUpgradeHandler } from './database';
import { promisifyRequest } from './request';


export const openDatabase = withIndexedDB(function openDatabase(name, version, handleUpgrade) {
    if (typeof version === 'function') {
        handleUpgrade = version;
        version = 1;
    }

    return promisifyRequest(indexedDB.open(name, version), createDatabaseUpgradeHandler(handleUpgrade))
        .catch(error => {
            var message = `Unable to open database ${name} v${version}: ${error.stack || error.message}`;
            throw new Error(message);
        })
        .then(useDatabase);
});


export const usingDatabase = withIndexedDB(function usingDatabase(database, callback) {
    var disposableDatabase = database.disposer(db => db.close());
    return Promise.using(disposableDatabase, callback);
});


export const deleteDatabase = withIndexedDB(function deleteDatabase(name) {
    return promisifyRequest(indexedDB.deleteDatabase(name));
});


function withIndexedDB(callback) {
    return Promise.method(function() {
        if (indexedDB == null) {
            throw new Error('IndexedDB is not supported on device.');
        }

        return callback.apply(null, arguments);
    });
}
