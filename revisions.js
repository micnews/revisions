var createAdd = require('./lib/add')
  , createGetAll = require('./lib/get-all')
  , createGetSignificant = require('./lib/get-significant')

  , revisions = function (db) {
      var getAll = createGetAll(db)
        , getSignificant = createGetSignificant(db, getAll)
        , add = createAdd(db)

      return {
          add: function (key, data, callback) {
            add(key, data, callback)
          }
        , get: function (key, options, callback) {
            if (typeof(options) === 'function') {
              return getSignificant(key, options)
            }

            if (options && options.all) {
              return getAll(key, callback)
            }

            return getSignificant(key, callback)
          }
      }
    }

module.exports = revisions