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
    it('can remove items', function() {
      collection.add(tim)
      assert(collection.has(tim))
      collection.remove(tim)
      assert(false === collection.has(tim))
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
    })
  })
})

