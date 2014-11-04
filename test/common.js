var after = require('after')
  , forkdb = require('forkdb')
  , level = require('level-test')()

  , runGetTest = function (name, inputs, callback) {

      var db = require('../revisions')(forkdb(level('get-' + name)))
        , key = 'hello'
        , done = after(inputs.length, function (err) {
            if (err) return callback(err)

            db.get(key, callback)
          })

      inputs.forEach(function (row) {
        db.add(key, row, done)
      })
    }

  , runGetAllTest = function (name, inputs, callback) {

      var db = require('../revisions')(forkdb(level('get-all-' + name)))
        , key = 'hello'
        , done = after(inputs.length, function (err) {
            if (err) return callback(err)

            db.get(key, { all: true }, callback)
          })

      inputs.forEach(function (row) {
        db.add(key, row, done)
      })
    }

module.exports = {
    runGetTest: runGetTest
  , runGetAllTest: runGetAllTest
}
