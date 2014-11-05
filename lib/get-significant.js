var concat = require('concat-stream')
  , readonly = require('read-only-stream')
  , significantStream = require('significant-stream')

  , createGetSignificant = function (db, getAll) {
      return function (key, callback) {
        var all = getAll(key)
          , stream = significantStream({ key: 'body' })

        all.pipe(stream)
        if (typeof(callback) === 'function') {
          stream.pipe(concat({ encoding: 'object' }, function (array) {
            callback(null, array)
          }))
          stream.once('error', callback)
        } else {
          return readonly(stream)
        }
      }
    }

module.exports = createGetSignificant