var levelDb = require('level-test')()('benchmark')
  , db = require('./level-revisions')(levelDb)
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
        console.log()
        console.log('saving loads of revisions')
        var start = Date.now()

        function write(index) {
          if (index % 100 === 0 && index > 0) {
            console.log('%s: %s ms', index, (Date.now() - start))
          }
          if (index === 500) {
            levelDb.get('key3', function (err, data) {
              console.log('uncompressed size:' + data.length / 1024 + 'kb')
            })
            return
          }

          var input = index % 2 === 0 ? input3 : input4

          db.add('key3', { body: input, date: new Date(index) }, function () {
            write(index + 1)
          })
        }

        write(0)

      })
    })
  })
})