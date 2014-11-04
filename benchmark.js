var fork = require('forkdb')(require('level-test')()('benchmark'))
  , db = require('./revisions')(fork)
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

        function _write(index) {
          var input = index % 2 === 0 ? input3 : input4
          if (index === 500) return

          db.add('key3', { body: input, date: new Date(index) }, function () {
            write(index + 1)
          })
        }

        function write(index) {
          if (index % 100 === 0 && index > 0) {
            console.log('%s: %s ms', index, (Date.now() - start))
            console.time('get')
            db.get('key3', function () {
              console.timeEnd('get')
              console.time('get all')
              db.get('key3', { all: true }, function () {
                console.timeEnd('get all')
                start = Date.now()
                _write(index)
              })
            })
          } else {
            _write(index)
          }
        }

        write(0)

      })
    })
  })
})