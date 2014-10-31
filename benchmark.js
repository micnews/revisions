var db = require('./level-revisions')(require('level-test')()('benchmark'))
  , join = Array.prototype.join

  , input1 = join.call(Array(100), 'abc')
  , input2 = join.call(Array(200), 'add')
  , input3 = join.call(Array(2000), 'a') + 'foo' + join.call(Array(2000), 'b')
  , input4 = join.call(Array(2000), 'a') + 'bar' + join.call(Array(2000), 'b')

console.time('benchmark completely different input')
db.add('key', { body: input1, date: new Date(100) }, function () {
  db.add('key', { body: input2, date: new Date(200) }, function () {
    console.timeEnd('benchmark completely different input')

    console.time('common begining & ending')
    db.add('key2', { body: input3, date: new Date(0) }, function () {
      db.add('key2', { body: input4, date: new Date(100) }, function () {
        console.timeEnd('common begining & ending')
      })
    })
  })
})