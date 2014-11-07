var collect = require('collect-stream')
  , pipe = require('multipipe')
  , readonly = require('read-only-stream')
  , significantStream = require('significant-stream')
  , through = require('through2')

  , createGetFromRevisionKey = require('./get-from-revision-key')

  , createGetAll = function (db) {
      var getFromRevisionKey = createGetFromRevisionKey(db)

      return function (key, options, callback) {
        if (typeof(options) === 'function') {
          callback = options
          options = {}
        }

        options = options || {}

        var keyStream = db.keys({ gt: [ key, null ], lt: [ key, undefined ] })
          , dataStream = through.obj(function (meta, _, callback) {
              getFromRevisionKey(meta.key, function (err, array) {
                if (err) return callback(err)
                array.forEach(function (row) {
                  dataStream.push(row)
                })
                callback()
              })
            })
          , stream = options.all?
              pipe(keyStream, dataStream) :
              pipe(keyStream, dataStream, significantStream({ key: 'body' }))

        return callback ? collect(stream, callback) : readonly(stream)
      }
    }

module.exports = createGetAll