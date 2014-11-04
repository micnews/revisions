var after = require('after')
  , streamToJSON = require('stream-to-json')

  , createRead = function (db) {
      return function (hash, callback) {
        streamToJSON(db.createReadStream(hash), function (err, obj) {
          if (err) return callback(err)

          obj.date = new Date(obj.date)
          callback(null, obj)
        })
      }
    }

  , createGetFromRevisionKey = function (db) {
      var read = createRead(db)

      return function (key, callback) {
        db.heads(key, function (err, metadata) {
          if (err) return callback(err)

          var done = after(metadata.length, callback)
            , revisions = Array(metadata.length)

          metadata.forEach(function (meta, index) {
            read(meta.hash, function (err, data) {
              if (err) return done(err)

              revisions[index] = data
              done(null, revisions)
            })
          })
        })
      }
    }

module.exports = createGetFromRevisionKey