var after = require('after')
  , level = require('level-test')()
  , test = require('tape')

  , levelRevisions = require('./level-revisions')

test('get() none existing', function (t) {
  var db = levelRevisions(level('none-existing'))
    , key = 'hello'

  db.get(key, function (err, revisions) {
    if (err) return t.end(err)
    t.deepEqual(revisions, [])
    t.end()
  })
})

test('one revision', function (t) {
  var db = levelRevisions(level('one-revision'))
    , key = 'hello'

  db.add(key, { body: 'Hello, world', date: new Date(0) }, function (err) {
    if (err) return t.end(err)

    db.get(key, function (err, revisions) {
      if (err) return t.end(err)

      t.deepEqual(revisions, [ { body: 'Hello, world', date: new Date(0) } ])
      t.end()
    })
  })
})

test('multiple compatible revisions', function (t) {
  var db = levelRevisions(level('multiple-compatible'))
    , key = 'hello'

  db.add(key, { body: 'Hello', date: new Date(0) }, function (err) {
    if (err) return t.end(err)

    db.add(key, { body: 'Hello, world', date: new Date(1000) }, function (err) {
      if (err) return t.end(err)

      db.add(key, { body: 'Hello, world!', date: new Date(2000) }, function (err) {
        if (err) return t.end(err)

        db.get(key, function (err, revisions) {
          t.deepEqual(revisions, [ { body: 'Hello, world!', date: new Date(2000) }])
          t.end()
        })
      })
    })
  })
})

test('more complex, but compatible revisions', function (t) {
  var db = levelRevisions(level('multiple-compatible-complex'))
    , key = 'hello'

  db.add(key, { body: 'Hello', date: new Date(0) }, function (err) {
    if (err) return t.end(err)

    db.add(key, { body: 'world!', date: new Date(1000) }, function (err) {
      if (err) return t.end(err)

      db.get(key, function (err, revisions) {
        if (err) return t.end(err)

        t.deepEqual(
            revisions
          , [
                { body: 'Hello', date: new Date(0) }
              , { body: 'world!', date: new Date(1000) }
            ]
        )

        db.add(key, { body: 'Hello, world!', date: new Date(2000) }, function (err) {
          if (err) return t.end(err)

          db.get(key, function (err, revisions) {
            if (err) return t.end(err)

            t.deepEqual(revisions, [ { body: 'Hello, world!', date: new Date(2000)}])
            t.end()
          })
        })
      })
    })
  })
})

test('removing', function (t) {
  var db = levelRevisions(level('removing'))
    , key = 'hello'

  db.add(key, { body: 'Hello, world!', date: new Date(0) }, function (err) {
    if (err) return t.end(err)

    db.add(key, { body: 'Hello', date: new Date(1000) }, function (err) {
      if (err) return t.end(err)

      db.get(key, function (err, revisions) {
        if (err) return t.end(err)

        t.deepEqual(
            revisions
          , [
                { body: 'Hello, world!', date: new Date(0) }
              , { body: 'Hello', date: new Date(1000) }
            ]
        )
        t.end()
      })
    })
  })
})

test('multiple removes', function (t) {
  var db = levelRevisions(level('multiple-removes'))
    , key = 'hello'

  db.add(key, { body: 'Hello, world!', date: new Date(0) }, function (err) {
    if (err) return t.end(err)

    db.add(key, { body: 'Hello, world', date: new Date(1000) }, function (err) {
      if (err) return t.end(err)

      db.add(key, { body: 'Hello', date: new Date(2000) }, function (err) {
        if (err) return t.end(err)

        db.get(key, function (err, revisions) {
          if (err) return t.end(err)

          t.deepEqual(
              revisions
            , [
                  { body: 'Hello, world!', date: new Date(0) }
                , { body: 'Hello', date: new Date(2000) }
              ]
          )
          t.end()
        })
      })
    })
  })
})

test('multiple ends with remove', function (t) {
  var db = levelRevisions(level('end-with-remove'))
    , key = 'hello'

  db.add(key, { body: 'Hello', date: new Date(0) }, function (err) {
    if (err) return t.end(err)

    db.add(key, { body: 'Foo', date: new Date(1000) }, function (err) {
      if (err) return t.end(err)

      db.add(key, { body: '', date: new Date(2000) }, function (err) {
        if (err) return t.end(err)

        db.get(key, function (err, revisions) {
          t.deepEqual(
              revisions
            , [
                  { body: 'Hello', date: new Date(0) }
                , { body: 'Foo', date: new Date(1000) }
                , { body: '', date: new Date(2000) }
              ]
          )
          t.end()
        })
      })
    })
  })
})

test('unchanged', function (t) {
  var db = levelRevisions(level('unchanged'))
    , key = 'hello'

  db.add(key, { body: 'Hello', date: new Date(0) }, function (err) {
    if (err) return t.end(err)

    db.add(key, { body: 'Hello', date: new Date(1000) }, function (err) {
      if (err) return t.end(err)

      db.get(key, function (err, revisions) {
        if (err) return t.end(err)

        t.deepEqual(revisions, [ { body: 'Hello', date: new Date(1000) } ])

        t.end()
      })
    })
  })
})

test('string date', function (t) {
  var db = levelRevisions(level('string-date'))
    , key = 'hello'

  db.add(key, { body: 'Hello', date: (new Date(0)).toJSON() }, function (err) {
    if (err) return t.end(err)

    db.get(key, function (err, revisions) {
      if (err) return t.end(err)

      t.deepEqual(revisions, [ { body: 'Hello', date: new Date(0) } ])

      t.end()
    })
  })
})

test('lots of revisions', function (t) {
  var db = levelRevisions(level('lots-of-revisions'))
    , key = 'hello'
    , inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello', date: new Date(1000)}
        , { body: 'Hello, world!', date: new Date(2000) }
        , { body: 'foo', date: new Date(3000) }
        , { body: 'foobar', date: new Date(4000) }
      ]
    , done = after(inputs.length, function (err) {
        if (err) return t.end(err)

        db.get(key, function (err, revisions) {
          t.deepEqual(revisions, [ inputs[2], inputs[4] ])
          t.end()
        })
      })

  inputs.forEach(function (row) {
    db.add(key, row, done)
  })
})

test('concurrent with distinct dates', function (t) {
  var db =levelRevisions(level('concurrent-distinct'))
    , key = 'hello'
    , done = after(2, function () {
        db.get(key, function (err, revisions) {
          t.deepEqual(
              revisions
            , [
                  { body: 'foo', date: new Date(0) }
                , { body: 'bar', date: new Date(1) }
              ]
          )
          t.end()
        })
      })

  db.add(key, { body: 'bar', date: new Date(1) }, done)
  db.add(key, { body: 'foo', date: new Date(0) }, done)
})

test('concurrent with same dates', function (t) {
  var db =levelRevisions(level('concurrent-same'))
    , key = 'hello'
    , done = after(2, function () {
        db.get(key, function (err, revisions) {
          var foo = false
            , bar = false

          revisions.forEach(function (revision) {
            if (revision.body === 'foo') foo = true
            if (revision.body === 'bar') bar = true
          })

          t.equal(foo, true, 'should include foo')
          t.equal(bar, true, 'should include bar')
          t.equal(revisions.length, 2)

          t.end()
        })
      })

  db.add(key, { body: 'foo', date: new Date(0) }, done)
  db.add(key, { body: 'bar', date: new Date(0) }, done)
})
