import {EOF, toPromise, isPromise} from './PromiseUtil.js';

/**
 * Executes an asynchronous function as synchronous function(aka async/await).
 *
 * An asynchronous function have to be wrapped in Generator Function.
 * And an asynchronous function must be Promise or Promise like.
 * Such as Promise like is ``Promise[]`` or ``Object.<string, Promise>``.
 * This function is implemented by referring to [tj/co](https://github.com/tj/co).
 * @param {function} generatorFunction Generator Function wraps asynchronous function.
 * @return {Promise} returned Promise is fulfilled if this function was successful.
 *
 * @example
 * eo(function *(){
 *   try {
 *     var result = yield request('http://example.com');
 *   } catch(e) {
 *     console.log(e);
 *     throw e;
 *   }
 *   return result.responseText;
 * }).then((val)=>{
 *   console.log(val);
 * }).catch((e)=>{
 *   console.log(e.message);
 * });
 *
 * @example
 * eo(function *(){
 *   var result = yield [request('http://example.com'), request('http://example.org')];
 *   console.log(result[0].responseText);
 *   console.log(result[1].responseText);
 * });
 *
 * @example
 * eo(function *(){
 *   var result = yield {com: request('http://example.com'), org: request('http://example.org')};
 *   console.log(result.com.responseText);
 *   console.log(result.org.responseText);
 * });
 */
export default function eo(generatorFunction) {
  var gen = generatorFunction();

  return new Promise(function(resolve, reject){
    onFulfilled();

    function onFulfilled(val) {
      try {
        var result = gen.next(val);
      } catch (e) {
        return reject(e);
      }
      return chain(result);
    }

    function onRejected(e) {
      try {
        var result = gen.throw(e);
      } catch (e) {
        return reject(e);
      }
      return chain(result);
    }

    function chain(result) {
      if (result.done) {
        return resolve(result.value);
      }

      var promise = toPromise(result.value);
      if (isPromise(promise)) {
        return promise.then(onFulfilled).catch(onRejected);
      } else {
        reject(new Error('value can not be converted to promise. value = ' + result.value));
      }
    }
  });
}

eo.all = function(targets) {
  if (Array.isArray(targets)) {
    return eo._allByArray(targets);
  }

  if (targets.constructor === Object) {
    return eo._allByObject(targets);
  }

  return null;
};

eo.race = function(targets) {
  if (Array.isArray(targets)) {
    return eo._raceByArray(targets);
  }

  if (targets.constructor === Object) {
    return eo._raceByObject(targets);
  }

  return null;
};

eo.EOF = EOF;

eo.loop = function(generatorFunction) {
  var _resolve;
  var _reject;
  var promise = new Promise((resolve, reject)=>{
    _resolve = resolve;
    _reject = reject;
  });

  eo(function*(){
    while(1) {
      try {
        var result = yield eo(generatorFunction);
        if (result === eo.EOF) {
          return _resolve();
        }
      } catch(e) {
        return _reject(e);
      }
    }
  });

  return promise;
};

eo._allByArray = function(targets) {
  var resolvedCount = 0;
  var results = [];
  var _resolve;
  var _reject;
  var allPromise = new Promise((resolve, reject)=>{
    _resolve = resolve;
    _reject = reject;
  });

  results.length = targets.length;

  if (targets.length === 0) {
    _resolve([]);
    return;
  }

  for (var i = 0; i < targets.length; i++) {
    var promise = toPromise(targets[i]);
    if (!promise) return null;

    promise.then(function(i, value){
      results[i] = value;
      resolvedCount++;
      if (resolvedCount === targets.length) {
        _resolve(results);
      }
    }.bind(null, i)).catch(e=>{
      _reject(e);
    });
  }

  return allPromise;
};

eo._allByObject = function(targets) {
  var resolvedCount = 0;
  var keys = Object.keys(targets);
  var results = [];
  var _resolve;
  var _reject;
  var allPromise = new Promise((resolve, reject)=>{
    _resolve = resolve;
    _reject = reject;
  });

  if (keys.length === 0) {
    _resolve({});
    return;
  }

  for (var key of keys) {
    var promise = toPromise(targets[key]);
    if (!promise) return null;

    promise.then(function(key, value){
      results[key] = value;
      resolvedCount++;
      if (resolvedCount === keys.length) {
        _resolve(results);
      }
    }.bind(null, key)).catch(e=>{
      _reject(e);
    });
  }

  return allPromise;
};

eo._raceByArray = function(targets) {
  var resolved = false;
  var results = [];
  var _resolve;
  var _reject;
  var racedPromise = new Promise((resolve, reject)=>{
    _resolve = resolve;
    _reject = reject;
  });

  results.length = targets.length;

  if (targets.length === 0) {
    _resolve([]);
    return;
  }

  for (var i = 0; i < targets.length; i++) {
    var promise = toPromise(targets[i]);
    if (!promise) return null;

    promise.then(function(i, v){
      if (!resolved) {
        resolved = true;
        results[i] = v;
        _resolve(results);
      }
    }.bind(null, i)).catch(e=>{
      _reject(e);
    });
  }

  return racedPromise;
};

eo._raceByObject = function(targets) {
  var resolved = false;
  var results = {};
  var _resolve;
  var _reject;
  var racedPromise = new Promise((resolve, reject)=>{
    _resolve = resolve;
    _reject = reject;
  });

  if (Object.keys(targets).length === 0) {
    _resolve({});
    return;
  }

  for (var key of Object.keys(targets)) {
    var promise = toPromise(targets[key]);
    if (!promise) return null;

    promise.then(function(key, value){
      if (!resolved) {
        resolved = true;
        results[key] = value;
        _resolve(results);
      }
    }.bind(null, key)).catch(e=>{
      _reject(e);
    });
  }

  return racedPromise;
};
