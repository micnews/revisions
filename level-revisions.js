var diff = require('diff')

  , diffStats = function (before, after) {
      var stats = { added: 0, removed: 0 }

      diff.diffChars(before.body, after.body).forEach(function (change) {
        if (change.added) stats.added = stats.added + 1
        if (change.removed) stats.removed = stats.removed + 1
      })

      return stats
    }

  , trim = function (revisions) {
      var last, secondLast, thirdLast, stats1, stats2

      while(revisions.length >= 2) {
        last = revisions[revisions.length - 1]
        secondLast = revisions[revisions.length - 2]
        stats1 = diffStats(secondLast, last)

        if (!stats1.removed) {
          revisions = revisions.slice(0, -2).concat([ last ])
        } else if (revisions.length > 2) {
          thirdLast = revisions[revisions.length - 3]
          stats2 = diffStats(thirdLast, secondLast)
          // if both the last revision and the revision before are removes
          // merge them together
          if (!stats1.added && !stats2.added) {
            revisions = revisions.slice(0, -2).concat([ last ])
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

        revisions = Array.isArray(revisions) ? trim(revisions.concat([data])) : [ data ]

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