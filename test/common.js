var after = require('after')
  , forkdb = require('forkdb')
  , level = require('level-test')()
  , key = 'hello'

  , runGetTest = function (name, inputs, callback) {
      populate('get-' + name, inputs, function (err, db) {
        if (err) return callback(err)

        db.get(key, callback)
      })
    }

  , runGetAllTest = function (name, inputs, callback) {
      populate('get-all-' + name, inputs, function (err, db) {
        if (err) return callback(err)

        db.get(key, { all: true }, callback)
      })
    }
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
    runGetTest: runGetTest
  , runGetAllTest: runGetAllTest
  , key: key
  , populate: populate
}
