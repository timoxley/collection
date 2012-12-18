var Collection, assert

if (typeof window === 'undefined') {
  Collection = require('../')
  assert = require('assert')
} else {
  Collection = require('collection')
  assert = require('timoxley-assert')
}

describe('Collection', function() {
  var collection
  describe('initialisation', function() {
    describe('use as constructor', function() {
      it('initialises new array when passed no args', function() {
        var collection = new Collection()
        assert(Array.isArray(collection.items))
      })

      it('wraps when passed an array', function() {
        var items = []
        var collection = new Collection(items)
        assert.strictEqual(collection.items, items)
      })
    })

    describe('use as mixin', function() {
      it('creates new when passed array', function() {
        assert(Collection([]) instanceof Collection)
      })

      it('mixes into object', function() {
        var obj = {
          name: 'Stuff'
        }
        assert.equal(Collection(obj).name, obj.name)
        assert(Collection(obj).clear)
        assert(Collection(obj).remove)
        assert(Collection(obj).key)
      })
    })
  })

  describe('add/remove behaviour', function() {
    var collection, tim, bob
    beforeEach(function() {
      collection = new Collection()
      tim = { name: 'Tim' }
      bob = { name: 'Bob' }
    })

    it('can add an item', function() {
      collection.add(tim)
      assert(collection.has(tim))
    })

    it('can remove items by item reference', function() {
      collection.add(tim)
      assert(collection.has(tim))
      collection.remove(tim)
      assert(false === collection.has(tim))
    })

    it('can remove items by key', function() {
      collection.key('name')
      collection.add(tim)
      collection.remove(tim.name)
      assert(false === collection.has(tim))
    })

    it('can add update item by item reference', function() {
      collection.add(tim)
      collection.update(tim, {age: 27})
      assert.equal(collection.get(tim).age, 27)
    })

    it('can add update item by key', function() {
      collection.key('name')
      collection.add(tim)
      collection.update(tim.name, {age: 27})
      assert.equal(collection.get(tim).age, 27)
    })

    it('can add update item by key with single param', function() {
      collection.key('name')
      collection.add(tim)
      collection.update({
        name: 'Tim',
        age: 27
      })
      assert.equal(collection.get(tim).age, 27)
    })
    it('does nothing if trying to update item that does not exist', function() {
      collection.key('name')
      collection.add(tim)
      collection.update({
        name: 'Bill',
        age: 27
      })
      assert(false === collection.has('Bill'))
    })

    it('can add update multiple items.', function() {
      collection.key('name')
      tim.age = 25
      bob.age = 25
      collection.add(tim)
      collection.add(bob)
      collection.update([{name: 'Tim', age: 27}, {name: 'Bob', age: 23}])
      assert.equal(collection.get('Tim').age, 27)
      assert.equal(collection.get('Bob').age, 23)
    })

    it('can add update multiple items with single update object', function() {
      collection.key('name')
      collection.add(tim)
      collection.add(bob)
      collection.update([{name: 'Tim'}, {name: 'Bob'}], {age: 23})
      assert.equal(collection.get('Tim').age, 23)
      assert.equal(collection.get('Bob').age, 23)
    })

    it('ignores updates to objects that are not present', function() {
      collection.key('name')
      collection.add(tim)
      // no bob.

      collection.update([{name: 'Tim'}, {name: 'Bob'}], {age: 23})
      assert.equal(collection.get('Tim').age, 23)
      assert.strictEqual(collection.get('Bob'), undefined)
    })

    it('does nothing if no updates', function() {
      collection.key('name')
      collection.add(tim)
      collection.add(bob)

      collection.update([{name: 'Tim'}, {name: 'Bob'}], {})
      assert.deepEqual(collection.get('Tim'), tim)
      assert.deepEqual(collection.get('Bob'), bob)
    })

    it('can clear all items', function() {
      collection.add(tim)
      collection.add(bob)
      collection.clear()
      assert.equal(collection.count(), 0)
      assert(false === collection.has(tim))
      assert(false === collection.has(bob))
    })

    describe('events', function() {
      it('emits added event when adding items', function(done) {
        collection.on('added', function(addedUsers) {
          assert.equal(addedUsers.length, 1)
          assert.strictEqual(tim, addedUsers[0])
          done()
        })
        collection.add(tim)
      })

      it('emits removed event when removing items', function(done) {
        collection.add(tim)
        collection.on('removed', function(removedUsers) {
          assert.equal(removedUsers.length, 1)
          assert.strictEqual(tim, removedUsers[0])
          done()
        })
        collection.remove(tim)
      })

      it('emits removed event for each removed item during clear', function(done) {
        collection.add(tim)
        collection.add(bob)
        collection.on('removed', function(removedUsers) {
          assert.equal(removedUsers.length, 2)
          assert.deepEqual([tim, bob], removedUsers)
          done()
        })
        collection.clear()
      })

      it('emits empty event when collection is cleared or empty', function(done) {
        collection.once('empty', function() {
          collection.once('empty', function() {
            done()
          })
          collection.add(tim)
          collection.clear()
        })
        collection.add(tim)
        collection.remove(tim)
      })

      it('emits update when updating items using key name', function(done) {
        collection.key('name')
        collection.once('updated', function(updates) {
          assert.deepEqual([{
            name: 'Tim',
            age: 27
          }], updates)
          done()
        })
        collection.add(tim)
        collection.update(tim, {age: 27})
      })
    })

    describe('uniqueness constraints', function() {
      it('does not allow multiple of same object by default', function() {
        collection.add(tim)
        collection.add(tim)
        assert.equal(collection.count(function(){return true}), 1)
      })

      it('enforces uniqueness based on a given key name', function() {
        collection.key('name')
        collection.add(bob)
        collection.add(tim)
        collection.add({name: 'Tim', age: 10})
        assert.equal(collection.count(function(){return true}), 2)
      })

      it('can get items by their key', function() {
        collection.key('name')
        collection.add(tim)
        collection.add(bob)
        assert.strictEqual(bob, collection.get(bob.name))
        assert.strictEqual(tim, collection.get(tim.name))
      })

      describe('getting without a key()', function() {
        it('returns the supplied object if in collection', function() {
          collection.add(tim)
          assert.strictEqual(collection.get(tim), tim)
        })
        it('returns the supplied object if in collection', function() {
          collection.get(tim)
          assert.strictEqual(collection.get(bob), undefined)
        })
      })

      it('returns undefined if cannot find item', function() {
        collection.key('name')
        collection.add(tim)
        assert.strictEqual(undefined, collection.get(bob.name))
      })

      it('uses key() to determine if it already has an item', function() {
        collection.add(tim)
        collection.add({name: 'Tim', age: 10})
        assert(false === collection.has('Tim'))

        collection.key('name')
        assert(collection.has('Tim'))
      })
    })
  })
})

