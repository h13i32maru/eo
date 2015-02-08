// simple
eo(function*(){
  var ws = new SampleWritableStream();
  var data = [1, 2, 3, 4, eo.EOF];
  for (var chunk of data) {
    yield [ws, chunk];
  }

  console.log('finish');
});


// global error handling
eo(function*(){
  return;
  var ws = new SampleWritableStream();
  var data = [1, 2, 3, 4, eo.EOF];
  for (var chunk of data) {
      yield [ws, chunk];
  }

  console.log('finish');
}).catch(e=>{
  console.log('error', e);
});

// individual error handling
eo(function*(){
  return;
  var ws = new SampleWritableStream();
  var data = [1, 2, 3, 4, eo.EOF];
  for (var chunk of data) {
    try {
      yield [ws, chunk];
    } catch(e) {
      console.log('error', e);
      return;
    }
  }

  console.log('finish');
});
