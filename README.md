# IndexedDB in a promises API

The goal of this project is to provide a more intuitive API to deal with IndexedDB.
If you are familiar with promises, than we hope it is useful for you.

We use the awesome [Bluebird](https://github.com/petkaantonov/bluebird) promises library.

Please note that the API wraps the browser's IndexedDB implementation.

Example:

```javascript
    function upgradeDatabase(db) {
        db.createObjectStore('cache');
    }

    openDatabase('app-cache', upgradeDatabase).then(function(db) {
        return db.usingReadWriteStore('cache', function(store) {
            return store.put({ user: 'john' }, 1);
        })
    });
```

Or in the newer ES6 syntax:

```javascript
    openDatabase('app-cache', db => db.createObjectStore('cache')).then(db =>
        db.usingReadWriteStore('cache', store => store.put({ user: 'john' }, 1))
    );
```

## More on the original [IndexedDB API](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API)

The original API relies on requests which have, primarily, three states: `pending`, `done` and `error`.
Whevener you make an action which results in an `IDBRequest`, you should at least attach a success callback to it.

That is very powerful, but we feel that it doesn't work very well with chaining and **may** result in code that is not
easy to follow.

You might have already thought about the following: the three main request states mimic promises' states.

## Functionality

There aim to provide every available functionality of the original API with some sugar on top.
For instance, it logs the usually unhandled block events and provides shortcuts to access single store transactions.


# PromiseIndexedDB API

## Core


##### `openDatabase(String name [, Number version] [, Function<DatabaseUpgrade databaseUpgrade> upgradeCallback])` -> `Promise<Database>`

Open a database with provided name and optional version. The upgrade callback should probably be always provided, since you need to
add stores to the database.

Example:

```javascript
    var database = openDatabase('app-cache', function upgradeDatabase(db) {
        db.createObjectStore('cache');
    });

    database.then(function(db) {
        // use database
    });
```


##### `deleteDatabase(String name) -> Promise<void>`

Deletes a database.

Note that if the database is currently open, the request will not proceed until it is closed.


##### `usingDatabase(Database database, Function<Database, T> useDatabase) -> Promise<T>`

Uses a database created in `openDatabase` in callback `useDatabase`. After the callback has finished using the database,
it is closed and a promise the callback's value is returned.

Example:

```javascript
    usingDatabase(openDatabase('my-database'), function(db) {
        // use database in this block
    }).then(function() {
        // database is already closed
    });
```

## Database

TODO
