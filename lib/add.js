var createAdd = function (db) {
    return function (key, data, callback) {
        var date = new Date(data.date)
          , meta = { key: [ key, date ] }
          , w = db.createWriteStream(meta, function (err) {
              callback(err)
            })
  
        w.write(JSON.stringify(data))
        w.end()
      }
    }

module.exports = createAdd