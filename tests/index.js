var should = require('should')
    , sinon = require('sinon')
    , proxyquire = require('proxyquire').noCallThru();

require('should-sinon');

describe('Redis', function() {
    var Storage
        , redisMock
        , redisClientMock;

    beforeEach(function() {
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
        var defaultNamespace;

        beforeEach(function() {
            defaultNamespace = 'botkit:store';
        });

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
    });

    describe('teams', function() {

        beforeEach(function() {

        });

        it('should ', function() {

        });
    });

    describe('users', function() {

        beforeEach(function() {

        });

        it('should ', function() {

        });
    });

    describe('channels', function() {

        beforeEach(function() {

        });

        it('should ', function() {

        });
    });

    describe('custom', function() {

        beforeEach(function() {

        });

        it('should ', function() {

        });
    });
});
