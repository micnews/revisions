// argument is an instance of forkdb, so you can for example use the replication from fork
var fork = require('forkdb')(require('level-test')()('example'))

  , db = require('./revisions')(fork)
  , key = 'key'

db.add(key, { body: 'Hello', date: new Date(0) }, function () {
  // db.get(key) will return a stream that returns significant changes
  db.get(key, function (err, revisions) {
    console.log('1. This adds a revision')
    console.log(revisions)

    db.add(key, { body: 'Hello, world!', date: new Date(1000) }, function () {
      db.get(key, function (err, revisions) {
        console.log('2. Now there is 2 revisions')
        console.log(revisions)
        console.log('3. Now let start a stream')
        db.get(key).on('data', function (obj) {
          console.log('some data')
          console.log(obj)
        })
      })
    })
  })
})