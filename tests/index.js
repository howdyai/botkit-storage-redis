var should = require('should')
    , sinon = require('sinon')
    , proxyquire = require('proxyquire');

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

        Storage = proxyquire('../index', {redis: redisMock});
    });

    describe('initialization', function() {

        it('should default the namespace', function() {
            var config = {};
            Storage(config);
            config.should.have.property('namespace', 'botkit:store');
        });

        it('should set a custom namespace', function() {
            var config = {namespace: 'custom'};
            Storage(config);
            config.should.have.property('namespace', 'custom');
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
