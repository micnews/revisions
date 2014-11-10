var after = require('after')
  , forkdb = require('forkdb')
  , level = require('level-test')()
  , key = 'hello'

  , populate = function (name, inputs, callback) {
      var db = require('../revisions')(forkdb(level('get-all-' + name)))
        , done = after(inputs.length, function (err) {
            callback(err, db)
          })

      inputs.forEach(function (row) {
        db.add(key, row, done)
      })
    }

module.exports = {
    key: key
  , populate: populate
}
