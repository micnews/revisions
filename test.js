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
