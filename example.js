var db = require('./revisions')(require('forkdb')(require('level-test')()('example')))
  , key = 'key'

db.add(key, { body: 'Hello', date: new Date(0) }, function () {
  db.get(key, function (err, revisions) {
    console.log('1. This adds a revision')
    console.log(revisions)

    db.add(key, { body: 'Hello, world!', date: new Date(1000) }, function () {
      db.get(key, function (err, revisions) {
        console.log('2. This also is only one revisions, since it is only additions between the previous one')
        console.log(revisions)

        db.add(key, { body: 'foobar', date: new Date(2000) }, function () {
          db.get(key, function (err, revisions) {
            console.log('3. This however will be two revisions, since the data has significantly changed')
            console.log(revisions)
          })
        })
      })
    })
  })
})