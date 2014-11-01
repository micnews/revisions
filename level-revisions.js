var DiffMatchPatch = require('diff-match-patch')
  , forkdb = require('forkdb')

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

  , add = function (db, key, data, callback) {
      rawGet(db, key, function (err, revisions) {
        if (err && !err.notFound) return callback(err)

        revisions = Array.isArray(revisions) ?
          merge(revisions.concat([data])) : [ data ]

        db.put(key, revisions, { encoding: 'json' }, callback)
      })
    }

  , add2 = function (fork, key, data, callback) {
      var w = fork.createWriteStream({ key: key }, function (err) { callback(err) })
      w.write(JSON.stringify(data))
      w.end()
    }

  , rawGet = function (db, key, callback) {
      db.get(key, { encoding: 'json' }, callback)
    }

  , get = function (db, key, callback) {
      rawGet(db, key, function (err, revisions) {
        if (err) {
          callback(err)
        } else {
          revisions.forEach(function (revision) {
            revision.date = new Date(revision.date)
          })
          callback(null, revisions)
        }
      })
    }

  , get2 = function (fork, key, callback) {
      fork.tails(key, function (err, tails) {
        var hash = tails[0].hash
          , revisions = []
        // TODO handle conflicts
        var stream = fork.createReadStream(hash)

        stream.on('data', function (chunk) {
          var obj = JSON.parse(chunk)
          obj.date = new Date(obj.date)
          revisions.push(obj)
        })

        stream.once('end', function () {
          callback(null, revisions)
        })
      })
    }

  , levelRevisions = function (db, dir) {
      var fork = forkdb(db, { dir: dir })

      return {
          add: function (key, data, callback) {
            // add(db, key, data, callback)
            add2(fork, key, data, callback)
          }
        , get: function (key, callback) {
            // get(db, key, callback)
            get2(fork, key, callback)
          }
      }
    }

module.exports = levelRevisions