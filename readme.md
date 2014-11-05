# revisions[![build status](https://secure.travis-ci.org/micnews/revisions.svg)](http://travis-ci.org/micnews/revisions)

Put revisions, ordered by timestamp.

__revisions__ wraps [forkdb](https://github.com/substack/forkdb), so all revisions are saved (even if they're not shown).

When reading revisions, only significant revisions are included. Significant means that if we update the body twice, but both of them are additions the revisions will be merged to one revision. Deletes are handled in a similar way.

For more details on how this is handled, take a look at the tests.

[![NPM](https://nodei.co/npm/revisions.png?downloads&stars)](https://nodei.co/npm/revisions/)

[![NPM](https://nodei.co/npm-dl/revisions.png)](https://nodei.co/npm/revisions/)

## Installation

```
npm install revisions
```

## Example

### Input

```javascript
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
        console.log('2. This also is only one revisions, since it is only additions between the previous one')
        console.log(revisions)

        db.add(key, { body: 'foobar', date: new Date(2000) }, function () {
          db.get(key, function (err, revisions) {
            console.log('3. This however will be two revisions, since the data has significantly changed')
            console.log(revisions)
            // db.get(key, { all: true }) will return a stream that returns all changes
            db.get(key, { all: true }, function (err, revisions) {
              console.log('4. You can also get all revisions')
              console.log(revisions)
            })
          })
        })
      })
    })
  })
})
```

### Output

```
1. This adds a revision
[ { body: 'Hello', date: Thu Jan 01 1970 01:00:00 GMT+0100 (CET) } ]
2. This also is only one revisions, since it is only additions between the previous one
[ { body: 'Hello, world!',
    date: Thu Jan 01 1970 01:00:01 GMT+0100 (CET) } ]
3. This however will be two revisions, since the data has significantly changed
[ { body: 'Hello, world!',
    date: Thu Jan 01 1970 01:00:01 GMT+0100 (CET) },
  { body: 'foobar',
    date: Thu Jan 01 1970 01:00:02 GMT+0100 (CET) } ]
4. You can also get all revisions
[ { body: 'Hello', date: Thu Jan 01 1970 01:00:00 GMT+0100 (CET) },
  { body: 'Hello, world!',
    date: Thu Jan 01 1970 01:00:01 GMT+0100 (CET) },
  { body: 'foobar',
    date: Thu Jan 01 1970 01:00:02 GMT+0100 (CET) } ]
```

## License

Copyright (c) 2014 Mic Network, Inc

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
