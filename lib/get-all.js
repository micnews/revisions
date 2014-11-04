var concat = require('concat-stream')
  , readonly = require('read-only-stream')
  , through = require('through2')

  , createGetFromRevisionKey = require('./get-from-revision-key')

  , createGetAll = function (db) {
      var getFromRevisionKey = createGetFromRevisionKey(db)

      return function (key, callback) {
        var keys = db.keys({ gt: [ key, null ], lt: [ key, undefined ] })
          , stream = through.obj(function (meta, _, callback) {
              getFromRevisionKey(meta.key, function (err, array) {
                if (err) return callback(err)
                array.forEach(function (row) {
                  stream.push(row)
                })
                callback()
              })
            })

        keys.pipe(stream)

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

module.exports = createGetAll