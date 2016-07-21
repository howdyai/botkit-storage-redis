var should = require('should'), sinon = require('sinon'), proxyquire = require('proxyquire').noCallThru();

require('should-sinon');

describe('Redis', function() {
    var Storage,
        redisMock,
        redisClientMock,
        defaultNamespace;

    beforeEach(function() {
        defaultNamespace = 'botkit:store';

        redisClientMock = {
            hget: sinon.stub(),
            hset: sinon.stub(),
            hdel: sinon.stub(),
            hgetall: sinon.stub(),
        };

        redisMock = {
            createClient: sinon.stub().returns(redisClientMock)
        };

        Storage = proxyquire('../src/index', {'redis': redisMock});
    });

    describe('initialization', function() {

        it('should initialize redis with the config', function() {
            var config = {};
            Storage(config);
            redisMock.createClient.should.be.calledWith(config);
        });

        it('should set a custom namespace', function() {
            var config = {namespace: 'custom'};
            Storage(config);
            config.should.have.property('namespace', 'custom');
        });

        it('should default the namespace', function() {
            var config = {};
            Storage(config);
            config.should.have.property('namespace', defaultNamespace);
        });

        it('should create a default config', function() {
            Storage();
            redisMock.createClient.should.be.calledWith({namespace: defaultNamespace,
                            methods: []});
        });
    });

    ['teams', 'users', 'channels'].forEach(function(method) {
        describe(method, function() {
            var storageInterface, hash;

            beforeEach(function() {
                storageInterface = Storage();
                hash = defaultNamespace + ':' + method;
            });

            describe('get', function() {

                beforeEach(function() {
                    sinon.spy(JSON, 'parse');
                });

                afterEach(function() {
                    JSON.parse.restore();
                });

                it('should get by ID', function() {
                    var result = '{}',
                        cb = sinon.stub();

                    redisClientMock.hget.yields(null, result);

                    storageInterface[method].get('walterwhite', cb);

                    redisClientMock.hget.should.be.calledWithMatch(hash, 'walterwhite');
                    JSON.parse.should.be.calledWith(result);
                    cb.should.be.calledWith(null, {});
                });

                it('should handle falsy result', function() {
                    var cb = sinon.stub();

                    redisClientMock.hget.yields(null, '');

                    storageInterface[method].get('walterwhite', cb);

                    redisClientMock.hget.should.be.calledWithMatch(hash, 'walterwhite');
                    JSON.parse.should.not.be.called;
                    cb.should.be.calledWith(null, null);
                });

                it('should call the callback with an error if redis fails', function() {
                    var cb = sinon.stub(), err = new Error('OOPS!');

                    redisClientMock.hget.yields(err);

                    storageInterface[method].get('walterwhite', cb);

                    redisClientMock.hget.should.be.calledWithMatch(hash, 'walterwhite');
                    JSON.parse.should.not.be.called;
                    cb.should.be.calledWith(err, null);
                });
            });

            describe('save', function() {

                beforeEach(function() {
                    sinon.spy(JSON, 'stringify');
                });

                afterEach(function() {
                    JSON.stringify.restore();
                });

                it('should throw an error if ID is not provided', function() {
                    var obj = {},
                        cb = sinon.stub();

                    storageInterface[method].save(obj, cb);

                    cb.firstCall.args[0].should.be.an.Error;
                    cb.firstCall.args[1].should.match({});
                });

                it('should save to redis', function() {
                    var obj = {id: 'heisenberg'}, cb = sinon.stub();

                    storageInterface[method].save(obj, cb);

                    JSON.stringify.should.be.calledWith(obj);

                    redisClientMock.hset.should.be.calledWith(
                        defaultNamespace + ':' + method,
                        'heisenberg',
                        '{"id":"heisenberg"}',
                        cb
                    );
                });
            });

            describe('remove', function() {

                beforeEach(function() {
                    sinon.spy(JSON, 'stringify');
                });

                afterEach(function() {
                    JSON.stringify.restore();
                });

                it('should remove from redis', function() {
                    var id = 'heisenberg', cb = sinon.stub();

                    storageInterface[method].remove(id, cb);

                    redisClientMock.hdel.should.be.calledWith(
                        defaultNamespace + ':' + method,
                        ['heisenberg'],
                        cb
                    );
                });
            });


            describe('all', function() {

                beforeEach(function() {
                    sinon.spy(JSON, 'parse');
                });

                afterEach(function() {
                    JSON.parse.restore();
                });

                it('should call callback with error if redis fails', function() {
                    var cb = sinon.stub(),
                        err = new Error('OOPS!');

                    redisClientMock.hgetall.yields(err);

                    storageInterface[method].all(cb);

                    redisClientMock.hgetall.should.be.calledWithMatch(hash);
                    cb.should.be.calledWith(err);
                });

                it('should return an array by default', function() {
                    var cb = sinon.stub(),
                        result = ['{"walterwhite":"heisenberg"}', '{"jessepinkman":"capncook"}'];

                    redisClientMock.hgetall.yields(null, result);

                    storageInterface[method].all(cb);

                    redisClientMock.hgetall.should.be.calledWithMatch(hash);
                    JSON.parse.should.be.calledTwice;
                    cb.should.be.calledWithMatch(null, [{'walterwhite': 'heisenberg'}, {'jessepinkman': 'capncook'}]);
                });

                it('should return an object if specified in options', function() {
                    var cb = sinon.stub(),
                        result = {key1: '{"walterwhite":"heisenberg"}', key2: '{"jessepinkman":"capncook"}'};

                    redisClientMock.hgetall.yields(null, result);

                    storageInterface[method].all(cb, {type: 'object'});

                    redisClientMock.hgetall.should.be.calledWithMatch(hash);
                    JSON.parse.should.be.calledTwice;
                    cb.should.be.calledWithMatch(
                        null,
                        {key1: {'walterwhite': 'heisenberg'}, key2: {'jessepinkman': 'capncook'}}
                    );
                });

                it('should return an array if something other than object is specified in options', function() {
                    var cb = sinon.stub(),
                        result = ['{"walterwhite":"heisenberg"}', '{"jessepinkman":"capncook"}'];

                    redisClientMock.hgetall.yields(null, result);

                    storageInterface[method].all(cb, {type: 'notobject'});

                    redisClientMock.hgetall.should.be.calledWithMatch(hash);
                    JSON.parse.should.be.calledTwice;
                    cb.should.be.calledWithMatch(null, [{'walterwhite': 'heisenberg'}, {'jessepinkman': 'capncook'}]);
                });
            });
        });
    });
});
