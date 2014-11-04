var createGetFromRevisionKey = require('./get-from-revision-key')
  , flatten = require('./flatten')

  , createGetAll = function (db) {
      var getFromRevisionKey = createGetFromRevisionKey(db)

      return function (key, callback) {
        var keys = db.keys({ gt: [ key, null ], lt: [ key, undefined ] })
          , results = []
          , count = 0
          , bailed = false
          , ended = false
          , index = 0
          , maybeFinish = function () {
              if (bailed) return
              if (count === 0 && ended) {
                callback(null, flatten(results))
              }
            }
          , onError = function (err) {
              if (bailed) return
              bailed = true
              callback(err)
            }

        keys.on('data', function (meta) {
          var currentIndex = index
          index++
          count++
          getFromRevisionKey(meta.key, function (err, array) {
            if (bailed) return
            if (err) return onError(err)

            results[currentIndex] = array
            count--
            maybeFinish()
          })
        })

        keys.once('end', function () {
          ended = true
          maybeFinish()
        })
        keys.once('err', onError)
      }
    }

module.exports = createGetAll