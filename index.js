var Enumerable = require('enumerable')
var Emitter = require('emitter')
var type = require('type')

module.exports = Collection

/**
 * Initialize a new `Collection`.
 *
 * @api public
 */

function Collection(items) {
  if (!(this instanceof Collection)) {
    if (Array.isArray(items)) return new Collection(items);
    return mixin(items)
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
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

Collection.prototype.add = function add(item) {
  this.items.push(item)
  this.emit('added', item)
  return this
}

Collection.prototype.clear = function clear() {
  var toRemove = this.items
  this.remove(toRemove)
  this.emit('cleared', toRemove)
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
  })
  if (removedItems.length) this.emit('removed', removedItems)
  return this
}
