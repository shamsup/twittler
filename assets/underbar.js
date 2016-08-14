(function() {
  'use strict';

  window._ = {};

  _.identity = function(val) {
    return val;
  };

  _.first = function(array, n) {
    return n === undefined ? array[0] : array.slice(0, n);
  };

  _.last = function(array, n) {
    if(n === undefined ){
      return array[array.length-1];
    } else if (n === 0) {
      return [];
    } else {
      return array.slice(-n);
    }
  };

  _.each = function(collection, iterator) {
    if (Array.isArray(collection)){
      for (var i=0;i<collection.length;i++){
        iterator(collection[i], i, collection);
      }
    } else {
      for (var i in collection){
        iterator(collection[i], i, collection);
      }
    }
  };

// just like each, except backwards! (only for arrays, objects run the same)
  _.reverseEach = function(collection, iterator) {
    if (Array.isArray(collection)){
      for (var i = collection.length - 1; i >= 0; i--){
        iterator(collection[i], i, collection);
      }
    } else {
      _.each(collection, iterator);
    }
  }

  _.indexOf = function(array, target){
    var result = -1;

    _.each(array, function(item, index) {
      if (item === target && result === -1) {
        result = index;
      }
    });

    return result;
  };

  _.filter = function(collection, test) {
    var result = [];
    _.each(collection,function(element, index){
      if (test(element, index, collection)===true){
        result.push(element);
      }
    });

    return result;
  };

// WARNING: removes the "true" results from the original collection
  _.filterIntoNew = function(collection, test) {
    var result,
      indicesToRemove = [];
    if (Array.isArray(collection)){
      result = [];
      _.each(collection, function(element, index) {
        if (test(element, index, collection) === true) {
          result.push(element);
          indicesToRemove.push(index);
        }
      });

      _.reverseEach(indicesToRemove, function(index){
        collection.splice(index,1);
      });
    } else {
      result = {};
      _.each(collection, function(element, key) {
        if (test(element, key, collection) === true) {
          result[key] = element;
          indicesToRemove.push(key);
        }
      });

      _.each(indicesToRemove, function(key) {
        delete collection[key];
      });
    }

    return result;
  };

  _.reject = function(collection, test) {
    return _.filter(collection, function(element){
      return !test(element);
    })
  };

  _.uniq = function(array) {
    var unique = [];
    _.each(array, function(element){
      if (_.indexOf(unique, element) === -1){
        unique.push(element);
      }
    });

    return unique;
  };

  _.map = function(collection, iterator) {
    var results = [];
    _.each(collection, function(item, index){
      results.push(iterator(item, index, collection));
    });

    return results;
  };

  _.pluck = function(collection, key) {
    return _.map(collection, function(item){
      return item[key];
    });
  };

  _.reduce = function(collection, iterator, accumulator) {
    var result = accumulator;
    if (accumulator === undefined){
      result = collection.shift();
    }
    _.each(collection, function(element){
      result = iterator(result, element);
    });

    return result;
  };

  _.contains = function(collection, target) {
    return _.reduce(collection, function(wasFound, item) {
      if (wasFound) {
        return true;
      }

      return item === target;
    }, false);
  };

  _.every = function(collection, iterator) {
    iterator = iterator || _.identity;
    return _.reduce(collection, function(previous, item){
      return (!previous) ? false : !!iterator(item);
    }, true);
  };

  _.some = function(collection, iterator) {
    iterator = iterator || _.identity;
    return _.reduce(collection, function(previous, item){
      return (previous===true || !!iterator(item));
    }, false);
  };

  _.extend = function(obj) {
    obj = obj || {};
    obj = _.reduce(arguments, function(extended, arg){
      _.each(arg, function(value, key){
        extended[key] = value;
      });

      return extended;
    }, obj);

    return obj;
  };

  _.defaults = function(obj) {
    obj = obj || {};
    obj = _.reduce(arguments, function(base, arg){
      _.each(arg, function(value, key){
        if (base[key] === undefined){
          base[key] = value;
        }
      });

      return base;
    }, obj);

    return obj;
  };

  _.once = function(func) {
    var alreadyCalled = false;
    var result;

    return function() {
      if (!alreadyCalled) {
        result = func.apply(this, arguments);
        alreadyCalled = true;
      }

      return result;
    };
  };

  _.memoize = function(func) {
    var previousCalls = {};
    var result;

    return function() {
      if(previousCalls[arguments[0]] === undefined){
        result = func.apply(this, arguments);
        previousCalls[arguments[0]] = result;
      }

      return result;
    }
  };

  _.delay = function(func, wait) {
    var args = Array.prototype.slice.call(arguments,2);
    setTimeout(function(){
      func.apply(this,args);
    }, wait);
  };

  _.shuffle = function(array) {
    var shuffled = array.slice();
    _.each(array, function(item, index){
      var random = Math.floor(Math.random() * index + 1);
      var temp = shuffled[index];
      shuffled[index] = shuffled[random];
      shuffled[random] = temp;
    });

    return shuffled;
  };


}());
