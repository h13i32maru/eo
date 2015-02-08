function sleep(msec) {
  return new Promise((resolve, reject)=>{
    if (msec <= 0) {
      return reject(new Error('msec must be greater than 0.'));
    }

    setTimeout(()=>{
      resolve(msec);
    }, msec);
  });
}

window.sleep = sleep;
