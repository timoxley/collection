'use strict'

var Enumerable = require('enumerable')
var Emitter = require('emitter')
var type = require('type')
var _ = require('to-function')
var get = require('get')

module.exports = Collection

/**
 * Initialize a new `Collection`.
 *
 * @api public
 */

function Collection(items) {
  if (!(this instanceof Collection)) {
    if (Array.isArray(items)) return new Collection(items);
    return mixin(items, Collection.prototype)
  }
  this.items = items || []
}

Enumerable(Collection.prototype)
Emitter(Collection.prototype)

Collection.prototype.__iterate__ = function(){
  var self = this
  return {
    length: function(){ return self.items.length },
    get: function(i){ return self.items[i] }
  }
}

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @param {Object} obj
 *
 * @return {Object}
 * @api private
 */

function mixin(target, source) {
  for (var key in source) {
    target[key] = source[key]
  }
  return target
}

/**
 * Add an item or an Array of items to the collection.
 * Does nothing if the item already exists.
 *
 * @param {Object|Array} items item or array of items to add
 * @return {Collection}
 * @api public
 */

Collection.prototype.add = function add(items, fn) {
  if (type(items) !== 'array') {
    items = [items]
  }
  var addedItems = []
  for (var i = 0; i < items.length; i++) {
    var item = items[i]
    if (!this.has(item)) {
      this.items.push(item)
      addedItems.push(item)
    } else {
      return this.update(item[this.key()], item)
    }
  }
  if (fn) fn(addedItems, this.items)
  this.emit('added', addedItems)
  return this
}

/**
 * Create a `component/to-function` compatible matcher
 * Object for matching against collection key.
 *
 * Can take a hash containing search term as a key value,
 * or just the key value to locate.
 *
 * @param {Object|String} key
 * @return {Object} matcher object.
 * @api private
 */

function getKeyMatcher(key) {
  var searchKey = key
  if (typeof key === 'object') searchKey = get(this.key())(key)
  var match = Object.create(null)
  if (!searchKey) return match
  match[this.key()] = searchKey
  return match
}

/**
 * Get object with supplied `key`, or if no key is set on collection,
 * return the supplied object if it exists in the collection.
 *
 * @param {String} key
 * @return {Object} object whose key matches `key` or undefined
 * @api public
 */

Collection.prototype.get = function(key) {
  if (!this.key()) {
    return this.has(key)
      ? key
      : undefined
  }
  return this.find(getKeyMatcher.call(this, key))
}

Collection.prototype.update = function(key, update) {
  // TODO refactor the shit out of this method
  var keys = Array.isArray(key)
    ? key
    : [key]

  var updatedItems = []
  var updateContent
  for (var i = 0; i < keys.length; i++) {
    var id = keys[i]
    var item = this.get(id)
    if (!item) continue
    updateContent = !!update
      ? update
      : id
    var updatedProperties = Object.create(null)
    if (this.key()) {
      updatedProperties[this.key()] = item[this.key()]
    }
    for (var prop in updateContent) {
      if (item[prop] !== updateContent[prop]) {
        item[prop] = updateContent[prop]
        updatedProperties[prop] = updateContent[prop]
      }
    }
    updatedItems.push(updatedProperties)
  }
  if (updatedItems.length) this.emit('updated', updatedItems)
  return
}

/**
 * Get value at key, or if no key set, search for objects
 * matching supplied key.
 *
 * @param {String} key
 * @return {Object} object whose key matches `key` or undefined
 * @api public
 */

Collection.prototype.has = function(key) {
  if (!this.key()) return Enumerable.prototype.has.call(this, key)
  var match = getKeyMatcher.call(this, key)
  return this.any(match)
}

Collection.prototype.clear = function clear() {
  var toRemove = this.items
  this.remove(toRemove)
  return this
}

Collection.prototype.remove = function remove(items) {
  if (type(items) !== 'array') {
    items = [items]
  }
  var removedItems = []
  var self = this
  this.items = this.reject(function(item) {
    var hasItem = !!~self.indexOf(item)
    if (hasItem) {
      removedItems.push(item)
    }
    return hasItem
  }).obj

  if (removedItems.length) this.emit('removed', removedItems)
  if (!this.items.length) this.emit('empty')
  return this
}

Collection.prototype.key = function key(setKey) {
  if (!setKey) return this._key
  this._key = setKey
  return this
}
