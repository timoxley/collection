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
  it('can add items', function() {
    var collection = new Collection()
    var user = {
      name: 'Tim'
    }
    collection.add(user)
    assert(collection.has(user))
  })
  it('can remove items', function() {
    var collection = new Collection()
    var user = {
      name: 'Tim'
    }
    collection.add(user)
    assert(true === collection.has(user))
    collection.remove(user)
    assert(false === collection.has(user))
  })
  it('can clear all items', function() {
    var collection = new Collection()
    var tim = {
      name: 'Tim'
    }
    var bob = {
      name: 'Bob'
    }
    collection.add(tim)
    collection.add(bob)
    assert(true === collection.has(tim))
    assert(true === collection.has(bob))
    collection.clear()
    assert(false === collection.has(tim))
    assert(false === collection.has(bob))
  })

  it('emits added event when adding items', function(done) {
    var collection = new Collection()
    var user = {
      name: 'Tim'
    }
    collection.on('added', function(addedUser) {
      assert.strictEqual(user, addedUser)
      done()
    })
    collection.add(user)
  })
  it('emits removed event when removing items', function(done) {
    var collection = new Collection()
    var user = {
      name: 'Tim'
    }
    collection.add(user)
    collection.on('removed', function(removedUsers) {
      assert.equal(removedUsers.length, 1)
      assert.strictEqual(user, removedUsers[0])
      done()
    })
    collection.remove(user)
  })
  it('emits removed event for each removed item during clear', function(done) {
    var collection = new Collection()
    var tim = {
      name: 'Tim'
    }
    var bob = {
      name: 'Bob'
    }
    collection.add(tim)
    collection.add(bob)
    var removed = []
    collection.on('removed', function(removedUsers) {
      assert.equal(removedUsers.length, 2)
      assert.deepEqual([tim, bob], removedUsers)
      done()
    })
    collection.clear()
  })
})

