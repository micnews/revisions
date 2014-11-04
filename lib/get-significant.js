var merge = require('./merge')

  , createGetSignificant = function (db, getAll) {
      return function (key, callback) {
        getAll(key, function (err, results) {
          if (err) {
            callback(err)
          } else {
            callback(null, merge(results))
          }
        })
      }
    }

module.exports = createGetSignificant