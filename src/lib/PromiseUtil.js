export var EOF = Symbol('EOF');

/**
 * this function converts value to Promise.
 * @private
 * @param {Promise | ReadableStream | [WritableStream, Object]} target Promise, Promise like or ReadableStream.
 * @returns {?Promise} Promise.
 */
export function toPromise(target) {
  if (isPromise(target)) {
    return target;
  }

  if (isReadableStream(target)) {
    return toPromiseFromReadableStream(target);
  }

  if (isWritableStream(target)) {
    return toPromiseFromWritableStream(target);
  }

  return null;
}

export function isPromise(target) {
  if (target instanceof Promise) {
    return true;
  }

  if (target instanceof SpyPromise) {
    return true;
  }

  return false;
}

function isReadableStream(target) {
  if (typeof target.read !== 'function') {
    return false;
  }

  return true;
}

function isWritableStream(target) {
  if (!Array.isArray(target)) {
    return false
  }

  if (target.length !== 2) {
    return false;
  }

  target = target[0];

  if (typeof target.write !== 'function') {
    return false;
  }

  return true;
}

function toPromiseFromWritableStream([ws, chunk]) {
  var promise = new Promise((resolve, reject)=>{
    if (chunk === eo.EOF) {
      ws.close();
      resolve();
      return;
    }

    ws.ready.then(()=>{
      if (promise.__eo_cancel__) return;
      if (ws.state === 'writable') {
        ws.write(chunk).then(()=>{
          resolve();
        })
      }
    });

    ws.closed.then(()=>{
      if (promise.__eo_cancel__) return;
      resolve();
    }).catch((e)=>{
      if (promise.__eo_cancel__) return;
      reject(e);
    })
  });

  promise.__eo_cancel__ = 0;
  return promise;
}

var rsMap = new Map();
function toPromiseFromReadableStream(rs) {
  if (!rsMap.has(rs)) {
    var spyPromise = new SpyPromise();

    rs.ready.then(()=>{
      if (rs.state === 'readable') {
        var d = rs.read();
        rsMap.delete(rs);
        spyPromise.resolve(d);
      }
    });

    rs.closed.then(()=>{
      rsMap.delete(rs);
      spyPromise.resolve(eo.EOF);
    }).catch((e)=>{
      rsMap.delete(rs);
      spyPromise.reject(e);
    });

    rsMap.set(rs, {promise: spyPromise});
  }

  return rsMap.get(rs).promise;
}

class SpyPromise {
  then(onResolved, onRejected) {
    this._onResolved = onResolved;
    this._onRejected = onRejected;
    return this;
  }

  catch(onRejected) {
    this._onRejected = onRejected;
    return this;
  }

  resolve(val) {
    Promise.resolve().then(()=>{
      this._onResolved && this._onResolved(val);
    });
  }

  reject(val) {
    Promise.resolve().then(()=>{
      this._onRejected && this._onRejected(val);
    });
  }
}
