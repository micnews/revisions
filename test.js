var test = require('tape')
  , level = require('level-test')()
  , levelRevisions = require('./level-revisions')

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
