var DiffMatchPatch = require('diff-match-patch')

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
      get(db, key, function (err, revisions) {
        if (err && !err.notFound) return callback(err)

        revisions = Array.isArray(revisions) ? merge(revisions.concat([data])) : [ data ]

        db.put(key, revisions, { encoding: 'json' }, callback)
      })
    }

  , get = function (db, key, callback) {
      db.get(key, { encoding: 'json' }, function (err, revisions) {
        if (err) {
          callback(err)
        } else {
          revisions.forEach(function (revision) { revision.date = new Date(revision.date)})
          callback(null, revisions)
        }
      })
    }

  , levelRevisions = function (db) {
      return {
          add: function (key, data, callback) {
            add(db, key, data, callback)
          }
        , get: function (key, callback) {
            get(db, key, callback)
          }
      }
    }

module.exports = levelRevisions