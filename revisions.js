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
            if (!callback) {
              getSignificant(key, options)
            } else if (!options || !options.all) {
              getSignificant(key, callback)
            } else {
              getAll(key, callback)
            }
          }
      }
    }

module.exports = revisions