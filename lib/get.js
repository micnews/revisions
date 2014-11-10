var collect = require('collect-stream')
  , pipe = require('multipipe')
  , readonly = require('read-only-stream')
  , streamToJSON = require('stream-to-json')
  , through = require('through2')

  , createGetAll = function (db) {
      return function (key, options, callback) {
        if (typeof(options) === 'function') {
          callback = options
          options = {}
        }

        options = options || {}

        var keyStream = db.keys({ gt: [ key, null ], lt: [ key, undefined ] })
          , hashStream = through.obj(function (meta, _, callback) {
              db.heads(meta.key, function (err, array) {
                if (err) return callback(err)
                array.forEach(function (row) {
                  hashStream.push(row.hash)
                })
                callback()
              })
            })
          , dataStream = through.obj(function (hash, _, callback) {
              streamToJSON(db.createReadStream(hash), function (err, obj) {
                if (err) return callback(err)

                obj.date = new Date(obj.date)
                callback(null, obj)
              })
            })
          , stream = pipe(keyStream, hashStream, dataStream)

        return callback ? collect(stream, callback) : readonly(stream)
      }
    }

module.exports = createGetAll