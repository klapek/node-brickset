'use strict';

var soap = require('./soap'),
  BricksetClient = require('./client'),
  fs = require('fs'),
  config = require('./config'),
  _ = require('lodash'),
  each = _.each,
  defaults = _.defaults,
  Q = require('q');

var writeCache = function writeCache(xml) {
  fs.writeFile(config.brickset.CACHE_PATH, xml);
};

var connect = function connect(opts, callback) {
  return soap.createClient(opts.url)
    .then(function (client) {
      if (opts.cache) {
        brickset._writeCache(client.wsdl.toXML());
      }
      return BricksetClient.create(client, opts);
    }, function () {
      throw new Error(config.errors.BAD_WSDL);
    })
    .nodeify(callback);
};

var brickset = function brickset(options, callback) {
  var cache_path = config.brickset.CACHE_PATH,
    opts;

  options = options || {};

  if (!options.api_key) {
    throw new Error(config.errors.NO_API_KEY);
  }

  opts = defaults(options, {
    username: process.env.BRICKSET_USERNAME,
    password: process.env.BRICKSET_PASSWORD,
    api_key: process.env.BRICKSET_API_KEY,
    cache: true
  });

  opts.url =
    opts.url ||
      (opts.cache && fs.existsSync(cache_path) ? cache_path :
       process.env.BRICKSET_API_URL || config.brickset.API_URL);

  return brickset._connect(opts, callback);
};

brickset._writeCache = writeCache;
brickset._connect = connect;

module.exports = brickset;
