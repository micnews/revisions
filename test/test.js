var test = require('tape')

  , common = require('./common')

test('get() none existing', function (t) {
  common.populate('empty', [], function (err, db) {
    db.get(common.key, function (err, revisions) {
      t.deepEqual(revisions, [])
      t.end()
    })
  })
})

test('get() multiple revisions', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello, world', date: new Date(1000) }
        , { body: 'Hello, world!', date: new Date(2000) }
      ]

  common.populate('multiple-compatible', inputs, function (err, db) {
    db.get(common.key, function (err, revisions) {
      t.deepEqual(revisions, inputs)
      t.end()
    })
  })
})

test('get() returns stream', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello, world', date: new Date(1000) }
      ]

  common.populate('get-all-stream', inputs, function (err, db) {
    var stream = db.get(common.key, { })

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