var add = function (db, key, body, date, callback) {
      db.put(key, [{ body: body, date: date }], { encoding: 'json' }, callback)
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
            add(db, key, data.body, data.date, callback)
          }
        , get: function (key, callback) {
            get(db, key, callback)
          }
      }
    }

module.exports = levelRevisions