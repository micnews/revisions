var DiffMatchPatch = require('diff-match-patch')

  , diffMatchPatch = new DiffMatchPatch()

  , diffStats = function (before, after) {
      var stats = { inserts: false, deletes: false }
        , diff = diffMatchPatch.diff_main(before.body, after.body)
        , index

      for(index = 0; index < diff.length; ++index) {
        if (diff[index][0] === -1) stats.deletes = true
        if (diff[index][0] === 1) stats.inserts = true
        if (stats.deletes && stats.inserts) break
      }
      return stats
    }

  , mergeInserts = function (input) {
      if (input.length < 2) return input.slice(0)

      var index
        , results = [ input.pop() ]
        , stats

      for(index = input.length - 1; index >= 0;  index--) {
        stats = diffStats(input[index], results[0])

        if (stats.deletes) {
          results.unshift(input[index])
        }
      }

      return results
    }

  , mergeDeletes = function (input) {
      if (input.length < 2) return input.slice(0)

      var index
        , results = [ input.shift() ]
        , stats

      for(index = 0; index < input.length - 1; ++index) {
        stats = diffStats(results[results.length - 1], input[index])
        if (stats.inserts) {
          results.push(input[index])
        }
      }
      // always include the last revision
      results.push(input[input.length - 1])

      return results
    }

  , merge = function (input) {
      return mergeDeletes(mergeInserts(input))
    }

module.exports = merge