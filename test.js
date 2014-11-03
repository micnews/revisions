var after = require('after')
  , level = require('level-test')()
  , test = require('tape')

  , levelRevisions = require('./level-revisions')
  , runTest = function (name, inputs, callback) {

      var db = levelRevisions((level(name)))
        , key = 'hello'
        , done = after(inputs.length, function (err) {
            if (err) return callback(err)

            db.get(key, callback)
          })
      inputs.forEach(function (row) {
        db.add(key, row, done)
      })
    }

test('get() none existing', function (t) {
  runTest('empty', [], function (err, revisions) {
    t.deepEqual(revisions, [])
    t.end(err)
  })
})

test('one revision', function (t) {
  var inputs = [ { body: 'Hello, world', date: new Date(0) } ]

  runTest('one-revision', inputs, function (err, revisions) {
    t.deepEqual(revisions, inputs)
    t.end(err)
  })
})

test('multiple compatible revisions', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello, world', date: new Date(1000) }
        , { body: 'Hello, world!', date: new Date(2000) }
      ]

  runTest('multiple-compatible', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ inputs[2] ])
    t.end(err)
  })
})

test('more complex, but compatible revisions', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'world!', date: new Date(1000) }
        , { body: 'Hello, world!', date: new Date(2000)}
      ]

  runTest('multiple-compatible-complex', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ inputs[2] ])
    t.end(err)
  })
})

test('removing', function (t) {
  var inputs = [
          { body: 'Hello, world!', date: new Date(0) }
        , { body: 'Hello', date: new Date(1000) }
      ]

  runTest('removing', inputs, function (err, revisions) {
    t.deepEqual(revisions, inputs)
    t.end(err)
  })
})

test('multiple deletes', function (t) {
  var inputs = [
          { body: 'Hello, world!', date: new Date(0) }
        , { body: 'Hello, world', date: new Date(1000) }
        , { body: 'Hello', date: new Date(2000) }
      ]

  runTest('multiple-deletes', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ inputs[0], inputs[2] ])
    t.end(err)
  })
})

test('deletes & inserts', function (t) {
  var inputs = [
          { body: 'beep boop', date: new Date(0)}
        , { body: 'Hello, world!', date: new Date(1000) }
        , { body: 'Hello, world', date: new Date(2000) }
        , { body: 'Hello', date: new Date(3000) }
        , { body: 'Hello2', date: new Date(4000)}
      ]

  runTest('deletes-inserts', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ inputs[0], inputs[1], inputs[4] ])
    t.end(err)
  })
})

test('multiple ends with remove', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Foo', date: new Date(1000) }
        , { body: '', date: new Date(2000) }
      ]

  runTest('end-with-remove', inputs, function (err, revisions) {
    t.deepEqual(revisions, inputs)
    t.end(err)
  })
})

test('unchanged', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello', date: new Date(1000) }
      ]

  runTest('unchanged', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ inputs[1] ])
    t.end(err)
  })
})

test('string date', function (t) {
  var inputs = [ { body: 'Hello', date: (new Date(0)).toJSON() } ]

  runTest('string-date', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ { body: 'Hello', date: new Date(0) } ])
    t.end(err)
  })
})

test('lots of revisions', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello', date: new Date(1000)}
        , { body: 'Hello, world!', date: new Date(2000) }
        , { body: 'foo', date: new Date(3000) }
        , { body: 'foobar', date: new Date(4000) }
      ]

  runTest('lots-of-revisions', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ inputs[2], inputs[4] ])
    t.end(err)
  })
})

test('multiple same date', function (t) {
  var inputs = [
          { body: 'foo', date: new Date(0) }
        , { body: 'bar', date: new Date(0) }
      ]

  runTest('same-date', inputs, function (err, revisions) {
    var foo = false
      , bar = false

    revisions.forEach(function (revision) {
      if (revision.body === 'foo') foo = true
      if (revision.body === 'bar') bar = true
    })

    t.equal(foo, true, 'should include foo')
    t.equal(bar, true, 'should include bar')
    t.equal(revisions.length, 2)
    t.end(err)
  })
})
