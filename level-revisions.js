var after = require('after')
  , DiffMatchPatch = require('diff-match-patch')
  , forkdb = require('forkdb')
  , streamToJSON = require('stream-to-json')

  , diffMatchPatch = new DiffMatchPatch()

  , diffStats = function (before, after) {
      var stats = { inserts: false, deletes: false }
        , diff = diffMatchPatch.diff_main(before.body, after.body)
        , index

      for(index = 0; index < diff.length; ++index) {
        if (diff[index][0] === -1) stats.deletes = true
        if (diff[index][0] === 1) stats.inserts = true
        if (stats.deletes && stats.inserts) break
      }
      return stats
    }

    // merge together revisions if
    // * it's not a delete - keep the last revision only
    // * multiple deletes - if we have two deletes in a row we simplify it to
    //    be one big delete
    // this works by moving them from the @input array to the @results array
    //    but only moving those that aren't being merged
  , merge = function (revisions) {
      if (revisions.length < 2) return revisions.slice(0)

      var input = revisions.slice()
        , results = [ input.pop() ]
        , stats
        , deleting = false

      while(input.length > 0) {
        stats = diffStats(input[input.length - 1], results[0])

        if (!stats.deletes) {
          if (deleting) {
            results.unshift(input.pop())
          } else {
            input.pop()
          }
          deleting = false
        } else if (!stats.inserts) {
          if (input.length === 1) {
            results.unshift(input.pop())
          } else {
            stats = diffStats(input[input.length - 2], input[input.length - 1])
            if (!stats.inserts) {
              deleting = true
              input.pop()
            } else {
              deleting = false
              results.unshift(input.pop())
            }
          }
        } else {
          deleting = false
          results.unshift(input.pop())
        }
      }

      return results
    }

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

  , levelRevisions = function (db, dir) {
      var fork = forkdb(db, { dir: dir })

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