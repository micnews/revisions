var DiffMatchPatch = require('diff-match-patch')
  , forkdb = require('forkdb')
  , parallel = require('run-parallel')

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
  , merge = function (revisions) {
      var last, secondLast, thirdLast, stats1, stats2

      while(revisions.length >= 2) {
        last = revisions[revisions.length - 1]
        secondLast = revisions[revisions.length - 2]
        stats1 = diffStats(secondLast, last)

        if (!stats1.deletes) {
          revisions = revisions.slice(0, -2).concat([ last ])
        } else if (!stats1.inserts && revisions.length > 2) {
          thirdLast = revisions[revisions.length - 3]
          stats2 = diffStats(thirdLast, secondLast)
          // if both the last revision and the revision before are removes
          // merge them together
          if (!stats2.inserts) {
            revisions = revisions.slice(0, -2).concat([ last ])
          } else {
            break
          }
        } else {
          break
        }
      }

      return revisions
    }

  , add = function (fork, key, data, callback) {
      fork.heads(key, function (err, heads) {
        if (err) return callback(err)

        var meta = Array.isArray(heads) ?
              { key: key, prev: heads } : { key: key }
          , w = fork.createWriteStream(meta, function (err) {
                  callback(err)
                })

        w.write(JSON.stringify(data))
        w.end()
      })
    }

  , read = function (fork, hash, callback) {
      var chunks = []
        , stream = fork.createReadStream(hash)

      stream.on('data', function (chunk) { chunks.push(chunk) })
      stream.once('end', function () {

        var obj = JSON.parse(Buffer.concat(chunks).toString())
        obj.date = new Date(obj.date)

        callback(null, obj)
      })
      stream.once('error', callback)
    }

  , get = function (fork, key, callback) {
      fork.heads(key, function (err, heads) {

        var hash = heads[0].hash
          , hashes = []
          , index = 0

          , stream = fork.history(hash)

        stream.on('data', function (meta) {
          hashes.push(meta.hash)
        })

        stream.once('end', function () {
          var tasks = hashes.map(function (hash) {
            return function (done) {
              read(fork, hash, done)
            }
          })
          parallel(tasks, function (err, revisions) {
            if (err) return callback(err)

            callback(null, merge(revisions))
          })
        })
      })
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