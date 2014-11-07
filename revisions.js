var createAdd = require('./lib/add')
  , createGet = require('./lib/get')

  , revisions = function (db) {
      var get = createGet(db)
        , add = createAdd(db)

      return {
          add: function (key, data, callback) {
            add(key, data, callback)
          }
        , get: function (key, options, callback) {
            return get(key, options, callback)
          }
      }
    }

module.exports = revisions