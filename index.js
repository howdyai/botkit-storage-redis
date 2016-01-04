// copied from https://github.com/howdyai/botkit version 0.0.5, original authors: @RafaelCosman and @guillaumepotier

var redis = require('redis');

/**
 * botkit-storage-redis - Redis driver for Botkit
 *
 * @param  {Object} config (optional) For full list of valid redis options, see
 *  https://github.com/NodeRedis/node_redis#options-is-an-object-with-the-following-possible-properties
 * @property config.namespace {String} The namespace to use when storing entities. Defaults to 'botkit:store'
 * @property config.methods {Array} An array of strings for the methods to export.
 *  Defaults to ['teams', 'users', 'channels']
 * @return {Object} Storage interface for Botkit
 */
module.exports = function(config) {
    config = config || {};
    config.namespace = config.namespace || 'botkit:store';

    var storage = {},
      client = redis.createClient(config), // could pass specific redis config here
      methods = config.methods || ['teams', 'users', 'channels'];

    // Implements required API methods
    for (var i = 0; i < methods.length; i++) {
        storage[methods[i]] = getStorageObj(config.namespace + ':' + methods[i], client);
    }

    return storage;
};

/**
 * Function to generate a storage object for a given namespace
 *
 * @param {String} namespace The namespace to use for storing in Redis
 * @param {Object} client The redis client
 * @returns {{get: get, save: save, all: all, allById: allById}}
 */
function getStorageObj(namespace, client) {
    return {
        get: function(id, cb) {
            client.hget(namespace, id, function(err, res) {
                cb(err, res ? JSON.parse(res) : {});
            });
        },
        save: function(object, cb) {
            if (!object.id) {
                return cb(new Error('The given object must have an id property'), {});
            }

            client.hset(namespace, object.id, JSON.stringify(object), cb);
        },
        all: function(cb, options) {
            client.hgetall(namespace, function(err, res) {
                if (err) {
                    return cb(err, {});
                }

                if (res === null) {
                    return cb(err, res);
                }

                var parsed,
                    array = [];

                for (var i in res) {
                    parsed = JSON.parse(res[i]);
                    res[i] = parsed;
                    array.push(parsed);
                }

                cb(err, options && options.type === 'object' ? res : array);
            });
        },
        allById: function(cb) {
            this.all(cb, {type: 'object'});
        }
    };
}
