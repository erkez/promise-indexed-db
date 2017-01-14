'use strict';

var Promise = require('bluebird');


export function promisifyRequest(request, onupgradeneeded) {
    return new Promise((resolve, reject) => {
        request.onblocked = event => {
            console.warn('IndexedDB request is blocked', event);
        };

        request.onupgradeneeded = onupgradeneeded;

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };
    });
}
