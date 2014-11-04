var test = require('tape')

  , runTest = require('./common').runGetAllTest

test('get() all: true none existing', function (t) {
  runTest('empty', [], function (err, revisions) {
    t.deepEqual(revisions, [])
    t.end()
  })
})

test('get() all: true  multiple revisions', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello, world', date: new Date(1000) }
        , { body: 'Hello, world!', date: new Date(2000) }
      ]

  runTest('multiple-compatible', inputs, function (err, revisions) {
    t.deepEqual(revisions, inputs)
    t.end(err)
  })
})