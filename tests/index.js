var should = require('should')
    , sinon = require('sinon')
    , proxyquire = require('proxyquire').noCallThru();

require('should-sinon');

describe('Redis', function() {
    var Storage
        , redisMock
        , redisClientMock
        , defaultNamespace;

    beforeEach(function() {
        defaultNamespace = 'botkit:store';

        redisClientMock = {
            hget: sinon.stub(),
            hset: sinon.stub(),
            hgetall: sinon.stub()
        };

        redisMock = {
            createClient: sinon.stub().returns(redisClientMock)
        };

        Storage = proxyquire('../index', {'redis': redisMock});
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
            redisMock.createClient.should.be.calledWith({namespace: defaultNamespace});
        });

        it('should have default storage methods', function() {
            var storage = Storage();
            storage.should.have.property('teams');
            storage.should.have.property('users');
            storage.should.have.property('channels');
        });

        it('should create custom storage methods', function() {
            var storage = Storage({methods:['walterwhite', 'heisenberg']});
            storage.should.have.property('walterwhite');
            storage.should.have.property('heisenberg');
        });
    });

    ['teams', 'users', 'channels'].forEach(function (method) {
        describe(method, function() {
            var storageInterface
                , hash;

            beforeEach(function() {
                storageInterface = Storage();
                hash = defaultNamespace + ':' + method;
                sinon.spy(JSON, 'parse');
            });

            afterEach(function() {
                JSON.parse.restore();
            });

            describe('get', function() {

                it('should get by ID', function() {
                    var result = '{}'
                        , cb = sinon.stub();

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
                    cb.should.be.calledWith(null, {});
                });

                it('should call the callback with an error if redis fails', function() {
                    var cb = sinon.stub()
                        , err = new Error('OOPS!');

                    redisClientMock.hget.yields(err);

                    storageInterface[method].get('walterwhite', cb);

                    redisClientMock.hget.should.be.calledWithMatch(hash, 'walterwhite');
                    JSON.parse.should.not.be.called;
                    cb.should.be.calledWith(err, {});
                });
            });

            describe('save', function() {

                beforeEach(function() {

                });

                it('should ', function() {

                });
            });

            describe('all', function() {

                beforeEach(function() {

                });

                it('should ', function() {

                });
            });

            describe('allById', function() {

                beforeEach(function() {

                });

                it('should ', function() {

                });
            });
        });
    });
});
