var db = require('./level-revisions')(require('level-test')()('benchmark'))
  , input1 = Array.prototype.join.call(Array(100), 'abc')
  , input2 = Array.prototype.join.call(Array(200), 'add')

console.time('benchmark')

db.add('key', { body: input1, date: new Date(100) }, function () {
  db.add('key', { body: input2, date: new Date(200) }, function () {
    console.timeEnd('benchmark')
  })
})