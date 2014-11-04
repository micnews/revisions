var test = require('tape')

  , common = require('./common')

test('get() all: true none existing', function (t) {
  common.runGetAllTest('empty', [], function (err, revisions) {
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

  common.runGetAllTest('multiple-compatible', inputs, function (err, revisions) {
    t.deepEqual(revisions, inputs)
    t.end(err)
  })
})

test('get() all: true returns stream', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello, world', date: new Date(1000) }
      ]

  common.populate('get-all-stream', inputs, function (err, db) {
    var stream = db.get(common.key, { all: true })

    t.notOk(stream.writable, 'stream should not be writable')
    t.notOk(stream.write, 'stream should not have a write method')

    stream.once('data', function (obj) {
      t.deepEqual(obj, inputs[0])
      stream.once('data', function (obj) {
        t.deepEqual(obj, inputs[1])
        stream.once('end', t.end.bind(t))
      })
    })
  })
})