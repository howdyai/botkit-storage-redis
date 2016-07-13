# botkit-storage-redis
A redis storage module for Botkit

## Usage

Just require `botkit-storage-redis` and pass it your config options (or none if your cool with defaults).
Then pass the returned storage when creating your Botkit controller. Botkit will do the rest!

Make sure everything you store has an `id` property, that's what you'll use to look it up later.

```
var Botkit = require('botkit'),
    redisConfig = {...}
    redisStorage = require('botkit-storage-redis')(redisConfig),
    controller = Botkit.slackbot({
        storage: redisStorage
    });
```

```
// then you can use the Botkit storage api, make sure you have an id property
var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
controller.storage.teams.save(beans);
beans = controller.storage.teams.get('cool');

```

### Options

You can pass any options that are allowed by [node-redis](https://github.com/NodeRedis/node_redis).

Additionally you can pass a `namespace` property which is used to namespace keys in Redis. `namespace` defaults to `botkit:store`.

You can also pass a `methods` property which is an array of additional custom methods you want to add. The default methods are `teams`, `users`, and `channels`.