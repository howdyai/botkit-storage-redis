// copied from https://github.com/howdyai/botkit version 0.0.5, original authors: @RafaelCosman and @guillaumepotier

var redis = require('redis');

/**
 * botkit-storage-redis - Redis driver for Botkit
 *
 * @param  {Object} config (optional) For full list of valid redis options, see
 *  https://github.com/NodeRedis/node_redis#options-is-an-object-with-the-following-possible-properties
 * @property config.namespace {String} The namespace to use when storing entities. Defaults to 'botkit:store'
 * @return {Object} Storage interface for Botkit
 */
module.exports = function(config) {
    config = config || {};
    config.namespace = config.namespace || 'botkit:store';
    config.methods = config.methods || [];

    var storage = {},
        client = redis.createClient(config), // could pass specific redis config here
        methods = ['teams', 'users', 'channels'].concat(config.methods);

    // Implements required API methods
    for (var i = 0; i < methods.length; i++) {
        storage[methods[i]] = getStorageObj(client, config.namespace + ':' + methods[i]);
    }

    return storage;
};

/**
 * Function to generate a storage object for a given namespace
 *
 * @param {Object} client The redis client
 * @param {String} namespace The namespace to use for storing in Redis
 * @returns {{get: get, save: save, all: all, allById: allById}}
 */
function getStorageObj(client, namespace) {
    return {
        get: function(id, cb) {
            client.hget(namespace, id, function(err, res) {
                cb(err, res ? JSON.parse(res) : null);
            });
        },
        save: function(object, cb) {
            if (!object.id) {
                return cb(new Error('The given object must have an id property'), {});
            }

            client.hset(namespace, object.id, JSON.stringify(object), cb);
        },
        delete: function(id, cb) {
            client.hdel(namespace, [id], cb);
        },
        all: function(cb, options) {
            client.hgetall(namespace, function(err, res) {
                if (err) {
                    return cb(err);
                }

                var parsed,
                    array = [];

                for (var i in res) {
                    parsed = JSON.parse(res[i]);
                    res[i] = parsed;
                    array.push(parsed);
                }

                cb(null, options && options.type === 'object' ? res : array);
            });
        }
    };
}
