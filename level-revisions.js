var after = require('after')
  , forkdb = require('forkdb')
  , streamToJSON = require('stream-to-json')

  , merge = require('./lib/merge')

  , add = function (fork, key, data, callback) {
      var date = typeof(data.date) === 'string' ? data.date : data.date.toJSON()
        , meta = { key: [ key, date ] }
        , w = fork.createWriteStream(meta, function (err) {
            callback(err)
          })

      w.write(JSON.stringify(data))
      w.end()
    }

  , read = function (fork, hash, callback) {
      streamToJSON(fork.createReadStream(hash), function (err, obj) {
        if (err) return callback(err)

        obj.date = new Date(obj.date)
        callback(null, obj)
      })
    }

  , getFromRevisionKey = function (fork, key, callback) {
      fork.heads(key, function (err, metadata) {
        if (err) return callback(err)

        var done = after(metadata.length, callback)
          , revisions = Array(metadata.length)

        metadata.forEach(function (meta, index) {
          read(fork, meta.hash, function (err, data) {
            if (err) return done(err)

            revisions[index] = data
            done(null, revisions)
          })
        })
      })
    }

  , flatten = function (array) {
      return array.reduce(function (result, current) {
        current.forEach(function (row) { result.push(row) })
        return result
      }, [])
    }

  , get = function (fork, key, callback) {
      var keys = fork.keys({ gt: [ key, '0' ], lt: [ key, '3' ] })
        , results = []
        , count = 0
        , bailed = false
        , ended = false
        , index = 0
        , maybeFinish = function () {
            if (bailed) return
            if (count === 0 && ended) {
              callback(null, merge(flatten(results)))
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
        getFromRevisionKey(fork, meta.key, function (err, array) {
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

  , levelRevisions = function (db, options) {
      var fork = forkdb(db, options)

      return {
          add: function (key, data, callback) {
            add(fork, key, data, callback)
          }
        , get: function (key, callback) {
            get(fork, key, callback)
          }
      }
    }

module.exports = levelRevisions