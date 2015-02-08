//simple
eo(function*(){
  console.log('sleep...');
  var result = yield sleep(200);
  console.log(result);
  console.log('wake!');

  return 'finish!';
}).then((val)=>{
  console.log(val); // finish!
});

// global error handling
eo(function*(){
  return;
  var result = yield sleep(-1);
}).catch((e)=>{
  console.log(e);
});

// individual error handling
eo(function*(){
  return;
  try {
    var result = yield sleep(-1);
  } catch(e) {
    console.log(e);
  }
});

// wait all
eo(function*(){
  return;
  console.log('sleep...');
  var result = yield eo.all([sleep(200), sleep(100), sleep(300)]);
  console.log(result);
  console.log('wake!');

  console.log('sleep...');
  var result = yield eo.all({Alice: sleep(200), Bob: sleep(100), Charlie: sleep(300)});
  console.log(result);
  console.log('wake!');
});

// wait fast
eo(function*(){
  return;
  console.log('sleep...');
  var result = yield eo.race([sleep(200), sleep(100), sleep(300)]);
  console.log(result);
  console.log('wake!');

  console.log('sleep...');
  var result = yield eo.race({Alice: sleep(200), Bob: sleep(100), Charlie: sleep(300)});
  console.log(result);
  console.log('wake!');
});
