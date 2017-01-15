'use strict';

const { openDatabase, usingDatabase, deleteDatabase } = window.promiseIndexedDB;

describe('IndexedDB Bluebird', function() {

    describe('Root API', function() {

        it('should open a database named "test"', function() {
            return openDatabase('test')
                .then(db => {
                    db.name.should.equal('test');
                    db.close();
                });
        });

        it('should delete a database named "test"', function() {
            return deleteDatabase('test');
        });

        it('should not fail to delete a database named "test2" which does not exist', function() {
            return deleteDatabase('test2');
        });

    });

    describe('Database', function() {

        var database;

        beforeEach(function() {
            database = openDatabase('test', function(db) {
                db.createObjectStore('my-store');
                var indexedStore = db.createObjectStore('indexed-store', { keyPath: 'id' });
                indexedStore.createIndex('email', 'email', { unique: true });
            });
        });

        afterEach(function() {
            database.call('close');
        });

        after(function() {
            deleteDatabase('test');
        });

        it('should fail to create transaction with invalid mode', function(done) {
            return database.then(db => {
                db.transaction('my-store', 'what?', function() {})
                    .catch(error => {
                        error.message.should.containEql('what?');
                        done();
                    });
            });
        });

        it('should fail to create transaction without callback', function(done) {
            database.then(db => {
                db.transaction('my-store')
                    .catch(error => {
                        error.message.should.containEql('callback');
                        done();
                    });
            });
        });

        it('should create a single store transaction without mode', function() {
            return database.then(db => {
                db.version.should.equal(1);
                db.objectStoreNames.length.should.equal(2);
                db.objectStoreNames.contains('my-store').should.equal(true);
                db.objectStoreNames.contains('indexed-store').should.equal(true);
                return db.transaction('my-store', transaction => {
                    should.exist(transaction);
                });
            });
        });

        describe('Transaction Usage', function() {

            var value = { a: 123 };
            var key = 'some-key';

            it('should create read-write transaction and store contents', function() {
                return database.then(db => {
                    return db.transaction('my-store', 'readwrite', transaction => {
                        transaction.mode.should.equal('readwrite');
                        return transaction.objectStore('my-store').put(value, key);
                    });
                });
            });

            it('should fail to write on read-only transaction', function(done) {
                database.then(db => {
                    return db
                        .transaction('my-store', transaction => {
                            transaction.mode.should.equal('readonly');
                            return transaction.objectStore('my-store').put(value, key);
                        })
                        .catch(error => {
                            error.message.should.containEql('read-only');
                            done();
                        });
                });
            });

            it('should create read-only transaction and retrieve contents', function() {
                return database.then(db => {
                    return db
                        .transaction('my-store', transaction => {
                            return transaction.objectStore('my-store').get(key);
                        })
                        .then(retrievedValue => {
                            retrievedValue.should.deepEqual(value);
                        });
                });
            });

            it('should abort transaction after modifying value', function(done) {
                database.then(db => {
                    return db
                        .transaction('my-store', 'readwrite', transaction => {
                            transaction.objectStore('my-store').put('some value', key);
                            transaction.abort();
                        })
                        .catch(error => {
                            error.message.should.containEql('aborted');
                            done();
                        });
                });
            });

        });

        describe('Using Store', function() {

            var value = { a: 456 };
            var key = 'using-store-key';

            it('should have correct store properties', function() {
                return database.then(db => {
                    return db.usingStore('my-store', store => {
                        store.name.should.equal('my-store');
                        store.indexNames.length.should.equal(0);
                        store.autoIncrement.should.equal(false);
                        should.not.exist(store.keyPath);
                    });
                });
            });

            it('should use read-write store', function() {
                return database.then(db => {
                    return db.usingReadWriteStore('my-store', store => store.put(value, key));
                });
            });

            it('should fail to write to read-only store', function() {
                return database
                    .then(db => {
                        return db.usingReadOnlyStore('my-store', store => store.put('will fail', key));
                    })
                    .catch(error => {
                        error.message.should.containEql('read-only');
                    });
            });

            it('should use store and retrieve value', function() {
                return database
                    .then(db => {
                        return db.usingStore('my-store', store => store.get(key));
                    })
                    .then(retrievedValue => {
                        retrievedValue.should.deepEqual(value);
                    });
            });

        });

        describe('Using Indexed Store', function() {

            it('should have correct store properties', function() {
                return database.then(db => {
                    return db.usingStore('indexed-store', store => {
                        store.name.should.equal('indexed-store');
                        store.keyPath.should.equal('id');
                        store.indexNames.length.should.equal(1);
                        store.indexNames.contains('email').should.equal(true);
                        store.autoIncrement.should.equal(false);
                    });
                });
            });

            it('should get store index with correct properties', function() {
                return database.then(db => {
                    return db.usingStore('indexed-store', store => {
                        var email = store.index('email');
                        email.name.should.equal('email');
                        email.keyPath.should.equal('email');
                        email.unique.should.equal(true);
                        email.multiEntry.should.equal(false);
                    });
                });
            });

            it('should add values to indexed store', function() {
                return database.then(db => {
                    return db.usingReadWriteStore('indexed-store', store => {
                        store.add({ id: 1, email: 'user1@example.com' });
                        store.add({ id: 2, email: 'user2@example.com' });
                    });
                });
            });

            it('should retrieve values in indexed store using unique email index', function() {
                return database.then(db => {
                    return db.usingStore('indexed-store', store => {
                        return store.index('email').get('user2@example.com');
                    });
                }).then(user => {
                    user.id.should.equal(2);
                });
            });

        });

        describe('Using Cursor', function() {

            it('should have correct store cursor with value properties', function() {
                return database.then(db => {
                    return db.usingStore('indexed-store', store => {
                        store.openCursor(1, 'next', cursor => {
                            cursor.direction.should.equal('next');
                            cursor.key.should.equal(1);
                            cursor.primaryKey.should.equal(1);
                            cursor.value.should.deepEqual({ id: 1, email: 'user1@example.com' });
                        });
                    });
                });
            });

            it('should have correct store cursor properties', function() {
                return database.then(db => {
                    return db.usingStore('indexed-store', store => {
                        store.openKeyCursor(2, 'next', cursor => {
                            cursor.direction.should.equal('next');
                            cursor.key.should.equal(2);
                            cursor.primaryKey.should.equal(2);
                            should.not.exist(cursor.value);
                        });
                    });
                });
            });

            it('should have correct index cursor with value properties', function() {
                return database.then(db => {
                    return db.usingStore('indexed-store', store => {
                        store.index('email').openCursor('user1@example.com', 'next', cursor => {
                            cursor.direction.should.equal('next');
                            cursor.key.should.equal('user1@example.com');
                            cursor.primaryKey.should.equal(1);
                            cursor.value.should.deepEqual({ id: 1, email: 'user1@example.com' });
                        });
                    });
                });
            });

            it('should have correct index cursor properties', function() {
                return database.then(db => {
                    return db.usingStore('indexed-store', store => {
                        store.index('email').openKeyCursor('user2@example.com', 'next', cursor => {
                            cursor.direction.should.equal('next');
                            cursor.key.should.equal('user2@example.com');
                            cursor.primaryKey.should.equal(2);
                            should.not.exist(cursor.value);
                        });
                    });
                });
            });

            it('should update cursor value', function(done) {
                database.then(db => {
                    return db.usingReadWriteStore('indexed-store', store => {
                        store.openCursor(null, 'next', cursor => {
                            if (cursor) {
                                if (cursor.value.id === 2) {
                                    cursor.value.name = 'John';
                                    cursor.update(cursor.value).then(() => {
                                        store.get(2).then(value => {
                                            value.name.should.equal('John');
                                            done();
                                        });
                                    });
                                }

                                cursor.continue();
                            }
                        });
                    });
                });
            });

            it('should delete cursor value', function(done) {
                database.then(db => {
                    return db.usingReadWriteStore('indexed-store', store => {
                        store.openCursor(null, 'next', cursor => {
                            if (cursor) {
                                if (cursor.value.id === 2) {
                                    cursor.delete().then(() => {
                                        store.get(2).then(value => {
                                            should.not.exist(value);
                                            done();
                                        });
                                    });
                                }

                                cursor.continue();
                            }
                        });
                    });
                });
            });

        });

    });

    describe('Using Database', function() {

        var databaseName = 'test2';
        var storeName = 'some-store';

        it('should dispose database after use', function(done) {
            var upgrader = database => {
                database.createObjectStore(storeName);
            };

            usingDatabase(openDatabase(databaseName, upgrader), db => {
                return db.usingReadWriteStore(storeName, store => store.put('test', 'some key'));
            }).then(() => {
                deleteDatabase(databaseName);
                done();
            });
        });

    });
});
